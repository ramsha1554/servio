import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, TrendingUp, Users, Store, ShoppingBag, 
  Bike, ShieldCheck, Settings, LogOut, Zap
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../../redux/userSlice';

import Overview from './Overview';
import UsersPage from './Users';
import Shops from './Shops';
import Orders from './Orders';
import Delivery from './Delivery';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.user);

  const handleLogout = () => {
    dispatch(setUserData(null));
    window.location.href = '/';
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 text-[12px] transition-colors ${
      isActive 
        ? 'bg-[#ffffff] text-[#18181b] font-medium border-[0.5px] border-[#e5e5e2] rounded-[6px]' 
        : 'text-[#71717a] hover:bg-[#eeeeec] rounded-[6px] border-[0.5px] border-transparent'
    }`;

  const renderNavSection = (title, items) => (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-[0.08em] text-[#a1a1aa] px-3 mb-2 font-medium">
        {title}
      </div>
      <div className="space-y-[2px]">
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
    <div className="flex h-screen bg-[#fafaf9] font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[200px] bg-[#f5f5f3] border-r-[0.5px] border-[#e5e5e2] flex flex-col pt-[16px] px-[10px] pb-[16px]">
        
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-3 pb-[16px] mb-4 border-b-[0.5px] border-[#e5e5e2]">
          <div className="w-[26px] h-[26px] bg-[#18181b] rounded-[6px] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-[#18181b] leading-tight">Servio</span>
            <span className="text-[9px] text-[#71717a] bg-[#e4e4e7] px-[4px] py-[1px] rounded-[4px] w-fit mt-[2px]">Admin</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {renderNavSection('OVERVIEW', [
            { name: 'Dashboard', path: '/admin/overview', icon: <LayoutDashboard size={14} /> },
            { name: 'Analytics', path: '/admin/analytics', icon: <TrendingUp size={14} /> },
          ])}

          {renderNavSection('MANAGE', [
            { name: 'Users', path: '/admin/users', icon: <Users size={14} /> },
            { name: 'Shops', path: '/admin/shops', icon: <Store size={14} /> },
            { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={14} /> },
            { name: 'Delivery', path: '/admin/delivery', icon: <Bike size={14} /> },
          ])}

          {renderNavSection('PLATFORM', [
            { name: 'Moderation', path: '/admin/moderation', icon: <ShieldCheck size={14} /> },
            { name: 'Settings', path: '/admin/settings', icon: <Settings size={14} /> },
          ])}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-[16px] border-t-[0.5px] border-[#e5e5e2]">
          <div className="flex items-center gap-2 px-3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#e4e4e7] text-[#18181b] flex items-center justify-center text-[10px] font-medium shrink-0">
              {userData?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-[12px] text-[#18181b] truncate">{userData?.fullName || 'Admin User'}</span>
              <span className="text-[10px] text-[#a1a1aa]">Superadmin</span>
            </div>
            <button onClick={handleLogout} className="text-[#a1a1aa] hover:text-[#18181b] transition-colors shrink-0">
              <LogOut size={14} />
            </button>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#fafaf9]">
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
