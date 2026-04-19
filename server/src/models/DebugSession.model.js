import mongoose from 'mongoose';

const debugSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  rawError: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  aiResponse: {
    breakdown: String,
    probableCauses: [String],
    diagnostics: [String],
    fullText: String, // Store the raw MD response as well
  },
  category: {
    type: String, // e.g., "Async/Await", "React Hooks"
    index: true,
  },
  techStack: [String],
  confirmedFix: {
    isConfirmed: { type: Boolean, default: false },
    userNote: String,
    confirmedAt: Date,
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LibraryArticle',
  },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  metadata: {
    errorFingerprint: String, // For de-duplication or pattern matching
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const DebugSession = mongoose.model('DebugSession', debugSessionSchema);
export default DebugSession;
