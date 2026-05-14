import axios from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import { useSocket } from '../context/SocketContext'
import { useSelector } from 'react-redux'
function TrackOrderPage() {
  const { orderId } = useParams()
  const [currentOrder, setCurrentOrder] = useState()
  const navigate = useNavigate()
  const socket = useSocket()
  const { userData } = useSelector(state => state.user)
  const [liveLocations, setLiveLocations] = useState({})
  const handleGetOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
      setCurrentOrder(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!socket || !orderId || !userData?._id) return;
    
    socket.emit('joinOrder', { orderId, userId: userData._id });

    socket.on('deliveryLocationUpdate', ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocations(prev => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude }
      }))
    })

    socket.on('statusUpdate', () => {
      handleGetOrder(); // Refresh order data to get new status
    });

    return () => {
      socket.off('deliveryLocationUpdate');
      socket.off('statusUpdate');
    };
  }, [socket, orderId, userData?._id])

  useEffect(() => {
    handleGetOrder()
  }, [orderId])
  return (
    <div data-testid="track-order-page" className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>
      <div className='relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px]' onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
        <h1 className='text-2xl font-bold md:text-center'>Track Order</h1>
      </div>
      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div className='bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-4' key={index}>
          <div>
            <p className='text-lg font-bold mb-2 text-[#ff4d2d]'>{shopOrder.shop.name}</p>
            <p className='font-semibold'><span>Items:</span> {shopOrder.shopOrderItems?.map(i => i.name).join(",")}</p>
            <p><span className='font-semibold'>Subtotal:</span> {shopOrder.subtotal}</p>
            <p className='mt-6'><span className='font-semibold'>Delivery address:</span> {currentOrder.deliveryAddress?.text}</p>
          </div>
          <div className='flex flex-wrap gap-2 mt-4'>
            {["pending", "preparing", "out of delivery", "on_the_way", "delivered"].map((step, i) => (
              <div key={i} data-testid={shopOrder.status === step ? "track-order-status" : undefined} className={`text-xs px-2 py-1 rounded-full border ${shopOrder.status === step ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                {step.replace(/_/g, ' ').toUpperCase()}
              </div>
            ))}
          </div>

          {shopOrder.status !== "delivered" ? (
            <div className='text-sm text-gray-700 space-y-2 mt-4'>
              {shopOrder.assignedDeliveryBoy ? (
                <>
                  <p className='font-semibold'><span>Delivery Partner:</span> {shopOrder.assignedDeliveryBoy.fullName}</p>
                  {shopOrder.assignedDeliveryBoy.mobile ? (
                    <p className='font-semibold'><span>Contact:</span> {shopOrder.assignedDeliveryBoy.mobile}</p>
                  ) : (
                    <p className='text-xs text-gray-400 italic'>Contact information hidden</p>
                  )}
                </>
              ) : (
                <p className='font-semibold text-orange-400'>Looking for a delivery partner...</p>
              )}
            </div>
          ) : (
            <p className='text-green-600 font-semibold text-lg mt-4'>Order Delivered!</p>
          )}

          {(shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered") && (
            <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
              <DeliveryBoyTracking data={{
                deliveryBoyLocation: liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                  lat: shopOrder.assignedDeliveryBoy?.location?.coordinates?.[1] || 0,
                  lon: shopOrder.assignedDeliveryBoy?.location?.coordinates?.[0] || 0
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude
                }
              }} />
            </div>
          )}



        </div>
      ))}



    </div>
  )
}

export default TrackOrderPage
