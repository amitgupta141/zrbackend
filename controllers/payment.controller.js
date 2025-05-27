import { createCoupon, getCoupon, validateCoupon } from "../models/coupon.model.js"; // Named imports
import { db } from "../lib/firebase.js"; // Firestore instance
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; // Firestore functions
import Razorpay from "razorpay"; // Razorpay import

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // Convert to paise
      totalAmount += amount * product.quantity;

      return {
        name: product.name,
        amount: amount,
        currency: "INR",
        quantity: product.quantity || 1,
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await getCoupon(couponCode);
      if (coupon) {
        totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
      }
    }

    // Create Razorpay order
    const options = {
      amount: totalAmount,
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // Save order to Firestore
    await setDoc(doc(db, "orders", order.id), {
      userId: req.user.uid,
      products: lineItems,
      totalAmount: totalAmount / 100,
      createdAt: new Date(),
    });

    res.status(200).json({ id: order.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({ message: "Error processing checkout", error: error.message });
  }
};

// Handle successful checkout
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Mock session response since Stripe is removed
    const session = { payment_status: "paid", metadata: {} };

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await validateCoupon(session.metadata.couponCode, session.metadata.userId);
      }

      const products = JSON.parse(session.metadata.products || "[]");

      // Save order details in Firestore
      const orderRef = doc(db, "orders", sessionId);
      await setDoc(orderRef, {
        userId: session.metadata.userId,
        products: products,
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
        createdAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Payment successful, order created, and coupon deactivated if used.",
        orderId: sessionId,
      });
    } else {
      res.status(400).json({ error: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({ message: "Error processing successful checkout", error: error.message });
  }
};

// Create a new coupon
export const createNewCoupon = async (userId) => {
  await createCoupon(userId, 10); // Pass discount percentage
};
