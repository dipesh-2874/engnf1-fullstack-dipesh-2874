
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root .env: backend/src/scripts -> project root
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const accounts = [
      {
        name: "Admin Lead",
        email: "admin@triagesync.test",
        password: "Admin@123",
        role: "ADMIN",
      },
      {
        name: "Agent Demo",
        email: "user@triagesync.test",
        password: "User@123",
        role: "USER",
      },
    ];

    for (const account of accounts) {
      const existingUser = await User.findOne({
        email: account.email,
      });

      if (existingUser) {
        console.log(`Already exists: ${account.email}`);
        continue;
      }

      const passwordHash = await bcrypt.hash(
        account.password,
        10
      );

      await User.create({
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
      });

      console.log(`Created ${account.role}: ${account.email}`);
    }

    console.log("User seeding completed");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedUsers();
