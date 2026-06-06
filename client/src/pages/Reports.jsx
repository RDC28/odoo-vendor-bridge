import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

const Reports = () => {
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [trendRes, categoryRes, vendorRes] = await Promise.all([
          api.get('/reports/monthly-trend'),
          api.get('/reports/spend-by-category'),
          api.get('/reports/top-vendors')
        ]);
        setTrendData(trendRes.data);
        setCategoryData(categoryRes.data);
        setTopVendors(vendorRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading reports...</div>;

  const handleExportCSV = () => {
    if (topVendors.length === 0) return;
    
    const headers = ['Rank,Vendor Name,Category,PO Count,Total Spend'];
    const csvData = topVendors.map((v, i) => 
      `${i + 1},"${v.vendorName}","${v.category}",${v.poCount},${v.totalSpend || 0}`
    );
    
    const blob = new Blob([headers.concat(csvData).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vendor_spend_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Procurement spend analysis and vendor performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Monthly Spend Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: 'none', color: '#fff' }} />
                <Line type="monotone" dataKey="total" name="Spend" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Spend by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} tick={{ fill: '#64748b' }} />
                <YAxis dataKey="_id" type="category" tick={{ fill: '#334155', fontSize: 12 }} width={100} />
                <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                <Bar dataKey="total" name="Amount" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Top Vendors by Spend</h2>
          <button 
            onClick={handleExportCSV}
            disabled={topVendors.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 uppercase">
                <th className="p-4 font-medium">Rank</th>
                <th className="p-4 font-medium">Vendor Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">PO Count</th>
                <th className="p-4 font-medium text-right">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {topVendors.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No data available</td></tr>
              ) : topVendors.map((vendor, i) => (
                <tr key={vendor._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-slate-500 dark:text-slate-400">#{i + 1}</td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{vendor.vendorName}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{vendor.category}</td>
                  <td className="p-4 text-right text-slate-600 dark:text-slate-400">{vendor.poCount}</td>
                  <td className="p-4 text-right font-medium text-slate-900 dark:text-white">₹{(vendor.totalSpend || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
