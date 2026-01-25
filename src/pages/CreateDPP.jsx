import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, RefreshCw, Plus, Trash2, Layers } from 'lucide-react';
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
  
  // State for AAS Submodels
  const [submodels, setSubmodels] = useState([]);
  
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
      setFormData(prev => ({ ...prev, product_id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }) }));
    }
  };

  // --- Submodel Logic ---
  const addSubmodel = () => {
    setSubmodels([...submodels, { idShort: '', semanticId: '', submodelElements: [] }]);
  };

  const removeSubmodel = (index) => {
    const newSubmodels = [...submodels];
    newSubmodels.splice(index, 1);
    setSubmodels(newSubmodels);
  };

  const updateSubmodel = (index, field, value) => {
    const newSubmodels = [...submodels];
    newSubmodels[index][field] = value;
    setSubmodels(newSubmodels);
  };

  const addElement = (submodelIndex) => {
    const newSubmodels = [...submodels];
    newSubmodels[submodelIndex].submodelElements.push({ key: '', value: '' });
    setSubmodels(newSubmodels);
  };

  const removeElement = (submodelIndex, elementIndex) => {
    const newSubmodels = [...submodels];
    newSubmodels[submodelIndex].submodelElements.splice(elementIndex, 1);
    setSubmodels(newSubmodels);
  };

  const updateElement = (submodelIndex, elementIndex, field, value) => {
    const newSubmodels = [...submodels];
    newSubmodels[submodelIndex].submodelElements[elementIndex][field] = value;
    setSubmodels(newSubmodels);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Prepare payload
      // Convert submodels array to the structure expected by backend (list of dicts with 'submodelElements' as dict)
      const formattedSubmodels = submodels.map(sm => {
        const elementsDict = {};
        sm.submodelElements.forEach(el => {
          if (el.key.trim()) {
            elementsDict[el.key] = el.value;
          }
        });
        return {
          idShort: sm.idShort,
          semanticId: sm.semanticId,
          submodelElements: elementsDict
        };
      });

      const payload = {
        ...formData,
        submodels: formattedSubmodels
      };

      await api.post('/dpp/json/', payload);
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
    <div className="container" style={{ maxWidth: '800px' }}>
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
          
          {/* Core Fields */}
          <div className="responsive-grid responsive-grid-2">
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
                    <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="responsive-grid responsive-grid-3">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('manufacturer')}</label>
              <input 
                type="text" 
                name="manufacturer"
                value={formData.manufacturer} 
                onChange={handleChange}
              />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('model_number')}</label>
                <input 
                    type="text" 
                    name="model_number"
                    value={formData.model_number} 
                    onChange={handleChange}
                />
            </div>
            <div>
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
              rows="3"
              placeholder="This will be stored in attributes for now."
            />
          </div>

          {/* AAS Submodels Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)' }}>
                    <Layers size={20} /> AAS Submodels
                </h3>
                <button type="button" onClick={addSubmodel} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                    <Plus size={16} /> Add Submodel
                </button>
            </div>

            {submodels.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    No submodels added. Add one to structure your data (e.g. CarbonFootprint).
                </p>
            )}

            {submodels.map((sm, smIndex) => (
                <div key={smIndex} style={{ backgroundColor: 'var(--background-color)', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>Submodel #{smIndex + 1}</h4>
                        <button type="button" onClick={() => removeSubmodel(smIndex)} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                    
                    <div className="responsive-grid responsive-grid-2" style={{ marginBottom: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="ID Short (e.g. CarbonFootprint)" 
                            value={sm.idShort}
                            onChange={(e) => updateSubmodel(smIndex, 'idShort', e.target.value)}
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Semantic ID (Optional)" 
                            value={sm.semanticId}
                            onChange={(e) => updateSubmodel(smIndex, 'semanticId', e.target.value)}
                        />
                    </div>

                    {/* Submodel Elements */}
                    <div style={{ paddingLeft: '10px', borderLeft: '2px solid var(--border-color)' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Elements</p>
                        {sm.submodelElements.map((el, elIndex) => (
                            <div key={elIndex} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Key (e.g. CO2)" 
                                    value={el.key}
                                    onChange={(e) => updateElement(smIndex, elIndex, 'key', e.target.value)}
                                    style={{ flex: 1, padding: '8px' }}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Value (e.g. 500kg)" 
                                    value={el.value}
                                    onChange={(e) => updateElement(smIndex, elIndex, 'value', e.target.value)}
                                    style={{ flex: 1, padding: '8px' }}
                                />
                                <button type="button" onClick={() => removeElement(smIndex, elIndex)} style={{ color: 'var(--danger-color)', background: 'none', border: 'none' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addElement(smIndex)} style={{ fontSize: '0.8rem', color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Plus size={14} /> Add Element
                        </button>
                    </div>
                </div>
            ))}
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