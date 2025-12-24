import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft } from 'lucide-react';

function CreateDPP() {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // The backend expects title and product_id at the top level.
      // Other fields will be automatically put into dpp_data by the backend logic 
      // if we send them in the same JSON object (assuming Pydantic model allows extra fields or has them defined).
      // Based on the backend code: dpp_dict = dpp.dict(); title = dpp_dict.pop("title"); ...
      // So we just send one flat JSON object.
      
      await api.post('/dpp/json/', formData);
      
      alert("DPP created successfully!");
      navigate('/dashboard');
    } catch (err) {
      console.error("Error creating DPP:", err);
      if (err.response) {
          const msg = err.response.data.detail || 'Failed to create DPP';
          // Handle validation errors (array of objects)
          const displayMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
          setError(`Error: ${displayMsg}`);
      } else {
          setError('Error: Network error or server unreachable');
      }
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

      <h1>Create New DPP</h1>
      
      {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title *</label>
          <input 
            type="text" 
            name="title"
            value={formData.title} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product ID (UUID/Barcode) *</label>
          <input 
            type="text" 
            name="product_id"
            value={formData.product_id} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Manufacturer</label>
          <input 
            type="text" 
            name="manufacturer"
            value={formData.manufacturer} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Model Number</label>
                <input 
                    type="text" 
                    name="model_number"
                    value={formData.model_number} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Serial Number</label>
                <input 
                    type="text" 
                    name="serial_number"
                    value={formData.serial_number} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                />
            </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Production Date</label>
          <input 
            type="date" 
            name="production_date"
            value={formData.production_date} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description / Extra Data</label>
          <textarea 
            name="description"
            value={formData.description} 
            onChange={handleChange}
            rows="4"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
          Create DPP
        </button>
      </form>
    </div>
  );
}

export default CreateDPP;