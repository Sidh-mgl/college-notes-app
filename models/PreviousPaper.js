import mongoose from "mongoose";

const PreviousPaperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    year: { type: Number, required: true },
    section: {
        type: String,
        required: true,
        enum: ["Sem 1", "Sem 2", "Sem 3", "Back Paper", "End Sem Paper"]
    },
    pdfUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    downloadCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PreviousPaper || mongoose.model("PreviousPaper", PreviousPaperSchema);
