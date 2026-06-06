import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const QuotationCompare = () => {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rfqRes, quoteRes] = await Promise.all([
          api.get('/rfqs'),
          api.get('/quotations')
        ]);
        
        const targetRfq = rfqRes.data.find(r => r._id === rfqId);
        setRfq(targetRfq);

        // Filter quotes for this RFQ
        const targetQuotes = quoteRes.data.filter(q => q.rfq._id === rfqId || q.rfq === rfqId);
        setQuotations(targetQuotes);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [rfqId]);

  const handleSelectWinner = async (quotationId) => {
    try {
      await api.post('/approvals', { rfqId, quotationId });
      alert('Quotation selected and sent for Manager Approval!');
      navigate('/approvals');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to select quotation');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading comparison...</div>;
  if (!rfq) return <div className="p-8 text-center text-red-500">RFQ not found.</div>;
  if (quotations.length === 0) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold mb-2">No Quotations Yet</h2>
      <p className="text-slate-500 mb-4">Vendors have not submitted any quotations for this RFQ.</p>
      <Link to="/rfqs" className="text-green-600 hover:underline">← Back to RFQs</Link>
    </div>
  );

  // Find lowest price for highlighting
  const lowestTotal = Math.min(...quotations.map(q => q.totalAmount));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/rfqs" className="mr-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"><ArrowLeft className="h-6 w-6" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Quotation Comparison</h1>
          <p className="text-slate-600 dark:text-slate-400">RFQ: {rfq.title} — {quotations.length} quotations received</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-r border-slate-200 dark:border-slate-800 w-1/4">Line Items</th>
                {quotations.map((quote, idx) => (
                  <th key={quote._id} className={`p-4 border-b border-slate-200 dark:border-slate-800 text-center ${quote.totalAmount === lowestTotal ? 'bg-green-50 dark:bg-green-900/30' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    <div className="font-bold text-slate-800 dark:text-white text-lg mb-1">{quote.vendor?.name || `Vendor ${idx+1}`}</div>
                    <div className="flex items-center justify-center mb-1 text-sm text-yellow-500">
                      <span>{'★'.repeat(Math.floor(4.5))}</span>
                      <span className="text-slate-500 dark:text-slate-400 ml-1 text-xs">4.5/5.0</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-normal">Delivery: {quote.deliveryDays} Days</div>
                    {quote.totalAmount === lowestTotal && (
                      <span className="inline-block mt-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 text-xs px-2 py-1 rounded-full font-bold">Best Price</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-300">
              {/* Render each item */}
              {rfq.items.map((item, itemIdx) => (
                <tr key={itemIdx} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="p-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-medium text-slate-800 dark:text-white">{item.name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{item.quantity} {item.unit}</div>
                  </td>
                  {quotations.map(quote => {
                    // Find the matching item in the quotation
                    const quoteItem = quote.items?.find(i => i.name === item.name) || quote.items[itemIdx];
                    return (
                      <td key={quote._id} className={`p-4 text-center ${quote.totalAmount === lowestTotal ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                        <div className="text-slate-800 dark:text-slate-300 font-medium">₹{quoteItem ? quoteItem.unitPrice.toLocaleString('en-IN') : 'N/A'}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Total: ₹{quoteItem ? quoteItem.totalPrice.toLocaleString('en-IN') : 'N/A'}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                <td className="p-4 border-r border-slate-200 dark:border-slate-800 font-bold text-right text-slate-800 dark:text-white">Grand Total:</td>
                {quotations.map(quote => (
                  <td key={quote._id} className={`p-4 text-center text-xl font-bold ${quote.totalAmount === lowestTotal ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'text-slate-800 dark:text-white'}`}>
                    ₹{quote.totalAmount.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* Notes Row */}
              <tr>
                <td className="p-4 border-r border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">Vendor Notes:</td>
                {quotations.map(quote => (
                  <td key={quote._id} className={`p-4 text-sm text-slate-700 dark:text-slate-400 ${quote.totalAmount === lowestTotal ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                    {quote.notes || '-'}
                  </td>
                ))}
              </tr>

              {/* Action Row */}
              {user.role === 'Procurement Officer' && (
                <tr>
                  <td className="p-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"></td>
                  {quotations.map(quote => (
                    <td key={quote._id} className={`p-4 text-center ${quote.totalAmount === lowestTotal ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                      {rfq.status !== 'Approved' && rfq.status !== 'Closed' && (
                        <button 
                          onClick={() => handleSelectWinner(quote._id)}
                          className={`px-4 py-2 rounded-xl font-medium w-full flex items-center justify-center transition-colors ${quote.totalAmount === lowestTotal ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300'}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Select Vendor
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationCompare;
