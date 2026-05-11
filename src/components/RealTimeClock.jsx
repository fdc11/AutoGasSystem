import { useState, useEffect } from 'react'

function capitalizeEs(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function RealTimeClock() {
  const [label, setLabel] = useState('')
  const [iso, setIso] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setIso(now.toISOString())
      const weekday = capitalizeEs(
        new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(now)
      )
      const day = now.getDate()
      const month = capitalizeEs(
        new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now)
      )
      const year = now.getFullYear()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      setLabel(`${weekday} ${day} de ${month}, ${year} — ${hh}:${mm}:${ss}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <time
      dateTime={iso || undefined}
      className="font-barlow text-sm font-normal tabular-nums sm:text-[0.9375rem]"
      style={{ color: '#6b7280' }}
      suppressHydrationWarning
    >
      {label}
    </time>
  )
}
