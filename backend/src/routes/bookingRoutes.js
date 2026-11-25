import express from "express";

import {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
} from "../controllers/bookingController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("USER", "ADMIN"), createBooking);
router.get("/my", authorizeRoles("USER", "ADMIN"), getMyBookings);
router.patch("/:id/cancel", authorizeRoles("USER", "ADMIN"), cancelBooking);

router.get("/", authorizeRoles("ADMIN"), getAllBookings);
router.patch("/:id/approve", authorizeRoles("ADMIN"), approveBooking);
router.patch("/:id/reject", authorizeRoles("ADMIN"), rejectBooking);

export default router;
