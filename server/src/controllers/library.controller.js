import LibraryArticle from "../models/LibraryArticle.model.js";
import DebugSession from "../models/DebugSession.model.js";

export const getArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, q, tag, authorId } = req.query;

    const query = { isPublished: true };

    if (tag) {
      query.tags = { $regex: new RegExp(`^${tag}$`, "i") };
    }

    if (authorId) {
      query.authorId = authorId;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { metaDescription: { $regex: q, $options: "i" } }
      ];
    }

    const articles = await LibraryArticle.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-content"); // Don't include content in list view

    const count = await LibraryArticle.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getArticle = async (req, res, next) => {
  try {
    const article = await LibraryArticle.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).populate("authorId", "displayName email");

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    // Increment views async
    LibraryArticle.findByIdAndUpdate(article._id, {
      $inc: { views: 1 },
    }).exec();

    // Respect anonymity: never leak the author's identity if they opted out.
    const data = article.toObject();
    if (data.authorDisplay === "anonymous") {
      data.authorId = { displayName: "Anonymous" };
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an article the user authored (currently: blog identity)
// @route   PATCH /api/library/:id
// @access  Private
export const updateArticle = async (req, res, next) => {
  try {
    const { authorDisplay } = req.body;
    const article = await LibraryArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
    if (article.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this article" });
    }

    if (["name", "anonymous"].includes(authorDisplay)) {
      article.authorDisplay = authorDisplay;
    }

    await article.save();
    res.json({ success: true, data: { _id: article._id, authorDisplay: article.authorDisplay } });
  } catch (error) {
    next(error);
  }
};

// @desc    Unpublish / delete an article the user authored
// @route   DELETE /api/library/:id
// @access  Private
export const deleteArticle = async (req, res, next) => {
  try {
    const article = await LibraryArticle.findById(req.params.id);

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    if (article.authorId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to remove this article" });
    }

    // Detach the link from any session so it can be re-published later.
    await DebugSession.updateMany(
      { articleId: article._id },
      { $unset: { articleId: "" } },
    );

    await LibraryArticle.deleteOne({ _id: article._id });

    res.json({ success: true, message: "Article unpublished" });
  } catch (error) {
    next(error);
  }
};

export const getTags = async (req, res, next) => {
  try {
    const tags = await LibraryArticle.aggregate([
      { $match: { isPublished: true } },
      { $unwind: "$tags" },
      {
        $project: {
          normalizedTag: { $trim: { input: { $toUpper: "$tags" } } },
        },
      },
      { $group: { _id: "$normalizedTag", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 40 },
    ]);

    res.json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
};
