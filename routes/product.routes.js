import express from "express";
import { 
    getAllProducts,
    getFeaturedProducts, 
    createProduct,
    deleteProduct, 
    getProductsByCategory, 
    getRecommendedProducts,
    toggleFeaturedProduct,
    getProductById,
    addProduct,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";




const router = express.Router();



router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.get("/:id", getProductById);
router.post("/", addProduct);

export default router;