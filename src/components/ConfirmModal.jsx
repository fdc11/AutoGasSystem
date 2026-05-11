/**
 * ConfirmModal — reemplaza window.confirm() con un modal premium.
 * No bloquea el hilo principal y es consistente con el diseño del sistema.
 *
 * Uso:
 *   <ConfirmModal
 *     isOpen={showConfirm}
 *     title="Eliminar unidad"
 *     message="Esta acción no se puede deshacer."
 *     confirmLabel="Eliminar"
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowConfirm(false)}
 *     danger   // prop opcional para botón rojo
 *   />
 */
export default function ConfirmModal({
  isOpen,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-2xl">
        {/* Icono de advertencia */}
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-ag-red/10' : 'bg-amber-500/10'}`}>
          <svg
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke={danger ? '#e30613' : '#f59e0b'}
            strokeWidth="2" strokeLinecap="round" aria-hidden
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2
          id="confirm-title"
          className="font-barlow-condensed text-xl font-extrabold uppercase tracking-wide text-ag-ink"
        >
          {title}
        </h2>
        {message && (
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">{message}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-neutral-200 bg-white py-3 font-barlow text-sm font-semibold uppercase tracking-wide text-ag-ink transition-colors hover:border-neutral-300 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl py-3 font-barlow text-sm font-semibold uppercase tracking-wide text-white transition-colors disabled:opacity-50 ${
              danger
                ? 'bg-ag-red hover:bg-ag-red-dark'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
