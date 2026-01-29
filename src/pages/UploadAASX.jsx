import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAASX } from '../services/api'; 
import { ArrowLeft, Upload, FileUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast'; // Import toast

function UploadAASX() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Removed local success state in favor of toast

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
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

    try {
      const response = await uploadAASX(file);
      toast.success(`Success! File processed. Product ID: ${response.data.product_id}`); // Toast
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
      toast.error(msg); // Toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '16px', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={20} /> {t('back_to_dashboard')}
      </button>

      <div className="card">
        <h1 style={{ marginBottom: '10px', fontSize: '1.8rem' }}>{t('upload_aasx_zip')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            {t('upload_desc')}
        </p>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fecaca' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', border: '2px dashed var(--border-color)', padding: '40px', borderRadius: '12px', alignItems: 'center', backgroundColor: 'var(--background-color)' }}>
            <div style={{ padding: '20px', backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary-color)' }}>
                <Upload size={40} />
            </div>
            
            <input 
                type="file" 
                accept=".aasx,.zip"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
            />
            
            <div style={{ textAlign: 'center' }}>
                <label 
                    htmlFor="file-upload" 
                    className="btn-primary" 
                    style={{ 
                        cursor: 'pointer', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '10px 20px',
                        fontSize: '1rem'
                    }}
                >
                    <FileUp size={18} /> {file ? t('change_file') : t('select_file')}
                </label>
                {file && <p style={{ marginTop: '10px', fontWeight: '500', color: 'var(--text-primary)' }}>{file.name}</p>}
            </div>

            {file && (
                <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-success"
                    style={{ 
                        width: '100%',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        padding: '12px'
                    }}
                >
                    {loading ? t('loading') : t('upload_process')}
                </button>
            )}
        </form>
      </div>
    </div>
  );
}

export default UploadAASX;