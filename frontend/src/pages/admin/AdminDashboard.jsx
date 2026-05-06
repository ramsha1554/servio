import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiShoppingBag, FiBox, FiTruck, FiLogOut } from 'react-router-dom'; // Will install react-icons later if missing, but it is in package.json
import { FiHome, FiSettings } from 'react-icons/fi';
import Overview from './Overview';
import Users from './Users';
import Shops from './Shops';
import Orders from './Orders';
import Delivery from './Delivery';
import { useDispatch } from 'react-redux';
import { clearUserData } from '../../redux/userSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Basic logout handling
    dispatch(clearUserData());
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Overview', path: '/admin/overview', icon: <FiGrid className="w-5 h-5" /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers className="w-5 h-5" /> },
    { name: 'Shops', path: '/admin/shops', icon: <FiShoppingBag className="w-5 h-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <FiBox className="w-5 h-5" /> },
    { name: 'Delivery', path: '/admin/delivery', icon: <FiTruck className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600 tracking-tight">Servio Admin</h1>
          <p className="text-xs text-neutral-500 mt-1">Command Center</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600 font-semibold shadow-sm' 
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <FiHome className="w-5 h-5" />
            Back to App
          </NavLink>
          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-error hover:bg-red-50 rounded-xl transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-8">
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<Users />} />
          <Route path="shops" element={<Shops />} />
          <Route path="orders" element={<Orders />} />
          <Route path="delivery" element={<Delivery />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
