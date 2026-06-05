import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/summary', protect, analyticsController.getSummary);
router.post('/refresh', protect, analyticsController.refreshSummary);
router.get('/sessions', protect, analyticsController.getSessionHistory);
router.post('/report', protect, analyticsController.generateNeuralReport);
router.get('/reports', protect, analyticsController.getNeuralReportHistory);
router.get('/learning', protect, analyticsController.getLearningArchive);

export default router;
