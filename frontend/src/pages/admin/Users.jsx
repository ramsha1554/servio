import React, { useState } from 'react';
import { Search, UserCog, X, Check, Users as UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useGetAdminUsers, useToggleBanUser, useChangeUserRole } from '../../hooks/admin/useAdminUsers';

const Users = () => {
  const { data: users, isLoading, isError } = useGetAdminUsers();
  const toggleBanMutation = useToggleBanUser();
  const changeRoleMutation = useChangeUserRole();
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState(null);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 w-48 rounded mb-8"></div>
        <div className="h-96 bg-gray-200 rounded-[10px]"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-red-500 text-[13px]">Failed to load users. <button className="underline ml-2">Retry</button></div>;
  }

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const getRoleStyle = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'owner': return 'bg-blue-100 text-blue-800';
      case 'deliveryBoy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleBan = (userId) => {
    toggleBanMutation.mutate(userId);
  };

  const handleChangeRole = (userId, newRole) => {
    changeRoleMutation.mutate({ userId, role: newRole });
    setActiveDropdown(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Users</h1>
          <p className="text-xs text-gray-500">Manage platform users</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="All">All Roles</option>
            <option value="user">Customer</option>
            <option value="owner">Owner</option>
            <option value="deliveryBoy">Delivery</option>
            <option value="admin">Admin</option>
          </select>
          <span className="text-[12px] text-gray-500 font-medium ml-2">Total: {filteredUsers?.length || 0}</span>
        </div>
      </header>

      {/* TABLE */}
      <div className="p-8">
        <div data-testid="admin-users-list" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers?.map((user) => (
                  <tr 
                    key={user._id} 
                    className={`hover:bg-gray-50/50 transition-colors group ${user.isBanned ? 'bg-red-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getRoleStyle(user.role)}`}>
                          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleStyle(user.role)}`}>
                        {user.role === 'deliveryBoy' ? 'Delivery' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800">Banned</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(user.createdAt), 'MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2 relative opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        data-testid="ban-user-btn"
                        onClick={() => handleToggleBan(user._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.isBanned ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"
                        }`}
                        title={user.isBanned ? "Unban User" : "Ban User"}
                      >
                        {user.isBanned ? "Unban" : "Ban"}
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === user._id ? null : user._id)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="Change Role"
                        >
                          <UserCog size={18} />
                        </button>
                        
                        {activeDropdown === user._id && (
                          <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden py-1">
                            {['user', 'owner', 'deliveryBoy', 'admin'].map((r) => (
                              <button
                                key={r}
                                onClick={() => handleChangeRole(user._id, r)}
                                className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                                  user.role === r ? 'text-primary font-bold bg-primary/5' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                {r === 'deliveryBoy' ? 'Delivery' : r.charAt(0).toUpperCase() + r.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
