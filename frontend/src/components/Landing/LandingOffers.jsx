import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Zap, Percent } from 'lucide-react';

const LandingOffers = () => {
  return (
    <section className="py-20 bg-[#fff9f6]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Main Offer */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] rounded-[3.5rem] bg-gradient-to-br from-gray-900 to-black overflow-hidden flex items-center p-12 group cursor-pointer shadow-2xl shadow-gray-200"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-40 group-hover:scale-105 transition-transform duration-1000">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000" 
                className="w-full h-full object-cover"
                alt="Delicious Spread"
              />
            </div>
            <div className="relative z-10 max-w-sm">
              <div className="flex items-center gap-2 text-[#ff4d2d] mb-4">
                <Percent size={20} className="fill-[#ff4d2d]/20" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Limited Time Offer</span>
              </div>
              <h2 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                Flat <span className="text-[#ff4d2d]">50% OFF</span> <br />
                on first order
              </h2>
              <button className="px-8 py-4 bg-[#ff4d2d] text-white rounded-2xl font-black hover:bg-[#e64526] hover:scale-105 transition-all shadow-xl shadow-[#ff4d2d]/30">
                Claim Offer
              </button>
            </div>
          </motion.div>

          {/* Side Column */}
          <div className="flex flex-col gap-8">
            {/* Delivery Banner */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-[184px] rounded-[2.5rem] bg-gradient-to-r from-[#ff4d2d] to-[#ff8e2d] p-10 flex items-center justify-between relative overflow-hidden group cursor-pointer shadow-xl"
            >
              <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Zap size={200} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Free Delivery</h3>
                <p className="text-white/80 font-bold text-sm uppercase tracking-widest">No minimum order</p>
              </div>
              <button className="bg-white text-[#ff4d2d] px-6 py-3 rounded-xl font-black text-sm hover:bg-gray-50 transition-colors shadow-lg">
                Order Now
              </button>
            </motion.div>

            {/* Weekend Festival */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="h-[184px] rounded-[2.5rem] bg-white border border-gray-100 p-10 flex items-center justify-between relative overflow-hidden group cursor-pointer shadow-xl"
            >
              <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 opacity-20 rotate-12 group-hover:scale-110 transition-transform duration-500">
                <img 
                    src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400" 
                    className="w-48 h-48 rounded-full object-cover"
                    alt="Salad"
                />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Weekend Festival</h3>
                <p className="text-[#ff4d2d] font-black text-sm uppercase tracking-widest">Get 20% Cashback</p>
              </div>
              <Tag className="text-gray-100 group-hover:text-orange-50 transition-colors" size={60} />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingOffers;
