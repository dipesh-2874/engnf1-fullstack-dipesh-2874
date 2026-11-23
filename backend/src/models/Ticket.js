
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },

    autoCategory: {
      type: String,
      required: true,
      enum: [
        "BILLING",
        "BUG",
        "FEATURE_REQUEST",
        "LOGIN",
        "DELIVERY",
      ],
      immutable: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "BILLING",
        "BUG",
        "FEATURE_REQUEST",
        "LOGIN",
        "DELIVERY",
      ],
    },

    isHumanOverride: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
      ],
      default: "OPEN",
      required: true,
    },

    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ status: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ assigneeId: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
