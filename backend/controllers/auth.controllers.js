// ============ BACKUP (original code before Passport migration) ============
/*
import User from "../models/user.model.js"
import bcrypt, { hash } from "bcryptjs"
import genToken from "../utils/token.js"
import redis from "../config/redis.js"
import { emailQueue } from "../config/queue.js"
import logger from "../config/logger.js"
export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body
        
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ success: false, message: "User Already exist." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        
        // Root Cause Fix: Explicitly omit location during signup
        user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password: hashedPassword
        })

        const token = await genToken(user._id)
        
        res.cookie("token", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(201).json({ 
            success: true, 
            message: "User created successfully", 
            token, 
            user: safeUser 
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: `Signup error: ${error.message}` })
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist." })
        }

        // Permanent Fix: Block banned users at login
        if (user.isBanned) {
            return res.status(403).json({ success: false, message: "Your account is banned. Contact support." })
        }

        // Handle Google users who might not have a password
        if (!user.password && !password) {
             return res.status(400).json({ success: false, message: "Please use Google Login for this account." })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password" })
        }

        const token = await genToken(user._id)

        res.cookie("token", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(200).json({ 
            success: true, 
            message: `Welcome back, ${user.fullName}`, 
            token, 
            user: safeUser 
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: `Signin error: ${error.message}` })
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            httpOnly: true
        })
        return res.status(200).json({ message: "log out successfully" })
    } catch (error) {
        return res.status(500).json({ message: `sign out error ${error}` })
    }
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist." })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        // Store OTP in Redis with 5 minute expiration
        await redis.set(`otp:${email}`, otp, "EX", 300);

        user.isOtpVerified = false
        await user.save()

        // Add email job to queue (Async)
        await emailQueue.add("send-otp", { email, otp });

        return res.status(200).json({ message: "otp sent successfully" })
    } catch (error) {
        return res.status(500).json({ message: `send otp error ${error}` })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const storedOtp = await redis.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ message: "invalid/expired otp" })
        }

        user.isOtpVerified = true
        // user.resetOtp = undefined  <-- No longer needed
        // user.otpExpires = undefined <-- No longer needed as otp expires after 5 minutes  
        await user.save()

        // Delete OTP after successful verification of otp 
        await redis.del(`otp:${email}`);

        return res.status(200).json({ message: "otp verify successfully" })
    } catch (error) {
        return res.status(500).json({ message: `verify otp error ${error}` })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body
        const user = await User.findOne({ email })
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "otp verification required" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.isOtpVerified = false
        await user.save()
        return res.status(200).json({ message: "password reset successfully" })
    } catch (error) {
        return res.status(500).json({ message: `reset password error ${error}` })
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role } = req.body
        let user = await User.findOne({ email })
        
        if (!user) {
            // Root Cause Fix: Omit location during creation
            user = await User.create({
                fullName: fullName || "Google User",
                email,
                mobile: mobile || "Not Provided",
                role: role || "user"
            })
        }

        if (user.isBanned) {
            return res.status(403).json({ success: false, message: "Account banned." })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(200).json({ success: true, user: safeUser, token })

    } catch (error) {
        return res.status(500).json({ success: false, message: `Google Auth error: ${error.message}` })
    }
}

export const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
        }

        // Validate coordinates
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ success: false, message: "Invalid coordinates" });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                location: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                }
            },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Location updated successfully",
            user
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: `Update location error: ${error.message}` });
    }
}
*/
// =========================================================================

import User from "../models/user.model.js"
import bcrypt, { hash } from "bcryptjs"
import genToken from "../utils/token.js"
import redis from "../config/redis.js"
import { emailQueue } from "../config/queue.js"
import logger from "../config/logger.js"

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body
        
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ success: false, message: "User Already exist." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        
        user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password: hashedPassword
        })

        const token = await genToken(user._id)
        
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            path: "/"
        })

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(201).json({ 
            success: true, 
            message: "User created successfully", 
            token, 
            user: safeUser 
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: `Signup error: ${error.message}` })
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist." })
        }

        if (user.isBanned) {
            return res.status(403).json({ success: false, message: "Your account is banned. Contact support." })
        }

        if (!user.password && !password) {
             return res.status(400).json({ success: false, message: "Please use Google Login for this account." })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password" })
        }

        const token = await genToken(user._id)

        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            path: "/"
        })

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(200).json({ 
            success: true, 
            message: `Welcome back, ${user.fullName}`, 
            token, 
            user: safeUser 
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: `Signin error: ${error.message}` })
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            secure: true,
            sameSite: "none",
            httpOnly: true,
            path: "/"
        })
        return res.status(200).json({ message: "log out successfully" })
    } catch (error) {
        return res.status(500).json({ message: `sign out error ${error}` })
    }
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist." })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        await redis.set(`otp:${email}`, otp, "EX", 300);

        user.isOtpVerified = false
        await user.save()

        await emailQueue.add("send-otp", { email, otp });

        return res.status(200).json({ message: "otp sent successfully" })
    } catch (error) {
        return res.status(500).json({ message: `send otp error ${error}` })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const storedOtp = await redis.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ message: "invalid/expired otp" })
        }

        user.isOtpVerified = true
        await user.save()

        await redis.del(`otp:${email}`);

        return res.status(200).json({ message: "otp verify successfully" })
    } catch (error) {
        return res.status(500).json({ message: `verify otp error ${error}` })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body
        const user = await User.findOne({ email })
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "otp verification required" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.isOtpVerified = false
        await user.save()
        return res.status(200).json({ message: "password reset successfully" })
    } catch (error) {
        return res.status(500).json({ message: `reset password error ${error}` })
    }
}

// Replacement for old googleAuth controller
export const googleCallback = async (req, res) => {
    try {
        // req.user is populated by Passport after successful handshake
        const user = req.user;
        
        if (!user) {
            console.error("No user found in request after Passport authentication");
            return res.redirect(`${process.env.FRONTEND_URL}/signin?error=auth_failed`);
        }

        if (user.isBanned) {
            return res.redirect(`${process.env.FRONTEND_URL}/signin?error=banned`);
        }

        const token = await genToken(user._id);
        
        // Use a more robust cookie configuration for cross-domain (Render to Vercel)
        res.cookie("token", token, {
            secure: true, 
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            path: "/" 
        });

        // Redirect back to frontend
        return res.redirect(`${process.env.FRONTEND_URL}/`);
    } catch (error) {
        logger.error("googleCallback error", { error: error.message });
        return res.redirect(`${process.env.FRONTEND_URL}/signin?error=server_error`);
    }
}

export const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ success: false, message: "Invalid coordinates" });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                location: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                }
            },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Location updated successfully",
            user
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: `Update location error: ${error.message}` });
    }
}