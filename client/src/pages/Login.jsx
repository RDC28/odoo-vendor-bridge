import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();

  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide">
            <span className="text-green-600">Vendor</span>Bridge
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Procurement & Vendor Management ERP</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="admin@vendorbridge.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-500 text-center">
          <p className="mb-2 font-medium text-slate-700">Demo Accounts (pwd: password123):</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Admin: admin@...</div>
            <div>Officer: arjun@...</div>
            <div>Manager: priya@...</div>
            <div>Vendor: ravi@...</div>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            Don't have an account? <Link to="/register" className="text-green-600 font-medium hover:underline">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
