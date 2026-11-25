
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return (
            this.startTime instanceof Date &&
            value instanceof Date &&
            value > this.startTime
          );
        },
        message: "End time must be after start time",
      },
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },

    status: {
      type: String,
      required: true,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    decisionNote: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 200,
      default: null,
      validate: {
        validator: function (value) {
          if (this.status === "REJECTED") {
            return (
              typeof value === "string" &&
              value.trim().length >= 5 &&
              value.trim().length <= 200
            );
          }

          return true;
        },
        message:
          "Rejection note is required (5-200 characters)",
      },
    },
  },
  {
    timestamps: true,
  }
);

// overlapping booking 
bookingSchema.index({
  resourceId: 1,
  status: 1,
  startTime: 1,
  endTime: 1,
});

// user booking limit
bookingSchema.index({
  userId: 1,
  status: 1,
  startTime: 1,
});

// Booking history
bookingSchema.index({
  userId: 1,
  createdAt: -1,
});

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

export default Booking;
