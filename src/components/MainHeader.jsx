import RealTimeClock from './RealTimeClock'

function getInitials(email) {
  if (!email) return 'U'
  return email.charAt(0).toUpperCase()
}

export default function MainHeader({ usuario }) {
  return (
    <header className="mb-8 flex flex-col gap-3 border-b border-neutral-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div className="order-2 flex items-center gap-4 sm:order-1">
        <span className="font-barlow text-sm font-semibold text-ag-ink sm:text-base">
          Bienvenido, {usuario?.email?.split('@')[0] || 'Usuario'}
        </span>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ag-red font-barlow-condensed text-lg font-bold text-white sm:h-10 sm:w-10 sm:text-xl"
          aria-hidden
        >
          {getInitials(usuario?.email)}
        </div>
      </div>
      <div className="order-1 flex w-full justify-end sm:order-2 sm:w-auto">
        <RealTimeClock />
      </div>
    </header>
  )
}
