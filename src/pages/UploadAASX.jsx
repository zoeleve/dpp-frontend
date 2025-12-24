import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAASX } from '../api';
import { ArrowLeft, Upload } from 'lucide-react';

function UploadAASX() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadAASX(file);
      setSuccess(`Success! File processed. Product ID: ${response.data.product_id}`);
      setFile(null);
      // Reset file input manually if needed, or just rely on state
    } catch (err) {
      console.error("Upload error:", err);
      let msg = "Upload failed.";
      if (err.response) {
          msg += ` Server responded with: ${err.response.data.detail || err.response.statusText}`;
      } else {
          msg += ` ${err.message}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1>Upload AASX / ZIP</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Upload an .aasx or .zip file containing Digital Product Passport data (XML/JSON).
      </p>
      
      {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
      {success && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', border: '2px dashed #ccc', padding: '40px', borderRadius: '8px', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
        <Upload size={48} color="#ccc" />
        
        <input 
            type="file" 
            accept=".aasx,.zip"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload"
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', borderRadius: '4px' }}>
            {file ? file.name : "Select File"}
        </label>

        {file && (
            <button 
                type="submit" 
                disabled={loading}
                style={{ 
                    padding: '12px 24px', 
                    backgroundColor: loading ? '#6c757d' : '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    width: '100%'
                }}
            >
                {loading ? "Uploading..." : "Upload & Process"}
            </button>
        )}
      </form>
    </div>
  );
}

export default UploadAASX;