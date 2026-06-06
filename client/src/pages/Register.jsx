import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Navigate, Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'Vendor',
    phone: '', gstNumber: '', category: 'IT & Software'
  });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors relative overflow-hidden">
      {/* Decorative ambient background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-400/20 dark:bg-green-600/20 blur-[100px] pointer-events-none"></div>

      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all z-20"
        title="Toggle Dark Mode"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-200/60 dark:border-slate-800/60 my-8 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 shadow-inner">
            <span className="text-3xl font-bold text-green-600 dark:text-green-500">V</span>
          </div>
          <h1 className="text-3xl font-bold tracking-wide dark:text-white">
            <span className="text-green-600 dark:text-green-500">Vendor</span>Bridge
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Create an account</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-100 dark:border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Vendor">Vendor</option>
              <option value="Procurement Officer">Procurement Officer</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          {formData.role === 'Vendor' && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Category</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 bg-white dark:bg-slate-800 dark:text-white transition-colors"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="IT & Software">IT & Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required={formData.role === 'Vendor'}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 bg-white dark:bg-slate-800 dark:text-white transition-colors"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GST Number</label>
                <input
                  type="text"
                  required={formData.role === 'Vendor'}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 bg-white dark:bg-slate-800 dark:text-white transition-colors"
                  placeholder="27AABCT1234P1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-medium py-2.5 rounded-xl hover:bg-green-700 transition-colors mt-4 shadow-sm"
          >
            Register
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="text-green-600 dark:text-green-500 font-medium hover:underline transition-colors">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
