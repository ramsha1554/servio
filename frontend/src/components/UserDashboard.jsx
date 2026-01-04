import React, { useEffect, useRef, useState } from 'react'
import Nav from './NaV.JSX'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft } from "react-icons/fa6";
import { FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(state => state.user)
  const cateScrollRef = useRef()
  const shopScrollRef = useRef()
  const navigate = useNavigate()
  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)
  const [updatedItemsList, setUpdatedItemsList] = useState([])

  const handleFilterByCategory = (category) => {
    if (category == "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      const filteredList = itemsInMyCity?.filter(i => i.category === category)
      setUpdatedItemsList(filteredList)
    }

  }

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity)
  }, [itemsInMyCity])


  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current
    if (element) {
      setLeftButton(element.scrollLeft > 0)
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth)

    }
  }
  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      cateScrollRef.current.addEventListener('scroll', () => {
        updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      })
      shopScrollRef.current.addEventListener('scroll', () => {
        updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      })

    }

    return () => {
      cateScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      })
      shopScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      })
    }

  }, [categories])


  return (
    <div className='w-full min-h-screen flex flex-col gap-8 items-center bg-[#fff9f6] overflow-y-auto pb-20'>
      <Nav />

      {searchItems && searchItems.length > 0 && (
        <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-6 bg-white shadow-xl rounded-2xl mt-4 animate-fade-in-up border border-gray-100'>
          <h1 className='text-gray-900 text-2xl sm:text-3xl font-extrabold border-b border-gray-100 pb-4 w-full'>
            Search Results
          </h1>
          <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
            {searchItems.map((item) => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start px-4 md:px-6 animate-fade-in-up">
        <h1 className='text-gray-800 text-2xl sm:text-3xl font-extrabold tracking-tight'>Inspiration for your first order</h1>
        <div className='w-full relative group'>
          {showLeftCateButton && <button className='absolute left-[-15px] top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10 border border-gray-100' onClick={() => scrollHandler(cateScrollRef, "left")}><FaCircleChevronLeft size={24} />
          </button>}

          <div className='w-full flex overflow-x-auto gap-4 pb-4 scrollbar-hide' ref={cateScrollRef} style={{ scrollBehavior: 'smooth' }}>
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index} onClick={() => handleFilterByCategory(cate.category)} />
            ))}
          </div>

          {showRightCateButton && <button className='absolute right-[-15px] top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10 border border-gray-100' onClick={() => scrollHandler(cateScrollRef, "right")}>
            <FaCircleChevronRight size={24} />
          </button>}
        </div>
      </div>

      {/* Best Shops Section */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start px-4 md:px-6 animate-fade-in-up' style={{ animationDelay: '0.1s' }}>
        <h1 className='text-gray-800 text-2xl sm:text-3xl font-extrabold tracking-tight'>Best Shops in {currentCity}</h1>
        <div className='w-full relative group'>
          {showLeftShopButton && <button className='absolute left-[-15px] top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10 border border-gray-100' onClick={() => scrollHandler(shopScrollRef, "left")}><FaCircleChevronLeft size={24} />
          </button>}

          <div className='w-full flex overflow-x-auto gap-6 pb-4 scrollbar-hide' ref={shopScrollRef}>
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
            ))}
          </div>

          {showRightShopButton && <button className='absolute right-[-15px] top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10 border border-gray-100' onClick={() => scrollHandler(shopScrollRef, "right")}>
            <FaCircleChevronRight size={24} />
          </button>}
        </div>
      </div>

      {/* Suggested Items Section */}
      <div className='w-full max-w-7xl flex flex-col gap-6 items-center px-4 md:px-6 pb-10 animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
        <h1 className='text-gray-800 text-2xl sm:text-3xl font-extrabold tracking-tight self-start'>
          Suggested Food Items
        </h1>

        <div className='w-full h-auto flex flex-wrap gap-x-6 gap-y-8 justify-center'>
          {updatedItemsList?.map((item, index) => (
            <FoodCard key={index} data={item} />
          ))}
        </div>
      </div>

    </div>
  )
}

export default UserDashboard
