import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { handleApiError } from './errorHandler';

function Vendor() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    note: '',
    type: [],
    city: '',
    initialOutstanding: 0,
    phone: '',
    email: '',
    address: ''
  });

  const vendorTypes = ['RAW_MATERIAL', 'EXPENDITURE', 'DISPATCH'];
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/api/vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setVendors(data);
      localStorage.setItem('vendors', JSON.stringify(data));
      localStorage.setItem('vendors_raw_material', JSON.stringify(data.filter(v => v.type?.includes('RAW_MATERIAL'))));
      localStorage.setItem('vendors_expenditure', JSON.stringify(data.filter(v => v.type?.includes('EXPENDITURE'))));
      localStorage.setItem('vendors_dispatch', JSON.stringify(data.filter(v => v.type?.includes('DISPATCH'))));
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCheckbox = (vendor) => {
    setSelectedVendor(vendor.id === selectedVendor?.id ? null : vendor);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "initialOutstanding" && value < 0) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeChange = (type) => {
    const updatedTypes = formData.type.includes(type)
      ? formData.type.filter(t => t !== type)
      : [...formData.type, type];
    setFormData({ ...formData, type: updatedTypes });
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      note: '',
      type: [],
      city: '',
      initialOutstanding: 0,
      phone: '',
      email: '',
      address: ''
    });
    setSelectedVendor(null);
    setFormVisible(true);
  };

  const handleEdit = () => {
    if (!selectedVendor) return;
    setFormData({
      name: selectedVendor.name || '',
      note: selectedVendor.note || '',
      type: Array.isArray(selectedVendor.type) ? selectedVendor.type : [selectedVendor.type],
      city: selectedVendor.city || '',
      initialOutstanding: selectedVendor.initialOutstanding ?? 0,
      phone: selectedVendor.phone || '',
      email: selectedVendor.email || '',
      address: selectedVendor.address || ''
    });
    setFormVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedVendor) return;
    try {
      await fetch(`${API_BASE_URL}/api/vendors/${selectedVendor.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedVendor(null);
      fetchVendors();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.city || !formData.type.length) {
      alert("Name, City, and at least one Type are mandatory.");
      return;
    }

    if (!selectedVendor && (formData.initialOutstanding < 0 || isNaN(formData.initialOutstanding))) {
      alert("Initial Outstanding must be a positive number or 0.");
      return;
    }

    const method = selectedVendor ? 'PUT' : 'POST';
    const url = selectedVendor
      ? `${API_BASE_URL}/api/vendors/${selectedVendor.id}`
      : `${API_BASE_URL}/api/vendors`;

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      setFormVisible(false);
      setSelectedVendor(null);
      fetchVendors();
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  const handleCancel = () => {
    setFormVisible(false);
    setSelectedVendor(null);
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '8px',
    margin: '6px 0 12px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  };

  const getBalanceLabel = (balance) => {
    return Number(balance) === 0 ? 'Clear' : 'Due';
  };

  const getBalanceTextStyle = (balance) => {
    return {
      color: Number(balance) === 0 ? 'green' : 'orange',
      fontWeight: 'bold'
    };
  };

  return (
    <main style={{ flex: 1, padding: '1rem', backgroundColor: '#ecf0f1' }}>
      <h2>Vendor List</h2>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={handleAdd} style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
          Add
        </button>
        <button onClick={handleEdit} disabled={!selectedVendor} style={{ padding: '0.5rem 1rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}>
          Edit
        </button>
        <button onClick={handleDelete} disabled={!selectedVendor} style={{ padding: '0.5rem 1rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>
          Delete
        </button>
        <button onClick={fetchVendors} style={{ padding: '0.5rem 1rem', backgroundColor: '#795548', color: 'white', border: 'none', borderRadius: '4px' }}>
          Refresh
        </button>
      </div>

      {formVisible && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            maxWidth: '600px',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>{selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>

          <label>Name:
            <input style={inputStyle} type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </label>

          <label>City:
            <input style={inputStyle} type="text" name="city" value={formData.city} onChange={handleInputChange} required />
          </label>

          <label>Initial Outstanding:
            <input
              style={inputStyle}
              type="number"
              name="initialOutstanding"
              value={formData.initialOutstanding}
              onChange={handleInputChange}
              disabled={!!selectedVendor}
              required
            />
          </label>

          <label>Phone:
            <input style={inputStyle} type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
          </label>

          <label>Email:
            <input style={inputStyle} type="email" name="email" value={formData.email} onChange={handleInputChange} />
          </label>

          <label>Address:
            <textarea style={{ ...inputStyle, height: '80px' }} name="address" value={formData.address} onChange={handleInputChange} />
          </label>

          <label>Type:</label>
          <div style={{ marginBottom: '1rem' }}>
            {vendorTypes.map((type) => (
              <label key={type} style={{ marginRight: '1rem' }}>
                <input
                  type="checkbox"
                  checked={formData.type.includes(type)}
                  onChange={() => handleTypeChange(type)}
                /> {type}
              </label>
            ))}
          </div>

          <label>Note:
            <textarea style={{ ...inputStyle, height: '60px' }} name="note" value={formData.note} onChange={handleInputChange} />
          </label>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px' }}>
              Save
            </button>
            <button type="button" onClick={handleCancel} style={{ padding: '0.5rem 1rem', backgroundColor: '#b0bec5', border: 'none', borderRadius: '4px' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ border: '1px solid #ccc', maxHeight: '400px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#8D6E63', color: 'white', position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ padding: '7px', width: '10%' }}></th>
              <th style={{ padding: '7px', textAlign: 'left', width: '20%' }}>Name</th>
              <th style={{ padding: '7px', textAlign: 'left', width: '20%' }}>City</th>
              <th style={{ padding: '7px', textAlign: 'left', width: '30%' }}>Type</th>
              <th style={{ padding: '7px', textAlign: 'left', width: '20%' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(vendor => (
              <tr key={vendor.id} style={{ backgroundColor: selectedVendor?.id === vendor.id ? '#ffe0b2' : 'transparent' }}>
                <td style={{ padding: '7px', width: '10%' }}>
                  <input
                    type="checkbox"
                    checked={vendor.id === selectedVendor?.id}
                    onChange={() => handleCheckbox(vendor)}
                  />
                </td>
                <td style={{ padding: '7px', width: '20%' }}>{vendor.name}</td>
                <td style={{ padding: '7px', width: '20%' }}>{vendor.city}</td>
                <td style={{ padding: '7px', width: '30%' }}>{Array.isArray(vendor.type) ? vendor.type.join(', ') : vendor.type}</td>
                <td style={{ padding: '7px', width: '20%', ...getBalanceTextStyle(vendor.initialOutstanding) }}>{getBalanceLabel(vendor.initialOutstanding)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Vendor;
