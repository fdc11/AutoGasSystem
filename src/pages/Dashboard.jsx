import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    totalUnidades: 0,
    conversionesMes: 0,
    facturasPendientes: 0,
    certificadosEmitidos: 0,
  })
  const [ultimasUnidades, setUltimasUnidades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubAll = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map((doc) => doc.data())
      const ahora = new Date()
      const mesActual = ahora.getMonth()
      const anioActual = ahora.getFullYear()

      let conversionesMes = 0
      let facturasPendientes = 0
      let certificadosEmitidos = 0

      docs.forEach((data) => {
        if (data.estado === 'Convertido' && data.conversion?.fechaFin) {
          const fFin = data.conversion.fechaFin.toDate?.() ?? new Date(data.conversion.fechaFin)
          if (fFin.getMonth() === mesActual && fFin.getFullYear() === anioActual) conversionesMes++
        }
        if (data.facturacion?.estado === 'PENDIENTE') facturasPendientes++
        if (data.certificacion?.condicion === 'EMITIDO') certificadosEmitidos++
      })

      setKpis({ totalUnidades: snapshot.size, conversionesMes, facturasPendientes, certificadosEmitidos })
      setLoading(false)
    })

    const qUltimas = query(collection(db, 'unidades'), orderBy('creadoEn', 'desc'), limit(5))
    const unsubUltimas = onSnapshot(qUltimas, (snapshot) => {
      setUltimasUnidades(snapshot.docs.map((doc) => doc.data()))
    })

    return () => { unsubAll(); unsubUltimas() }
  }, [])

  const kpiList = [
    { titulo: 'TOTAL UNIDADES',      valor: kpis.totalUnidades,       sub: 'Registradas en el sistema', color: 'text-ag-red' },
    { titulo: 'CONVERSIONES',        valor: kpis.conversionesMes,     sub: 'Completadas este mes',      color: 'text-emerald-600' },
    { titulo: 'FACTURAS PENDIENTES', valor: kpis.facturasPendientes,  sub: 'Por cobrar',                color: 'text-amber-500' },
    { titulo: 'CERTIFICADOS',        valor: kpis.certificadosEmitidos, sub: 'Emitidos',                 color: 'text-blue-500' },
  ]

  const TABLE_COLS = ['VIN', 'Marca', 'Modelo', 'Sede', 'Tipo', 'Estado']

  return (
    <div className="font-barlow text-ag-ink">
      <PageHeader
        title="Dashboard"
        accent="board"
        subtitle="Resumen operativo — AutoGas Sistema"
      />

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiList.map((kpi) => (
          <div
            key={kpi.titulo}
            className="rounded-2xl border border-neutral-100/90 bg-white p-6 shadow-card-md transition-shadow hover:shadow-card"
          >
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500">
              {kpi.titulo}
            </p>
            {loading ? (
              <div className="h-10 w-16 animate-pulse rounded-lg bg-neutral-100" />
            ) : (
              <p className={`font-barlow-condensed text-4xl font-black leading-none ${kpi.color}`}>
                {kpi.valor}
              </p>
            )}
            <p className="mt-2 text-sm text-neutral-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Últimas unidades */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100/90 bg-white shadow-card-md">
        <div className="border-b border-neutral-200/90 bg-neutral-50/50 px-6 py-5">
          <h2 className="font-barlow-condensed text-lg font-bold uppercase tracking-widest text-ag-ink">
            Últimas unidades registradas
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200">
                {TABLE_COLS.map((col) => (
                  <th key={col} className="px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    {TABLE_COLS.map((c) => (
                      <td key={c} className="px-6 py-4">
                        <div className="h-4 animate-pulse rounded bg-neutral-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : ultimasUnidades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">
                    No hay unidades registradas aún
                  </td>
                </tr>
              ) : (
                ultimasUnidades.map((u, i) => (
                  <tr key={i} className="border-b border-neutral-200 last:border-0 hover:bg-neutral-50/40 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-ag-ink">{u.vin}</td>
                    <td className="px-6 py-3 text-sm text-ag-ink">{u.marca}</td>
                    <td className="px-6 py-3 text-sm text-ag-ink">{u.modelo}</td>
                    <td className="px-6 py-3 text-sm text-ag-ink">{u.sede}</td>
                    <td className="px-6 py-3 text-sm text-ag-ink">{u.tipoConversion}</td>
                    <td className="px-6 py-3"><Badge status={u.estado} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
