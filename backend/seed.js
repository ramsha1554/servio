import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Models
import User from './models/user.model.js';
import Shop from './models/shop.model.js';
import Item from './models/item.model.js';
import Order from './models/order.model.js';
import DeliveryAssignment from './models/deliveryAssignment.model.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (url, folder, name) => {
  try {
    console.log(`Uploading image for [${name}]...`);
    const result = await cloudinary.uploader.upload(url, {
      folder: folder,
      overwrite: true,
      public_id: name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    });
    return result.secure_url;
  } catch (error) {
    console.warn(`Warning: Failed to upload image for [${name}]. Using fallback URL.`);
    return url;
  }
};

const locations = {
  "Cidco": [75.3692, 19.9025],
  "Garkheda": [75.3652, 19.8856],
  "Osmanpura": [75.3262, 19.8762],
  "Cantonment": [75.3433, 19.8680],
  "Aurangpura": [75.3190, 19.8850],
  "Samarth Nagar": [75.3380, 19.8920],
  "N-1": [75.3520, 19.9100],
  "N-6": [75.3580, 19.9180]
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

const runSeed = async () => {
    await connectDB();
    
    console.log("Cleaning up old seed data...");
    await User.deleteMany({ email: { $ne: "admin@servio.com" } });
    await Shop.deleteMany({});
    await Item.deleteMany({});
    await Order.deleteMany({});
    await DeliveryAssignment.deleteMany({});
    console.log("Cleanup finished.");

    const getNonVegKeywords = [
        "chicken", "mutton", "fish", "prawn", "egg", 
        "keema", "lamb", "beef", "meat", "non-veg",
        "seekh", "boti", "kheema"
    ];
    
    const getFoodType = (itemName) => {
        const lower = itemName.toLowerCase();
        return getNonVegKeywords.some(k => lower.includes(k)) 
          ? "non veg" 
          : "veg";
    };

    const uniqueUnsplashIds = [
        "1599974579688-8dbdd335c77f", "1603894584373-5ac82b2ae398", "1567188040759-fb8a883dc6d8",
        "1610192244261-3f33de3f55e4", "1589301760014-d929f3979dbc", "1513104890138-7c749659a591",
        "1568901346375-23c9450c58cd", "1603133872878-684f208fb84b", "1569718212165-3a8278d5f624",
        "1601050690597-df0568f70950", "1558618666-fcd25c85cd64", "1571167366136-b57e2e29de2d",
        "1622597467836-f3285f2131b8", "1606491956689-2ea866880c84", "1606755962773-d324e0a13086",
        "1546069901-ba9599a7e63c", "1546833999-b9f581a1996d", "1601493700631-2b16ec4b4716",
        "1580915411954-282cb1b0d780", "1517248135467-4c7edcad34c4", "1565299624946-b28f40a0ae38",
        "1567620905732-2d1ec7ab7445", "1565958011703-44f9829ba187", "1484723091791-c0e7e53f0a1c",
        "1512621776951-a57141f2eefd", "1626082927389-6cd097cdc6ec", "1589119908995-c6837fa14848",
        "1586788680434-30d32443685f", "1563379091339-03b21ab4a4f8", "1541592106381-b31e9674c0e5",
        "1599487488170-d11ec9c172f0", "1540420773420-3366772f4999", "1565557623262-b51c2513a641",
        "1571091718767-18b5b1457add", "1562967963-ed7852c344f3", "1631452180519-c014fe946bc7",
        "1578985545062-69928b1d9587", "1528735602780-2552fd46c7af", "1621841957884-f4336c5df58e",
        "1554502078-ef0fc409efce", "1649168910609-0c6776104e76", "1561043433-aaf687c4cf04",
        "1645112411341-6c4fd023714a", "1631515243349-e0cb75fb8d3a", "1552611052-33e04de081de",
        "1589301760014-d929f39ce9b1", "1558961363-fa8fdf82db35", "1622597467836-f38240662c8c",
        "1546833999-b9f581a1996d", "1601050690597-df0568f70950", "1504669886280-be36f5da89ce",
        "1543339308-417163c467ed", "1565299524946-b28f40a0ae38", "1564834724105-918b73d1b9e0",
        "1604908176997-125f25cc6f3d", "1598514982205-f36b96d1e8d4", "1565557623262-b51c2513a641",
        "1511690655022-000c0f91ab0c", "1624233630663-e380540d588a", "1611077544390-e51c8901b0f5"
    ];
    let uniqueIdCounter = 0;
    const getUniqueUnsplash = () => {
        const id = uniqueUnsplashIds[uniqueIdCounter % uniqueUnsplashIds.length];
        uniqueIdCounter++;
        return `https://images.unsplash.com/photo-${id}?w=400&q=80`;
    };

    const defaultPassword = await bcrypt.hash("Servio@123", 10);

    // 1. CREATE ADMIN
    let admin = await User.findOne({ email: "admin@servio.com" });
    if (!admin) {
        admin = await User.create({
            fullName: "System Admin",
            email: "admin@servio.com",
            password: defaultPassword,
            mobile: "9000000000",
            role: "admin",
            location: { type: "Point", coordinates: locations["Osmanpura"] }
        });
    }

    // 2. CREATE CUSTOMERS (10)
    const customerNames = [
        { name: "Rahul Sharma", area: "Cidco" },
        { name: "Priya Patil", area: "Garkheda" },
        { name: "Amit Kulkarni", area: "Osmanpura" },
        { name: "Sneha Joshi", area: "Cantonment" },
        { name: "Vikram Deshmukh", area: "Aurangpura" },
        { name: "Neha Kale", area: "Samarth Nagar" },
        { name: "Suresh Jadhav", area: "N-1" },
        { name: "Pooja Wagh", area: "N-6" },
        { name: "Ramesh Pawar", area: "Cidco" },
        { name: "Kavita Shinde", area: "Garkheda" }
    ];

    const customers = [];
    for (const c of customerNames) {
        const email = `customer.${c.name.split(' ')[0].toLowerCase()}@servio.com`;
        const user = await User.create({
            fullName: c.name,
            email: email,
            password: defaultPassword,
            mobile: `9100000${customers.length.toString().padStart(3, '0')}`,
            role: "user",
            location: { type: "Point", coordinates: locations[c.area] }
        });
        customers.push({ user, area: c.area, name: c.name, email });
    }

    // 3. CREATE DELIVERY BOYS (5)
    const deliveryBoyNames = [
        { name: "Raju Gaikwad", area: "Osmanpura" },
        { name: "Sandeep More", area: "Cidco" },
        { name: "Vishal Chavan", area: "N-1" },
        { name: "Anil Raut", area: "Aurangpura" },
        { name: "Deepak Mule", area: "Garkheda" }
    ];

    const deliveryBoys = [];
    for (const d of deliveryBoyNames) {
        const email = `delivery.${d.name.split(' ')[0].toLowerCase()}@servio.com`;
        const user = await User.create({
            fullName: d.name,
            email: email,
            password: defaultPassword,
            mobile: `9200000${deliveryBoys.length.toString().padStart(3, '0')}`,
            role: "deliveryBoy",
            location: { type: "Point", coordinates: locations[d.area] }
        });
        deliveryBoys.push({ user, area: d.area, name: d.name, email });
    }

    // 4. CREATE SHOPS & OWNERS (10)
    const shopSpecs = [
        { shopName: "Spice Garden", area: "Osmanpura", category: "North Indian", isVerified: true, img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4" },
        { shopName: "Biryani House", area: "Garkheda", category: "Biryani", isVerified: true, img: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a" },
        { shopName: "Burger Hub", area: "Cidco", category: "Fast Food", isVerified: true, img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add" },
        { shopName: "Dragon Express", area: "Aurangpura", category: "Chinese", isVerified: false, img: "https://images.unsplash.com/photo-1552611052-33e04de081de" },
        { shopName: "Dosa Plaza", area: "Cantonment", category: "South Indian", isVerified: true, img: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1" },
        { shopName: "Pizza Corner", area: "Samarth Nagar", category: "Pizza", isVerified: true, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591" },
        { shopName: "Sweet Cravings", area: "N-1", category: "Sweets", isVerified: false, img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35" },
        { shopName: "Juice Lounge", area: "N-6", category: "Beverages", isVerified: true, img: "https://images.unsplash.com/photo-1622597467836-f38240662c8c" },
        { shopName: "Royal Thali", area: "Osmanpura", category: "Thali", isVerified: true, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d" },
        { shopName: "Street Bites", area: "Garkheda", category: "Snacks", isVerified: false, img: "https://images.unsplash.com/photo-1601050690597-df0568f70950" }
    ];

    const shops = [];
    const shopOwners = [];
    let itemsSeeded = 0;

    const fallbackFoodImages = [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187",
        "https://images.unsplash.com/photo-1484723091791-c0e7e53f0a1c",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
    ];

    for (const spec of shopSpecs) {
        const ownerEmail = `owner.${spec.shopName.toLowerCase().replace(' ', '')}@servio.com`;
        const owner = await User.create({
            fullName: `${spec.shopName} Owner`,
            email: ownerEmail,
            password: defaultPassword,
            mobile: `9300000${shops.length.toString().padStart(3, '0')}`,
            role: "owner",
            location: { type: "Point", coordinates: locations[spec.area] }
        });
        shopOwners.push({ user: owner, email: ownerEmail, shopName: spec.shopName, area: spec.area });

        const shopImage = await uploadImage(spec.img, "servio/shops", spec.shopName);

        const shop = await Shop.create({
            name: spec.shopName,
            image: shopImage,
            owner: owner._id,
            city: "Chhatrapati Sambhajinagar",
            state: "Maharashtra",
            address: `${spec.shopName} Main Road, ${spec.area}`,
            categories: [spec.category],
            location: { type: "Point", coordinates: locations[spec.area] },
            isVerified: spec.isVerified
        });

        // CREATE ITEMS (6 per shop)
        const itemNames = [
            `Chicken ${spec.category} Special 1`, 
            `Veg ${spec.category} Classic 2`, 
            `Premium ${spec.category} 3`, 
            `Family Chicken Bucket 4`, 
            `Spicy Mutton ${spec.category} 5`, 
            `Deluxe Veg ${spec.category} 6`
        ];
        
        for (let i = 0; i < itemNames.length; i++) {
            const foodType = getFoodType(itemNames[i]);
            // Price between 40 and 450
            const price = Math.floor(Math.random() * 411) + 40; 
            
            const foodImgUrl = getUniqueUnsplash();
            const itemImage = await uploadImage(foodImgUrl, "servio/items", `${spec.shopName} Item ${i + 1}`);
            
            const item = await Item.create({
                name: itemNames[i],
                image: itemImage,
                shop: shop._id,
                category: spec.category,
                price: price,
                foodType: foodType,
                rating: { average: 4 + (Math.random()), count: Math.floor(Math.random() * 50) + 1 }
            });
            shop.items.push(item._id);
            itemsSeeded++;
        }
        await shop.save();
        shops.push(shop);
    }

    // 5. CREATE ORDERS (20)
    const orderStatuses = [
        ...Array(5).fill("pending"),
        ...Array(4).fill("preparing"),
        ...Array(5).fill("out of delivery"),
        ...Array(6).fill("delivered")
    ];

    let assignmentsSeeded = 0;

    for (let i = 0; i < orderStatuses.length; i++) {
        const status = orderStatuses[i];
        const customerObj = customers[i % customers.length];
        const shopObj = shops[i % shops.length];
        const itemObjId = shopObj.items[0]; 
        const itemObj = await Item.findById(itemObjId);

        const isOnline = i % 2 === 0;
        const totalAmount = itemObj.price;

        let createdAt = new Date();
        if (status === "delivered") {
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
        }

        const shopOrderItems = [{
            item: itemObj._id,
            name: itemObj.name,
            price: itemObj.price,
            quantity: 1
        }];

        const shopOrder = {
            shop: shopObj._id,
            owner: shopObj.owner,
            subtotal: totalAmount,
            shopOrderItems,
            status: status
        };

        let dbOrder = await Order.create({
            user: customerObj.user._id,
            paymentMethod: isOnline ? "online" : "cod",
            deliveryAddress: {
                text: `${customerObj.name}'s Home, ${customerObj.area}`,
                latitude: locations[customerObj.area][1],
                longitude: locations[customerObj.area][0]
            },
            location: {
                type: "Point",
                coordinates: locations[customerObj.area]
            },
            totalAmount: totalAmount,
            shopOrders: [shopOrder],
            payment: isOnline,
            razorpayOrderId: isOnline ? `order_mock_${Date.now()}_${i}` : "",
            razorpayPaymentId: isOnline ? `pay_mock_${Date.now()}_${i}` : ""
        });
        
        await Order.collection.updateOne({ _id: dbOrder._id }, { $set: { createdAt: createdAt, updatedAt: createdAt } });

        const createdOrder = await Order.findById(dbOrder._id);
        const actualShopOrder = createdOrder.shopOrders[0];

        // 6. DELIVERY ASSIGNMENTS
        if (status === "out of delivery" || status === "delivered") {
            const deliveryBoyObj = deliveryBoys[i % deliveryBoys.length];
            
            if (status === "out of delivery") {
                const otp = Math.floor(1000 + Math.random() * 9000).toString();
                const otpExpires = new Date(Date.now() + 10 * 60000);
                actualShopOrder.deliveryOtp = otp;
                actualShopOrder.otpExpires = otpExpires;
            }

            actualShopOrder.assignedDeliveryBoy = deliveryBoyObj.user._id;
            if (status === "delivered") {
                actualShopOrder.deliveredAt = createdAt;
            }
            await createdOrder.save();

            if (status === "out of delivery") {
                const assignStatus = i % 2 === 0 ? "assigned" : "brodcasted"; 
                const assignment = await DeliveryAssignment.create({
                    order: createdOrder._id,
                    shop: shopObj._id,
                    shopOrderId: actualShopOrder._id,
                    brodcastedTo: [deliveryBoyObj.user._id],
                    assignedTo: assignStatus === "assigned" ? deliveryBoyObj.user._id : null,
                    status: assignStatus,
                    acceptedAt: assignStatus === "assigned" ? new Date() : null
                });
                
                actualShopOrder.assignment = assignment._id;
                await createdOrder.save();
                assignmentsSeeded++;
            }
        }
    }

    const report = `
================================
SERVIO SEED COMPLETE
================================
Seeded:
- 1 Admin
- 10 Customers
- 10 Shop Owners
- 5 Delivery Boys
- 10 Shops
- ${itemsSeeded} Items
- 20 Orders
- ${assignmentsSeeded} Delivery Assignments
================================

TEST ACCOUNTS (all passwords: Servio@123)

ADMIN:
admin@servio.com

CUSTOMERS:
${customers.map(c => `${c.email.padEnd(30)} | ${c.name.padEnd(20)} | ${c.area}`).join('\n')}

SHOP OWNERS:
${shopOwners.map(s => `${s.email.padEnd(30)} | ${s.shopName.padEnd(20)} | ${s.area}`).join('\n')}

DELIVERY BOYS:
${deliveryBoys.map(d => `${d.email.padEnd(30)} | ${d.name.padEnd(20)} | ${d.area}`).join('\n')}
================================
`;

    console.log(report);
    fs.writeFileSync('./seed-credentials.txt', report);

    console.log("Seed script finished. You can now close the script.");
    process.exit(0);
};

runSeed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
