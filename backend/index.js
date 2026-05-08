import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"

import itemRouter from "./routes/item.routes.js"
import shopRouter from "./routes/shop.routes.js"
import orderRouter from "./routes/order.routes.js"
import adminRouter from "./routes/admin.routes.js"
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js"
import "./workers/email.worker.js" // Start email worker for order confirmation 
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import logger from "./config/logger.js"

const app = express()
const server = http.createServer(app)

const allowedOrigin = process.env.CLIENT_URL || (process.env.NODE_ENV === "production" ? undefined : "http://localhost:5173")

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        credentials: true,
        methods: ['POST', 'GET']
    }
})

app.set("io", io)



const port = process.env.PORT || 5000
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}))

app.use(helmet())

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
})

app.use(limiter)

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authLimiter, authRouter)
app.use("/api/user", userRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter)
app.use("/api/admin", adminRouter)

socketHandler(io)
server.listen(port, () => {
    connectDb()
    logger.info(`Server started at port ${port}`)
})

