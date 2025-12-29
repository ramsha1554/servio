import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import cors from 'cors';


dotenv.config();  // Load environment variables from .env file configuration  lets put this on top only 
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
app.use(cors(

    {
        origin:"http://localhost:5173",
        credentials:true,
    }
));
app.use('/api/auth',authRouter);


app.listen(PORT, ()=>{
connectDB();
    console.log(`Server is running on port ${PORT}`);
})