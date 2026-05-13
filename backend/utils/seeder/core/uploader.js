import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '../temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Ensure Cloudinary is configured before any operation
const configureCloudinary = () => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary environment variables are missing. Please check your .env file.");
    }
    
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
};

export const uploadManagedImage = async (url, folder, publicId, retries = 3) => {
    configureCloudinary();
    
    const fileName = `${crypto.randomBytes(8).toString('hex')}.jpg`;
    const tempPath = path.join(TEMP_DIR, fileName);

    try {
        // 1. Download with timeout and Browser-like User-Agent
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });

        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // 2. Upload to Cloudinary
        let attempt = 0;
        while (attempt < retries) {
            try {
                const result = await cloudinary.uploader.upload(tempPath, {
                    folder: folder,
                    public_id: publicId.replace(/[^a-zA-Z0-9]/g, '_'), // Sanitize publicId
                    overwrite: true,
                    resource_type: 'image'
                });
                
                return {
                    secure_url: result.secure_url,
                    public_id: result.public_id
                };
            } catch (error) {
                attempt++;
                if (attempt === retries) throw error;
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(r => setTimeout(r, delay));
            }
        }
    } catch (error) {
        console.error(`Managed Upload Failed for [${publicId}]: ${error.message}`);
        return null;
    } finally {
        // 3. Cleanup
        if (fs.existsSync(tempPath)) {
            try {
                fs.unlinkSync(tempPath);
            } catch (cleanupError) {
                // Silently fail cleanup
            }
        }
    }
};
