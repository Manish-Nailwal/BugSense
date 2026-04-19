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
  views: {
    type: Number,
    default: 0,
  },
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
