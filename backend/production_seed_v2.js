import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Shop from './models/shop.model.js';
import Item from './models/item.model.js';
import User from './models/user.model.js';
import { uploadManagedImage } from './utils/seeder/core/uploader.js';

dotenv.config();

const CSB_CITY = "Chhatrapati Sambhajinagar";
const PASSWORD = "ServioOwner@2026";

const AREAS = {
    "Cidco": { coords: [75.3600, 19.8900], tier: "Mid" },
    "Osmanpura": { coords: [75.3200, 19.8700], tier: "Mid" },
    "Garkheda": { coords: [75.3500, 19.8500], tier: "Budget" },
    "Nirala Bazar": { coords: [75.3300, 19.8800], tier: "Premium" },
    "Aurangabad Camp": { coords: [75.3100, 19.8950], tier: "Premium" },
    "Waluj": { coords: [75.2400, 19.8400], tier: "Budget" },
    "Hudco Colony": { coords: [75.3400, 19.9100], tier: "Budget" },
    "Cantonment": { coords: [75.3000, 19.8600], tier: "Premium" }
};

const CATEGORIES = [
    "Snacks", "Main Course", "Desserts", "Pizza", "Burgers",
    "Sandwiches", "South Indian", "North Indian", "Chinese",
    "Fast Food", "Biryani", "Thali", "Beverages", "Sweets"
];

// 100% Verified Working Unsplash Food IDs
const build = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;
const VERIFIED_IDS = [
    "1546069901-ba9599a7e63c", "1513104890138-7c749659a591", "1568901346375-23c9450c58cd",
    "1540189549336-e6e99c3679fe", "1565299624946-b28f40a0ae38", "1567306226416-28f0efdc88ce",
    "1555939594-58d7cb561ad1", "1565958011703-44f9829ba187", "1512621776951-a57141f2eefd",
    "1473093226795-af9932fe5856", "1476224203421-9ac3993c3911", "1493770348161-369560ae357d"
];

