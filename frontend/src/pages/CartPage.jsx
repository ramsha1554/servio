import React, { useMemo } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
import { resolveRecovery, clearCart } from '../redux/cartSlice';

function CartPage() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    // Connect to the new domain-separated cart slice
    const { items, status, recovery } = useSelector(state => state.cart)

    // Memoize total amount calculation
    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [items]);

    const isRecoveryRequired = status === 'RECOVERY_REQUIRED';

    const handleResolveRecovery = () => {
        // Implementation logic: In a real UI, this would remove the invalidItems from the cart
        // For now, we follow the "resolve" state transition
        dispatch(resolveRecovery());
    };

    const handleClearCart = () => {
        dispatch(clearCart({ timestamp: Date.now() }));
    };

    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6 pt-[100px]'>
            <div className='w-full max-w-[800px] animate-fade-in-up'>

                <div className='flex items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                    <div className='p-2 rounded-full hover:bg-gray-50 transition-colors cursor-pointer group' onClick={() => navigate("/")}>
                        <IoIosArrowRoundBack size={30} className='text-[#ff4d2d] group-hover:-translate-x-1 transition-transform' />
                    </div>
                    <h1 className='text-2xl font-extrabold text-gray-800 tracking-tight'>Your Cart</h1>
                </div>

                {/* RECOVERY REQUIRED OVERLAY (Simplified for Stabilization) */}
                {isRecoveryRequired && (
                    <div className='mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm animate-pulse'>
                        <div className='flex items-center gap-3 mb-3'>
                            <span className='text-2xl'>⚠️</span>
                            <h2 className='text-lg font-bold text-red-800'>Action Required: Delivery Cluster Broken</h2>
                        </div>
                        <p className='text-red-600 text-sm mb-4 leading-relaxed'>
                            Some items in your cart are outside the 3KM delivery cluster. This usually happens if the primary restaurant was removed or the cart was updated in another tab.
                        </p>
                        <div className='flex gap-3'>
                            <button 
                                onClick={handleResolveRecovery}
                                className='px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors'
                            >
                                Resolve & Keep Valid Items
                            </button>
                            <button 
                                onClick={handleClearCart}
                                className='px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors'
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}

                {items?.length === 0 ? (
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
                            {items?.map((item, index) => (
                                <CartItemCard data={item} key={index} />
                            ))}
                        </div>

                        <div className='mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4'>
                            <div className="text-center sm:text-left">
                                <p className='text-gray-500 font-medium text-sm'>Total to pay</p>
                                <h1 className='text-3xl font-extrabold text-gray-900'>₹{totalAmount}</h1>
                            </div>

                            <button
                                className={`px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 ${isRecoveryRequired ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#ff4d2d] text-white hover:bg-[#e64526] hover:shadow-lg hover:shadow-[#ff4d2d]/30 transform hover:scale-[1.02] active:scale-[0.98]"}`}
                                onClick={() => !isRecoveryRequired && navigate("/checkout")}
                                disabled={isRecoveryRequired}
                            >
                                <span>{isRecoveryRequired ? "Fix Cart to Checkout" : "Proceed to Checkout"}</span>
                                {!isRecoveryRequired && <span className="text-2xl">→</span>}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CartPage
