import React, { useState } from 'react'
import { FaLeaf } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function FoodCard({ data }) {
    const [quantity, setQuantity] = useState(0)
    const dispatch = useDispatch()
    const { cartItems } = useSelector(state => state.user)
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                (i <= rating) ? (
                    <FaStar className='text-yellow-400 text-sm' />
                ) : (
                    <FaRegStar className='text-yellow-400 text-sm' />
                )
            )

        }
        return stars
    }

    const handleIncrease = () => {
        const newQty = quantity + 1
        setQuantity(newQty)
    }
    const handleDecrease = () => {
        if (quantity > 0) {
            const newQty = quantity - 1
            setQuantity(newQty)
        }

    }

    return (
        <div className='w-[260px] rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group transform hover:-translate-y-1'>
            <div className='relative w-full h-[180px] bg-gray-50 overflow-hidden'>
                <div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm text-xs font-bold text-gray-700 z-10'>
                    {data.shop?.name || "Premium Shop"}
                </div>
                <div className='absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md z-10'>{data.foodType == "veg" ? <FaLeaf className='text-green-500 text-sm' /> : <FaDrumstickBite className='text-red-500 text-sm' />}</div>

                <img src={data.image} alt="" className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />

                {/* Quick Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="flex-1 flex flex-col p-4">
                <h1 className='font-bold text-gray-800 text-lg truncate mb-1'>{data.name}</h1>

                <div className='flex items-center gap-1 mb-3'>
                    <div className="flex gap-0.5">{renderStars(data.rating?.average || 0)}</div>
                    <span className='text-xs text-gray-400 font-medium ml-1'>({data.rating?.count || 0})</span>
                </div>

                <div className='flex items-center justify-between mt-auto pt-3 border-t border-gray-50'>
                    <span className='font-extrabold text-[#ff4d2d] text-xl'>
                        ₹{data.price}
                    </span>

                    <div className='flex items-center gap-3'>
                        {quantity > 0 ? (
                            <div className='flex items-center bg-gray-50 rounded-full border border-gray-200 overflow-hidden shadow-inner'>
                                <button className='p-2 hover:bg-white hover:text-[#ff4d2d] transition-colors' onClick={handleDecrease}>
                                    <FaMinus size={10} />
                                </button>
                                <span className="w-4 text-center text-sm font-bold text-gray-700">{quantity}</span>
                                <button className='p-2 hover:bg-white hover:text-[#ff4d2d] transition-colors' onClick={handleIncrease}>
                                    <FaPlus size={10} />
                                </button>
                            </div>
                        ) : (
                            <button className='p-2 bg-gray-50 rounded-full border border-gray-200 hover:border-[#ff4d2d] hover:text-[#ff4d2d] transition-colors' onClick={handleIncrease}>
                                <FaPlus size={12} />
                            </button>
                        )}

                        <button
                            className={`${cartItems.some(i => i.id == data._id) ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white p-2.5 rounded-full shadow-lg shadow-[#ff4d2d]/30 hover:scale-110 active:scale-95 transition-all duration-300`}
                            onClick={() => {
                                if (quantity > 0) {
                                    dispatch(addToCart({
                                        id: data._id,
                                        name: data.name,
                                        price: data.price,
                                        image: data.image,
                                        shop: data.shop,
                                        quantity,
                                        foodType: data.foodType
                                    }))
                                }
                            }}
                            disabled={quantity === 0 && !cartItems.some(i => i.id == data._id)}
                        >
                            <FaShoppingCart size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FoodCard
