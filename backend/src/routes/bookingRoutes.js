import express from "express";

import {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  decideBooking,
} from "../controllers/bookingController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("USER", "ADMIN"), createBooking);

router.get("/my", authorizeRoles("USER", "ADMIN"), getMyBookings);

router.get("/", authorizeRoles("ADMIN"), getAllBookings);

router.patch("/:id/cancel", authorizeRoles("USER", "ADMIN"), cancelBooking);

router.patch("/:id/decision", authorizeRoles("ADMIN"), decideBooking);

export default router;
