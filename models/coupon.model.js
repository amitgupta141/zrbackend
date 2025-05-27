import { db } from "../lib/firebase.js"; // Firestore instance
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";

// Create a new coupon in Firestore
export const createCoupon = async (userId, discountPercentage) => {
  const couponCode = "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const couponRef = doc(db, "coupons", userId);
  
  await setDoc(couponRef, {
    code: couponCode,
    discountPercentage,
    expirationDate,
    isActive: true,
    userId,
  });

  return { code: couponCode, discountPercentage, expirationDate };
};

// Get a coupon by code
export const getCoupon = async (code) => {
  const couponRef = doc(db, "coupons", code);
  const couponDoc = await getDoc(couponRef);

  if (couponDoc.exists() && couponDoc.data().isActive) {
    return couponDoc.data();
  } else {
    return null;
  }
};

// Validate and deactivate a coupon after use
export const validateCoupon = async (code, userId) => {
  const couponRef = doc(db, "coupons", code);
  const couponDoc = await getDoc(couponRef);

  if (couponDoc.exists() && couponDoc.data().isActive && couponDoc.data().userId === userId) {
    await updateDoc(couponRef, { isActive: false });
    return true;
  } else {
    return false;
  }
};
