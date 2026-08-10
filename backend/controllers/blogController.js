const mongoose = require("mongoose");
const sanitizeHtml = require("sanitize-html");

const Blog = require("../models/Blog");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const ALLOWED_CATEGORIES = [
  "country",
  "exam",
  "general",
  "visa",
  "scholarship",
];

const ALLOWED_STATUSES = ["draft", "scheduled", "published"];

const STAFF_ROLES = [
  "super_admin",
  "admin",
  "content_manager",
  "marketing_manager",
];

const MAX_SEARCH_LENGTH = 100;
const MAX_TAG_LENGTH = 50;
const MAX_TAGS = 20;

// ============================================================
// HELPERS
// ============================================================

const sanitizeBlogHtml = (html = "") =>
  sanitizeHtml(String(html), {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "blockquote",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "figure",
      "figcaption",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height"],
      blockquote: ["cite"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
      a: ["http", "https", "mailto"],
    },
    disallowedTagsMode: "discard",
    allowedStyles: {},
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
    },
  });

const getPagination = (page, limit) => {
  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  const safePage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const safeLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 50)
      : 9;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const validateObjectId = (id) => {
  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid blog ID");
  }
};

const isStaffUser = (req) =>
  Boolean(req.user && STAFF_ROLES.includes(req.user.role));

const sanitizePlainText = (value, maxLength) => {
  if (typeof value !== "string") return "";

  return value.replace(/\0/g, "").trim().slice(0, maxLength);
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    throw new ApiError(400, "Tags must be an array");
  }

  if (tags.length > MAX_TAGS) {
    throw new ApiError(400, `A blog cannot have more than ${MAX_TAGS} tags`);
  }

  return tags.map((tag) => {
    if (typeof tag !== "string") {
      throw new ApiError(400, "Each tag must be a string");
    }

    const cleanTag = sanitizePlainText(tag, MAX_TAG_LENGTH).toLowerCase();

    if (!cleanTag) {
      throw new ApiError(400, "Tags cannot contain empty values");
    }

    return cleanTag;
  });
};

const validateDate = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }

  return date;
};

const validateFeaturedImage = (featuredImage) => {
  if (featuredImage === undefined) return undefined;

  if (
    !featuredImage ||
    typeof featuredImage !== "object" ||
    Array.isArray(featuredImage)
  ) {
    throw new ApiError(400, "Invalid featured image");
  }

  const url = sanitizePlainText(featuredImage.url, 2048);
  const publicId = sanitizePlainText(featuredImage.publicId, 500);

  if (url && !/^https?:\/\//i.test(url)) {
    throw new ApiError(400, "Invalid featured image URL");
  }

  return {
    url,
    publicId,
  };
};

// ============================================================
// GET BLOGS
// ============================================================

const getBlogs = asyncHandler(async (req, res) => {
  const { category, tag, search, page = 1, limit = 9 } = req.query;

  const { page: safePage, limit: safeLimit, skip } = getPagination(page, limit);

  const filter = {};

  if (!isStaffUser(req)) {
    filter.status = "published";
  }

  if (category !== undefined) {
    if (
      typeof category !== "string" ||
      !ALLOWED_CATEGORIES.includes(category)
    ) {
      throw new ApiError(400, "Invalid blog category");
    }

    filter.category = category;
  }

  if (tag !== undefined) {
    if (typeof tag !== "string" || tag.length > MAX_TAG_LENGTH) {
      throw new ApiError(400, "Invalid tag");
    }

    const cleanTag = sanitizePlainText(tag, MAX_TAG_LENGTH).toLowerCase();

    if (!cleanTag) {
      throw new ApiError(400, "Invalid tag");
    }

    filter.tags = cleanTag;
  }

  let hasSearch = false;

  if (search !== undefined) {
    if (typeof search !== "string") {
      throw new ApiError(400, "Invalid search query");
    }

    const cleanSearch = search
      .replace(/\0/g, "")
      .trim()
      .slice(0, MAX_SEARCH_LENGTH);

    if (cleanSearch) {
      filter.$text = { $search: cleanSearch };
      hasSearch = true;
    }
  }

  const sort = hasSearch
    ? { score: { $meta: "textScore" } }
    : { publishedAt: -1, createdAt: -1 };

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate("author", "name avatar")
      .populate("relatedCountry", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(safeLimit)
      .select("-body -views")
      .lean(),

    Blog.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      blogs,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
      },
    }),
  );
});

// ============================================================
// GET BLOG BY SLUG
// ============================================================

const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (
    typeof slug !== "string" ||
    slug.length < 1 ||
    slug.length > 220 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    throw new ApiError(400, "Invalid blog slug");
  }

  const filter = { slug };

  if (!isStaffUser(req)) {
    filter.status = "published";
  }

  const blog = await Blog.findOne(filter)
    .populate("author", "name avatar staffProfile.designation")
    .populate("relatedCountry", "name slug");

  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });

  blog.views += 1;

  const related = await Blog.find({
    _id: { $ne: blog._id },
    status: "published",
    $or: [
      { category: blog.category },
      ...(Array.isArray(blog.tags) && blog.tags.length
        ? [{ tags: { $in: blog.tags } }]
        : []),
    ],
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select("title slug excerpt featuredImage publishedAt")
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      blog,
      related,
    }),
  );
});

// ============================================================
// CREATE BLOG
// ============================================================

