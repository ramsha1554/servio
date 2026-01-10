import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useSocket } from '../context/SocketContext'

function DeliveryBoy() {
  const { userData } = useSelector(state => state.user)
  const socket = useSocket()
  const [currentOrder, setCurrentOrder] = useState()
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [availableAssignments, setAvailableAssignments] = useState(null)
  const [otp, setOtp] = useState("")
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const [address, setAddress] = useState("Fetching address...")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [fetchedWithLocation, setFetchedWithLocation] = useState(false)

  const getAddress = async (lat, lon) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)

      if (response.data && response.data.address) {
        const addr = response.data.address

        // Custom formatting to avoid "City, City District" repetition
        // We strictly pick the most relevant "human" fields

        const street = addr.road || addr.pedestrian || addr.street || addr.path
        const area = addr.suburb || addr.neighbourhood || addr.residential || addr.commercial || addr.industrial
        const localArea = addr.hamlet || addr.village
        const city = addr.city || addr.town || addr.municipality
        const state = addr.state
        const zip = addr.postcode

        // Build array of existing parts
        let parts = []

        if (addr.house_number) parts.push(addr.house_number)
        if (addr.building) parts.push(addr.building)
        if (street) parts.push(street)
        if (area) parts.push(area)
        if (localArea && localArea !== city) parts.push(localArea)
        if (city) parts.push(city)
        if (state) parts.push(state)
        if (zip) parts.push(zip)

        // If we still didn't get a good "street" or "area" part, fall back to display_name but slice it
        if (parts.length < 3 && response.data.display_name) {
          const simple = response.data.display_name.split(",").slice(0, 3).join(",")
          setAddress(simple)
        } else {
          setAddress(parts.join(", "))
        }

      } else if (response.data.display_name) {
        // Fallback: just take the first 3 parts of the long string
        const simple = response.data.display_name.split(",").slice(0, 3).join(",")
        setAddress(simple)
      }
    } catch (error) {
      console.error("Error fetching address:", error)
      setAddress("Address not found")
    }
  }

  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return
    let watchId
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          setDeliveryBoyLocation({ lat: latitude, lon: longitude })
          getAddress(latitude, longitude)
          socket.emit('updateLocation', {
            latitude,
            longitude,
            userId: userData._id
          })
        },
        (error) => {
          console.error("Location error:", error)
          setAddress("Location permission denied or unavailable")
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      )
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }

  }, [socket, userData])


  const ratePerDelivery = 50
  const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)



  const getAssignments = async (lat, lng) => {
    try {
      const params = {}
      if (lat && lng) {
        params.latitude = lat
        params.longitude = lng
      }
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true, params })

      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true })
      setCurrentOrder(result.data)
    } catch (error) {
      console.log("Error fetching current order:", error.response?.data || error.message)
    }
  }


  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true })
      console.log(result.data)
      await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    socket.on('newAssignment', (data) => {
      setAvailableAssignments(prev => ([...prev, data]))
    })
    return () => {
      socket.off('newAssignment')
    }
  }, [socket])

  const sendOtp = async () => {
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
        orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id
      }, { withCredentials: true })
      setLoading(false)
      setShowOtpBox(true)
      console.log(result.data)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }
  const verifyOtp = async () => {
    setMessage("")
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
        orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp
      }, { withCredentials: true })
      console.log(result.data)
      setMessage(result.data.message)
      location.reload()
    } catch (error) {
      console.log(error)
    }
  }


  const handleTodayDeliveries = async () => {

    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true })
      console.log(result.data)
      setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    if (deliveryBoyLocation) {
      getAssignments(deliveryBoyLocation.lat, deliveryBoyLocation.lon)
    } else {
      getAssignments()
    }
    getCurrentOrder()
    handleTodayDeliveries()
  }, [userData])

  useEffect(() => {
    if (deliveryBoyLocation && !fetchedWithLocation) {
      getAssignments(deliveryBoyLocation.lat, deliveryBoyLocation.lon)
      setFetchedWithLocation(true)
    }
  }, [deliveryBoyLocation, fetchedWithLocation])
  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Nav />
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>
        <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2'>
          <h1 className='text-2xl md:text-3xl font-bold text-[#ff4d2d]'>Welcome, {userData.fullName}</h1>
          <p className='text-gray-600 text-sm font-medium px-4'><span className='text-[#ff4d2d] font-bold'>Current Location:</span> {address}</p>
        </div>

        <div className='bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100'>
          <h1 className='text-xl md:text-2xl font-bold mb-3 text-[#ff4d2d] '>Today Deliveries</h1>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={todayDeliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [value, "orders"]} labelFormatter={label => `${label}:00`} />
              <Bar dataKey="count" fill='#ff4d2d' />
            </BarChart>
          </ResponsiveContainer>

          <div className='max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center'>
            <h1 className='text-xl font-semibold text-gray-800 mb-2'>Today's Earning</h1>
            <span className='text-3xl font-bold text-green-600'>₹{totalEarning}</span>
          </div>
        </div>


        {!currentOrder && <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
          <h1 className='text-lg font-bold mb-4 flex items-center gap-2'>Available Orders</h1>

          <div className='space-y-4'>
            {availableAssignments?.length > 0
              ?
              (
                availableAssignments.map((a, index) => (
                  <div className='border rounded-lg p-4 flex justify-between items-center' key={index}>
                    <div>
                      <p className='text-sm font-semibold'>{a?.shopName}</p>
                      <p className='text-sm text-gray-500'><span className='font-semibold'>Delivery Address:</span> {a?.deliveryAddress.text}</p>
                      <p className='text-xs text-gray-400'>{a.items.length} items | {a.subtotal}</p>
                    </div>
                    <button className='bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600' onClick={() => acceptOrder(a.assignmentId)}>Accept</button>

                  </div>
                ))
              ) : <p className='text-gray-400 text-sm'>No Available Orders</p>}
          </div>
        </div>}

        {currentOrder && <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
          <h2 className='text-lg font-bold mb-3'>📦Current Order</h2>
          <div className='border rounded-lg p-4 mb-3'>
            <p className='font-semibold text-sm'>{currentOrder?.shopOrder.shop.name}</p>
            <p className='text-sm text-gray-500'>{currentOrder.deliveryAddress.text}</p>
            <p className='text-xs text-gray-400'>{currentOrder.shopOrder.shopOrderItems.length} items | {currentOrder.shopOrder.subtotal}</p>
          </div>

          <DeliveryBoyTracking data={{
            deliveryBoyLocation: deliveryBoyLocation || {
              lat: userData.location.coordinates[1],
              lon: userData.location.coordinates[0]
            },
            customerLocation: {
              lat: currentOrder.deliveryAddress.latitude,
              lon: currentOrder.deliveryAddress.longitude
            }
          }} />
          {!showOtpBox ? <button className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200' onClick={sendOtp} disabled={loading}>
            {loading ? <ClipLoader size={20} color='white' /> : "Mark As Delivered"}
          </button> : <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
            <p className='text-sm font-semibold mb-2'>Enter Otp send to <span className='text-orange-500'>{currentOrder.user.fullName}</span></p>
            <input type="text" className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400' placeholder='Enter OTP' onChange={(e) => setOtp(e.target.value)} value={otp} />
            {message && <p className='text-center text-green-400 text-2xl mb-4'>{message}</p>}

            <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all" onClick={verifyOtp}>Submit OTP</button>
          </div>}

        </div>}


      </div>
    </div>
  )
}

export default DeliveryBoy
