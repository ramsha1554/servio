import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
    getStats,
    getAllUsers,
    getAllShops,
    getAllOrders,
    getAllDeliveryBoys,
    toggleBanUser,
    changeUserRole,
    toggleVerifyShop,
    deleteShop
} from "../controllers/admin.controllers.js";

const adminRouter = express.Router();

adminRouter.use(isAuth, isAdmin);

adminRouter.get("/stats", getStats);
adminRouter.get("/users", getAllUsers);
adminRouter.get("/shops", getAllShops);
adminRouter.get("/orders", getAllOrders);
adminRouter.get("/delivery-boys", getAllDeliveryBoys);

adminRouter.patch("/users/:userId/ban", toggleBanUser);
adminRouter.patch("/users/:userId/role", changeUserRole);

adminRouter.patch("/shops/:shopId/verify", toggleVerifyShop);
adminRouter.delete("/shops/:shopId/remove", deleteShop);

export default adminRouter;
