import './Dashboard.css';
import React, { useEffect, useState } from 'react';

const getDefaultToMonth = () => {
  const today = new Date();
  return today.toISOString().slice(0, 7); // YYYY-MM
};
const getDefaultFromMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 2); // 3 months range including current
  return date.toISOString().slice(0, 7);
};

// Modal form component for Add Payment or Receipt
function TransactionForm({ type, vendorName, onClose, onSuccess }) {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    setError('');
    setLoading(true);

    const payload = {
      vendorName,
      date,
      type, // "PAYMENT" or "RECEIPT"
      amount: Number(amount),
      note,
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/vendor-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to save transaction');
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Error saving transaction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 400, padding: '1.5rem', borderRadius: 6 }}>
        <h3 style={{ marginBottom: '1rem' }}>{type === 'PAYMENT' ? 'Add Payment' : 'Add Receipt'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="date">Date<span style={{ color: 'red' }}>*</span>:</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              required
              className="form-input"
            />
          </div>

          <div className="form-row">
            <label htmlFor="amount">Amount<span style={{ color: 'red' }}>*</span>:</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="form-input"
              placeholder="Enter amount"
            />
          </div>

          <div className="form-row">
            <label htmlFor="note">Note:</label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
              className="form-input"
            />
          </div>

          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: 100 }}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary"
              style={{ minWidth: 100 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Account() {
  // Vendor name search related states
  const [query, setQuery] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorList, setVendorList] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [totalTrade, setTotalTrade] = useState(0);
  const [finalBalance, setFinalBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [fromMonth, setFromMonth] = useState(getDefaultFromMonth());
  const [toMonth, setToMonth] = useState(getDefaultToMonth());

  // Modal states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);

  const [formDate, setFormDate] = useState('');
  const [formId, setFormId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formType, setFormType] = useState('PAYMENT');

  // Load vendor list from localStorage once
  useEffect(() => {
    const storedVendors = localStorage.getItem('vendors');
    if (storedVendors) {
      try {
        const parsed = JSON.parse(storedVendors);
        setVendorList(parsed);
      } catch (err) {
        console.error('Error parsing vendors from localStorage', err);
      }
    }
  }, []);

  // Fetch vendor transactions on Apply button click only
  const fetchVendorTransactions = () => {
    if (!vendorName) {
      alert('Please select a vendor before applying filter');
      return;
    }
    const payload = {
      vendorName,
      startMonth: formatMonthToDDMMYYYY(fromMonth),
      endMonth: formatMonthToDDMMYYYYEndOfMonth(toMonth),
    };

    const token = localStorage.getItem('token');

    fetch('http://localhost:8080/api/vendor-transactions/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((data) => {
        setOpeningBalance(data.openingBalance || 0);
        setTransactions(data.transactions || []);
        setFinalBalance(data.finalBalance || 0);
        setTotalTrade(data.totalTrade || 0);
        setFilteredTransactions(data.transactions || []);
      })
      .catch((err) => {
        console.error('Error fetching vendor transactions:', err);
        alert('Something went wrong. Try again.');
      });
  };

  const handleUpdate = async () => {
    // Prepare the payload for update
    const payload = {
      id: editingTransaction.id,
      vendorName: vendorName,  // or editingTransaction.vendorName if needed
      date: formDate,          // yyyy-MM-dd format from input type="date"
      type: formType,          // PAYMENT or RECEIPT (only editable types)
      amount: parseFloat(formAmount),
      note: formNote,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/vendor-transactions', {
        method: 'PUT', // or 'POST' depending on your API design
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update transaction');

      setShowModal(false);
      // refresh the transactions list here, e.g. call fetch again
      fetchVendorTransactions();

    } catch (error) {
      alert('Error updating transaction: ' + error.message);
    }
  };

  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    // Convert dd-MM-yyyy to yyyy-MM-dd for input type="date"
    const [dd, mm, yyyy] = tx.date.split('-');
    setFormDate(`${dd}-${mm}-${yyyy}`);
    setFormId(tx.id);
    setFormAmount(tx.amount);
    setFormNote(tx.note || '');
    setFormType(tx.displayType);
    setShowModal(true);
  };


  const formatMonthToDDMMYYYY = (yyyyMm) => {
    const [year, month] = yyyyMm.split('-');
    return `01-${month}-${year}`;
  };

  // Returns last date of given month formatted dd-MM-yyyy
  const formatMonthToDDMMYYYYEndOfMonth = (yyyyMm) => {
    const [year, month] = yyyyMm.split('-');
    const date = new Date(year, month, 0); // day 0 means last day of previous month, so use month as number
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const formatDate = (dateStr) => {
    // dateStr in "yyyy-MM-dd" or "dd-MM-yyyy"
    if (!dateStr) return '';
    let day, month, year;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        // yyyy-MM-dd
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        // dd-MM-yyyy
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
      const parsedDate = new Date(`${year}-${month}-${day}`);
      return parsedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      });
    }
    return dateStr;
  };

  // Vendor input handlers with auto-suggest

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() === '') {
      setFilteredVendors([]);
      setShowSuggestions(false);
      setSelectedVendor(null);
      setVendorName('');
      setTransactions([]);
      setFilteredTransactions([]);
      setOpeningBalance(0);
      setFinalBalance(0);
      setTotalTrade(0);
      return;
    }
    const matches = vendorList.filter((v) => v.name.toLowerCase().includes(value.toLowerCase()));
    setFilteredVendors(matches);
    setShowSuggestions(true);
    setSelectedVendor(null);
    setVendorName(''); // clear vendorName because user is typing
  };

  const handleSelectVendor = (vendor) => {
    setSelectedVendor(vendor);
    setQuery(vendor.name);
    setVendorName(vendor.name);
    setFilteredVendors([]);
    setShowSuggestions(false);
    // Clear existing data on vendor change
    setTransactions([]);
    setFilteredTransactions([]);
    setOpeningBalance(0);
    setFinalBalance(0);
    setTotalTrade(0);
  };

  const handleVendorBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      const typedVendor = (vendorName || '').trim().toLowerCase();
      const knownVendorNames = vendorList.map((v) => v.name.toLowerCase());
      if (typedVendor && !knownVendorNames.includes(typedVendor)) {
        setSelectedVendor(null);
        setVendorName('');
        setTransactions([]);
        setFilteredTransactions([]);
        setOpeningBalance(0);
        setFinalBalance(0);
        setTotalTrade(0);
      }
    }, 200);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Vendor Account</h2>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <label>Vendor Name: </label>
        <div style={{ position: 'relative', width: 300, marginTop: 4, paddingRight: '1rem' }}>
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

        <label>
          From Month:
          <input
            type="month"
            value={fromMonth}
            onChange={(e) => setFromMonth(e.target.value)}
            min={getMinMonth()}
            max={getMaxMonth()}
            style={{ marginLeft: 8 }}
          />
        </label>

        <label>
          To Month:
          <input
            type="month"
            value={toMonth}
            onChange={(e) => setToMonth(e.target.value)}
            min={getMinMonth()}
            max={getMaxMonth()}
            style={{ marginLeft: 8 }}
          />
        </label>

        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            height: '32px',
            alignSelf: 'flex-end',
          }}
          onClick={fetchVendorTransactions}
          disabled={!vendorName}
        >
          Apply
        </button>
      </div>

      {/* Buttons for forms */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <button
          disabled={!vendorName}
          onClick={() => setShowPaymentForm(true)}
          style={{ padding: '0.5rem 1rem', cursor: vendorName ? 'pointer' : 'not-allowed' }}
        >
          Add Payment
        </button>
        <button
          disabled={!vendorName}
          onClick={() => setShowReceiptForm(true)}
          style={{ padding: '0.5rem 1rem', cursor: vendorName ? 'pointer' : 'not-allowed' }}
        >
          Add Receipt
        </button>
        {/* Placeholder for Payment Adjustment Edit button */}
        <button disabled style={{ padding: '0.5rem 1rem', cursor: 'not-allowed' }}>
          Payment Adjustment (Edit)
        </button>
      </div>

      <hr />


      {/* Modal popup */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 400, padding: '1.5rem', borderRadius: 6 }}>
            <h3 style={{ marginBottom: '1rem' }}>Edit Transaction</h3>

            <div className="form-row">
              <label htmlFor="date">Date<span style={{ color: 'red' }}>*</span>:</label>
              <input
                id="date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                required
                className="form-input"
              />
            </div>


            <div className="form-row">
              <label htmlFor="amount">Amount<span style={{ color: 'red' }}>*</span>:</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-row">
              <label htmlFor="note">Note:</label>
              <input
                id="note"
                type="text"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="Optional"
                className="form-input"
              />
            </div>


            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '1.5rem',
              }}
            >
              <button

                className="btn btn-primary"
                style={{ minWidth: 100 }}
                onClick={handleUpdate}
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                // disabled={loading}
                className="btn btn-secondary"
                style={{ minWidth: 100 }}
              >
                Cancel
              </button>
            </div>


          </div>
        </div>
      )}

      {!vendorName ? (
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center', padding: '3rem' }}>
          Shivshakti Paper
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          No transactions found for selected date range.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
            Opening Balance: ₹{openingBalance}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead style={{ backgroundColor: '#f4f4f4' }}>
              <tr>
                <th style={cellStyle}>Transaction Date</th>
                <th style={cellStyle}>Type</th>
                <th style={cellStyle}>Note</th>
                <th style={cellStyle}>Amount</th>
                <th style={cellStyle}>Balance</th>
                <th style={cellStyle}>Mode</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: tx.type === 'CREDIT' ? '#e6ffea' : '#ffeaea',
                  }}
                >
                  <td
                    style={{
                      padding: '8px',
                      border: '1px solid #ccc',
                      textAlign: 'left',
                      width: '20%',
                    }}
                  >
                    {formatDate(tx.date)}
                  </td>
                  <td style={cellStyle}>{tx.displayType}</td>
                  <td style={cellStyle}>{tx.note}</td>
                  <td style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    textAlign: 'right',
                    width: '20%',
                  }}>₹{tx.amount.toFixed(2)}</td>
                  <td
                    style={{
                      padding: '8px',
                      border: '1px solid #ccc',
                      textAlign: 'right',
                      width: '20%',
                    }}
                  >
                    ₹{tx.balance.toFixed(2)}
                  </td>
                  <td  style={{
                      padding: '8px',
                      border: '1px solid #ccc',
                      textAlign: 'center',
                      width: '7%',
                    }}>
                    {(tx.displayType === 'PAYMENT' || tx.displayType === 'RECEIPT') && (
                      <img
                        src="/images/edit_icon.png"
                        alt="Edit"
                        onClick={() => openEditModal(tx)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', border: '1px solid #ccc', }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Account Balance: ₹{finalBalance.toFixed(2)}</div>
          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Total Trade (Debits): ₹{totalTrade.toFixed(2)}</div>
        </>
      )}

      {/* Modal forms */}
      {showPaymentForm && (
        <TransactionForm
          type="PAYMENT"
          vendorName={vendorName}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={fetchVendorTransactions}
        />
      )}
      {showReceiptForm && (
        <TransactionForm
          type="RECEIPT"
          vendorName={vendorName}
          onClose={() => setShowReceiptForm(false)}
          onSuccess={fetchVendorTransactions}
        />
      )}
    </div>
  );
}

const cellStyle = {
  padding: '8px',
  border: '1px solid #ccc',
  textAlign: 'left',
  width: '20%',
};

const getMaxMonth = () => {
  const today = new Date();
  return today.toISOString().slice(0, 7);
};

const getMinMonth = () => {
  const today = new Date();
  today.setMonth(today.getMonth() - 11);
  return today.toISOString().slice(0, 7);
};
