import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Shape a user document for client consumption (never leak the password hash).
const formatUser = (user) => ({
  _id: user._id,
  displayName: user.displayName,
  email: user.email,
  plan: user.plan,
  stats: user.stats,
  personalization: user.personalization,
  preferences: user.preferences,
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { displayName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      displayName,
      email,
      password, // Hashed in model pre-save hook
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          ...formatUser(user),
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        data: {
          ...formatUser(user),
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: formatUser(req.user),
  });
};

// @desc    Update profile, personalization & preferences (and optionally password)
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = async (req, res) => {
  try {
    const {
      displayName,
      personalization,
      preferences,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (typeof displayName === 'string' && displayName.trim()) {
      user.displayName = displayName.trim();
    }

    if (personalization && typeof personalization === 'object') {
      if (typeof personalization.aboutYou === 'string') {
        user.personalization.aboutYou = personalization.aboutYou.slice(0, 1500);
      }
      if (typeof personalization.responseStyle === 'string') {
        user.personalization.responseStyle = personalization.responseStyle.slice(0, 1500);
      }
      if (['socratic', 'direct'].includes(personalization.responseMode)) {
        user.personalization.responseMode = personalization.responseMode;
      }
    }

    if (preferences && typeof preferences === 'object') {
      const p = preferences;
      if (typeof p.defaultDeepMode === 'boolean') user.preferences.defaultDeepMode = p.defaultDeepMode;
      if (['dark', 'light'].includes(p.theme)) user.preferences.theme = p.theme;
      if (['emerald', 'blue', 'violet', 'rose', 'amber', 'zinc'].includes(p.accent)) user.preferences.accent = p.accent;
      if (typeof p.language === 'string') user.preferences.language = p.language.slice(0, 20);
      if (typeof p.dictation === 'boolean') user.preferences.dictation = p.dictation;
      if (['name', 'anonymous'].includes(p.defaultBlogIdentity)) user.preferences.defaultBlogIdentity = p.defaultBlogIdentity;
      if (p.notifications && typeof p.notifications === 'object') {
        if (typeof p.notifications.product === 'boolean') user.preferences.notifications.product = p.notifications.product;
        if (typeof p.notifications.security === 'boolean') user.preferences.notifications.security = p.notifications.security;
      }
    }

    // Optional password change — requires the correct current password.
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters',
        });
      }
      const isMatch = await user.comparePassword(currentPassword || '');
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }
      user.password = newPassword; // hashed by the pre-save hook
    }

    await user.save();

    res.json({ success: true, data: formatUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
