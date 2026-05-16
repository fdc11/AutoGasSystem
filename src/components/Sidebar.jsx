import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/AutoGasLogo.png'

/* ─── Icon Components ─────────────────────────────────────────────────────── */

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

function IconUpload({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5V18" />
    </svg>
  )
}

const ICONS = {
  '/dashboard':    IconDashboard,
  '/unidades':     IconCar,
  '/conversiones': IconRefresh,
  '/facturacion':  IconInvoice,
  '/postventa':    IconSupport,
  '/certificacion':IconBadge,
  '/importacion':  IconUpload,
}

/* ─── Inline CSS for staggered animation (Tailwind can't handle dynamic delay) */
const OVERLAY_STYLES = `
  .mnav-overlay {
    opacity: 0;
    transition: opacity 0.3s ease-out;
  }
  .mnav-overlay.is-open {
    opacity: 1;
  }
  .mnav-item {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.32s ease-out, transform 0.32s ease-out;
  }
  .mnav-item.visible {
    opacity: 1;
    transform: translateY(0);
  }
`

/* ─── Menu items ──────────────────────────────────────────────────────────── */
const MENU_ITEMS = [
  { path: '/dashboard',    label: 'Dashboard' },
  { path: '/unidades',     label: 'Unidades' },
  { path: '/conversiones', label: 'Conversiones' },
  { path: '/facturacion',  label: 'Facturación' },
  { path: '/postventa',    label: 'Post-Venta' },
  { path: '/certificacion',label: 'Certificación' },
  { path: '/importacion',  label: 'Importar Excel' },
]

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function Sidebar({ isOpen, setIsOpen }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { logout } = useAuth()

  const [isMobile,        setIsMobile]        = useState(false)
  const [overlayVisible,  setOverlayVisible]  = useState(false) // tracks CSS open class
  const [visibleItems,    setVisibleItems]     = useState([])   // indices with .visible

  /* ── Detect mobile ────────────────────────────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Overlay open/close orchestration ────────────────────────────────── */
  useEffect(() => {
    if (!isMobile) return

    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden'

      // Trigger overlay fade-in on next frame
      requestAnimationFrame(() => setOverlayVisible(true))

      // Stagger menu items: 60 ms per index, starting after 120 ms
      const timers = MENU_ITEMS.map((_, i) =>
        setTimeout(() => {
          setVisibleItems(prev => [...prev, i])
        }, 120 + i * 60)
      )

      return () => timers.forEach(clearTimeout)
    } else {
      // Close: reset immediately
      document.body.style.overflow = ''
      setOverlayVisible(false)
      setVisibleItems([])
    }
  }, [isOpen, isMobile])

  /* ── Escape key ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isMobile) return
    const onKey = (e) => { if (e.key === 'Escape' && isOpen) setIsOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, isMobile, setIsOpen])

  /* ── Cleanup body overflow on unmount ────────────────────────────────── */
  useEffect(() => {
    return () => { document.body.style.overflow = '' }
  }, [])

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(path))

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    }
  }

  const handleNavigate = (path) => {
    navigate(path)
    if (isMobile) setIsOpen(false)
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Inject animation styles once */}
      <style>{OVERLAY_STYLES}</style>

      {/* ── MOBILE: hamburger / close button (fixed, always on top) ──────── */}
      {isMobile && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed left-4 top-4 z-[200] flex items-center justify-center rounded-xl bg-ag-red shadow-card-md ring-2 ring-white/10"
          style={{ width: 44, height: 44 }}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isOpen ? (
            /* × close icon */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          ) : (
            /* ☰ hamburger icon */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="4" y1="7"  x2="20" y2="7"  />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
      )}

      {/* ── MOBILE: fullscreen overlay ────────────────────────────────────── */}
      {isMobile && isOpen && (
        <div
          className={`mnav-overlay fixed inset-0 z-[150] flex flex-col bg-ag-black overflow-y-auto${overlayVisible ? ' is-open' : ''}`}
          style={{ height: '100dvh' }}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          {/* Logo at top */}
          <div className="flex shrink-0 items-center justify-center px-8 pb-6 pt-16">
            <img
              src={logo}
              alt="AutoGas"
              className="h-auto w-full max-w-[140px] object-contain opacity-90"
            />
          </div>

          {/* Divider */}
          <div className="mx-8 h-px shrink-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Nav items — flex-1 so it grows and centers if there's space */}
          <nav className="flex flex-1 flex-col justify-center gap-1 px-8 py-10">
            {MENU_ITEMS.map((item, i) => {
              const Icon   = ICONS[item.path] || IconDashboard
              const active = isActive(item.path)
              const num    = String(i + 1).padStart(2, '0')

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className={`mnav-item group flex w-full flex-col items-start py-3 text-left transition-colors${
                    visibleItems.includes(i) ? ' visible' : ''
                  }`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  {/* Item number */}
                  <span
                    className="mb-0.5 font-barlow-condensed text-xs font-semibold tracking-widest"
                    style={{ color: '#e30613', fontSize: '0.65rem' }}
                  >
                    {num}
                  </span>

                  {/* Item label + icon */}
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`shrink-0 transition-colors ${
                        active ? 'text-ag-red' : 'text-white/40 group-hover:text-ag-red'
                      }`}
                    />
                    <span
                      className={`font-barlow-condensed text-5xl font-bold uppercase leading-none tracking-tight transition-colors ${
                        active
                          ? 'text-ag-red'
                          : 'text-white group-hover:text-ag-red'
                      }`}
                    >
                      {item.label}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Logout button at bottom — always visible thanks to overflow-y-auto */}
          <div className="px-8 pb-12 pt-2" style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl bg-ag-red py-4 font-barlow-condensed text-base font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 active:opacity-80"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* ── DESKTOP: fixed sidebar (lg: — unchanged) ──────────────────────── */}
      <nav
        className="fixed left-0 top-0 z-[100] hidden h-screen w-[220px] flex-col border-r border-white/[0.06] bg-ag-black shadow-none lg:flex"
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
          {MENU_ITEMS.map((item) => {
            const active = isActive(item.path)
            const Icon   = ICONS[item.path] || IconDashboard
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
