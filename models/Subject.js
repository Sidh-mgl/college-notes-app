import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);