const MENU_DATA = {
    "Biryani": [{name: "Hyderabadi Biryani", foodType: "non veg"}, {name: "Veg Biryani", foodType: "veg"}, {name: "Egg Biryani", foodType: "non veg"}, {name: "Paneer Biryani", foodType: "veg"}, {name: "Mutton Biryani", foodType: "non veg"}, {name: "Chicken Biryani", foodType: "non veg"}, {name: "Keema Biryani", foodType: "non veg"}, {name: "Fish Biryani", foodType: "non veg"}],
    "North Indian": [{name: "Paneer Masala", foodType: "veg"}, {name: "Dal Fry", foodType: "veg"}, {name: "Butter Chicken", foodType: "non veg"}, {name: "Naan", foodType: "veg"}, {name: "Roti", foodType: "veg"}, {name: "Aloo Gobi", foodType: "veg"}, {name: "Chicken Tikka", foodType: "non veg"}, {name: "Malai Kofta", foodType: "veg"}],
    "South Indian": [{name: "Masala Dosa", foodType: "veg"}, {name: "Idli", foodType: "veg"}, {name: "Vada", foodType: "veg"}, {name: "Uttapam", foodType: "veg"}, {name: "Upma", foodType: "veg"}, {name: "Pongal", foodType: "veg"}, {name: "Curd Rice", foodType: "veg"}, {name: "Lemon Rice", foodType: "veg"}],
    "Chinese": [{name: "Noodles", foodType: "veg"}, {name: "Manchurian", foodType: "veg"}, {name: "Fried Rice", foodType: "veg"}, {name: "Spring Roll", foodType: "veg"}, {name: "Chilli Chicken", foodType: "non veg"}, {name: "Soup", foodType: "veg"}, {name: "Momos", foodType: "veg"}, {name: "Gobi Manchurian", foodType: "veg"}],
    "Pizza": [{name: "Veg Pizza", foodType: "veg"}, {name: "Cheese Pizza", foodType: "veg"}, {name: "Chicken Pizza", foodType: "non veg"}, {name: "Corn Pizza", foodType: "veg"}, {name: "Mushroom Pizza", foodType: "veg"}, {name: "Paneer Pizza", foodType: "veg"}, {name: "Onion Pizza", foodType: "veg"}, {name: "Capsicum Pizza", foodType: "veg"}],
    "Burgers": [{name: "Veg Burger", foodType: "veg"}, {name: "Chicken Burger", foodType: "non veg"}, {name: "Cheese Burger", foodType: "veg"}, {name: "Paneer Burger", foodType: "veg"}, {name: "Aloo Burger", foodType: "veg"}, {name: "Crispy Burger", foodType: "veg"}, {name: "Maharaja Burger", foodType: "non veg"}, {name: "Zinger Burger", foodType: "non veg"}],
    "Thali": [{name: "Veg Thali", foodType: "veg"}, {name: "Mini Thali", foodType: "veg"}, {name: "Special Thali", foodType: "veg"}, {name: "Non Veg Thali", foodType: "non veg"}, {name: "Puran Poli Thali", foodType: "veg"}, {name: "Punjabi Thali", foodType: "veg"}, {name: "South Thali", foodType: "veg"}, {name: "North Thali", foodType: "veg"}],
    "Snacks": [{name: "Samosa", foodType: "veg"}, {name: "Vada Pav", foodType: "veg"}, {name: "Pakoda", foodType: "veg"}, {name: "Puff", foodType: "veg"}, {name: "Cutlet", foodType: "veg"}, {name: "Chips", foodType: "veg"}, {name: "Popcorn", foodType: "veg"}, {name: "Nachos", foodType: "veg"}],
    "Fast Food": [{name: "Misal Pav", foodType: "veg"}, {name: "Pav Bhaji", foodType: "veg"}, {name: "Frankie", foodType: "veg"}, {name: "Roll", foodType: "veg"}, {name: "Shawarma", foodType: "non veg"}, {name: "Vada Pav", foodType: "veg"}, {name: "Dabeli", foodType: "veg"}, {name: "Chole Bhature", foodType: "veg"}],
    "Sandwiches": [{name: "Veg Sandwich", foodType: "veg"}, {name: "Cheese Sandwich", foodType: "veg"}, {name: "Club Sandwich", foodType: "veg"}, {name: "Grilled Sandwich", foodType: "veg"}, {name: "Chilli Sandwich", foodType: "veg"}, {name: "Mayo Sandwich", foodType: "veg"}, {name: "Chicken Sandwich", foodType: "non veg"}, {name: "Paneer Sandwich", foodType: "veg"}],
    "Desserts": [{name: "Cake", foodType: "veg"}, {name: "Ice Cream", foodType: "veg"}, {name: "Pastry", foodType: "veg"}, {name: "Brownie", foodType: "veg"}, {name: "Mousse", foodType: "veg"}, {name: "Pudding", foodType: "veg"}, {name: "Gulab Jamun", foodType: "veg"}, {name: "Jalebi", foodType: "veg"}],
    "Beverages": [{name: "Tea", foodType: "veg"}, {name: "Coffee", foodType: "veg"}, {name: "Milkshake", foodType: "veg"}, {name: "Juice", foodType: "veg"}, {name: "Lassi", foodType: "veg"}, {name: "Soda", foodType: "veg"}, {name: "Water", foodType: "veg"}, {name: "Cold Coffee", foodType: "veg"}],
    "Sweets": [{name: "Ladoo", foodType: "veg"}, {name: "Barfi", foodType: "veg"}, {name: "Peda", foodType: "veg"}, {name: "Kaju Katli", foodType: "veg"}, {name: "Halwa", foodType: "veg"}, {name: "Rasgulla", foodType: "veg"}, {name: "Gulab Jamun", foodType: "veg"}, {name: "Rasmalai", foodType: "veg"}],
    "Main Course": [{name: "Paneer Tikka", foodType: "veg"}, {name: "Dal Makhani", foodType: "veg"}, {name: "Kofta", foodType: "veg"}, {name: "Mix Veg", foodType: "veg"}, {name: "Chicken Curry", foodType: "non veg"}, {name: "Fish Fry", foodType: "non veg"}, {name: "Egg Curry", foodType: "non veg"}, {name: "Mutton Curry", foodType: "non veg"}]
};

