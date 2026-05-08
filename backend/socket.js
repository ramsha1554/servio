import User from "./models/user.model.js"
import logger from "./config/logger.js"

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info("Socket connected", { id: socket.id })
    socket.on('identity', async ({ userId, role }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          socketId: socket.id, isOnline: true
        }, { new: true })
        if (role === 'admin' || user?.role === 'admin') {
          socket.join('admin_room');
        }
      } catch (error) {
        logger.error("identity error", { error: error.message })
      }
    })


    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        })

        if (user) {
          io.emit('updateDeliveryLocation',{
            deliveryBoyId:userId,
            latitude,
            longitude
          })
        }


      } catch (error) {
          logger.error("updateDeliveryLocation error", { error: error.message })
      }
    })




    socket.on('disconnect', async () => {
      try {

        await User.findOneAndUpdate({ socketId: socket.id }, {
          socketId: null,
          isOnline: false
        })
      } catch (error) {
        logger.error("disconnect error", { error: error.message })
      }

    })
  })
}