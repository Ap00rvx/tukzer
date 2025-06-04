import mongoose from "mongoose";
import ChapterInterface from "../interface/chapter";

const chapterSchema = new mongoose.Schema<ChapterInterface>({
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    class: { type: String, required: true },
    unit: { type: String, required: true },
    yearWiseQuestionCount: {
        type: Map,
        of: Number,
        default: {}
    },
    questionSolved: { type: Number, default: 0 },
    status: { type: String, default: "Not Started" },
    isWeakChapter: { type: Boolean, default: false }
});

const Chapter = mongoose.model<ChapterInterface>("Chapter", chapterSchema);

export default Chapter;