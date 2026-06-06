import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

const PurchaseOrders = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState(null);
  const { user } = useAuth();

  const fetchPOs = async () => {
    try {
      const res = await api.get('/purchase-orders');
      setPos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700',
      'Confirmed': 'bg-blue-100 text-blue-700',
      'Delivered': 'bg-purple-100 text-purple-700',
      'Paid': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.Draft;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Purchase Orders</h1>
        <p className="text-slate-500">View and track purchase orders.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-medium">PO Number</th>
                <th className="p-4 font-medium">Date</th>
                {user.role !== 'Vendor' && <th className="p-4 font-medium">Vendor</th>}
                <th className="p-4 font-medium">Total Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : pos.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No purchase orders found.</td></tr>
              ) : (
                pos.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{po.poNumber}</div>
                      <div className="text-slate-500 text-xs mt-1">{po.rfq?.title}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {format(new Date(po.createdAt), 'MMM dd, yyyy')}
                    </td>
                    {user.role !== 'Vendor' && (
                      <td className="p-4 font-medium">{po.vendor?.name}</td>
                    )}
                    <td className="p-4 font-medium">₹{(po.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedPO(po)}
                        className="text-slate-600 hover:text-green-600 hover:bg-green-50 p-2 rounded-md transition-colors inline-flex"
                        title="View PO Details"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Purchase Order Details</h2>
                <p className="text-sm text-slate-500">{selectedPO.poNumber}</p>
              </div>
              <button onClick={() => setSelectedPO(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Vendor</p>
                  <p className="font-medium text-slate-800">{selectedPO.vendor?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Date Created</p>
                  <p className="font-medium text-slate-800">{format(new Date(selectedPO.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-3">Items</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-medium text-slate-500">Description</th>
                      <th className="p-3 font-medium text-slate-500">Qty</th>
                      <th className="p-3 font-medium text-slate-500 text-right">Price</th>
                      <th className="p-3 font-medium text-slate-500 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPO.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="p-3 text-slate-800">{item.name}</td>
                        <td className="p-3 text-slate-600">{item.quantity} {item.unit}</td>
                        <td className="p-3 text-right text-slate-600">₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-medium text-slate-800">₹{(item.totalPrice || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{(selectedPO.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%):</span>
                    <span>₹{(selectedPO.taxAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-slate-800 text-lg">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{(selectedPO.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedPO(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
