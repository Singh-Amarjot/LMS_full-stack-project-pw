// creating user model
// importing mongoose
import mongoose from "mongoose";
// importing bcrypt
import bcrypt from "bcryptjs";
// importing jwt
import jwt from "jsonwebtoken";
// importing crypto
import crypto from "crypto";

// creating userSchema
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: "String",
      required: [true, "name is required"],
      minLength: [5, "name should have atleast 5 characters "],
      maxLength: [50, "name should have atmost 50 characters "],
      lowercase: true,
      trim: true,
    },
    email: {
      type: "String",
      required: [true, "email is required"],
      lowercase: true,
      trim: true,
      unique: [true, "email should be unique"],
      // regex for matching // email validation
      match: [process.env.EMAIL_REGEX, "please fill in a valid email address"],
    },
    password: {
      type: "String",
      required: [true, "password is required "],
      minLength: [8, "password should be atleast 8 characters long "],
      select: false, // only provide password if explicitly asked
    },
    avatar: {
      public_id: {
        type: "String",
      },
      secure_url: {
        type: "String",
      },
    },
    role: {
      type: "String",
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// setting up the hashing mechanism
userSchema.pre("save", async function (next) {
  if (!this.isModified(this.password)) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// setting up custom methods
userSchema.methods = {
  generateJWTToken: function () {
    return jwt.sign(
      {
        id: this._id,
        email: this.email,
        password: this.password,
        role: this.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
  },
  comparePassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
  generatePasswordResetToken: async function () {
    // creating a reset token using crypto
    const resetToken = crypto.randomBytes(20).toString("hex");
    // encrypting and saving the resetToken in database
    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    // setting forgotPassword expiry
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    return resetToken;
  },
};

// creating userModel
const userModel = mongoose.model("user", userSchema);

// exporting userModel
export default userModel;
