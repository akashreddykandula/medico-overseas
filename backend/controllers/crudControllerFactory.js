const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Builds standard list/get/create/update/delete handlers for a simple Mongoose model.
 * Keeps Testimonial/Faq/GalleryItem controllers from duplicating identical CRUD logic.
 *
 * @param {mongoose.Model} Model
 * @param {object} options
 *   publicFilter: filter object applied for anonymous/public requests (default { isPublished: true })
 *   populate: fields to populate (string or array)
 *   sort: default sort object
 *   resourceName: human-readable name used in messages
 */
const createCrudController = (Model, options = {}) => {
  const { publicFilter = { isPublished: true }, populate = '', sort = { createdAt: -1 }, resourceName = 'Item' } =
    options;

  const list = asyncHandler(async (req, res) => {
    const filter = req.user ? {} : publicFilter;
    // Allow simple query-param filters (e.g. ?category=hostel, ?relatedCountry=<id>)
    Object.entries(req.query).forEach(([key, value]) => {
      if (['page', 'limit'].includes(key)) return;
      filter[key] = value;
    });

    let query = Model.find(filter).sort(sort);
    if (populate) query = query.populate(populate);
    const items = await query;

    res.status(200).json(new ApiResponse(200, { items }));
  });

  const getOne = asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populate) query = query.populate(populate);
    const item = await query;
    if (!item) throw new ApiError(404, `${resourceName} not found`);
    res.status(200).json(new ApiResponse(200, { item }));
  });

  const create = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json(new ApiResponse(201, { item }, `${resourceName} created`));
  });

  const update = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw new ApiError(404, `${resourceName} not found`);
    res.status(200).json(new ApiResponse(200, { item }, `${resourceName} updated`));
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, `${resourceName} not found`);
    res.status(200).json(new ApiResponse(200, null, `${resourceName} deleted`));
  });

  return { list, getOne, create, update, remove };
};

module.exports = createCrudController;
