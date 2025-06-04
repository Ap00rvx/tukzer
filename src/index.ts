import express, { Request, Response } from 'express';
import connectDatabase from './database/dbConnection';
import chapterRouter from './routes/chapter.routes';
import { rateLimitMiddleware } from './middleware/rate_limitter';
import userRouter from './routes/user.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
connectDatabase();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.use(rateLimitMiddleware);
app.use('/api/v1/chapters', chapterRouter);
app.use('/api/v1/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




