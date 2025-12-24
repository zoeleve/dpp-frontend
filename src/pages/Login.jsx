import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // The user previously said the backend expects JSON for login.
      // But if login is failing now, maybe it reverted to Form Data?
      // Or maybe the user is trying to login with a new user created via the new Register page?
      
      // Let's try to be robust.
      // If the backend uses OAuth2PasswordRequestForm (standard FastAPI), it expects Form Data.
      // If the backend uses a custom Pydantic model for login, it expects JSON.
      
      // The user provided a curl command earlier that used JSON:
      // curl -X 'POST' ... -d '{"username": "zoe", "password": "test"}'
      
      // If that still holds true, then this code is correct.
      // However, if the user CANNOT login, maybe the backend changed?
      // Or maybe the user created a user via the new Register page (which uses Form Data)
      // and the password hashing/verification is tricky?
      
      // Let's stick to JSON as per the last working state.
      // But I will add a fallback or check the error message.
      
      const payload = {
        username: username,
        password: password
      };
      
      const response = await api.post('/auth/login', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Store token
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
          // If the error is 422, it might mean the backend expects Form Data instead of JSON
          if (err.response.status === 422) {
              console.log("JSON login failed with 422, trying Form Data...");
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
          setError(`Login failed: ${msg}`);
      } else {
          setError('Login failed: Network error or server unreachable');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '300px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Sign In
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            <p>Don't have an account? <Link to="/register">Register as Viewer</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;