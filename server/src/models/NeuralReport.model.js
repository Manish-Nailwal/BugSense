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
  }
}, { timestamps: true });

const NeuralReport = mongoose.model('NeuralReport', NeuralReportSchema);

export default NeuralReport;
