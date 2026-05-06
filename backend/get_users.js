import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const User = (await import('./models/user.model.js')).default;
  const users = await User.find({}).sort({createdAt: -1}).limit(5);
  console.log("Current Users:");
  console.log(users.map(u => ({email: u.email, role: u.role, name: u.fullName})));
  process.exit(0);
});
