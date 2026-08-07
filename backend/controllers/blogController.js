const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    List published blogs with category filter, search, pagination
// @route   GET /api/blogs?category=&search=&page=&limit=
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
  const { category, tag, search, page = 1, limit = 9 } = req.query;

  const filter = req.user ? {} : { status: 'published' };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name avatar')
      .populate('relatedCountry', 'name slug')
      .sort(search ? { score: { $meta: 'textScore' } } : { publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-body'),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      blogs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    })
  );
});

// @desc    Get single blog post by slug + related posts
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate('author', 'name avatar staffProfile.designation')
    .populate('relatedCountry', 'name slug');

  if (!blog || (blog.status !== 'published' && !req.user)) {
    throw new ApiError(404, 'Blog post not found');
  }

  blog.views += 1;
  await blog.save();

  const related = await Blog.find({
    _id: { $ne: blog._id },
    status: 'published',
    $or: [{ category: blog.category }, { tags: { $in: blog.tags } }],
  })
    .limit(3)
    .select('title slug excerpt featuredImage publishedAt');

  res.status(200).json(new ApiResponse(200, { blog, related }));
});

// @desc    Create blog post
// @route   POST /api/blogs
// @access  Private (admin/content_manager)
const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create({ ...req.body, author: req.body.author || req.user._id });
  res.status(201).json(new ApiResponse(201, { blog }, 'Blog post created'));
});

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private (admin/content_manager)
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!blog) throw new ApiError(404, 'Blog post not found');
  res.status(200).json(new ApiResponse(200, { blog }, 'Blog post updated'));
});

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private (admin)
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) throw new ApiError(404, 'Blog post not found');
  res.status(200).json(new ApiResponse(200, null, 'Blog post deleted'));
});

module.exports = { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog };
