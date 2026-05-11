import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/AutoGasLogo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen font-barlow">
      {/* Left — branding (hidden on mobile) */}
      <div className="relative hidden flex-col items-center justify-center bg-ag-black px-8 lg:flex lg:w-[45%]">
        <div className="flex max-w-md flex-col items-center text-center">
          <img
            src={logo}
            alt="AutoGas"
            className="h-auto w-full max-w-[min(80%,280px)] object-contain"
          />
          <p className="mt-10 max-w-sm font-barlow text-lg font-normal leading-relaxed tracking-wide text-white">
            Convierte. Gestiona. Domina.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex w-full flex-col bg-white lg:w-[55%] lg:bg-ag-canvas">
        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-md rounded-lg border border-neutral-200/80 bg-white p-8 shadow-card sm:p-10">
            <div className="mb-8 flex justify-center lg:hidden">
              <img src={logo} alt="AutoGas" className="h-auto w-44 object-contain" />
            </div>

            <div className="mb-8">
              <h1 className="font-barlow-condensed text-2xl font-bold uppercase tracking-wide text-ag-ink sm:text-[1.75rem]">
                Iniciar sesión
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Correo
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@autogas.pe"
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-[0.95rem] text-ag-ink placeholder:text-neutral-400 focus:border-ag-red focus:outline-none focus:ring-1 focus:ring-ag-red"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-[0.95rem] text-ag-ink placeholder:text-neutral-400 focus:border-ag-red focus:outline-none focus:ring-1 focus:ring-ag-red"
                />
              </div>

              {error && (
                <p className="text-center text-sm text-ag-red" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-ag-red py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-ag-red-dark disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-auto border-t border-neutral-200/60 bg-white px-6 py-5 text-center text-xs text-neutral-400 lg:bg-ag-canvas lg:px-16 lg:py-6">
          © {new Date().getFullYear()} AutoGas Perú
        </footer>
      </div>
    </div>
  )
}
