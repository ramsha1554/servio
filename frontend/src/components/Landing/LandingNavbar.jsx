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
      setIsScrolled(window.scrollY > 20);
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
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <ShoppingBag className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            SERVIO<span className="text-orange-500">.</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => navigate('/signin')}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-full text-[13px] font-semibold hover:bg-gray-800 transition-all shadow-sm active:scale-95"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-6 flex flex-col gap-5 md:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-semibold text-gray-900 px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
              <button 
                onClick={() => navigate('/signin')}
                className="w-full py-3.5 text-sm font-bold text-gray-900 bg-gray-50 rounded-xl"
              >
                Log in
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="w-full py-3.5 text-sm font-bold text-white bg-gray-900 rounded-xl"
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
