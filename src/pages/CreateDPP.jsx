import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function CreateDPP() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    product_id: '',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    production_date: '',
    description: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateUUID = () => {
    if (window.crypto && window.crypto.randomUUID) {
      setFormData(prev => ({ ...prev, product_id: window.crypto.randomUUID() }));
    } else {
      // Fallback for older browsers or non-secure contexts
      setFormData(prev => ({ ...prev, product_id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/dpp/json/', formData);
      alert(t('success_dpp_created'));
      navigate('/dashboard');
    } catch (err) {
      console.error("Error creating DPP:", err);
      if (err.response) {
          const msg = err.response.data.detail || 'Failed to create DPP';
          const displayMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
          setError(`Error: ${displayMsg}`);
      } else {
          setError('Error: Network error or server unreachable');
      }
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
        <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>{t('create_new_dpp')}</h1>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fecaca' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('title')} *</label>
            <input 
              type="text" 
              name="title"
              value={formData.title} 
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('product_id')} (GlobalAssetId) *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                  type="text"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                  required
                  placeholder="e.g. UUID, GTIN, DID"
              />
              <button
                  type="button"
                  onClick={generateUUID}
                  className="btn-secondary"
                  title={t('generate')}
              >
                  <RefreshCw size={16} /> {t('generate')}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('manufacturer')}</label>
            <input 
              type="text" 
              name="manufacturer"
              value={formData.manufacturer} 
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('model_number')}</label>
                  <input 
                      type="text" 
                      name="model_number"
                      value={formData.model_number} 
                      onChange={handleChange}
                  />
              </div>
              <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('serial_number')}</label>
                  <input 
                      type="text" 
                      name="serial_number"
                      value={formData.serial_number} 
                      onChange={handleChange}
                  />
              </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('production_date')}</label>
            <input 
              type="date" 
              name="production_date"
              value={formData.production_date} 
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('description')}</label>
            <textarea 
              name="description"
              value={formData.description} 
              onChange={handleChange}
              rows="4"
              placeholder="This will be stored in attributes for now."
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: '100%', padding: '12px' }}>
            {t('create_dpp')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateDPP;