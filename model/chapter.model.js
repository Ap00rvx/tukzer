"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chapterSchema = new mongoose_1.default.Schema({
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
const Chapter = mongoose_1.default.model("Chapter", chapterSchema);
exports.default = Chapter;
