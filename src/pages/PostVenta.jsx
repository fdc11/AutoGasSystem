import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

const SEDES = ['ICA', 'HUANCAYO', 'LIMA', 'NAZCA', 'CHINCHA', 'TRUJILLO', 'AYACUCHO']

export default function PostVenta() {
  const [unidades, setUnidades] = useState([])
  const [filtros, setFiltros] = useState({ sede: '', estado: '' })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Filtrar unidades que tienen postventa con alguna fecha
      const conPostVenta = docs.filter(d => d.postVenta && (d.postVenta.fechaChip || d.postVenta.fechaPrimerAnual || d.postVenta.fechaGarantia))
      setUnidades(conPostVenta)
    })
    return () => unsub()
  }, [])

  const getEstadoAlerta = (fechaPrimerAnual) => {
    if (!fechaPrimerAnual) return 'SIN FECHA'
    const hoy = new Date()
    const fAnual = new Date(fechaPrimerAnual)
    const diffDays = (fAnual - hoy) / (1000 * 60 * 60 * 24)
    if (diffDays < 0) return 'VENCIDO'
    if (diffDays <= 30) return 'POR VENCER'
    return 'AL DÍA'
  }

  const filtered = unidades.filter(u => {
    if (filtros.sede && u.sede !== filtros.sede) return false
    if (filtros.estado) {
      const estado = getEstadoAlerta(u.postVenta.fechaPrimerAnual)
      if (estado !== filtros.estado) return false
    }
    return true
  })

  const renderBadge = (estado) => {
    let bg = 'rgba(255,255,255,0.1)'
    let color = '#ffffff'
    
    if (estado === 'AL DÍA') {
      bg = 'rgba(34,197,94,0.15)'
      color = '#22c55e'
    } else if (estado === 'POR VENCER') {
      bg = 'rgba(245,158,11,0.15)'
      color = '#f59e0b'
    } else if (estado === 'VENCIDO') {
      bg = 'rgba(227,6,19,0.15)'
      color = '#e30613'
    } else if (estado === 'SIN FECHA') {
      bg = 'rgba(255,255,255,0.05)'
      color = '#888888'
    }

    return (
      <span style={{ backgroundColor: bg, color: color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
        {estado}
      </span>
    )
  }

  const inputStyle = { padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '2px', color: '#1a1a1a', fontFamily: 'Barlow, sans-serif', fontSize: '0.85rem', outline: 'none' }

  return (
    <div style={{ fontFamily: 'Barlow, sans-serif' }}>
      <div className="conversiones-header">
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a1a1a', margin: 0 }}>
            POST-VENTA
          </h1>
          <div style={{ marginTop: '0.5rem', height: '4px', width: '3.5rem', borderRadius: '9999px', backgroundColor: '#e30613' }} aria-hidden />
        </div>
      </div>

      {/* Filtros */}
      <div className="conversiones-filtros">
        <select value={filtros.sede} onChange={(e) => setFiltros({ ...filtros, sede: e.target.value })}>
          <option value="">TODAS LAS SEDES</option>
          {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
          <option value="">TODOS LOS ESTADOS</option>
          <option value="AL DÍA">AL DÍA</option>
          <option value="POR VENCER">POR VENCER</option>
          <option value="VENCIDO">VENCIDO</option>
          <option value="SIN FECHA">SIN FECHA</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="conversiones-tabla-wrapper">
        <table>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              {['VIN', 'Placa', 'Marca', 'Sede', 'Fecha Chip', 'Fecha Primer Anual', 'Estado Garantía', 'Observaciones'].map(col => (
                <th key={col} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666666', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const estadoAlerta = getEstadoAlerta(u.postVenta.fechaPrimerAnual)
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.vin}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.placa || '-'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.marca}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.sede}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.postVenta.fechaChip || '-'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.postVenta.fechaPrimerAnual || '-'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>{renderBadge(estadoAlerta)}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.postVenta.observaciones || '-'}</td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#666666' }}>
                  No hay registros de post-venta con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
