import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, FileText, ClipboardList, CheckSquare, ShoppingCart, FileSpreadsheet, Activity, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Procurement Officer', 'Manager', 'Vendor'] },
    { label: 'User Management', path: '/users', icon: Users, roles: ['Admin'] },
    { label: 'Vendors', path: '/vendors', icon: Users, roles: ['Admin', 'Procurement Officer', 'Manager'] },
    { label: 'RFQs', path: '/rfqs', icon: FileText, roles: ['Admin', 'Procurement Officer', 'Manager', 'Vendor'] },
    { label: 'Quotations', path: '/quotations', icon: ClipboardList, roles: ['Admin', 'Procurement Officer', 'Manager', 'Vendor'] },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['Admin', 'Manager', 'Procurement Officer'] },
    { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart, roles: ['Admin', 'Procurement Officer', 'Manager', 'Vendor'] },
    { label: 'Invoices', path: '/invoices', icon: FileSpreadsheet, roles: ['Admin', 'Procurement Officer', 'Manager', 'Vendor'] },
    { label: 'Reports', path: '/reports', icon: BarChart2, roles: ['Admin', 'Manager'] },
    { label: 'Activity Logs', path: '/activity-logs', icon: Activity, roles: ['Admin'] },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0 bg-slate-900">
        <h1 className="text-xl font-bold text-white tracking-wide">
          <span className="text-green-500">Vendor</span>Bridge
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        <nav className="space-y-1 px-2">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-600/10 text-green-400'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
