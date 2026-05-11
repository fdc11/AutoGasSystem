import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const SEDES = ['ICA', 'HUANCAYO', 'LIMA', 'NAZCA', 'CHINCHA', 'TRUJILLO', 'AYACUCHO']
const CONCESIONARIAS = ['AUTONIZA', 'VARI', 'FOTÓN', 'WANKAMOTORS', 'OTROS']
const TIPOS_CONVERSION = ['GLP', 'GNV']

export default function Unidades() {
  const navigate = useNavigate()
  const [unidades, setUnidades] = useState([])
  const [searchVin, setSearchVin] = useState('')
  const [filtros, setFiltros] = useState({ sede: '', estado: '', tipo: '', concesionaria: '' })
  const [modalOpen, setModalOpen] = useState(false)

  const [form, setForm] = useState({
    vin: '',
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    placa: '',
    sede: '',
    concesionaria: '',
    tipoConversion: '',
    bloque: '',
    fechaIngreso: '',
    motorSerie: '',
    folioInterno: '',
    fichaRecepcion: '',
    fechaEntrega: '',
    tecnicoElectronico: '',
    tecnicoMecanico: '',
    observacionRecepcion: ''
  })

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Ordenamos por creadoEn desc en cliente para simplificar o si no hay indice
      data.sort((a, b) => (b.creadoEn?.toMillis() || 0) - (a.creadoEn?.toMillis() || 0))
      setUnidades(data)
    })
    return () => unsubscribe()
  }, [])

  const filtered = unidades.filter(u => {
    if (searchVin && !u.vin.toLowerCase().includes(searchVin.toLowerCase())) return false
    if (filtros.sede && u.sede !== filtros.sede) return false
    if (filtros.estado && u.estado !== filtros.estado) return false
    if (filtros.tipo && u.tipoConversion !== filtros.tipo) return false
    if (filtros.concesionaria && u.concesionaria !== filtros.concesionaria) return false
    return true
  })

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.vin) return

    const nuevaUnidad = {
      ...form,
      anio: Number(form.anio),
      placa: form.placa || null,
      estado: 'Por Convertir',
      conversion: {},
      certificacion: {},
      facturacion: {},
      postVenta: {},
      historial: [],
      creadoEn: new Date(),
      actualizadoEn: new Date()
    }

    try {
      await setDoc(doc(db, 'unidades', form.vin), nuevaUnidad)
      setModalOpen(false)
      setForm({
        vin: '', marca: '', modelo: '', anio: '', color: '', placa: '',
        sede: '', concesionaria: '', tipoConversion: '', bloque: '', fechaIngreso: '',
        motorSerie: '', folioInterno: '', fichaRecepcion: '', fechaEntrega: '',
        tecnicoElectronico: '', tecnicoMecanico: '', observacionRecepcion: ''
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const renderBadge = (estado) => {
    const isConvertido = estado === 'Convertido'
    const bg = isConvertido ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'
    const color = isConvertido ? '#22c55e' : '#f59e0b'
    return (
      <span style={{
        backgroundColor: bg, color: color, padding: '0.25rem 0.5rem',
        borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>
        {estado}
      </span>
    )
  }

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '2px',
    color: '#1a1a1a',
    fontFamily: 'Barlow, sans-serif',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box'
  }
  const labelStyle = {
    display: 'block',
    marginBottom: '0.25rem',
    fontSize: '0.75rem',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  }

  return (
    <div style={{ fontFamily: 'Barlow, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontSize: '2.5rem', fontWeight: '900',
          textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a1a1a', margin: 0
        }}>
          UNIDADES
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            backgroundColor: '#e30613', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem',
            borderRadius: '2px', fontFamily: 'Barlow, sans-serif', fontWeight: '600', fontSize: '0.85rem',
            textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer'
          }}
        >
          NUEVA UNIDAD
        </button>
      </div>

      {/* Filtros */}
      <div style={{
        backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px',
        padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="BUSCAR POR VIN..."
          value={searchVin}
          onChange={(e) => setSearchVin(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
        />
        <select
          value={filtros.sede}
          onChange={(e) => setFiltros({ ...filtros, sede: e.target.value })}
          style={{ ...inputStyle, width: 'auto' }}
        >
          <option value="">TODAS LAS SEDES</option>
          {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          style={{ ...inputStyle, width: 'auto' }}
        >
          <option value="">TODOS LOS ESTADOS</option>
          <option value="Por Convertir">POR CONVERTIR</option>
          <option value="Convertido">CONVERTIDO</option>
        </select>
        <select
          value={filtros.tipo}
          onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
          style={{ ...inputStyle, width: 'auto' }}
        >
          <option value="">TODOS LOS TIPOS</option>
          {TIPOS_CONVERSION.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filtros.concesionaria}
          onChange={(e) => setFiltros({ ...filtros, concesionaria: e.target.value })}
          style={{ ...inputStyle, width: 'auto' }}
        >
          <option value="">TODAS LAS CONCESIONARIAS</option>
          {CONCESIONARIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              {['VIN', 'Marca', 'Modelo', 'Año', 'Color', 'Sede', 'Concesionaria', 'Tipo', 'Estado', 'Fecha Ingreso', 'Acciones'].map(col => (
                <th key={col} style={{
                  padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '600',
                  letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666666'
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.vin}</td>
                <td style={{ padding: '1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.marca}</td>
                <td style={{ padding: '1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.modelo}</td>
                <td style={{ padding: '1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.anio}</td>
                <td style={{ padding: '1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.color}</td>
                <td style={{ padding: '1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.sede}</td>
                <td style={{ padding: '1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.concesionaria}</td>
                <td style={{ padding: '1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.tipoConversion}</td>
                <td style={{ padding: '1rem' }}>{renderBadge(u.estado)}</td>
                <td style={{ padding: '1rem', color: '#1a1a1a', fontSize: '0.85rem' }}>{u.fechaIngreso}</td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => navigate(`/unidades/${u.vin}`)}
                    style={{
                      backgroundColor: 'transparent', border: '1px solid #e0e0e0', color: '#1a1a1a',
                      padding: '0.25rem 0.75rem', borderRadius: '2px', cursor: 'pointer', fontSize: '0.75rem',
                      textTransform: 'uppercase', letterSpacing: '0.1em'
                    }}
                  >
                    VER
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: '2rem', textAlign: 'center', color: '#666666' }}>
                  No hay unidades que coincidan con los filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Unidad */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px',
            padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.5rem', fontWeight: '800',
              textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1a1a', margin: '0 0 1.5rem 0'
            }}>
              NUEVA UNIDAD
            </h2>
            <form onSubmit={handleGuardar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>VIN *</label>
                <input required type="text" value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value.toUpperCase() })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>MARCA</label>
                <input type="text" value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>MODELO</label>
                <input type="text" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>AÑO</label>
                <input type="number" value={form.anio} onChange={e => setForm({ ...form, anio: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>COLOR</label>
                <input type="text" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>PLACA (OPCIONAL)</label>
                <input type="text" placeholder="Sin placa aún" value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>SEDE</label>
                <select required value={form.sede} onChange={e => setForm({ ...form, sede: e.target.value })} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>CONCESIONARIA</label>
                <select required value={form.concesionaria} onChange={e => setForm({ ...form, concesionaria: e.target.value })} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {CONCESIONARIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>TIPO CONVERSIÓN</label>
                <select required value={form.tipoConversion} onChange={e => setForm({ ...form, tipoConversion: e.target.value })} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {TIPOS_CONVERSION.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>BLOQUE</label>
                <input type="text" value={form.bloque} onChange={e => setForm({ ...form, bloque: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>FECHA DE INGRESO</label>
                <input required type="date" value={form.fechaIngreso} onChange={e => setForm({ ...form, fechaIngreso: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>MOTOR SERIE</label>
                <input type="text" value={form.motorSerie} onChange={e => setForm({ ...form, motorSerie: e.target.value.toUpperCase() })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>FOLIO INTERNO</label>
                <input type="text" value={form.folioInterno} onChange={e => setForm({ ...form, folioInterno: e.target.value.toUpperCase() })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>FICHA RECEPCIÓN</label>
                <input type="text" value={form.fichaRecepcion} onChange={e => setForm({ ...form, fichaRecepcion: e.target.value.toUpperCase() })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>FECHA ENTREGA</label>
                <input type="date" value={form.fechaEntrega} onChange={e => setForm({ ...form, fechaEntrega: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>TÉCNICO ELECTRÓNICO</label>
                <input type="text" value={form.tecnicoElectronico} onChange={e => setForm({ ...form, tecnicoElectronico: e.target.value.toUpperCase() })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>TÉCNICO MECÁNICO</label>
                <input type="text" value={form.tecnicoMecanico} onChange={e => setForm({ ...form, tecnicoMecanico: e.target.value.toUpperCase() })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>OBSERVACIÓN RECEPCIÓN</label>
                <textarea value={form.observacionRecepcion} onChange={e => setForm({ ...form, observacionRecepcion: e.target.value })} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    backgroundColor: 'transparent', color: '#1a1a1a', border: '1px solid #e0e0e0',
                    padding: '0.75rem 1.5rem', borderRadius: '2px', fontFamily: 'Barlow, sans-serif',
                    fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer'
                  }}
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#e30613', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem',
                    borderRadius: '2px', fontFamily: 'Barlow, sans-serif', fontWeight: '600', fontSize: '0.85rem',
                    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer'
                  }}
                >
                  GUARDAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
