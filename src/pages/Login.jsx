import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Database, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'el' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const payload = {
        username: username,
        password: password
      };
      
      const response = await api.post('/auth/login', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
          if (err.response.status === 422) {
              try {
                  const params = new URLSearchParams();
                  params.append('username', username);
                  params.append('password', password);
                  
                  const res2 = await api.post('/auth/login', params, {
                      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                  });
                  
                  localStorage.setItem('token', res2.data.access_token);
                  navigate('/dashboard');
                  return;
              } catch (err2) {
                  console.error("Form Data login also failed:", err2);
              }
          }

          const msg = err.response.data.detail || 'Invalid credentials';
          setError(`${t('login')} failed: ${msg}`);
      } else {
          setError(`${t('login')} failed: Network error or server unreachable`);
      }
    }
  };

  return (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', // Subtle gradient background
        position: 'relative'
    }}>

      {/* Language Toggle (Top Right) */}
      <button
        onClick={toggleLanguage}
        style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            color: 'var(--text-secondary)',
            fontWeight: '500',
            fontSize: '0.9rem'
        }}
      >
        <Globe size={16} />
        {i18n.language === 'en' ? 'Ελληνικά' : 'English'}
      </button>

      <div className="card" style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Deeper shadow
          animation: 'fadeIn 0.5s ease-out' // Simple fade-in
      }}>
        
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
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{t('login_here')}</p>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('username')}</label>
            <input 
              id="username"
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('password')}</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '1rem', marginTop: '10px' }}>
            {t('login')}
          </button>
        </form>
        
        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <p>{t('dont_have_account')} <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>{t('register_viewer')}</Link></p>
        </div>
      </div>

      {/* Simple Footer */}
      <div style={{ position: 'absolute', bottom: '20px', color: '#94a3b8', fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} DPP Platform. All rights reserved.
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Login;