import { useState } from 'react'
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
import Importacion from './pages/Importacion'
import Sidebar from './components/Sidebar'
import MainHeader from './components/MainHeader'

function RutaProtegida({ children }) {
  const { usuario } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!usuario) return <Navigate to="/login" />
  return (
    <div className="flex min-h-screen bg-ag-canvas font-barlow text-ag-ink">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-14 transition-[margin] duration-300 lg:ml-[220px] lg:pt-0">
        <MainHeader usuario={usuario} />
        <div className="px-4 pb-10 pt-0 lg:px-8">{children}</div>
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
        <Route path="/importacion" element={<RutaProtegida><Importacion /></RutaProtegida>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
