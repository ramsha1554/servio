import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';

function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)

    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6 pt-[100px]'>
            <div className='w-full max-w-[800px] animate-fade-in-up'>

                <div className='flex items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                    <div className='p-2 rounded-full hover:bg-gray-50 transition-colors cursor-pointer group' onClick={() => navigate("/")}>
                        <IoIosArrowRoundBack size={30} className='text-[#ff4d2d] group-hover:-translate-x-1 transition-transform' />
                    </div>
                    <h1 className='text-2xl font-extrabold text-gray-800 tracking-tight'>Your Cart</h1>
                </div>

                {cartItems?.length == 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">🛒</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                        <p className='text-gray-500 mb-6'>Looks like you haven't added anything yet.</p>
                        <button className="px-6 py-2 bg-[#ff4d2d] text-white rounded-lg font-medium hover:bg-[#e64526] transition-colors" onClick={() => navigate("/")}>Browse Food</button>
                    </div>
                ) : (
                    <>
                        <div className='space-y-4'>
                            {cartItems?.map((item, index) => (
                                <CartItemCard data={item} key={index} />
                            ))}
                        </div>

                        <div className='mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4'>
                            <div className="text-center sm:text-left">
                                <p className='text-gray-500 font-medium text-sm'>Total to pay</p>
                                <h1 className='text-3xl font-extrabold text-gray-900'>₹{totalAmount}</h1>
                            </div>

                            <button
                                className='bg-[#ff4d2d] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#e64526] hover:shadow-lg hover:shadow-[#ff4d2d]/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2'
                                onClick={() => navigate("/checkout")}
                            >
                                <span>Proceed to Checkout</span>
                                <span className="text-2xl">→</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CartPage
