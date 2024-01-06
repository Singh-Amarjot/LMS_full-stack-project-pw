import { v2 as cloudinary } from "cloudinary";
// importing the fs module
import fs from "fs";
// importing AppError utility
import AppError from "./error.util.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// setting up uploader function

const uploader = async (user, course, lecture, file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "lms",
      width: 250,
      height: 250,
      gravity: "faces",
      crop: "fill",
    });

    if (result) {
      console.log("file uploaded to the cloud successfully ");
      if (user) {
        const avatarData = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };

        // remove file from server
        fs.unlinkSync(`uploads/${file.filename}`);
        return avatarData;
      }
      if (course) {
        const thumbnailData = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };

        // remove file from server
        fs.unlinkSync(`uploads/${file.filename}`);

        return thumbnailData;
      }
      if (lecture) {
        const thumbnailData = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };

        // remove file from server
        fs.unlinkSync(`uploads/${file.filename}`);

        return thumbnailData;
      }
    }
  } catch (error) {
    return new Error(error.message);
  }
};

// exporting uploader
export default uploader;
