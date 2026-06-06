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
    { title: 'Total Spend', value: `₹${(stats?.totalSpend || 0).toLocaleString('en-IN')}`, icon: FileSpreadsheet, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Active Vendors', value: stats?.activeVendors || 0, icon: Users, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    { title: 'Active RFQs', value: stats?.activeRFQs || 0, icon: FileText, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { title: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: CheckSquare, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Storytelling Hero Section with Depth */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-blue-900 dark:to-slate-900 p-8 md:p-12 text-white shadow-2xl transition-all">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-blue-100 dark:text-blue-200 text-lg md:text-xl max-w-3xl leading-relaxed">
            Your procurement ecosystem is thriving. Today, you have <strong className="text-white font-bold drop-shadow-sm">{stats?.activeRFQs || 0}</strong> active RFQs sourcing the best deals and <strong className="text-white font-bold drop-shadow-sm">{stats?.pendingApprovals || 0}</strong> items waiting for your attention. Let's keep things moving smoothly.
          </p>
        </div>
        
        {/* Decorative dynamic elements for depth */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 rounded-full bg-blue-400/20 blur-2xl mix-blend-overlay"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-lg hover:shadow-xl border border-slate-200/60 dark:border-slate-800/60 p-6 flex items-center transition-all duration-300 hover:-translate-y-1 backdrop-blur-xl group">
              <div className={`h-14 w-14 rounded-2xl ${card.bg} flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-110 shadow-inner`}>
                <Icon className={`h-7 w-7 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5 tracking-tight">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-lg border border-slate-200/60 dark:border-slate-800/60 p-8 transition-all duration-300 backdrop-blur-xl hover:shadow-xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
            Spend Overview <span className="text-slate-400 dark:text-slate-500 text-sm font-normal ml-2">(Last 6 Months)</span>
          </h2>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
                  <Tooltip cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} formatter={(val) => `₹${val.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
                  <Bar dataKey="total" name="Total Spend" fill="url(#colorSpend)" radius={[6, 6, 0, 0]} barSize={40} />
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">Loading chart...</div>
            )}
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-lg border border-slate-200/60 dark:border-slate-800/60 p-8 transition-all duration-300 backdrop-blur-xl hover:shadow-xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>
            Recent Activity
          </h2>
          <div className="space-y-6">
            {logs.map((log) => (
              <div key={log._id} className="flex relative group cursor-default">
                <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center z-10 ring-4 ring-white dark:ring-slate-900 shrink-0 shadow-sm transition-transform group-hover:scale-110">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                </div>
                <div className="ml-4 flex-1 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{log.description}</p>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mt-1.5 uppercase tracking-wider">
                    {new Date(log.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-lg border border-slate-200/60 dark:border-slate-800/60 p-8 transition-all duration-300 backdrop-blur-xl hover:shadow-xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
            Recent Purchase Orders
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-medium">PO Number</th>
                  <th className="pb-3 font-medium">Vendor</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
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

        <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-lg border border-slate-200/60 dark:border-slate-800/60 p-8 transition-all duration-300 backdrop-blur-xl hover:shadow-xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-green-500 rounded-full mr-3"></span>
            Recent Invoices
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-medium">Invoice No</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
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
