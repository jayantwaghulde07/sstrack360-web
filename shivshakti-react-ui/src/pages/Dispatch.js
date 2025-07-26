// Dispatch.js
import React, { useState, useEffect } from 'react';
import { handleApiError } from './errorHandler'; // if you use this somewhere

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '100%',
  marginTop: '0.3rem',
};

function Dispatch() {

  // State for dispatch list and UI modes
  const [dispatches, setDispatches ] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [durationFilter, setDurationFilter] = useState('LAST_3');
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  // Form state for dispatch data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    rate: '',
    quantity: '',
    finalTotal: '',
    note: '',
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL;


  useEffect(() => {
    const fetchDispatches = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found, please login.');
        return;
      }

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/dispatches`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch purchase data');
          }

          const data = await response.json();
          setDispatches(data);
        } catch (error) {
          console.error('Error fetching dispatches:', error);
          alert('Error loading dispatches');
        }
      };

      fetchDispatches();
    }, [API_BASE_URL]);


  const exportToExcel = async () => {
    try {
      const queryParams = new URLSearchParams({
        type: typeFilter,
        duration: durationFilter,
        vendor: selectedVendor?.name || query || '', // Prefer selected vendor, fallback to search input
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/dispatches/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'dispatch.xlsx'); // customize filename if needed
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export to Excel failed:', error);
    }
  };

    
  const fetchDispatches = async () => {
    const queryParams = new URLSearchParams({
      type: typeFilter,
      duration: durationFilter,
      vendor: selectedVendor?.name || query || '', // Prefer selected vendor, fallback to search input
    });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/dispatches?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase');
      }

      const data = await response.json();
      setDispatches(data);
    } catch (error) {
      console.error('Error fetching purchase:', error);
      alert('Error loading purchase');
    }
  };

  useEffect(() => {
    const storedVendors = localStorage.getItem('vendors_dispatch');
    if (storedVendors) {
      try {
        const parsed = JSON.parse(storedVendors);
        setVendorList(parsed);
      } catch (err) {
        console.error('Error parsing vendors from localStorage', err);
      }
    }
  }, []);

  const handleSelect = (id) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleAddClick = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      rate: '',
      quantity: '',
      finalTotal: '',
      note: '',
    });
    setIsAddMode(true);
    setIsEditMode(false);
    setSelectedId(null);
    setQuery('');
    setSelectedVendor(null);
  };

  const handleEditClick = () => {
    if (!selectedId) return;
    const dispatchEdit = dispatches.find(p => p.id === selectedId);
    if (dispatchEdit) {
      setFormData({ ...dispatchEdit });
      setQuery(dispatchEdit.vendor);       // <-- sync query input with vendor
      setSelectedVendor(
        vendorList.find(v => v.name === dispatchEdit.vendor) || null
      );  // <-- sync selected vendor object, if found
      setIsEditMode(true);
      setIsAddMode(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!selectedId) return;
    if (!window.confirm('Are you sure you want to delete this dispatch?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/dispatches/${selectedId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Delete failed');

      await fetchDispatches();
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting dispatch:', error);
      alert('Failed to delete dispatch');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const knownVendorNames = vendorList.map(v => v.name.toLowerCase());
    const enteredVendor = formData.vendor.trim().toLowerCase();

if (!knownVendorNames.includes(enteredVendor)) {
  alert(`"${enteredVendor}" is not a known vendor. Please select a valid vendor.`);
  return;
}

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const method = isAddMode ? 'POST' : 'PUT';
      const url = isAddMode
        ? `${API_BASE_URL}/api/dispatches`
        : `${API_BASE_URL}/api/dispatches/${selectedId}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isAddMode ? 'add' : 'update'} dispatch`);
      }

      await fetchDispatches();

      setIsAddMode(false);
      setIsEditMode(false);
      setSelectedId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        rate: '',
        quantity: '',
        finalTotal: '',
        note: '',
      });
    } catch (error) {
      console.error('Error saving dispatch:', error);
      alert('Failed to save dispatch');
    }
  };

  const handleCancel = () => {
    setIsAddMode(false);
    setIsEditMode(false);
    setSelectedId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setFormData(prev => ({ ...prev, vendor: value }));

    if (value.trim() === '') {
      setFilteredVendors([]);
      setShowSuggestions(false);
      setSelectedVendor(null);
    } else {
      const matches = vendorList.filter((v) =>
        v.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredVendors(matches);
      setShowSuggestions(true);
      setSelectedVendor(null); // clear selected vendor as user types new text
    }
  };

  // 2. Vendor selected from suggestions
  const handleSelectVendor = (vendor) => {
    setSelectedVendor(vendor);
    setQuery(vendor.name);
    setFormData(prev => ({ ...prev, vendor: vendor.name }));
    setFilteredVendors([]);
    setShowSuggestions(false);
  };

  // 3. On blur, check if typed vendor matches selectedVendor or known vendor, else clear selectedVendor
  const handleVendorBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      const typedVendor = formData.vendor.trim().toLowerCase();
      const knownVendorNames = vendorList.map(v => v.name.toLowerCase());
      if (typedVendor && !knownVendorNames.includes(typedVendor)) {
        setSelectedVendor(null);
      }
    }, 200); // delay to allow click selection
  };

  return (
    <main style={{ flex: 1, padding: '1rem', backgroundColor: '#ecf0f1' }}>
      <h2>Dispatch List</h2>

      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={handleAddClick}
          >
            Add
          </button>

          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedId ? 'pointer' : 'not-allowed',
              opacity: selectedId ? 1 : 0.6,
            }}
            onClick={handleEditClick}
            disabled={!selectedId}
          >
            Edit
          </button>

          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedId ? 'pointer' : 'not-allowed',
              opacity: selectedId ? 1 : 0.6,
            }}
            onClick={handleDeleteClick}
            disabled={!selectedId}
          >
            Delete
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button>« Prev</button>
          <span>
            <strong>
              {dispatches.length} out of {dispatches.length}
            </strong>
          </span>
          <button>Next »</button>
        </div>
      </div>

      {!isAddMode && !isEditMode && (
        <div
          style={{
            marginBottom: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <label>
            Duration:
            <select
              style={{ marginLeft: 4 }}
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="LAST_3">Last 3</option>
              <option value="ONE_WEEK">Last 7</option>
              <option value="TWO_WEEKS">Last 15</option>
              <option value="MONTH">This month</option>
            </select>
          </label>

          <label>Vendor:</label>
          <div
            style={{ width: '300px', position: 'relative', zIndex: 999, paddingRight: '1rem' }}
          >
            <input
              type="text"
              placeholder="Search vendor..."
              value={query}
              onChange={handleChange}
              onBlur={handleVendorBlur}
              onFocus={() => {
                if (query.trim()) setShowSuggestions(true);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            {showSuggestions && filteredVendors.length > 0 && (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: '0.5rem',
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderTop: 'none',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10,
                }}
              >
                {filteredVendors.map((vendor) => (
                  <li
                    key={vendor.id}
                    onClick={() => handleSelectVendor(vendor)}
                    style={{
                      padding: '0.25rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    {vendor.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={fetchDispatches}>Refresh</button>
          <button onClick={exportToExcel}>Export Excel</button>
        </div>
      )}

      {(isAddMode || isEditMode) && (
        <form
          onSubmit={handleFormSubmit}
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            maxWidth: '700px',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>
            {isAddMode ? 'Add New Dispatch' : 'Edit Dispatch'}
          </h3>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Date:
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={inputStyle}
              name="date"
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Vendor:</label>
          <div style={{ width: '300px', position: 'relative', zIndex: 999, paddingRight: '1rem' }}>
            <input
              type="text"
              required
              placeholder="Search vendor..."
              value={query}
              onChange={handleChange}
              onBlur={handleVendorBlur}
              onFocus={() => {
                if (query.trim()) setShowSuggestions(true);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />

            {showSuggestions && filteredVendors.length > 0 && (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: '0.5rem',
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderTop: 'none',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10,
                }}
              >
                {filteredVendors.map((vendor) => (
                  <li
                    key={vendor.id}
                    onClick={() => handleSelectVendor(vendor)}
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    {vendor.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Rate:
            <input
              type="text"
              required
              value={formData.rate}
              onChange={handleInputChange}
              placeholder="Enter rate"
              style={inputStyle}
              name="rate"
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Quantity:
            <input
              type="text"
              required
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              style={inputStyle}
              name="quantity"
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Total Amount:
            <input
              type="text"
              required
              value={formData.finalTotal}
              onChange={handleInputChange}
              placeholder="Enter total amount"
              style={inputStyle}
              name="finalTotal"
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Note:
            <textarea
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Additional note"
              style={{ ...inputStyle, height: '80px' }}
              name="note"
            />
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Save
            </button>

            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#b0bec5',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!isAddMode && !isEditMode && (
        <div style={{ border: '1px solid #ccc', maxHeight: '600px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead
              style={{
                backgroundColor: '#8D6E63',
                color: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <tr>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>
                  <input type="checkbox" disabled />
                </th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Vendor</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Rate</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Quantity</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Total Amount</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map((disp) => (
                <tr key={disp.id}>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>
                    <input
                      type="checkbox"
                      checked={selectedId === disp.id}
                      onChange={() => handleSelect(disp.id)}
                    />
                  </td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{disp.date}</td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{disp.vendor}</td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{disp.rate}</td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{disp.quantity}</td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{disp.finalTotal}</td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{disp.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Dispatch;
