
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// 1. Verify JWT and identify logged-in user
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication token required",
        },
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    if (
      !decoded.userId ||
      !mongoose.isValidObjectId(decoded.userId)
    ) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Invalid authentication token",
        },
      });
    }

    // Fetch current user from MongoDB
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "User no longer exists",
        },
      });
    }

    // Attach verified user to request
    req.user = user;

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Invalid or expired token",
        },
      });
    }

    return next(error);
  }
};

// 2. Restrict access to permitted roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        },
      });
    }

    return next();
  };
};
