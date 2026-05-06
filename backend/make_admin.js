import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const User = (await import('./models/user.model.js')).default;
  const user = await User.findOneAndUpdate(
    { email: 'ramshas434@gmail.com' },
    { role: 'admin' },
    { new: true }
  );
  console.log("Updated User:", user.email, "New Role:", user.role);
  process.exit(0);
});
