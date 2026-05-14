import User from "./models/user.model.js"
import Order from "./models/order.model.js"
import logger from "./config/logger.js"

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info("Socket connected", { id: socket.id })
    socket.on('identity', async ({ userId }) => {
      try {
        if (!userId) return;
        
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id, 
          isOnline: true
        });
        
        logger.info("User identity established", { userId, socketId: socket.id });
      } catch (error) {
        logger.error("Socket identity error", { error: error.message });
      }
    });

    socket.on('joinOrder', async ({ orderId, userId }) => {
      if (orderId && userId) {
        try {
          const order = await Order.findById(orderId);
          if (!order) return;

          // Check if user is the customer or an assigned delivery boy
          const isCustomer = String(order.user) === String(userId);
          const isAssignedDriver = order.shopOrders.some(so => String(so.assignedDeliveryBoy) === String(userId));
          
          if (isCustomer || isAssignedDriver) {
            socket.join(orderId);
            logger.info("Socket joined order room", { orderId, userId, socketId: socket.id });
          } else {
            logger.warn("Unauthorized join attempt", { orderId, userId });
            socket.emit('joinError', { message: "You are not authorized to track this order." });
          }
        } catch (error) {
          logger.error("Socket joinOrder error", { error: error.message });
        }
      }
    });

    socket.on('updateLocation', async ({ latitude, longitude, userId, orderId }) => {
      try {
        if (!latitude || !longitude || !userId) return;

        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        }, { new: true });

        if (user && user.role === 'deliveryBoy' && orderId) {
          // Emit only to the specific order room
          io.to(orderId).emit('deliveryLocationUpdate', {
            deliveryBoyId: userId,
            latitude,
            longitude
          });
        }
      } catch (error) {
          logger.error("Socket updateLocation error", { error: error.message });
      }
    });

    socket.on('disconnect', async () => {
      try {
        const user = await User.findOneAndUpdate(
            { socketId: socket.id }, 
            { socketId: null, isOnline: false },
            { new: true }
        );
        
        if (user) {
            logger.info("User disconnected", { userId: user._id, socketId: socket.id });
        }
      } catch (error) {
        logger.error("Socket disconnect error", { error: error.message });
      }
    });
  })
}