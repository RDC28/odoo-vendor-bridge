import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, Eye, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const RFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRFQs = async () => {
    try {
      const res = await api.get('/rfqs');
      setRfqs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const handleSend = async (id) => {
    try {
      await api.post(`/rfqs/${id}/send`);
      fetchRFQs();
    } catch (err) {
      alert('Failed to send RFQ');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700',
      'Sent': 'bg-blue-100 text-blue-700',
      'Under Review': 'bg-orange-100 text-orange-700',
      'Approved': 'bg-green-100 text-green-700',
      'Closed': 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.Draft;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Requests for Quotation (RFQ)</h1>
          <p className="text-slate-500">Manage procurement requests and broadcast to vendors.</p>
        </div>
        {user.role !== 'Vendor' && (
          <Link to="/rfqs/create" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center">
            <Plus className="h-5 w-5 mr-2" /> Create RFQ
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-medium">RFQ Reference</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Deadline</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : rfqs.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No RFQs found.</td></tr>
              ) : (
                rfqs.map((rfq) => (
                  <tr key={rfq._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{rfq.title}</div>
                      <div className="text-slate-500 text-xs mt-1">By: {rfq.createdBy?.name}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {rfq.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {format(new Date(rfq.deadline), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end items-center space-x-2">
                      <button className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors flex items-center text-xs font-medium">
                        <Eye className="h-4 w-4 mr-1.5" /> View
                      </button>
                      
                      {user.role !== 'Vendor' && rfq.status === 'Draft' && (
                        <button onClick={() => handleSend(rfq._id)} className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors flex items-center text-xs font-medium">
                          <Send className="h-4 w-4 mr-1.5" /> Broadcast
                        </button>
                      )}

                      {user.role === 'Vendor' && rfq.status !== 'Closed' && (
                        <Link to={`/quotations/submit/${rfq._id}`} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors flex items-center text-xs font-medium">
                          Quote
                        </Link>
                      )}

                      {user.role !== 'Vendor' && rfq.status !== 'Draft' && (
                        <Link to={`/quotations/compare/${rfq._id}`} className="text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors flex items-center text-xs font-medium">
                          Compare
                        </Link>
                      )}
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

export default RFQs;
