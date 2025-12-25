import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Database, LayoutDashboard, Users, FilePlus, Upload, Code, LogOut, Menu, X, User } from 'lucide-react';
import { getCurrentUser, getMe } from '../api';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'ADMIN');

  useEffect(() => {
    // Simple and direct: just call /auth/me
    getMe()
      .then(response => {
        setUserDetails(response.data);
      })
      .catch(err => {
        console.error("Failed to fetch user details from /auth/me", err);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }) => (
    <button
      onClick={() => navigate(path)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: isActive(path) ? 'var(--primary-color)' : 'transparent',
        color: isActive(path) ? 'white' : '#64748b',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: '0.95rem',
        fontWeight: isActive(path) ? '600' : '500',
        marginBottom: '8px',
        transition: 'all 0.2s',
        boxShadow: isActive(path) ? '0 4px 6px -1px rgba(99, 102, 241, 0.4)' : 'none'
      }}
    >
      <Icon size={20} />
      {isSidebarOpen && <span>{label}</span>}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div 
        style={{ 
          width: isSidebarOpen ? '280px' : '88px', 
          backgroundColor: 'white', 
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
        }}
      >
        {/* Logo Area */}
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
            padding: '10px', 
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
          }}>
            <Database size={24} color="white" />
          </div>
          {isSidebarOpen && (
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.025em' }}>DPP System</h1>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '0 16px', flex: 1 }}>
          <p style={{ 
            fontSize: '0.75rem', 
            fontWeight: '700', 
            color: '#94a3b8', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            marginBottom: '16px',
            paddingLeft: '16px',
            display: isSidebarOpen ? 'block' : 'none'
          }}>
            Menu
          </p>
          <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem path="/create-dpp" icon={FilePlus} label="New DPP" />
          <NavItem path="/upload-aasx" icon={Upload} label="Upload AASX" />
          <NavItem path="/sparql" icon={Code} label="SPARQL Query" />
          {isAdmin && (
            <>
              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '16px 0' }}></div>
              <p style={{ 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                color: '#94a3b8', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                marginBottom: '16px',
                paddingLeft: '16px',
                display: isSidebarOpen ? 'block' : 'none'
              }}>
                Admin
              </p>
              <NavItem path="/users" icon={Users} label="User Management" />
            </>
          )}
        </div>

        {/* Footer Actions (User Profile + Logout) */}
        <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
            {/* User Profile Section */}
            {userDetails && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '16px',
                    padding: isSidebarOpen ? '12px' : '0',
                    justifyContent: isSidebarOpen ? 'flex-start' : 'center'
                }}>
                    <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: '#e0e7ff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#4f46e5',
                        flexShrink: 0
                    }}>
                        <User size={18} />
                    </div>
                    {isSidebarOpen && (
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontWeight: '600', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {userDetails.full_name || userDetails.username}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                                {userDetails.role} 
                                {/* Check both 'subrole' and 'sub_role' because backend might return either depending on Pydantic model */}
                                {(userDetails.subrole || userDetails.sub_role) ? ` • ${userDetails.subrole || userDetails.sub_role}` : ''}
                            </p>
                        </div>
                    )}
                </div>
            )}

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
        
        {/* Toggle Button */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ 
                position: 'absolute', 
                right: '-14px', 
                top: '42px', 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '50%', 
                width: '28px', 
                height: '28px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                color: '#64748b',
                zIndex: 1001
            }}
        >
            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: isSidebarOpen ? '280px' : '88px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', padding: '40px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;