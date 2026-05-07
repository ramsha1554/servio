import mongoose from 'mongoose';
import dotenv from 'dotenv';
import util from 'util';

// Models
import User from './models/user.model.js';
import Shop from './models/shop.model.js';
import Item from './models/item.model.js';
import Order from './models/order.model.js';
import DeliveryAssignment from './models/deliveryAssignment.model.js';

dotenv.config();

const logSection = (title) => console.log(`\n\n=== ${title} ===`);
const logQuery = (desc, data) => {
    console.log(`\n--- ${desc} ---`);
    console.log(util.inspect(data, { showHidden: false, depth: null, colors: false }));
};

const runAudit = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    
    logSection("SHOP AUDIT");
    
    const shops = await Shop.find({}, { name: 1, city: 1, address: 1, categories: 1, isVerified: 1 }).lean();
    logQuery("All shops with categories and areas", shops);
    
    const missingCats = await Shop.countDocuments({
        $or: [
            { categories: { $exists: false } },
            { categories: { $size: 0 } },
            { categories: null }
        ]
    });
    logQuery("Shops with empty/missing categories count", missingCats);

    logSection("ITEM AUDIT");
    
    const items = await Item.find({}, { name: 1, category: 1, foodType: 1, price: 1, image: 1, shop: 1 }).lean();
    logQuery("All items grouped by shop", items);
    
    const missingImages = await Item.countDocuments({
        $or: [
            { image: { $exists: false } },
            { image: null },
            { image: "" }
        ]
    });
    logQuery("Items with missing images count", missingImages);
    
    const missingCategoryItems = await Item.countDocuments({
        $or: [
            { category: { $exists: false } },
            { category: null }
        ]
    });
    logQuery("Items with missing category count", missingCategoryItems);
    
    logSection("CROSS-REFERENCE CHECK");
    
    const crossRef = await Shop.aggregate([
        {
            $lookup: {
                from: "items",
                localField: "_id",
                foreignField: "shop",
                as: "shopItems"
            }
        },
        {
            $project: {
                name: 1,
                categories: 1,
                address: 1,
                itemCount: { $size: "$shopItems" },
                itemNames: "$shopItems.name",
                itemCategories: "$shopItems.category",
                itemImages: "$shopItems.image"
            }
        }
    ]);
    logQuery("For each shop, list its items", crossRef);
    
    logSection("IMAGE AUDIT");
    
    const shopImages = await Shop.find({}, { name: 1, image: 1 }).lean();
    logQuery("Shop images", shopImages);
    
    const itemImages = await Item.find({}, { name: 1, image: 1 }).limit(20).lean();
    logQuery("Item images (limit 20)", itemImages);
    
    logSection("ORDER AUDIT");
    
    const orderStatuses = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    logQuery("Order statuses distribution", orderStatuses);
    
    const shopOrderStatuses = await Order.aggregate([
        { $unwind: "$shopOrders" },
        { $group: { _id: "$shopOrders.status", count: { $sum: 1 } } }
    ]);
    logQuery("ShopOrders status distribution", shopOrderStatuses);
    
    const paymentDist = await Order.aggregate([
        { $group: { 
            _id: "$paymentMethod", 
            count: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" }
        }}
    ]);
    logQuery("Payment distribution", paymentDist);
    
    logSection("USER AUDIT");
    
    const roleDist = await User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    logQuery("User roles distribution", roleDist);
    
    const missingLocationUsers = await User.find({
        $or: [
            { "location.coordinates": { $exists: false } },
            { "location.coordinates": { $size: 0 } }
        ]
    }, { fullName: 1, role: 1, email: 1 }).lean();
    logQuery("Users with missing location", missingLocationUsers);

    // Problem 3 Queries
    logSection("PROBLEM 3: DUPLICATE IMAGES");
    const dupItemImages = await Item.aggregate([
        { $group: { _id: "$image", count: { $sum: 1 }, names: { $push: "$name" } } },
        { $match: { count: { $gt: 1 } } }
    ]);
    logQuery("Duplicate item images", dupItemImages);

    const dupShopImages = await Shop.aggregate([
        { $group: { _id: "$image", count: { $sum: 1 }, names: { $push: "$name" } } },
        { $match: { count: { $gt: 1 } } }
    ]);
    logQuery("Duplicate shop images", dupShopImages);

    // Problem 5 Query
    logSection("PROBLEM 5: UNREALISTIC PRICES");
    const badPrices = await Item.find({ 
        $or: [{ price: { $lt: 30 } }, { price: { $gt: 500 } }]
    }, { name: 1, price: 1, shop: 1 }).lean();
    logQuery("Unrealistic prices", badPrices);

    // Problem 7 Query
    logSection("PROBLEM 7: MISSING SHOP-ITEM RELATIONSHIP");
    const missingItemsShop = await Shop.find({ 
        $or: [
            { items: { $exists: false } },
            { items: { $size: 0 } }
        ]
    }, { name: 1, items: 1 }).lean();
    logQuery("Shops with missing items relationship", missingItemsShop);
    
    console.log("\nAudit complete.");
    process.exit(0);
};

runAudit();
