import React from 'react';
import { useNavigate } from 'react-router-dom';  // <-- import this for navigation
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();  // <-- get navigate function here

  return (
    <div className="dashboard-grid">
      <div className="dashboard-grid">
        <div className="card" onClick={() => navigate('/purchase')} style={{ cursor: 'pointer' }}>
          <img src="/images/purchase.jpg" alt="Purchase" />
          <h3>Purchase</h3>
        </div>
        <div className="card" onClick={() => navigate('/dispatch')} style={{ cursor: 'pointer' }}>
          <img src="/images/dispatch.jpg" alt="Dispatch" />
          <h3>Dispatch</h3>
        </div>
        <div className="card" onClick={() => navigate('/expenditure')} style={{ cursor: 'pointer' }}>
          <img src="/images/expenditure.jpg" alt="Expenditure" />
          <h3>Expenditure</h3>
        </div>
        <div className="card" onClick={() => navigate('/report')} style={{ cursor: 'pointer' }}>
          <img src="/images/report.jpg" alt="Report" />
          <h3>Report</h3>
        </div>
        <div className="card" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
          <img src="/images/inventory.jpg" alt="Inventory" />
          <h3>Inventory</h3>
        </div>
        <div className="card" onClick={() => navigate('/employee')} style={{ cursor: 'pointer' }}>
          <img src="/images/employee.jpg" alt="Employee" />
          <h3>Employee</h3>
        </div>
        <div className="card" onClick={() => navigate('/vendor')} style={{ cursor: 'pointer' }}>
          <img src="/images/vendor.png" alt="Vendor" />
          <h3>Vendor</h3>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
