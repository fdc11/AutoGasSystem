const KPICard = ({ titulo, valor, subtitulo, color = '#e30613' }) => {
  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-6 shadow-card">
      <div className="mb-2 font-barlow text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500">
        {titulo}
      </div>
      <div
        className="mb-1 font-barlow-condensed text-4xl font-black leading-none"
        style={{ color }}
      >
        {valor}
      </div>
      {subtitulo && (
        <div className="font-barlow text-sm text-neutral-500">{subtitulo}</div>
      )}
      <div className="mt-4 h-0.5 rounded-full" style={{ backgroundColor: color }} />
    </div>
  )
}

export default KPICard
