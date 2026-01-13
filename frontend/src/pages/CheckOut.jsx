import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import axios from 'axios';
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder, setTotalAmount } from '../redux/userSlice';

function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap()
    map.setView([location.lat, location.lon], 16, { animate: true })
  }
  return null
}

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData } = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")

  // Coupon States
  const [promoCode, setPromoCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [discountLabel, setDiscountLabel] = useState("")
  const [couponMsg, setCouponMsg] = useState("")
  const [deliveryDiscount, setDeliveryDiscount] = useState(false) // For Free Delivery

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY

  // Calculate Fees
  const deliveryFee = totalAmount > 500 ? 0 : 40
  const effectiveDeliveryFee = deliveryDiscount ? 0 : deliveryFee
  const AmountWithDeliveryFee = totalAmount + effectiveDeliveryFee
  const finalTotal = Math.max(0, AmountWithDeliveryFee - appliedDiscount) // Ensure non-negative

  const handleApplyCoupon = () => {
    setCouponMsg("")
    if (!promoCode) return;

    if (promoCode === "WELCOME50") {
      // 50% off up to 100
      const discount = Math.min(100, Math.floor(totalAmount * 0.5));
      setAppliedDiscount(discount);
      setDiscountLabel("50% OFF");
      setDeliveryDiscount(false);
      setCouponMsg("Coupon WELCOME50 Applied Successfully!");
    }
    else if (promoCode === "FREEDEL") {
      // Free Delivery
      if (deliveryFee === 0) {
        setCouponMsg("Free delivery is already applied on orders above ₹500!");
        return;
      }
      setDeliveryDiscount(true);
      setAppliedDiscount(0); // Only delivery is free
      setDiscountLabel("Free Delivery");
      setCouponMsg("Coupon FREEDEL Applied! Delivery is Free.");
    }
    else if (promoCode === "PARTY20") {
      // Flat 20% off
      const discount = Math.floor(totalAmount * 0.2);
      setAppliedDiscount(discount);
      setDiscountLabel("20% OFF");
      setDeliveryDiscount(false);
      setCouponMsg("Coupon PARTY20 Applied Successfully!");
    }
    else {
      setCouponMsg("Invalid Coupon Code");
      setAppliedDiscount(0);
      setDiscountLabel("");
      setDeliveryDiscount(false);
    }
  }

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }
  const getCurrentLocation = () => {
    const latitude = userData.location.coordinates[1]
    const longitude = userData.location.coordinates[0]
    dispatch(setLocation({ lat: latitude, lon: longitude }))
    getAddressByLatLng(latitude, longitude)
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
      dispatch(setAddress(result?.data?.results[0].address_line2))
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon
        },
        totalAmount: finalTotal,
        cartItems
      }, { withCredentials: true })

      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data))
        navigate("/order-placed")
      } else {
        const orderId = result.data.orderId
        const razorOrder = result.data.razorOrder
        openRazorpayWindow(orderId, razorOrder)
      }

    } catch (error) {
      console.log(error)
    }
  }

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: 'INR',
      name: "Servio",
      description: "Food Delivery Website",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id,
            orderId
          }, { withCredentials: true })
          dispatch(addMyOrder(result.data))
          navigate("/order-placed")
        } catch (error) {
          console.log(error)
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  useEffect(() => {
    setAddressInput(address)
  }, [address])

  return (
    <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6 pt-[100px]'>
      <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-8 animate-fade-in-up border border-gray-100 relative'>

        <div className='flex items-center gap-4 mb-4'>
          <div className='p-2 rounded-full hover:bg-gray-50 transition-colors cursor-pointer group' onClick={() => navigate("/cart")}>
            <IoIosArrowRoundBack size={30} className='text-[#ff4d2d] group-hover:-translate-x-1 transition-transform' />
          </div>
          <h1 className='text-3xl font-extrabold text-gray-800 tracking-tight'>Checkout</h1>
        </div>

        <section>
          <h2 className='text-lg font-bold mb-4 flex items-center gap-2 text-gray-800'><IoLocationSharp className='text-[#ff4d2d]' /> Delivery Location</h2>
          <div className='flex gap-3 mb-4'>
            <input
              type="text"
              className='flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all'
              placeholder='Enter Your Delivery Address..'
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-xl flex items-center justify-center transition-colors shadow-md hover:shadow-lg' onClick={getLatLngByAddress}><IoSearchOutline size={20} /></button>
            <button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center justify-center transition-colors shadow-md hover:shadow-lg' onClick={getCurrentLocation}><TbCurrentLocation size={20} /></button>
          </div>
          <div className='rounded-xl border border-gray-200 overflow-hidden shadow-inner'>
            <div className='h-72 w-full flex items-center justify-center'>
              <MapContainer
                className={"w-full h-full"}
                center={[location?.lat, location?.lon]}
                zoom={16}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{ dragend: onDragEnd }} />
              </MapContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-4 text-gray-800'>Payment Method</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div
              className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-all duration-300 cursor-pointer ${paymentMethod === "cod"
                ? "border-[#ff4d2d] bg-[#ff4d2d]/5 shadow-md ring-1 ring-[#ff4d2d]"
                : "border-gray-200 hover:border-[#ff4d2d]/50 hover:bg-gray-50"
                }`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 shadow-sm'>
                <MdDeliveryDining className='text-green-600 text-2xl' />
              </span>
              <div>
                <p className='font-bold text-gray-800'>Cash On Delivery</p>
                <p className='text-xs text-gray-500 font-medium'>Pay when your food arrives</p>
              </div>
            </div>

            <div
              className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-all duration-300 cursor-pointer ${paymentMethod === "online"
                ? "border-[#ff4d2d] bg-[#ff4d2d]/5 shadow-md ring-1 ring-[#ff4d2d]"
                : "border-gray-200 hover:border-[#ff4d2d]/50 hover:bg-gray-50"
                }`}
              onClick={() => setPaymentMethod("online")}
            >
              <div className="flex -space-x-2">
                <span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 shadow-sm z-10 ring-2 ring-white'>
                  <FaMobileScreenButton className='text-purple-700 text-xl' />
                </span>
                <span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 shadow-sm ring-2 ring-white'>
                  <FaCreditCard className='text-blue-700 text-xl' />
                </span>
              </div>
              <div>
                <p className='font-bold text-gray-800'>UPI / Cards</p>
                <p className='text-xs text-gray-500 font-medium'>Pay Securely Online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-bold mb-4 text-gray-800'>Order Summary</h2>
          <div className='rounded-xl border border-gray-100 bg-gray-50/50 p-6 space-y-3'>
            {cartItems.map((item, index) => (
              <div key={index} className='flex justify-between text-sm font-medium text-gray-700'>
                <span>{item.name} <span className="text-gray-400">x {item.quantity}</span></span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Promo Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Have a promo code?"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase outline-none focus:border-[#ff4d2d]"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={appliedDiscount > 0}
              />
              {appliedDiscount > 0 ? (
                <button
                  className="text-red-500 font-bold text-sm px-4 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => {
                    setAppliedDiscount(0);
                    setPromoCode("");
                    setDiscountLabel("");
                    setDeliveryDiscount(false);
                  }}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="bg-gray-800 text-white font-bold text-sm px-4 rounded-lg hover:bg-black transition-colors"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </button>
              )}
            </div>
            {couponMsg && <p className={`text-xs font-medium ${couponMsg.includes("Applied") ? "text-green-600" : "text-red-500"}`}>{couponMsg}</p>}

            <div className="border-t border-gray-200 my-4"></div>

            <div className='flex justify-between font-medium text-gray-600'>
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className='flex justify-between font-medium text-gray-600'>
              <span>Delivery Fee</span>
              <span className={(deliveryFee === 0 || deliveryDiscount) ? "text-green-600" : ""}>
                {(deliveryFee === 0 || deliveryDiscount) ? "Free" : `₹${deliveryFee}`}
              </span>
            </div>

            {/* Discount Row */}
            {appliedDiscount > 0 && (
              <div className='flex justify-between font-medium text-green-600 animate-pulse'>
                <span>Discount ({discountLabel})</span>
                <span>-₹{appliedDiscount}</span>
              </div>
            )}

            <div className='flex justify-between text-xl font-extrabold text-[#ff4d2d] pt-4'>
              <span>Total Amount</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>
        </section>

        <button
          className='w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-[#ff4d2d]/30 transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-300'
          onClick={handlePlaceOrder}
        >
          {paymentMethod == "cod" ? "Place Order Now" : "Pay & Place Order"}
        </button>

      </div>
    </div>
  )
}

export default CheckOut
