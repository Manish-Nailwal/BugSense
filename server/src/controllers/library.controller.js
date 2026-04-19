import LibraryArticle from '../models/LibraryArticle.model.js';

export const getArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, q, tag, authorId } = req.query;
    
    const query = { isPublished: true };
    
    if (tag) {
      query.tags = { $regex: new RegExp(`^${tag}$`, 'i') };
    }

    if (authorId) {
      query.authorId = authorId;
    }
    
    if (q) {
      query.$text = { $search: q };
    }

    const articles = await LibraryArticle.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Don't include content in list view

    const count = await LibraryArticle.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getArticle = async (req, res, next) => {
  try {
    const article = await LibraryArticle.findOne({ 
      slug: req.params.slug, 
      isPublished: true 
    }).populate('authorId', 'displayName email');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Increment views async
    LibraryArticle.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

export const getTags = async (req, res, next) => {
  try {
    const tags = await LibraryArticle.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $project: { normalizedTag: { $trim: { input: { $toUpper: '$tags' } } } } },
      { $group: { _id: '$normalizedTag', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 40 }
    ]);

    res.json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
};
