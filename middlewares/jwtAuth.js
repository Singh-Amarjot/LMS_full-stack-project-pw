import AppError from "../utils/error.util.js";
// importing jwt
import jwt from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
  // checking if the token exists in cookies
  try {
    const { token } = req.cookies;
    if (!token) {
      return next(new AppError("Unauthorized", 400));
    }

    // verifying the token and extracting user info from it
    const userDetails = await jwt.verify(token, process.env.SECRET_KEY);
    if (!userDetails) {
      return next(new AppError("Unauthorized", 400));
    }
    req.user = userDetails;
    next();
  } catch (error) {
    return new AppError(error.message, 400);
  }
};

// / exporting the functionality
export default isLoggedIn;
