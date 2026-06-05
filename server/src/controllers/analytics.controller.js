import * as analyticsService from '../services/analytics.service.js';
import DebugSession from '../models/DebugSession.model.js';
import ApiQuota from '../models/ApiQuota.model.js';
import User from '../models/User.model.js';
import {
  NORMAL_MODEL,
  NORMAL_MODEL_KEY,
  NORMAL_USABLE_LIMIT,
  getQuotaDate,
} from '../config/gemini.js';

export const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getSummary(req.user._id);
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

export const refreshSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.manualRefresh(req.user._id);
    res.status(200).json({
      success: true,
      data: summary,
      message: 'Analytics updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSessionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, q } = req.query;
    
    const query = { userId: req.user._id };
    
    if (category) {
      query.category = category;
    }
    
    if (q) {
      query.rawError = { $regex: q, $options: 'i' };
    }

    const sessions = await DebugSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await DebugSession.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        sessions,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalSessions: count
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateNeuralReport = async (req, res, next) => {
  try {
    const { force = false } = req.body;
    const today = getQuotaDate();

    // Will this request actually produce a NEW report (vs. returning the cached one)?
    const { newActivity, hasReport } = await analyticsService.getReportReadiness(req.user._id);
    const willGenerate = !!force || newActivity > 0 || !hasReport;

    if (!willGenerate) {
      // Nothing new — hand back the cached report; no quota consumed.
      const cached = await analyticsService.generateNeuralReport(req.user._id, NORMAL_MODEL, false);
      return res.status(200).json({ success: true, data: cached });
    }

    // (a) Per-user report quota: 1 / day, 2 / week (resets 12:30 PM IST).
    const dates = req.user.reportUsage?.dates || [];
    const weekAgo = analyticsService.ptDateDaysAgo(6);
    if (dates.filter((d) => d === today).length >= analyticsService.REPORT_DAILY_LIMIT) {
      return res.status(429).json({
        success: false,
        code: "REPORT_DAILY_LIMIT",
        message: "You've already generated a report today. Resets at 12:30 PM IST.",
      });
    }
    if (dates.filter((d) => d >= weekAgo).length >= analyticsService.REPORT_WEEKLY_LIMIT) {
      return res.status(429).json({
        success: false,
        code: "REPORT_WEEKLY_LIMIT",
        message: `You've used both reports this week (max ${analyticsService.REPORT_WEEKLY_LIMIT}). Come back in a few days.`,
      });
    }

    // (b) Shared API pool (respects the reserve).
    const quota = await ApiQuota.findOneAndUpdate(
      { date: today },
      { $setOnInsert: { date: today, counts: { [NORMAL_MODEL_KEY]: 0 } } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const currentCount = quota.counts.get(NORMAL_MODEL_KEY) || 0;
    if (currentCount >= NORMAL_USABLE_LIMIT) {
      return res.status(429).json({
        success: false,
        message: `Daily request limit reached. Resets at 12:30 PM IST.`,
        code: "QUOTA_EXCEEDED",
      });
    }

    // Generate (force so the service definitely produces a fresh report).
    const report = await analyticsService.generateNeuralReport(req.user._id, NORMAL_MODEL, true);

    // Charge the shared pool + record the per-user report date (pruned to ~2 weeks).
    quota.counts.set(NORMAL_MODEL_KEY, currentCount + 1);
    await quota.save();
    const keepFrom = analyticsService.ptDateDaysAgo(14);
    const nextDates = [...dates.filter((d) => d >= keepFrom), today];
    await User.findByIdAndUpdate(req.user._id, { "reportUsage.dates": nextDates });

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// Read-only archive of every unique recommended skill + learning path for the user.
export const getLearningArchive = async (req, res, next) => {
  try {
    const data = await analyticsService.getLearningArchive(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getNeuralReportHistory = async (req, res, next) => {
  try {
    console.log(`[DEBUG] Fetching Neural History for User: ${req.user._id}`);
    const reports = await analyticsService.getNeuralReportHistory(req.user._id);
    console.log(`[DEBUG] Found ${reports.length} archived reports`);
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error(`[DEBUG] History Fetch Error: ${error.message}`);
    next(error);
  }
};
