import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, Eye, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const RFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quotedRfqIds, setQuotedRfqIds] = useState([]);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const { user } = useAuth();

  const fetchRFQs = async () => {
    try {
      const res = await api.get('/rfqs');
      setRfqs(res.data);
      
      if (user.role === 'Vendor') {
        const qRes = await api.get('/quotations');
        const ids = qRes.data.map(q => q.rfq?._id || q.rfq);
        setQuotedRfqIds(ids);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, [user.role]);

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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Requests for Quotation (RFQ)</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage procurement requests and broadcast to vendors.</p>
        </div>
        {user.role !== 'Vendor' && (
          <Link to="/rfqs/create" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center">
            <Plus className="h-5 w-5 mr-2" /> Create RFQ
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4 font-medium">RFQ Reference</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Deadline</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : rfqs.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No RFQs found.</td></tr>
              ) : (
                rfqs.map((rfq) => (
                  <tr key={rfq._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">{rfq.title}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">By: {rfq.createdBy?.name}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium">
                        {rfq.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {format(new Date(rfq.deadline), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end items-center space-x-2">
                      <button onClick={() => setSelectedRfq(rfq)} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-md transition-colors flex items-center text-xs font-medium">
                        <Eye className="h-4 w-4 mr-1.5" /> View
                      </button>
                      
                      {user.role !== 'Vendor' && rfq.status === 'Draft' && (
                        <button onClick={() => handleSend(rfq._id)} className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors flex items-center text-xs font-medium">
                          <Send className="h-4 w-4 mr-1.5" /> Broadcast
                        </button>
                      )}

                      {user.role === 'Vendor' && rfq.status !== 'Closed' && !quotedRfqIds.includes(rfq._id) && (
                        <Link to={`/quotations/submit/${rfq._id}`} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors flex items-center text-xs font-medium">
                          Quote
                        </Link>
                      )}

                      {user.role === 'Vendor' && quotedRfqIds.includes(rfq._id) && (
                        <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md text-xs font-medium cursor-not-allowed">
                          Quoted
                        </span>
                      )}

                      {user.role !== 'Vendor' && rfq.status !== 'Draft' && (
                        <Link to={`/quotations/compare/${rfq._id}`} className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors flex items-center text-xs font-medium">
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

      {selectedRfq && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:border dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">RFQ Details</h2>
              <button onClick={() => setSelectedRfq(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Title</div>
                <div className="text-lg text-slate-800 dark:text-white font-medium">{selectedRfq.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Category</div>
                  <div className="text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 inline-block px-2 py-1 rounded text-sm">{selectedRfq.category}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Deadline</div>
                  <div className="text-slate-800 dark:text-slate-300 text-sm font-medium">{format(new Date(selectedRfq.deadline), 'MMM dd, yyyy')}</div>
                </div>
              </div>
              {selectedRfq.description && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Description</div>
                  <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">{selectedRfq.description}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-3">Requested Items</div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Description</th>
                        <th className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedRfq.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 text-sm text-slate-800 dark:text-slate-300">{item.name}</td>
                          <td className="p-3 text-sm text-slate-800 dark:text-slate-300 text-right font-medium">{item.quantity} {item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end">
              <button onClick={() => setSelectedRfq(null)} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQs;
