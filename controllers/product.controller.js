import { db } from "../lib/firebase.js"; // Import Firestore
import { collection, getDocs, doc, getDoc, setDoc, query, where, deleteDoc } from "firebase/firestore"; // Firestore functions

// Get recommended products
export const getRecommendedProducts = async (req, res) => {
    try {
        const recommendedProductsQuery = query(collection(db, "products"), where("isRecommended", "==", true));
        const recommendedProductsSnapshot = await getDocs(recommendedProductsQuery);
        const recommendedProducts = recommendedProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (recommendedProducts.length === 0) {
            return res.status(404).json({ message: "No recommended products found" });
        }

        res.json(recommendedProducts);
    } catch (error) {
        console.log("Error in getRecommendedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// Create a new product
export const createProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Validate required fields
        if (!productData.name || !productData.price) {
            return res.status(400).json({ message: "Name and price are required" });
        }

        const productRef = doc(collection(db, "products")); // Create a new document reference
        await setDoc(productRef, productData); // Set the document data
        res.status(201).json({ message: "Product created successfully", id: productRef.id });
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ products });
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a product by ID
export const getProductById = async (req, res) => {
    const { id } = req.params; // Get product ID from request parameters
    try {
        const productRef = doc(db, "products", id);
        const productDoc = await getDoc(productRef);

        if (!productDoc.exists()) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ id: productDoc.id, ...productDoc.data() });
    } catch (error) {
        console.log("Error in getProductById controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create a new product
export const addProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Validate required fields
        if (!productData.name || !productData.price) {
            return res.status(400).json({ message: "Name and price are required" });
        }

        await createProduct(productData); // Use Firestore function
        res.status(201).json({ message: "Product created successfully" });
    } catch (error) {
        console.log("Error in addProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
    const { id } = req.params; // Get product ID from request parameters
    try {
        const productRef = doc(db, "products", id);
        await deleteDoc(productRef);

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProductsQuery = query(collection(db, "products"), where("isFeatured", "==", true));
        const featuredProductsSnapshot = await getDocs(featuredProductsQuery);
        const featuredProducts = featuredProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (featuredProducts.length === 0) {
            return res.status(404).json({ message: "No featured products found" });
        }

        res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Toggle featured status of a product
export const toggleFeaturedProduct = async (req, res) => {
    const { id } = req.params; // Get product ID from request parameters
    try {
        const productRef = doc(db, "products", id);
        const productDoc = await getDoc(productRef);

        if (!productDoc.exists()) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productData = productDoc.data();
        productData.isFeatured = !productData.isFeatured; // Toggle the featured status
        await setDoc(productRef, productData, { merge: true });

        res.json(productData);
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
    const { category } = req.params; // Get category from request parameters
    try {
        const productsQuery = query(collection(db, "products"), where("category", "==", category));
        const productsSnapshot = await getDocs(productsQuery);
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json({ products });
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};