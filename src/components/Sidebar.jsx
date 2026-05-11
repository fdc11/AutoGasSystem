import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/AutoGasLogo.png'

function IconDashboard({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function IconCar({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}

function IconRefresh({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

function IconInvoice({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function IconSupport({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconBadge({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
}

const ICONS = {
  '/dashboard': IconDashboard,
  '/unidades': IconCar,
  '/conversiones': IconRefresh,
  '/facturacion': IconInvoice,
  '/postventa': IconSupport,
  '/certificacion': IconBadge,
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/unidades', label: 'Unidades' },
    { path: '/conversiones', label: 'Conversiones' },
    { path: '/facturacion', label: 'Facturación' },
    { path: '/postventa', label: 'Post-Venta' },
    { path: '/certificacion', label: 'Certificación' },
  ]

  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleNavigate = (path) => {
    navigate(path)
    if (isMobile) setIsOpen(false)
  }

  return (
    <>
      {isMobile && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed left-4 top-4 z-[200] flex flex-col gap-1 rounded-xl bg-ag-red px-3 py-2.5 shadow-card-md ring-2 ring-white/10"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span className="block h-0.5 w-5 rounded-sm bg-white" />
          <span className="block h-0.5 w-5 rounded-sm bg-white" />
          <span className="block h-0.5 w-5 rounded-sm bg-white" />
        </button>
      )}

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/50"
          aria-hidden
          onClick={() => setIsOpen(false)}
          role="presentation"
        />
      )}

      <nav
        className={`fixed left-0 top-0 z-[100] flex h-screen w-[220px] flex-col border-r border-white/[0.06] bg-ag-black shadow-2xl shadow-black/40 transition-[left] duration-300 ease-out lg:left-0 lg:shadow-none ${
          isMobile ? (isOpen ? 'left-0' : '-left-[220px]') : ''
        }`}
        aria-label="Navegación principal"
      >
        <div className="px-6 pb-5 pt-9">
          <img
            src={logo}
            alt="AutoGas"
            className="mx-auto h-auto w-full max-w-[152px] object-contain opacity-[0.98]"
          />
        </div>

        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            const Icon = ICONS[item.path] || IconDashboard
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={`flex w-full items-center gap-3 border-l-[3px] py-3.5 pl-5 pr-4 text-left font-barlow text-[0.8125rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? 'border-ag-red bg-ag-red/[0.12] text-white'
                    : 'border-transparent text-ag-gray hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Icon className={`shrink-0 ${active ? 'text-ag-red' : 'text-current'}`} />
                <span className="min-w-0 truncate">{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-6 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] py-3 font-barlow text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-ag-red hover:bg-ag-red"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </>
  )
}
