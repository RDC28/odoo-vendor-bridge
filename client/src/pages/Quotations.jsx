import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await api.get('/quotations');
        setQuotations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-blue-100 text-blue-700',
      'Under Review': 'bg-orange-100 text-orange-700',
      'Selected': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.Submitted;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quotations</h1>
        <p className="text-slate-500">
          {user.role === 'Vendor' ? 'Manage your submitted quotations.' : 'Review quotations received from vendors.'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-medium">RFQ Reference</th>
                {user.role !== 'Vendor' && <th className="p-4 font-medium">Vendor</th>}
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total Amount</th>
                <th className="p-4 font-medium">Status</th>
                {user.role !== 'Procurement Officer' && <th className="p-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan={user.role === 'Admin' || user.role === 'Manager' ? '6' : '5'} className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={user.role === 'Admin' || user.role === 'Manager' ? '6' : '5'} className="p-8 text-center text-slate-400">No quotations found.</td></tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{q.rfq?.title}</div>
                      <div className="text-slate-500 text-xs mt-1">Delivery: {q.deliveryDays} days</div>
                    </td>
                    {user.role !== 'Vendor' && (
                      <td className="p-4 font-medium">{q.vendor?.name}</td>
                    )}
                    <td className="p-4 text-slate-600">{q.items?.length || 0} items</td>
                    <td className="p-4 font-medium">₹{(q.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(q.status)}`}>
                        {q.status}
                      </span>
                    </td>
                    {user.role !== 'Procurement Officer' && (
                      <td className="p-4 text-right">
                        {user.role === 'Vendor' && q.status === 'Draft' ? (
                          <Link to={`/rfqs/${q.rfq._id}/quote`} className="text-slate-600 hover:text-green-600 hover:bg-green-50 p-2 rounded-md transition-colors inline-flex" title="Edit Draft">
                            <Edit className="h-4 w-4" />
                          </Link>
                        ) : (
                          <Link to={`/quotations/compare/${q.rfq._id}`} className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors inline-flex" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                      </td>
                    )}
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

export default Quotations;
