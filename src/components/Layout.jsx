import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Database, LayoutDashboard, Users, FilePlus, Upload, Code, LogOut, Menu, X, User, Settings, Globe } from 'lucide-react';
import { getCurrentUser, getMe } from '../services/api'; // Updated import
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userDetails, setUserDetails] = useState(null);
  const { t, i18n } = useTranslation();
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'ADMIN');
  const isViewer = currentUser && (currentUser.role === 'viewer' || currentUser.role === 'VIEWER');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    
    getMe()
      .then(response => {
        setUserDetails(response.data);
      })
      .catch(err => {
        console.error("Failed to fetch user details from /auth/me", err);
      });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'el' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }) => (
    <button
      onClick={() => {
        navigate(path);
        if (isMobile) setIsSidebarOpen(false);
      }}
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
        boxShadow: isActive(path) ? '0 4px 6px -1px rgba(0, 68, 148, 0.4)' : 'none'
      }}
    >
      <Icon size={20} />
      {(isSidebarOpen || isMobile) && <span>{label}</span>}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Mobile Header */}
      {isMobile && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, height: '60px', 
          backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', 
          display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 1000,
          justifyContent: 'space-between'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--primary-color)', padding: '6px', borderRadius: '8px' }}>
                <Database size={20} color="white" />
              </div>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>{t('dpp_system')}</span>
           </div>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', padding: 0, color: '#64748b' }}>
             {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001 }}
        />
      )}

      {/* Sidebar */}
      <div 
        style={{ 
          width: isSidebarOpen ? '280px' : '88px', 
          backgroundColor: 'white', 
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease-in-out, width 0.3s ease-in-out',
          position: 'fixed',
          height: '100vh',
          zIndex: 1002,
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
          transform: isMobile ? (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          top: 0, left: 0
        }}
      >
        {/* Desktop Logo Area */}
        {!isMobile && (
          <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)', 
              padding: '10px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 68, 148, 0.2)'
            }}>
              <Database size={24} color="white" />
            </div>
            {isSidebarOpen && (
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.025em' }}>{t('dpp_system')}</h1>
            )}
          </div>
        )}

        {/* Mobile Sidebar Header */}
        {isMobile && (
           <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{t('menu')}</span>
              <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', padding: 0 }}>
                <X size={20} />
              </button>
           </div>
        )}

        {/* Navigation */}
        <div style={{ padding: '0 16px', flex: 1, marginTop: isMobile ? '0' : '0' }}>
          <p style={{ 
            fontSize: '0.75rem', 
            fontWeight: '700', 
            color: '#94a3b8', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            marginBottom: '16px',
            paddingLeft: '16px',
            display: (isSidebarOpen || isMobile) ? 'block' : 'none'
          }}>
            {t('menu')}
          </p>
          <NavItem path="/dashboard" icon={LayoutDashboard} label={t('dashboard')} />
          
          {!isViewer && (
            <>
              <NavItem path="/create-dpp" icon={FilePlus} label={t('new_dpp')} />
              <NavItem path="/upload-aasx" icon={Upload} label={t('upload_aasx')} />
            </>
          )}
          
          <NavItem path="/sparql" icon={Code} label={t('sparql_query')} />
          
          <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '16px 0' }}></div>
          <p style={{ 
            fontSize: '0.75rem', 
            fontWeight: '700', 
            color: '#94a3b8', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            marginBottom: '16px',
            paddingLeft: '16px',
            display: (isSidebarOpen || isMobile) ? 'block' : 'none'
          }}>
            {t('account')}
          </p>
          <NavItem path="/profile" icon={Settings} label={t('my_profile')} />

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
                display: (isSidebarOpen || isMobile) ? 'block' : 'none'
              }}>
                {t('admin')}
              </p>
              <NavItem path="/users" icon={Users} label={t('user_management')} />
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    justifyContent: (isSidebarOpen || isMobile) ? 'flex-start' : 'center',
                    fontWeight: '600',
                    marginBottom: '12px',
                    transition: 'all 0.2s'
                }}
            >
                <Globe size={20} />
                {(isSidebarOpen || isMobile) && <span>{i18n.language === 'en' ? 'Ελληνικά' : 'English'}</span>}
            </button>

            {userDetails && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '16px',
                    padding: (isSidebarOpen || isMobile) ? '12px' : '0',
                    justifyContent: (isSidebarOpen || isMobile) ? 'flex-start' : 'center'
                }}>
                    <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary-light)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary-color)',
                        flexShrink: 0
                    }}>
                        <User size={18} />
                    </div>
                    {(isSidebarOpen || isMobile) && (
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontWeight: '600', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {userDetails.full_name || userDetails.username}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                                {userDetails.role} 
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
              justifyContent: (isSidebarOpen || isMobile) ? 'flex-start' : 'center',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={20} />
            {(isSidebarOpen || isMobile) && <span>{t('logout')}</span>}
          </button>
        </div>
        
        {/* Desktop Toggle Button */}
        {!isMobile && (
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
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ 
          flex: 1, 
          marginLeft: isMobile ? '0' : (isSidebarOpen ? '280px' : '88px'), 
          marginTop: isMobile ? '60px' : '0',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          padding: isMobile ? '20px' : '40px',
          width: '100%' /* Ensure it takes full width */
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;