import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { SEDES, CONCESIONARIAS, TIPOS_CONVERSION } from '../constants/datos'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { useToast } from '../hooks/useToast'

/* ─── Shared Tailwind class strings ──────────────────────────────────────── */
const INPUT = 'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 font-barlow text-sm text-ag-ink placeholder:text-neutral-400 outline-none transition focus:border-ag-red focus:ring-2 focus:ring-ag-red/20'
const LABEL = 'mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500'
const FILTER = 'min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-ag-ink outline-none transition focus:border-ag-red focus:ring-2 focus:ring-ag-red/20 font-barlow'

const FORM_FIELDS = [
  { id: 'vin', label: 'VIN *', type: 'text', span: true, upper: true, required: true },
  { id: 'marca', label: 'Marca', type: 'text' },
  { id: 'modelo', label: 'Modelo', type: 'text' },
  { id: 'anio', label: 'Año', type: 'number' },
  { id: 'color', label: 'Color', type: 'text' },
  { id: 'placa', label: 'Placa (opcional)', type: 'text', span: true },
  { id: 'sede', label: 'Sede *', type: 'select', options: SEDES, required: true },
  { id: 'concesionaria', label: 'Concesionaria *', type: 'select', options: CONCESIONARIAS, required: true },
  { id: 'tipoConversion', label: 'Tipo Conversión *', type: 'select', options: TIPOS_CONVERSION, required: true },
  { id: 'bloque', label: 'Bloque', type: 'text' },
  { id: 'fechaIngreso', label: 'Fecha Ingreso *', type: 'date', span: true, required: true },
  { id: 'motorSerie', label: 'Motor Serie', type: 'text', upper: true },
  { id: 'folioInterno', label: 'Folio Interno', type: 'text', upper: true },
  { id: 'fichaRecepcion', label: 'Ficha Recepción', type: 'text', upper: true },
  { id: 'fechaEntrega', label: 'Fecha Entrega', type: 'date' },
  { id: 'tecnicoElectronico', label: 'Técnico Electrónico', type: 'text', upper: true },
  { id: 'tecnicoMecanico', label: 'Técnico Mecánico', type: 'text', upper: true },
  { id: 'observacionRecepcion', label: 'Observación Recepción', type: 'textarea', span: true },
]

const EMPTY_FORM = {
  vin: '', marca: '', modelo: '', anio: '', color: '', placa: '',
  sede: '', concesionaria: '', tipoConversion: '', bloque: '', fechaIngreso: '',
  motorSerie: '', folioInterno: '', fichaRecepcion: '', fechaEntrega: '',
  tecnicoElectronico: '', tecnicoMecanico: '', observacionRecepcion: '',
}

const TABLE_COLS = ['VIN', 'Marca', 'Modelo', 'Año', 'Color', 'Sede', 'Concesionaria', 'Tipo', 'Estado', 'Fecha Ingreso', '']

