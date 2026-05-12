import mongoose from "mongoose";
import User from "../models/User.js";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const makeSuperadmin = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email: node scripts/make-superadmin.js <email>");
    process.exit(1);
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found in environment variables.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = "superadmin";
    user.isApproved = true;
    await user.save();

    console.log(`Successfully made ${email} a superadmin.`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

makeSuperadmin();
