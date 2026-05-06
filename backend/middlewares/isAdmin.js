import User from "../models/user.model.js"

const isAdmin = async (req, res, next) => {
    try {
        const userId = req.userId; // Assuming isAuth sets this
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "isAdmin middleware error", error: error.message });
    }
}

export default isAdmin;
