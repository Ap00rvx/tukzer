"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../model/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserController {
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, role } = req.body;
                // Input validation
                if (!email || !password) {
                    res.status(400).json({
                        success: false,
                        message: "Email and password are required"
                    });
                    return;
                }
                // Check if user already exists
                const existingUser = yield user_model_1.default.findOne({ email });
                if (existingUser) {
                    res.status(400).json({
                        success: false,
                        message: "User already exists"
                    });
                    return;
                }
                // Hash password
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(password, salt);
                // Create new user
                const user = new user_model_1.default({
                    email,
                    password: hashedPassword,
                    role: role || "user" // Default to 'user' role if not specified
                });
                // Save user to database
                yield user.save();
                // Generate JWT
                const jwtSecret = process.env.JWT_SECRET || "jai00000";
                const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "1d" });
                res.status(201).json({
                    success: true,
                    message: "User created successfully",
                    token, // Return token in response body
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role
                    }
                });
            }
            catch (error) {
                console.error("Error creating user:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        });
    }
    loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                // Input validation
                if (!email || !password) {
                    res.status(400).json({
                        success: false,
                        message: "Email and password are required"
                    });
                    return;
                }
                // Find user
                const user = yield user_model_1.default.findOne({ email });
                if (!user) {
                    res.status(401).json({
                        success: false,
                        message: "Invalid credentials"
                    });
                    return;
                }
                // Verify password
                const isMatch = yield bcrypt_1.default.compare(password, user.password);
                if (!isMatch) {
                    res.status(401).json({
                        success: false,
                        message: "Invalid credentials"
                    });
                    return;
                }
                // Generate JWT
                const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || "jai00000", { expiresIn: "1d" });
                res.status(200).json({
                    success: true,
                    message: "Login successful",
                    token, // Return token in response body
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role
                    }
                });
                return;
            }
            catch (error) {
                console.error("Error logging in user:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        });
    }
}
exports.default = new UserController();
