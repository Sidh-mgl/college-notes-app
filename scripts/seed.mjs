import mongoose from "mongoose";
import User from "../models/User.js";
import { hashPassword } from "../lib/password.js";
import { loadEnv } from "./load-env.mjs";

loadEnv();

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found in environment variables.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@college.com";
    const password = process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "adminpassword123";
    const name = process.env.SEED_ADMIN_NAME || process.env.ADMIN_USERNAME || "Super Admin";

    const existing = await User.findOne({ email });
    if (existing) {
      existing.name = existing.name || name;
      existing.role = "superadmin";
      existing.isApproved = true;
      await existing.save();
      console.log(`Existing user ${email} is now an approved superadmin.`);
      process.exit(0);
    }

    const hashedPassword = await hashPassword(password);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "superadmin",
      isApproved: true,
    });

    console.log(`Superadmin user created successfully: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
