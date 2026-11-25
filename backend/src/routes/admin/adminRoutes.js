import express from "express";

import {
    protect,
    authorizeRoles,
} from "../../middleware/authMiddleware.js";

import {
    getAdminStats,
} from "../../controllers/admin/adminStatsController.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("ADMIN"));

router.get("/stats", getAdminStats);

export default router;