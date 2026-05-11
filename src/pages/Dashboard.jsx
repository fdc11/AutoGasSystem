import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    totalUnidades: 0,
    conversionesMes: 0,
    facturasPendientes: 0,
    certificadosEmitidos: 0
  })
  const [ultimasUnidades, setUltimasUnidades] = useState([])

  useEffect(() => {
    const unsubscribeUnidades = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data())
      
      const ahora = new Date()
      const mesActual = ahora.getMonth()
      const anioActual = ahora.getFullYear()

      let conversionesMes = 0
      let facturasPendientes = 0
      let certificadosEmitidos = 0

      docs.forEach(data => {
        if (data.estado === 'Convertido' && data.conversion?.fechaFin) {
          const fFin = data.conversion.fechaFin.toDate()
          if (fFin.getMonth() === mesActual && fFin.getFullYear() === anioActual) {
            conversionesMes++
          }
        }
        if (data.facturacion?.estado === 'PENDIENTE') {
          facturasPendientes++
        }
        if (data.certificacion?.condicion === 'EMITIDO') {
          certificadosEmitidos++
        }
      })

      setKpis({
        totalUnidades: snapshot.size,
        conversionesMes,
        facturasPendientes,
        certificadosEmitidos
      })
    })

    const qUltimas = query(collection(db, 'unidades'), orderBy('creadoEn', 'desc'), limit(5))
    const unsubscribeUltimas = onSnapshot(qUltimas, (snapshot) => {
      setUltimasUnidades(snapshot.docs.map(doc => doc.data()))
    })

    return () => {
      unsubscribeUnidades()
      unsubscribeUltimas()
    }
  }, [])

  const renderBadge = (estado) => {
    const isConvertido = estado === 'Convertido'
    const bg = isConvertido ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'
    const color = isConvertido ? '#22c55e' : '#f59e0b'
    
    return (
      <span style={{
        backgroundColor: bg,
        color: color,
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {estado}
      </span>
    )
  }

  return (
    <div style={{ fontFamily: 'Barlow, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '2.5rem',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#1a1a1a',
          lineHeight: 1,
          margin: 0
        }}>
          DASH<span style={{ color: '#e30613' }}>BOARD</span>
        </h1>
        <p style={{ color: '#666666', fontSize: '0.85rem', marginTop: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Resumen operativo — AutoGas Sistema
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { titulo: 'TOTAL UNIDADES', valor: kpis.totalUnidades, sub: 'Registradas en el sistema' },
          { titulo: 'CONVERSIONES', valor: kpis.conversionesMes, sub: 'Este mes' },
          { titulo: 'FACTURAS PENDIENTES', valor: kpis.facturasPendientes, sub: 'Por cobrar' },
          { titulo: 'CERTIFICADOS', valor: kpis.certificadosEmitidos, sub: 'Emitidos' },
        ].map((kpi, i) => (
          <div key={i} style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '4px',
            padding: '1.5rem',
            borderBottom: '2px solid #e30613'
          }}>
            <p style={{ fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666666', marginBottom: '0.75rem' }}>
              {kpi.titulo}
            </p>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '2.5rem', fontWeight: '900', color: '#1a1a1a', lineHeight: 1, marginBottom: '0.5rem' }}>
              {kpi.valor}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#666666' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabla últimas unidades */}
      <div style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e0e0e0' }}>
          <h2 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '1.2rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#1a1a1a',
            margin: 0
          }}>
            ÚLTIMAS UNIDADES REGISTRADAS
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              {['VIN', 'Marca', 'Modelo', 'Sede', 'Tipo', 'Estado'].map(col => (
                <th key={col} style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#666666'
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ultimasUnidades.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666666', fontSize: '0.85rem' }}>
                  No hay unidades registradas aún
                </td>
              </tr>
            ) : (
              ultimasUnidades.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '0.75rem 1.5rem', color: '#1a1a1a', fontSize: '0.85rem', fontWeight: '500' }}>{u.vin}</td>
                  <td style={{ padding: '0.75rem 1.5rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.marca}</td>
                  <td style={{ padding: '0.75rem 1.5rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.modelo}</td>
                  <td style={{ padding: '0.75rem 1.5rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.sede}</td>
                  <td style={{ padding: '0.75rem 1.5rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.tipoConversion}</td>
                  <td style={{ padding: '0.75rem 1.5rem' }}>
                    {renderBadge(u.estado)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}