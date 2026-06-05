import mongoose from 'mongoose';

const NeuralReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  statsSnapshot: {
    totalSessions: Number,
    confirmedFixes: Number,
    topCategory: String
  },
  // Official-docs resources recommended alongside this report.
  learningPaths: [
    {
      name: String,
      url: String,
      level: String
    }
  ],
  // Skill gaps surfaced by this report, each with the official resource to fix it.
  skillGaps: [
    {
      area: String,
      reason: String,
      name: String,
      url: String,
      level: String
    }
  ]
}, { timestamps: true });

const NeuralReport = mongoose.model('NeuralReport', NeuralReportSchema);

export default NeuralReport;
