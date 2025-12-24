import { useState, useEffect } from 'react';
import { getDPPs, exportDPP } from './api';
import { FileDown, Database } from 'lucide-react';

function App() {
  const [dpps, setDpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Κλήση στο backend για να πάρουμε τη λίστα
    getDPPs()
      .then(response => {
        console.log("Backend response:", response.data);
        // Handle single object response (wrap in array) or array response
        let data = [];
        if (Array.isArray(response.data)) {
            data = response.data;
        } else if (response.data && typeof response.data === 'object') {
            // Check if it has an 'items' array (pagination) or is a single object
            if (Array.isArray(response.data.items)) {
                data = response.data.items;
            } else {
                // Assume it's a single DPP object
                data = [response.data];
            }
        }
        
        // Map backend fields to frontend expected fields if necessary
        // The logs showed: dpps_id, dpps_title, etc. but usually ORM maps to id, title.
        // Let's inspect the first item if possible.
        // Assuming standard JSON: { id: 1, title: "...", ... }
        
        setDpps(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching DPPs:", err);
        // More detailed error message
        let errorMessage = "Failed to connect to backend.";
        if (err.response) {
            errorMessage += ` Server responded with status: ${err.response.status}`;
        } else if (err.request) {
            errorMessage += " No response received from server. Check if backend is running.";
        } else {
            errorMessage += ` Request setup error: ${err.message}`;
        }
        setError(errorMessage);
        setLoading(false);
      });
  }, []);

  const handleDownload = async (id) => {
    try {
      const response = await exportDPP(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dpp_${id}.json`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Export failed!");
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Database /> DPP Management System
      </h1>

      {loading && <p>Loading data from backend...</p>}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th>ID</th>
              <th>Title</th>
              <th>Product ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dpps.length > 0 ? (
              dpps.map(dpp => (
                <tr key={dpp.id || dpp.dpps_id}>
                  <td>{dpp.id || dpp.dpps_id}</td>
                  <td>{dpp.title || dpp.dpps_title || 'N/A'}</td>
                  <td>{dpp.product_identifier || dpp.dpps_product_identifier || 'N/A'}</td>
                  <td>
                    <button onClick={() => handleDownload(dpp.id || dpp.dpps_id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <FileDown size={16} /> Export JSON
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No DPPs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;