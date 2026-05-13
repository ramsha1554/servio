import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import User from '../../../models/user.model.js';
import Shop from '../../../models/shop.model.js';
import Item from '../../../models/item.model.js';
import { uploadManagedImage } from './uploader.js';
import { validateData, shopSchema, itemSchema, ownerSchema } from './validator.js';
import { imageLibrary } from '../data/image_library.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, '../state.json');
const CREDENTIALS_FILE = path.join(__dirname, '../generated_owner_credentials.json');

const loadState = () => {
    if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
    return { completedRestaurants: [] };
};

const saveState = (state) => {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
};

const generateSecurePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+";
    const all = uppercase + lowercase + numbers + symbols;
    
    let password = "";
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += symbols[crypto.randomInt(0, symbols.length)];
    
    for (let i = 4; i < 12; i++) {
        password += all[crypto.randomInt(0, all.length)];
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const getUnsplashUrl = (cuisine, index = 0) => {
    const pool = imageLibrary[cuisine]?.["Hero"] || imageLibrary[cuisine]?.["Generic"] || imageLibrary["Restaurants"]["Generic"];
    return pool[index % pool.length];
};

const getRestaurantUrl = (cuisine, index = 0) => {
    const pool = imageLibrary[cuisine]?.["Hero"] || imageLibrary["Restaurants"]["Generic"];
    return pool[index % pool.length];
};

export const runSeederEngine = async (options) => {
    const { dryRun, reset, exportCredentials, force, verbose, limit } = options;
    const state = reset ? { completedRestaurants: [] } : loadState();
    let credentials = [];
    
    if (fs.existsSync(CREDENTIALS_FILE) && !reset) {
        try {
            credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
        } catch (e) {
            console.warn("Could not parse existing credentials, starting fresh.");
        }
    }
    
    let duplicatesPrevented = 0;

    const { cityData, restaurantNames, menuTemplates, runDiagnostics } = await import('../data_registry.js');

    const diagnostics = runDiagnostics();
    if (diagnostics.errors.length > 0) {
        console.error("\n❌ SEEDER DATA VALIDATION FAILED:");
        diagnostics.errors.forEach(err => console.error(`  - ${err}`));
        throw new Error("Seeder data integrity check failed.");
    }

    const targetCount = limit || 20;
    const cities = Object.keys(cityData);

    for (let i = 0; i < targetCount; i++) {
        const cityName = cities[i % cities.length];
        const cityInfo = cityData[cityName];
        
        if (!cityInfo.specialties || cityInfo.specialties.length === 0) continue;
        
        const cuisine = cityInfo.specialties[Math.floor(Math.random() * cityInfo.specialties.length)];
        const restaurantBaseName = restaurantNames[cuisine][i % restaurantNames[cuisine].length];
        const shopName = `${restaurantBaseName} ${cityName}`;

        if (state.completedRestaurants.includes(shopName) && !reset) {
            duplicatesPrevented++;
            continue;
        }

        console.log(`\n[${i + 1}/${targetCount}] Processing: ${shopName} (${cuisine})`);

        const cuisineTemplate = menuTemplates[cuisine];

        // 1. Prepare Data
        const ownerEmail = `owner.${shopName.toLowerCase().replace(/[^a-z0-9]/g, '')}@servio.com`;
        const rawOwner = {
            fullName: `${restaurantBaseName} Proprietor`,
            email: ownerEmail,
            mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
            role: 'owner'
        };

        const rawShop = {
            name: shopName,
            city: cityName,
            state: cityInfo.state,
            address: `${crypto.randomInt(1, 999)}, MG Road, ${cityName}`,
            categories: [cuisine],
            location: {
                type: 'Point',
                coordinates: [
                    cityInfo.coords[0] + (Math.random() - 0.5) * 0.01,
                    cityInfo.coords[1] + (Math.random() - 0.5) * 0.01
                ]
            }
        };

        const validOwnerData = validateData(ownerSchema, rawOwner);
        const validShopData = validateData(shopSchema, rawShop);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const plainPassword = generateSecurePassword();
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            
            let owner = await User.findOne({ email: ownerEmail }).session(session);
            if (!owner) {
                owner = await User.create([{
                    ...validOwnerData,
                    password: hashedPassword,
                    isOtpVerified: true
                }], { session });
                owner = owner[0];
                
                credentials.push({
                    restaurant: shopName,
                    ownerName: validOwnerData.fullName,
                    email: ownerEmail,
                    mobile: validOwnerData.mobile,
                    password: plainPassword
                });
            }

            // Shop Image with Fallback
            let shopImgUrl = getRestaurantUrl(cuisine, i);
            let uploadResult = await uploadManagedImage(shopImgUrl, 'servio/production/restaurants', shopName);
            
            if (!uploadResult) {
                // Last resort fallback
                shopImgUrl = imageLibrary["Restaurants"]["Generic"][0];
                uploadResult = await uploadManagedImage(shopImgUrl, 'servio/production/restaurants', shopName);
            }
            if (!uploadResult) throw new Error("Critical: Restaurant image upload failed even with fallback.");

            let shop = await Shop.findOne({ name: shopName, city: cityName }).session(session);
            if (!shop) {
                shop = await Shop.create([{
                    ...validShopData,
                    image: uploadResult.secure_url,
                    owner: owner._id,
                    isVerified: true
                }], { session });
                shop = shop[0];
            }

            const itemIds = [];

            for (let j = 0; j < cuisineTemplate.items.length; j++) {
                const item = cuisineTemplate.items[j];
                const itemData = validateData(itemSchema, {
                    ...item,
                    category: cuisineTemplate.category, 
                    price: ["Mumbai", "Pune"].includes(cityName) ? Math.floor(item.priceRange[0] * 1.2) : item.priceRange[0]
                });

                let itemImgUrl = getUnsplashUrl(cuisine, i + j);
                let itemUpload = await uploadManagedImage(itemImgUrl, 'servio/production/items', `${shopName}_${itemData.name}`);
                
                if (!itemUpload) {
                    itemImgUrl = imageLibrary["Restaurants"]["Generic"][1];
                    itemUpload = await uploadManagedImage(itemImgUrl, 'servio/production/items', `${shopName}_${itemData.name}`);
                }

                if (!itemUpload) continue;

                const newItems = await Item.create([{
                    ...itemData,
                    image: itemUpload.secure_url,
                    shop: shop._id,
                    rating: {
                        average: (3.8 + Math.random() * 1.1).toFixed(1),
                        count: crypto.randomInt(10, 500)
                    }
                }], { session });
                itemIds.push(newItems[0]._id);
            }

            shop.items = itemIds;
            await shop.save({ session });

            await session.commitTransaction();
            state.completedRestaurants.push(shopName);
            saveState(state);
            console.log(`✓ Seeded ${shopName} (${itemIds.length} items)`);
        } catch (error) {
            await session.abortTransaction();
            console.error(`✗ Failed to seed ${shopName}: ${error.message}`);
        } finally {
            session.endSession();
        }
    }

    if (credentials.length > 0) {
        fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 4));
    }

    return { totalSeeded: state.completedRestaurants.length, duplicatesPrevented };
};
