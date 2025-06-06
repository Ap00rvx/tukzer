# Chapter API

A RESTful API for managing educational chapters, built with Node.js, Express, TypeScript, MongoDB, and Redis. Supports retrieving, filtering, and uploading chapters with caching and rate limiting.

## Features
- **RESTful Endpoints**:
  - `GET /api/v1/chapters`: Retrieve chapters with filters (`class`, `unit`, `status`, `weakChapters`, `subject`) and pagination.
  - `GET /api/v1/chapters/:id`: Retrieve a specific chapter by ID.
  - `POST /api/v1/chapters`: Upload chapters from a JSON file (admin-only, with schema validation).
- **Redis Caching**: Caches `GET /api/v1/chapters` results for 1 hour, invalidated on new chapter uploads.
- **Rate Limiting**: Limits to 30 requests per minute per IP using Redis.
- **MongoDB**: Stores chapter data with a defined schema.
- **TypeScript**: Ensures type safety and maintainability.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or via a cloud provider)
- Redis (running locally or via a cloud provider)

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a .env file :
   ```bash
   MONGODB_URI=<your-mongodb-uri>
   REDIS_URL=<your-redis-url>
   JWT_SECRET=<your-jwt-secret>
   PORT=3000
   ```
4. Run server:
   ```bash
    npm start
   ```
# Project Structure
```
project/
├── src/
│   ├── controllers/
│   │   └── chapterController.ts   # API logic
│   ├── models/
│   │   └── chapterModel.ts        # MongoDB schema
│   ├── routes/
│   │   └── chapterRoutes.ts       # API routes
│   ├── middleware/
│   │   ├── authMiddleware.ts      # Admin authentication
│   │   ├── rateLimiter.ts         # Redis rate limiting
│   │   └── uploadMiddleware.ts    # JSON file upload handling
│   ├── config/
│   │   ├── multer.ts         #  Multer conifg
│   │   
│   ├── server.ts                  # Entry point
│   └── interface                   # TypeScript interfaces
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```
## GET /api/v1/chapters
### Query Params: class, unit, status, weakChapters, subject, page, limit
Response:
```
{
  "data": [],
  "pagination": { "page": 1, "limit": 10, "total": 100 },
  "success": true
}
```
Cached: In Redis for 1 hour.

## GET /api/v1/chapters/:id
Response:
```
{ "data": {}, "success": true }
```

## POST /api/v1/chapters
### Headers: Authorization: Bearer <admin_token>
### Body: Form-data with chapters (JSON file)

```
{ "success": [], "failed": [] }
```


## Middleware 
```
authMiddleware.ts: Verifies admin authentication via JWT.
rateLimiter.ts: Limits requests to 30 per minute per IP using Redis.
uploadMiddleware.ts: Handles JSON file uploads for chapter uploads.
```
