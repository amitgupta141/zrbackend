import { db } from "../lib/firebase.js"; // Import Firestore
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import { createCoupon, getCoupon as fetchCoupon, validateCoupon as validateCouponModel } from "../models/coupon.model.js"; // Use named imports

export const getCoupon = async (req, res) => {
    try {
        const coupon = await fetchCoupon(req.user.uid); // Use Firestore function
        res.json(coupon);
    } catch (error) {
        console.log("Error in getCoupon controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
    
export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await validateCouponModel(code); // Use Firestore function

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        });
    } catch (error) {
        console.log("Error in validateCoupon controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};