import * as analyticsService from '../services/analytics.service.js';
import DebugSession from '../models/DebugSession.model.js';
import ApiQuota from '../models/ApiQuota.model.js';

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
    const { selectedModel: requestedModel = "Gemma 3 12B", force = false } = req.body;
    
    // ENFORCE GEMMA 3: Only Gemma models allowed for Neural Reports as requested
    const isGemma = requestedModel.startsWith("Gemma 3");
    const finalModelName = isGemma ? requestedModel : "Gemma 3 12B";
    const selectedModelKey = finalModelName.replace(/\./g, "_");

    if (force) {
      console.log(`[DEBUG] FORCED Gemma Neural Report Generation for User: ${req.user._id}`);
    }

    // 0. Check and Update Daily Quota (Resets at Midnight Pacific Time)
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    
    let quota = await ApiQuota.findOneAndUpdate(
      { date: today },
      { $setOnInsert: { 
          date: today,
          counts: { "Gemini 3 Flash": 0, "Gemini 2_5 Flash": 0, "Gemma 3 4B": 0, "Gemma 3 12B": 0 }
        } 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const currentCount = quota.counts.get(selectedModelKey) || 0;
    const modelLimit = 14000; // Gemma models have 14k limit

    if (currentCount >= modelLimit) {
      return res.status(429).json({
        success: false,
        message: `Daily limit (${modelLimit}) reached for ${finalModelName}. Resets at 12:30 PM IST.`,
        code: "QUOTA_EXCEEDED",
      });
    }

    // Proceed with generation using finalModelName
    const report = await analyticsService.generateNeuralReport(req.user._id, finalModelName, force);
    
    // Increment quota count
    quota.counts.set(selectedModelKey, currentCount + 1);
    await quota.save();
    
    res.status(200).json({
      success: true,
      data: report
    });
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
