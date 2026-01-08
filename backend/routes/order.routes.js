import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders, getOrderById, getTodayDeliveries, placeOrder, sendDeliveryOtp, updateOrderStatus, verifyDeliveryOtp, verifyPayment } from "../controllers/order.controllers.js"




import { validate } from "../middlewares/validate.js"
import { OrderSchema } from "../utils/schemas.js"

const orderRouter = express.Router()

orderRouter.post("/place-order", isAuth, validate(OrderSchema.placeOrder), placeOrder)
orderRouter.post("/verify-payment", isAuth, validate(OrderSchema.verifyPayment), verifyPayment)
orderRouter.get("/my-orders", isAuth, getMyOrders)
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignment)
orderRouter.get("/get-current-order", isAuth, getCurrentOrder)
orderRouter.post("/send-delivery-otp", isAuth, validate(OrderSchema.otp), sendDeliveryOtp)
orderRouter.post("/verify-delivery-otp", isAuth, validate(OrderSchema.otp), verifyDeliveryOtp)
orderRouter.post("/update-status/:orderId/:shopId", isAuth, validate(OrderSchema.updateStatus), updateOrderStatus)
orderRouter.get('/accept-order/:assignmentId', isAuth, acceptOrder)
orderRouter.get('/get-order-by-id/:orderId', isAuth, getOrderById)
orderRouter.get('/get-today-deliveries', isAuth, getTodayDeliveries)

export default orderRouter