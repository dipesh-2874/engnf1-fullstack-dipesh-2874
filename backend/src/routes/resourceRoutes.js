import express from "express";

import {
    getResources,
    getResourceById,
    createResource,
    updateResource,
} from "../controllers/resourceController.js";

import {
    protect,
    authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getResources);

router.get("/:id", protect, getResourceById);

//admin only
router.post("/", protect, authorizeRoles("ADMIN"), createResource);

router.patch("/:id", protect, authorizeRoles("ADMIN"), updateResource);

export default router;