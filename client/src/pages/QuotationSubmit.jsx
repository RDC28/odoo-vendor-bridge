import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const QuotationSubmit = () => {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryDays, setDeliveryDays] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [existingQuoteId, setExistingQuoteId] = useState(null);

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const [rfqRes, quoteRes] = await Promise.all([
          api.get('/rfqs'),
          api.get(`/quotations?rfqId=${rfqId}`)
        ]);
        
        const targetRfq = rfqRes.data.find(r => r._id === rfqId);
        if (targetRfq) {
          setRfq(targetRfq);
          
          const existingQuote = quoteRes.data[0];
          if (existingQuote) {
            setExistingQuoteId(existingQuote._id);
            setDeliveryDays(existingQuote.deliveryDays);
            setNotes(existingQuote.notes || '');
            setItems(existingQuote.items);
          } else {
            setItems(targetRfq.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: 0,
              totalPrice: 0
            })));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRFQ();
  }, [rfqId]);

  const handlePriceChange = (index, val) => {
    const newItems = [...items];
    const price = Number(val);
    newItems[index].unitPrice = price;
    newItems[index].totalPrice = price * newItems[index].quantity;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async (e, status = 'Submitted') => {
    if (e) e.preventDefault();
    try {
      const payload = {
        rfq: rfqId,
        items,
        totalAmount: calculateTotal(),
        deliveryDays: Number(deliveryDays),
        notes,
        status
      };
      
      if (existingQuoteId) {
        await api.put(`/quotations/${existingQuoteId}`, payload);
      } else {
        await api.post('/quotations', payload);
      }
      
      alert(`Quotation ${status === 'Draft' ? 'saved as draft' : 'submitted'} successfully!`);
      navigate('/quotations');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quotation');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading RFQ details...</div>;
  if (!rfq) return <div className="p-8 text-center text-red-500">RFQ not found.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Submit Quotation</h1>
        <p className="text-slate-500">RFQ: {rfq.title} — Deadline: {new Date(rfq.deadline).toLocaleDateString()}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">Line Items Pricing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-sm text-slate-500 uppercase">
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3 w-40">Unit Price (₹)</th>
                    <th className="p-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-3 font-medium text-slate-800">{item.name}</td>
                      <td className="p-3 text-slate-600">{item.quantity}</td>
                      <td className="p-3 text-slate-600">{item.unit}</td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          required 
                          min="0"
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-green-500 text-sm"
                          value={item.unitPrice || ''}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                        />
                      </td>
                      <td className="p-3 text-right font-medium text-slate-800">
                        {item.totalPrice.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td colSpan="4" className="p-4 text-right">Grand Total:</td>
                    <td className="p-4 text-right text-lg text-green-700">₹{calculateTotal().toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Time (Days) *</label>
              <input 
                type="number" 
                required 
                min="1"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-green-500"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder="e.g. 14"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Terms / Notes</label>
              <textarea 
                rows="2" 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-green-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Warranty, payment terms..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 space-x-4">
            <button 
              type="button" 
              onClick={() => handleSubmit(null, 'Draft')}
              className="px-8 py-2.5 rounded-lg font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors"
            >
              Save as Draft
            </button>
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, 'Submitted')}
              disabled={calculateTotal() === 0} 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              Submit Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationSubmit;
