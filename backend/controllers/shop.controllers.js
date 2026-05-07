import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import redis from "../config/redis.js";

export const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address, ownerId } = req.body;
        // Use provided ownerId or fallback to req.userId
        const finalOwnerId = ownerId || req.userId;
        
        let image;
        if (req.file) {
            console.log("Uploading file to Cloudinary:", req.file.path);
            image = await uploadOnCloudinary(req.file.path)
            if (!image) {
                return res.status(500).json({ message: "Image upload failed. Please check Cloudinary configuration." })
            }
        }

        let shop = await Shop.findOne({ owner: finalOwnerId })
        const oldCity = shop?.city;

        if (!shop) {
            if (!image) {
                return res.status(400).json({ message: "A shop image is strictly required when creating a new shop." })
            }
            shop = await Shop.create({
                name, city, state, address, image, owner: finalOwnerId, categories: req.body.categories, location: req.body.location
            })
        } else {
            const updateData = { name, city, state, address, owner: finalOwnerId, categories: req.body.categories, location: req.body.location }
            if (image) {
                updateData.image = image;
            }
            shop = await Shop.findByIdAndUpdate(shop._id, updateData, { new: true })
        }

        await shop.populate("owner items")

        // Invalidate Cache Safely
        try {
            if (city) await redis.del(`shops:${city}`);
            if (oldCity && oldCity !== city) await redis.del(`shops:${oldCity}`);
        } catch (redisError) {
            console.error("Redis cache invalidation error:", redisError);
        }

        return res.status(201).json(shop)
    } catch (error) {
        console.error("createEditShop Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" })
    }
}

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner").populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        if (!shop) {
            return res.status(200).json(null)
        }
        return res.status(200).json(shop)
    } catch (error) {
        console.error("getMyShop Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" })
    }
}

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params
        
        try {
            const cachedShops = await redis.get(`shops:${city}`);
            if (cachedShops) {
                return res.status(200).json(JSON.parse(cachedShops));
            }
        } catch (redisError) {
            console.error("Redis get error:", redisError);
        }

        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')
        
        if (!shops || shops.length === 0) {
            return res.status(200).json([]) // Return empty array instead of 400
        }

        try {
            await redis.set(`shops:${city}`, JSON.stringify(shops), "EX", 300);
        } catch (redisError) {
            console.error("Redis set error:", redisError);
        }

        return res.status(200).json(shops)
    } catch (error) {
        console.error("getShopByCity Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" })
    }
}