import React, { useState, useEffect } from 'react';
import { handleApiError } from './errorHandler';

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '100%',
  marginTop: '0.3rem',
};

function Employee() {
  const API_BASE_URL = 'http://localhost:8080';

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isUser: false,
    active: true,
    userName: '',
    password: '',
    role: '',
    info: '',
  });

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(data);
      if (!data.find(emp => emp.userId === selectedEmployeeId)) {
        setSelectedEmployeeId(null);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('Error loading employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSelect = (id) => {
    setSelectedEmployeeId(prev => (prev === id ? null : id));
  };

  const handleAddToggle = () => {
    setIsAddMode(true);
    setIsEditMode(false);
    setSelectedEmployeeId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      isUser: false,
      active: true,
      userName: '',
      password: '',
      role: '',
      info: '',
    });
  };

  const handleEditToggle = () => {
    const emp = employees.find(emp => emp.userId === selectedEmployeeId);
    if (emp) {
      setIsEditMode(true);
      setIsAddMode(false);
      setFormData({
        name: emp.name || '',
        email: emp.email || '',
        phone: emp.phone || '',
        isUser: emp.isUser || false,
        active: emp.active !== undefined ? emp.active : true,
        userName: emp.userName || '',
        password: '', // keep blank for edit
        role: emp.role || '',
        info: emp.info || '',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployeeId) return;
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/employees/${selectedEmployeeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchEmployees();
      setSelectedEmployeeId(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isUser: formData.isUser,
        active: formData.active,
        userName: formData.userName,
        role: formData.role,
        info: formData.info,
      };

      // Add password only if set or in add mode
      if (isAddMode || formData.password.trim() !== '') {
        payload.password = formData.password;
      }

      const url = isAddMode
        ? `${API_BASE_URL}/api/employees`
        : `${API_BASE_URL}/api/employees/${selectedEmployeeId}`;

      const method = isAddMode ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to save employee');
      }

      await fetchEmployees();
      setIsAddMode(false);
      setIsEditMode(false);
      setSelectedEmployeeId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        isUser: false,
        active: true,
        userName: '',
        password: '',
        role: '',
        info: '',
      });
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee');
    }
  };

  const cancelForm = () => {
    setIsAddMode(false);
    setIsEditMode(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      isUser: false,
      active: true,
      userName: '',
      password: '',
      role: '',
      info: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <main style={{ flex: 1, padding: '0rem', backgroundColor: '#ecf0f1' }}>
      <h2>Employee List</h2>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
            onClick={handleAddToggle}
          >
            Add
          </button>

          <button
            style={{ padding: '0.5rem 1rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
            onClick={handleEditToggle}
            disabled={!selectedEmployeeId}
          >
            Edit
          </button>

          <button
            style={{ padding: '0.5rem 1rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
            onClick={handleDelete}
            disabled={!selectedEmployeeId}
          >
            Delete
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button>&laquo; Prev</button>
          <span><strong>{employees.length} employees</strong></span>
          <button>Next &raquo;</button>
        </div>
      </div>

      {(isAddMode || isEditMode) && (
        <form
          onSubmit={handleFormSubmit}
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            maxWidth: '500px',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>{isAddMode ? 'Add New' : 'Edit'} Employee</h3>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Name:
            <input
              style={inputStyle}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              required
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Phone:
            <input
              style={inputStyle}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone"
              required
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Info:
            <textarea
              style={{ ...inputStyle, height: '80px' }}
              name="info"
              value={formData.info}
              onChange={handleInputChange}
              placeholder="Additional info"
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              name="isUser"
              checked={formData.isUser}
              onChange={handleInputChange}
            />{' '}
            Is User
          </label>

          {formData.isUser && (
            <>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Username:
                <input
                  style={inputStyle}
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  required
                />
              </label>

              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Password:
                <input
                  style={inputStyle}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isEditMode ? 'Leave blank to keep current password' : 'Enter password'}
                  required={isAddMode} // required only on add mode
                />
              </label>

              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Role:
                <select
                  style={inputStyle}
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="DISPATCH">Dispatch</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="INVENTORY_MANAGER">Inventory Manager</option>
                  <option value="SALE_MANAGER">Sale Manager</option>
                  <option value="DELIVERY_MANAGER">Delivery Manager</option>
                </select>
              </label>
            </>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelForm}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#b0bec5',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ border: '1px solid #ccc', maxHeight: '500px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#8D6E63', color: 'white', position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ padding: '7px' }}></th>
              <th style={{ padding: '7px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '7px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '7px', textAlign: 'left' }}>Additional Information</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.userId}>
                <td style={{ padding: '7px' }}>
                  <input
                    type="checkbox"
                    checked={selectedEmployeeId === emp.userId}
                    onChange={() => handleSelect(emp.userId)}
                  />
                </td>
                <td style={{ padding: '7px' }}>{emp.name}</td>
                <td style={{ padding: '7px' }}>{emp.phone}</td>
                <td style={{ padding: '7px' }}>{emp.info}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Employee;
