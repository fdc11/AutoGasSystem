import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Unidades from './pages/Unidades'
import FichaUnidad from './pages/FichaUnidad'
import Conversiones from './pages/Conversiones'
import Facturacion from './pages/Facturacion'
import PostVenta from './pages/PostVenta'
import Certificacion from './pages/Certificacion'
import Navbar from './components/Navbar'

function Header({ usuario, isMobile }) {
  const [dateTime, setDateTime] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const dateStr = now.toLocaleDateString('es-ES', options)
      const timeStr = now.toLocaleTimeString('es-ES', { hour12: false })
      setDateTime(`${dateStr} — ${timeStr}`)
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const getInitials = (email) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '1rem' : '1rem 2rem',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      marginBottom: '2rem',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '1rem' : '0'
    }}>
      <div style={{
        fontFamily: 'Barlow, sans-serif',
        fontSize: isMobile ? '0.75rem' : '0.9rem',
        color: '#1a1a1a',
        letterSpacing: '0.05em',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        {dateTime}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{
          fontFamily: 'Barlow, sans-serif',
          fontSize: isMobile ? '0.85rem' : '0.9rem',
          color: '#1a1a1a',
          fontWeight: '600'
        }}>
          Bienvenido, {usuario?.email?.split('@')[0] || 'Usuario'}
        </span>
        <div style={{
          width: isMobile ? '35px' : '40px',
          height: isMobile ? '35px' : '40px',
          borderRadius: '50%',
          backgroundColor: '#e30613',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: isMobile ? '1rem' : '1.2rem',
          fontWeight: '700'
        }}>
          {getInitials(usuario?.email)}
        </div>
      </div>
    </div>
  )
}

function RutaProtegida({ children }) {
  const { usuario } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!usuario) return <Navigate to="/login" />
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
      <Navbar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        marginLeft: '220px',
        transition: 'margin-left 0.3s ease'
      }}>
        <Header usuario={usuario} />
        <div style={{ padding: '0 2rem 2rem 2rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

function App() {
  const { usuario } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={usuario ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/unidades" element={<RutaProtegida><Unidades /></RutaProtegida>} />
        <Route path="/unidades/:vin" element={<RutaProtegida><FichaUnidad /></RutaProtegida>} />
        <Route path="/conversiones" element={<RutaProtegida><Conversiones /></RutaProtegida>} />
        <Route path="/facturacion" element={<RutaProtegida><Facturacion /></RutaProtegida>} />
        <Route path="/postventa" element={<RutaProtegida><PostVenta /></RutaProtegida>} />
        <Route path="/certificacion" element={<RutaProtegida><Certificacion /></RutaProtegida>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App