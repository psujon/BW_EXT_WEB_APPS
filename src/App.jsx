import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import { Toaster } from 'react-hot-toast';


// Subpages imports
import Overview from './pages/Overview';
import Buyer from './pages/OrderManagement/Buyer';
import Style from './pages/OrderManagement/Style';
import Process from './pages/OrderManagement/Process';
import PieceRate from './pages/OrderManagement/PieceRate';
import BuyerOrderInfo from './pages/OrderManagement/BuyerOrderInfo';
import YarnChallan from './pages/OrderManagement/YarnChallan';
import ProductionEntry from './pages/ProductionInfo/ProductionEntry';
import ProductionShow from './pages/ProductionInfo/ProductionShow';
import UserPage from './pages/Settings/User';
import UserPermission from './pages/Settings/UserPermission';
import ChangePassword from './pages/Settings/ChangePassword';
import DatabaseBackup from './pages/DatabaseBackup';
import Section from './pages/Settings/Section';
import Color from './pages/OrderManagement/Color';
import CompanyProfile from './pages/Settings/CompanyProfile';
import EmployeeInfo from './pages/OrderManagement/EmployeeInfo';
import PendingBuyerOrder from './pages/PendingApproval/PendingBuyerOrder';
import PendingRewinding from './pages/PendingApproval/PendingRewinding';
import ReportPage from './pages/Reports/ReportPage';



export default function App() {
  const [token, setToken] = useState(localStorage.getItem('bw_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('bw_user') || 'null'));
  const [permissions, setPermissions] = useState(JSON.parse(localStorage.getItem('bw_permissions') || 'null'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Validate session on app launch
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Session expired');
          return res.json();
        })
        .then(data => {
          const loadedUser = { ...data.user, isMockMode: data.isMockMode };
          setUser(loadedUser);
          setPermissions(data.permissions);
          localStorage.setItem('bw_user', JSON.stringify(loadedUser));
          localStorage.setItem('bw_permissions', JSON.stringify(data.permissions));
          setAuthChecking(false);
        })
        .catch(err => {
          console.warn('Session verification failed, logging out...');
          handleLogout();
          setAuthChecking(false);
        });
    } else {
      setAuthChecking(false);
    }
  }, [token]);

  const handleLoginSuccess = (newToken, newUser, newPermissions) => {
    setToken(newToken);
    setUser(newUser);
    setPermissions(newPermissions);
    localStorage.setItem('bw_token', newToken);
    localStorage.setItem('bw_user', JSON.stringify(newUser));
    localStorage.setItem('bw_permissions', JSON.stringify(newPermissions));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setPermissions(null);
    localStorage.removeItem('bw_token');
    localStorage.removeItem('bw_user');
    localStorage.removeItem('bw_permissions');
    navigate('/login');
  };

  if (authChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#0b0f19',
        color: '#f8fafc',
        fontFamily: 'sans-serif'
      }}>
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#131b2e',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            fontSize: '0.875rem',
            borderRadius: '0.75rem',
            padding: '12px 16px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#131b2e'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#131b2e'
            }
          }
        }} 
      />
      <Routes>

      {/* Root Route Redirect */}
      <Route 
        path="/" 
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />} 
      />

      {/* Login Screen Route */}
      <Route 
        path="/login" 
        element={!token ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" replace />} 
      />

      {/* Dashboard Routes Wrap */}
      <Route 
        path="/dashboard" 
        element={
          token ? (
            <DashboardLayout 
              permissions={permissions} 
              user={user} 
              onLogout={handleLogout} 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen} 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Child nested views of Dashboard */}
        <Route index element={<Overview token={token} />} />
        <Route path="buyer" element={<Buyer token={token} />} />
        <Route path="style" element={<Style token={token} />} />
        <Route path="process" element={<Process token={token} />} />
        <Route path="color" element={<Color token={token} />} />
        <Route path="piece-rate" element={<PieceRate token={token} />} />
        <Route path="buyer-order-info" element={<BuyerOrderInfo token={token} />} />
        <Route path="yarn-challan" element={<YarnChallan token={token} />} />
        <Route path="employee-info" element={<EmployeeInfo token={token} />} />
        <Route path="pending-buyer-order" element={<PendingBuyerOrder token={token} />} />
        <Route path="pending-rewinding" element={<PendingRewinding token={token} />} />
        <Route path="reports" element={<ReportPage token={token} />} />
        <Route path="production-entry" element={<ProductionEntry token={token} />} />
        <Route path="production-show" element={<ProductionShow token={token} />} />
        <Route path="user" element={<UserPage token={token} />} />
        <Route path="user-permission" element={<UserPermission token={token} />} />
        <Route path="change-password" element={<ChangePassword token={token} user={user} />} />
        <Route path="section" element={<Section token={token} />} />
        <Route path="company-profile" element={<CompanyProfile token={token} />} />
        <Route path="database-backup" element={<DatabaseBackup token={token} />} />
      </Route>

      {/* Catch-all route to redirect back to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
