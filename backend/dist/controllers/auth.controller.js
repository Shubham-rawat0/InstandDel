import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { getToken } from "../utils/token.js";
import { sendOtpMAil, sendWelcomeMail } from "../utils/mail.js";
export const signUp = async (req, res) => {
    try {
        const { fullName, password, email, mobile, role } = req.body;
        let user = await User.findOne({ email });
        if (!fullName || !password || !email || !mobile) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (user) {
            return res.status(400).json({ message: "user already exist" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "password must be atleast 8 characters" });
        }
        if (mobile.length < 10) {
            return res.status(400).json({ message: "mobile no must be 10 digits" });
        }
        const hashPass = await bcrypt.hash(password, 10);
        user = await User.create({ fullName, email, password: hashPass, mobile, role });
        const token = getToken(user._id.toString());
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        await sendWelcomeMail(email);
        return res.status(201).json(user, { message: "user created successfully" });
    }
    catch (error) {
        console.log("sign up error", error);
        return res.status(500).json({ "sign up error": error });
    }
};
export const signIn = async (req, res) => {
    try {
        const { password, email } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "user dont exist" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "password must be atleast 8 characters" });
        }
        if (!user.password) {
            return res.status(500).json({ message: "User password is missing" });
        }
        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) {
            res.status(400).json({ message: "wrong credentials" });
        }
        const token = getToken(user._id.toString());
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        return res
            .status(201)
            .json(user, { message: "user logged in successfully" });
    }
    catch (error) {
        console.log("sign up error", error);
        return res.status(500).json({ "sign in error": error });
    }
};
export const signOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "user signed out" });
    }
    catch (error) {
        console.log("sign up error", error);
        return res.status(500).json({ "sign out error": error });
    }
};
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User doesn't exist" });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        user.isOtpVerified = false;
        await user.save();
        await sendOtpMAil(email, otp);
        return res.status(200).json({ message: "OTP sent successfully" });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Error sending OTP" });
    }
};
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (!user.otpExpires || user.otpExpires < Date.now()) {
            user.resetOtp = null;
            await user.save();
            return res.status(400).json({ message: "OTP expired" });
        }
        if (user.resetOtp !== otp) {
            user.resetOtp = null;
            await user.save();
            return res.status(400).json({ message: "Invalid OTP" });
        }
        user.resetOtp = null;
        user.otpExpires = null;
        user.isOtpVerified = true;
        await user.save();
        return res.status(200).json({ message: "OTP verified successfully" });
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Error verifying OTP" });
    }
};
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "OTP verification required" });
        }
        const hashPass = await bcrypt.hash(newPassword, 10);
        user.password = hashPass;
        user.isOtpVerified = false;
        user.resetOtp = null;
        user.otpExpires = null;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: "Error resetting password" });
    }
};
export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role } = req.body;
        let user = await User.findOne({ email });
        if (mobile && mobile.length < 10) {
            return res
                .status(400)
                .json({ message: "mobile no must be 10 digits" });
        }
        if (user && user.googleSignIn == false) {
            return res.status(400).json({ message: "user has registered account without google, use password to log in" });
        }
        if (!user) {
            user = await User.create({ fullName, email, mobile, role, googleSignIn: true });
            await sendWelcomeMail(email);
        }
        const token = getToken(user._id.toString());
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });
        return res
            .status(201)
            .json({ user, message: "user logged in successfully through google" });
    }
    catch (error) {
        console.error("Error google auth", error);
        return res.status(500).json({ message: "Error google auth" });
    }
};
