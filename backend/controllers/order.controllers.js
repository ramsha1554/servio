import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import Item from "../models/item.model.js"
import { emailQueue } from "../config/queue.js"
import RazorPay from "razorpay"
import dotenv from "dotenv"
import crypto from "crypto"
import logger from "../config/logger.js"
import { calculateDistance } from "../utils/geoUtils.js"

dotenv.config()
let instance = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body
        // Validation handled by Zod

        const groupItemsByShop = {}

        cartItems.forEach(item => {
            const shopId = item.shop
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item)
        });

        const uniqueShopIds = Object.keys(groupItemsByShop)
        const uniqueShops = await Shop.find({ _id: { $in: uniqueShopIds } }).populate("owner")

        // Multi-vendor Distance Validation (3KM Cluster Rule)
        if (uniqueShops.length > 1) {
            for (let i = 0; i < uniqueShops.length; i++) {
                for (let j = i + 1; j < uniqueShops.length; j++) {
                    const dist = calculateDistance(
                        uniqueShops[i].location.coordinates,
                        uniqueShops[j].location.coordinates
                    );
                    if (dist > 3.05) {
                        return res.status(400).json({
                            message: `Distance cluster violation: Restaurants ${uniqueShops[i].name} and ${uniqueShops[j].name} are ${dist.toFixed(2)}km apart. Maximum allowed distance for multi-vendor orders is 3KM.`
                        });
                    }
                }
            }
        }

        // FINANCIAL INTEGRITY: Re-validate prices against the Database
        const itemIds = cartItems.map(i => i.id || i._id);
        const dbItems = await Item.find({ _id: { $in: itemIds } });
        const dbItemMap = new Map(dbItems.map(item => [item._id.toString(), item]));

        let calculatedTotal = 0;
        const validatedShopOrders = uniqueShops.map((shop) => {
            const items = groupItemsByShop[shop._id.toString()]
            
            const validatedItems = items.map(item => {
                const dbItem = dbItemMap.get(item.id || item._id);
                if (!dbItem) throw new Error(`Item ${item.name} not found in database`);
                
                // Use DB price, not client-provided price
                const finalPrice = dbItem.price;
                calculatedTotal += Number(finalPrice) * Number(item.quantity);
                
                return {
                    item: dbItem._id,
                    price: finalPrice,
                    quantity: item.quantity,
                    name: dbItem.name
                };
            });

            const subtotal = validatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            
            return {
                shop: shop._id,
                owner: shop.owner._id,
                subtotal,
                shopOrderItems: validatedItems
            }
        });

        // Optional: Sanity check against client total (handle small rounding differences if needed)
        // Here we prioritize the server-calculated total for safety.
        const finalTotal = calculatedTotal;

        if (paymentMethod == "online") {
            const razorOrder = await instance.orders.create({
                amount: Math.round(finalTotal * 100),
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            })
            const newOrder = await Order.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                location: {
                    type: "Point",
                    coordinates: [Number(deliveryAddress.longitude), Number(deliveryAddress.latitude)]
                },
                totalAmount: finalTotal,
                shopOrders: validatedShopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false
            })

            return res.status(200).json({
                razorOrder,
                orderId: newOrder._id,
            })

        }

        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            location: {
                type: "Point",
                coordinates: [Number(deliveryAddress.longitude), Number(deliveryAddress.latitude)]
            },
            totalAmount: finalTotal,
            shopOrders: validatedShopOrders
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name")
        await newOrder.populate("shopOrders.owner", "name socketId")
        await newOrder.populate("user", "name email mobile")

        const io = req.app.get('io')

        if (io) {
            newOrder.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner.socketId
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: newOrder._id,
                        paymentMethod: newOrder.paymentMethod,
                        user: newOrder.user,
                        shopOrders: shopOrder,
                        createdAt: newOrder.createdAt,
                        deliveryAddress: newOrder.deliveryAddress,
                        payment: newOrder.payment
                    })
                }
            });
            // Broadcast to all admins
            io.to('admin_room').emit('adminNewOrder', newOrder)
        }



        return res.status(201).json(newOrder)
    } catch (error) {
        if (error.message?.startsWith("Shop not found")) {
            return res.status(400).json({ message: error.message })
        }
        logger.error("placeOrder error", { error: error.message })
        return res.status(500).json({ message: `place order error ${error}` })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, orderId } = req.body
        const payment = await instance.payments.fetch(razorpay_payment_id)
        if (!payment || payment.status != "captured") {
            return res.status(400).json({ message: "payment not captured" })
        }
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        order.payment = true
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        await order.populate("shopOrders.shopOrderItems.item", "name image price")
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.owner", "name socketId")
        await order.populate("user", "name email mobile")

        const io = req.app.get('io')

        if (io) {
            order.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner.socketId
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        user: order.user,
                        shopOrders: shopOrder,
                        createdAt: order.createdAt,
                        deliveryAddress: order.deliveryAddress,
                        payment: order.payment
                    })
                }
            });
            // Broadcast to all admins
            io.to('admin_room').emit('adminNewOrder', order)
        }


        return res.status(200).json(order)

    } catch (error) {
        return res.status(500).json({ message: `verify payment  error ${error}` })
    }
}



