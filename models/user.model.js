import { db } from "../lib/db.js"; // Import Firestore
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore"; // Firestore functions
import bcrypt from "bcryptjs"; // For password hashing

// Create a new user
export const createUser = async (userData) => {
    try {
        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const userRef = doc(db, "users", userData.id); // Use Firestore document reference
        await setDoc(userRef, {
            name: userData.name,
            email: userData.email.toLowerCase(), // Store email in lowercase
            password: hashedPassword, // Store hashed password
            cartItems: userData.cartItems || [], // Store cart items
            role: userData.role || "customer", // Default role is "customer"
            createdAt: new Date(), // Store creation date
            updatedAt: new Date(), // Store update date
        });
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user: " + error.message);
    }
};

// Get a user by ID
export const getUserById = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error("Failed to fetch user");
    }
};

// Compare password
export const comparePassword = async (inputPassword, hashedPassword) => {
    return await bcrypt.compare(inputPassword, hashedPassword);
};

// Get all users
export const getAllUsers = async () => {
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
};