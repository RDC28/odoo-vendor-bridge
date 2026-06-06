import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Download, Mail, Eye } from 'lucide-react';
import { format } from 'date-fns';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { user } = useAuth();

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownload = async (id, invoiceNumber) => {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download PDF');
    }
  };

  const handleEmail = async (id) => {
    try {
      await api.post(`/invoices/${id}/email`);
      alert('Email sent successfully!');
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send email');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700',
      'Sent': 'bg-blue-100 text-blue-700',
      'Paid': 'bg-green-100 text-green-700',
      'Overdue': 'bg-red-100 text-red-700',
      'Cancelled': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || colors.Draft;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
        <p className="text-slate-500">Manage billing and payments.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Invoice No</th>
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
              ) : invoices.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No invoices found.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-slate-500 text-xs mt-1">Ref: {inv.purchaseOrder?.poNumber}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {format(new Date(inv.createdAt), 'MMM dd, yyyy')}
                    </td>
                    {user.role !== 'Vendor' && (
                      <td className="p-4 font-medium">{inv.vendor?.name}</td>
                    )}
                    <td className="p-4 font-medium">₹{(inv.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end items-center space-x-2">
                      <button onClick={() => setSelectedInvoice(inv)} className="text-slate-600 hover:text-green-600 hover:bg-green-50 px-2 py-1.5 rounded-md transition-colors inline-flex items-center text-xs" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDownload(inv._id, inv.invoiceNumber)} className="text-slate-600 hover:text-green-600 hover:bg-green-50 px-2 py-1.5 rounded-md transition-colors inline-flex items-center text-xs" title="Download PDF">
                        <Download className="h-4 w-4" />
                      </button>
                      {user.role !== 'Vendor' && inv.status !== 'Paid' && (
                        <button onClick={() => handleEmail(inv._id)} className="text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-md transition-colors inline-flex items-center text-xs" title="Email to Vendor">
                          <Mail className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Invoice Details</h2>
                <p className="text-sm text-slate-500">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Vendor</p>
                  <p className="font-medium text-slate-800">{selectedInvoice.vendor?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Date Created</p>
                  <p className="font-medium text-slate-800">{format(new Date(selectedInvoice.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">PO Reference</p>
                  <p className="font-medium text-slate-800">{selectedInvoice.purchaseOrder?.poNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Due Date</p>
                  <p className="font-medium text-slate-800">{format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-5">
                <h3 className="font-bold text-slate-800 mb-4">Amount Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{(selectedInvoice.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%):</span>
                    <span>₹{(selectedInvoice.taxAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-slate-800 text-lg">
                    <span>Grand Total:</span>
                    <span className="text-green-600">₹{(selectedInvoice.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => handleDownload(selectedInvoice._id, selectedInvoice.invoiceNumber)}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </button>
              <button 
                onClick={() => setSelectedInvoice(null)}
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

export default Invoices;
