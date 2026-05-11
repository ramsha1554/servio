import User from "./models/user.model.js"
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

    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
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

        if (user && user.role === 'deliveryBoy') {
          io.emit('updateDeliveryLocation', {
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