import { db } from "../lib/db.js"; // Import Firestore
import { doc, setDoc, getDoc, getDocs, collection, serverTimestamp } from "firebase/firestore"; // Firestore functions

// Create a new order
export const createOrder = async (orderData) => {
	try {
		const orderRef = doc(db, "orders", orderData.id); // Use Firestore document reference
		await setDoc(orderRef, {
			user: orderData.user, // User ID
			products: orderData.products, // Array of product IDs or objects
			totalAmount: orderData.totalAmount, // Total amount for the order
			paymentId: orderData.paymentId, // Stripe session ID
			createdAt: serverTimestamp(), // Use Firestore server timestamp
			updatedAt: serverTimestamp(), // Use Firestore server timestamp
		});
	} catch (error) {
		console.error("Error creating order:", error);
		throw new Error("Failed to create order: " + error.message);
	}
};

// Get all orders
export const getAllOrders = async () => {
	try {
		const ordersSnapshot = await getDocs(collection(db, "orders"));
		return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	} catch (error) {
		console.error("Error fetching orders:", error);
		throw new Error("Failed to fetch orders");
	}
};

// Get an order by ID
export const getOrderById = async (orderId) => {
	try {
		const orderRef = doc(db, "orders", orderId);
		const orderDoc = await getDoc(orderRef);
		return orderDoc.exists() ? { id: orderDoc.id, ...orderDoc.data() } : null;
	} catch (error) {
		console.error("Error fetching order by ID:", error);
		throw new Error("Failed to fetch order");
	}
};