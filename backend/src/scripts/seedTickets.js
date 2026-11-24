import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ticket from "../models/Ticket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const tickets = [
  {
    externalId: "TKT-001",
    subject: "Payment deducted twice",
    body: "My payment was charged twice for the same subscription.",
    autoCategory: "BILLING",
    category: "BILLING",
    priority: "HIGH",
    status: "OPEN",
  },
  {
    externalId: "TKT-002",
    subject: "Refund not received",
    body: "I requested a refund last week but have not received it.",
    autoCategory: "BILLING",
    category: "BILLING",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
  },
  {
    externalId: "TKT-003",
    subject: "Incorrect invoice details",
    body: "The company name is incorrect on my latest invoice.",
    autoCategory: "BILLING",
    category: "BILLING",
    priority: "LOW",
    status: "RESOLVED",
  },

  {
    externalId: "TKT-004",
    subject: "Application crashes on startup",
    body: "The application crashes whenever I open the dashboard.",
    autoCategory: "BUG",
    category: "BUG",
    priority: "URGENT",
    status: "OPEN",
  },
  {
    externalId: "TKT-005",
    subject: "Search button not responding",
    body: "Clicking the search button does not return any results.",
    autoCategory: "BUG",
    category: "BUG",
    priority: "HIGH",
    status: "IN_PROGRESS",
  },
  {
    externalId: "TKT-006",
    subject: "Profile picture not updating",
    body: "My profile picture remains unchanged after uploading a new image.",
    autoCategory: "BUG",
    category: "BUG",
    priority: "LOW",
    status: "CLOSED",
  },

  {
    externalId: "TKT-007",
    subject: "Request dark mode",
    body: "Please add a dark mode option to the application settings.",
    autoCategory: "FEATURE_REQUEST",
    category: "FEATURE_REQUEST",
    priority: "LOW",
    status: "OPEN",
  },
  {
    externalId: "TKT-008",
    subject: "Export reports to PDF",
    body: "We need an option to download generated reports as PDF files.",
    autoCategory: "FEATURE_REQUEST",
    category: "FEATURE_REQUEST",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
  },
  {
    externalId: "TKT-009",
    subject: "Add email notifications",
    body: "Please add email notifications when ticket status changes.",
    autoCategory: "FEATURE_REQUEST",
    category: "FEATURE_REQUEST",
    priority: "HIGH",
    status: "RESOLVED",
  },

  {
    externalId: "TKT-010",
    subject: "Unable to log in",
    body: "I cannot log in even though my username and password are correct.",
    autoCategory: "LOGIN",
    category: "LOGIN",
    priority: "URGENT",
    status: "OPEN",
  },
  {
    externalId: "TKT-011",
    subject: "Password reset email missing",
    body: "I requested a password reset but did not receive the email.",
    autoCategory: "LOGIN",
    category: "LOGIN",
    priority: "HIGH",
    status: "IN_PROGRESS",
  },
  {
    externalId: "TKT-012",
    subject: "Account locked after failed attempts",
    body: "My account was locked after multiple unsuccessful login attempts.",
    autoCategory: "LOGIN",
    category: "LOGIN",
    priority: "MEDIUM",
    status: "CLOSED",
  },

  {
    externalId: "TKT-013",
    subject: "Package delivery delayed",
    body: "My package has not arrived even though the delivery date has passed.",
    autoCategory: "DELIVERY",
    category: "DELIVERY",
    priority: "HIGH",
    status: "OPEN",
  },
  {
    externalId: "TKT-014",
    subject: "Incorrect delivery address",
    body: "The delivery address on my order is incorrect and needs updating.",
    autoCategory: "DELIVERY",
    category: "DELIVERY",
    priority: "URGENT",
    status: "IN_PROGRESS",
  },
  {
    externalId: "TKT-015",
    subject: "Order delivered successfully",
    body: "My package was delivered successfully and the issue is resolved.",
    autoCategory: "DELIVERY",
    category: "DELIVERY",
    priority: "LOW",
    status: "CLOSED",
  },
];

async function seedTickets() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Ensure indexes, including unique externalId.
    await Ticket.init();

    const operations = tickets.map((ticket) => ({
      updateOne: {
        filter: { externalId: ticket.externalId },
        update: {
          $setOnInsert: {
            ...ticket,
            isHumanOverride: false,
            isReviewed: false,
            assigneeId: null,
          },
        },
        upsert: true,
      },
    }));

    const result = await Ticket.bulkWrite(operations);

    console.log("Ticket seeding completed");
    console.log(`Inserted: ${result.upsertedCount}`);
    console.log(`Existing: ${tickets.length - result.upsertedCount}`);
    console.log(`Total tickets in DB: ${await Ticket.countDocuments()}`);
  } catch (error) {
    console.error("Ticket seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedTickets();
