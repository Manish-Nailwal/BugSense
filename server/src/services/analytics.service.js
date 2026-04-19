import DebugSession from '../models/DebugSession.model.js';
import AnalyticsProfile from '../models/AnalyticsProfile.model.js';
import NeuralReport from '../models/NeuralReport.model.js';
import mongoose from 'mongoose';
import { genAI, MODEL_MAPPING } from '../config/gemini.js';

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

  return {
    ...profile.summaryData,
    isMockData: profile.isMockData,
    lastManualUpdate: profile.lastManualUpdate,
    canManualRefresh: true, // Always allow manual refresh for DB stats
    neuralReport: profile.neuralReport
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

  return {
    ...profile.summaryData,
    lastManualUpdate: profile.lastManualUpdate,
    canManualRefresh: true
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
    resource: resourceMap[alert._id] || { url: 'https://docs.bugsense.ai', title: 'Language Survival Guide' }
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

export const generateNeuralReport = async (userId, selectedModel = 'Gemini 2.5 Flash', force = false) => {
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
    return profile.neuralReport.content;
  }

  const stats = await calculateActualStats(userId);
  
  const totalFixed = stats.confirmedFixes || 0;
  const fixRate = stats.totalSessions > 0 ? Math.round((totalFixed / stats.totalSessions) * 100) : 0;
  const categoryList = (stats.categoryStats || [])
    .slice(0, 5)
    .map(cat => `  - ${cat._id || 'Exploration'}: ${cat.count} sessions`)
    .join('\n');

  const prompt = `
You are BugSense Neural Analytics Engine — a senior engineering insights system.
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
- Do NOT use filler phrases like "As the BugSense engine..." — jump straight into the content
- Output ONLY the markdown report, no preamble or meta-commentary
`;

  try {
    const modelId = MODEL_MAPPING[selectedModel] || MODEL_MAPPING['Gemini 2.5 Flash'];
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // 1. Save to history
    const savedReport = await NeuralReport.create({
      userId,
      content,
      model: selectedModel,
      statsSnapshot: {
        totalSessions: stats.totalSessions,
        confirmedFixes: stats.confirmedFixes,
        topCategory: stats.topCategory
      }
    });

    console.log(`[DEBUG] Archived New Neural Report for User: ${userId}`);

    // 2. Update profile for latest quick-view
    profile.neuralReport = {
      content,
      model: selectedModel,
      generatedAt: new Date()
    };
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
        model: profile.neuralReport.model || 'Gemini 2.5 Flash',
        statsSnapshot: {},
        createdAt: profile.neuralReport.generatedAt || new Date()
      });
      reports = [backfilled];
    }
  }

  return reports;
};

