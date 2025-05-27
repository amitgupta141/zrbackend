import { db } from "../lib/firebase.js"; // Import Firestore
import { doc, getDoc, setDoc } from "firebase/firestore"; // Firestore functions
import { collection, getDocs } from "firebase/firestore";

export const getCartProducts = async (req, res) => {
	try {
		const userDoc = await getDoc(doc(db, "users", req.user.uid));
		const userData = userDoc.data();

		const productsSnapshot = await getDocs(collection(db, "products"));
		const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

		const cartItems = products.map((product) => {
			const item = userData.cartItems.find((cartItem) => cartItem.id === product.id);
			return { ...product, quantity: item.quantity };
		});

		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const userDoc = await getDoc(doc(db, "users", req.user.uid));
		const userData = userDoc.data();

		const existingItem = userData.cartItems.find(item => item.id === productId);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			userData.cartItems.push({ id: productId, quantity: 1 });
		}

		await setDoc(doc(db, "users", req.user.uid), userData); // Update user cart in Firestore
		res.json(userData.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const userDoc = await getDoc(doc(db, "users", req.user.uid));
		const userData = userDoc.data();

		if (!productId) {
			userData.cartItems = [];
		} else {
			userData.cartItems = userData.cartItems.filter((item) => item.id !== productId);
		}
		await setDoc(doc(db, "users", req.user.uid), userData); // Update user cart in Firestore
		res.json(userData.cartItems);
	} catch (error) {
		console.log("Error in removeAllFromCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const userDoc = await getDoc(doc(db, "users", req.user.uid));
		const userData = userDoc.data();
		const existingItem = userData.cartItems.find(item => item.id === productId);

		if (existingItem) {
			if (quantity === 0) {
				userData.cartItems = userData.cartItems.filter((item) => item.id !== productId);
			} else {
				existingItem.quantity = quantity;
			}
			await setDoc(doc(db, "users", req.user.uid), userData); // Update user cart in Firestore
			res.json(userData.cartItems);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