const RESTAURANT_NAMES = {
    "Biryani": ["Hotel Kohinoor", "Lucky Biryani", "Paradise", "Al-Baik", "Biryani Junction"],
    "North Indian": ["Grand Curry", "Pind Balluchi", "Sher-E-Punjab", "Spice Route", "Khyber"],
    "South Indian": ["Sagar Ratna", "Anna's Idli", "Dakshin", "Malgudi", "Sree Krishna"],
    "Chinese": ["Dragon Wok", "Mainland China", "Uncle Wong", "Red Lantern", "Bamboo"],
    "Pizza": ["Pizza Express", "Oven Story", "Eagle Boys", "Joey's Pizza", "Le Pizza"],
    "Burgers": ["Burger King", "Wat-A-Burger", "Burger Club", "Fat Burger", "Smokin Burgers"],
    "Thali": ["Purohit Thali", "Rajdhani", "Sukanta", "Aaswad", "Rama Nayak"],
    "Snacks": ["Haldiram", "Bikanervala", "Chitale", "Gaurav Snacks", "Tiwari Bros"],
    "Fast Food": ["Street Bites", "Chai Point", "The Rollery", "Goli Vada Pav", "Jumbo King"],
    "Sandwiches": ["Sandwich Express", "Bread Box", "Subway Stories", "Toasties", "The Melt"],
    "Desserts": ["Natural Ice Cream", "Giani", "Keventers", "Dessert Heaven", "Corner House"],
    "Beverages": ["Coffee House", "Blue Tokai", "Third Wave", "Cafe Coffee Day", "Reading Room"],
    "Sweets": ["Kanhaiya Sweets", "Gowardhan", "Om Sai Sweets", "Mishra Pedha", "Bansi Lal"],
    "Main Course": ["Rama International", "Vittal Kamat", "Green Olive", "Saffron", "The Leaf"]
};

async function seedData() {
    try {
        console.log("Starting production seed v2.3 (Final Resilience) for CSB...");
        await mongoose.connect(process.env.MONGODB_URL, { tls: true, tlsAllowInvalidCertificates: true });
        console.log("Connected to MongoDB.");

        const seededShops = [];
        const categoryUsageCount = {};
        CATEGORIES.forEach(c => categoryUsageCount[c] = 0);

        const areasList = Object.keys(AREAS);

        for (let i = 0; i < 70; i++) {
            const areaName = areasList[i % areasList.length];
            const area = AREAS[areaName];
            const category = CATEGORIES[i % CATEGORIES.length];
            const baseName = RESTAURANT_NAMES[category][Math.floor(Math.random() * RESTAURANT_NAMES[category].length)];
            const shopName = `${baseName} ${areaName} X${i}`;

            const existingShop = await Shop.findOne({ name: shopName });
            if (existingShop) {
                categoryUsageCount[category]++;
                continue;
            }

            console.log(`Processing [${i+1}/70]: ${shopName}...`);

            const ownerEmail = `${shopName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.csb@servio.com`;
            let owner = await User.findOne({ email: ownerEmail });
            if (!owner) {
                const hashedPassword = await bcrypt.hash(PASSWORD, 10);
                owner = await User.create({
                    fullName: `${shopName} Owner`,
                    email: ownerEmail,
                    password: hashedPassword,
                    mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
                    role: "owner",
                    isOtpVerified: true
                });
            }

            const shopImgSource = build(VERIFIED_IDS[i % VERIFIED_IDS.length]);
            const shopUpload = await uploadManagedImage(shopImgSource, 'servio/production/restaurants', shopName);
            if (!shopUpload) continue;

            const shop = await Shop.create({
                name: shopName,
                image: shopUpload.secure_url,
                owner: owner._id,
                city: CSB_CITY,
                state: "Maharashtra",
                address: `${Math.floor(Math.random() * 500 + 1)}, Main Road, ${areaName}, CSB`,
                categories: [category],
                location: { type: 'Point', coordinates: [area.coords[0] + (Math.random() - 0.5) * 0.005, area.coords[1] + (Math.random() - 0.5) * 0.005] },
                isVerified: true
            });

            const itemsToCreate = MENU_DATA[category];
            const itemIds = [];

            for (let j = 0; j < itemsToCreate.length; j++) {
                const itemTemplate = itemsToCreate[j];
                const price = area.tier === "Premium" ? 300 + j*20 : (area.tier === "Mid" ? 150 + j*15 : 80 + j*10);
                
                const itemImgSource = build(VERIFIED_IDS[(i + j + 1) % VERIFIED_IDS.length]);
                const itemUpload = await uploadManagedImage(itemImgSource, 'servio/production/items', `${shopName}_${itemTemplate.name}`);
                
                if (itemUpload) {
                    const newItem = await Item.create({
                        name: itemTemplate.name,
                        image: itemUpload.secure_url,
                        shop: shop._id,
                        category: category,
                        price: price,
                        foodType: itemTemplate.foodType,
                        rating: { average: (3.8 + Math.random()).toFixed(1), count: 50 + j*5 }
                    });
                    itemIds.push(newItem._id);
                }
            }

            shop.items = itemIds;
            await shop.save();
            seededShops.push({ name: shopName, email: ownerEmail, password: PASSWORD });
            categoryUsageCount[category]++;
            console.log(`✓ Seeded ${shopName} with ${itemIds.length} items.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("FATAL ERROR:", error);
        process.exit(1);
    }
}
seedData();