export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (user.role == "user") {
            const orders = await Order.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name email")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders)
        } else if (user.role == "owner") {
            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName")



            const filteredOrders = orders.map((order => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.find(o => o.owner._id == req.userId),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
                payment: order.payment
            })))


            return res.status(200).json(filteredOrders)
        }

    } catch (error) {
        return res.status(500).json({ message: `get User order error ${error}` })
    }
}


export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params
        const { status } = req.body
        const order = await Order.findById(orderId)

        const shopOrder = order.shopOrders.find(o => o.shop == shopId)
        if (!shopOrder) {
            return res.status(400).json({ message: "shop order not found" })
        }

        // ROLE-BASED PERMISSIONS
        const userRole = req.user.role;
        
        // Only Owner/Admin can set preparing/out of delivery
        if (["preparing", "out of delivery"].includes(status) && !["owner", "admin"].includes(userRole)) {
            return res.status(403).json({ message: "Only restaurant owners can prepare orders" });
        }

        // Only assigned Delivery Boy can set on_the_way
        if (status === "on_the_way") {
            if (userRole !== "deliveryBoy") return res.status(403).json({ message: "Only delivery partners can start delivery" });
            if (String(shopOrder.assignedDeliveryBoy) !== String(req.userId)) {
                return res.status(403).json({ message: "You are not assigned to this order" });
            }
        }

        shopOrder.status = status
        let deliveryBoysPayload = []
        if (status == "out of delivery" && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                        $maxDistance: 5000
                    }
                }
            })

            const nearByIds = nearByDeliveryBoys.map(b => b._id)
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ["brodcasted", "completed"] }

            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map(id => String(id)))

            const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)))
            const candidates = availableBoys.map(b => b._id)

            if (candidates.length == 0) {
                await order.save()
                return res.json({
                    message: "order status updated but there is no available delivery boys"
                })
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order: order?._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder?._id,
                brodcastedTo: candidates,
                status: "brodcasted"
            })

            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo
            shopOrder.assignment = deliveryAssignment._id
            deliveryBoysPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates?.[0],
                latitude: b.location.coordinates?.[1],
                mobile: b.mobile
            }))

            await deliveryAssignment.populate('order')
            await deliveryAssignment.populate('shop')
            const io = req.app.get('io')
            if (io) {
                availableBoys.forEach(boy => {
                    const boySocketId = boy.socketId
                    if (boySocketId) {
                        io.to(boySocketId).emit('newAssignment', {
                            sentTo: boy._id,
                            assignmentId: deliveryAssignment._id,
                            orderId: deliveryAssignment.order._id,
                            shopName: deliveryAssignment.shop.name,
                            deliveryAddress: deliveryAssignment.order.deliveryAddress,
                            items: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId)).shopOrderItems || [],
                            subtotal: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.subtotal
                        })
                    }
                });
            }
        }

        if (status === "on_the_way") {
            const assignment = await DeliveryAssignment.findOne({
                order: orderId,
                shopOrderId: shopOrder._id,
                assignedTo: req.userId
            })
            if (!assignment) {
                return res.status(403).json({ message: "You are not assigned to this order" })
            }
            assignment.status = "on_the_way"
            await assignment.save()
        }

        // CLEANUP: If order is marked delivered or cancelled, clear assignment
        if (["delivered", "cancelled"].includes(status)) {
            await DeliveryAssignment.deleteOne({
                order: orderId,
                shopOrderId: shopOrder._id
            });
        }


        await order.save()
        const updatedShopOrder = order.shopOrders.find(o => o.shop == shopId)
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email")
        await order.populate("user", "socketId")

        const io = req.app.get('io')
        if (io) {
            // Emit to the order-specific room for all parties
            io.to(orderId).emit('update-status', {
                orderId: order._id,
                shopId: updatedShopOrder.shop._id,
                status: updatedShopOrder.status,
                userId: order.user._id
            })

            io.to('admin_room').emit('adminUpdateStatus', {
                orderId: order._id,
                shopId: updatedShopOrder.shop._id,
                status: updatedShopOrder.status
            })
        }



        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignment?._id

        })



    } catch (error) {
        return res.status(500).json({ message: `order status error ${error}` })
    }
}


