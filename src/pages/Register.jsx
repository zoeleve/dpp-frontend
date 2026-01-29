import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../services/api'; 
import { Database, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'VIEWER', 
    subrole: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // Changed to boolean
  const navigate = useNavigate();

  const subroles = ["MANUFACTURER", "TECHNICIAN", "DISTRIBUTOR", "RECYCLER", "INSPECTOR", "CONSUMER", "AUDITOR", "PARTNER"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      await createUser(formData);
      setSuccess(true);
      
      // Delay navigation slightly to let user see the success message
      setTimeout(() => {
          navigate('/login');
      }, 2500);
      
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response) {
          setError(`Registration failed: ${err.response.data.detail || 'Error creating user'}`);
      } else {
          setError('Registration failed: Network error or server unreachable');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px', transition: 'all 0.3s ease' }}>
        
        {/* Logo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ 
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)', 
                padding: '16px', 
                borderRadius: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 68, 148, 0.3)',
                marginBottom: '16px'
            }}>
                <Database size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0 }}>{t('dpp_system')}</h1>
            {!success && <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{t('create_viewer_account')}</p>}
        </div>

        {/* Success View */}
        {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--success-light)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '20px',
                    color: 'var(--success-color)'
                }}>
                    <CheckCircle size={48} />
                </div>
                <h2 style={{ color: 'var(--success-hover)', marginBottom: '10px' }}>Registration Successful!</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Your account has been created. <br/> Redirecting to login page...
                </p>
                <div className="modern-spinner" style={{ marginTop: '20px', width: '24px', height: '24px', borderWidth: '2px' }}></div>
            </div>
        ) : (
            /* Form View */
            <>
                {error && (
                    <div style={{ 
                        backgroundColor: 'var(--danger-light)', 
                        color: 'var(--danger-color)', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        marginBottom: '20px', 
                        fontSize: '0.95rem', 
                        textAlign: 'center',
                        border: '1px solid var(--danger-color)'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('username')}</label>
                    <input 
                      type="text" 
                      name="username"
                      value={formData.username} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('email')}</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('full_name')}</label>
                    <input 
                      type="text" 
                      name="full_name"
                      value={formData.full_name} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('password')}</label>
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  {/* Subrole Selection */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('subrole')} (Professional Capacity)</label>
                    <select 
                        name="subrole" 
                        value={formData.subrole} 
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Select your profession</option>
                        {subroles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '1rem', marginTop: '10px' }}>
                    {t('register')}
                  </button>
                </form>
                
                <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <p>{t('already_have_account')} <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>{t('login_here')}</Link></p>
                </div>
            </>
        )}
      </div>
    </div>
  );
}

export default Register;