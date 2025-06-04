import multer from 'multer';
import { Request } from 'express';

// Configure Multer to use memory storage (no disk storage)
export const storage = multer.memoryStorage();

export const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/json') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('chaptersFile');