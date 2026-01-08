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