import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { SEDES, TIPOS_CONVERSION, MESES, ANIOS } from '../constants/datos'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

const TABLE_COLS = ['VIN', 'Marca', 'Modelo', 'Sede', 'Tipo', 'Sistema', 'Técnico', 'Fecha Inicio', 'Fecha Fin', 'Estado', '']

const FILTER = 'min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-ag-ink outline-none transition focus:border-ag-red focus:ring-2 focus:ring-ag-red/20 font-barlow'

export default function Conversiones() {
  const navigate = useNavigate()
  const [conversiones, setConversiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    sede: '',
    mes: new Date().getMonth().toString(),
    anio: new Date().getFullYear().toString(),
    estado: '',
    tipo: '',
  })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      const conFechas = docs.filter((d) => d.conversion?.fechaFin)
      conFechas.sort((a, b) => new Date(b.conversion.fechaFin) - new Date(a.conversion.fechaFin))
      setConversiones(conFechas)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = conversiones.filter((c) => {
    if (filtros.sede && c.sede !== filtros.sede) return false
    if (filtros.estado && c.estado !== filtros.estado) return false
    if (filtros.tipo && c.tipoConversion !== filtros.tipo) return false
    const [y, m] = c.conversion.fechaFin.split('-')
    if (filtros.mes !== '' && (parseInt(m, 10) - 1).toString() !== filtros.mes) return false
    if (filtros.anio !== '' && y !== filtros.anio) return false
    return true
  })

  const setF = (k, v) => setFiltros((f) => ({ ...f, [k]: v }))

  return (
    <div className="font-barlow text-ag-ink">
      <PageHeader
        title="CONVERSIONES"
        action={
          <button
            type="button"
            onClick={() => navigate('/unidades')}
            className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-card transition-colors hover:bg-ag-red-dark"
          >
            Nueva conversión
          </button>
        }
      />

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-neutral-100/90 bg-white p-4 shadow-card-md sm:p-5">
        <select value={filtros.sede}   onChange={(e) => setF('sede', e.target.value)}   className={`${FILTER} flex-1 min-w-[140px]`}>
          <option value="">Todas las sedes</option>
          {SEDES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filtros.mes}    onChange={(e) => setF('mes', e.target.value)}    className={`${FILTER} flex-1 min-w-[140px]`}>
          <option value="">Todos los meses</option>
          {MESES.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>
        <select value={filtros.anio}   onChange={(e) => setF('anio', e.target.value)}   className={`${FILTER} flex-1 min-w-[100px]`}>
          <option value="">Todos los años</option>
          {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filtros.estado} onChange={(e) => setF('estado', e.target.value)} className={`${FILTER} flex-1 min-w-[140px]`}>
          <option value="">Todos los estados</option>
          <option value="Por Convertir">Por convertir</option>
          <option value="Convertido">Convertido</option>
        </select>
        <select value={filtros.tipo}   onChange={(e) => setF('tipo', e.target.value)}   className={`${FILTER} flex-1 min-w-[100px]`}>
          <option value="">Todos los tipos</option>
          {TIPOS_CONVERSION.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100/90 bg-white shadow-card-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200/90 bg-neutral-50/60">
                {TABLE_COLS.map((col) => (
                  <th key={col} className="px-4 py-3.5 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500 sm:px-5">
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
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/40">
                      <td className="px-4 py-3.5 text-sm font-medium text-ag-ink sm:px-5">{c.vin}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{c.marca}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{c.modelo}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{c.sede}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{c.tipoConversion}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{c.conversion?.sistema || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{c.conversion?.tecnico || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{c.conversion?.fechaInicio || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-ag-ink sm:px-5">{c.conversion?.fechaFin || '—'}</td>
                      <td className="px-4 py-3.5 sm:px-5"><Badge status={c.estado} /></td>
                      <td className="px-4 py-3.5 sm:px-5">
                        <button
                          type="button"
                          onClick={() => navigate(`/unidades/${c.vin}`)}
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
                        No hay conversiones en este periodo
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
