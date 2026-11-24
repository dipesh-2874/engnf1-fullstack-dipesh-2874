
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Resource from "../models/Resource.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load root .env or backend .env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const resources = [
  {
    name: "Conference Room A",
    type: "ROOM",
    capacity: 12,
    isActive: true,
  },
  {
    name: "Meeting Room B",
    type: "ROOM",
    capacity: 6,
    isActive: true,
  },
  {
    name: "Computer Lab 1",
    type: "LAB",
    capacity: 30,
    isActive: true,
  },
  {
    name: "Electronics Lab 2",
    type: "LAB",
    capacity: 20,
    isActive: false,
  },
  {
    name: "3D Printer",
    type: "EQUIPMENT",
    capacity: 1,
    isActive: true,
  },
  {
    name: "Digital Oscilloscope",
    type: "EQUIPMENT",
    capacity: 1,
    isActive: true,
  },
];

const seedResources = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    let inserted = 0;
    let skipped = 0;

    for (const resource of resources) {
      const existing = await Resource.findOne({
        name: resource.name,
      });

      if (existing) {
        skipped++;
        console.log(`Skipped: ${resource.name}`);
        continue;
      }

      await Resource.create(resource);

      inserted++;
      console.log(`Created: ${resource.name}`);
    }

    console.log("\nResource seeding completed");
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped: ${skipped}`);
    console.log(
      `Total resources: ${await Resource.countDocuments()}`
    );
  } catch (error) {
    console.error("Resource seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedResources();