const createBlog = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const {
    title,
    excerpt,
    body,
    featuredImage,
    category,
    relatedCountry,
    tags,
    status,
    publishedAt,
    scheduledFor,
    isFeatured,
    metaTitle,
    metaDescription,
  } = req.body;

  if (
    typeof title !== "string" ||
    typeof excerpt !== "string" ||
    typeof body !== "string" ||
    !title.trim() ||
    !excerpt.trim() ||
    !body.trim()
  ) {
    throw new ApiError(400, "Title, excerpt and body are required");
  }

  if (category !== undefined && !ALLOWED_CATEGORIES.includes(category)) {
    throw new ApiError(400, "Invalid blog category");
  }

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid blog status");
  }

  const sanitizedBody = sanitizeBlogHtml(body);

  if (!sanitizedBody.trim()) {
    throw new ApiError(400, "Blog body contains no valid content");
  }

  const cleanFeaturedImage = validateFeaturedImage(featuredImage);

  const cleanTags = tags === undefined ? [] : normalizeTags(tags);

  const cleanPublishedAt = validateDate(publishedAt, "published date");

  const cleanScheduledFor = validateDate(scheduledFor, "scheduled date");

  const cleanTitle = sanitizePlainText(title, 200);
  const cleanExcerpt = sanitizePlainText(excerpt, 300);

  if (cleanTitle.length < 3) {
    throw new ApiError(400, "Blog title must be at least 3 characters");
  }

  if (!cleanExcerpt) {
    throw new ApiError(400, "Blog excerpt is required");
  }

  const blog = await Blog.create({
    title: cleanTitle,
    excerpt: cleanExcerpt,
    body: sanitizedBody,

    featuredImage: cleanFeaturedImage,

    // NEVER accept author from req.body.
    author: req.user._id,

    category: category || "general",
    relatedCountry,
    tags: cleanTags,
    status: status || "draft",
    publishedAt: cleanPublishedAt,
    scheduledFor: cleanScheduledFor,
    isFeatured: typeof isFeatured === "boolean" ? isFeatured : false,
    metaTitle:
      metaTitle !== undefined ? sanitizePlainText(metaTitle, 70) : undefined,
    metaDescription:
      metaDescription !== undefined
        ? sanitizePlainText(metaDescription, 170)
        : undefined,
  });

  res.status(201).json(new ApiResponse(201, { blog }, "Blog post created"));
});

// ============================================================
// UPDATE BLOG
// ============================================================

const updateBlog = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const {
    title,
    excerpt,
    body,
    featuredImage,
    category,
    relatedCountry,
    tags,
    status,
    publishedAt,
    scheduledFor,
    isFeatured,
    metaTitle,
    metaDescription,
  } = req.body;

  const updates = {};

  if (title !== undefined) {
    if (typeof title !== "string") {
      throw new ApiError(400, "Invalid blog title");
    }

    updates.title = sanitizePlainText(title, 200);

    if (updates.title.length < 3) {
      throw new ApiError(400, "Blog title must be at least 3 characters");
    }
  }

  if (excerpt !== undefined) {
    if (typeof excerpt !== "string") {
      throw new ApiError(400, "Invalid blog excerpt");
    }

    updates.excerpt = sanitizePlainText(excerpt, 300);

    if (!updates.excerpt) {
      throw new ApiError(400, "Blog excerpt is required");
    }
  }

  if (body !== undefined) {
    if (typeof body !== "string") {
      throw new ApiError(400, "Invalid blog body");
    }

    const sanitizedBody = sanitizeBlogHtml(body);

    if (!sanitizedBody.trim()) {
      throw new ApiError(400, "Blog body contains no valid content");
    }

    updates.body = sanitizedBody;
  }

  if (featuredImage !== undefined) {
    updates.featuredImage = validateFeaturedImage(featuredImage);
  }

  if (category !== undefined) {
    if (!ALLOWED_CATEGORIES.includes(category)) {
      throw new ApiError(400, "Invalid blog category");
    }

    updates.category = category;
  }

  if (relatedCountry !== undefined) {
    if (
      relatedCountry !== null &&
      !mongoose.Types.ObjectId.isValid(relatedCountry)
    ) {
      throw new ApiError(400, "Invalid related country ID");
    }

    updates.relatedCountry = relatedCountry;
  }

  if (tags !== undefined) {
    updates.tags = normalizeTags(tags);
  }

  if (status !== undefined) {
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid blog status");
    }

    updates.status = status;

    if (status === "published") {
      updates.publishedAt =
        publishedAt !== undefined
          ? validateDate(publishedAt, "published date")
          : new Date();
    }
  }

  if (scheduledFor !== undefined) {
    updates.scheduledFor = validateDate(scheduledFor, "scheduled date");
  }

  if (isFeatured !== undefined) {
    if (typeof isFeatured !== "boolean") {
      throw new ApiError(400, "isFeatured must be a boolean");
    }

    updates.isFeatured = isFeatured;
  }

  if (metaTitle !== undefined) {
    if (typeof metaTitle !== "string") {
      throw new ApiError(400, "Invalid meta title");
    }

    updates.metaTitle = sanitizePlainText(metaTitle, 70);
  }

  if (metaDescription !== undefined) {
    if (typeof metaDescription !== "string") {
      throw new ApiError(400, "Invalid meta description");
    }

    updates.metaDescription = sanitizePlainText(metaDescription, 170);
  }

  // Never allow protected fields through the update payload.
  delete updates.author;
  delete updates.views;
  delete updates.slug;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  let blog;

  try {
    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        context: "query",
      },
    );
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "A blog with this slug already exists");
    }

    throw error;
  }

  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  res.status(200).json(new ApiResponse(200, { blog }, "Blog post updated"));
});

// ============================================================
// DELETE BLOG
// ============================================================

const deleteBlog = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const blog = await Blog.findByIdAndDelete(req.params.id);

  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Blog post deleted"));
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
};
