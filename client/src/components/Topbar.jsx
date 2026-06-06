import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Search, Bell, LogOut, User } from 'lucide-react';

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-slate-50"
            placeholder="Search RFQs, POs, Vendors..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-6 ml-4">
        <button className="text-slate-400 hover:text-slate-600 relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 leading-tight">{user?.name}</span>
            <span className="text-xs text-slate-500 leading-tight">{user?.role}</span>
          </div>
          <button onClick={logout} className="ml-4 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
