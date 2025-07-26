import { useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Purchase from './pages/Purchase';
import Dispatch from './pages/Dispatch';
import Expenditure from './pages/Expenditure';
import Employee from './pages/Employee';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Report from './pages/Report';
import Profile from './pages/Setting';
import Vendor from './pages/Vendor';
import Account from './pages/Account';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const headerButtonStyle = {
    padding: '6px 12px',
    backgroundColor: '#5d4037',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };
  const handleLogin = (username, password) => {
    if (username && password) {
      setIsAuthenticated(true);
      navigate('/dashboard');
    } else {
      alert('Please enter username and password');
    }
  };

  const handlePurchaseClick = () => {
    navigate('/purchase');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleAccountClick = () => {
    navigate('/account');
  }

  const handleInventoryClick = () => {
    navigate('/inventory');
  };

  const handleReportClick = () => {
    navigate('/report');
  };

  const handleDispatchClick = () => {
    navigate('/dispatch');
  };

  const handleExpenditureClick = () => {
    navigate('/expenditure');
  };

  const handleEmployeeClick = () => {
    navigate('/employee');
  };

  const handleVendorClick = () => {
    navigate('/vendor');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#8D6E63', color: 'white', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="images/SST360.png" alt="Logo" style={{ height: '80px' }} />
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Shivshakti Paper</h1>
        </div>

        {/* Profile & Logout on new line, right aligned */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', gap: '1rem' }}>
          <button onClick={handleProfileClick} style={headerButtonStyle}>👤 Profile</button>
          <button onClick={handleLogout} style={headerButtonStyle}>🚪 Logout</button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, paddingTop :'0.2rem'}}>
        {/* Sidebar */}
        <nav style={{ width: '220px', backgroundColor: '#f4f4f4', padding: '1rem', borderRight: '1px solid #ddd' }}>
          <ul style={{ listStyle: 'none', padding: 0, fontWeight: 'bold', lineHeight: '2rem' }}>
            <li onClick={handleDashboardClick} style={{ cursor: 'pointer' }}>📦 Home</li>
            <li onClick={handleAccountClick} style={{ cursor: 'pointer' }}>📦 Account</li>
            <li onClick={handlePurchaseClick} style={{ cursor: 'pointer' }}>🛒 Purchase</li>
            <li onClick={handleDispatchClick} style={{ cursor: 'pointer' }}>🚚 Dispatch</li>
            <li onClick={handleExpenditureClick} style={{ cursor: 'pointer' }}>💰 Expenditure</li>
            <li onClick={handleReportClick} style={{ cursor: 'pointer' }}>📊 Report</li>
            <li onClick={handleInventoryClick} style={{ cursor: 'pointer' }}>🏷️ Inventory</li>
            <li onClick={handleEmployeeClick} style={{ cursor: 'pointer' }}>👥 Employee</li>
            <li onClick={handleVendorClick} style={{ cursor: 'pointer' }}>🤝 Vendor</li>

          </ul>
        </nav>


        {/* Content Area */}
        <main style={{ flex: 1, padding: '0rem 0.5rem', backgroundColor: '#ecf0f1' }}>


          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/dispatch" element={<Dispatch />} />
            <Route path="/expenditure" element={<Expenditure />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/report" element={<Report />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/vendor" element={<Vendor />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#8D6E63', color: 'white', textAlign: 'center', padding: '1rem' }}>
        &copy; 2025 Shivshakti Paper. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
