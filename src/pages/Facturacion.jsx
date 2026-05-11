import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { SEDES, CONCESIONARIAS, TIPOS_PAGO, MESES } from '../constants/datos'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { useToast } from '../hooks/useToast'

const INPUT  = 'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 font-barlow text-sm text-ag-ink placeholder:text-neutral-400 outline-none transition focus:border-ag-red focus:ring-2 focus:ring-ag-red/20'
const LABEL  = 'mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500'
const FILTER = 'min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-ag-ink outline-none transition focus:border-ag-red focus:ring-2 focus:ring-ag-red/20 font-barlow'

const ESTADOS_FACTURA = ['CANCELADO', 'PENDIENTE', 'NC']

const EMPTY_FORM = {
  numeroFactura: '', receptor: '', monto: '', condicion: '',
  fechaEmision: '', fechaVencimiento: '', vinVinculado: '',
  estado: 'PENDIENTE', reembolsoComision: '', fechaCancelacion: '', tipoPago: '',
}

function getFacturaStatus(fVenc, estado) {
  if (estado === 'CANCELADO') return 'Cancelado'
  if (estado === 'NC') return 'NC'
  if (estado === 'PENDIENTE') {
    if (!fVenc) return 'Pendiente'
    return new Date(fVenc) < new Date() ? 'Vencida' : 'Pendiente'
  }
  return estado
}

