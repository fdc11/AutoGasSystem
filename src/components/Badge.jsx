/**
 * Badge — componente reutilizable para mostrar estados con color semántico.
 * Reemplaza las 6 funciones renderBadge/EstadoBadge duplicadas en cada página.
 *
 * Uso:
 *   <Badge status="Convertido" />
 *   <Badge status="PENDIENTE" />
 *   <Badge status="EMITIDO" />
 */

const STATUS_MAP = {
  // Estados de unidad
  convertido:      { bg: 'bg-emerald-500/15', text: 'text-emerald-600' },
  'por convertir': { bg: 'bg-amber-500/15',   text: 'text-amber-600'   },

  // Estados de factura
  cancelado: { bg: 'bg-emerald-500/15', text: 'text-emerald-600' },
  pendiente:  { bg: 'bg-amber-500/15',  text: 'text-amber-600'   },
  vencida:    { bg: 'bg-ag-red/15',     text: 'text-ag-red'      },
  nc:         { bg: 'bg-neutral-200/60', text: 'text-neutral-500' },

  // Estados de certificación
  emitido:    { bg: 'bg-emerald-500/15', text: 'text-emerald-600' },
  ficticios:  { bg: 'bg-blue-500/15',   text: 'text-blue-500'    },

  // Estados de post-venta
  'al día':      { bg: 'bg-emerald-500/15', text: 'text-emerald-600' },
  'por vencer':  { bg: 'bg-amber-500/15',  text: 'text-amber-600'   },
  vencido:       { bg: 'bg-ag-red/15',     text: 'text-ag-red'      },
  'sin fecha':   { bg: 'bg-neutral-200/60', text: 'text-neutral-500' },
  'sin placa':   { bg: 'bg-neutral-200/60', text: 'text-neutral-500' },

  // Fallback genérico
  'próximo a vencer': { bg: 'bg-amber-500/15', text: 'text-amber-600' },
}

export default function Badge({ status }) {
  if (!status) return <span className="text-neutral-400">—</span>
  const key = status.toLowerCase()
  const style = STATUS_MAP[key] ?? { bg: 'bg-neutral-200/60', text: 'text-neutral-500' }

  return (
    <span
      className={`inline-block rounded px-2 py-1 text-[0.68rem] font-bold uppercase tracking-wide whitespace-nowrap ${style.bg} ${style.text}`}
    >
      {status}
    </span>
  )
}
