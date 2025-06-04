import UserModel from "../model/user.model";
import jwt from "jsonwebtoken";
import { Request, Response,NextFunction } from "express";


export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
             res.status(401).json({
                success: false,
                message: "Unauthorized access"
            }); 
            return;
        }
        const decoded = jwt.decode(token) as { userId: string; email: string; role: string } | null;

        if (!decoded || decoded.role !== "admin") {
            res.status(403).json({
                success: false,
                message: "Forbidden: Admin access required"
            });
            return;
        }

        next();

    }
    catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}