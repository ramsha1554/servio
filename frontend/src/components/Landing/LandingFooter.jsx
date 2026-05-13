import React from 'react';
import { ShoppingBag, Send } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

const LandingFooter = () => {
  return (
    <footer id="contact" className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Col */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ff4d2d] to-[#ff8e2d] rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900">
                SERVIO<span className="text-[#ff4d2d]">.</span>
              </span>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed">
              Premium food delivery experience. Connecting you with the best restaurants in your city since 2024.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#ff4d2d] hover:bg-orange-50 transition-all">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#ff4d2d] hover:bg-orange-50 transition-all">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#ff4d2d] hover:bg-orange-50 transition-all">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#ff4d2d] hover:bg-orange-50 transition-all">
                <FaLinkedin size={20} />
              </a>
            </div>

          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest text-[10px]">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 font-bold text-sm hover:text-[#ff4d2d] transition-colors">Careers</a></li>

              <li><a href="#" className="text-gray-500 font-bold text-sm hover:text-[#ff4d2d] transition-colors">Partner with Us</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest text-[10px]">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 font-bold text-sm hover:text-[#ff4d2d] transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-500 font-bold text-sm hover:text-[#ff4d2d] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 font-bold text-sm hover:text-[#ff4d2d] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-500 font-bold text-sm hover:text-[#ff4d2d] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest text-[10px]">Newsletter</h4>
            <p className="text-gray-500 font-medium text-sm mb-6 leading-relaxed">
              Subscribe to get the latest updates and exclusive coupons.
            </p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 transition-all pr-12"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#ff4d2d] text-white rounded-xl flex items-center justify-center hover:bg-[#e64526] transition-colors shadow-lg shadow-[#ff4d2d]/30">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            © 2024 SERVIO INC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-[0.2em]">English</a>
            <a href="#" className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-[0.2em]">Inr (₹)</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
