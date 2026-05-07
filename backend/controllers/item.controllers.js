import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import redis from "../config/redis.js";

export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body
        let image;
        
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
            if (!image) {
                return res.status(500).json({ message: "Cloudinary upload failed." })
            }
        }

        if (!image) {
            return res.status(400).json({ message: "An image is strictly required for new items." })
        }

        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(400).json({ message: "shop not found" })
        }
        const item = await Item.create({
            name, category, foodType, price, image, shop: shop._id
        })

        shop.items.push(item._id)
        await shop.save()
        await shop.populate("owner")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })

        // Invalidate city items cache safely
        try {
            if (shop.city) {
                await redis.del(`items:city:${shop.city}`);
            }
        } catch (redisError) {
            console.error("Redis error:", redisError);
        }

        return res.status(201).json(shop)

    } catch (error) {
        console.error("addItem Error:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const { name, category, foodType, price } = req.body
        let image;
        
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
            if (!image) {
                return res.status(500).json({ message: "Cloudinary upload failed." })
            }
        }
        
        const updateData = { name, category, foodType, price };
        if (image) {
            updateData.image = image;
        }

        const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true })
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const shop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })

        // Invalidate city items cache safely
        try {
            if (shop.city) {
                await redis.del(`items:city:${shop.city}`);
            }
        } catch (redisError) {
            console.error("Redis error:", redisError);
        }

        return res.status(200).json(shop)

    } catch (error) {
        console.error("editItem Error:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" })
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        return res.status(200).json(item)
    } catch (error) {
        return res.status(500).json({ message: `get item error ${error}` })
    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findByIdAndDelete(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const shop = await Shop.findOne({ owner: req.userId })
        shop.items = shop.items.filter(i => i !== item._id)
        await shop.save()
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })

        // Invalidate city items cache
        if (shop.city) {
            await redis.del(`items:city:${shop.city}`);
        }

        return res.status(200).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `delete item error ${error}` })
    }
}

export const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params
        if (!city) {
            return res.status(400).json({ message: "city is required" })
        }

        // Check cache safely
        try {
            const cachedItems = await redis.get(`items:city:${city}`);
            if (cachedItems) {
                return res.status(200).json(JSON.parse(cachedItems));
            }
        } catch (redisError) {
            console.error("Redis get error:", redisError);
        }

        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        })
        
        if (!shops || shops.length === 0) {
            return res.status(200).json([]) // Return empty array instead of 400
        }
        
        const shopIds = shops.map((shop) => shop._id)

        const items = await Item.find({ shop: { $in: shopIds } })

        // Set cache safely
        try {
            await redis.set(`items:city:${city}`, JSON.stringify(items), "EX", 300);
        } catch (redisError) {
            console.error("Redis set error:", redisError);
        }

        return res.status(200).json(items)

    } catch (error) {
        console.error("getItemByCity Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" })
    }
}

export const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params
        const shop = await Shop.findById(shopId).populate("items")
        if (!shop) {
            return res.status(400).json("shop not found")
        }
        return res.status(200).json({
            shop, items: shop.items
        })
    } catch (error) {
        return res.status(500).json({ message: `get item by shop error ${error}` })
    }
}

export const searchItems = async (req, res) => {
    try {
        const { query, city } = req.query
        if (!query || !city) {
            return null
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')
        if (!shops) {
            return res.status(400).json({ message: "shops not found" })
        }
        const shopIds = shops.map(s => s._id)
        const items = await Item.find({
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]

        }).populate("shop", "name image")

        return res.status(200).json(items)

    } catch (error) {
        return res.status(500).json({ message: `search item  error ${error}` })
    }
}


export const rating = async (req, res) => {
    try {
        const { itemId, rating } = req.body

        // Validation handled by Zod

        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }

        const newCount = item.rating.count + 1
        const newAverage = (item.rating.average * item.rating.count + rating) / newCount

        item.rating.count = newCount
        item.rating.average = newAverage
        await item.save()
        return res.status(200).json({ rating: item.rating })

    } catch (error) {
        return res.status(500).json({ message: `rating error ${error}` })
    }
}