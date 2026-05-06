import React, { useEffect, useState } from 'react';
import { Bell, IndianRupee, Users, Store, ShoppingBag } from 'lucide-react';
import useGetAdminStats from '../../hooks/admin/useGetAdminStats';
import useGetAllOrders from '../../hooks/admin/useGetAllOrders';
import { io } from 'socket.io-client';
import { serverUrl } from '../../App';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

const Overview = () => {
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useGetAdminStats();
  const { data: allOrders, isLoading: isOrdersLoading } = useGetAllOrders();
  const { userData } = useSelector(state => state.user);
  
  const [liveOrders, setLiveOrders] = useState([]);

  // Initialize data
  useEffect(() => {
    if (allOrders && allOrders.length > 0) {
      // Flatten shopOrders to create a feed
      const feed = [];
      allOrders.forEach(order => {
        order.shopOrders.forEach(shopOrder => {
          feed.push({
            id: order._id + shopOrder.shop,
            orderId: order._id,
            shopId: shopOrder.shop,
            shopName: 'Shop', // Normally populated, fallback
            amount: shopOrder.subtotal,
            status: shopOrder.status,
            time: new Date(order.createdAt),
          });
        });
      });
      // Sort by time descending and take top 10
      feed.sort((a, b) => b.time - a.time);
      setLiveOrders(feed.slice(0, 10));
    }
  }, [allOrders]);

  // Socket.io integration
  useEffect(() => {
    if (!userData) return;
    
    const socket = io(serverUrl);
    
    socket.on('connect', () => {
      socket.emit('identity', { userId: userData._id, role: userData.role });
    });

    socket.on('adminNewOrder', (newOrder) => {
      newOrder.shopOrders.forEach(shopOrder => {
        const feedItem = {
          id: newOrder._id + shopOrder.shop,
          orderId: newOrder._id,
          shopId: shopOrder.shop,
          shopName: 'New Shop Order', 
          amount: shopOrder.subtotal,
          status: shopOrder.status || 'pending',
          time: new Date(newOrder.createdAt),
        };
        setLiveOrders(prev => [feedItem, ...prev].slice(0, 10)); // Keep top 10
      });
    });

    socket.on('adminUpdateStatus', ({ orderId, shopId, status }) => {
      setLiveOrders(prev => prev.map(order => 
        (order.orderId === orderId && order.shopId === shopId) 
          ? { ...order, status } 
          : order
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, [userData]);

  if (isStatsLoading || isOrdersLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 w-48 rounded mb-8"></div>
        <div className="grid grid-cols-4 gap-[8px]">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-[10px]"></div>)}
        </div>
      </div>
    );
  }

  if (isStatsError) {
    return <div className="p-8 text-red-500 text-[13px]">Failed to load dashboard data. <button className="underline ml-2" onClick={() => window.location.reload()}>Retry</button></div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusStyle = (status) => {
    switch(status.toLowerCase()) {
      case 'new': 
      case 'pending': return 'bg-red-100 text-red-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'out of delivery': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* TOPBAR */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-primary-50 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500">Platform overview</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-[180px] h-[32px] px-3 text-[12px] bg-white border border-gray-200 rounded-[6px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary"
          />
          <button className="text-gray-400 hover:text-primary transition-colors">
            <Bell size={16} />
          </button>
        </div>
      </header>

      <div className="p-8 space-y-8">
        
        {/* STAT CARDS */}
        <div className="grid grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Revenue</span>
              <IndianRupee size={16} className="text-gray-900" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalRevenue)}</div>
              <div className="text-xs text-green-600 mt-1 font-medium">Real-time total</div>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Total Users</span>
              <Users size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats?.totalUsers?.toLocaleString('en-IN')}</div>
              <div className="text-xs text-primary mt-1 font-medium">Active platform users</div>
            </div>
          </div>

          {/* Shops */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Active Shops</span>
              <Store size={16} className="text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats?.totalShops?.toLocaleString('en-IN')}</div>
              <div className="text-xs text-gray-500 mt-1">Total registered vendors</div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Total Orders</span>
              <ShoppingBag size={16} className="text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats?.totalOrders?.toLocaleString('en-IN')}</div>
              <div className="text-xs text-gray-500 mt-1">Platform lifetime orders</div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Live Orders Feed */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900">Live Orders</h2>
              <span className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Connected
              </span>
            </div>
            <div className="p-2">
              {liveOrders.length === 0 && <p className="text-sm text-gray-500 p-4 text-center">No recent orders</p>}
              {liveOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${getStatusStyle(order.status).split(' ')[0]}`}></span>
                    <span className="text-sm font-medium text-gray-900 w-28 truncate">Order #{order.orderId.substring(order.orderId.length - 6)}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(order.amount)}</span>
                    <span className="text-xs text-gray-400 w-16 text-right whitespace-nowrap group-hover:text-primary transition-colors">
                      {formatDistanceToNow(order.time, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Shops Placeholder (To be made dynamic in Shops page) */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900">Top Shops</h2>
            </div>
            <div className="p-4 flex items-center justify-center h-full min-h-[200px] text-gray-400 text-sm">
              Analytics module loading...
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Overview;
