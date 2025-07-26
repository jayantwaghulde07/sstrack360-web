import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Setting() {
  const [language, setLanguage] = useState('English');
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleChange = () => {
    console.log('Selected language:', language);
    navigate('/dashboard');
  };

  const handlePasswordChange = async () => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("All password fields are required.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match.");
    return;
  }

  try {
    // Get token from storage (adjust key if different)
    const token = localStorage.getItem('token');

    if (!token) {
      alert("User is not authenticated.");
      return;
    }

    const response = await fetch('http://localhost:8080/api/users/change-password', {
      method: 'POST', // or PUT
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // <-- Add JWT here
      },
      body: JSON.stringify({
        oldPassword: currentPassword,
        newPassword: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Password change failed");
    }

    alert("Password changed successfully!");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangePassword(false);
  } catch (err) {
    console.error("Error changing password:", err);
    alert(`Error: ${err.message}`);
  }
};

  return (
    <main style={{ flex: 1, padding: '0rem', backgroundColor: '#ecf0f1', maxWidth: '400px' }}>
      <h2 style={{ marginBottom: '1rem' }}>User Profile</h2>

      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '1rem',
          marginBottom: '1rem',
        }}
      >
        <option value="EN">English</option>
        <option value="MR">Marathi</option>
      </select>

      <button
        type="button"
        onClick={handleChange}
        style={{
          padding: '0.5rem',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          width: '100%',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '1.5rem'
        }}
      >
        Submit
      </button>

      <hr style={{ marginBottom: '1rem' }} />

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={changePassword}
            onChange={(e) => setChangePassword(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Change Password
        </label>
      </div>

      {changePassword && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handlePasswordChange}
            style={{
              padding: '0.5rem',
              backgroundColor: '#2980b9',
              color: 'white',
              border: 'none',
              width: '100%',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Change Password
          </button>
        </>
      )}
    </main>
  );
}

export default Setting;
