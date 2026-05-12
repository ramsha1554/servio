import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        
        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required. Token not found." })
        }

        const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
        
        if (!decodeToken) {
            return res.status(401).json({ success: false, message: "Invalid or expired token." })
        }

        const user = await User.findById(decodeToken.userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User no longer exists." })
        }

        if (user.isBanned) {
            return res.status(403).json({ success: false, message: "Your account has been banned. Access denied." })
        }

        // Attach both ID and full user object for convenience
        req.userId = decodeToken.userId
        req.user = user
        next()
    } catch (error) {
        return res.status(500).json({ success: false, message: "Authentication internal error" })
    }
}

export default isAuth