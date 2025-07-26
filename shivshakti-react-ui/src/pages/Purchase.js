import React, { useState, useEffect } from 'react';
import { handleApiError } from './errorHandler';
const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '100%',
  marginTop: '0.3rem',
};

function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [durationFilter, setDurationFilter] = useState('LAST_3');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    type: 'RAW_PAPER',
    transport: '',
    hamali: '',
    grossWeight: '',
    tareWeight: '',
    netWeight: '',
    rate: '',
    additionalNote: '',
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Fetch purchase data on component mount
  useEffect(() => {

    const fetchPurchases = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found, please login.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/purchase-wastes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch purchase data');
        }

        const data = await response.json();
        setPurchases(data);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        alert('Error loading purchase data');
      }
    };

    fetchPurchases();
  }, [API_BASE_URL]);

  const exportToExcel = async () => {
    try {
      const queryParams = new URLSearchParams({
        type: typeFilter,
        duration: durationFilter,
        vendor: selectedVendor?.name || query || '', // Prefer selected vendor, fallback to search input
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/purchase-wastes/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'purchase_data.xlsx'); // customize filename if needed
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export to Excel failed:', error);
    }
  };


  const handleSelect = (id) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const fetchPurchases = async () => {
    const queryParams = new URLSearchParams({
      type: typeFilter,
      duration: durationFilter,
      vendor: selectedVendor?.name || query || '', // Prefer selected vendor, fallback to search input
    });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/purchase-wastes?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase');
      }

      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      console.error('Error fetching purchase:', error);
      alert('Error loading purchase');
    }
  };

  // Add/Edit/Delete handlers (you can keep your existing ones, update if needed)

  const handleAddClick = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      type: 'RAW_PAPER',
      transport: '',
      hamali: '',
      grossWeight: '',
      tareWeight: '',
      netWeight: '',
      rate: '',
    });
    setIsAddMode(true);
    setIsEditMode(false);
    setSelectedId(null);
    setQuery('');
    setSelectedVendor(null);
  };

  const handleEditClick = () => {
    if (!selectedId) return;
    const purchaseToEdit = purchases.find(p => p.id === selectedId);
    if (purchaseToEdit) {
      setFormData({ ...purchaseToEdit });
      setQuery(purchaseToEdit.vendor);       // <-- sync query input with vendor
      setSelectedVendor(
        vendorList.find(v => v.name === purchaseToEdit.vendor) || null
      );  // <-- sync selected vendor object, if found
      setIsEditMode(true);
      setIsAddMode(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!selectedId) return;
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchase-wastes/${selectedId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Refresh list
      const refreshed = await fetch(`${API_BASE_URL}/api/purchase-wastes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await refreshed.json();
      setPurchases(data);
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Failed to delete purchase');
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
      alert('No token found, please login.');
      return;
    }

    try {
      const method = isAddMode ? 'POST' : 'PUT';
      const url = isAddMode
        ? `${API_BASE_URL}/api/purchase-wastes`
        : `${API_BASE_URL}/api/purchase-wastes/${selectedId}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isAddMode ? 'add' : 'update'} purchase`);
      }

      // Refresh list
      const refreshed = await fetch(`${API_BASE_URL}/api/purchase-wastes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await refreshed.json();
      setPurchases(data);

      // Reset form
      setIsAddMode(false);
      setIsEditMode(false);
      setSelectedId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        type: 'RAW_PAPER',
        transport: '',
        hamali: '',
        grossWeight: '',
        tareWeight: '',
        netWeight: '',
        rate: '',
        additionalNote: '',
      });
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Failed to save purchase');
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


  const [vendorList, setVendorList] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const storedVendors = localStorage.getItem('vendors_raw_material');
    if (storedVendors) {
      try {
        const parsed = JSON.parse(storedVendors);
        setVendorList(parsed);
      } catch (err) {
        console.error('Error parsing vendors from localStorage', err);
      }
    }
  }, []);

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
      <h2>Purchase List</h2>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
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
          <button>&laquo; Prev</button>
          <span><strong>{purchases.length} out of {purchases.length}</strong></span>
          <button>Next &raquo;</button>
        </div>
      </div>

      {!isAddMode && !isEditMode && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label>Type:</label>
          <select>
            <option value="ALL">All Type</option>
            <option value="RAW_PAPER">RAW_PAPER</option>
            <option value="WOOD">WOOD</option>
          </select>

          <label>
            Duration:
            <select style={{ marginLeft: 4 }}>
              <option value="LAST_3">Last 3</option>
              <option value="ONE_WEEK">Last 7</option>
              <option value="TWO_WEEKS">Last 15</option>
              <option value="MONTH">This month</option>
            </select>
          </label>

          <label>Vendor:</label>
          <div style={{ width: '300px', position: 'relative', zIndex: 999, paddingRight: '1rem' }}>
            <input
              type="text"
              placeholder="Search vendor..."
              value={query}
              onChange={handleChange}
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
                      padding: '0rem',
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

          <button onClick={fetchPurchases}>Refresh</button>
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
          <h3 style={{ marginBottom: '1rem' }}>{isAddMode ? 'Add New Purchase' : 'Edit Purchase'}</h3>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Date:
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Vendor: </label>
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
            Type:
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={inputStyle}
            >
              <option value="RAW_PAPER">RAW_PAPER</option>
              <option value="WOOD">WOOD</option>
            </select>

          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Weight:
            <input
              type="text"
              required
              value={formData.netWeight}
              onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
              placeholder="Enter weight"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Rate:
            <input
              type="text"
              required
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              placeholder="Enter rate"
              style={inputStyle}
            />
          </label>

          <label>Additional Note</label>
          <textarea
            style={inputStyle}
            value={formData.additionalNote}
            onChange={(e) =>
              setFormData({ ...formData, additionalNote: e.target.value })
            }
            rows={3}
            placeholder="Enter any remarks or additional info"
          />

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
                zIndex: 10,
              }}
            >
              <tr>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>
                  <input type="checkbox" disabled />
                </th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Vendor</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Weight</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Rate</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '7px 7px' }}>
                    <input
                      type="checkbox"
                      checked={selectedId === p.id}
                      onChange={() => handleSelect(p.id)}
                    />
                  </td>
                  <td style={{ padding: '7px 7px' }}>{p.date}</td>
                  <td style={{ padding: '7px 7px' }}>{p.vendor}</td>
                  <td style={{ padding: '7px 7px' }}>{p.type}</td>
                  <td style={{ padding: '7px 7px' }}>{p.netWeight}</td>
                  <td style={{ padding: '7px 7px' }}>{p.rate}</td>
                  <td style={{ padding: '7px 7px' }}>{p.netWeight * p.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Purchase;
