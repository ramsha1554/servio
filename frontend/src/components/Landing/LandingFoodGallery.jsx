import React from 'react';
import { motion } from 'framer-motion';

// CLOUDINARY BASE URL & TRANSFORMATIONS
const CLOUDINARY_BASE = "https://res.cloudinary.com/dajowhvrx/image/upload/f_auto,q_auto,w_800/servio_landing/";


const images = [
  {
    id: "biryani",
    title: "Hyderabadi Biryani",
    span: "md:col-span-2 md:row-span-2"
  },
  {
    id: "butter_chicken",
    title: "Butter Chicken",
    span: "md:col-span-1 md:row-span-1"
  },
  {
    id: "paneer_tikka",
    title: "Paneer Tikka",
    span: "md:col-span-1 md:row-span-1"
  },
  {
    id: "masala_dosa",
    title: "Masala Dosa",
    span: "md:col-span-2 md:row-span-1"
  },
  {
    id: "samosa_platter",
    title: "Samosa Platter",
    span: "md:col-span-1 md:row-span-2"
  },
  {
    id: "tandoori_chicken",
    title: "Tandoori Specialties",
    span: "md:col-span-1 md:row-span-1"
  },
  {
    id: "premium_thali",
    title: "Premium Thali",
    span: "md:col-span-1 md:row-span-1"
  },
  {
    id: "gulab_jamun",
    title: "Gulab Jamun",
    span: "md:col-span-1 md:row-span-1"
  }
];

const LandingFoodGallery = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#ff4d2d] font-black uppercase tracking-[0.2em] text-xs mb-4"
          >
            Visual Feast
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter"
          >
            Taste the Magic of <span className="text-[#ff4d2d]">India.</span>
          </motion.h2>
        </div>

        {/* Production-Grade Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[200px]">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`relative group overflow-hidden rounded-[2.5rem] cursor-pointer shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(255,77,45,0.2)] transition-all duration-500 bg-gray-50 ${img.span}`}
            >
              {/* Cloudinary CDN Image */}
              <img 
                src={`${CLOUDINARY_BASE}${img.id}.jpg`} 
                alt={img.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Premium Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <p className="text-white font-black text-xl tracking-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {img.title}
                </p>
                <div className="w-8 h-1 bg-[#ff4d2d] mt-2 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>

              {/* Inner Depth Border */}
              <div className="absolute inset-0 border border-white/10 rounded-[2.5rem] pointer-events-none" />
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-gray-900 text-white rounded-3xl font-black text-lg hover:bg-[#ff4d2d] transition-all shadow-2xl shadow-gray-200"
            >
                Explore Full Menu
            </motion.button>
        </div>
      </div>
    </section>
  );
};

export default LandingFoodGallery;
