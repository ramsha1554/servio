
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import fs from "fs";

dotenv.config({ path: "./backend/.env" });

const dumpUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const users = await User.find({ role: "owner" }, "email fullName");

        let content = "Email | Name\n";
        content += "--- | ---\n";
        users.forEach(u => {
            content += `${u.email} | ${u.fullName}\n`;
        });

        fs.writeFileSync("users_list.txt", content);
        console.log("Users dumped to users_list.txt");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

dumpUsers();
