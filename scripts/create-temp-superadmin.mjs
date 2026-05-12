import mongoose from "mongoose";
import User from "../models/User.js";
import { hashPassword } from "../lib/password.js";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const email = process.env.TEMP_ADMIN_EMAIL || "legendgamingh2r@gmail.com";
const password = process.env.TEMP_ADMIN_PASSWORD || "legendgamingh2r@gmail.com";
const name = process.env.TEMP_ADMIN_NAME || "Temporary Recovery Admin";
const minutes = Number(process.env.TEMP_ADMIN_MINUTES || 10);
const secret = process.env.RECOVERY_SECRET;
const providedSecret = process.argv[2] || process.env.RECOVERY_SECRET_CONFIRM;

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI not found.");
  process.exit(1);
}

if (!secret || providedSecret !== secret) {
  console.error("Recovery secret is required.");
  process.exit(1);
}

if (!Number.isFinite(minutes) || minutes < 1 || minutes > 60) {
  console.error("TEMP_ADMIN_MINUTES must be between 1 and 60.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);

  const temporaryExpiresAt = new Date(Date.now() + minutes * 60 * 1000);
  const hashedPassword = await hashPassword(password);

  await User.updateOne(
    { email },
    {
      $set: {
        name,
        email,
        password: hashedPassword,
        role: "superadmin",
        isApproved: true,
        isTemporary: true,
        temporaryExpiresAt,
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true, runValidators: true }
  );

  await User.syncIndexes();

  console.log(`Temporary superadmin ready: ${email}`);
  console.log(`Expires at: ${temporaryExpiresAt.toISOString()}`);
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
}
