import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

const SEDES = ['ICA', 'HUANCAYO', 'LIMA', 'NAZCA', 'CHINCHA', 'TRUJILLO', 'AYACUCHO']
const TIPOS_CONVERSION = ['GLP', 'GNV']
const MESES = [
  { val: 0, label: 'ENERO' }, { val: 1, label: 'FEBRERO' }, { val: 2, label: 'MARZO' },
  { val: 3, label: 'ABRIL' }, { val: 4, label: 'MAYO' }, { val: 5, label: 'JUNIO' },
  { val: 6, label: 'JULIO' }, { val: 7, label: 'AGOSTO' }, { val: 8, label: 'SEPTIEMBRE' },
  { val: 9, label: 'OCTUBRE' }, { val: 10, label: 'NOVIEMBRE' }, { val: 11, label: 'DICIEMBRE' }
]
const ANIOS = ['2023', '2024', '2025', '2026', '2027']

export default function Conversiones() {
  const navigate = useNavigate()
  const [conversiones, setConversiones] = useState([])
  const [filtros, setFiltros] = useState({ sede: '', mes: new Date().getMonth().toString(), anio: new Date().getFullYear().toString(), estado: '', tipo: '' })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Filtrar los que tienen conversion con fechaFin
      const conFechas = docs.filter(d => d.conversion && d.conversion.fechaFin)
      conFechas.sort((a, b) => new Date(b.conversion.fechaFin) - new Date(a.conversion.fechaFin))
      setConversiones(conFechas)
    })
    return () => unsub()
  }, [])

  const filtered = conversiones.filter(c => {
    if (filtros.sede && c.sede !== filtros.sede) return false
    if (filtros.estado && c.estado !== filtros.estado) return false
    if (filtros.tipo && c.tipoConversion !== filtros.tipo) return false

    const [y, m] = c.conversion.fechaFin.split('-')
    
    if (filtros.mes !== '' && (parseInt(m, 10) - 1).toString() !== filtros.mes) return false
    if (filtros.anio !== '' && y !== filtros.anio) return false
    return true
  })

  const renderBadge = (estado) => {
    const isConvertido = estado === 'Convertido'
    const bg = isConvertido ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'
    const color = isConvertido ? '#22c55e' : '#f59e0b'
    return (
      <span style={{ backgroundColor: bg, color: color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            CONVERSIONES
          </h1>
          <div style={{ marginTop: '0.5rem', height: '4px', width: '3.5rem', borderRadius: '9999px', backgroundColor: '#e30613' }} aria-hidden />
        </div>
        <button
          className="conversiones-btn-nueva"
          onClick={() => navigate('/unidades')}
        >
          NUEVA CONVERSIÓN
        </button>
      </div>

      {/* Filtros */}
      <div className="conversiones-filtros">
        <select value={filtros.sede} onChange={(e) => setFiltros({ ...filtros, sede: e.target.value })}>
          <option value="">TODAS LAS SEDES</option>
          {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filtros.mes} onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}>
          <option value="">TODOS LOS MESES</option>
          {MESES.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>
        <select value={filtros.anio} onChange={(e) => setFiltros({ ...filtros, anio: e.target.value })}>
          <option value="">TODOS LOS AÑOS</option>
          {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
          <option value="">TODOS LOS ESTADOS</option>
          <option value="Por Convertir">POR CONVERTIR</option>
          <option value="Convertido">CONVERTIDO</option>
        </select>
        <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
          <option value="">TODOS LOS TIPOS</option>
          {TIPOS_CONVERSION.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="conversiones-tabla-wrapper">
        <table>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              {['VIN', 'Marca', 'Modelo', 'Sede', 'Tipo', 'Sistema', 'Técnico', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Acciones'].map(col => (
                <th key={col} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666666', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.vin}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.marca}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.modelo}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.sede}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.tipoConversion}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.conversion?.sistema || '-'}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.conversion?.tecnico || '-'}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.conversion?.fechaInicio || '-'}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.conversion?.fechaFin || '-'}</td>
                <td style={{ padding: '0.875rem 1rem' }}>{renderBadge(c.estado)}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <button onClick={() => navigate(`/unidades/${c.vin}`)} style={{ backgroundColor: 'transparent', border: '1px solid #e0e0e0', color: '#1a1a1a', padding: '0.25rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', minHeight: '36px' }}>
                    VER
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: '2rem', textAlign: 'center', color: '#666666' }}>No hay conversiones en este periodo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
