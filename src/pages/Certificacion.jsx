import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { CERTIFICADORAS, CONDICION_FOLIO, MESES } from '../constants/datos'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

const FILTER = 'min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-ag-ink outline-none transition focus:border-ag-red focus:ring-2 focus:ring-ag-red/20 font-barlow flex-1 min-w-[140px]'
const TABLE_COLS = ['VIN', 'Marca', 'Modelo', 'Sede', 'Certificadora', 'N° Folio', 'Condición', 'Fecha Emisión', '']

export default function Certificacion() {
  const navigate = useNavigate()
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ certificadora: '', condicion: '', mes: '' })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      const conCert = docs.filter((d) => d.certificacion?.certificadora || d.certificacion?.condicion)
      conCert.sort((a, b) =>
        new Date(b.certificacion.fechaEmision || 0) - new Date(a.certificacion.fechaEmision || 0)
      )
      setUnidades(conCert)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = unidades.filter((u) => {
    if (filtros.certificadora && u.certificacion.certificadora !== filtros.certificadora) return false
    if (filtros.condicion && u.certificacion.condicion !== filtros.condicion) return false
    if (filtros.mes !== '') {
      if (!u.certificacion.fechaEmision) return false
      const [, m] = u.certificacion.fechaEmision.split('-')
      if ((parseInt(m, 10) - 1).toString() !== filtros.mes) return false
    }
    return true
  })

  const setF = (k, v) => setFiltros((f) => ({ ...f, [k]: v }))

  return (
    <div className="font-barlow text-ag-ink">
      <PageHeader title="CERTIFICACIÓN" />

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-neutral-100/90 bg-white p-4 shadow-card-md sm:p-5">
        <select value={filtros.certificadora} onChange={(e) => setF('certificadora', e.target.value)} className={FILTER}>
          <option value="">Todas las certificadoras</option>
          {CERTIFICADORAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtros.condicion} onChange={(e) => setF('condicion', e.target.value)} className={FILTER}>
          <option value="">Todas las condiciones</option>
          {CONDICION_FOLIO.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtros.mes} onChange={(e) => setF('mes', e.target.value)} className={FILTER}>
          <option value="">Todos los meses</option>
          {MESES.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100/90 bg-white shadow-card-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200/90 bg-neutral-50/60">
                {TABLE_COLS.map((col) => (
                  <th key={col} className="px-5 py-3.5 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500">
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
                      <td key={c} className="px-5 py-4">
                        <div className="h-4 animate-pulse rounded bg-neutral-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/40">
                      <td className="px-5 py-3.5 text-sm font-medium text-ag-ink">{u.vin}</td>
                      <td className="px-5 py-3.5 text-sm text-ag-ink">{u.marca}</td>
                      <td className="px-5 py-3.5 text-sm text-ag-ink">{u.modelo}</td>
                      <td className="px-5 py-3.5 text-sm text-ag-ink">{u.sede}</td>
                      <td className="px-5 py-3.5 text-sm text-ag-ink">{u.certificacion.certificadora || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-ag-ink">{u.certificacion.folio || '—'}</td>
                      <td className="px-5 py-3.5"><Badge status={u.certificacion.condicion} /></td>
                      <td className="px-5 py-3.5 text-sm text-ag-ink">{u.certificacion.fechaEmision || '—'}</td>
                      <td className="px-5 py-3.5">
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
                        No hay certificaciones con estos filtros.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
