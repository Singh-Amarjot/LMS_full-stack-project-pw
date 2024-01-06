// importing mongoose
import mongoose from "mongoose";

// creating  courseSchema

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required "],
      minLength: [10, "title should be atleast 10 chracters long"],
      maxLength: [50, "title should be less than 50 characters long "],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required "],
      minLength: [50, "description should be atleast 50 chracters long"],
      maxLength: [200, "description should be less than 200 characters long "],
    },
    category: {
      type: String,
      required: [true, "category is required "],
    },
    thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    lectures: [
      {
        lectureTitle: {
          type: String,
          required: [true, "title is required "],
          minLength: [10, "title should be atleast 10 chracters long"],
          maxLength: [50, "title should be less than 50 characters long "],
        },

        lectureDescription: {
          type: String,
          required: [true, "description is required "],
          minLength: [10, "description should be atleast 10 chracters long"],
          maxLength: [
            100,
            "description should be less than 100 characters long ",
          ],
        },

        lectureThumbnail: {
          public_id: {
            type: String,
            required: true,
          },
          secure_url: {
            type: String,
            required: true,
          },
        },
      },
    ],
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// creating courseModel

const courseModel = mongoose.model("course", courseSchema);

// exporting courseModel
export default courseModel;
