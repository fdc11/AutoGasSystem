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
    const bg = isConvertido ? 'bg-emerald-500/15' : 'bg-amber-500/15'
    const color = isConvertido ? 'text-emerald-600' : 'text-amber-600'
    return (
      <span className={`inline-block rounded-md px-2 py-1 text-[0.7rem] font-bold uppercase tracking-wide ${bg} ${color}`}>
        {estado}
      </span>
    )
  }

  const filterClass =
    'min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-ag-ink outline-none transition-colors focus:border-ag-red focus:ring-2 focus:ring-ag-red/20 box-border font-barlow'

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    color: '#1a1a1a',
    fontFamily: 'Barlow, sans-serif',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  }
  const labelStyle = {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  }

  return (
    <div className="font-barlow text-ag-ink">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-barlow-condensed text-4xl font-black uppercase tracking-tight text-ag-ink sm:text-[2.5rem]">
            UNIDAD<span className="text-ag-red">ES</span>
          </h1>
          <div className="mt-2 h-1 w-14 rounded-full bg-ag-red" aria-hidden />
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="shrink-0 rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-card transition-colors hover:bg-ag-red-dark"
        >
          Nueva unidad
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-neutral-100/90 bg-white p-4 shadow-card-md sm:p-5">
        <input
          type="text"
          placeholder="Buscar por VIN…"
          value={searchVin}
          onChange={(e) => setSearchVin(e.target.value)}
          className={`${filterClass} min-w-[200px] flex-1`}
        />
        <select
          value={filtros.sede}
          onChange={(e) => setFiltros({ ...filtros, sede: e.target.value })}
          className={`${filterClass} w-full min-w-[160px] sm:w-auto`}
        >
          <option value="">Todas las sedes</option>
          {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          className={`${filterClass} w-full min-w-[160px] sm:w-auto`}
        >
          <option value="">Todos los estados</option>
          <option value="Por Convertir">Por convertir</option>
          <option value="Convertido">Convertido</option>
        </select>
        <select
          value={filtros.tipo}
          onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
          className={`${filterClass} w-full min-w-[120px] sm:w-auto`}
        >
          <option value="">Todos los tipos</option>
          {TIPOS_CONVERSION.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filtros.concesionaria}
          onChange={(e) => setFiltros({ ...filtros, concesionaria: e.target.value })}
          className={`${filterClass} w-full min-w-[180px] sm:w-auto`}
        >
          <option value="">Todas las concesionarias</option>
          {CONCESIONARIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100/90 bg-white shadow-card-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200/90 bg-neutral-50/60">
                {['VIN', 'Marca', 'Modelo', 'Año', 'Color', 'Sede', 'Concesionaria', 'Tipo', 'Estado', 'Fecha Ingreso', 'Acciones'].map(col => (
                  <th key={col} className="px-4 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500 sm:px-5">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/40">
                <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.vin}</td>
                <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.marca}</td>
                <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.modelo}</td>
                <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.anio}</td>
                <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.color}</td>
                <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.sede}</td>
                <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.concesionaria}</td>
                <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.tipoConversion}</td>
                <td className="px-4 py-3.5 sm:px-5">{renderBadge(u.estado)}</td>
                <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.fechaIngreso}</td>
                <td className="px-4 py-3.5 sm:px-5">
                  <button
                    type="button"
                    onClick={() => navigate(`/unidades/${u.vin}`)}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ag-ink transition-colors hover:border-ag-red hover:text-ag-red"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-5 py-12 text-center text-sm text-neutral-500">
                  No hay unidades que coincidan con los filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal Nueva Unidad */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card-md sm:p-8">
            <h2 className="mb-6 font-barlow-condensed text-2xl font-extrabold uppercase tracking-wide text-ag-ink">
              Nueva unidad
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

              <div className="col-span-full mt-4 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ag-ink transition-colors hover:border-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-card transition-colors hover:bg-ag-red-dark"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
