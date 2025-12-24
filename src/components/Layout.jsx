import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Database, LayoutDashboard, Users, FilePlus, Upload, Code, LogOut, Menu, X } from 'lucide-react';
import { getCurrentUser } from '../api';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'ADMIN');

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
        backgroundColor: isActive(path) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
        color: isActive(path) ? '#4f46e5' : '#4b5563',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: '0.95rem',
        fontWeight: isActive(path) ? '600' : '500',
        marginBottom: '4px',
        transition: 'all 0.2s'
      }}
    >
      <Icon size={20} />
      {isSidebarOpen && <span>{label}</span>}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <div 
        style={{ 
          width: isSidebarOpen ? '260px' : '80px', 
          backgroundColor: 'white', 
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000
        }}
      >
        {/* Logo Area */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f3f4f6' }}>
          <Database className="text-indigo-600" size={32} color="#4f46e5" />
          {isSidebarOpen && (
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>DPP System</h1>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '24px 16px', flex: 1 }}>
          <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem path="/create-dpp" icon={FilePlus} label="New DPP" />
          <NavItem path="/upload-aasx" icon={Upload} label="Upload AASX" />
          <NavItem path="/sparql" icon={Code} label="SPARQL Query" />
          {isAdmin && <NavItem path="/users" icon={Users} label="User Management" />}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
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
              borderRadius: '8px',
              cursor: 'pointer',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center'
            }}
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
                right: '-12px', 
                top: '30px', 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
        >
            {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: isSidebarOpen ? '260px' : '80px', transition: 'margin-left 0.3s ease', padding: '32px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;