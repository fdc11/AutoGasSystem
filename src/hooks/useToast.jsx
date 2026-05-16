import { useState, useCallback } from 'react'
import Toast from '../components/Toast'

/**
 * useToast — hook para disparar notificaciones desde cualquier página.
 *
 * Uso:
 *   const { toast, ToastContainer } = useToast()
 *   toast('Guardado correctamente', 'success')
 *   toast('Error al guardar', 'error')
 *
 *   return (
 *     <>
 *       <ToastContainer />
 *       ...resto del JSX
 *     </>
 *   )
 */
export function useToast() {
  const [toastData, setToastData] = useState(null)

  const toast = useCallback((message, type = 'success') => {
    setToastData({ message, type, key: Date.now() })
  }, [])

  const ToastContainer = useCallback(() => {
    if (!toastData) return null
    return (
      <Toast
        key={toastData.key}
        message={toastData.message}
        type={toastData.type}
        onClose={() => setToastData(null)}
      />
    )
  }, [toastData])

  return { toast, ToastContainer }
}
