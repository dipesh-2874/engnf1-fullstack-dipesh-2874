import express from "express";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Any authenticated user
router.get(
  "/user",
  protect,
  authorizeRoles("USER", "ADMIN"),
  (req, res) => {
    res.status(200).json({
      message: "Authenticated access granted",
      role: req.user.role,
    });
  }
);

// ADMIN only
router.get(
  "/admin",
  protect,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.status(200).json({
      message: "Admin access granted",
      role: req.user.role,
    });
  }
);

export default router;