export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        logger.info("=== getAssignments Start ===");
        logger.info("req.query:", { query: req.query });
        const deliveryBoyId = req.userId
        let { latitude, longitude } = req.query

        // Default to DB location if not provided in query
        if (!latitude || !longitude) {
            const deliveryBoy = await User.findById(deliveryBoyId)
            logger.info("deliveryBoy fetched", { email: deliveryBoy?.email, location: deliveryBoy?.location });
            if (deliveryBoy && deliveryBoy.location && deliveryBoy.location.coordinates[0] !== 0) {
                longitude = deliveryBoy.location.coordinates[0]
                latitude = deliveryBoy.location.coordinates[1]
            }
        }

        if (!latitude || !longitude) {
            // Fallback if absolutely no location found
            const assignments = await DeliveryAssignment.find({
                brodcastedTo: deliveryBoyId,
                status: "brodcasted"
            }).populate("order").populate("shop")

            const formated = assignments.map(a => ({
                assignmentId: a._id,
                orderId: a.order._id,
                shopName: a.shop.name,
                deliveryAddress: a.order.deliveryAddress,
                items: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).shopOrderItems || [],
                subtotal: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId))?.subtotal
            }))
            return res.status(200).json({ success: true, assignments: formated })
        }

        const lon1 = Number(longitude)
        const lat1 = Number(latitude)

        logger.info("Querying orders", { lon1, lat1 });
        const geoQuery = {
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lon1, lat1]
                    },
                    $maxDistance: 5000 // 5km
                }
            }
        };
        logger.info("MongoDB Query", { geoQuery });

        // 1. Find Orders near the delivery boy (5km radius)
        // Using MongoDB geospatial query which is much faster than JS filtering
        const nearbyOrders = await Order.find(geoQuery).select("_id");

        const nearbyOrderIds = nearbyOrders.map(o => o._id);

        if (nearbyOrderIds.length === 0) {
            return res.status(200).json({ success: true, assignments: [] })
        }

        // 2. Find Broadcasted Assignments corresponding to these nearby orders
        const assignments = await DeliveryAssignment.find({
            status: "brodcasted",
            order: { $in: nearbyOrderIds }
        })
            .populate("order")
            .populate("shop")

        // 3. Format result
        const formated = assignments.map(a => ({
            assignmentId: a._id,
            orderId: a.order._id,
            shopName: a.shop.name,
            deliveryAddress: a.order.deliveryAddress,
            items: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).shopOrderItems || [],
            subtotal: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId))?.subtotal
        }))

        return res.status(200).json({ success: true, assignments: formated })
    } catch (error) {
        logger.error("getAssignments Error", { error: error.message });
        return res.status(500).json({ success: false, message: `get Assignment error: ${error.message}` })
    }
}


export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const assignment = await DeliveryAssignment.findOneAndUpdate(
            { 
                _id: assignmentId, 
                status: "brodcasted" 
            },
            { 
                assignedTo: req.userId, 
                status: 'assigned',
                acceptedAt: new Date()
            },
            { new: true }
        )

        if (!assignment) {
            return res.status(400).json({ message: "Assignment not found or already taken by another driver" })
        }

        const order = await Order.findById(assignment.order)
        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        let shopOrder = order.shopOrders.id(assignment.shopOrderId)
        shopOrder.assignedDeliveryBoy = req.userId
        await order.save()


        return res.status(200).json({
            message: 'order accepted'
        })
    } catch (error) {
        return res.status(500).json({ message: `accept order error ${error}` })
    }
}



