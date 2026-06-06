import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle, XCircle } from 'lucide-react';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/approvals');
      setApprovals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecide = async (id, status) => {
    const remarks = window.prompt(`Enter remarks for ${status.toLowerCase()}:`);
    if (remarks === null) return; // cancelled
    
    try {
      await api.put(`/approvals/${id}`, { status, remarks });
      fetchApprovals();
    } catch (err) {
      alert('Failed to update approval');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-orange-100 text-orange-700 border-orange-200',
      'Approved': 'bg-green-100 text-green-700 border-green-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || colors.Pending;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Approvals</h1>
        <p className="text-slate-600 dark:text-slate-400">Review and approve selected quotations for PO generation.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>
        ) : approvals.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">No approval requests found.</div>
        ) : (
          approvals.map((approval) => (
            <div key={approval._id} className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row md:items-center justify-between transition-colors ${
              approval.status === 'Pending' ? 'border-orange-200 dark:border-orange-900/50 shadow-orange-100/50 dark:shadow-orange-900/20' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{approval.rfq?.title}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(approval.status)}`}>
                    {approval.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700 dark:text-slate-400 mt-3">
                  <div><span className="font-medium text-slate-900 dark:text-slate-300">Vendor:</span> {approval.quotation?.vendor?.name}</div>
                  <div><span className="font-medium text-slate-900 dark:text-slate-300">Amount:</span> ₹{(approval.quotation?.totalAmount || 0).toLocaleString('en-IN')}</div>
                  <div><span className="font-medium text-slate-900 dark:text-slate-300">Requested By:</span> {approval.requestedBy?.name}</div>
                  {approval.decidedAt && (
                    <div><span className="font-medium text-slate-900 dark:text-slate-300">Decided By:</span> {approval.approver?.name}</div>
                  )}
                  {approval.remarks && (
                    <div className="col-span-2 text-slate-600 dark:text-slate-500 italic mt-1">"{approval.remarks}"</div>
                  )}
                </div>
              </div>
              
              {approval.status === 'Pending' && user.role === 'Manager' ? (
                <Link to={`/approvals/${approval._id}`} className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors text-xs font-bold shadow-sm">
                  Review Workflow
                </Link>
              ) : (
                <Link to={`/approvals/${approval._id}`} className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-1.5 rounded-lg transition-colors text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
                  View
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Approvals;
