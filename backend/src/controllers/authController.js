import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendError = (res, status, code, message) => {
  return res.status(status).json({
    error: { code, message },
  });
};

// JWT
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "23h", algorithm: "HS256" }
  );
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
    
  try {
    const { name, email, password } = req.body ?? {};

    // Validate basic field types
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return sendError(
        res, 400, "VALIDATION_ERROR",
        "Name, email and password are required"
      );
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate name
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return sendError(
        res, 400, "VALIDATION_ERROR",
        "Name must be between 2 and 50 characters"
      );
    }

    // Validate email
    if (
      normalizedEmail.length > 254 ||
      !emailRegex.test(normalizedEmail)
    ) {
      return sendError(
        res, 400, "VALIDATION_ERROR",
        "Please provide a valid email"
      );
    }

    // Validate password
    if (!passwordRegex.test(password)) {
      return sendError(
        res, 400, "VALIDATION_ERROR",
        "Password must be 8-64 characters with at least one letter and one digit"
      );
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return sendError(
        res, 409, "CONFLICT",
        "Email already registered"
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // User Registration
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      role: "USER",
    });

    return res.status(201).json({
      user: user.toJSON(),
    });
    
  } catch (error) {

    console.error("Registration error:", error);

    return sendError(
      res, 500, "INTERNAL_ERROR",
      "Something went wrong"
    );
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return sendError(
        res, 400, "VALIDATION_ERROR",
        "Email and password are required"
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length > 254 ||
      !emailRegex.test(normalizedEmail) ||
      password.length === 0
    ) {
      return sendError(
        res, 400, "VALIDATION_ERROR",
        "Invalid email or password format"
      );
    }

    // passwordHash is select:false in User.js
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");
    console.log(user);
    if (!user) {
      return sendError(
        res, 401, "UNAUTHENTICATED",
        "Invalid email or password"
      );
    }

    // Compare submitted password with saved hash
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return sendError(
        res, 401, "UNAUTHENTICATED",
        "Invalid email or password"
      );
    }

    // Create JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);

    return sendError(
      res, 500, "INTERNAL_ERROR",
      "Something went wrong"
    );
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return sendError(
        res, 401, "UNAUTHENTICATED",
        "User no longer exists"
      );
    }

    return res.status(200).json({
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Get user error:", error);

    return sendError(
      res, 500, "INTERNAL_ERROR",
      "Something went wrong"
    );
  }
};
