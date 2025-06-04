import { Router } from "express"
import ChapterController from "../controller/chapter.controller";
import { adminMiddleware } from "../middleware/admin_middleware";

const chapterRouter = Router();

const chapterController = new ChapterController();


chapterRouter.get("/", chapterController.getChapters);
chapterRouter.get("/:id", chapterController.getChapterById);
chapterRouter.post("/", adminMiddleware,chapterController.handleFileUpload,chapterController.uploadChapters);


export default chapterRouter;