import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoIosSearch } from "react-icons/io";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { setCurrentCity, setCityManuallySelected } from '../redux/userSlice';

export const maharashtraCities = [
  "Chhatrapati Sambhajinagar", "Mumbai", "Pune", "Nagpur", "Nashik",
  "Thane", "Solapur", "Kolhapur", "Amravati", "Nanded", "Sangli",
  "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur",
  "Parbhani", "Ichalkaranji", "Jalna", "Bhiwandi", "Malegaon",
  "Navi Mumbai", "Vasai-Virar", "Aurangabad"
];

const popularCities = ["Chhatrapati Sambhajinagar", "Mumbai", "Pune", "Nagpur"];

export default function CitySelectorModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { currentCity } = useSelector(state => state.user);
  const [search, setSearch] = useState("");
  const [filteredCities, setFilteredCities] = useState(maharashtraCities);

  useEffect(() => {
    setFilteredCities(
      maharashtraCities.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search]);

  if (!isOpen && currentCity) return null;

  const handleSelectCity = (city) => {
    dispatch(setCurrentCity(city));
    dispatch(setCityManuallySelected(true));
    localStorage.setItem("servio_city", city);
    localStorage.setItem("servio_city_manual", "true");
    if (onClose) onClose();
  };

  const handleAutoDetect = () => {
    // We clear it so useGetCity will trigger if we also set cityManuallySelected false
    dispatch(setCityManuallySelected(false));
    localStorage.setItem("servio_city_manual", "false");
    
    // We can also trigger geolocation here directly for instant feedback, but useGetCity runs on mount.
    // If the user wants to trigger it now:
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // useGetCity will handle the API call, but we can just close the modal for now
        // and let useGetCity do its thing, or just let useGetCity pick it up on reload.
        // Actually, if we close it and currentCity is null, it might pop up again.
        // We shouldn't close it until currentCity is set. 
        // We'll let the user wait for it.
      },
      (error) => {
        console.error("Location error", error);
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-[12px] shadow-2xl w-[90%] max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select your city</h2>
              <p className="text-sm text-gray-500 mt-1">To see restaurants near you</p>
            </div>
            {currentCity && onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold text-xl px-2">
                &times;
              </button>
            )}
          </div>
          
          <div className="mt-5 relative">
            <IoIosSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for your city..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[36px] pl-10 pr-4 border-[0.5px] border-gray-300 rounded-[6px] outline-none focus:border-[#ff4d2d] focus:ring-1 focus:ring-[#ff4d2d] transition-all text-sm"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular Cities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {popularCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className={`p-2 px-4 rounded-[8px] border-[0.5px] text-sm transition-all flex items-center justify-center text-center
                    ${currentCity === city 
                      ? 'border-[#ff4d2d] bg-[#ff4d2d]/10 text-[#ff4d2d] font-bold shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold'
                    } ${city === "Chhatrapati Sambhajinagar" ? 'ring-1 ring-[#ff4d2d]/30' : ''}`}
                >
                  {city === "Chhatrapati Sambhajinagar" ? "⭐ " + city : city}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Other Cities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredCities.filter(c => !popularCities.includes(c)).map(city => (
                <button
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className={`p-2 px-4 rounded-[8px] border-[0.5px] text-sm transition-all flex items-center justify-center text-center
                    ${currentCity === city 
                      ? 'border-[#ff4d2d] bg-[#ff4d2d]/10 text-[#ff4d2d] font-semibold' 
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  {city}
                </button>
              ))}
              {filteredCities.length === 0 && (
                <div className="col-span-full py-6 text-center text-gray-400 text-sm">
                  No cities found matching "{search}"
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <button 
            onClick={handleAutoDetect}
            className="w-full py-2.5 rounded-[8px] text-[#ff4d2d] bg-[#ff4d2d]/10 hover:bg-[#ff4d2d] hover:text-white transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
          >
            <FaLocationCrosshairs size={16} />
            Detect automatically
          </button>
        </div>
      </div>
    </div>
  );
}
