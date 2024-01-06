// importing courseModel
import Course from "../models/courseModel.js";
// importing AppError utility
import AppError from "../utils/error.util.js";

// importing cloudinary utility
import uploader from "../utils/cloudinary.util.js";
// setting up courseControllers

const createCourse = async (req, res, next) => {
  // extracting course details from the request object
  const { title, description, category, createdBy } = req.body;

  // checking if all the credentials have been provided or not
  if (!title || !description || !category || !createdBy) {
    return next(new AppError("all the credentials are required ", 400));
  }

  // creating a course
  try {
    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        secure_url: "dummy url",
        public_id: "dummy public id ",
      },
    });

    if (!course) {
      return next(new AppError("course could not be created  ", 400));
    }

    // setting up the file upload mechanism for the thumbnails
    if (req.file) {
      const thumbnailData = await uploader(null, course, null, req.file);

      course.thumbnail.secure_url = thumbnailData.secure_url;
      course.thumbnail.public_id = thumbnailData.public_id;
    }

    await course.save();
    res.status(200).json({
      success: true,
      message: "course has been created successfully ",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// getAllCourses
const getAllCourses = async (req, res, next) => {
  // fetching all courses
  try {
    const courses = await Course.find({}).select("-lectures");

    if (!courses) {
      return next(
        new AppError("sorry courses could not be fetched please try again", 400)
      );
    }

    res.status(200).json({
      success: true,
      message: "all the availabole courses are ",
      courses,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// getCourseBYID
const getCourseById = async (req, res, next) => {
  // extracting id from params object
  const { id } = req.params;

  // checking if id has been provided
  if (!id) {
    next(new AppError("please provide the course id ", 400));
  }

  try {
    // fetching the couse with the particular id
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("course not found ", 400));
    }

    res.status(200).json({
      success: true,
      message: "course got found ",
      course,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// deleteCourse
const deleteCourseById = async (req, res, next) => {
  // extracting id from params
  const { id } = req.params;

  // checking if id has been provided
  if (!id) {
    next(new AppError("please provide the course id ", 400));
  }

  try {
    // removing the course
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("course not found ", 400));
    }
    await Course.findByIdAndDelete(id);

    //    await course.save();

    res.status(200).json({
      success: true,
      message: "course deleted successfully ",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// update course
const updateCourseById = async (req, res, next) => {
  // extracting course id from the req.params object
  const { id } = req.params;

  try {
    // checking if id has been provided or not
    if (!id) {
      return next(new AppError("please provide the course id ", 400));
    }

    // checking if anycourse with the given id exists in the database or not
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("no course exists with the provided id ", 400));
    }

    // updating the course detils
    await Course.findByIdAndUpdate(
      id,
      { $set: req.body },
      { runValidators: true }
    );

    //saving the course
    await course.save();
    res.status(200).json({
      success: true,
      message: "course updated successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// add lectures
const addLecturesById = async (req, res, next) => {
  // getting course id from the req.params object
  const { id } = req.params;

  // getting lecture info from the req.body object
  const { lectureTitle, lectureDescription } = req.body;

  // checking if id has been provided or not
  if (!id) {
    return next(
      new AppError("please provide the course id to add lectures ", 400)
    );
  }
  // checking if the lecture info is provided or not
  if (!lectureTitle || !lectureDescription) {
    return next(new AppError("all fields are required  ", 400));
  }
  try {
    // checking if any course exists with the given id in the database

    const course = await Course.findById(id);

    if (!course) {
      return next(
        new AppError("sorry no course exists with the given id", 400)
      );
    }
    // adding lectures
    const lectureData = {
      lectureTitle,
      lectureDescription,
      lectureThumbnail: {
        public_id: "dummy public id",
        secure_url: "dummy secure_url",
      },
    };

    const lecture = course.lectures;
    // file upload   // needs to be repaired
    if (req.file) {
      // setting up the file upload mechanism for the thumbnails

      const thumbnailData = await uploader(null, null, lecture, req.file);

      // updating lectureThumbnail data
      lectureData.lectureThumbnail.public_id = thumbnailData.public_id;
      lectureData.lectureThumbnail.secure_url = thumbnailData.secure_url;
    }
    // pushing lectureDATA into lectures array
    await Course.updateOne(
      { _id: id },
      { $push: { lectures: lectureData } },
      { runValidators: true }
    );

    // updating lecture count
    await Course.updateOne(
      { _id: id },
      { $set: { numberOfLectures: course.lectures.length + 1 } },
      { runValidators: true }
    );

    await course.save();

    res.status(200).json({
      success: true,
      message: "lecture added successfullly",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// delete lecture    // pendin ????????????????????
const deleteLectureById = async (req, res, next) => {
  // getting course id from the req.params object
  const { id } = req.params;

  // checking if id has been provided or not
  if (!id) {
    return next(
      new AppError("please provide the course id to delete lectures ", 400)
    );
  }

  // getting lecture id from the req.body object
  const { lectureId } = req.body;

  // checking if lecture id has been provided or not
  if (!lectureId) {
    return next(
      new AppError("please provide the lecture id to delete the lecture  ", 400)
    );
  }
  // findinf course with the course id
  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError("course not found ", 400));
  }

  try {
    // ppulling lecture from the array

    await Course.updateOne(
      { _id: id },
      { $pull: { lectures: { _id: lectureId } } }
    );

    // updating lecture count
    await Course.updateOne(
      { _id: id },
      { $set: { numberOfLectures: course.lectures.length - 1 } },
      { runValidators: true }
    );

    await course.save();

    res.status(200).json({
      success: true,
      message: "lecture deleted successfullly",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
// exporting controllers
export {
  createCourse,
  getAllCourses,
  getCourseById,
  deleteCourseById,
  updateCourseById,
  addLecturesById,
  deleteLectureById,
};
