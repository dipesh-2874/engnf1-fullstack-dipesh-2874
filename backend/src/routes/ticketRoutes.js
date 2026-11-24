import express from "express";

import {
    importTickets,
    getTickets,
    getTicketById,
    updateTicket,
    getTicketEvents,
} from "../controllers/ticketController.js"

import {
    protect,
    authorizeRoles,
} from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/import", protect, authorizeRoles("USER", "ADMIN"), importTickets);

router.get("/", protect, getTickets);

router.get("/:id", protect, getTicketById);

router.patch("/:id", protect, authorizeRoles("USER", "ADMIN"), updateTicket);

router.get("/:id/events", protect, getTicketEvents);

export default router;