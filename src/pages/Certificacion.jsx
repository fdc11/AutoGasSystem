import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

const CERTIFICADORAS = ['BUREAU VERITAS', 'VERITAS PERU', 'MOTORGAS', 'OTANOR', 'N.E']
const CONDICION_FOLIO = ['EMITIDO', 'PENDIENTE', 'FICTICIOS']
const MESES = [
  { val: 0, label: 'ENERO' }, { val: 1, label: 'FEBRERO' }, { val: 2, label: 'MARZO' },
  { val: 3, label: 'ABRIL' }, { val: 4, label: 'MAYO' }, { val: 5, label: 'JUNIO' },
  { val: 6, label: 'JULIO' }, { val: 7, label: 'AGOSTO' }, { val: 8, label: 'SEPTIEMBRE' },
  { val: 9, label: 'OCTUBRE' }, { val: 10, label: 'NOVIEMBRE' }, { val: 11, label: 'DICIEMBRE' }
]

export default function Certificacion() {
  const navigate = useNavigate()
  const [unidades, setUnidades] = useState([])
  const [filtros, setFiltros] = useState({ certificadora: '', condicion: '', mes: '' })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const conCert = docs.filter(d => d.certificacion && (d.certificacion.certificadora || d.certificacion.condicion))
      conCert.sort((a, b) => new Date(b.certificacion.fechaEmision || 0) - new Date(a.certificacion.fechaEmision || 0))
      setUnidades(conCert)
    })
    return () => unsub()
  }, [])

  const filtered = unidades.filter(u => {
    if (filtros.certificadora && u.certificacion.certificadora !== filtros.certificadora) return false
    if (filtros.condicion && u.certificacion.condicion !== filtros.condicion) return false
    if (filtros.mes !== '') {
      if (!u.certificacion.fechaEmision) return false
      const [, m] = u.certificacion.fechaEmision.split('-')
      if ((parseInt(m, 10) - 1).toString() !== filtros.mes) return false
    }
    return true
  })

  const renderBadge = (condicion) => {
    let bg = 'rgba(255,255,255,0.1)'
    let color = '#ffffff'
    
    if (condicion === 'EMITIDO') {
      bg = 'rgba(34,197,94,0.15)'
      color = '#22c55e'
    } else if (condicion === 'PENDIENTE') {
      bg = 'rgba(245,158,11,0.15)'
      color = '#f59e0b'
    } else if (condicion === 'FICTICIOS') {
      bg = 'rgba(59,130,246,0.15)'
      color = '#3b82f6'
    }

    return (
      <span style={{ backgroundColor: bg, color: color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
        {condicion || '-'}
      </span>
    )
  }

  const inputStyle = { padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '2px', color: '#1a1a1a', fontFamily: 'Barlow, sans-serif', fontSize: '0.85rem', outline: 'none' }

  return (
    <div style={{ fontFamily: 'Barlow, sans-serif' }}>
      <div className="conversiones-header">
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a1a1a', margin: 0 }}>
            CERTIFICACIÓN
          </h1>
          <div style={{ marginTop: '0.5rem', height: '4px', width: '3.5rem', borderRadius: '9999px', backgroundColor: '#e30613' }} aria-hidden />
        </div>
      </div>

      {/* Filtros */}
      <div className="conversiones-filtros">
        <select value={filtros.certificadora} onChange={(e) => setFiltros({ ...filtros, certificadora: e.target.value })}>
          <option value="">TODAS LAS CERTIFICADORAS</option>
          {CERTIFICADORAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtros.condicion} onChange={(e) => setFiltros({ ...filtros, condicion: e.target.value })}>
          <option value="">TODAS LAS CONDICIONES</option>
          {CONDICION_FOLIO.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtros.mes} onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}>
          <option value="">TODOS LOS MESES</option>
          {MESES.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="conversiones-tabla-wrapper">
        <table>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              {['VIN', 'Marca', 'Modelo', 'Sede', 'Certificadora', 'N° Folio', 'Condición', 'Fecha Emisión', 'Acciones'].map(col => (
                <th key={col} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666666', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.vin}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.marca}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.modelo}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.sede}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.certificacion.certificadora || '-'}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.certificacion.folio || '-'}</td>
                <td style={{ padding: '0.875rem 1rem' }}>{renderBadge(u.certificacion.condicion)}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.certificacion.fechaEmision || '-'}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <button onClick={() => navigate(`/unidades/${u.vin}`)} style={{ backgroundColor: 'transparent', border: '1px solid #e0e0e0', color: '#1a1a1a', padding: '0.25rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', minHeight: '36px' }}>
                    VER
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#666666' }}>
                  No hay certificaciones con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
