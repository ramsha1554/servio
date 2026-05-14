import React, { useState } from 'react';
import { useAdminDelivery } from '../../hooks/admin/useAdminDelivery';
import { Search, Bike, MapPin, Phone } from 'lucide-react';

const Delivery = () => {
  const { getDeliveryBoys } = useAdminDelivery();
  const [search, setSearch] = useState('');

  if (getDeliveryBoys.isLoading) {
    return <div className="p-8 text-gray-500 animate-pulse">Loading delivery personnel...</div>;
  }

  if (getDeliveryBoys.isError) {
    return <div className="p-8 text-red-500">Failed to load delivery personnel.</div>;
  }

  const deliveryBoys = getDeliveryBoys.data || [];
  const filteredBoys = deliveryBoys.filter(boy => 
    boy.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    boy.mobile?.includes(search)
  );

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Delivery Fleet</h1>
          <p className="text-xs text-gray-500">Manage and monitor your delivery personnel</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </header>

      <div className="p-8">
        <div data-testid="admin-delivery-list" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Personnel Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Last Known Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBoys.map(boy => (
                <tr key={boy._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        {boy.image ? (
                          <img src={boy.image} alt={boy.fullName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <Bike size={18} />
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{boy.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-gray-400" />
                        {boy.mobile || 'No phone'}
                      </div>
                      <span className="text-xs text-gray-400">{boy.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      boy.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${boy.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      {boy.isOnline ? 'Online / Active' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {boy.location?.coordinates?.[0] ? 'GPS Active' : 'No Location Data'}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBoys.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                    No delivery personnel found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
