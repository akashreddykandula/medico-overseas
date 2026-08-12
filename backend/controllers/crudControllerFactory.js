const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Builds standard list/get/create/update/delete handlers for a simple Mongoose model.
 *
 * SECURITY:
 * - Never mutates the configured publicFilter.
 * - Rejects MongoDB operators in query/body data.
 * - Restricts query filters to schema fields.
 * - Prevents mass assignment of protected Mongoose fields.
 * - Validates MongoDB ObjectIds before ID-based queries.
 * - Uses runValidators for updates.
 *
 * Existing CRUD behavior is preserved.
 *
 * @param {mongoose.Model} Model
 * @param {object} options
 *   publicFilter: filter object applied for anonymous/public requests
 *   populate: fields to populate (string or array)
 *   sort: default sort object
 *   resourceName: human-readable name used in messages
 *   allowedCreateFields: optional explicit create allowlist
 *   allowedUpdateFields: optional explicit update allowlist
 */
const createCrudController = (Model, options = {}) => {
  const {
    publicFilter = { isPublished: true },
    populate = "",
    sort = { createdAt: -1 },
    resourceName = "Item",
    allowedCreateFields,
    allowedUpdateFields,
  } = options;

  if (!Model || !Model.schema) {
    throw new Error("A valid Mongoose model is required");
  }

  // ------------------------------------------------------------
  // SECURITY HELPERS
  // ------------------------------------------------------------

  const isValidObjectId = (id) =>
    typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

  const containsMongoOperator = (value) => {
    if (!value || typeof value !== "object") {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some((item) => containsMongoOperator(item));
    }

    return Object.entries(value).some(([key, nestedValue]) => {
      if (key.startsWith("$") || key.includes(".")) {
        return true;
      }

      return containsMongoOperator(nestedValue);
    });
  };

  const getSchemaFields = () =>
    new Set(
      Object.keys(Model.schema.paths).filter(
        (field) => !["_id", "__v", "createdAt", "updatedAt"].includes(field),
      ),
    );

  const buildSafePayload = (body, explicitFields) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ApiError(400, "Invalid request body");
    }

    if (containsMongoOperator(body)) {
      throw new ApiError(400, "Invalid request data");
    }

    const schemaFields = getSchemaFields();

    const topLevelSchemaFields = new Set(
      [...schemaFields].map((field) => field.split(".")[0]),
    );

    const allowedFields = new Set(
      Array.isArray(explicitFields) && explicitFields.length
        ? explicitFields
        : topLevelSchemaFields,
    );

    const payload = {};

    for (const [key, value] of Object.entries(body)) {
      if (key.startsWith("$") || key.includes(".")) {
        throw new ApiError(400, "Invalid request field");
      }

      if (!allowedFields.has(key)) {
        continue;
      }

      // Handle nested fields such as:
      // photo: { url, publicId }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const nestedPayload = {};

        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (nestedKey.startsWith("$") || nestedKey.includes(".")) {
            throw new ApiError(400, "Invalid request field");
          }

          const fullPath = `${key}.${nestedKey}`;

          if (!schemaFields.has(fullPath)) {
            continue;
          }

          if (containsMongoOperator(nestedValue)) {
            throw new ApiError(400, "Invalid request data");
          }

          nestedPayload[nestedKey] = nestedValue;
        }

        if (Object.keys(nestedPayload).length > 0) {
          payload[key] = nestedPayload;
        }

        continue;
      }

      payload[key] = value;
    }

    return payload;
  };
  const buildSafeQueryFilter = (queryParams) => {
    const filter = {};
    const schemaFields = getSchemaFields();

    if (!queryParams || typeof queryParams !== "object") {
      return filter;
    }

    for (const [key, value] of Object.entries(queryParams)) {
      if (["page", "limit"].includes(key)) {
        continue;
      }

      // Only allow fields that actually exist in the model schema.
      if (!schemaFields.has(key)) {
        continue;
      }

      if (
        key.startsWith("$") ||
        key.includes(".") ||
        typeof value !== "string" ||
        value.length > 500
      ) {
        throw new ApiError(400, `Invalid query parameter: ${key}`);
      }

      filter[key] = value;
    }

    return filter;
  };

  // ------------------------------------------------------------
  // LIST
  // ------------------------------------------------------------

  const list = asyncHandler(async (req, res) => {
    // Clone the public filter so request-specific filters never
    // mutate the shared configuration object.
    const filter = req.user ? {} : { ...publicFilter };

    const queryFilters = buildSafeQueryFilter(req.query);

    Object.assign(filter, queryFilters);

    let query = Model.find(filter).sort(sort);

    if (populate) {
      query = query.populate(populate);
    }

    const items = await query;

    res.status(200).json(
      new ApiResponse(200, {
        items,
      }),
    );
  });

  // ------------------------------------------------------------
  // GET ONE
  // ------------------------------------------------------------

  const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, `Invalid ${resourceName.toLowerCase()} ID`);
    }

    let query = Model.findById(id);

    if (populate) {
      query = query.populate(populate);
    }

    const item = await query;

    if (!item) {
      throw new ApiError(404, `${resourceName} not found`);
    }

    res.status(200).json(
      new ApiResponse(200, {
        item,
      }),
    );
  });

  // ------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------

  const create = asyncHandler(async (req, res) => {
    const payload = buildSafePayload(req.body, allowedCreateFields);

    if (Object.keys(payload).length === 0) {
      throw new ApiError(400, "No valid fields provided");
    }

    const item = await Model.create(payload);

    res.status(201).json(
      new ApiResponse(
        201,
        {
          item,
        },
        `${resourceName} created`,
      ),
    );
  });

  // ------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------

  const update = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, `Invalid ${resourceName.toLowerCase()} ID`);
    }

    const updates = buildSafePayload(req.body, allowedUpdateFields);

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No valid fields provided for update");
    }

    const item = await Model.findByIdAndUpdate(
      id,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
        context: "query",
      },
    );

    if (!item) {
      throw new ApiError(404, `${resourceName} not found`);
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          item,
        },
        `${resourceName} updated`,
      ),
    );
  });

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------

  const remove = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, `Invalid ${resourceName.toLowerCase()} ID`);
    }

    const item = await Model.findByIdAndDelete(id);

    if (!item) {
      throw new ApiError(404, `${resourceName} not found`);
    }

    res.status(200).json(new ApiResponse(200, null, `${resourceName} deleted`));
  });

  return {
    list,
    getOne,
    create,
    update,
    remove,
  };
};

module.exports = createCrudController;
