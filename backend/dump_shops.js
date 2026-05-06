
import mongoose from "mongoose";
import dotenv from "dotenv";
import Shop from "./models/shop.model.js";
import fs from "fs";

dotenv.config({ path: "./backend/.env" });

const dumpShops = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const shops = await Shop.find({});

        let content = "Name | City | Items Count\n";
        content += "--- | --- | ---\n";
        shops.forEach(s => {
            content += `${s.name} | '${s.city}' | ${s.items.length}\n`;
        });

        fs.writeFileSync("shops_dump.txt", content);
        console.log("Shops dumped to shops_dump.txt");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

dumpShops();
