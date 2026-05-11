import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/AutoGasLogo.png'

function IconEye({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const code = err?.code
      if (import.meta.env.DEV) {
        console.error('[login] Firebase:', code, err?.message)
      }
      switch (code) {
        case 'auth/invalid-email':
          setError('El correo no tiene un formato válido.')
          break
        case 'auth/user-disabled':
          setError('Esta cuenta está deshabilitada. Contacte al administrador.')
          break
        case 'auth/too-many-requests':
          setError('Demasiados intentos fallidos. Espere unos minutos e intente de nuevo.')
          break
        case 'auth/network-request-failed':
          setError('Sin conexión. Compruebe su internet e intente de nuevo.')
          break
        case 'auth/operation-not-allowed':
          setError(
            'Correo/contraseña no permitido: en Firebase Console → Authentication → Sign-in method, active "Correo electrónico/contraseña".'
          )
          break
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError(
            'Correo o contraseña incorrectos, o el usuario no existe en el proyecto Firebase de esta aplicación. En Firebase Console → Authentication, verifique el usuario y el proveedor Correo/contraseña.'
          )
          break
        default:
          setError(
            code
              ? `No se pudo iniciar sesión (${code}). Abra la consola del navegador (F12) para más detalle.`
              : 'No se pudo iniciar sesión. Compruebe su conexión e intente de nuevo.'
          )
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.95rem] text-ag-ink placeholder:text-neutral-400 transition-shadow focus:border-ag-red focus:outline-none focus:ring-2 focus:ring-ag-red/25'

  return (
    <div className="login-page flex min-h-[100dvh] font-barlow text-ag-ink">
      {/* Branding — desktop */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-ag-black via-[#0a0a0a] to-[#111] px-8 lg:flex lg:w-[45%]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden>
          <div className="absolute -left-1/4 top-0 h-[120%] w-1/2 skew-x-12 bg-white" />
        </div>
        <div className="relative flex max-w-md flex-col items-center text-center">
          <img
            src={logo}
            alt="AutoGas"
            className="h-auto w-full max-w-[min(80%,280px)] object-contain drop-shadow-lg"
          />
          <div className="mt-2 h-1 w-14 rounded-full bg-ag-red" aria-hidden />
          <p className="mt-8 font-barlow-condensed text-2xl font-bold uppercase leading-tight tracking-[0.12em] text-white sm:text-3xl">
            Convierte.
            <span className="text-ag-red"> Gestiona.</span>
            <br />
            Domina.
          </p>
          <p className="mt-6 max-w-xs text-sm font-normal leading-relaxed text-neutral-400">
            Acceso al sistema interno de operaciones AutoGas Perú.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex w-full flex-col bg-ag-canvas lg:w-[55%]">
        <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-14">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200/90 bg-white p-7 shadow-card-md ring-1 ring-black/[0.03] sm:p-9">
            <div className="mb-7 flex justify-center lg:hidden">
              <img src={logo} alt="AutoGas" className="h-auto w-40 object-contain" />
            </div>

            <div className="mb-8">
              <p className="font-barlow-condensed text-xs font-bold uppercase tracking-[0.25em] text-ag-red">
                AutoGas Sistema
              </p>
              <h1 className="mt-2 font-barlow-condensed text-3xl font-black uppercase tracking-tight text-ag-ink sm:text-[2rem]">
                Iniciar sesión
              </h1>
              <div className="mt-3 h-0.5 w-12 rounded-full bg-ag-red" aria-hidden />
              <p className="mt-4 text-sm leading-relaxed text-neutral-500">
                Ingresa tus credenciales para acceder al panel de gestión.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Correo
                </label>
                <input
                  id="login-email"
                  name="login-email-field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  inputMode="email"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="login-password-field"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="off"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ag-ink"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <IconEyeOff className="shrink-0" /> : <IconEye className="shrink-0" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-red-100 bg-red-50/90 px-3 py-2.5 text-center text-sm leading-snug text-ag-red" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-ag-red py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-card transition-all hover:bg-ag-red-dark hover:shadow-card-md disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
              >
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-auto border-t border-neutral-200/80 bg-white/80 px-5 py-4 text-center text-xs text-neutral-400 backdrop-blur-sm sm:px-8 lg:bg-ag-canvas/90 lg:px-14 lg:py-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
          © {new Date().getFullYear()} AutoGas Perú
        </footer>
      </div>
    </div>
  )
}
