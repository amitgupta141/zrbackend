import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js"; // Assuming this is for authentication
import { getEvents, createEvent, updateEvent, deleteEvent } from "../controllers/event.controller.js";

const router = express.Router();

// Route to get all events
router.get("/", protectRoute, getEvents);

// Route to create a new event
router.post("/", protectRoute, createEvent);

// Route to update an existing event
router.put("/:eventId", protectRoute, updateEvent);

// Route to delete an event
router.delete("/:eventId", protectRoute, deleteEvent);

export default router;
