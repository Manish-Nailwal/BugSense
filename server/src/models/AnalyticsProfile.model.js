import mongoose from 'mongoose';

const AnalyticsProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  summaryData: {
    totalSessions: { type: Number, default: 0 },
    totalQueries: { type: Number, default: 0 },
    queryLimit: { type: Number, default: 1000 },
    confirmedFixes: { type: Number, default: 0 },
    topCategory: { type: String, default: 'N/A' },
    categoryStats: [
      {
        _id: String,
        count: Number
      }
    ],
    weeklyTrend: [
      {
        _id: String,
        count: Number
      }
    ],
    skillGapAlerts: [
      {
        category: String,
        count: Number,
        resource: {
          url: String,
          title: String
        }
      }
    ],
    efficiency: { type: String, default: '0%' }
  },
  isMockData: {
    type: Boolean,
    default: false
  },
  lastAutoUpdate: {
    type: Date,
    default: Date.now
  },
  lastManualUpdate: {
    type: Date,
    default: new Date(0) // Start of time (Jan 1, 1970)
  },
  neuralReport: {
    content: String,
    model: String,
    generatedAt: Date
  }
}, { timestamps: true });

const AnalyticsProfile = mongoose.model('AnalyticsProfile', AnalyticsProfileSchema);

export default AnalyticsProfile;
