import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, TrendingUp, Users, Store, ShoppingBag, 
  Bike, ShieldCheck, Settings, LogOut, Zap
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../../App';

import Overview from './Overview';
import UsersPage from './Users';
import Shops from './Shops';
import Orders from './Orders';
import Delivery from './Delivery';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.user);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(setUserData(null));
      window.location.href = '/signin';
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-all ${
      isActive 
        ? 'bg-primary text-white shadow-md rounded-[8px]' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-[8px]'
    }`;

  const renderNavSection = (title, items) => (
    <div className="mb-6">
      <div className="text-[11px] uppercase tracking-wider text-gray-400 px-3 mb-3 font-bold">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className={navItemClass}>
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col pt-6 px-4 pb-6 shadow-sm z-20">
        
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-2 pb-6 mb-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-none">Servio</span>
            <span className="text-[10px] text-primary font-semibold tracking-wide uppercase mt-1">Admin Portal</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {renderNavSection('OVERVIEW', [
            { name: 'Dashboard', path: '/admin/overview', icon: <LayoutDashboard size={18} /> },
            { name: 'Analytics', path: '/admin/analytics', icon: <TrendingUp size={18} /> },
          ])}

          {renderNavSection('MANAGE', [
            { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
            { name: 'Shops', path: '/admin/shops', icon: <Store size={18} /> },
            { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={18} /> },
            { name: 'Delivery', path: '/admin/delivery', icon: <Bike size={18} /> },
          ])}

          {renderNavSection('PLATFORM', [
            { name: 'Moderation', path: '/admin/moderation', icon: <ShieldCheck size={18} /> },
            { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
          ])}
        </div>

        {/* Footer with Logout */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-xl border border-gray-100 group">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {userData?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-xs font-bold text-gray-900 truncate">{userData?.fullName || 'Admin User'}</span>
              <span className="text-[10px] text-gray-500 font-medium">Superadmin</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-gray-50/50 relative">
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="shops" element={<Shops />} />
          <Route path="orders" element={<Orders />} />
          <Route path="delivery" element={<Delivery />} />
        </Routes>
      </main>

    </div>
  );
};

export default AdminDashboard;
