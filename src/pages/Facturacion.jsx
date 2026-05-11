import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const SEDES = ['ICA', 'HUANCAYO', 'LIMA', 'NAZCA', 'CHINCHA', 'TRUJILLO', 'AYACUCHO']
const CONCESIONARIAS = ['AUTONIZA', 'VARI', 'FOTÓN', 'WANKAMOTORS', 'OTROS']
const TIPOS_PAGO = ['POR CONVERSIÓN', 'POR SERVICIO']
const MESES = [
  { val: 0, label: 'ENERO' }, { val: 1, label: 'FEBRERO' }, { val: 2, label: 'MARZO' },
  { val: 3, label: 'ABRIL' }, { val: 4, label: 'MAYO' }, { val: 5, label: 'JUNIO' },
  { val: 6, label: 'JULIO' }, { val: 7, label: 'AGOSTO' }, { val: 8, label: 'SEPTIEMBRE' },
  { val: 9, label: 'OCTUBRE' }, { val: 10, label: 'NOVIEMBRE' }, { val: 11, label: 'DICIEMBRE' }
]

export default function Facturacion() {
  const [tab, setTab] = useState('TODAS')
  const [unidades, setUnidades] = useState([])
  const [filtros, setFiltros] = useState({ sede: '', mes: '', concesionaria: '' })
  const [modalOpen, setModalOpen] = useState(false)
  
  const [form, setForm] = useState({
    numeroFactura: '', receptor: '', monto: '', condicion: '', fechaEmision: '', fechaVencimiento: '', vinVinculado: '', estado: 'PENDIENTE', reembolsoComision: '', fechaCancelacion: '', tipoPago: ''
  })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const conFactura = docs.filter(d => d.facturacion && d.facturacion.numeroFactura)
      conFactura.sort((a, b) => new Date(b.facturacion.fechaEmision || 0) - new Date(a.facturacion.fechaEmision || 0))
      setUnidades(conFactura)
    })
    return () => unsub()
  }, [])

  const facturasPendientes = unidades.filter(u => u.facturacion.estado === 'PENDIENTE')
  const totalPendientes = facturasPendientes.reduce((acc, u) => acc + Number(u.facturacion.monto || 0), 0)

  const filteredTodas = unidades.filter(u => {
    if (filtros.sede && u.sede !== filtros.sede) return false
    if (filtros.concesionaria && u.facturacion.receptor !== filtros.concesionaria) return false
    if (filtros.mes !== '') {
      if (!u.facturacion.fechaEmision) return false
      const [, m] = u.facturacion.fechaEmision.split('-')
      if ((parseInt(m, 10) - 1).toString() !== filtros.mes) return false
    }
    return true
  })

  // Agrupar pendientes por receptor
  const pendientesAgrupadas = facturasPendientes.reduce((acc, u) => {
    const receptor = u.facturacion.receptor || 'SIN RECEPTOR'
    if (!acc[receptor]) acc[receptor] = []
    acc[receptor].push(u)
    return acc
  }, {})

  const handleGuardarFactura = async (e) => {
    e.preventDefault()
    if (!form.vinVinculado) return alert('El VIN vinculado es obligatorio')
    const ref = doc(db, 'unidades', form.vinVinculado.toUpperCase())
    const docSnap = await getDoc(ref)
    if (!docSnap.exists()) return alert('La unidad con ese VIN no existe')

    await updateDoc(ref, {
      facturacion: {
        numeroFactura: form.numeroFactura.toUpperCase(),
        receptor: form.receptor,
        monto: Number(form.monto),
        condicion: form.condicion.toUpperCase(),
        fechaEmision: form.fechaEmision,
        fechaVencimiento: form.fechaVencimiento,
        estado: form.estado,
        reembolsoComision: Number(form.reembolsoComision || 0),
        fechaCancelacion: form.fechaCancelacion,
        tipoPago: form.tipoPago
      }
    })
    setModalOpen(false)
    setForm({ numeroFactura: '', receptor: '', monto: '', condicion: '', fechaEmision: '', fechaVencimiento: '', vinVinculado: '', estado: 'PENDIENTE', reembolsoComision: '', fechaCancelacion: '', tipoPago: '' })
  }

  const renderBadge = (fVenc, estado) => {
    let bg = 'rgba(255,255,255,0.1)'
    let color = '#ffffff'
    let txt = estado

    if (estado === 'CANCELADO') {
      bg = 'rgba(34,197,94,0.15)'
      color = '#22c55e'
    } else if (estado === 'PENDIENTE') {
      const hoy = new Date()
      const venc = new Date(fVenc)
      if (venc < hoy) {
        bg = 'rgba(227,6,19,0.15)'
        color = '#e30613'
        txt = 'VENCIDA'
      } else {
        bg = 'rgba(245,158,11,0.15)'
        color = '#f59e0b'
      }
    } else if (estado === 'NC') {
      bg = 'rgba(107,114,128,0.15)'
      color = '#9ca3af'
    }

    return (
      <span style={{ backgroundColor: bg, color: color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {txt}
      </span>
    )
  }

  const inputStyle = { padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '2px', color: '#1a1a1a', fontFamily: 'Barlow, sans-serif', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', marginBottom: '0.25rem', fontSize: '0.7rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.1em' }
  const tabStyle = (active) => ({ padding: '0.75rem 1.5rem', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.2rem', fontWeight: '800', cursor: 'pointer', borderBottom: active ? '2px solid #e30613' : '2px solid transparent', color: active ? '#1a1a1a' : '#666666', textTransform: 'uppercase', letterSpacing: '0.05em' })

  return (
    <div style={{ fontFamily: 'Barlow, sans-serif' }}>
      <div className="conversiones-header">
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a1a1a', margin: 0 }}>
            FACTURACIÓN
          </h1>
          <p style={{ color: '#666666', fontSize: '0.85rem', marginTop: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Total General Pendiente: <span style={{ color: '#e30613', fontWeight: '700', fontSize: '1rem' }}>${totalPendientes.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        <button
          className="conversiones-btn-nueva"
          onClick={() => setModalOpen(true)}
        >
          NUEVA FACTURA
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '1.5rem' }}>
        <div style={tabStyle(tab === 'TODAS')} onClick={() => setTab('TODAS')}>TODAS</div>
        <div style={tabStyle(tab === 'PENDIENTES')} onClick={() => setTab('PENDIENTES')}>PENDIENTES</div>
      </div>

      {tab === 'TODAS' && (
        <>
          <div className="conversiones-filtros">
            <select value={filtros.sede} onChange={(e) => setFiltros({ ...filtros, sede: e.target.value })}>
              <option value="">TODAS LAS SEDES</option>
              {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filtros.mes} onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}>
              <option value="">TODOS LOS MESES</option>
              {MESES.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
            <select value={filtros.concesionaria} onChange={(e) => setFiltros({ ...filtros, concesionaria: e.target.value })}>
              <option value="">TODAS LAS CONCESIONARIAS</option>
              {CONCESIONARIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="conversiones-tabla-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  {['N° Factura', 'Receptor', 'VIN', 'Monto', 'Condición', 'Fecha Emisión', 'Fecha Vencimiento', 'Estado'].map(col => (
                    <th key={col} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666666', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTodas.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.facturacion.numeroFactura}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.facturacion.receptor}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.vin}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>${Number(u.facturacion.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.facturacion.condicion}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.facturacion.fechaEmision}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.facturacion.fechaVencimiento}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>{renderBadge(u.facturacion.fechaVencimiento, u.facturacion.estado)}</td>
                  </tr>
                ))}
                {filteredTodas.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#666666' }}>No hay facturas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'PENDIENTES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.keys(pendientesAgrupadas).length === 0 ? (
            <p style={{ color: '#666666' }}>No hay facturas pendientes.</p>
          ) : (
            Object.entries(pendientesAgrupadas).map(([receptor, lista]) => {
              const totalGrupo = lista.reduce((acc, u) => acc + Number(u.facturacion.monto || 0), 0)
              return (
                <div key={receptor} style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.5rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a1a1a', margin: 0 }}>
                      {receptor}
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: '#e30613', fontWeight: '700', margin: 0 }}>
                      ${totalGrupo.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="conversiones-tabla-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          {['N° Factura', 'VIN', 'Monto', 'Fecha Emisión', 'Fecha Vencimiento', 'Estado'].map(col => (
                            <th key={col} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666666', whiteSpace: 'nowrap' }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lista.map(u => (
                          <tr key={u.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                            <td style={{ padding: '0.75rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.facturacion.numeroFactura}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.vin}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>${Number(u.facturacion.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.facturacion.fechaEmision}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.facturacion.fechaVencimiento}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{renderBadge(u.facturacion.fechaVencimiento, u.facturacion.estado)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px', padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.5rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1a1a', marginBottom: '1.5rem' }}>
              NUEVA FACTURA
            </h2>
            <form onSubmit={handleGuardarFactura}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div><label style={labelStyle}>VIN VINCULADO</label><input required type="text" value={form.vinVinculado} onChange={e => setForm({ ...form, vinVinculado: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                <div><label style={labelStyle}>N° FACTURA</label><input required type="text" value={form.numeroFactura} onChange={e => setForm({ ...form, numeroFactura: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                <div><label style={labelStyle}>RECEPTOR</label><select required value={form.receptor} onChange={e => setForm({ ...form, receptor: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{CONCESIONARIAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label style={labelStyle}>MONTO ($)</label><input required type="number" step="0.01" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>CONDICIÓN PAGO</label><input required type="text" value={form.condicion} onChange={e => setForm({ ...form, condicion: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                <div><label style={labelStyle}>FECHA EMISIÓN</label><input required type="date" value={form.fechaEmision} onChange={e => setForm({ ...form, fechaEmision: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>FECHA VENCIMIENTO</label><input required type="date" value={form.fechaVencimiento} onChange={e => setForm({ ...form, fechaVencimiento: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>TIPO DE PAGO</label><select required value={form.tipoPago} onChange={e => setForm({ ...form, tipoPago: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{TIPOS_PAGO.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={labelStyle}>REEMBOLSO/COMISIÓN ($)</label><input type="number" step="0.01" value={form.reembolsoComision} onChange={e => setForm({ ...form, reembolsoComision: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>FECHA CANCELACIÓN</label><input type="date" value={form.fechaCancelacion} onChange={e => setForm({ ...form, fechaCancelacion: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>ESTADO</label><select required value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} style={inputStyle}><option value="PENDIENTE">PENDIENTE</option><option value="CANCELADO">CANCELADO</option><option value="NC">NC</option></select></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid #e0e0e0', color: '#1a1a1a', padding: '0.75rem 1.5rem', borderRadius: '2px', fontFamily: 'Barlow, sans-serif', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>CANCELAR</button>
                <button type="submit" style={{ backgroundColor: '#e30613', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '2px', fontFamily: 'Barlow, sans-serif', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>GUARDAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
