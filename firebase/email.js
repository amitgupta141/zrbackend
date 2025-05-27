import admin from "firebase-admin";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Firestore reference for email queue (if using Firestore-triggered emails)
const db = admin.firestore();

// Function to send email using Firebase Admin SDK
export const sendEmail = async (to, subject, html) => {
  try {
    const emailData = {
      to,
      message: {
        subject,
        html,
      },
    };

    // Add email data to Firestore collection (if using Firestore-triggered emails)
    await db.collection("mail").add(emailData);

    console.log("Email queued successfully via Firebase");
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Send email verification link using Firebase Auth
export const sendVerificationEmail = async (email, verificationLink) => {
  return sendEmail(
    email,
    "Verify Your Email",
    VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationLink)
  );
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  return sendEmail(
    email,
    "Welcome to Our Platform!",
    `<h1>Welcome ${name}!</h1>
    <p>Thank you for joining our platform. We're excited to have you on board!</p>`
  );
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, resetURL) => {
  return sendEmail(
    email,
    "Password Reset Request",
    PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL)
  );
};

// Send Password Reset Success Email
export const sendResetSuccessEmail = async (email) => {
  return sendEmail(
    email,
    "Password Reset Successful",
    PASSWORD_RESET_SUCCESS_TEMPLATE
  );
};
