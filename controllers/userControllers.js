// importing userModel
import User from "../models/userModel.js";
// importing AppError utility
import AppError from "../utils/error.util.js";
import sendMail from "../utils/mail.util.js";
// importing crypto
import crypto from "crypto";
import uploader from "../utils/cloudinary.util.js";

// setting up cookie options
const cookieOptions = {
  httpOnly: true,
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// setting up userControllers
const register = async (req, res, next) => {
  try {
    // extracting data from request body
    const { fullName, email, password } = req.body;

    // checking if all the fields are provided
    if (!fullName || !email || !password) {
      // using the AppError utility
      return next(new AppError("all credentials are required", 400));
    }
    // checking if the user exists or not
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("user already exists", 400));
    }

    // creating user

    const user = await User.create({
      fullName,
      email,
      password,
      avatar: {
        secure_url: "dummy url",
        public_id: email,
      },
    });

    // TODO:file upload
    if (req.file) {
      const avatarData = await uploader(user, null, null, req.file);

      // updating public_id and secure_url
      user.avatar.secure_url = avatarData.secure_url;
      user.avatar.public_id = avatarData.public_id;
    }

    // saving user
    await user.save();
    // generating and passing jwtToken in cookie

    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    // nullyfying the password
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User has been registered successfully ",
      user,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// login functionality
const login = async (req, res, next) => {
  try {
    // extracting info from the request body
    const { email, password } = req.body;

    // checking if all the fields have been provided
    if (!email || !password) {
      return next(new AppError("all the fields are required", 400));
    }

    // finding user with the given email and password
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.comparePassword(password)) {
      return next(new AppError("email or password is incorrect ", 400));
    }

    // generating jwt Token

    const token = user.generateJWTToken();

    // passing the token to cookie
    res.cookie("token", token, cookieOptions);

    // nullyfying the password
    user.password = undefined;

    // sending success response
    res.status(200).json({
      success: true,
      message: "login successfull",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// logout functionality
const logout = async (req, res, next) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 0,
  };
  try {
    // nullyfying the token in cookies
    res.cookie("token", null, cookieOptions);

    // sending response to success
    res.status(200).json({
      success: true,
      message: "logout successfull",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// getProfile functionality
const getProfile = async (req, res, next) => {
  try {
    // extracting userInfo from the request object
    const userId = req.user.id;
    // finding user with id
    const user = await User.findById(userId);
    res.status(200).json({
      succes: true,
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// forgot password controller
const forgotPassword = async (req, res, next) => {
  // getting email address from request.body object
  const { email } = req.body;

  // checking if the email has been provided or not
  if (!email) {
    return next(new AppError("please provide an email adress ", 400));
  }

  // checking if any user exists with the same email in the database or not
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("no user found with this email", 400));
  }

  try {
    // generating a resetPasswordToken

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    // creating resetPasswordURL and sending it to the email address provided
    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // setting up mail functionality
    const subject = "reset password ";
    const mail = `click to reset your password ${resetPasswordURL}`;

    // using the sendMail utility

    await sendMail(subject, message, email);

    res.status(200).json({
      success: true,
      message:
        "reset URL has been sent to the provided email address please check your mailBox",
    });
  } catch (err) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();
    return next(new AppError(err.message, 400));
  }
};

// RESET PASSWORD CONTROLLER
const resetPassword = async (req, res, next) => {
  // extracting resetToken from the params
  const { resetToken } = req.params;

  // extracting password from body
  const { password } = req.body;

  // checking if the token and password have been provided or not
  if (!resetToken || !password) {
    return next(new AppError("please provide all the credentials", 400));
  }
  try {
    // veryfying the resetToken
    const forgotPasswordToken = await crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // fiinding user
    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("invalid token", 400));
    }

    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "password has been reset successfully ",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

// update userINfo by id
const updateUserInfoById = async (req, res, next) => {
  // extracting userId from req.user object
  const { id } = req.user;
  // extracting userdata from req.body object
  const data = req.body;

  // checking if data has been provided
  if (!data) {
    return next(new AppError("please provide data to update the user ", 400));
  }

  try {
    // finding user with the given id
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("sorry user does not exist  ", 400));
    }

    // update user with the new data
    await User.findByIdAndUpdate(id, { $set: data }, { runValidators: true });
    await user.save();

    res.status(200).json({
      success: true,
      message: "user updated successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
// exporting userControllers
export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  updateUserInfoById,
};