export default function Facturacion() {
  const { toast, ToastContainer } = useToast()
  const [tab, setTab]       = useState('TODAS')
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filtros, setFiltros]   = useState({ sede: '', mes: '', concesionaria: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      const conFactura = docs.filter((d) => d.facturacion?.numeroFactura)
      conFactura.sort((a, b) =>
        new Date(b.facturacion.fechaEmision || 0) - new Date(a.facturacion.fechaEmision || 0)
      )
      setUnidades(conFactura)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const facturasPendientes = unidades.filter((u) => u.facturacion.estado === 'PENDIENTE')
  const totalPendientes = facturasPendientes.reduce((acc, u) => acc + Number(u.facturacion.monto || 0), 0)

  const filteredTodas = unidades.filter((u) => {
    if (filtros.sede && u.sede !== filtros.sede) return false
    if (filtros.concesionaria && u.facturacion.receptor !== filtros.concesionaria) return false
    if (filtros.mes !== '') {
      if (!u.facturacion.fechaEmision) return false
      const [, m] = u.facturacion.fechaEmision.split('-')
      if ((parseInt(m, 10) - 1).toString() !== filtros.mes) return false
    }
    return true
  })

  const pendientesAgrupadas = facturasPendientes.reduce((acc, u) => {
    const receptor = u.facturacion.receptor || 'SIN RECEPTOR'
    if (!acc[receptor]) acc[receptor] = []
    acc[receptor].push(u)
    return acc
  }, {})

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.vinVinculado) return toast('El VIN vinculado es obligatorio', 'error')
    setSubmitting(true)
    try {
      const ref = doc(db, 'unidades', form.vinVinculado.toUpperCase())
      const snap = await getDoc(ref)
      if (!snap.exists()) { toast('No existe una unidad con ese VIN', 'error'); return }
      await updateDoc(ref, {
        facturacion: {
          ...form,
          numeroFactura: form.numeroFactura.toUpperCase(),
          condicion: form.condicion.toUpperCase(),
          monto: Number(form.monto),
          reembolsoComision: Number(form.reembolsoComision || 0),
        },
      })
      setModalOpen(false)
      setForm(EMPTY_FORM)
      toast('Factura guardada correctamente', 'success')
    } catch (err) {
      console.error(err)
      toast('Error al guardar la factura', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const setF = (k, v) => setFiltros((f) => ({ ...f, [k]: v }))

  const ALL_COLS   = ['N° Factura', 'Receptor', 'VIN', 'Monto', 'Condición', 'Fecha Emisión', 'Fecha Vencimiento', 'Estado']
  const PEND_COLS  = ['N° Factura', 'VIN', 'Monto', 'Fecha Emisión', 'Fecha Vencimiento', 'Estado']

  return (
    <div className="font-barlow text-ag-ink">
      <ToastContainer />

      <PageHeader
        title="FACTURACIÓN"
        subtitle={`Total pendiente: $${totalPendientes.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-card transition-colors hover:bg-ag-red-dark"
          >
            Nueva factura
          </button>
        }
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-neutral-200/80 bg-white p-1 shadow-card-md w-fit">
        {['TODAS', 'PENDIENTES'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2 font-barlow-condensed text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === t ? 'bg-ag-red text-white' : 'text-neutral-500 hover:text-ag-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: TODAS */}
      {tab === 'TODAS' && (
        <>
          <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-neutral-100/90 bg-white p-4 shadow-card-md sm:p-5">
            <select value={filtros.sede}         onChange={(e) => setF('sede', e.target.value)}         className={`${FILTER} flex-1 min-w-[140px]`}>
              <option value="">Todas las sedes</option>
              {SEDES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filtros.mes}           onChange={(e) => setF('mes', e.target.value)}           className={`${FILTER} flex-1 min-w-[140px]`}>
              <option value="">Todos los meses</option>
              {MESES.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
            <select value={filtros.concesionaria} onChange={(e) => setF('concesionaria', e.target.value)} className={`${FILTER} flex-1 min-w-[160px]`}>
              <option value="">Todas las concesionarias</option>
              {CONCESIONARIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-100/90 bg-white shadow-card-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-200/90 bg-neutral-50/60">
                    {ALL_COLS.map((c) => <th key={c} className="px-5 py-3.5 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-neutral-100">
                        {ALL_COLS.map((c) => <td key={c} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td>)}
                      </tr>
                    ))
                  ) : (
                    <>
                      {filteredTodas.map((u) => (
                        <tr key={u.id} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/40">
                          <td className="px-5 py-3.5 text-sm font-medium text-ag-ink">{u.facturacion.numeroFactura}</td>
                          <td className="px-5 py-3.5 text-sm text-ag-ink">{u.facturacion.receptor}</td>
                          <td className="px-5 py-3.5 text-sm text-ag-ink">{u.vin}</td>
                          <td className="px-5 py-3.5 text-sm text-ag-ink">${Number(u.facturacion.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-5 py-3.5 text-sm text-ag-ink">{u.facturacion.condicion}</td>
                          <td className="px-5 py-3.5 text-sm text-ag-ink">{u.facturacion.fechaEmision}</td>
                          <td className="px-5 py-3.5 text-sm text-ag-ink">{u.facturacion.fechaVencimiento}</td>
                          <td className="px-5 py-3.5"><Badge status={getFacturaStatus(u.facturacion.fechaVencimiento, u.facturacion.estado)} /></td>
                        </tr>
                      ))}
                      {filteredTodas.length === 0 && (
                        <tr><td colSpan={ALL_COLS.length} className="px-5 py-12 text-center text-sm text-neutral-500">No hay facturas con estos filtros.</td></tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tab: PENDIENTES */}
      {tab === 'PENDIENTES' && (
        <div className="flex flex-col gap-6">
          {Object.keys(pendientesAgrupadas).length === 0 ? (
            <p className="rounded-2xl border border-neutral-100/90 bg-white p-10 text-center text-sm text-neutral-500 shadow-card-md">
              No hay facturas pendientes. 🎉
            </p>
          ) : (
            Object.entries(pendientesAgrupadas).map(([receptor, lista]) => {
              const totalGrupo = lista.reduce((acc, u) => acc + Number(u.facturacion.monto || 0), 0)
              return (
                <div key={receptor} className="overflow-hidden rounded-2xl border border-neutral-100/90 bg-white shadow-card-md">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/90 bg-neutral-50/50 px-6 py-5">
                    <h2 className="font-barlow-condensed text-xl font-bold uppercase tracking-wide text-ag-ink">{receptor}</h2>
                    <span className="font-barlow-condensed text-xl font-bold text-ag-red">
                      ${totalGrupo.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-neutral-200/90 bg-neutral-50/40">
                          {PEND_COLS.map((c) => <th key={c} className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500">{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {lista.map((u) => (
                          <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                            <td className="px-5 py-3 text-sm text-ag-ink">{u.facturacion.numeroFactura}</td>
                            <td className="px-5 py-3 text-sm text-ag-ink">{u.vin}</td>
                            <td className="px-5 py-3 text-sm text-ag-ink">${Number(u.facturacion.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3 text-sm text-ag-ink">{u.facturacion.fechaEmision}</td>
                            <td className="px-5 py-3 text-sm text-ag-ink">{u.facturacion.fechaVencimiento}</td>
                            <td className="px-5 py-3"><Badge status={getFacturaStatus(u.facturacion.fechaVencimiento, u.facturacion.estado)} /></td>
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

      {/* Modal nueva factura */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="mb-6 font-barlow-condensed text-2xl font-extrabold uppercase tracking-wide text-ag-ink">Nueva factura</h2>
            <form onSubmit={handleGuardar} className="grid gap-4">
              {[
                { id: 'vinVinculado',   label: 'VIN Vinculado *',       type: 'text',   required: true, upper: true },
                { id: 'numeroFactura',  label: 'N° Factura *',          type: 'text',   required: true, upper: true },
              ].map((f) => (
                <div key={f.id}>
                  <label className={LABEL}>{f.label}</label>
                  <input required={f.required} type={f.type} value={form[f.id]}
                    onChange={(e) => setForm((x) => ({ ...x, [f.id]: f.upper ? e.target.value.toUpperCase() : e.target.value }))}
                    className={INPUT} />
                </div>
              ))}
              <div>
                <label className={LABEL}>Receptor *</label>
                <select required value={form.receptor} onChange={(e) => setForm((x) => ({ ...x, receptor: e.target.value }))} className={INPUT}>
                  <option value="">Seleccionar…</option>
                  {CONCESIONARIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Monto ($) *</label>
                <input required type="number" step="0.01" value={form.monto} onChange={(e) => setForm((x) => ({ ...x, monto: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Condición pago *</label>
                <input required type="text" value={form.condicion} onChange={(e) => setForm((x) => ({ ...x, condicion: e.target.value.toUpperCase() }))} className={INPUT} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Fecha Emisión *</label>
                  <input required type="date" value={form.fechaEmision} onChange={(e) => setForm((x) => ({ ...x, fechaEmision: e.target.value }))} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Fecha Vencimiento *</label>
                  <input required type="date" value={form.fechaVencimiento} onChange={(e) => setForm((x) => ({ ...x, fechaVencimiento: e.target.value }))} className={INPUT} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Tipo de pago *</label>
                <select required value={form.tipoPago} onChange={(e) => setForm((x) => ({ ...x, tipoPago: e.target.value }))} className={INPUT}>
                  <option value="">Seleccionar…</option>
                  {TIPOS_PAGO.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Reembolso/Comisión ($)</label>
                  <input type="number" step="0.01" value={form.reembolsoComision} onChange={(e) => setForm((x) => ({ ...x, reembolsoComision: e.target.value }))} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Fecha Cancelación</label>
                  <input type="date" value={form.fechaCancelacion} onChange={(e) => setForm((x) => ({ ...x, fechaCancelacion: e.target.value }))} className={INPUT} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Estado *</label>
                <select required value={form.estado} onChange={(e) => setForm((x) => ({ ...x, estado: e.target.value }))} className={INPUT}>
                  {ESTADOS_FACTURA.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ag-ink transition-colors hover:border-neutral-300">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-ag-red-dark disabled:opacity-60">
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