export default function Unidades() {
  const navigate = useNavigate()
  const { toast, ToastContainer } = useToast()

  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchVin, setSearchVin] = useState('')
  const [filtros, setFiltros] = useState({ sede: '', estado: '', tipo: '', concesionaria: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => {
        const ta = b.creadoEn?.toMillis?.() ?? new Date(b.creadoEn || 0).getTime()
        const tb = a.creadoEn?.toMillis?.() ?? new Date(a.creadoEn || 0).getTime()
        return ta - tb
      })
      setUnidades(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = unidades.filter((u) => {
    if (searchVin && !u.vin.toLowerCase().includes(searchVin.toLowerCase())) return false
    if (filtros.sede && u.sede !== filtros.sede) return false
    if (filtros.estado && u.estado !== filtros.estado) return false
    if (filtros.tipo && u.tipoConversion !== filtros.tipo) return false
    if (filtros.concesionaria && u.concesionaria !== filtros.concesionaria) return false
    return true
  })

  const handleField = (id, value, upper) =>
    setForm((f) => ({ ...f, [id]: upper ? value.toUpperCase() : value }))

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.vin) return
    setSubmitting(true)
    try {
      await setDoc(doc(db, 'unidades', form.vin), {
        ...form,
        anio: Number(form.anio),
        placa: form.placa || null,
        estado: 'Por Convertir',
        conversion: {}, certificacion: {}, facturacion: {}, postVenta: {},
        historial: [],
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      })
      setModalOpen(false)
      setForm(EMPTY_FORM)
      toast('Unidad registrada correctamente', 'success')
    } catch (err) {
      console.error(err)
      toast('Error al guardar la unidad', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="font-barlow text-ag-ink">
      <ToastContainer />

      <PageHeader
        title="UNIDAD"
        accent="ES"
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-card transition-colors hover:bg-ag-red-dark"
          >
            Nueva unidad
          </button>
        }
      />

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-neutral-100/90 bg-white p-4 shadow-card-md sm:p-5">
        <input
          type="text"
          placeholder="Buscar por VIN…"
          value={searchVin}
          onChange={(e) => setSearchVin(e.target.value)}
          className={`${FILTER} min-w-[200px] flex-1`}
        />
        <select value={filtros.sede} onChange={(e) => setFiltros({ ...filtros, sede: e.target.value })} className={`${FILTER} w-full sm:w-auto`}>
          <option value="">Todas las sedes</option>
          {SEDES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })} className={`${FILTER} w-full sm:w-auto`}>
          <option value="">Todos los estados</option>
          <option value="Por Convertir">Por convertir</option>
          <option value="Convertido">Convertido</option>
        </select>
        <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })} className={`${FILTER} w-full sm:w-auto`}>
          <option value="">Todos los tipos</option>
          {TIPOS_CONVERSION.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filtros.concesionaria} onChange={(e) => setFiltros({ ...filtros, concesionaria: e.target.value })} className={`${FILTER} w-full sm:w-auto`}>
          <option value="">Todas las concesionarias</option>
          {CONCESIONARIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100/90 bg-white shadow-card-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200/90 bg-neutral-50/60">
                {TABLE_COLS.map((col) => (
                  <th key={col} className="px-4 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500 sm:px-5">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    {TABLE_COLS.map((c) => (
                      <td key={c} className="px-4 py-4 sm:px-5">
                        <div className="h-4 animate-pulse rounded bg-neutral-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/40">
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.vin}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.marca}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.modelo}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.anio}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.color}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.sede}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.concesionaria}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{u.tipoConversion}</td>
                      <td className="px-4 py-3.5 sm:px-5"><Badge status={u.estado} /></td>
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
                      <td colSpan={TABLE_COLS.length} className="px-5 py-12 text-center text-sm text-neutral-500">
                        No hay unidades que coincidan con los filtros
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Unidad */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="mb-6 font-barlow-condensed text-2xl font-extrabold uppercase tracking-wide text-ag-ink">
              Nueva unidad
            </h2>
            <form onSubmit={handleGuardar} className="modal-form-grid grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {FORM_FIELDS.map((f) => (
                <div key={f.id} style={f.span ? { gridColumn: '1 / -1' } : {}}>
                  <label className={LABEL}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      required={f.required}
                      value={form[f.id]}
                      onChange={(e) => handleField(f.id, e.target.value, false)}
                      className={INPUT}
                    >
                      <option value="">Seleccionar…</option>
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      value={form[f.id]}
                      onChange={(e) => handleField(f.id, e.target.value, false)}
                      className={`${INPUT} min-h-[60px] resize-y`}
                    />
                  ) : (
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.id]}
                      onChange={(e) => handleField(f.id, e.target.value, f.upper)}
                      className={INPUT}
                    />
                  )}
                </div>
              ))}

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
                  disabled={submitting}
                  className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-card transition-colors hover:bg-ag-red-dark disabled:opacity-60"
                >
                  {submitting ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
