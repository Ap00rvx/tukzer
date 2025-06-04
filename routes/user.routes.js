"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = __importDefault(require("../controller/user.controller"));
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
userRouter.post("/create", user_controller_1.default.createUser);
userRouter.post("/login", user_controller_1.default.loginUser);
exports.default = userRouter;
