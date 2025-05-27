import { redis } from "../lib/redis.js";
import { db } from "../lib/db.js";
import { createUser, getUserById } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { auth } from "../lib/firebase.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../firebase/email.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPhoneNumber, 
    RecaptchaVerifier 
} from "firebase/auth";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    });

    return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

// ✅ Signup Controller
export const signup = async (req, res) => {
    const { id, name, email, password, phoneNumber, isPhoneSignup } = req.body;

    if (!id || !name || (!isPhoneSignup && (!email || !password)) || (isPhoneSignup && !phoneNumber)) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let userCredential;

        if (isPhoneSignup) {
            const appVerifier = new RecaptchaVerifier('recaptcha-container', auth);
            userCredential = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        } else {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userData = {
                id,
                name,
                email: email.toLowerCase(),
                password,
                cartItems: [],
                role: "customer"
            };

            await createUser(userData);
            await sendVerificationEmail(email);
            await sendWelcomeEmail(email, name);
        }

        res.status(201).json({ message: "User created successfully. Please verify your email or phone number." });
    } catch (error) {
        console.error("Error in signup controller:", error);
        res.status(500).json({ message: "Failed to create user: " + error.message });
    }
};

// ✅ Login Controller
export const login = async (req, res) => {
    const { email, password, phoneNumber, isPhoneLogin, otp } = req.body;

    try {
        let userCredential;
        let user;

        if (isPhoneLogin) {
            if (!phoneNumber || !otp) {
                return res.status(400).json({ message: "Phone number and OTP are required" });
            }

            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' }));
            userCredential = await confirmationResult.confirm(otp);
            user = userCredential.user;
        } else {
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            userCredential = await signInWithEmailAndPassword(auth, email, password);
            user = userCredential.user;
        }

        // Generate JWT tokens
        const tokens = generateTokens(user.uid);
        setCookies(res, tokens.accessToken, tokens.refreshToken);

        res.json({
            _id: user.uid,
            name: user.displayName || "User",
            email: user.email || null,
            phoneNumber: user.phoneNumber || null,
            role: "customer",
        });
    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ Logout Controller
export const logout = async (req, res) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Get Profile Controller
export const getProfile = async (req, res) => {
    try {
        const user = await getUserById(req.user.uid);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
