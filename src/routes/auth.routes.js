import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

// POST /api/auth/register

authRouter.post("/register", authController.register);

// POST /api/auth/login

authRouter.post("/login", authController.login);

// GET /api/auth/get-me 

authRouter.get("/get-me", authController.getMe);


// // GET /api/auth/refresh-token

authRouter.get("/refresh-token", authController.refreshToken);

// // Get /api/auth/logout

authRouter.get("/logout", authController.logout);

// Get /api/auth/logout-all

authRouter.get("/logout-all", authController.logoutAll);

export default authRouter;
