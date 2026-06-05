import DebugSession from '../models/DebugSession.model.js';
import AnalyticsProfile from '../models/AnalyticsProfile.model.js';
import NeuralReport from '../models/NeuralReport.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';
import { genAI, MODEL_MAPPING, getQuotaDate } from '../config/gemini.js';
import { reserveInputTokens, estimateTokens } from '../utils/rateLimiter.js';
import { resolveTechDocs } from '../utils/techDocs.js';

// Summary-report allowances (reset at Pacific midnight / 12:30 PM IST).
// Loosened for testing — set ANY of these in server/.env:
//   NODE_ENV=development  | MOCK_AI=true  | REPORT_DEV_LIMITS=true
// REPORT_DEV_LIMITS lets you raise report limits WITHOUT switching chat to mock AI.
const REPORT_DEV =
  process.env.NODE_ENV === 'development' ||
  process.env.MOCK_AI === 'true' ||
  process.env.REPORT_DEV_LIMITS === 'true';
export const REPORT_DAILY_LIMIT = REPORT_DEV ? 50 : 1;
export const REPORT_WEEKLY_LIMIT = REPORT_DEV ? 200 : 2;

// How many recent skills/paths we surface in the UI. The DB keeps the FULL
// history forever (we use it to refine UX later) — we only cap what's shown.
export const LEARNING_DISPLAY_LIMIT = 30;

// Shown to developers who haven't generated a report yet, so the sections are
// never empty. Trending, broadly-useful picks resolved to their official docs.
const DEFAULT_LEARNING_PATHS = ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'System Design']
  .map(resolveTechDocs)
  .filter(Boolean);

const DEFAULT_TRENDING_SKILLS = [
  { area: 'TypeScript', resource: 'TypeScript', reason: 'The most in-demand way to catch bugs before they ship.' },
  { area: 'System Design', resource: 'System Design', reason: 'Core skill for scaling apps and senior-level interviews.' },
  { area: 'Testing', resource: 'Testing', reason: 'Confident refactors start with a dependable test suite.' },
  { area: 'Web Security', resource: 'OWASP', reason: 'Know the OWASP Top 10 before an attacker finds it.' },
]
  .map((s) => {
    const doc = resolveTechDocs(s.resource);
    return doc ? { area: s.area, reason: s.reason, name: doc.name, url: doc.url, level: doc.level } : null;
  })
  .filter(Boolean);

// Merge freshly-recommended items in FRONT of the saved history, de-duplicated by
// key (case-insensitive). Result is most-recent-first; nothing is ever dropped, so
// the persisted array is the developer's full unique skill/path history.
const mergeRecent = (existing = [], incoming = [], keyOf) => {
  const seen = new Set();
  const out = [];
  for (const item of [...incoming, ...existing]) {
    if (!item) continue;
    const k = String(keyOf(item) || '').trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
};

// PT date string N days ago (for the rolling weekly window).
export const ptDateDaysAgo = (n) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(Date.now() - n * 86400000));

// New sessions since the last report + whether one already exists.
export const getReportReadiness = async (userId) => {
  const profile = await AnalyticsProfile.findOne({ userId });
  const lastReportAt = profile?.neuralReport?.generatedAt || null;
  const hasReport = !!profile?.neuralReport?.content;
  const newActivity = await DebugSession.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    createdAt: { $gt: lastReportAt || new Date(0) },
  });
  return { newActivity, lastReportAt, hasReport };
};

