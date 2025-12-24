import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, deleteUser, getUsers, updateUser, updatePassword } from '../api'; // Import helpers
import { ArrowLeft, UserPlus, Trash2, Edit, Key } from 'lucide-react';

function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal/Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // For Update User
  const [passwordUser, setPasswordUser] = useState(null); // For Update Password

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

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(Array.isArray(response.data) ? response.data : []);
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
      await createUser(newUser);
      alert("User created successfully!");
      setShowCreateForm(false);
      setNewUser({ username: '', email: '', password: '', full_name: '', role: 'USER', subrole: 'CONSUMER' });
      fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Failed to create user: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      let msg = err.response?.data?.detail || err.message;
      if (err.response?.status === 500) {
          msg = "Server error. This user might own data (DPPs) that prevents deletion.";
      }
      alert("Failed to delete user: " + msg);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      // Prepare update payload (exclude password, id, etc. if not needed)
      // The backend expects UserUpdate schema.
      const payload = {
        email: editingUser.email,
        full_name: editingUser.full_name,
        role: editingUser.role.toLowerCase(),
        subrole: editingUser.subrole ? editingUser.subrole.toLowerCase() : null
      };
      
      await updateUser(editingUser.id, payload);
      alert("User updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await updatePassword(passwordUser.id, newPassword);
      alert("Password updated successfully!");
      setPasswordUser(null);
      setNewPassword('');
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Failed to update password: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleChangeNewUser = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleChangeEditUser = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>User Management</h1>
        <button 
          onClick={() => { setShowCreateForm(!showCreateForm); setEditingUser(null); setPasswordUser(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <UserPlus size={16} /> {showCreateForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* CREATE FORM */}
      {showCreateForm && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #dee2e6' }}>
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Username *</label>
              <input type="text" name="username" value={newUser.username} onChange={handleChangeNewUser} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email *</label>
              <input type="email" name="email" value={newUser.email} onChange={handleChangeNewUser} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Full Name *</label>
              <input type="text" name="full_name" value={newUser.full_name} onChange={handleChangeNewUser} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Password *</label>
              <input type="password" name="password" value={newUser.password} onChange={handleChangeNewUser} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
              <select name="role" value={newUser.role} onChange={handleChangeNewUser} style={{ width: '100%', padding: '8px' }}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Sub-Role</label>
              <select name="subrole" value={newUser.subrole} onChange={handleChangeNewUser} style={{ width: '100%', padding: '8px' }}>
                {subroles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create User</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT USER FORM */}
      {editingUser && (
        <div style={{ backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ced4da' }}>
          <h3>Edit User: {editingUser.username}</h3>
          <form onSubmit={handleUpdateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
              <input type="email" name="email" value={editingUser.email} onChange={handleChangeEditUser} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
              <input type="text" name="full_name" value={editingUser.full_name} onChange={handleChangeEditUser} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
              <select name="role" value={editingUser.role ? editingUser.role.toUpperCase() : 'USER'} onChange={handleChangeEditUser} style={{ width: '100%', padding: '8px' }}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Sub-Role</label>
              <select name="subrole" value={editingUser.subrole ? editingUser.subrole.toUpperCase() : 'CONSUMER'} onChange={handleChangeEditUser} style={{ width: '100%', padding: '8px' }}>
                {subroles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
              <button type="button" onClick={() => setEditingUser(null)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* CHANGE PASSWORD FORM */}
      {passwordUser && (
        <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ffeeba' }}>
          <h3>Change Password for: {passwordUser.username}</h3>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Update Password</button>
            <button type="button" onClick={() => { setPasswordUser(null); setNewPassword(''); }} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          </form>
        </div>
      )}

      {loading ? <p>Loading users...</p> : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th>ID</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Sub-Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: user.role === 'admin' || user.role === 'ADMIN' ? '#ffc107' : '#e2e3e5', fontSize: '12px' }}>
                        {user.role}
                    </span>
                </td>
                <td>{user.subrole || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => { setEditingUser(user); setShowCreateForm(false); setPasswordUser(null); }}
                        style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Edit User"
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        onClick={() => { setPasswordUser(user); setShowCreateForm(false); setEditingUser(null); }}
                        style={{ color: '#ffc107', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Change Password"
                    >
                        <Key size={16} />
                    </button>
                    <button 
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Delete User"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserManagement;