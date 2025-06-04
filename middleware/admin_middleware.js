"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminMiddleware = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Unauthorized access"
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.decode(token);
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
};
exports.adminMiddleware = adminMiddleware;
