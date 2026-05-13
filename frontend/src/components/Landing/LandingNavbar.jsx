import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Contact', href: '#contact' },
  ];



  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#ff4d2d] to-[#ff8e2d] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <ShoppingBag className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-gray-900">
            SERVIO<span className="text-[#ff4d2d]">.</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-bold text-gray-700 hover:text-[#ff4d2d] transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff4d2d] transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate('/signin')}
            className="text-sm font-bold text-gray-700 hover:text-[#ff4d2d] transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-[#ff4d2d] transition-all shadow-lg hover:shadow-[#ff4d2d]/30"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-gray-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 p-6 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-lg font-bold text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
              <button 
                onClick={() => navigate('/signin')}
                className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="w-full py-4 bg-[#ff4d2d] text-white rounded-2xl font-bold"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNavbar;
