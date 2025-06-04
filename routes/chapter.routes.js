"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chapter_controller_1 = __importDefault(require("../controller/chapter.controller"));
const admin_middleware_1 = require("../middleware/admin_middleware");
const chapterRouter = (0, express_1.Router)();
const chapterController = new chapter_controller_1.default();
chapterRouter.get("/", chapterController.getChapters);
chapterRouter.get("/:id", chapterController.getChapterById);
chapterRouter.post("/", admin_middleware_1.adminMiddleware, chapterController.handleFileUpload, chapterController.uploadChapters);
exports.default = chapterRouter;
