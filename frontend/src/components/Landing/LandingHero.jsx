import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Star, MapPin, Clock, Utensils } from 'lucide-react';
import { MdDeliveryDining } from 'react-icons/md';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import heroIllustration from '../../assets/hero-v2.png';

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center bg-white">
      {/* Premium Background Layers */}
      <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-orange-50/50 to-transparent -z-10" />
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-orange-100/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-red-100/10 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Left Content Column */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/50 rounded-full mb-8 border border-orange-200/50">
            <span className="w-2 h-2 bg-[#ff4d2d] rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-[#ff4d2d] uppercase tracking-[0.2em]">Next-Gen Food Logistics</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.95] mb-8 tracking-tighter">
            Cravings <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d2d] to-[#ff8e2d]">
              Delivered.
            </span>
          </h1>

          <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-lg font-medium">
            Join the most reliable multi-vendor delivery network. From local hotspots to gourmet kitchens, 
            <span className="text-gray-900 font-bold"> Servio brings the city to you.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <button 
              onClick={() => navigate('/signup')}
              className="group w-full sm:w-auto px-10 py-5 bg-[#ff4d2d] text-white rounded-[2rem] font-black text-lg shadow-[0_20px_40px_-10px_rgba(255,77,45,0.4)] hover:bg-[#e64526] hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              Order Now
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-[2rem] font-black text-lg hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-3"
            >
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                <Play className="text-white fill-white ml-0.5" size={14} />
              </div>
              Become Partner
            </button>
          </div>

          {/* Stats Badges */}
          <div className="mt-16 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#ff4d2d]">
                    <MdDeliveryDining size={28} />
                </div>
                <div>
                    <p className="text-lg font-black text-gray-900 leading-none tracking-tight">25 Mins</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Avg Speed</p>
                </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-500">
                    <RiSecurePaymentLine size={24} />
                </div>
                <div>
                    <p className="text-lg font-black text-gray-900 leading-none tracking-tight">Secure</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Payments</p>
                </div>
            </div>
          </div>
        </motion.div>

        {/* Right Visual Column - THE COMPOSITION */}
        <div className="relative flex items-center justify-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[600px]"
          >
            {/* Background Glow Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-orange-100/60 rounded-full blur-[140px] -z-10" />

            {/* Main Image Layer */}
            <div className="relative group">
               {/* Illustration Background Plate */}
               <div className="absolute -inset-10 bg-white/40 backdrop-blur-3xl rounded-[4rem] border border-white/60 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.08)] -z-10" />
               
               <img 
                src={heroIllustration} 
                alt="Servio Delivery Network" 
                className="w-full h-auto object-contain relative z-20"
               />

               {/* SUBTLE BRANDING (The "Servio" Label) */}
               <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-[40%] left-[25%] z-30 bg-[#ff4d2d] text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-xl uppercase"
               >
                 Servio
               </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LandingHero;