// Whether now is a good moment to generate, plus the daily/weekly quota state.
const buildReportStatus = async (userId, profile) => {
  const today = getQuotaDate();
  const weekAgo = ptDateDaysAgo(6);
  const user = await User.findById(userId).select('reportUsage');
  const dates = user?.reportUsage?.dates || [];
  const dailyUsed = dates.filter((d) => d === today).length;
  const usedToday = dailyUsed >= REPORT_DAILY_LIMIT;
  const weeklyUsed = dates.filter((d) => d >= weekAgo).length;

  const lastReportAt = profile?.neuralReport?.generatedAt || null;
  const newActivity = await DebugSession.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    createdAt: { $gt: lastReportAt || new Date(0) },
  });

  const canGenerate = !usedToday && weeklyUsed < REPORT_WEEKLY_LIMIT;

  let recommendation;
  if (!canGenerate) {
    recommendation = {
      level: 'limit',
      message: usedToday
        ? "You've already generated a report today. Resets at 12:30 PM IST."
        : `You've used both reports this week (max ${REPORT_WEEKLY_LIMIT}). Come back in a few days.`,
    };
  } else if (lastReportAt && newActivity === 0) {
    recommendation = { level: 'wait', message: 'No new debugging sessions since your last report — generating now would look the same.' };
  } else if (!lastReportAt || newActivity >= 3) {
    recommendation = {
      level: 'good',
      message: lastReportAt
        ? `${newActivity} new sessions since your last report — a great time to refresh your insights.`
        : 'Generate your first insight report from your activity so far.',
    };
  } else {
    recommendation = { level: 'ok', message: `${newActivity} new session${newActivity === 1 ? '' : 's'} since your last report — you can generate now, or wait for a bit more activity.` };
  }

  return {
    canGenerate,
    dailyUsed,
    dailyLimit: REPORT_DAILY_LIMIT,
    weeklyUsed,
    weeklyLimit: REPORT_WEEKLY_LIMIT,
    newActivity,
    lastReportAt,
    recommendation,
  };
};

export const getSummary = async (userId) => {
  let profile = await AnalyticsProfile.findOne({ userId });

  if (!profile) {
    const actualData = await calculateActualStats(userId);
    profile = await AnalyticsProfile.create({
      userId,
      summaryData: actualData,
      isMockData: false,
      lastAutoUpdate: new Date(),
      lastManualUpdate: new Date(0)
    });
  } else {
    // Auto-refresh if 1 day old OR if data looks inconsistent (totalQueries is 0 but sessions exist)
    const now = new Date();
    const isDataInconsistent = profile.summaryData?.totalSessions > 0 && profile.summaryData?.totalQueries === 0;

    if (now - profile.lastAutoUpdate > 24 * 60 * 60 * 1000 || isDataInconsistent) {
      const updatedData = await calculateActualStats(userId);
      profile.summaryData = updatedData;
      profile.lastAutoUpdate = now;
      profile.isMockData = false;
      await profile.save();
    }
  }

  const reportStatus = await buildReportStatus(userId, profile);

  // Recommended Skills: AI report gaps (accumulated) → DB-detected recurring
  // categories → trending defaults, so the section is never empty.
  let skillGaps = profile.skillGaps || [];
  let skillGapsDefault = false;
  if (!skillGaps.length) {
    const dbAlerts = (profile.summaryData?.skillGapAlerts || []).map((a) => {
      const doc = resolveTechDocs(a.category || '');
      return {
        area: a.category || 'Recurring errors',
        reason: `Recurred in ${a.count} recent session${a.count === 1 ? '' : 's'}.`,
        name: doc.name,
        url: doc.url,
        level: doc.level,
        count: a.count,
      };
    });
    if (dbAlerts.length) {
      skillGaps = dbAlerts;
    } else {
      skillGaps = DEFAULT_TRENDING_SKILLS;
      skillGapsDefault = true;
    }
  }

  // Learning paths: accumulated AI picks → trending defaults.
  let learningPaths = profile.learningPaths || [];
  let learningPathsDefault = false;
  if (!learningPaths.length) {
    learningPaths = DEFAULT_LEARNING_PATHS;
    learningPathsDefault = true;
  }

  return {
    ...profile.summaryData,
    isMockData: profile.isMockData,
    lastManualUpdate: profile.lastManualUpdate,
    canManualRefresh: true, // Always allow manual refresh for DB stats
    neuralReport: profile.neuralReport,
    // Cap what's shown; the DB retains the full history (see getLearningArchive).
    learningPaths: learningPaths.slice(0, LEARNING_DISPLAY_LIMIT),
    skillGaps: skillGaps.slice(0, LEARNING_DISPLAY_LIMIT),
    learningPathsDefault,
    skillGapsDefault,
    reportStatus,
  };
};

export const manualRefresh = async (userId) => {
  let profile = await AnalyticsProfile.findOne({ userId });
  
  const now = new Date();
  const updatedData = await calculateActualStats(userId);

  if (!profile) {
    profile = await AnalyticsProfile.create({
      userId,
      summaryData: updatedData,
      isMockData: false,
      lastAutoUpdate: now,
      lastManualUpdate: now
    });
  } else {
    profile.summaryData = updatedData;
    profile.lastManualUpdate = now;
    profile.lastAutoUpdate = now;
    profile.isMockData = false;
    await profile.save();
  }

  // Recompute returns ONLY the computed stats (powers the stat cards + chart).
  // The AI-driven sections (skills, learning paths, report) are left to the
  // client, which preserves them so a recompute never clears them.
  return {
    ...profile.summaryData,
    lastManualUpdate: profile.lastManualUpdate,
    canManualRefresh: true,
  };
};

