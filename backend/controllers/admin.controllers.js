import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";

export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalShops = await Shop.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        const revenueAggregation = await Order.aggregate([
            { $match: { payment: true } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

        return res.status(200).json({
            totalUsers,
            totalShops,
            totalOrders,
            totalRevenue
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching stats", error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

export const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find().populate("owner", "fullName email").sort({ createdAt: -1 });
        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching shops", error: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "fullName email").sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};

export const getAllDeliveryBoys = async (req, res) => {
    try {
        const deliveryBoys = await User.find({ role: "deliveryBoy" }).select("-password");
        return res.status(200).json(deliveryBoys);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching delivery boys", error: error.message });
    }
};

export const toggleBanUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBanned = !user.isBanned;
        await user.save();
        return res.status(200).json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, user });
    } catch (error) {
        return res.status(500).json({ message: "Error updating user", error: error.message });
    }
};

export const changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        
        if (!["user", "owner", "deliveryBoy", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = role;
        await user.save();
        return res.status(200).json({ message: `User role updated to ${role}`, user });
    } catch (error) {
        return res.status(500).json({ message: "Error updating role", error: error.message });
    }
};

export const toggleVerifyShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        shop.isVerified = !shop.isVerified;
        await shop.save();
        return res.status(200).json({ message: `Shop ${shop.isVerified ? 'verified' : 'unverified'} successfully`, shop });
    } catch (error) {
        return res.status(500).json({ message: "Error updating shop", error: error.message });
    }
};

export const deleteShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        await Shop.findByIdAndDelete(shopId);
        return res.status(200).json({ message: "Shop removed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error removing shop", error: error.message });
    }
};
