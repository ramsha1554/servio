import React, { useState } from 'react';
import { useAdminShops } from '../../hooks/admin/useAdminShops';
import { Search, MapPin, Store, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const Shops = () => {
  const { getShops, toggleVerify, deleteShop } = useAdminShops();
  const [search, setSearch] = useState('');

  if (getShops.isLoading) {
    return <div className="p-8 text-gray-500 animate-pulse">Loading shops...</div>;
  }

  if (getShops.isError) {
    return <div className="p-8 text-red-500">Failed to load shops.</div>;
  }

  const shops = getShops.data || [];
  const filteredShops = shops.filter(shop => 
    shop.name?.toLowerCase().includes(search.toLowerCase()) || 
    shop.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Shops Management</h1>
          <p className="text-xs text-gray-500">View, verify, and manage platform vendors</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search shops or cities..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Shop Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredShops.map(shop => (
                <tr key={shop._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {shop.image ? (
                          <img src={shop.image} alt={shop.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Store size={18} />
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{shop.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900 font-medium">{shop.owner?.fullName || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">{shop.owner?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {shop.city}, {shop.state}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      shop.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shop.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleVerify.mutate(shop._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          shop.isVerified 
                            ? 'text-yellow-600 hover:bg-yellow-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={shop.isVerified ? "Revoke Verification" : "Verify Shop"}
                      >
                        {shop.isVerified ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this shop?')) {
                            deleteShop.mutate(shop._id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Shop"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredShops.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No shops found matching your search.
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

export default Shops;
