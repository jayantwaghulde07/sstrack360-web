import React, { useState, useEffect } from 'react';

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '100%',
  marginTop: '0.3rem',
};

function Expenditure() {
  const [expenditures, setExpenditures] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [durationFilter, setDurationFilter] = useState('LAST_3');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    type: '',
    total: '',
    note: '',
  });

  const [vendorList, setVendorList] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const token = localStorage.getItem('token');

const API_BASE_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
      const fetchExpenditures  = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No token found, please login.');
          return;
        }
  
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/expenditures`, {
              headers: { Authorization: `Bearer ${token}` },
            });
  
            if (!response.ok) {
              throw new Error('Failed to fetch expenses data');
            }
  
            const data = await response.json();
            setExpenditures(data);
          } catch (error) {
            console.error('Error fetching expenses:', error);
            alert('Error loading expenses');
          }
        };
  
        fetchExpenditures();
      }, [API_BASE_URL]);
  
  
 
  const exportToExcel = async () => {
    try {
      const queryParams = new URLSearchParams({
        type: typeFilter,
        duration: durationFilter,
        vendor: selectedVendor?.name || query || '', // Prefer selected vendor, fallback to search input
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/expenditures/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenditure_data.xlsx'); // customize filename if needed
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export to Excel failed:', error);
    }
  };


    const fetchExpenditures  = async () => {
      const queryParams = new URLSearchParams({
        type: typeFilter,
        duration: durationFilter,
        vendor: selectedVendor?.name || query || '', // Prefer selected vendor, fallback to search input
      });
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/expenditures?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch purchase');
        }
  
        const data = await response.json();
        setExpenditures(data);
      } catch (error) {
        console.error('Error fetching purchase:', error);
        alert('Error loading purchase');
      }
    };

  useEffect(() => {
    const storedVendors = localStorage.getItem('vendors_expenditure');
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
      type: '',
      total: '',
      note: '',
    });
    setQuery('');
    setSelectedVendor(null);
    setIsAddMode(true);
    setIsEditMode(false);
    setSelectedId(null);
  };

 const handleEditClick = () => {
  if (!selectedId) return;
  const expenditureEdit = expenditures.find(p => p.id === selectedId);
  if (expenditureEdit) {
    setFormData({ ...expenditureEdit });
    setQuery(expenditureEdit.vendor);       // <-- sync query input with vendor
    setSelectedVendor(
      vendorList.find(v => v.name === expenditureEdit.vendor) || null
    );  // <-- sync selected vendor object, if found
    setIsEditMode(true);
    setIsAddMode(false);
  }
};

  const handleDeleteClick = async () => {
    if (!selectedId) return;

    if (window.confirm('Are you sure you want to delete this expenditure?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/expenditures/${selectedId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setExpenditures(expenditures.filter(e => e.id !== selectedId));
          setSelectedId(null);
        } else {
          alert('Failed to delete. Server error.');
        }
      } catch (error) {
        console.error('Error deleting expenditure:', error);
        alert('Error deleting expenditure.');
      }
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

    const payload = {
      date: formData.date,
      vendor: formData.vendor,
      type: formData.type,
      total: parseFloat(formData.total),
      note: formData.note,
    };

    try {
      if (isAddMode) {
        const res = await fetch(`${API_URL}/api/expenditures`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const newExp = await res.json();
        setExpenditures([...expenditures, newExp]);
      } else if (isEditMode) {
        await fetch(`${API_URL}/api/expenditures/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        setExpenditures(expenditures.map(e => (e.id === formData.id ? { ...e, ...payload } : e)));
      }

      setFormData({ date: '', vendor: '', type: '', total: '', note: '' });
      setQuery('');
      setSelectedVendor(null);
      setIsAddMode(false);
      setIsEditMode(false);
      setSelectedId(null);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error saving data.');
    }
  };

  const handleCancel = () => {
    setIsAddMode(false);
    setIsEditMode(false);
    setSelectedId(null);
    setQuery('');
    setSelectedVendor(null);
  };

  const handleFocus = () => {
    if (filteredVendors.length > 0) {
      setShowSuggestions(true);
    }
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
      <h2>Expenditure List</h2>

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
          <button>&laquo; Prev</button>
          <span>
            <strong>
              {expenditures.length} out of {expenditures.length}
            </strong>
          </span>
          <button>Next &raquo;</button>
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
            Type:
            <select
              style={{ marginLeft: 4 }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Type</option>
              <option value="CHEMICAL">Chemical</option>
              <option value="FUEL">Fuel</option>
              <option value="PLASTIC">Plastic</option>
              <option value="TEA">Tea</option>
              <option value="OFFICE">Office stuff</option>
            </select>
          </label>

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
                      padding: '0rem',
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

          <button onClick={() => fetchExpenditures()}>Refresh</button>
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
            maxWidth: '600px',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>
            {isAddMode ? 'Add New Expenditure' : 'Edit Expenditure'}
          </h3>

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

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vendor:</label>
          <div style={{ width: '300px', position: 'relative', zIndex: 999 }}>
            <input
              type="text"
              required
              placeholder="Search vendor..."
              value={query}
              onChange={handleChange}
              onBlur={handleVendorBlur}
              onFocus={handleFocus}
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
                      padding: '0.5rem',
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

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Type:
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={{ ...inputStyle, padding: '0.5rem' }}
            >
              <option value="">Select type</option>
              <option value="PLASTIC">Plastic</option>
              <option value="FUEL">Fuel</option>
              <option value="CHEMICAL">Chemical</option>
              <option value="TEA">Tea</option>
              <option value="OFFICE">Office</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Total Amount:
            <input
              type="text"
              required
              value={formData.total}
              onChange={(e) => setFormData({ ...formData, total: e.target.value })}
              placeholder="Enter total amount"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Note:
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Additional note"
              style={{ ...inputStyle, height: '80px' }}
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
        <div
          style={{
            border: '1px solid #ccc',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Expenditure List">
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
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Total Amount</th>
                <th style={{ padding: '7px 7px', textAlign: 'left' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {expenditures.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>
                    <input
                      type="checkbox"
                      checked={selectedId === exp.id}
                      onChange={() => handleSelect(exp.id)}
                    />
                  </td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{exp.date}</td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{exp.vendor}</td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{exp.type}</td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{exp.total}</td>
                  <td style={{ padding: '7px 7px', textAlign: 'left' }}>{exp.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Expenditure;
