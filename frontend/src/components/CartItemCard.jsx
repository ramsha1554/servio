import { useDispatch } from 'react-redux';
import { removeItemWithRevalidation } from '../redux/cartThunks';
import { updateQuantityRaw } from '../redux/cartSlice';

function CartItemCard({ data }) {
    const dispatch = useDispatch()
    
    const handleIncrease = (id, currentQty) => {
        dispatch(updateQuantityRaw({ id, quantity: currentQty + 1, timestamp: Date.now() }))
    }

    const handleDecrease = (id, currentQty) => {
        if (currentQty > 1) {
            dispatch(updateQuantityRaw({ id, quantity: currentQty - 1, timestamp: Date.now() }))
        }
    }

    return (
        <div data-testid="cart-item-card" className='flex items-center justify-between bg-white p-4 rounded-xl shadow border hover:shadow-md transition-shadow'>
            <div className='flex items-center gap-4'>
                <img src={data.image} alt={data.name} className='w-20 h-20 object-cover rounded-lg border' />
                <div>
                    <h1 className='font-medium text-gray-800'>{data.name}</h1>
                    <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1'>{data.shop?.name}</p>
                    <p className='text-sm text-gray-500'>₹{data.price} x {data.quantity}</p>
                    <p data-testid="cart-item-total" className="font-bold text-[#ff4d2d]">₹{data.price * data.quantity}</p>
                </div>
            </div>
            <div className='flex items-center gap-3'>
                <div className='flex items-center bg-gray-50 rounded-full border border-gray-100 p-1'>
                    <button data-testid="cart-item-decrement" className='p-2 cursor-pointer bg-white rounded-full hover:bg-gray-100 shadow-sm transition-colors' onClick={() => handleDecrease(data.id, data.quantity)}>
                        <FaMinus size={10} />
                    </button>
                    <span className='w-8 text-center font-bold text-sm'>{data.quantity}</span>
                    <button data-testid="cart-item-increment" className='p-2 cursor-pointer bg-white rounded-full hover:bg-gray-100 shadow-sm transition-colors' onClick={() => handleIncrease(data.id, data.quantity)}>
                        <FaPlus size={10} />
                    </button>
                </div>
                <button data-testid="cart-item-remove" className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300"
                    onClick={() => dispatch(removeItemWithRevalidation(data.id))}>
                    <CiTrash size={20} />
                </button>
            </div>
        </div>
    )
}

export default CartItemCard

