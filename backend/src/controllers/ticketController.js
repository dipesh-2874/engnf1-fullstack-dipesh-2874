import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import TicketEvent from "../models/TicketEvents.js";
import User from "../models/User.js";
import { classifyTicket } from "../services/ticketClassifier.js";

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

//import tickets
export const importTickets = async (req, res) => {
  try {
    const tickets = req.body;

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return sendError(
        res, 400, "VALIDATION_ERROR",
        "A non-empty array of tickets is required"
      );
    }

    // Validate entire batch before writing to MongoDB
    const normalizedTickets = [];
    const externalIds = new Set();

    for (const item of tickets) {
      if (
        !item ||
        typeof item.externalId !== "string" ||
        typeof item.subject !== "string" ||
        typeof item.body !== "string"
      ) {
        return sendError(
          res, 400, "VALIDATION_ERROR",
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
          res, 400, "VALIDATION_ERROR",
          "Invalid ticket fields"
        );
      }

      if (externalIds.has(externalId)) {
        return sendError(
          res, 400, "VALIDATION_ERROR",
          "Duplicate externalId in import batch"
        );
      }

      externalIds.add(externalId);

      normalizedTickets.push({
        externalId,
        subject,
        body,
      });
    }

    let imported = 0;
    let updated = 0;

    for (const item of normalizedTickets) {
      const { externalId, subject, body } = item;

      const existing = await Ticket.findOne({ externalId });
      if (existing?.isHumanOverride) {
        await Ticket.updateOne({ _id: existing._id }, { $set: { subject, body } });
        updated++;
        continue;
      }
      const classification = classifyTicket(subject, body);

      if (existing) {
        const content = { subject, body };
        const refreshed = await Ticket.updateOne(
          { _id: existing._id, isHumanOverride: { $ne: true } },
          { $set: { ...content, category: classification.category, priority: classification.priority } }
        );

        // An agent can set the override between the initial lookup and this write.
        if (refreshed.matchedCount === 0) {
          await Ticket.updateOne({ _id: existing._id }, { $set: content });
        }
        updated++;
      } else {
        const ticket = await Ticket.create({
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

        const actor = req.get("X-Agent")?.trim() || req.user.email;
        await TicketEvent.insertMany(
          ["category", "priority", "status"].map((field) => ({
            ticketId: ticket._id,
            field,
            oldValue: null,
            newValue: String(ticket[field]),
            actor,
          }))
        );

        imported++;
      }
    }

    return res.status(200).json({
      message: "Tickets imported successfully",
      imported,
      updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res, 409, "CONFLICT",
        "Duplicate externalId conflict"
      );
    }

    console.error("Ticket import error:", error);

    return sendError(
      res, 500, "INTERNAL_ERROR",
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
      q,
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

    if (q !== undefined) {
      if (
        typeof q !== "string" ||
        q.length > 100
      ) {
        return sendError(
          res, 400, "VALIDATION_ERROR", "Invalid search query"
        );
      }

      const pattern = escapeRegex(q.trim());

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
        let shouldMarkReviewed = false;

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

          if (field === "category") {
            shouldMarkReviewed = true;
          }

          if (
            field === "status" &&
            oldValue === "OPEN" &&
            newValue !== "OPEN"
          ) {
            shouldMarkReviewed = true;
          }

          events.push({
            ticketId: ticket._id,
            actor: req.get("X-Agent")?.trim() || req.user.email,
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
          if (shouldMarkReviewed) {
            ticket.isReviewed = true;
          }

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


export const getTicketEvents = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid ticket ID"
      );
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return sendError(
        res,
        404,
        "NOT_FOUND",
        "Ticket not found"
      );
    }

    const events = await TicketEvent.find({
      ticketId: ticket._id,
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      ticketId: ticket._id,
      events,
    });
  } catch (error) {
    console.error("Get ticket events error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to fetch ticket history"
    );
  }
};
