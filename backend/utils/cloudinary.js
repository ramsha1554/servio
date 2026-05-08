import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import logger from "../config/logger.js"
const uploadOnCloudinary = async (file) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    try {
        const result = await cloudinary.uploader.upload(file)
        fs.unlinkSync(file)
        return result.secure_url
    } catch (error) {
        fs.unlinkSync(file)
        logger.error("cloudinary upload error", { error: error.message })
    }
}

export default uploadOnCloudinary