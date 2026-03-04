import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateUser, updatePassword, deleteUser } from '../services/api'; // Added deleteUser
import { ArrowLeft, User, Key, Save, Trash2, AlertTriangle } from 'lucide-react'; // Added icons
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast'; 

function UserProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    full_name: ''
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getMe();
      setUser(response.data);
      setFormData({
        email: response.data.email,
        full_name: response.data.full_name || ''
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile.");
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        email: formData.email,
        full_name: formData.full_name
      };
      
      await updateUser(user.id, payload);
      toast.success(t('success_profile_updated')); 
      fetchProfile(); 
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile: " + (err.response?.data?.detail || err.message)); 
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error(t('error_passwords_match')); 
      return;
    }

    try {
      await updatePassword(user.id, passwordData.new_password);
      toast.success(t('success_password_updated')); 
      setPasswordData({ new_password: '', confirm_password: '' });
    } catch (err) {
      console.error("Error updating password:", err);
      toast.error("Failed to update password: " + (err.response?.data?.detail || err.message)); 
    }
  };

  const handleDeleteAccount = async () => {
      if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
      
      try {
          await deleteUser(user.id);
          toast.success("Account deleted successfully.");
          localStorage.removeItem('token');
          navigate('/login');
      } catch (err) {
          console.error("Error deleting account:", err);
          toast.error("Failed to delete account: " + (err.response?.data?.detail || err.message));
      }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="loader-container"><div className="modern-spinner"></div></div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '16px', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={20} /> {t('back_to_dashboard')}
      </button>

      <h1 style={{ marginBottom: '30px' }}>{t('my_profile')}</h1>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fecaca' }}>{error}</div>}

      <div className="responsive-grid">
        {/* Profile Info Card */}
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '20px', color: 'var(--primary-color)' }}>
            <User size={24} /> {t('personal_info')}
          </h2>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '20px' }}>
            <div className="responsive-grid responsive-grid-3" style={{ gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('username')}</label>
                <input type="text" value={user?.username} disabled style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('role')}</label>
                <input type="text" value={user?.role} disabled style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', textTransform: 'uppercase' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('subrole')}</label>
                <input type="text" value={user?.subrole || '-'} disabled style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', textTransform: 'uppercase' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('full_name')}</label>
              <input 
                type="text" 
                name="full_name" 
                value={formData.full_name} 
                onChange={handleChange} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('email')}</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary">
                <Save size={18} /> {t('save_changes')}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '20px', color: 'var(--warning-hover)' }}>
            <Key size={24} /> {t('change_password')}
          </h2>
          
          <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('new_password')}</label>
              <input 
                type="password" 
                value={passwordData.new_password} 
                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} 
                required 
                minLength={4}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('confirm_password')}</label>
              <input 
                type="password" 
                value={passwordData.confirm_password} 
                onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} 
                required 
                minLength={4}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-secondary" style={{ color: 'var(--warning-hover)', borderColor: 'var(--warning-color)' }}>
                {t('update_password')}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="card" style={{ border: '1px solid #fecaca', backgroundColor: '#fff5f5' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '15px', color: '#b91c1c' }}>
                <AlertTriangle size={24} /> Danger Zone
            </h2>
            <p style={{ color: '#7f1d1d', marginBottom: '20px', fontSize: '0.9rem' }}>
                Deleting your account is permanent. All your data will be removed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={handleDeleteAccount}
                    className="btn-danger"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Trash2 size={18} /> Delete Account
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

export default UserProfile;