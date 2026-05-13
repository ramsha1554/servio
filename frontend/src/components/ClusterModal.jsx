import React from 'react';
import { IoWarningOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { confirmPendingAddition, cancelPendingAddition } from '../redux/cartThunks';

/**
 * Global ClusterModal Singleton.
 * Listens to the Redux cart state and handles cluster violation confirmations.
 */
const ClusterModal = () => {
  const dispatch = useDispatch();
  const { status, pendingItem, items } = useSelector(state => state.cart);

  // Modal is only visible during the PENDING_CONFIRMATION state
  if (status !== 'PENDING_CONFIRMATION' || !pendingItem) return null;

  const newShopName = pendingItem.shop?.name || "New Shop";
  const existingShops = [...new Set(items.map(i => i.shop?.name))];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoWarningOutline className="text-orange-500 text-4xl" />
          </div>
          
          <h3 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight">
            Different Delivery Cluster
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed text-sm">
            <span className="font-bold text-gray-800">{newShopName}</span> is outside the allowed delivery cluster. 
            For optimal delivery speed, all items must be within a <span className="font-bold text-[#ff4d2d]">3 KM radius</span>.
          </p>

          {existingShops.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Current Restaurants:</p>
              <div className="flex flex-wrap gap-2">
                {existingShops.map((name, index) => (
                  <span key={index} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => dispatch(confirmPendingAddition())}
              className="w-full py-4 bg-[#ff4d2d] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#ff4d2d]/30 hover:bg-[#e64427] transition-all transform active:scale-95"
            >
              Clear Cart & Continue
            </button>
            <button
              onClick={() => dispatch(cancelPendingAddition())}
              className="w-full py-3 bg-white text-gray-500 border border-gray-100 rounded-2xl font-bold text-base hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterModal;
