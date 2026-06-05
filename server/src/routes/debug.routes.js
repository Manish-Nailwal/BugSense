import express from 'express';
import { analyzeError, getSessions, getSession, confirmFix, updateSession, deleteSession, deleteAllSessions, getQuota } from '../controllers/debug.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeError);
router.get('/quota', protect, getQuota);
router.get('/sessions', protect, getSessions);
router.delete('/sessions', protect, deleteAllSessions);
router.get('/sessions/:id', protect, getSession);
router.patch('/sessions/:id', protect, updateSession);
router.delete('/sessions/:id', protect, deleteSession);
router.post('/sessions/:id/confirm', protect, confirmFix);

export default router;
