import mongoose from "mongoose";
import bcrypt from "bcrypt";

// User Model definition since we can't easily import the Next.js one in this pure Node script without transpilation if we use @/ syntax natively
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found in environment variables.");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = "admin@college.com";
    const password = "adminpassword123";

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin user ${email} already exists.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Admin user created successfully! Email: ${email}, Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
