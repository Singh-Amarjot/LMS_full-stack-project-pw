// setting up userRoutes

// importing userControllers
import {
  forgotPassword,
  getProfile,
  login,
  logout,
  register,
  resetPassword,
  updateUserInfoById,
} from "../controllers/userControllers.js";

// importing router from express

import express from "express";
import isLoggedIn from "../middlewares/jwtAuth.js";
import upload from "../middlewares/multer.middleware.js";

// creating router
const router = express.Router();

// handling routes
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/logout", isLoggedIn, logout);
router.get("/me", isLoggedIn, getProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.put("/update-userInfo", isLoggedIn, updateUserInfoById);

// expoting router

export default router;
