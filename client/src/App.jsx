import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Vendors from './pages/Vendors';
import RFQs from './pages/RFQs';
import RFQCreate from './pages/RFQCreate';
import Quotations from './pages/Quotations';
import QuotationSubmit from './pages/QuotationSubmit';
import QuotationCompare from './pages/QuotationCompare';
import Approvals from './pages/Approvals';
import ApprovalDetail from './pages/ApprovalDetail';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Procurement Officer', 'Manager']}><OutletWrapper /></ProtectedRoute>}>
              <Route path="/vendors" element={<Vendors />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Admin']}><OutletWrapper /></ProtectedRoute>}>
              <Route path="/users" element={<Users />} />
            </Route>
            
            <Route path="/rfqs" element={<RFQs />} />
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Procurement Officer']}><OutletWrapper /></ProtectedRoute>}>
              <Route path="/rfqs/create" element={<RFQCreate />} />
            </Route>
            <Route path="/quotations" element={<Quotations />} />
            <Route element={<ProtectedRoute allowedRoles={['Vendor']}><OutletWrapper /></ProtectedRoute>}>
              <Route path="/quotations/submit/:rfqId" element={<QuotationSubmit />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Procurement Officer']}><OutletWrapper /></ProtectedRoute>}>
              <Route path="/quotations/compare/:rfqId" element={<QuotationCompare />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Procurement Officer', 'Manager']}><OutletWrapper /></ProtectedRoute>}>
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/approvals/:approvalId" element={<ApprovalDetail />} />
            </Route>
            
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/invoices" element={<Invoices />} />
            
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><OutletWrapper /></ProtectedRoute>}>
              <Route path="/reports" element={<Reports />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['Admin']}><OutletWrapper /></ProtectedRoute>}>
              <Route path="/activity-logs" element={<ActivityLogs />} />
            </Route>
            
          </Route>
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

const OutletWrapper = () => {
  return <Outlet />;
};

export default App;
