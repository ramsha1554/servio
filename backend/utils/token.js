import jwt from "jsonwebtoken"
import logger from "../config/logger.js"

const genToken=async (userId) => {
    try {
        const token= jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"7d"})
        return token
    } catch (error) {
        logger.error("genToken error", { error: error.message })
    }
}

export default genToken