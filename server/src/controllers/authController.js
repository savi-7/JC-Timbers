import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
export const register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // If no role provided, default to 'customer'
    const userRole = role || 'customer';
    
    // Validate role if provided
    if (role && !['admin', 'customer'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'customer'" });
    }

    await User.create({ name, email, password, phone, role: userRole });
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Login attempt:", { email });
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("User found:", { email: user.email, hasPassword: !!user.password });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Login successful for:", email);

    const token = jwt.sign({ 
      id: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From JWT middleware
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Update password
      user.password = newPassword;
    }

    // Update other fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      user.email = email;
    }
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Google Sign-In
export const googleSignIn = async (req, res) => {
  const { name, email, avatar } = req.body;
  try {
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with Google data
      user = await User.create({
        name,
        email,
        password: null, // Google users don't have password
        role: 'customer' // Default role for Google sign-ins
      });
    }

    const token = jwt.sign({ 
      id: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};