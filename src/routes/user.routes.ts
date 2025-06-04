import userController from "../controller/user.controller";
import { Router } from "express";

const userRouter = Router();

userRouter.post("/create", userController.createUser);
userRouter.post("/login", userController.loginUser);


export default userRouter;

