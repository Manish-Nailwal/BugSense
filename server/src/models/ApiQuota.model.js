import mongoose from 'mongoose';

const apiQuotaSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    unique: true,
    index: true,
  },
  // Global per-model request counts for the day (shared free-tier pool).
  // Keys are friendly model names with dots replaced by underscores.
  counts: {
    type: Map,
    of: Number,
    default: {
      'Gemini 3 Flash Lite': 0,
      'Gemini 3 Flash': 0,
    },
  },
}, { timestamps: true });

const ApiQuota = mongoose.model('ApiQuota', apiQuotaSchema);
export default ApiQuota;
