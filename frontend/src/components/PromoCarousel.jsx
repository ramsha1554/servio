
import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const offers = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
        title: "50% OFF",
        subtitle: "Up to ₹100 on your first order",
        code: "WELCOME50"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop",
        title: "Free Delivery",
        subtitle: "On all orders above ₹500",
        code: "FREEDEL"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop",
        title: "Party Special",
        subtitle: "Flat 20% OFF on Family Packs",
        code: "PARTY20"
    }
]

function PromoCarousel() {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % offers.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    const nextSlide = () => setCurrent((current + 1) % offers.length)
    const prevSlide = () => setCurrent((current - 1 + offers.length) % offers.length)

    return (
        <div className='w-full max-w-7xl px-4 md:px-8 mt-24 mb-6 animate-fade-in-up'>
            <div className='relative w-full h-[180px] md:h-[250px] rounded-3xl overflow-hidden group shadow-lg shadow-orange-100'>
                {offers.map((offer, index) => (
                    <div
                        key={offer.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img src={offer.image} alt={offer.title} className='w-full h-full object-cover' />

                        {/* Gradient Overlay */}
                        <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent'></div>

                        <div className='absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white'>
                            <span className='text-[#ff4d2d] font-bold tracking-widest text-xs md:text-sm uppercase bg-white px-2 py-1 rounded mb-2 w-fit'>Limited Time Offer</span>
                            <h1 className='text-3xl md:text-5xl font-extrabold mb-2 leading-tight'>{offer.title}</h1>
                            <p className='text-gray-200 text-sm md:text-xl font-medium mb-4'>{offer.subtitle}</p>
                            <div className='text-xs md:text-sm font-bold border border-white/30 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full w-fit'>
                                Use Code: <span className='text-[#ff4d2d]'>{offer.code}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Controls */}
                <button
                    onClick={prevSlide}
                    className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 md:p-3 rounded-full hover:bg-white hover:text-[#ff4d2d] transition-all opacity-0 group-hover:opacity-100'
                >
                    <FaChevronLeft />
                </button>
                <button
                    onClick={nextSlide}
                    className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-2 md:p-3 rounded-full hover:bg-white hover:text-[#ff4d2d] transition-all opacity-0 group-hover:opacity-100'
                >
                    <FaChevronRight />
                </button>

                {/* Indicators */}
                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2'>
                    {offers.map((_, index) => (
                        <div
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`w-2 h-2 rounded-full cursor-pointer transition-all ${index === current ? 'bg-[#ff4d2d] w-6' : 'bg-white/50 hover:bg-white'}`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PromoCarousel
