
import mongoose from "mongoose";
import Resource from "../models/Resource.js";

const RESOURCE_TYPES = ["ROOM", "LAB", "EQUIPMENT"];

const EDITABLE_FIELDS = [
  "name",
  "type",
  "capacity",
  "description",
  "isActive",
];

const sendError = (res, status, code, message) => {
  return res.status(status).json({
    error: { code, message },
  });
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const validateResourceFields = (data, isCreate = false) => {
  const fields = Object.keys(data);

  if (
    fields.length === 0 ||
    fields.some((field) => !EDITABLE_FIELDS.includes(field))
  ) {
    return "Invalid or unsupported resource fields";
  }

  if (isCreate) {
    if (
      data.name === undefined ||
      data.type === undefined ||
      data.capacity === undefined
    ) {
      return "Name, type and capacity are required";
    }
  }

  if (data.name !== undefined) {
    if (
      typeof data.name !== "string" ||
      data.name.trim().length < 3 ||
      data.name.trim().length > 60
    ) {
      return "Name must be between 3 and 60 characters";
    }
  }

  if (
    data.type !== undefined &&
    !RESOURCE_TYPES.includes(data.type)
  ) {
    return "Invalid resource type";
  }

  if (data.capacity !== undefined) {
    if (
      !Number.isInteger(data.capacity) ||
      data.capacity < 1 ||
      data.capacity > 500
    ) {
      return "Capacity must be an integer between 1 and 500";
    }
  }

  if (data.description !== undefined) {
    if (
      data.description !== null &&
      (
        typeof data.description !== "string" ||
        data.description.trim().length > 300
      )
    ) {
      return "Description must be a string of at most 300 characters";
    }
  }

  if (
    data.isActive !== undefined &&
    typeof data.isActive !== "boolean"
  ) {
    return "isActive must be a boolean";
  }

  return null;
};

// GET /api/resources
export const getResources = async (req, res) => {
  try {
    const {
      type,
      minCapacity,
      q,
      isActive,
    } = req.query;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit !== 10
    ) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Page must be positive and page size must be 10"
      );
    }

    const filter = {};

    if (type !== undefined) {
      if (
        typeof type !== "string" ||
        !RESOURCE_TYPES.includes(type)
      ) {
        return sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "Invalid resource type"
        );
      }

      filter.type = type;
    }

    if (minCapacity !== undefined) {
      const capacity = Number(minCapacity);

      if (
        !Number.isInteger(capacity) ||
        capacity < 1 ||
        capacity > 500
      ) {
        return sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "Invalid minimum capacity"
        );
      }

      filter.capacity = { $gte: capacity };
    }

    if (q !== undefined) {
      if (typeof q !== "string" || q.length > 100) {
        return sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "Invalid search query"
        );
      }

      const search = escapeRegex(q.trim());

      if (search) {
        filter.name = {
          $regex: search,
          $options: "i",
        };
      }
    }

    if (isActive !== undefined) {
      if (
        isActive !== "true" &&
        isActive !== "false"
      ) {
        return sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "isActive must be true or false"
        );
      }

      filter.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ name: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Resource.countDocuments(filter),
    ]);

    return res.status(200).json({
      resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get resources error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to fetch resources"
    );
  }
};

// GET /api/resources/:id
export const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid resource ID"
      );
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      return sendError(
        res,
        404,
        "NOT_FOUND",
        "Resource not found"
      );
    }

    return res.status(200).json({ resource });
  } catch (error) {
    console.error("Get resource error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to fetch resource"
    );
  }
};

// POST /api/resources
export const createResource = async (req, res) => {
  try {
    const data = req.body;

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid request body"
      );
    }

    const validationError = validateResourceFields(
      data,
      true
    );

    if (validationError) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        validationError
      );
    }

    const resource = await Resource.create({
      name: data.name.trim(),
      type: data.type,
      capacity: data.capacity,
      description:
        typeof data.description === "string"
          ? data.description.trim()
          : null,
      isActive: data.isActive ?? true,
    });

    return res.status(201).json({
      message: "Resource created successfully",
      resource,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "CONFLICT",
        "Resource name already exists"
      );
    }

    if (error.name === "ValidationError") {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid resource data"
      );
    }

    console.error("Create resource error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to create resource"
    );
  }
};

// PATCH /api/resources/:id
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid resource ID"
      );
    }

    const changes = req.body;

    if (
      !changes ||
      typeof changes !== "object" ||
      Array.isArray(changes)
    ) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid request body"
      );
    }

    const validationError = validateResourceFields(
      changes
    );

    if (validationError) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        validationError
      );
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      return sendError(
        res,
        404,
        "NOT_FOUND",
        "Resource not found"
      );
    }

    for (const field of Object.keys(changes)) {
      let value = changes[field];

      if (
        typeof value === "string" &&
        (field === "name" || field === "description")
      ) {
        value = value.trim();
      }

      resource[field] = value;
    }

    await resource.save();

    return res.status(200).json({
      message: "Resource updated successfully",
      resource,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "CONFLICT",
        "Resource name already exists"
      );
    }

    if (error.name === "ValidationError") {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid resource data"
      );
    }

    console.error("Update resource error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to update resource"
    );
  }
};
