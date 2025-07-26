
import './Login.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {   // <-- Use backticks here
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        alert('Login failed');
        return;
      }

      const data = await response.json();
      const token = data.jwt;

      // Store token
      localStorage.setItem('token', token);

      // For now, assume userId=1 and fetch user info
      const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {  // <-- And here
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        alert('Failed to fetch user details');
        return;
      }

      const userData = await userResponse.json();
      console.log('User Info:', userData);

      // Notify parent that login succeeded
      onLogin(username, password);


      //Vendor list
      const vendorRes = await fetch(`${API_BASE_URL}/api/vendors`,  {  // <-- And here
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const vendorData = await vendorRes.json();
      localStorage.setItem('vendors', JSON.stringify(vendorData));

   // Categorize vendors by type
    const rawMaterialVendors = vendorData.filter(v => v.type?.includes('RAW_MATERIAL'));
    const expenditureVendors = vendorData.filter(v => v.type?.includes('EXPENDITURE'));
    const dispatchVendors = vendorData.filter(v => v.type?.includes('DISPATCH'));

    // Store each category in separate localStorage key
    localStorage.setItem('vendors_raw_material', JSON.stringify(rawMaterialVendors));
    localStorage.setItem('vendors_expenditure', JSON.stringify(expenditureVendors));
    localStorage.setItem('vendors_dispatch', JSON.stringify(dispatchVendors));
      // Navigate to dashboard (optional here if App redirects)
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('Login error');
    }
  };

  return (
    <div className="login-body">
      <header style={{ backgroundColor: '#8D6E63', color: 'white', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="images/SST360.png" alt="Logo" style={{ height: '80px' }} />
          <h1 style={{ fontSize: '2.5rem' }}>Shivshakti Paper</h1>
        </div>
      </header>

      <main className="login-main">
        <div className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" style={{ padding: '0.5rem 1rem' }}>
              Login
            </button>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        &copy; 2025 Shivshakti Paper. All rights reserved.
      </footer>
    </div>
  );
};


export default Login;
