import { Request, Response } from 'express';
import Chapter from '../model/chapter.model';
import ChapterInterface from '../interface/chapter';
import { upload } from '../config/multer';
import { Redis } from "@upstash/redis";
import multer from 'multer';


const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

class ChapterController {
  handleFileUpload = (req: Request, res: Response, next: () => void) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message,
        });
      } else if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded or invalid file type',
        });
      }
      if (!req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: 'File buffer is missing; ensure Multer is configured to use memoryStorage',
        });
      }
      next();
    });
  };

  uploadChapters = async (req: Request, res: Response) => {
    try {
      const fileContent = req.file!.buffer.toString('utf-8');
      const chaptersData: any[] = JSON.parse(fileContent);

      const failedChapters: { chapter: any; error: string }[] = [];
      const validChapters: ChapterInterface[] = [];

      for (const chapterData of chaptersData) {
        try {
          if (!chapterData.subject || typeof chapterData.subject !== 'string') {
            throw new Error('Invalid or missing subject');
          }
          if (!chapterData.chapter || typeof chapterData.chapter !== 'string') {
            throw new Error('Invalid or missing chapter');
          }
          if (!chapterData.class || typeof chapterData.class !== 'string') {
            throw new Error('Invalid or missing class');
          }
          if (!chapterData.unit || typeof chapterData.unit !== 'string') {
            throw new Error('Invalid or missing unit');
          }
          if (!chapterData.yearWiseQuestionCount || typeof chapterData.yearWiseQuestionCount !== 'object') {
            throw new Error('Invalid or missing yearWiseQuestionCount');
          }
          for (const [year, count] of Object.entries(chapterData.yearWiseQuestionCount)) {
            if (typeof count !== 'number' || count < 0) {
              throw new Error(`Invalid question count for year ${year}: must be a non-negative number`);
            }
          }
          if (typeof chapterData.questionSolved !== 'number' || chapterData.questionSolved < 0) {
            throw new Error('Invalid or missing questionSolved: must be a non-negative number');
          }
          if (chapterData.status && typeof chapterData.status !== 'string') {
            throw new Error('Invalid status: must be a string');
          }
          if (typeof chapterData.isWeakChapter !== 'boolean') {
            throw new Error('Invalid or missing isWeakChapter: must be a boolean');
          }

          validChapters.push(chapterData as ChapterInterface);
        } catch (error: any) {
          failedChapters.push({
            chapter: chapterData,
            error: error.message || 'Validation failed',
          });
        }
      }

      let successfulUploads = 0;
      if (validChapters.length > 0) {
        try {
          const savedChapters = await Chapter.insertMany(validChapters, { ordered: false });
          successfulUploads = savedChapters.length;
        } catch (error: any) {
          for (const chapterData of validChapters) {
            try {
              await new Chapter(chapterData).save();
              successfulUploads++;
            } catch (saveError: any) {
              failedChapters.push({
                chapter: chapterData,
                error: saveError.message || 'Failed to save chapter',
              });
            }
          }
        }
      }

      await redis.del('chapters:*');
      res.status(200).json({
        success: true,
        message: 'Chapters processed',
        data: {
          totalChapters: chaptersData.length,
          successfulUploads: successfulUploads,
          failedUploads: failedChapters.length,
          failedChapters: failedChapters,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  };

  getChapters = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Extract search parameters from query
      const { class: classQuery, unit, status, weakChapters, subject } = req.query;

      // Normalize search parameters for consistent caching and querying
      const normalizedQuery = {
        class: typeof classQuery === 'string' ? classQuery.toLowerCase() : undefined,
        unit: typeof unit === 'string' ? unit.toLowerCase() : undefined,
        status: typeof status === 'string' ? status.toLowerCase() : undefined,
        subject: typeof subject === 'string' ? subject.toLowerCase() : undefined,
        weakChapters: weakChapters !== undefined ? (weakChapters === 'true' || weakChapters === '1') : undefined,
      };

      // Build the MongoDB query object
      const query: any = {};
      if (normalizedQuery.class) {
        query.class = { $regex: normalizedQuery.class, $options: 'i' };
      }
      if (normalizedQuery.unit) {
        query.unit = { $regex: normalizedQuery.unit, $options: 'i' };
      }
      if (normalizedQuery.status) {
        query.status = { $regex: normalizedQuery.status, $options: 'i' };
      }
      if (normalizedQuery.subject) {
        query.subject = { $regex: normalizedQuery.subject, $options: 'i' };
      }
      if (normalizedQuery.weakChapters !== undefined) {
        query.isWeakChapter = normalizedQuery.weakChapters;
      }

      // Generate a deterministic cache key by sorting query parameters
      const cacheKeyParams = [
        `page:${page}`,
        `limit:${limit}`,
        normalizedQuery.class ? `class:${normalizedQuery.class}` : '',
        normalizedQuery.unit ? `unit:${normalizedQuery.unit}` : '',
        normalizedQuery.status ? `status:${normalizedQuery.status}` : '',
        normalizedQuery.subject ? `subject:${normalizedQuery.subject}` : '',
        normalizedQuery.weakChapters !== undefined ? `weakChapters:${normalizedQuery.weakChapters}` : '',
      ].filter(Boolean).join(':');
      const cacheKey = `chapters:${cacheKeyParams}`;

      // Check Redis cache
      const cachedChapters = await redis.get(cacheKey);
      if (typeof cachedChapters === 'string') {
        const parsedData = JSON.parse(cachedChapters);
        res.status(200).json({
          success: true,
          data: parsedData.chapters,
          pagination: {
            totalPages: Math.ceil(parsedData.totalChapters / limit),
            currentPage: page,
            limit: limit,
          },
        });
        return;
      }

      // Fetch chapters with the search criteria from MongoDB
      const chapters = await Chapter.find(query).skip(skip).limit(limit);
      const totalChapters = await Chapter.countDocuments(query);

      // Cache the result in Redis
      await redis.set(
        cacheKey,
        JSON.stringify({ chapters, totalChapters }),
        { ex: 3600 }
      );

      res.status(200).json({
        success: true,
        data: chapters,
        pagination: {
          totalPages: Math.ceil(totalChapters / limit),
          currentPage: page,
          limit: limit,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  };

  getChapterById = async (req: Request, res: Response) => {
    try {
      const chapterId = req.params.id;
      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        res.status(404).json({
          success: false,
          message: 'Chapter not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: chapter,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  };
}

export default ChapterController;