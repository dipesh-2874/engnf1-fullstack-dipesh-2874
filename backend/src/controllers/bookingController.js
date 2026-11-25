import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Ticket from "../models/Ticket.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";

const BOOKING_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];
const BLOCKING_BOOKING_STATUSES = ["PENDING", "APPROVED"];

class ApiError extends Error {
    constructor(status, code, message){
        super(message);
        this.status = status;
        this.code = code;
    }
}

const fail = (status, code, message) => {
    throw new ApiError(status, code, message);
}

const handleError = (res, error) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "Booking conflict",
      },
    });
  }

  if (
    error.code === 112 ||
    error.code === 117 ||
    error.hasErrorLabel?.("TransientTransactionError") ||
    error.hasErrorLabel?.("UnknownTransactionCommitResult")
  ) {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "Booking operation conflicted with another update",
      },
    });
  }

  if (error.name === "ValidationError" ||
      error.name === "CastError") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid booking data",
      },
    });
  }

  console.error("Booking error:", error);

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Booking operation failed",
    },
  });
};

const isValidId = (value) =>
  typeof value === "string" &&
  mongoose.isValidObjectId(value);

const SLOT_MS = 30 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const validateBookingTime = (startTime, endTime) => {
  if (
    typeof startTime !== "string" ||
    typeof endTime !== "string"
  ) {
    fail(400, "VALIDATION_ERROR", "Dates must be strings");
  }

  const utcTimestampRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

  if (
    !utcTimestampRegex.test(startTime) ||
    !utcTimestampRegex.test(endTime)
  ) {
    fail(
      400,
      "VALIDATION_ERROR",
      "Dates must be ISO 8601 UTC timestamps"
    );
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    fail(400, "VALIDATION_ERROR", "Invalid booking dates");
  }

  const now = Date.now();
  const duration = end.getTime() - start.getTime();

  if (
    start.getTime() <= now ||
    start.getTime() > now + 30 * DAY_MS
  ) {
    fail(
      400,
      "VALIDATION_ERROR",
      "Start time must be within the next 30 days"
    );
  }

  if (
    duration < SLOT_MS ||
    duration > 8 * SLOT_MS ||
    duration % SLOT_MS !== 0
  ) {
    fail(
      400,
      "VALIDATION_ERROR",
      "Duration must be 30–240 minutes in 30-minute steps"
    );
  }

  // Bookings must start and end on UTC 30-minute boundaries.
  if (
    start.getTime() % SLOT_MS !== 0 ||
    end.getTime() % SLOT_MS !== 0
  ) {
    fail(
      400,
      "VALIDATION_ERROR",
      "Times must align to 30-minute UTC boundaries"
    );
  }

  return { start, end };
};

