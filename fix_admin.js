import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  isApproved: Boolean,
});
const User = mongoose.model("User", UserSchema, "users");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB.");
  
  const res = await User.updateMany({ role: "admin", isApproved: { $ne: true } }, { isApproved: true });
  console.log("Updated users:", res.modifiedCount);
  
  process.exit(0);
}

run();
