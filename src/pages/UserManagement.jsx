import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminUser, deleteUser, getUsers, updateUser, updatePassword, updateUserStatus, getCurrentUser } from '../services/api'; // Updated imports
import { ArrowLeft, UserPlus, Trash2, Edit, Key, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

function UserManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal/Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);

  const currentUser = getCurrentUser();

  // Form state for new user
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'USER',
    subrole: 'CONSUMER'
  });

  // Form state for updating password
  const [newPassword, setNewPassword] = useState('');

  const roles = ["ADMIN", "USER", "VIEWER"];
  const subroles = ["MANUFACTURER", "TECHNICIAN", "DISTRIBUTOR", "RECYCLER", "INSPECTOR", "CONSUMER", "AUDITOR", "PARTNER"];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        (user.username && user.username.toLowerCase().includes(lowerQuery)) ||
        (user.full_name && user.full_name.toLowerCase().includes(lowerQuery))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      const data = Array.isArray(response.data) ? response.data : [];
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. You might not have permission.");
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Use createAdminUser for admin panel creation
      await createAdminUser(newUser);
      toast.success("User created successfully!");
      setShowCreateForm(false);
      setNewUser({ username: '', email: '', password: '', full_name: '', role: 'USER', subrole: 'CONSUMER' });
      fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error("Failed to create user: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      let msg = err.response?.data?.detail || err.message;
      if (err.response?.status === 500) {
          msg = "Server error. This user might own data (DPPs) that prevents deletion.";
      }
      toast.error("Failed to delete user: " + msg);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: editingUser.email,
        full_name: editingUser.full_name,
        role: editingUser.role.toLowerCase(),
        subrole: editingUser.subrole ? editingUser.subrole.toLowerCase() : null,
        // is_active is handled separately now
      };
      
      await updateUser(editingUser.id, payload);
      toast.success("User updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggleStatus = async (user) => {
      try {
          // Use updateUserStatus (PATCH)
          await updateUserStatus(user.id, !user.is_active);
          toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
          fetchUsers();
      } catch (err) {
          console.error("Error toggling status:", err);
          toast.error("Failed to update status: " + (err.response?.data?.detail || err.message));
      }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await updatePassword(passwordUser.id, newPassword);
      toast.success("Password updated successfully!");
      setPasswordUser(null);
      setNewPassword('');
    } catch (err) {
      console.error("Error updating password:", err);
      toast.error("Failed to update password: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleChangeNewUser = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleChangeEditUser = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '16px', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={20} /> {t('back_to_dashboard')}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{t('user_management')}</h1>
        <button 
          onClick={() => { setShowCreateForm(!showCreateForm); setEditingUser(null); setPasswordUser(null); }}
          className="btn-primary"
        >
          <UserPlus size={16} /> {showCreateForm ? t('cancel') : t('add_new_user')}
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '40px', width: '100%' }}
        />
      </div>

      {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

      {/* CREATE FORM */}
      {showCreateForm && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: 'var(--background-color)' }}>
          <h3 style={{ marginBottom: '20px' }}>{t('create_user')}</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('username')} *</label>
              <input type="text" name="username" value={newUser.username} onChange={handleChangeNewUser} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('email')} *</label>
              <input type="email" name="email" value={newUser.email} onChange={handleChangeNewUser} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('full_name')} *</label>
              <input type="text" name="full_name" value={newUser.full_name} onChange={handleChangeNewUser} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('password')} *</label>
              <input type="password" name="password" value={newUser.password} onChange={handleChangeNewUser} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('role')}</label>
              <select name="role" value={newUser.role} onChange={handleChangeNewUser}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('subrole')}</label>
              <select name="subrole" value={newUser.subrole} onChange={handleChangeNewUser}>
                {subroles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <button type="submit" className="btn-primary">{t('create_user')}</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT USER FORM */}
      {editingUser && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: 'var(--background-color)' }}>
          <h3 style={{ marginBottom: '20px' }}>{t('edit_user')}: {editingUser.username}</h3>
          <form onSubmit={handleUpdateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('email')}</label>
              <input type="email" name="email" value={editingUser.email} onChange={handleChangeEditUser} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('full_name')}</label>
              <input type="text" name="full_name" value={editingUser.full_name} onChange={handleChangeEditUser} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('role')}</label>
              <select name="role" value={editingUser.role ? editingUser.role.toUpperCase() : 'USER'} onChange={handleChangeEditUser}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('subrole')}</label>
              <select name="subrole" value={editingUser.subrole ? editingUser.subrole.toUpperCase() : 'CONSUMER'} onChange={handleChangeEditUser}>
                {subroles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary">{t('save_changes')}</button>
              <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">{t('cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {/* CHANGE PASSWORD FORM */}
      {passwordUser && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: 'var(--warning-light)', borderColor: 'var(--warning-color)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--warning-hover)' }}>{t('change_password')}: {passwordUser.username}</h3>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('new_password')}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--warning-color)', borderColor: 'var(--warning-color)' }}>{t('update_password')}</button>
            <button type="button" onClick={() => { setPasswordUser(null); setNewPassword(''); }} className="btn-secondary">{t('cancel')}</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loader-container">
            <div className="modern-spinner"></div>
            <p>{t('loading')}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ marginTop: 0 }}>
            <thead>
                <tr>
                <th style={{ width: '60px' }}>{t('id')}</th>
                <th>{t('username')}</th>
                <th>{t('full_name')}</th>
                <th>{t('email')}</th>
                <th>{t('role')}</th>
                <th>{t('subrole')}</th>
                <th>{t('status')}</th>
                <th style={{ width: '180px', textAlign: 'right' }}>{t('actions')}</th>
                </tr>
            </thead>
            <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                  <tr key={user.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{user.id}</td>
                      <td style={{ fontWeight: '500' }}>{user.username}</td>
                      <td>{user.full_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                      <td>
                          <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              backgroundColor: (user.role === 'admin' || user.role === 'ADMIN') ? 'var(--warning-light)' : 'var(--secondary-light)', 
                              color: (user.role === 'admin' || user.role === 'ADMIN') ? 'var(--warning-hover)' : 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                          }}>
                              {user.role}
                          </span>
                      </td>
                      <td>{user.subrole || '-'}</td>
                      <td>
                          <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: user.is_active ? 'var(--success-light)' : 'var(--danger-light)',
                              color: user.is_active ? 'var(--success-hover)' : 'var(--danger-hover)'
                          }}>
                              {user.is_active ? t('active') : t('inactive')}
                          </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {/* Toggle Status Button */}
                          <button
                              onClick={() => handleToggleStatus(user)}
                              className="btn-secondary"
                              style={{ padding: '6px', color: user.is_active ? 'var(--danger-color)' : 'var(--success-color)' }}
                              title={user.is_active ? t('deactivate') : t('activate')}
                          >
                              {user.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>

                          <button
                              onClick={() => { setEditingUser(user); setShowCreateForm(false); setPasswordUser(null); }}
                              className="btn-secondary"
                              style={{ padding: '6px', color: 'var(--primary-color)' }}
                              title={t('edit_user')}
                          >
                              <Edit size={16} />
                          </button>
                          <button 
                              onClick={() => { setPasswordUser(user); setShowCreateForm(false); setEditingUser(null); }}
                              className="btn-secondary"
                              style={{ padding: '6px', color: 'var(--warning-color)' }}
                              title={t('change_password')}
                          >
                              <Key size={16} />
                          </button>
                          <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="btn-danger"
                              style={{ padding: '6px' }}
                              title={t('delete')}
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                      </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                      {t('no_results')}
                    </td>
                  </tr>
                )}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
}

export default UserManagement;