import React from 'react'

function CategoryCard({ name, image, onClick, isActive }) {
  return (
    <div
      className='group flex flex-col items-center gap-3 cursor-pointer transition-transform duration-200 active:scale-95 select-none'
      onClick={onClick}
    >
      <div className={`w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 border-2 border-white ring-2 ${isActive ? 'ring-[#ff4d2d] scale-105 shadow-lg' : 'ring-gray-100 group-hover:ring-[#ff4d2d]'}`}>
        <img src={image} alt={name} className='w-full h-full object-cover' />
      </div>
      <span className={`text-sm md:text-base font-semibold transition-colors text-center ${isActive ? 'text-[#ff4d2d]' : 'text-gray-700 group-hover:text-[#ff4d2d]'}`}>
        {name}
      </span>
    </div>
  )
}

export default CategoryCard
