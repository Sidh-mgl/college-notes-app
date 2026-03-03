import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
