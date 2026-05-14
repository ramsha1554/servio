import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

const users = [
  { fullName: 'Test Customer', email: 'test_customer@servio.test', password: 'Test@1234', role: 'user', mobile: '1234567890' },
  { fullName: 'Test Owner', email: 'test_owner@servio.test', password: 'Test@1234', role: 'owner', mobile: '1234567891' },
  { fullName: 'Test Delivery', email: 'test_delivery@servio.test', password: 'Test@1234', role: 'deliveryBoy', mobile: '1234567892' },
  { fullName: 'Test Admin', email: 'test_admin@servio.test', password: 'Test@1234', role: 'admin', mobile: '1234567893' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`User ${u.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 10);
      const newUser = new User({
        ...u,
        password: hashedPassword,
        isEmailVerified: true
      });

      await newUser.save();
      console.log(`Created user: ${u.email} with role ${u.role}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
