import { db } from "../lib/db.js"; // Import Firestore
import { doc, setDoc, getDoc, deleteDoc, getDocs, collection } from "firebase/firestore"; // Firestore functions

// Create a new event
export const createEvent = async (eventData) => {
    try {
        // Validate time format
        const timeFormat = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
        if (!timeFormat.test(eventData.time)) {
            throw new Error("Invalid time format. Use HH:MM AM/PM");
        }

        const eventRef = doc(db, "events", eventData.id); // Use Firestore document reference
        await setDoc(eventRef, {
            date: eventData.date, // Store event date
            time: eventData.time, // Store event time
            address: eventData.address, // Store event address
            createdAt: new Date(), // Store creation date
            updatedAt: new Date(), // Store update date
        });
    } catch (error) {
        console.error("Error creating event:", error);
        throw new Error("Failed to create event: " + error.message);
    }
};

// Get all events
export const getAllEvents = async () => {
    try {
        const eventsSnapshot = await getDocs(collection(db, "events"));
        return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching events:", error);
        throw new Error("Failed to fetch events");
    }
};

// Get an event by ID
export const getEventById = async (eventId) => {
    try {
        const eventRef = doc(db, "events", eventId);
        const eventDoc = await getDoc(eventRef);
        return eventDoc.exists() ? { id: eventDoc.id, ...eventDoc.data() } : null;
    } catch (error) {
        console.error("Error fetching event by ID:", error);
        throw new Error("Failed to fetch event");
    }
};

export const updateEvent = async (eventId, eventData) => {
    const eventRef = doc(db, "events", eventId);
    await setDoc(eventRef, eventData, { merge: true });
};

export const deleteEvent = async (eventId) => {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
};
