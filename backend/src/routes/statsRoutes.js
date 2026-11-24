import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getTicketStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/", protect, getTicketStats);

export default router;