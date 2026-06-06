import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Search, Bell, LogOut, User, CheckCircle, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setShowDropdown(false);
      if (notif.link) navigate(notif.link);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white transition-all shadow-inner backdrop-blur-sm"
            placeholder="Search RFQs, POs, Vendors..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-6 ml-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          title="Toggle Dark Mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`relative p-2 rounded-full transition-colors ${showDropdown ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No notifications yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-xs ${!notif.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'} line-clamp-2`}>{notif.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">You have {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-700 pl-6">
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{user?.name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{user?.role}</span>
          </div>
          <button onClick={logout} className="ml-4 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
