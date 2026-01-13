import React, { useEffect, useRef, useState } from 'react'
import Nav from './NaV.JSX'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import ShopCard from './ShopCard' // Import ShopCard
import PromoCarousel from './PromoCarousel' // Import PromoCarousel
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6"; // Cleaner icons
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
  const [updatedShopList, setUpdatedShopList] = useState([]) // New State for filtered shops
  const [selectedCategory, setSelectedCategory] = useState("All") // New State for selected category
  const [isTransitioning, setIsTransitioning] = useState(false) // State for smooth transitions

  const handleFilterByCategory = (category) => {
    if (category === selectedCategory) return; // Avoid re-triggering current category

    setSelectedCategory(category)
    setIsTransitioning(true)

    // Delay updates to allow fade-out animation
    setTimeout(() => {
      if (category === "All") {
        setUpdatedItemsList(itemsInMyCity)
        setUpdatedShopList(shopInMyCity)
      } else {
        // 1. Filter Items
        let filteredItems = itemsInMyCity?.filter(i => {
          if (category === "Burgers") {
            return i.category === "Fast Food" && i.name.toLowerCase().includes("burger");
          }
          return i.category === category;
        })
        setUpdatedItemsList(filteredItems)

        // 2. Filter Shops
        let filteredShops = shopInMyCity?.filter(shop => {
          if (category === "Burgers") {
            // Show shops that have "Fast Food" category if user clicks "Burgers"
            return shop.categories?.includes("Fast Food");
          }
          return shop.categories?.includes(category);
        })
        setUpdatedShopList(filteredShops)
      }
      setIsTransitioning(false) // End transition
    }, 200) // 200ms delay matches CSS transition speed
  }

  // Initial Data Load
  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity)
    setUpdatedShopList(shopInMyCity)
  }, [itemsInMyCity, shopInMyCity])


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
        left: direction == "left" ? -300 : 300,
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

  }, [categories, shopInMyCity]) // Added shopInMyCity dependency


  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-[#fff9f6] text-gray-800 pb-20'>
      <Nav />

      {/* Promo Carousel */}
      <PromoCarousel />

      {/* Main Content Container with max-width */}
      <div className="w-full max-w-7xl flex flex-col gap-8 px-4 md:px-8">

        {/* Search Results */}
        {searchItems && searchItems.length > 0 && (
          <div className='flex flex-col gap-6 animate-fade-in-up mt-8'>
            <h2 className='text-3xl font-bold text-gray-900 border-b pb-4'>Search Results</h2>
            <div className='flex flex-wrap gap-6 justify-center'>
              {searchItems.map((item) => (
                <FoodCard data={item} key={item._id} />
              ))}
            </div>
          </div>
        )}

        {/* Categories Section - STICKY */}
        <section className="flex flex-col gap-4 animate-fade-in-up sticky top-[80px] z-40 bg-[#fff9f6]/95 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-orange-100/50 shadow-sm">
          <div className='flex justify-between items-end'>
            <h2 className='text-xl md:text-2xl font-bold tracking-tight text-gray-900'>What's on your mind?</h2>
          </div>

          <div className='relative group'>
            {showLeftCateButton && <button className='absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:text-[#ff4d2d] transition-all z-10 border border-gray-100 flex items-center justify-center' onClick={() => scrollHandler(cateScrollRef, "left")}><FaChevronLeft size={16} /></button>}

            <div className='flex overflow-x-auto gap-6 pb-2 pt-2 scrollbar-hide px-2' ref={cateScrollRef}>
              {categories.map((cate, index) => (
                <CategoryCard
                  name={cate.category}
                  image={cate.image}
                  key={index}
                  isActive={selectedCategory === cate.category}
                  onClick={() => handleFilterByCategory(cate.category)}
                />
              ))}
            </div>

            {showRightCateButton && <button className='absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:text-[#ff4d2d] transition-all z-10 border border-gray-100 flex items-center justify-center' onClick={() => scrollHandler(cateScrollRef, "right")}><FaChevronRight size={16} /></button>}
          </div>
        </section>

        {/* Best Shops Section */}
        <section className='flex flex-col gap-6 animate-fade-in-up' style={{ animationDelay: '0.1s' }}>
          <h2 className='text-2xl md:text-3xl font-bold tracking-tight text-gray-900'>Top restaurants in {currentCity}</h2>

          <div className='relative group'>
            {showLeftShopButton && <button className='absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:text-[#ff4d2d] transition-all z-10 border border-gray-100 flex items-center justify-center' onClick={() => scrollHandler(shopScrollRef, "left")}><FaChevronLeft size={16} /></button>}

            <div
              className={`flex overflow-x-auto gap-6 pb-8 pt-2 scrollbar-hide px-2 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
              ref={shopScrollRef}
            >
              {updatedShopList?.length > 0 ? (
                updatedShopList.map((shop, index) => (
                  <ShopCard shop={shop} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
                ))
              ) : (
                !isTransitioning && selectedCategory !== "All" && (
                  <div className="w-full text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    No restaurants found for "{selectedCategory}" in {currentCity}
                  </div>
                )
              )}
            </div>

            {showRightShopButton && <button className='absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:text-[#ff4d2d] transition-all z-10 border border-gray-100 flex items-center justify-center' onClick={() => scrollHandler(shopScrollRef, "right")}><FaChevronRight size={16} /></button>}
          </div>
        </section>

        {/* Suggested Items Section */}
        <section className='flex flex-col gap-6 pb-12 animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
          <h2 className='text-2xl md:text-3xl font-bold tracking-tight text-gray-900'>Suggested for you</h2>

          <div className={`flex flex-wrap gap-x-6 gap-y-8 justify-center md:justify-start transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {updatedItemsList?.length > 0 ? (
              updatedItemsList.map((item, index) => (
                <FoodCard key={index} data={item} />
              ))
            ) : (
              !isTransitioning && (
                <div className="text-gray-500">Select a category to see items</div>
              )
            )}
          </div>
        </section>

      </div>
    </div>
  )
}

export default UserDashboard
