import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  stats: {
    totalSessions: { type: Number, default: 0 },
    confirmedFixes: { type: Number, default: 0 },
  },
  // ChatGPT-style custom instructions, injected into every AI prompt.
  personalization: {
    aboutYou: { type: String, default: '', maxlength: 1500 },
    responseStyle: { type: String, default: '', maxlength: 1500 },
    // socratic = guide w/ questions & mental models (withhold solution)
    // direct   = explain plainly + give concrete fixes/guidance
    responseMode: {
      type: String,
      enum: ['socratic', 'direct'],
      default: 'socratic',
    },
  },
  preferences: {
    defaultDeepMode: { type: Boolean, default: false },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    accent: {
      type: String,
      enum: ['emerald', 'blue', 'violet', 'rose', 'amber', 'zinc'],
      default: 'emerald',
    },
    language: { type: String, default: 'auto' },
    dictation: { type: Boolean, default: false },
    notifications: {
      product: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
    },
    // Default identity applied to newly published blogs.
    defaultBlogIdentity: {
      type: String,
      enum: ['name', 'anonymous'],
      default: 'name',
    },
  },
  // Per-user Deep Mode usage tracker. `date` is YYYY-MM-DD in Pacific Time.
  deepUsage: {
    date: { type: String, default: '' },
    count: { type: Number, default: 0 },
  },
  // Summary-report usage: list of PT dates a report was generated on.
  // Enforces 1/day + 2/week (pruned to the last couple of weeks).
  reportUsage: {
    dates: { type: [String], default: [] },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