const runTransaction = async (callback) => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(
      async () => callback(session)
    );
  } finally {
    await session.endSession();
  }
};

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const data = req.body;

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      fail(400, "VALIDATION_ERROR", "Invalid request body");
    }

    const {
      resourceId,
      ticketId = null,
      startTime,
      endTime,
      purpose,
    } = data;

    if (!isValidId(resourceId)) {
      fail(400, "VALIDATION_ERROR", "Invalid resource ID");
    }

    if (ticketId !== null && !isValidId(ticketId)) {
      fail(400, "VALIDATION_ERROR", "Invalid ticket ID");
    }

    if (
      typeof purpose !== "string" ||
      purpose.trim().length < 5 ||
      purpose.trim().length > 200
    ) {
      fail(
        400,
        "VALIDATION_ERROR",
        "Purpose must contain 5–200 characters"
      );
    }

    const { start, end } =
      validateBookingTime(startTime, endTime);

    // These values come from the authenticated user and server rules.
    const userId = req.user._id;

    const booking = await runTransaction(async (session) => {
      // Incrementing the user lock serializes a user's concurrent bookings.
      const userLock = await User.updateOne(
        { _id: userId },
        { $inc: { bookingVersion: 1 } },
        { session }
      );

      if (userLock.matchedCount !== 1) {
        fail(401, "UNAUTHENTICATED", "User not found");
      }

      // Incrementing the resource lock serializes competing reservations.
      const resourceLock = await Resource.updateOne(
        { _id: resourceId, isActive: true },
        { $inc: { bookingVersion: 1 } },
        { session }
      );

      if (resourceLock.matchedCount !== 1) {
        fail(
          404,
          "NOT_FOUND",
          "Resource not found or inactive"
        );
      }

      if (ticketId !== null) {
        const ticketExists = await Ticket.exists({
          _id: ticketId,
        }).session(session);

        if (!ticketExists) {
          fail(404, "NOT_FOUND", "Ticket not found");
        }
      }

      const now = new Date();

      // A user can keep at most three future active bookings.
      const activeCount = await Booking.countDocuments({
        userId,
        status: { $in: BLOCKING_BOOKING_STATUSES },
        startTime: { $gt: now },
      }).session(session);

      if (activeCount >= 3) {
        fail(
          409,
          "CONFLICT",
          "Maximum 3 future bookings allowed"
        );
      }

      // Prevent overlapping reservations for the requested resource.
      const conflict = await Booking.findOne({
        resourceId,
        status: { $in: BLOCKING_BOOKING_STATUSES },
        startTime: { $lt: end },
        endTime: { $gt: start },
      }).session(session);

      if (conflict) {
        fail(
          409,
          "CONFLICT",
          "Resource already booked for this time"
        );
      }

      const [created] = await Booking.create(
        [{
          resourceId,
          userId,
          ticketId,
          startTime: start,
          endTime: end,
          purpose: purpose.trim(),
          status: "PENDING",
        }],
        { session }
      );

      return created;
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const filter = {
      userId: req.user._id,
    };
    const { status } = req.query;

    if (status !== undefined) {
      if (typeof status !== "string" || !BOOKING_STATUSES.includes(status)) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid booking status",
          },
        });
      }

      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate("resourceId", "name type capacity isActive")
      .sort({ startTime: 1, _id: 1 })
      .lean();

    return res.status(200).json({ bookings });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("resourceId", "name type capacity")
      .populate("userId", "name email role")
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({ bookings });
  } catch (error) {
    return handleError(res, error);
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      fail(400, "VALIDATION_ERROR", "Invalid booking ID");
    }

    const booking = await runTransaction(async (session) => {
      const existing = await Booking.findById(id)
        .session(session);

      if (!existing) {
        fail(404, "NOT_FOUND", "Booking not found");
      }

      if (existing.startTime <= new Date()) {
        fail(
          409,
          "CONFLICT",
          "Cannot modify a booking after its start time"
        );
      }

      // A regular user can only cancel their own booking.
      if (
        existing.userId.toString() !==
        req.user._id.toString()
      ) {
        fail(403, "FORBIDDEN", "Not your booking");
      }

      if (!BLOCKING_BOOKING_STATUSES.includes(existing.status)) {
        fail(
          409,
          "CONFLICT",
          "Booking cannot be cancelled"
        );
      }

      // Update the resource lock so availability checks stay synchronized.
      const resourceLock = await Resource.updateOne(
        { _id: existing.resourceId },
        { $inc: { bookingVersion: 1 } },
        { session }
      );

      if (resourceLock.matchedCount !== 1) {
        fail(404, "NOT_FOUND", "Resource not found");
      }

      existing.status = "CANCELLED";
      await existing.save({ session });

      return existing;
    });

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const decideBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, decisionNote } = req.body ?? {};

    if (!isValidId(id)) {
      fail(400, "VALIDATION_ERROR", "Invalid booking ID");
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      fail(
        400,
        "VALIDATION_ERROR",
        "Decision must be APPROVED or REJECTED"
      );
    }

    if (
      status === "REJECTED" &&
      (
        typeof decisionNote !== "string" ||
        decisionNote.trim().length < 5 ||
        decisionNote.trim().length > 200
      )
    ) {
      fail(
        400,
        "VALIDATION_ERROR",
        "Rejection requires a 5–200 character note"
      );
    }

    const booking = await runTransaction(async (session) => {
      const existing = await Booking.findById(id)
        .session(session);

      if (!existing) {
        fail(404, "NOT_FOUND", "Booking not found");
      }

      if (existing.startTime <= new Date()) {
        fail(
          409,
          "CONFLICT",
          "Cannot modify a booking after its start time"
        );
      }

      if (existing.status !== "PENDING") {
        fail(
          409,
          "CONFLICT",
          "Only pending bookings can be decided"
        );
      }

      // Update the resource lock after an admin changes its booking status.
      const resourceLock = await Resource.updateOne(
        { _id: existing.resourceId },
        { $inc: { bookingVersion: 1 } },
        { session }
      );

      if (resourceLock.matchedCount !== 1) {
        fail(404, "NOT_FOUND", "Resource not found");
      }

      existing.status = status;
      existing.decisionNote =
        status === "REJECTED"
          ? decisionNote.trim()
          : null;

      await existing.save({ session });
      return existing;
    });

    return res.status(200).json({
      message: `Booking ${status.toLowerCase()} successfully`,
      booking,
    });
  } catch (error) {
    return handleError(res, error);
  }
};