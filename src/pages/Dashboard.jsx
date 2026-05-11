import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'

function EstadoBadge({ estado }) {
  const isConvertido = estado === 'Convertido'
  const bg = isConvertido ? 'bg-emerald-500/15' : 'bg-amber-500/15'
  const color = isConvertido ? 'text-emerald-600' : 'text-amber-600'
  return (
    <span className={`inline-block rounded px-2 py-1 text-[0.7rem] font-bold uppercase tracking-wide ${bg} ${color}`}>
      {estado}
    </span>
  )
}

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    totalUnidades: 0,
    conversionesMes: 0,
    facturasPendientes: 0,
    certificadosEmitidos: 0,
  })
  const [ultimasUnidades, setUltimasUnidades] = useState([])

  useEffect(() => {
    const unsubscribeUnidades = onSnapshot(collection(db, 'unidades'), (snapshot) => {
      const docs = snapshot.docs.map((doc) => doc.data())

      const ahora = new Date()
      const mesActual = ahora.getMonth()
      const anioActual = ahora.getFullYear()

      let conversionesMes = 0
      let facturasPendientes = 0
      let certificadosEmitidos = 0

      docs.forEach((data) => {
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
        certificadosEmitidos,
      })
    })

    const qUltimas = query(collection(db, 'unidades'), orderBy('creadoEn', 'desc'), limit(5))
    const unsubscribeUltimas = onSnapshot(qUltimas, (snapshot) => {
      setUltimasUnidades(snapshot.docs.map((doc) => doc.data()))
    })

    return () => {
      unsubscribeUnidades()
      unsubscribeUltimas()
    }
  }, [])

  const kpiList = [
    { titulo: 'TOTAL UNIDADES', valor: kpis.totalUnidades, sub: 'Registradas en el sistema' },
    { titulo: 'CONVERSIONES', valor: kpis.conversionesMes, sub: 'Este mes' },
    { titulo: 'FACTURAS PENDIENTES', valor: kpis.facturasPendientes, sub: 'Por cobrar' },
    { titulo: 'CERTIFICADOS', valor: kpis.certificadosEmitidos, sub: 'Emitidos' },
  ]

  return (
    <div className="font-barlow text-ag-ink">
      <header className="mb-8">
        <h1 className="font-barlow-condensed text-4xl font-black uppercase tracking-tight text-ag-ink sm:text-[2.5rem]">
          Dash<span className="text-ag-red">board</span>
        </h1>
        <p className="mt-2 text-sm uppercase tracking-widest text-neutral-500">
          Resumen operativo — AutoGas Sistema
        </p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiList.map((kpi) => (
          <div
            key={kpi.titulo}
            className="rounded-lg border border-neutral-100 bg-white p-6 shadow-card"
          >
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500">
              {kpi.titulo}
            </p>
            <p className="font-barlow-condensed text-4xl font-black leading-none text-ag-ink">
              {kpi.valor}
            </p>
            <p className="mt-2 text-sm text-neutral-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-card">
        <div className="border-b border-neutral-200 px-6 py-5">
          <h2 className="font-barlow-condensed text-lg font-bold uppercase tracking-widest text-ag-ink">
            Últimas unidades registradas
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200">
                {['VIN', 'Marca', 'Modelo', 'Sede', 'Tipo', 'Estado'].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ultimasUnidades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-500">
                    No hay unidades registradas aún
                  </td>
                </tr>
              ) : (
                ultimasUnidades.map((u, i) => (
                  <tr key={i} className="border-b border-neutral-200 last:border-0">
                    <td className="px-6 py-3 text-sm font-medium text-ag-ink">{u.vin}</td>
                    <td className="px-6 py-3 text-sm text-ag-ink">{u.marca}</td>
                    <td className="px-6 py-3 text-sm text-ag-ink">{u.modelo}</td>
                    <td className="px-6 py-3 text-sm text-ag-ink">{u.sede}</td>
                    <td className="px-6 py-3 text-sm text-ag-ink">{u.tipoConversion}</td>
                    <td className="px-6 py-3">
                      <EstadoBadge estado={u.estado} />
                    </td>
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
