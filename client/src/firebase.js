// client/src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";

// ✅ Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyA-gGpK9oKYh47vFUDjl3w5nj3jKMH9wiI",
  authDomain: "jc-woods-auth.firebaseapp.com",
  projectId: "jc-woods-auth",
  storageBucket: "jc-woods-auth.firebasestorage.app",
  messagingSenderId: "1055883538270",
  appId: "1:1055883538270:web:8b086d49245887b706a9cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  return result.user; // Return logged-in user info
};

// Send password reset email
export const resetPassword = async (email) => {
  if (!email) throw new Error("Email is required for password reset");
  return sendPasswordResetEmail(auth, email);
};

export { auth, provider };
