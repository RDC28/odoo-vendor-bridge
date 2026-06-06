import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, FileSpreadsheet, CheckSquare } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pos, setPos] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes, chartRes, posRes, invRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/activity-logs?limit=5'),
          api.get('/reports/monthly-trend'),
          api.get('/purchase-orders'),
          api.get('/invoices')
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data);
        setPos(posRes.data.slice(0, 5));
        setInvoices(invRes.data.slice(0, 5));
        // Only show last 6 months for demo
        setChartData(chartRes.data.slice(-6));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: 'Total Spend', value: `₹${(stats?.totalSpend || 0).toLocaleString('en-IN')}`, icon: FileSpreadsheet, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Vendors', value: stats?.activeVendors || 0, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Active RFQs', value: stats?.activeRFQs || 0, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: CheckSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name}!</h1>
        <p className="text-slate-500 mt-1">Here's what's happening in your procurement pipeline today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
              <div className={`h-12 w-12 rounded-lg ${card.bg} flex items-center justify-center mr-4`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Spend Overview (Last 6 Months)</h2>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                  <Bar dataKey="total" name="Total Spend" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {logs.map((log) => (
              <div key={log._id} className="flex relative">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center z-10 ring-4 ring-white shrink-0">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 flex-1 pb-1 border-b border-slate-100 last:border-0">
                  <p className="text-sm text-slate-700">{log.description}</p>
                  <span className="text-xs text-slate-400 block mt-1">
                    {new Date(log.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Purchase Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">PO Number</th>
                  <th className="pb-3 font-medium">Vendor</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pos.map(po => (
                  <tr key={po._id}>
                    <td className="py-3 font-medium">{po.poNumber}</td>
                    <td className="py-3 truncate max-w-[150px]">{po.vendor?.name}</td>
                    <td className="py-3 text-right">₹{(po.totalAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {pos.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-slate-400">No POs found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Invoice No</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td className="py-3 font-medium">{inv.invoiceNumber}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">₹{(inv.totalAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-slate-400">No invoices found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
