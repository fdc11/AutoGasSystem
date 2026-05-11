import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { SEDES } from '../constants/datos'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

const FILTER = 'min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-ag-ink outline-none transition focus:border-ag-red focus:ring-2 focus:ring-ag-red/20 font-barlow flex-1 min-w-[140px]'
const TABLE_COLS = ['VIN', 'Placa', 'Marca', 'Sede', 'Fecha Chip', 'Fecha Primer Anual', 'Estado Garantía', 'Observaciones']

function getEstadoAlerta(fechaPrimerAnual) {
  if (!fechaPrimerAnual) return 'Sin fecha'
  const diff = (new Date(fechaPrimerAnual) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'Vencido'
  if (diff <= 30) return 'Por vencer'
  return 'Al día'
}

export default function PostVenta() {
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ sede: '', estado: '' })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setUnidades(
        docs.filter((d) => d.postVenta?.fechaChip || d.postVenta?.fechaPrimerAnual || d.postVenta?.fechaGarantia)
      )
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = unidades.filter((u) => {
    if (filtros.sede && u.sede !== filtros.sede) return false
    if (filtros.estado && getEstadoAlerta(u.postVenta?.fechaPrimerAnual) !== filtros.estado) return false
    return true
  })

  const setF = (k, v) => setFiltros((f) => ({ ...f, [k]: v }))

  return (
    <div className="font-barlow text-ag-ink">
      <PageHeader title="POST-VENTA" />

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-neutral-100/90 bg-white p-4 shadow-card-md sm:p-5">
        <select value={filtros.sede} onChange={(e) => setF('sede', e.target.value)} className={FILTER}>
          <option value="">Todas las sedes</option>
          {SEDES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filtros.estado} onChange={(e) => setF('estado', e.target.value)} className={FILTER}>
          <option value="">Todos los estados</option>
          <option value="Al día">Al día</option>
          <option value="Por vencer">Por vencer</option>
          <option value="Vencido">Vencido</option>
          <option value="Sin fecha">Sin fecha</option>
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
                  {filtered.map((u) => {
                    const estado = getEstadoAlerta(u.postVenta?.fechaPrimerAnual)
                    return (
                      <tr key={u.id} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/40">
                        <td className="px-5 py-3.5 text-sm font-medium text-ag-ink">{u.vin}</td>
                        <td className="px-5 py-3.5 text-sm text-ag-ink">{u.placa || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-ag-ink">{u.marca}</td>
                        <td className="px-5 py-3.5 text-sm text-ag-ink">{u.sede}</td>
                        <td className="px-5 py-3.5 text-sm text-ag-ink">{u.postVenta?.fechaChip || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-ag-ink">{u.postVenta?.fechaPrimerAnual || '—'}</td>
                        <td className="px-5 py-3.5"><Badge status={estado} /></td>
                        <td className="px-5 py-3.5 max-w-[200px] truncate text-sm text-ag-ink">{u.postVenta?.observaciones || '—'}</td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={TABLE_COLS.length} className="px-5 py-12 text-center text-sm text-neutral-500">
                        No hay registros de post-venta con estos filtros.
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
