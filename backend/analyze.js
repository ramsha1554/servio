import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shop from './models/shop.model.js';
import Item from './models/item.model.js';
import Order from './models/order.model.js';
import User from './models/user.model.js';
import DeliveryAssignment from './models/deliveryAssignment.model.js';
import fs from 'fs';

dotenv.config();

const report = {};

const analyze = async () => {
    await mongoose.connect(process.env.MONGODB_URL);

    const shops = await Shop.find().populate('items');
    report.problem1 = [];
    for (const shop of shops) {
        if (!shop.items || shop.items.length === 0) continue;
        for (const item of shop.items) {
            if (!shop.categories.includes(item.category)) {
                report.problem1.push({ shopName: shop.name, shopCats: shop.categories, itemName: item.name, itemCat: item.category });
            }
        }
    }

    const items = await Item.find();
    report.problem2 = [];
    for (const item of items) {
        if (item.image.includes("unsplash")) {
            report.problem2.push({ name: item.name, url: item.image });
        }
    }

    const dupItemImages = await Item.aggregate([
        { $group: { _id: "$image", count: { $sum: 1 }, names: { $push: "$name" } } },
        { $match: { count: { $gt: 1 } } }
    ]);
    const dupShopImages = await Shop.aggregate([
        { $group: { _id: "$image", count: { $sum: 1 }, names: { $push: "$name" } } },
        { $match: { count: { $gt: 1 } } }
    ]);
    report.problem3 = { items: dupItemImages, shops: dupShopImages };

    report.problem4 = [];
    for (const item of items) {
        const nameL = item.name.toLowerCase();
        if ((nameL.includes('chicken') || nameL.includes('mutton') || nameL.includes('fish') || nameL.includes('egg') || nameL.includes('non veg')) && item.foodType === 'veg') {
            report.problem4.push({ name: item.name, foodType: item.foodType });
        }
        if ((nameL.includes('paneer') || nameL.includes('veg') || nameL.includes('dosa') || nameL.includes('dal')) && !nameL.includes('non') && item.foodType === 'non veg') {
            report.problem4.push({ name: item.name, foodType: item.foodType });
        }
    }

    report.problem6 = [];
    for (const shop of shops) {
        report.problem6.push({ name: shop.name, address: shop.address, city: shop.city, coordinates: shop.location.coordinates });
    }

    const distinctItemCats = await Item.distinct("category");
    const distinctShopCats = await Shop.distinct("categories");
    report.problem8 = { distinctItemCats, distinctShopCats };

    fs.writeFileSync('analysis.json', JSON.stringify(report, null, 2));
    process.exit(0);
}
analyze();
