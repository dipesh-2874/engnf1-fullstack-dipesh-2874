import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import TicketEvent from "../models/TicketEvents.js";
import User from "../models/User.js";

const CATEGORIES = [
  "BILLING",
  "BUG",
  "FEATURE_REQUEST",
  "LOGIN",
  "DELIVERY",
];

const PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const EDITABLE_FIELDS = [
  "category",
  "priority",
  "status",
  "assigneeId",
];

const sendError = (res, status, code, message) => {
  return res.status(status).json({
    error: { code, message },
  });
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const classifyTicket = (subject, body) => {
  const text = `${subject} ${body}`.toLowerCase();

  if (/login|password|sign.?in|account access/.test(text)) {
    return { category: "LOGIN", priority: "HIGH" };
  }

  if (/refund|invoice|payment|billing/.test(text)) {
    return { category: "BILLING", priority: "HIGH" };
  }

  if (/crash|bug|error|broken/.test(text)) {
    return { category: "BUG", priority: "HIGH" };
  }

  if (/delivery|shipment|tracking|package/.test(text)) {
    return { category: "DELIVERY", priority: "MEDIUM" };
  }

  return {
    category: "FEATURE_REQUEST",
    priority: "MEDIUM",
  };
};

//import tickets
export const importTickets = async (req, res) => {
  try {
    const { tickets } = req.body ?? {};

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "A non-empty tickets array is required"
      );
    }

    let imported = 0;
    let updated = 0;

    for (const item of tickets) {
      if (
        !item ||
        typeof item.externalId !== "string" ||
        typeof item.subject !== "string" ||
        typeof item.body !== "string"
      ) {
        return sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "Each ticket requires externalId, subject and body"
        );
      }

      const externalId = item.externalId.trim();
      const subject = item.subject.trim();
      const body = item.body.trim();

      if (
        !externalId ||
        subject.length < 3 ||
        subject.length > 150 ||
        body.length < 5 ||
        body.length > 2000
      ) {
        return sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "Invalid ticket field lengths"
        );
      }
    }

    for (const item of tickets) {
      const externalId = item.externalId.trim();
      const subject = item.subject.trim();
      const body = item.body.trim();

      const existing = await Ticket.findOne({ externalId });

      if (existing) {
        existing.subject = subject;
        existing.body = body;

        await existing.save();

        updated++;
        continue;
      }

      const classification = classifyTicket(subject, body);

      await Ticket.create({
        externalId,
        subject,
        body,
        autoCategory: classification.category,
        category: classification.category,
        priority: classification.priority,
        status: "OPEN",
        isHumanOverride: false,
        isReviewed: false,
      });

      imported++;
    }

    return res.status(200).json({
      message: "Ticket import completed",
      imported,
      updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "CONFLICT",
        "Duplicate external ticket identifier"
      );
    }

    console.error("Ticket import error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to import tickets"
    );
  }
};

// get tickets
export const getTickets = async (req, res) => {
  try {
    const {
      category,
      priority,
      status,
      assigneeId,
      search,
    } = req.query;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid pagination values"
      );
    }

    const filter = {};

    if (category !== undefined) {
      if (!CATEGORIES.includes(category)) {
        return sendError(
          res, 400, "VALIDATION_ERROR", "Invalid category"
        );
      }
      filter.category = category;
    }

    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority)) {
        return sendError(
          res, 400, "VALIDATION_ERROR", "Invalid priority"
        );
      }
      filter.priority = priority;
    }

    if (status !== undefined) {
      if (!STATUSES.includes(status)) {
        return sendError(
          res, 400, "VALIDATION_ERROR", "Invalid status"
        );
      }
      filter.status = status;
    }

    if (assigneeId !== undefined) {
      if (!mongoose.isValidObjectId(assigneeId)) {
        return sendError(
          res, 400, "VALIDATION_ERROR", "Invalid assignee ID"
        );
      }
      filter.assigneeId = assigneeId;
    }

    if (search !== undefined) {
      if (
        typeof search !== "string" ||
        search.length > 100
      ) {
        return sendError(
          res, 400, "VALIDATION_ERROR", "Invalid search"
        );
      }

      const pattern = escapeRegex(search.trim());

      if (pattern) {
        filter.$or = [
          { subject: { $regex: pattern, $options: "i" } },
          { body: { $regex: pattern, $options: "i" } },
        ];
      }
    }

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Ticket.countDocuments(filter),
    ]);

    return res.status(200).json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to fetch tickets"
    );
  }
};

// get tickets by Id
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(
        res, 400, "VALIDATION_ERROR", "Invalid ticket ID"
      );
    }

    const ticket = await Ticket.findById(id)
      .populate("assigneeId", "name email role");

    if (!ticket) {
      return sendError(
        res, 404, "NOT_FOUND", "Ticket not found"
      );
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Get ticket error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to fetch ticket"
    );
  }
};

// update tickets
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(
        res, 400, "VALIDATION_ERROR", "Invalid ticket ID"
      );
    }

    const changes = req.body;

    if (
      !changes ||
      typeof changes !== "object" ||
      Array.isArray(changes)
    ) {
      return sendError(
        res, 400, "VALIDATION_ERROR", "Invalid request body"
      );
    }

    const fields = Object.keys(changes);

    if (
      fields.length === 0 ||
      fields.some((field) => !EDITABLE_FIELDS.includes(field))
    ) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "One or more fields cannot be modified"
      );
    }

    if (
      changes.category !== undefined &&
      !CATEGORIES.includes(changes.category)
    ) {
      return sendError(
        res, 400, "VALIDATION_ERROR", "Invalid category"
      );
    }

    if (
      changes.priority !== undefined &&
      !PRIORITIES.includes(changes.priority)
    ) {
      return sendError(
        res, 400, "VALIDATION_ERROR", "Invalid priority"
      );
    }

    if (
      changes.status !== undefined &&
      !STATUSES.includes(changes.status)
    ) {
      return sendError(
        res, 400, "VALIDATION_ERROR", "Invalid status"
      );
    }

    if (
      changes.assigneeId !== undefined &&
      changes.assigneeId !== null
    ) {
      if (!mongoose.isValidObjectId(changes.assigneeId)) {
        return sendError(
          res, 400, "VALIDATION_ERROR", "Invalid assignee ID"
        );
      }

      const assignee = await User.findById(changes.assigneeId);

      if (!assignee) {
        return sendError(
          res, 404, "NOT_FOUND", "Assignee not found"
        );
      }
    }

    const session = await mongoose.startSession();
    let result;

    try {
      await session.withTransaction(async () => {
        const ticket = await Ticket.findById(id).session(session);

        if (!ticket) {
          result = null;
          return;
        }

        const events = [];

        for (const field of fields) {
          const oldValue =
            ticket[field] == null
              ? null
              : String(ticket[field]);

          const newValue =
            changes[field] == null
              ? null
              : String(changes[field]);

          if (oldValue === newValue) continue;

          events.push({
            ticketId: ticket._id,
            actor: req.user._id.toString(),
            field,
            oldValue,
            newValue,
          });

          ticket[field] = changes[field];

          if (field === "category") {
            ticket.isHumanOverride = true;
          }
        }

        if (events.length > 0) {
          ticket.isReviewed = true;
          await ticket.save({ session });
          await TicketEvent.insertMany(events, { session });
        }

        result = ticket;
      });
    } finally {
      await session.endSession();
    }

    if (!result) {
      return sendError(
        res, 404, "NOT_FOUND", "Ticket not found"
      );
    }

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket: result,
    });
  } catch (error) {
    console.error("Update ticket error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to update ticket"
    );
  }
};