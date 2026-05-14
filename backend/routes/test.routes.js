import express from "express"
import User from "../models/user.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"

const testRouter = express.Router()

// SECURITY: Only allow these routes if we are in test environment
const testOnly = (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
        next()
    } else {
        res.status(403).json({ message: "Forbidden: Test endpoints only" })
    }
}

testRouter.use(testOnly)

// Force delete user by email
testRouter.delete("/user/:email", async (req, res) => {
    try {
        const { email } = req.params
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ message: "User not found" })

        // If user is owner, delete shop and items? 
        // For testing, let's keep it simple: delete user
        await User.deleteOne({ email })
        res.json({ message: `User ${email} deleted` })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Force delete orders for a user
testRouter.delete("/orders/:email", async (req, res) => {
    try {
        const { email } = req.params
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ message: "User not found" })

        await Order.deleteMany({ user: user._id })
        res.json({ message: `Orders for ${email} deleted` })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Reset environment (delete all test users/orders)
testRouter.post("/reset", async (req, res) => {
    try {
        // Only delete users with 'test' in email or similar?
        // Let's be careful. For now, specific deletes are safer.
        res.json({ message: "Reset endpoint called" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default testRouter
