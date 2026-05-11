import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
    } catch (err) {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'Barlow, sans-serif'
    }}>
      {/* Left Panel - Black with Logo and Slogan */}
      <div style={{
        width: '45%',
        backgroundColor: '#080808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        '@media (max-width: 768px)': {
          display: 'none'
        }
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '4rem',
            fontWeight: 900,
            letterSpacing: '0.05em',
            color: '#ffffff',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: '3rem'
          }}>
            AUTO<span style={{ color: '#e30613' }}>GAS</span>
          </h1>
          <p style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#888888',
            textTransform: 'uppercase',
            lineHeight: 1.4
          }}>
            Convierte. Gestiona. Domina.
          </p>
        </div>
      </div>

      {/* Right Panel - White/Gray with Form */}
      <div style={{
        width: '55%',
        backgroundColor: '#f4f7f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        '@media (max-width: 768px)': {
          width: '100%'
        }
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: '4px',
          padding: '3rem 2.5rem',
          width: '100%',
          maxWidth: '420px'
        }}>
          {/* Mobile Logo - Only visible on small screens */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            display: 'none',
            '@media (max-width: 768px)': {
              display: 'block'
            }
          }}>
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 900,
              letterSpacing: '0.05em',
              color: '#1a1a1a',
              textTransform: 'uppercase',
              lineHeight: 1
            }}>
              AUTO<span style={{ color: '#e30613' }}>GAS</span>
            </h1>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 0.5rem 0'
            }}>
              Iniciar Sesión
            </h2>
            <p style={{
              color: '#666666',
              fontSize: '0.85rem',
              letterSpacing: '0.05em'
            }}>
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '600',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#666666',
                marginBottom: '0.5rem'
              }}>
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@autogas.pe"
                required
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '2px',
                  padding: '0.75rem 1rem',
                  color: '#1a1a1a',
                  fontSize: '0.95rem',
                  fontFamily: 'Barlow, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#e30613'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '600',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#666666',
                marginBottom: '0.5rem'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '2px',
                  padding: '0.75rem 1rem',
                  color: '#1a1a1a',
                  fontSize: '0.95rem',
                  fontFamily: 'Barlow, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#e30613'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {error && (
              <p style={{
                color: '#e30613',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#cccccc' : '#e30613',
                color: '#ffffff',
                border: 'none',
                borderRadius: '2px',
                padding: '0.85rem',
                fontSize: '0.85rem',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: '600',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => { if (!loading) e.target.style.backgroundColor = '#a80310' }}
              onMouseLeave={e => { if (!loading) e.target.style.backgroundColor = '#e30613' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            color: '#999999',
            fontSize: '0.75rem',
            marginTop: '2rem',
            letterSpacing: '0.05em'
          }}>
            © 2026 AutoGas Perú
          </p>
        </div>
      </div>
    </div>
  )
}

