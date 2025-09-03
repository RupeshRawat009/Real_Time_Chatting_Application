// This file sets up the API routes for user-related actions like signup, login, and profile updates.

import express from "express";
import { checkAuth, login, signup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// Route for user registration
userRouter.post("/signup", signup);

// Route for user login
userRouter.post("/login", login);

// Route for updating user profile (protected by authentication middleware)
userRouter.put("/update-profile", protectRoute, updateProfile);

// Route to check user authentication status (protected)
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;
