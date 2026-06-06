import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Check, X, FileText, CheckCircle, Clock } from 'lucide-react';

const ApprovalDetail = () => {
  const { approvalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [approval, setApproval] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApproval = async () => {
      try {
        const res = await api.get('/approvals');
        const target = res.data.find(a => a._id === approvalId);
        setApproval(target);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApproval();
  }, [approvalId]);

  const handleAction = async (action) => {
    try {
      await api.put(`/approvals/${approvalId}`, { status: action, remarks });
      alert(`Approval ${action.toLowerCase()} successfully!`);
      navigate('/approvals');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update approval');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading workflow...</div>;
  if (!approval) return <div className="p-8 text-center text-red-500">Approval not found.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-8">
        <Link to="/approvals" className="mr-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"><ArrowLeft className="h-6 w-6" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Approval Workflow</h1>
          <p className="text-slate-600 dark:text-slate-400">Review selected quotation and authorize purchase order generation.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 mb-6 transition-colors">
        {/* Timeline Stepper */}
        <div className="relative mb-12 mt-4">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2"></div>
          <div className="flex justify-between items-center relative z-10 px-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mb-2 shadow-md"><Check className="w-5 h-5" /></div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">RFQ Sent</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mb-2 shadow-md"><Check className="w-5 h-5" /></div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">Quotation Selected</div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-md ${approval.status === 'Approved' ? 'bg-green-500 text-white' : approval.status === 'Rejected' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900'}`}>
                {approval.status === 'Approved' ? <Check className="w-5 h-5" /> : approval.status === 'Rejected' ? <X className="w-5 h-5" /> : '3'}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">Manager Approval</div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${approval.status === 'Approved' ? 'bg-green-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'}`}>
                {approval.status === 'Approved' ? <Check className="w-5 h-5" /> : '4'}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">PO Generated</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-800 pt-8">
          {/* RFQ Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center"><FileText className="w-4 h-4 mr-2" /> Original Request</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="font-bold text-lg text-slate-800 dark:text-white mb-1">{approval.rfq?.title || 'Unknown RFQ'}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">Category: {approval.rfq?.category}</div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Requested Items:</span>
                  <span className="font-medium text-slate-800 dark:text-white">{approval.rfq?.items?.length || 0} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Procurement Officer:</span>
                  <span className="font-medium text-slate-800 dark:text-white">{approval.rfq?.createdBy?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quotation Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Selected Vendor Quotation</h3>
            <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/30 transition-colors">
              <div className="font-bold text-lg text-slate-800 dark:text-white mb-1">{approval.quotation?.vendor?.name || 'Unknown Vendor'}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex items-center"><Clock className="w-4 h-4 mr-1 inline" /> Delivery: {approval.quotation?.deliveryDays} Days</div>
              
              <div className="space-y-2 border-t border-green-200/50 dark:border-green-800/50 pt-3 mt-3">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-800 dark:text-slate-300">Total Amount Requested:</span>
                  <span className="text-xl text-green-700 dark:text-green-400">₹{approval.quotation?.totalAmount?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Vendor Notes: {approval.quotation?.notes || 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manager Action Area */}
        {approval.status === 'Pending' && user.role === 'Manager' && (
          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-8">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Manager Authorization</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Review Remarks / Notes (Required for rejection)</label>
              <textarea 
                rows="3" 
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500/50"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter approval conditions or rejection reasons..."
              ></textarea>
            </div>
            <div className="flex space-x-4">
              <button onClick={() => handleAction('Approved')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center flex-1 justify-center transition-colors shadow-sm">
                <Check className="w-5 h-5 mr-2" /> Approve & Generate PO
              </button>
              <button onClick={() => handleAction('Rejected')} disabled={!remarks} className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-8 py-3 rounded-xl font-bold flex items-center flex-1 justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <X className="w-5 h-5 mr-2" /> Reject Request
              </button>
            </div>
          </div>
        )}

        {approval.status !== 'Pending' && (
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Current Status:</span>
              <span className={`ml-2 font-bold ${approval.status === 'Approved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{approval.status}</span>
            </div>
            {approval.remarks && (
              <div className="text-sm italic text-slate-600 dark:text-slate-400">"{approval.remarks}"</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalDetail;
