import mongoose from 'mongoose';

const libraryArticleSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DebugSession',
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  metaDescription: String,
  content: {
    type: String,
    required: true,
  },
  tags: [String],
  errorSnippet: String,
  // Author identity on the public blog: show real name or publish anonymously.
  // Can be flipped by the author at any time from the workspace.
  authorDisplay: {
    type: String,
    enum: ['name', 'anonymous'],
    default: 'name',
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  // Reader Q&A: a comment can be a question, or the author's reply to one
  // (isAuthorReply + parentId form a simple thread). Wired for a future feature.
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      authorName: { type: String, default: 'Anonymous' },
      text: { type: String, required: true },
      isAuthorReply: { type: Boolean, default: false },
      parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  isPublished: {
    type: Boolean,
    default: true,
  },
  seo: {
    ogTitle: String,
    ogDescription: String,
    structuredData: Object, // JSON-LD
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Full-text search index
libraryArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });

const LibraryArticle = mongoose.model('LibraryArticle', libraryArticleSchema);
export default LibraryArticle;
