1; // importing AppError utility
import AppError from "../utils/error.util.js";
// setting up the authorization middleware
const isAuthorized =
  (...authorizedRoles) =>
  (req, res, next) => {
    // extracting userRoles from req.user obj
    const { role } = req.user;

    if (!authorizedRoles.includes(role)) {
      return next(
        new AppError("you are not authorized to access this route", 400)
      );
    }

    next();
  };

/// exporting middleare

export default isAuthorized;