const calculateActualStats = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const categoryStats = await DebugSession.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: thirtyDaysAgo }
      } 
    },
    { 
      $group: { 
        _id: '$category', 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { count: -1 } }
  ]);

  const weeklyTrend = await DebugSession.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: sevenDaysAgo }
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const skillGapAlertsRaw = await DebugSession.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: sevenDaysAgo }
      } 
    },
    { 
      $group: { 
        _id: '$category', 
        count: { $sum: 1 } 
      } 
    },
    { $match: { count: { $gte: 2 } } }, // Lower threshold for "Gap" to show up
    { $sort: { count: -1 } }
  ]);

  const confirmedFixes = await DebugSession.countDocuments({
    userId,
    'confirmedFix.isConfirmed': true
  });

  const aggregateStats = await DebugSession.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $project: {
        userMessagesCount: { 
          $size: { 
            $filter: { 
              input: { $ifNull: ["$messages", []] }, 
              as: "m", 
              cond: { $eq: ["$$m.role", "user"] } 
            } 
          } 
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        // Every session counts as 1 query (the initial input) + follow-ups
        totalQueries: { $sum: { $add: [1, "$userMessagesCount"] } }
      }
    }
  ]);

  const { totalSessions = 0, totalQueries = 0 } = aggregateStats[0] || {};
  
  const resourceMap = getSkillGapResourceMap();
  const skillGapAlerts = skillGapAlertsRaw.map(alert => ({
    category: alert._id || 'General',
    count: alert.count,
    resource: resourceMap[alert._id] || { url: 'https://docs.trace.ai', title: 'Language Survival Guide' }
  }));

  const efficiencyRaw = totalSessions > 0 ? (confirmedFixes / totalSessions) * 100 : 0;

  return {
    categoryStats,
    weeklyTrend,
    skillGapAlerts,
    totalSessions,
    totalQueries,
    queryLimit: 1000, 
    confirmedFixes,
    topCategory: categoryStats[0]?._id || 'Exploration',
    efficiency: `${Math.round(efficiencyRaw)}%`
  };
};

const generateMockData = () => {
  return {
    categoryStats: [
      { _id: 'React', count: 12 },
      { _id: 'Node.js', count: 8 },
      { _id: 'CSS/UI', count: 5 }
    ],
    weeklyTrend: [],
    skillGapAlerts: [
      {
        category: 'Async Workflow',
        count: 4,
        resource: { url: 'https://javascript.info/async', title: 'Mastering Promises' }
      }
    ],
    totalSessions: 25,
    totalQueries: 124,
    queryLimit: 500,
    confirmedFixes: 18,
    topCategory: 'React',
    efficiency: '72%'
  };
};

const getSkillGapResourceMap = () => {
  return {
    'Async/Await': { url: 'https://javascript.info/async-await', title: 'Mastering Async/Await' },
    'React Hooks': { url: 'https://react.dev/reference/react', title: 'React Hooks Reference' },
    'PostgreSQL': { url: 'https://www.postgresql.org/docs/', title: 'Postgres Official Docs' },
    'TypeError': { url: 'https://mdn.io/TypeError', title: 'Handling TypeErrors' },
    'Express': { url: 'https://expressjs.com/', title: 'Express.js Documentation' }
  };
};

