import { db } from "../lib/db.js"; // Import Firestore
import { doc, setDoc, getDoc, getDocs, collection, serverTimestamp } from "firebase/firestore"; // Firestore functions

// Create a new product
export const createProduct = async (productData) => {
    try {
        // Validate gallery length
        if (productData.gallery.length > 10) {
            throw new Error("Gallery can have a maximum of 10 images");
        }

        const productRef = doc(db, "products", productData.id); // Use Firestore document reference
        await setDoc(productRef, {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            image: productData.image, // Store main image URL from Firebase
            category: productData.category,
            isFeatured: productData.isFeatured,
            gallery: productData.gallery || [], // Store gallery images
            createdAt: serverTimestamp(), // Use Firestore server timestamp
            updatedAt: serverTimestamp(), // Use Firestore server timestamp
        });
    } catch (error) {
        console.error("Error creating product:", error);
        throw new Error("Failed to create product: " + error.message);
    }
};

// Get all products
export const getAllProducts = async () => {
    try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }
};

// Get a product by ID
export const getProductById = async (productId) => {
    try {
        const productRef = doc(db, "products", productId);
        const productDoc = await getDoc(productRef);
        return productDoc.exists() ? { id: productDoc.id, ...productDoc.data() } : null;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw new Error("Failed to fetch product");
    }
};
