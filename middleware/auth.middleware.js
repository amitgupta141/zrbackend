import jwt from "jsonwebtoken";
import { db } from "../lib/db.js"; // Import Firestore
import { doc, getDoc } from "firebase/firestore"; // Firestore functions

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - No access token provided" });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const userRef = doc(db, "users", decoded.userId); // Reference to the user document
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return res.status(401).json({ message: "User not found" });
            }

            // Exclude the password from the user data
            const user = { id: userDoc.id, ...userDoc.data() };
            delete user.password; // Ensure password is not sent in the response

            req.user = user; // Attach user to request
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized - Access token expired" });
            }
            throw error;
        }

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return res.status(401).json({ message: "Unauthorized - Invalid access token" });
    }
};

export const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied - Admin only" });
    }
};