export const generateNeuralReport = async (userId, selectedModel = 'Gemini 3 Flash', force = false) => {
  const profile = await AnalyticsProfile.findOne({ userId });
  if (!profile) throw new Error('Analytics profile not initialized');

  const lastReportDate = profile.neuralReport?.generatedAt || new Date(0);
  
  // Check if any new sessions were created since the last report
  const newActivityCount = await DebugSession.countDocuments({
    userId,
    createdAt: { $gt: lastReportDate }
  });

  if (!force && newActivityCount === 0 && profile.neuralReport?.content) {
    // No new activity, return the existing report as requested
    return profile.neuralReport;
  }

  const stats = await calculateActualStats(userId);
  
  const totalFixed = stats.confirmedFixes || 0;
  const fixRate = stats.totalSessions > 0 ? Math.round((totalFixed / stats.totalSessions) * 100) : 0;
  const categoryList = (stats.categoryStats || [])
    .slice(0, 5)
    .map(cat => `  - ${cat._id || 'Exploration'}: ${cat.count} sessions`)
    .join('\n');

  const prompt = `
You are Trace Neural Analytics Engine — a senior engineering insights system.
Generate a clean, structured **Neural Diagnostic Report** for a developer based on their real debugging data.

---

## DEVELOPER STATS (Live Data)
- **Total Debug Sessions:** ${stats.totalSessions}
- **Total Queries Asked:** ${stats.totalQueries}
- **Confirmed Fixes:** ${totalFixed} (${fixRate}% fix rate)
- **Top Error Category:** ${stats.topCategory || 'Not enough data'}
- **Session Distribution by Category:**
${categoryList || '  - No category data yet'}

---

## YOUR TASK
Generate a structured report in **clean Markdown** with exactly these 4 sections:

### 🔍 Diagnostic Overview
Write 2–3 sentences summarizing the developer's overall debugging health based on the numbers above. 
Mention the **fix rate percentage (${fixRate}%)**, total sessions, and top error area directly. Be specific, not generic.

### ⚠️ Key Problem Patterns
List exactly **3 bullet points** identifying the main recurring issue areas.
Each bullet must:
- Name the specific error category or pattern (use the real category names from the data)
- State how many sessions it appeared in
- Explain WHY it's likely causing friction (e.g. "TypeScript type errors in 3 sessions suggest interface definition gaps")

### 📈 Growth Signals
Write 2–3 sentences acknowledging what the developer is doing well.
Reference the actual confirmed fixes and any category where they have few or 0 recurrences. Be encouraging but grounded in data.

### 🚀 Next Sprint Actions
Give exactly **2 concrete, actionable recommendations**.
Each must:
- Be a specific, practical next step (not generic advice)
- Relate directly to the error categories seen in the data
- Include a measurable success condition (e.g., "Add strict TypeScript compiler flags — success when type error sessions drop below 1/week")

---

## FORMATTING RULES
- Use **bold** for all key metrics and numbers
- Keep each section concise — no more than 4 sentences or 3 bullets per section
- Use an encouraging, professional, senior-engineer tone
- Do NOT use filler phrases like "As the Trace engine..." — jump straight into the content
- Output ONLY the markdown report, no preamble or meta-commentary

---

## REQUIRED TRAILERS
After the report, append TWO machine-readable blocks in EXACTLY these formats.
For every name/resource, use a CONCRETE technology, language, or well-known reference that has real documentation (e.g. "TypeScript", "React", "Node.js", "PostgreSQL", "Refactoring.Guru", "OWASP", "MDN"). Do NOT invent vague phrases.

1) A JSON array of 3–5 official tech-stack names to study next, prioritised by recurring error areas (canonical names like "TypeScript", "React", "Node.js", "PostgreSQL"):
__STACKS__
["TypeScript", "React", "Node.js"]
__STACKS__

2) A JSON array of 2–4 specific skill GAPS evident from the recurring errors. Each item: { "area": short gap name, "reason": one concise sentence tied to the data, "resource": the canonical tech/topic whose official docs fix it }:
__SKILLGAPS__
[{"area":"TypeScript generics","reason":"Type errors recurred across multiple sessions","resource":"TypeScript"}]
__SKILLGAPS__
`;

  try {
    // Respect the input tokens-per-minute budget.
    const reservation = reserveInputTokens(estimateTokens(prompt));
    if (!reservation.ok) {
      const secs = Math.max(1, Math.ceil(reservation.retryAfterMs / 1000));
      throw new Error(`Trace is at its per-minute capacity. Please try again in ~${secs}s.`);
    }

    const modelId = MODEL_MAPPING[selectedModel] || MODEL_MAPPING['Gemini 3 Flash'];
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // Extract the recommended stacks trailer and map them to official docs.
    let learningPaths = [];
    const stacksMatch = raw.match(/__STACKS__\s*([\s\S]*?)\s*__STACKS__/);
    if (stacksMatch) {
      try {
        const arr = JSON.parse(stacksMatch[1]);
        if (Array.isArray(arr)) {
          learningPaths = arr.map(resolveTechDocs).filter(Boolean).slice(0, 6);
        }
      } catch { /* ignore malformed trailer */ }
    }

    // Extract the skill-gaps trailer; resolve each resource to its official docs.
    let skillGaps = [];
    const gapsMatch = raw.match(/__SKILLGAPS__\s*([\s\S]*?)\s*__SKILLGAPS__/);
    if (gapsMatch) {
      try {
        const arr = JSON.parse(gapsMatch[1]);
        if (Array.isArray(arr)) {
          skillGaps = arr
            .map((g) => {
              const doc = resolveTechDocs(g.resource || g.area);
              if (!doc) return null;
              return { area: g.area || doc.name, reason: g.reason || '', name: doc.name, url: doc.url, level: doc.level };
            })
            .filter(Boolean)
            .slice(0, 4);
        }
      } catch { /* ignore malformed trailer */ }
    }

    // Strip the trailers so they never show in the rendered report.
    const content = raw
      .replace(/__STACKS__[\s\S]*?__STACKS__/g, '')
      .replace(/__SKILLGAPS__[\s\S]*?__SKILLGAPS__/g, '')
      .replace(/__STACKS__[\s\S]*$/g, '')
      .replace(/__SKILLGAPS__[\s\S]*$/g, '')
      .trim();

    // 1. Save to history
    const savedReport = await NeuralReport.create({
      userId,
      content,
      model: selectedModel,
      statsSnapshot: {
        totalSessions: stats.totalSessions,
        confirmedFixes: stats.confirmedFixes,
        topCategory: stats.topCategory
      },
      learningPaths,
      skillGaps
    });

    console.log(`[DEBUG] Archived New Neural Report for User: ${userId}`);

    // 2. Update profile for latest quick-view + learning paths
    profile.neuralReport = {
      content,
      model: selectedModel,
      generatedAt: new Date()
    };
    // Accumulate, don't overwrite: prepend the new picks to the saved history,
    // de-duplicated by name/area, most-recent first. The DB keeps everything.
    if (learningPaths.length) {
      const existing = (profile.learningPaths || []).map((p) => ({ name: p.name, url: p.url, level: p.level }));
      profile.learningPaths = mergeRecent(existing, learningPaths, (p) => p.name);
    }
    if (skillGaps.length) {
      const existing = (profile.skillGaps || []).map((g) => ({ area: g.area, reason: g.reason, name: g.name, url: g.url, level: g.level }));
      profile.skillGaps = mergeRecent(existing, skillGaps, (g) => g.area || g.name);
    }
    await profile.save();

    return savedReport;
  } catch (error) {
    console.error('Neural Report Generation Error:', error);
    throw new Error('Neural Engine failed to synthesize report');
  }
};

