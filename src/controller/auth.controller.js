// auth.controller.js

import User from "../models/User.js";
import bcrypt from "bcryptjs"
import crypto from "crypto"
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

//Register \ Verify Email \ Login \ Forgot Password \ Reset Password

export const register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ message: "User already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const token = await crypto.randomBytes(32).toString("hex");

    await User.create({
        email,
        password: hashPassword,
        verificationToken: token
    })

    const link = `http://localhost:8080/auth/verify?token=${token}`
    sendEmail(email, "Verification Link", link)

    res.status(200).json({ message: "User register successfully" })
}

export const verifyEmail = async (req, res) => {
    const token = req.query.token;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        return res.status(400).json({ "message": "Invalid token" })
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    res.status(200).json({ "message": "Email verified successfully", user })
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
        return res.status(400).json({ message: "Please verify your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token, user });
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.statud(404).json({ message: "User not found" })
    }

    const token = await crypto.randomBytes(32).toString("hex");

    user.resetToken = token
    user.resetTokenExpiry = Date.now() + 360000;

    await user.save();

    const link = `http://localhost:8080/auth/reset-password?token=${token}`
    sendEmail(email, "Reset Password Link", link)

    res.status(200).json({ message: "Reset password email sent" })
}

export const resetPassword = async (req, res) => {
    const { newPassword, token } = req.body;

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
        return res.status(400).json({ message: "Reset expired or Invalid token" })
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
}

