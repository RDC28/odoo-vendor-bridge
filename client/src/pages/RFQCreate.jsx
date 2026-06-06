import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';

const RFQCreate = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vendors, setVendors] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'IT & Software',
    deadline: '',
    description: '',
    items: [{ name: '', quantity: 1, unit: 'Nos', estimatedPrice: 0 }],
    assignedVendors: []
  });

  useEffect(() => {
    const fetchVendors = async () => {
      const res = await api.get('/vendors');
      setVendors(res.data.filter(v => v.status === 'Active'));
    };
    fetchVendors();
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, unit: 'Nos', estimatedPrice: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleVendorToggle = (vendorId) => {
    const assigned = [...formData.assignedVendors];
    if (assigned.includes(vendorId)) {
      setFormData({ ...formData, assignedVendors: assigned.filter(id => id !== vendorId) });
    } else {
      setFormData({ ...formData, assignedVendors: [...assigned, vendorId] });
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/rfqs', formData);
      alert('RFQ created successfully!');
      navigate('/rfqs');
    } catch (err) {
      alert('Failed to create RFQ');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create RFQ's</h1>
        <p className="text-slate-500 dark:text-slate-400">New request for quotation</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map((num) => (
          <div key={num} className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${step >= num ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700'}`}>
            {num}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-colors">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-4">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">RFQ Title *</label>
              <input type="text" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500/50" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Office Furniture Q4" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500/50" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="IT & Software">IT & Software</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Office Supplies">Office Supplies</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline *</label>
                <input type="date" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500/50" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Notes</label>
              <textarea rows="3" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500/50" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Additional requirements..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attachments (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl bg-slate-50 dark:bg-slate-800/50 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <label className="relative cursor-pointer rounded-md font-medium text-green-600 dark:text-green-500 hover:text-green-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" multiple />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={() => setStep(2)} disabled={!formData.title || !formData.deadline} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center disabled:opacity-50">
                Next Step <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Line Items</h2>
              <button onClick={handleAddItem} className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 px-3 py-1.5 rounded-lg font-medium flex items-center text-sm border border-green-200 dark:border-green-900/50">
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Item Name</label>
                    <input type="text" className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500/50" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} placeholder="Product name" />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Quantity</label>
                    <input type="number" min="1" className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500/50" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Unit</label>
                    <select className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500/50" value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)}>
                      <option value="Nos">Nos</option>
                      <option value="Box">Box</option>
                      <option value="Kg">Kg</option>
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Est. Price (₹)</label>
                    <input type="number" className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500/50" value={item.estimatedPrice} onChange={e => handleItemChange(index, 'estimatedPrice', Number(e.target.value))} />
                  </div>
                  <div className="pt-6">
                    <button onClick={() => handleRemoveItem(index)} disabled={formData.items.length === 1} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-md disabled:opacity-30 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setStep(1)} className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-2 rounded-lg font-medium transition-colors">Back</button>
              <button onClick={() => {
                const categoryVendors = vendors.filter(v => v.category === formData.category).map(v => v._id);
                setFormData({ ...formData, assignedVendors: categoryVendors });
                setStep(3);
              }} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center">
                Next Step <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-4">Assign Vendors</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Showing all active vendors from the <strong>{formData.category}</strong> category. They have been automatically selected. You can uncheck any to exclude.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {vendors.filter(v => v.category === formData.category).map(vendor => (
                <div key={vendor._id} onClick={() => handleVendorToggle(vendor._id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-colors flex items-center ${formData.assignedVendors.includes(vendor._id) ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-500/50 bg-white dark:bg-slate-800'}`}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${formData.assignedVendors.includes(vendor._id) ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                    {formData.assignedVendors.includes(vendor._id) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-sm">{vendor.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{vendor.email}</div>
                  </div>
                </div>
              ))}
              {vendors.filter(v => v.category === formData.category).length === 0 && (
                <div className="col-span-2 p-4 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm rounded-lg border border-orange-100 dark:border-orange-800/50">
                  No active vendors found in the {formData.category} category.
                </div>
              )}
            </div>

            <div className="flex justify-between pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
              <button onClick={() => setStep(2)} className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-2 rounded-lg font-medium transition-colors">Back</button>
              <button onClick={handleSubmit} disabled={formData.assignedVendors.length === 0} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center disabled:opacity-50">
                Create & Save RFQ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFQCreate;
