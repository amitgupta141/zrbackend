import { db } from "../lib/firebase.js"; // Import Firestore
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from "firebase/firestore"; // Firestore functions

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { date, time, address } = req.body;

    // Validate required fields
    if (!date || !time || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate time format (HH:MM AM/PM)
    if (!/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(time)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM AM/PM" });
    }

    // Ensure valid date format
    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Create a new event
    const newEvent = {
      date: formattedDate,
      time,
      address,
    };

    // Save the event
    const eventRef = doc(collection(db, "events"));
    await setDoc(eventRef, newEvent);
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error("Error while creating event:", error);
    res.status(500).json({ message: "Failed to create event", error: error.message });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const eventsSnapshot = await getDocs(collection(db, "events"));
    const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(events);
  } catch (error) {
    console.error("Error while fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

// Update an event by ID
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updatedEvent = req.body;

    const eventRef = doc(db, "events", eventId);
    await setDoc(eventRef, updatedEvent, { merge: true });

    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Error while updating event:", error);
    res.status(500).json({ message: "Failed to update event", error: error.message });
  }
};

// Delete an event by ID
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error while deleting event:", error);
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};
