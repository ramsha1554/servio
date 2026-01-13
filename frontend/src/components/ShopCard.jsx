
import React from 'react'

function ShopCard({ shop, onClick }) {
    return (
        <div
            className='min-w-[280px] md:min-w-[320px] bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group'
            onClick={onClick}
        >
            <div className='relative h-[180px] overflow-hidden'>
                <img
                    src={shop.image}
                    alt={shop.name}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60'></div>
                <div className='absolute bottom-3 left-3 text-white'>
                    <p className='text-xs font-medium bg-[#ff4d2d] px-2 py-0.5 rounded-md inline-block mb-1'>
                        {shop.categories?.[0] || 'Restaurant'}
                    </p>
                </div>
            </div>

            <div className='p-4 flex flex-col gap-1'>
                <div className="flex justify-between items-start">
                    <h3 className='font-bold text-gray-800 text-lg leading-tight group-hover:text-[#ff4d2d] transition-colors'>
                        {shop.name}
                    </h3>
                    <span className='text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full'>
                        4.5 ★
                    </span>
                </div>

                <p className='text-sm text-gray-500 truncate'>
                    {shop.categories?.join(', ')}
                </p>

                <div className='flex items-center gap-2 mt-2 text-xs text-gray-400 font-medium'>
                    <span className='uppercase tracking-wide'>{shop.city}</span>
                    <span>•</span>
                    <span>30-40 min</span>
                </div>
            </div>
        </div>
    )
}

export default ShopCard
