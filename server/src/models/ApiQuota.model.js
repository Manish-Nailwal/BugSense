import mongoose from 'mongoose';

const apiQuotaSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    unique: true,
    index: true,
  },
  counts: {
    type: Map,
    of: Number,
    default: {
      'Gemini 3 Flash': 0,
      'Gemini 2_5 Flash': 0,
      'Gemma 3 4B': 0,
      'Gemma 3 12B': 0,
    },
  },
}, { timestamps: true });

const ApiQuota = mongoose.model('ApiQuota', apiQuotaSchema);
export default ApiQuota;
