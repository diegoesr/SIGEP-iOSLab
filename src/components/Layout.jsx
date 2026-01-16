import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'grid' },
    { path: '/inventario', label: 'Inventario', icon: 'box' },
    { path: '/prestamos', label: 'Préstamos', icon: 'handshake' },
    { path: '/usuarios', label: 'Usuarios', icon: 'users' },
    { path: '/reportes', label: 'Reportes', icon: 'chart' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      grid: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      box: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5L10 2L17 5V15L10 18L3 15V5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M3 5L10 8L17 5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 8V18" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      handshake: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 8L3 12L7 16M13 8L17 12L13 16M7 12H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      users: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <circle cx="13" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M3 16C3 13.5 5 12 7 12H13C15 12 17 13.5 17 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      chart: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 16V14M7 16V10M11 16V12M15 16V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      settings: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 3V1M10 19V17M17 10H19M1 10H3M15.657 4.343L17.071 2.929M2.929 17.071L4.343 15.657M15.657 15.657L17.071 17.071M2.929 2.929L4.343 4.343" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    };
    return icons[iconName] || icons.grid;
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <img src="/img/logo.png" alt="LabIOS Logo" className="labios-logo" />
            </div>
            <div>
              <h1>iOS Development Lab</h1>
              <p>Gestión y control de inventario</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{getIcon(item.icon)}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
            <span className="nav-icon">{getIcon('settings')}</span>
            <span className="nav-label">Configuración</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{usuario?.nombre?.charAt(0) || 'A'}</div>
            <div className="user-details">
              <p className="user-name">{usuario?.nombre || 'Usuario Admin'}</p>
              <p className="user-email">{usuario?.email || 'labios@university.edu'}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-actions">
            <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M13 3H16C17.105 3 18 3.895 18 5V15C18 16.105 17.105 17 16 17H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7 15L3 10L7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </header>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
