// ============ BACKUP (original code before Passport migration) ============
/*
import express from "express"
import { googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp } from "../controllers/auth.controllers.js"

import { validate } from "../middlewares/validate.js"
import { UserSchema } from "../utils/schemas.js"

const authRouter = express.Router()

authRouter.post("/signup", validate(UserSchema.signUp), signUp)
authRouter.post("/signin", validate(UserSchema.signIn), signIn)
authRouter.get("/signout", signOut)
authRouter.post("/send-otp", validate(UserSchema.sendOtp), sendOtp)
authRouter.post("/verify-otp", validate(UserSchema.verifyOtp), verifyOtp)
authRouter.post("/reset-password", validate(UserSchema.resetPassword), resetPassword)
authRouter.post("/google-auth", validate(UserSchema.googleAuth), googleAuth)

export default authRouter
*/
// =========================================================================

import express from "express"
import passport from "passport"
import rateLimit from "express-rate-limit"
import { googleCallback, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp } from "../controllers/auth.controllers.js"

import { validate } from "../middlewares/validate.js"
import { UserSchema } from "../utils/schemas.js"

const authRouter = express.Router()

// Apply rate limiter specifically to manual auth attempts
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Slightly higher limit for better UX
    standardHeaders: true,
    legacyHeaders: false,
})

authRouter.post("/signup", authLimiter, validate(UserSchema.signUp), signUp)
authRouter.post("/signin", authLimiter, validate(UserSchema.signIn), signIn)
authRouter.get("/signout", signOut)
authRouter.post("/send-otp", authLimiter, validate(UserSchema.sendOtp), sendOtp)
authRouter.post("/verify-otp", authLimiter, validate(UserSchema.verifyOtp), verifyOtp)
authRouter.post("/reset-password", authLimiter, validate(UserSchema.resetPassword), resetPassword)

// Google OAuth routes (No rate limiting on the redirect itself to avoid handshake failures)
authRouter.get("/google", (req, res, next) => {
    const { role } = req.query;
    if (role) {
        req.session.intendedRole = role;
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
})

authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: "/signin?error=auth_failed", session: false }), googleCallback)

export default authRouter