export const getNeuralReportHistory = async (userId) => {
  const objectId = new mongoose.Types.ObjectId(userId);
  let reports = await NeuralReport.find({ userId: objectId }).sort({ createdAt: -1 });

  // Backfill: if history is empty, check the AnalyticsProfile for an existing report
  if (reports.length === 0) {
    const profile = await AnalyticsProfile.findOne({ userId: objectId });
    if (profile?.neuralReport?.content) {
      console.log(`[DEBUG] Backfilling profile report into history for User: ${userId}`);
      const backfilled = await NeuralReport.create({
        userId: objectId,
        content: profile.neuralReport.content,
        model: profile.neuralReport.model || 'Gemini 3 Flash',
        statsSnapshot: {},
        createdAt: profile.neuralReport.generatedAt || new Date()
      });
      reports = [backfilled];
    }
  }

  return reports;
};

// Read-only archive of the developer's unique recommended skills + learning paths.
// We keep the full history in the DB but surface only the most-recent slice.
export const getLearningArchive = async (userId) => {
  const profile = await AnalyticsProfile.findOne({ userId });
  const allPaths = profile?.learningPaths || [];
  const allSkills = profile?.skillGaps || [];

  return {
    learningPaths: allPaths.length ? allPaths.slice(0, LEARNING_DISPLAY_LIMIT) : DEFAULT_LEARNING_PATHS,
    skillGaps: allSkills.length ? allSkills.slice(0, LEARNING_DISPLAY_LIMIT) : DEFAULT_TRENDING_SKILLS,
    learningPathsDefault: !allPaths.length,
    skillGapsDefault: !allSkills.length,
    // Totals let the page note how many are retained vs shown.
    totalPaths: allPaths.length,
    totalSkills: allSkills.length,
    displayLimit: LEARNING_DISPLAY_LIMIT,
  };
};

