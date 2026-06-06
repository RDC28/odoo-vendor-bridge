import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Vendors = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', category: 'IT & Software', gstNumber: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchVendors = async () => {
    try {
      const res = await api.get(`/vendors${searchTerm ? `?search=${searchTerm}` : ''}`);
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/vendors/${editingId}`, formData);
      } else {
        await api.post('/vendors', formData);
      }
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', category: 'IT & Software', gstNumber: '' });
      setEditingId(null);
      fetchVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save vendor');
    }
  };

  const handleEdit = (vendor) => {
    setFormData(vendor);
    setEditingId(vendor._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await api.delete(`/vendors/${id}`);
        fetchVendors();
      } catch (err) {
        alert('Failed to delete vendor');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          <p className="text-slate-500">Manage supplier profiles and registrations.</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', email: '', phone: '', category: 'IT & Software', gstNumber: '' });
              setShowModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Vendor
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by name..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:ring-1 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Vendor Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Status</th>
                {user?.role === 'Admin' && <th className="p-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan={user?.role === 'Admin' ? '6' : '5'} className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : vendors.length === 0 ? (
                <tr><td colSpan={user?.role === 'Admin' ? '6' : '5'} className="p-8 text-center text-slate-400">No vendors found.</td></tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{vendor.name}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {vendor.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-sm font-medium text-slate-700">{(Math.random() * (5 - 3.5) + 3.5).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>{vendor.email}</div>
                      <div className="text-slate-500 text-xs mt-1">{vendor.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        vendor.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    {user?.role === 'Admin' && (
                      <td className="p-4 text-right">
                        <button onClick={() => handleEdit(vendor)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors mr-2">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(vendor._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-green-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input required type="email" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-green-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-green-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-green-500 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-green-500" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
