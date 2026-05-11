import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/unidades', label: 'Unidades' },
    { path: '/conversiones', label: 'Conversiones' },
    { path: '/facturacion', label: 'Facturación' },
    { path: '/postventa', label: 'Post-Venta' },
    { path: '/certificacion', label: 'Certificación' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button for Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 200,
            backgroundColor: '#e30613',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <span style={{
            display: 'block',
            width: '20px',
            height: '2px',
            backgroundColor: '#ffffff',
            borderRadius: '1px'
          }}></span>
          <span style={{
            display: 'block',
            width: '20px',
            height: '2px',
            backgroundColor: '#ffffff',
            borderRadius: '1px'
          }}></span>
          <span style={{
            display: 'block',
            width: '20px',
            height: '2px',
            backgroundColor: '#ffffff',
            borderRadius: '1px'
          }}></span>
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 90
          }}
        />
      )}

      {/* Sidebar */}
      <nav style={{
        position: isMobile ? 'fixed' : 'fixed',
        left: isMobile ? (isOpen ? '0' : '-220px') : '0',
        top: 0,
        width: '220px',
        height: '100vh',
        backgroundColor: '#080808',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: isMobile ? 'left 0.3s ease' : 'none'
      }}>
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          {/* Logo placeholder - replace with actual logo image when available */}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '1.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem'
          }}>
            <span style={{ color: '#ffffff' }}>AUTO</span>
            <span style={{ color: '#e30613' }}>GAS</span>
          </div>
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: '0.65rem',
            color: '#888888',
            textTransform: 'uppercase',
            letterSpacing: '0.15em'
          }}>
            Sistema de Gestión
          </div>
        </div>

        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          margin: '0 1.5rem'
        }} />

        <div style={{ flex: 1, padding: '1.5rem 0' }}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                backgroundColor: isActive(item.path) ? 'rgba(227,6,19,0.08)' : 'transparent',
                borderLeft: isActive(item.path) ? '3px solid #e30613' : '3px solid transparent',
                textAlign: 'left',
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                fontSize: '0.85rem',
                color: isActive(item.path) ? '#ffffff' : '#888888',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRight: 'none',
                borderTop: 'none',
                borderBottom: 'none',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#ffffff';
                e.target.style.backgroundColor = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.color = '#888888';
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.5rem' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '2px',
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e30613';
              e.target.style.borderColor = '#e30613';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

