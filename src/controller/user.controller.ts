import UserModel from "../model/user.model";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


class UserController {
    async createUser(req: Request, res: Response) {
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
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                 res.status(400).json({ 
                    success: false, 
                    message: "User already exists" 
                });
                return; 
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const user = new UserModel({
                email,
                password: hashedPassword,
                role: role || "user" // Default to 'user' role if not specified
            });

            // Save user to database
            await user.save();

            // Generate JWT
            const jwtSecret = process.env.JWT_SECRET || "jai00000";
            
            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                jwtSecret,
                { expiresIn: "1d" }
            );

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
        } catch (error) {
            console.error("Error creating user:", error);
             res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async loginUser(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // Input validation
            if (!email || !password) {
                 res.status(400).json({ 
                    success: false, 
                    message: "Email and password are required" 
                });
                return ; 
            }

            // Find user
            const user = await UserModel.findOne({ email });
            if (!user) {
                 res.status(401).json({ 
                    success: false, 
                    message: "Invalid credentials" 
                });
                return; 
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                 res.status(401).json({ 
                    success: false, 
                    message: "Invalid credentials" 
                });
                return; 
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET || "jai00000",
                { expiresIn: "1d" }
            );

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
        } catch (error) {
            console.error("Error logging in user:", error);
             res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export default new UserController();