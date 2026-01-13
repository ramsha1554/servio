
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Shop from "./models/shop.model.js";
import Item from "./models/item.model.js";
import bcryptjs from "bcryptjs";

dotenv.config({ path: "./backend/.env" });

// --- Configuration ---
const DEFAULT_PASSWORD = "password123";
const AURANGABAD_COORDS = [75.3433139, 19.8761653]; // Longitude, Latitude

// --- Data: 10 Shops in Aurangabad with User-Defined Categories ---
// NOTE: Using "Chhatrapati Sambhaji Nagar" as City to match modern Geo-APIs and User's manual entry
const CITY_NAME = "Chhatrapati Sambhaji Nagar";

const SHOPS_DATA = [
    {
        email: "owner.greenleaf@servio.com",
        name: "Green Leaf Vegetarian Cuisine",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "CIDCO, Aurangabad",
        // User Request: North Indian, Chinese, Desserts
        categories: ["North Indian", "Chinese", "Desserts"],
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop", // Green Leaf (Keep - Veg Salad Bowl)
        items: [
            { name: "Paneer Butter Masala", price: 280, category: "North Indian", foodType: "veg", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=1000&auto=format&fit=crop" },
            { name: "Veg Hakka Noodles", price: 180, category: "Chinese", foodType: "veg", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=1000&auto=format&fit=crop" },
            { name: "Gulab Jamun", price: 60, category: "Desserts", foodType: "veg", image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=1000&auto=format&fit=crop" }
        ]
    },
    {
        email: "owner.indiana@servio.com",
        name: "Indiana's Red Velvet Veg Restaurant",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "Sutgirni Chowk, Aurangabad",
        // User Request: South Indian, Fast Food, Desserts
        categories: ["South Indian", "Fast Food", "Desserts"],
        image: "https://images.unsplash.com/photo-1579954115545-a95591f28df8?q=80&w=1000&auto=format&fit=crop", // Modern Cafe/Dessert
        items: [
            { name: "Masala Dosa", price: 120, category: "South Indian", foodType: "veg", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1000&auto=format&fit=crop" },
            { name: "Veg Cheese Burger", price: 150, category: "Fast Food", foodType: "veg", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000&auto=format&fit=crop" },
            { name: "Red Velvet Jar Cake", price: 180, category: "Desserts", foodType: "veg", image: "https://images.unsplash.com/photo-1616031037011-087000171ea3?q=80&w=1000&auto=format&fit=crop" }
        ]
    },
    {
        email: "owner.shahibhoj@servio.com",
        name: "Shahi Bhoj Thali Restaurant",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "Town Centre, CIDCO, Aurangabad",
        // User Request: North Indian, Main Course, Snacks
        categories: ["North Indian", "Main Course", "Snacks"],
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop", // Keep - Thali
        items: [
            { name: "Unlimited Veg Thali", price: 350, category: "Main Course", foodType: "veg", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop" },
            { name: "Chole Bhature", price: 180, category: "North Indian", foodType: "veg", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop" },
            { name: "Crispy Corn", price: 140, category: "Snacks", foodType: "veg", image: "https://images.unsplash.com/photo-1554502078-ef0fc409efce?q=80&w=1000&auto=format&fit=crop" }
        ]
    },
    {
        email: "owner.greatsagar@servio.com",
        name: "Great Sagar Restaurant",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "Near Bhadkal Gate, Aurangabad",
        // User Request: Biryani, North Indian, Seafood (Mapped to Valid Enums: Main Course, North Indian)
        categories: ["North Indian", "Main Course"],
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1000&auto=format&fit=crop", // Keep - Biryani Pot
        items: [
            { name: "Chicken Dum Biryani", price: 280, category: "Main Course", foodType: "non veg", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop" },
            { name: "Butter Chicken", price: 320, category: "North Indian", foodType: "non veg", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1000&auto=format&fit=crop" },
            { name: "Fish Fry", price: 400, category: "Main Course", foodType: "non veg", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1000&auto=format&fit=crop" }
        ]
    },
    {
        email: "owner.vgan@servio.com",
        name: "The V-gan Veg Restaurant",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "Bansilal Nagar, Aurangabad",
        // User Request: Main Course, Salads, Healthy (Mapped to Main Course, Snacks - 'Others' is also an option but Snacks is more discoverable)
        categories: ["Main Course", "Snacks"],
        image: "https://images.unsplash.com/photo-1540914124281-342587941389?q=80&w=1000&auto=format&fit=crop", // Healthy Salad Bowl (New) // Green Leaf (Keep - Veg Salad Bowl)
        items: [
            { name: "Tofu Spinach Curry", price: 260, category: "Main Course", foodType: "veg", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000&auto=format&fit=crop" },
            { name: "Fresh Green Salad", price: 150, category: "Snacks", foodType: "veg", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop" }
        ]
    },
    {
        email: "owner.indianaveg@servio.com",
        name: "Indiana Veg Restaurant and Cake Boutique",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "CIDCO, Aurangabad",
        // User Request: Desserts, Pizza, Fast Food
        categories: ["Desserts", "Pizza", "Fast Food"],
        image: "https://images.unsplash.com/photo-1520606543883-8a9d18b6e632?q=80&w=1000&auto=format&fit=crop", // Bakery Window
        items: [
            { name: "Margherita Pizza", price: 250, category: "Pizza", foodType: "veg", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop" },
            { name: "Chocolate Brownie", price: 120, category: "Desserts", foodType: "veg", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop" },
            { name: "French Fries", price: 100, category: "Fast Food", foodType: "veg", image: "https://images.unsplash.com/photo-1541592106381-b31e9674c0e5?q=80&w=1000&auto=format&fit=crop" }
        ]
    },
    {
        email: "owner.madhuban@servio.com",
        name: "Madhuban Restaurant Aurangabad",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "Rama International, Aurangabad",
        // User Request: Multi-Cuisine (Mapped to North Indian, Chinese, Main Course)
        categories: ["North Indian", "Chinese", "Main Course"],
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop", // Elegant Restaurant Interior
        items: [
            { name: "Kadai Paneer", price: 340, category: "North Indian", foodType: "veg", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=1000&auto=format&fit=crop" },
            { name: "Fried Rice", price: 220, category: "Chinese", foodType: "veg", image: "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?q=80&w=1000&auto=format&fit=crop" },
            { name: "Vegetable Au Gratin", price: 300, category: "Main Course", foodType: "veg", image: "https://images.unsplash.com/photo-1649168910609-0c6776104e76?q=80&w=1000&auto=format&fit=crop" }
        ]
    },
    {
        email: "owner.naivedya@servio.com",
        name: "Naivedya Veg Thali Restaurant",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "Jalna Road, Aurangabad",
        // User Request: Thali, North Indian, Snacks (Thali -> Main Course)
        categories: ["Main Course", "North Indian", "Snacks"],
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop", // Indian Curry Bowl (Distinct from Shahi Bhoj)
        items: [
            { name: "Deluxe Thali", price: 320, category: "Main Course", foodType: "veg", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop" },
            { name: "Paneer Kofta", price: 240, category: "North Indian", foodType: "veg", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop" },
            { name: "Dhokla", price: 60, category: "Snacks", foodType: "veg", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop" }
        ]
    },
    {
        email: "owner.fiveelements@servio.com",
        name: "The Five Elements",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "Cidco Town Centre, Aurangabad",
        // User Request: North Indian, Main Course
        categories: ["North Indian", "Main Course"],
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop", // Outdoor/Atmospheric Dining
        items: [
            { name: "Dal Makhani", price: 240, category: "North Indian", foodType: "veg", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop" },
            { name: "Butter Naan", price: 40, category: "North Indian", foodType: "veg", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop" }
        ]
    },
    {
        email: "owner.baraka@servio.com",
        name: "Baraka Kitchen",
        city: CITY_NAME,
        state: "Maharashtra",
        address: "CIDCO, Aurangabad",
        // User Request: Family Meals (-> Main Course), Fast Food, Sandwiches
        categories: ["Main Course", "Fast Food", "Sandwiches"],
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1000&auto=format&fit=crop", // Burger/Fast Food Spread
        items: [
            { name: "Chicken Club Sandwich", price: 180, category: "Sandwiches", foodType: "non veg", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1000&auto=format&fit=crop" },
            { name: "Crispy Chicken Burger", price: 200, category: "Fast Food", foodType: "non veg", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop" },
            { name: "Family Chicken Bucket", price: 550, category: "Main Course", foodType: "non veg", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop" }
        ]
    }
];

const seed = async () => {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB!");

        const hashedPassword = await bcryptjs.hash(DEFAULT_PASSWORD, 10);

        // REMOVED DESTRUCTIVE CLEANUP
        // Instead of deleting everything, we will update existing records.
        // This preserves ObjectIDs and prevents orphaned items.

        for (let i = 0; i < SHOPS_DATA.length; i++) {
            const shopData = SHOPS_DATA[i];
            const ownerEmail = shopData.email;

            console.log(`Processing Shop ${i + 1}/10: ${shopData.name}`);

            // 1. Create/Find Owner
            let owner = await User.findOne({ email: ownerEmail });
            if (!owner) {
                owner = await User.create({
                    fullName: `Owner ${shopData.name.substring(0, 20)}`,
                    email: ownerEmail,
                    password: hashedPassword,
                    mobile: `9999999${i.toString().padStart(3, '0')}`,
                    role: "owner",
                    isOtpVerified: true,
                    location: { type: 'Point', coordinates: AURANGABAD_COORDS }
                });
                console.log(`  -> Created Owner: ${ownerEmail}`);
            } else {
                console.log(`  -> Found Owner: ${ownerEmail}`);
                if (owner.role !== "owner") {
                    owner.role = "owner";
                    await owner.save();
                }
            }

            // 2. Create/Update Shop
            let shop = await Shop.findOne({ owner: owner._id });
            if (!shop) {
                shop = await Shop.create({
                    name: shopData.name,
                    city: shopData.city,
                    state: shopData.state,
                    address: shopData.address,
                    image: shopData.image,
                    owner: owner._id,
                    categories: shopData.categories,
                    location: {
                        type: 'Point',
                        coordinates: AURANGABAD_COORDS
                    },
                    items: []
                });
                console.log(`  -> Created Shop: ${shop.name}`);
            } else {
                shop.name = shopData.name;
                shop.city = shopData.city;
                shop.state = shopData.state;
                shop.address = shopData.address;
                shop.image = shopData.image;
                shop.categories = shopData.categories;
                shop.location = {
                    type: 'Point',
                    coordinates: AURANGABAD_COORDS
                };
                await shop.save();
                console.log(`  -> Updated Shop: ${shop.name}`);
            }

            // 3. Create Items
            let itemIds = [];
            for (const itemData of shopData.items) {
                // Determine category directly from item data
                let itemCategory = itemData.category;

                let item = await Item.findOne({ shop: shop._id, name: itemData.name });
                if (!item) {
                    item = await Item.create({
                        name: itemData.name,
                        image: itemData.image,
                        shop: shop._id,
                        category: itemCategory,
                        price: itemData.price,
                        foodType: itemData.foodType
                    });
                    console.log(`    -> Created Item: ${item.name}`);
                } else {
                    // Update existing item details
                    let needsSave = false;
                    if (item.category !== itemCategory) {
                        item.category = itemCategory;
                        needsSave = true;
                    }
                    if (item.price !== itemData.price) {
                        item.price = itemData.price;
                        needsSave = true;
                    }
                    if (item.foodType !== itemData.foodType) {
                        item.foodType = itemData.foodType;
                        needsSave = true;
                    }
                    if (needsSave) await item.save();
                    // console.log(`    -> Updated Item: ${item.name}`); // Optional logging
                }
                itemIds.push(item._id);
            }

            // 4. Link Items to Shop
            // ensure shop.items matches itemIds exactly
            shop.items = itemIds;
            await shop.save();
            console.log(`  -> Linked ${itemIds.length} items to shop.`);
        }

        console.log("\nSeeding Completed Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding Failed:", error);
        process.exit(1);
    }
};

seed();
