import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.js";

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_RANDOMISER, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, password required" });
    }

    const emailLower = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email: emailLower });
    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: uuidv4(),
      name: String(name).trim(),
      email: emailLower,
      password: hashed,
    });

    const token = signToken(user.id);

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }

    return res
      .status(500)
      .json({ message: "Register failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email, password required" });
    }

    const emailLower = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user.id);

    return res.json({
      message: "User logged in successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Login failed", error: err.message });
  }
};
export const me = async (req, res) => {
  try {
    const userId = req.body.userId;

    const user = await User.findOne({ id: userId }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};