export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
            .populate("shop", "name")
            .populate("assignedTo", "fullName email mobile location")
            .populate({
                path: "order",
                populate: [{ path: "user", select: "fullName email mobile location" }]

            })

        if (!assignment) {
            return res.status(200).json(null)
        }
        if (!assignment.order) {
            return res.status(200).json(null)
        }

        const shopOrder = assignment.order.shopOrders.find(so => String(so._id) == String(assignment.shopOrderId))

        if (!shopOrder) {
            return res.status(200).json(null)
        }

        let deliveryBoyLocation = { lat: null, lon: null }
        if (assignment.assignedTo.location.coordinates.length == 2) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
        }

        let customerLocation = { lat: null, lon: null }
        if (assignment.order.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude
            customerLocation.lon = assignment.order.deliveryAddress.longitude
        }

        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        })

    } catch (error) {
        logger.error("getCurrentOrder error", { error: error.message })
        return res.status(500).json({
            success: false,
            message: "getCurrentOrder error " + error.message
        })
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params
        const order = await Order.findById(orderId)
            .populate("user", "fullName email mobile location")
            .populate({
                path: "shopOrders.shop",
                model: "Shop",
                select: "name location"
            })
            .populate({
                path: "shopOrders.assignedDeliveryBoy",
                model: "User",
                select: "fullName email mobile location"
            })
            .populate({
                path: "shopOrders.shopOrderItems.item",
                model: "Item"
            })
            .lean()

        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        // AUTHENTICATION CHECK: Only involved parties see mobile numbers
        const isCustomer = String(order.user._id) === String(req.userId);
        const isOwner = order.shopOrders.some(so => String(so.shop.owner) === String(req.userId));
        const isAdmin = req.user.role === "admin";
        const isAssignedDriver = order.shopOrders.some(so => String(so.assignedDeliveryBoy?._id) === String(req.userId));

        if (!isCustomer && !isOwner && !isAdmin && !isAssignedDriver) {
            // Scrub mobile numbers for third parties
            if (order.user) order.user.mobile = undefined;
            order.shopOrders.forEach(so => {
                if (so.assignedDeliveryBoy) so.assignedDeliveryBoy.mobile = undefined;
            });
        }

        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `get by id order error ${error}` })
    }
}

export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body
        const order = await Order.findById(orderId).populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "enter valid order/shopOrderid" })
        }
        const otp = crypto.randomInt(1000, 9999).toString()
        shopOrder.deliveryOtp = otp
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000
        await order.save()

        // Add email job to queue
        await emailQueue.add("send-delivery-otp", { user: order.user, otp });

        return res.status(200).json({ message: `Otp sent Successfuly to ${order?.user?.fullName}` })
    } catch (error) {
        return res.status(500).json({ message: `delivery otp error ${error}` })
    }
}

export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body
        const order = await Order.findById(orderId).populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "enter valid order/shopOrderid" })
        }
        if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid/Expired Otp" })
        }

        // STATE ENFORCEMENT: Must be on_the_way to deliver
        if (shopOrder.status !== "on_the_way") {
            return res.status(400).json({ message: "Order must be 'On the way' before delivery confirmation" });
        }

        shopOrder.status = "delivered"
        shopOrder.deliveredAt = Date.now()
        await order.save()
        await DeliveryAssignment.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryBoy
        })

        const io = req.app.get('io')
        if (io) {
            // Notify everyone in the room that the order is delivered
            io.to(orderId).emit('update-status', {
                orderId: order._id,
                shopId: shopOrder.shop._id,
                status: 'delivered',
                userId: order.user._id
            })

            io.to('admin_room').emit('adminUpdateStatus', {
                orderId: order._id,
                shopId: shopOrder.shop._id,
                status: 'delivered'
            })
        }

        return res.status(200).json({ message: "Order Delivered Successfully!" })

    } catch (error) {
        return res.status(500).json({ message: `verify delivery otp error ${error}` })
    }
}

export const getTodayDeliveries = async (req, res) => {
    try {
        const deliveryBoyId = req.userId
        const startsOfDay = new Date()
        startsOfDay.setHours(0, 0, 0, 0)

        const orders = await Order.find({
            "shopOrders.assignedDeliveryBoy": deliveryBoyId,
            "shopOrders.status": "delivered",
            "shopOrders.deliveredAt": { $gte: startsOfDay }
        }).lean()

        let todaysDeliveries = []

        orders.forEach(order => {
            order.shopOrders.forEach(shopOrder => {
                if (shopOrder.assignedDeliveryBoy == deliveryBoyId &&
                    shopOrder.status == "delivered" &&
                    shopOrder.deliveredAt &&
                    shopOrder.deliveredAt >= startsOfDay
                ) {
                    todaysDeliveries.push(shopOrder)
                }
            })
        })

        let stats = {}

        todaysDeliveries.forEach(shopOrder => {
            const hour = new Date(shopOrder.deliveredAt).getHours()
            stats[hour] = (stats[hour] || 0) + 1
        })

        let formattedStats = Object.keys(stats).map(hour => ({
            hour: parseInt(hour),
            count: stats[hour]
        }))

        formattedStats.sort((a, b) => a.hour - b.hour)

        return res.status(200).json(formattedStats)


    } catch (error) {
        return res.status(500).json({ message: `today deliveries error ${error}` })
    }
}



