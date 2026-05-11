/**
 * PageHeader — cabecera de página consistente para todas las vistas.
 * Reemplaza el copy-paste de h1 + línea roja + subtitle en cada página.
 *
 * Uso:
 *   <PageHeader title="UNIDADES" accent="ES" subtitle="Gestión de flota" />
 *   <PageHeader title="Dashboard" action={<button>Nueva</button>} />
 */
export default function PageHeader({ title, accent = '', subtitle, action }) {
  // Separa el texto base del acento (ej: "UNIDAD" + "ES" en rojo)
  const base = accent ? title.slice(0, title.length - accent.length) : title

  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-barlow-condensed text-4xl font-black uppercase tracking-tight text-ag-ink sm:text-[2.5rem]">
          {base}
          {accent && <span className="text-ag-red">{accent}</span>}
        </h1>
        <div className="mt-2 h-1 w-14 rounded-full bg-ag-red" aria-hidden />
        {subtitle && (
          <p className="mt-3 text-sm uppercase tracking-widest text-neutral-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
