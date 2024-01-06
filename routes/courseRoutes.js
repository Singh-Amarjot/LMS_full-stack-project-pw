// imorting express
import express from "express";
import {
  addLecturesById,
  createCourse,
  deleteCourseById,
  deleteLectureById,
  getAllCourses,
  getCourseById,
  updateCourseById,
} from "../controllers/courseControllers.js";
import isAuthorized from "../middlewares/authorization.middleware.js";
import isLoggedIn from "../middlewares/jwtAuth.js";

// creating roputer from express
const router = express.Router();

// importing multer middleware
import upload from "../middlewares/multer.middleware.js";

// importing controllers

// handling routes
router
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedIn,
    isAuthorized("ADMIN"),
    upload.single("thumbnail"),
    createCourse
  );

router
  .route("/:id")
  .get(isLoggedIn, getCourseById)
  .delete(isLoggedIn, isAuthorized("ADMIN"), deleteCourseById)
  .put(isLoggedIn, isAuthorized("ADMIN"), updateCourseById);

router.put(
  "/add-lecture/:id",
  isLoggedIn,
  isAuthorized("ADMIN"),
  upload.single("lectureThumbnail"),
  addLecturesById
);

router.put(
  "/delete-lecture/:id",
  isLoggedIn,
  isAuthorized("ADMIN"),
  deleteLectureById
);

// exporting router
export default router;
