import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

function Report() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    duration: 'MONTH',
    type: '',
    vendor: '',
    language: 'EN'
  });

  const [vendorOptions, setVendorOptions] = useState([]); // ✅ Added this missing state

  useEffect(() => {
    const storedVendors = localStorage.getItem('vendors');
    if (storedVendors) {
      try {
        const parsed = JSON.parse(storedVendors);
        setVendorOptions(parsed);
      } catch (e) {
        console.error("Failed to parse vendors from localStorage", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReportDownload = async (endpoint) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again.');
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to generate report');
    }
  };

  const reports = [
    { title: 'Purchase Report', endpoint: 'http://localhost:8080/api/reports/purchases' },
    { title: 'Dispatch Report', endpoint: 'http://localhost:8080/api/reports/dispatches' },
    { title: 'Expense Report', endpoint: 'http://localhost:8080/api/reports/expenses' },
    { title: 'Dispatch & Purchase Report', endpoint: 'http://localhost:8080/api/reports/expense-dispatch' },
    { title: 'Current Inventory Report', endpoint: 'http://localhost:8080/api/reports/inventory' },
    { title: 'Production Report', endpoint: 'http://localhost:8080/api/reports/production' }
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Report</h2>

      {/* Filters Section */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label>
          Duration:
          <select name="duration" value={filters.duration} onChange={handleChange} style={{ marginLeft: 4 }}>
            <option value="LAST_3">Last 3</option>
            <option value="ONE_WEEK">Last 7</option>
            <option value="TWO_WEEKS">Last 15</option>
            <option value="MONTH">This month</option>
            <option value="3_MONTHS">3 Months</option>
          </select>
        </label>

        <label>
          Vendor:
          <select name="vendor" value={filters.vendor} onChange={handleChange} style={{ marginLeft: 4 }}>
            <option value="">All Vendors</option>
            {vendorOptions.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Type:
          <select name="type" value={filters.type} onChange={handleChange} style={{ marginLeft: 4 }}>
            <option value="">All</option>
            <option value="RAW_MATERIAL">Raw Material</option>
            <option value="WOOD">Wood</option>
            <option value="DISPATCH">Dispatch</option>
          </select>
        </label>

        <label>
          Language:
          <select name="language" value={filters.language} onChange={handleChange} style={{ marginLeft: 4 }}>
            <option value="EN">English</option>
            <option value="MR">Marathi</option>
          </select>
        </label>
      </div>

      {/* Report Icons */}
      <div className="dashboard-grid">
        {reports.map((r, idx) => (
          <div
            key={idx}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleReportDownload(r.endpoint)}
          >
            <img
              src="/images/generateReport.png"
              alt={r.title}
              style={{ width: '60px', height: '60px', objectFit: 'contain', marginTop: '1rem' }}
            />
            <h3>{r.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Report;
