import React, { useState } from 'react';
import useGetAllOrders from '../../hooks/admin/useGetAllOrders';
import { Search, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Orders = () => {
  const { data: allOrders, isLoading, isError } = useGetAllOrders();
  const [search, setSearch] = useState('');

  if (isLoading) {
    return <div className="p-8 text-gray-500 animate-pulse">Loading orders...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500">Failed to load orders.</div>;
  }

  // Flatten orders for table view
  const flattenedOrders = [];
  allOrders?.forEach(order => {
    order.shopOrders.forEach(shopOrder => {
      flattenedOrders.push({
        id: shopOrder._id,
        parentOrderId: order._id,
        user: order.user,
        shop: shopOrder.shop, // Normally populated
        amount: shopOrder.subtotal,
        status: shopOrder.status || 'pending',
        paymentMethod: order.paymentMethod,
        paymentStatus: order.payment ? 'Paid' : 'Unpaid',
        createdAt: new Date(order.createdAt)
      });
    });
  });

  const filteredOrders = flattenedOrders.filter(order => 
    order.parentOrderId.toLowerCase().includes(search.toLowerCase()) || 
    order.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.createdAt - a.createdAt);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusStyle = (status) => {
    switch(status.toLowerCase()) {
      case 'new': 
      case 'pending': return 'bg-red-100 text-red-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'out of delivery': return 'bg-blue-100 text-blue-800';
      case 'on_the_way': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Orders Explorer</h1>
          <p className="text-xs text-gray-500">Global ledger of all platform transactions</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Order ID or User..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </header>

      <div className="p-8">
        <div data-testid="admin-orders-list" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900 font-mono">
                      #{order.parentOrderId.substring(order.parentOrderId.length - 8)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900 font-medium">{order.user?.fullName || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">{order.user?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {format(order.createdAt, 'MMM dd, yyyy - HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(order.amount)}</span>
                      <span className="text-[10px] uppercase text-gray-500 tracking-wider">
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors inline-block" title="View details">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    No orders found matching your search.
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

export default Orders;
