import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Badge from '../components/Badge'
import ConfirmModal from '../components/ConfirmModal'
import {
  SEDES, CONCESIONARIAS, TIPOS_CONVERSION, SISTEMAS, MODALIDADES, BONOS,
  CERTIFICADORAS, REDUCTORES, ELECTRONICAS, TANQUES, CAPACIDAD_GLP, CAPACIDAD_GNV,
  CILINDROS, MEDIOS_PAGO, ESTADOS_FACTURA, CONDICION_FOLIO, TIPOS_TANQUE, TIPOS_PAGO
} from '../constants/datos'

const INPUT = 'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 font-barlow text-sm text-ag-ink placeholder:text-neutral-400 outline-none transition focus:border-ag-red focus:ring-2 focus:ring-ag-red/20'
const LABEL = 'mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500'

function CardTitle({ title, onEdit, editLabel = 'EDITAR' }) {
  return (
    <div className="mb-5 flex items-center justify-between border-b border-neutral-200/80 pb-3">
      <h2 className="font-barlow-condensed text-xl font-extrabold uppercase tracking-widest text-ag-ink">
        {title}
      </h2>
      {onEdit && (
        <button
          onClick={onEdit}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ag-ink transition-colors hover:border-ag-red hover:text-ag-red"
        >
          {editLabel}
        </button>
      )}
    </div>
  )
}

function DataItem({ label, value, span }) {
  return (
    <div className={`flex flex-col ${span ? 'col-span-full' : ''}`}>
      <span className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500">
        {label}
      </span>
      <span className="font-medium text-ag-ink">{value || <span className="text-neutral-400">—</span>}</span>
    </div>
  )
}

function getPostVentaStatus(fecha) {
  if (!fecha) return null
  const diff = (new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'Vencido'
  if (diff <= 30) return 'Por vencer'
  return 'Al día'
}

function getFacturaStatus(fVenc, estado) {
  if (estado === 'CANCELADO') return 'Cancelado'
  if (estado === 'NC') return 'NC'
  if (estado === 'PENDIENTE') {
    if (!fVenc) return 'Pendiente'
    return new Date(fVenc) < new Date() ? 'Vencida' : 'Pendiente'
  }
  return estado
}

export default function FichaUnidad() {
  const { vin } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { toast, ToastContainer } = useToast()
  
  const [unidad, setUnidad] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formVehiculo, setFormVehiculo] = useState({})
  const [formConversion, setFormConversion] = useState({ reductor: {}, electronica: {}, tanque: {} })
  const [formCertificacion, setFormCertificacion] = useState({})
  const [formFacturacion, setFormFacturacion] = useState({})
  const [formPostVenta, setFormPostVenta] = useState({})

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'unidades', vin), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setUnidad(data)
        
        setFormVehiculo({
          marca: data.marca || '', modelo: data.modelo || '', anio: data.anio || '', color: data.color || '',
          placa: data.placa || '', sede: data.sede || '', concesionaria: data.concesionaria || '',
          tipoConversion: data.tipoConversion || '', bloque: data.bloque || '', fechaIngreso: data.fechaIngreso || '', estado: data.estado || '',
          motorSerie: data.motorSerie || '', folioInterno: data.folioInterno || '', fichaRecepcion: data.fichaRecepcion || '',
          fechaEntrega: data.fechaEntrega || '', tecnicoElectronico: data.tecnicoElectronico || '', tecnicoMecanico: data.tecnicoMecanico || '',
          observacionRecepcion: data.observacionRecepcion || ''
        })
        
        setFormConversion({
          sistema: data.conversion?.sistema || '', modalidad: data.conversion?.modalidad || '', bono: data.conversion?.bono || '',
          tecnico: data.conversion?.tecnico || '', fechaInicio: data.conversion?.fechaInicio || '', fechaFin: data.conversion?.fechaFin || '',
          cilindros: data.conversion?.cilindros || '', medioPago: data.conversion?.medioPago || '',
          reductor: { marca: data.conversion?.reductor?.marca || '', serie: data.conversion?.reductor?.serie || '' },
          electronica: { marca: data.conversion?.electronica?.marca || '', serie: data.conversion?.electronica?.serie || '' },
          tanque: { marca: data.conversion?.tanque?.marca || '', capacidad: data.conversion?.tanque?.capacidad || '', serie: data.conversion?.tanque?.serie || '', fechaFabricacion: data.conversion?.tanque?.fechaFabricacion || '', tipoTanque: data.conversion?.tanque?.tipoTanque || '', serieProducte: data.conversion?.tanque?.serieProducte || '' }
        })

        setFormCertificacion({
          certificadora: data.certificacion?.certificadora || '', folio: data.certificacion?.folio || '',
          condicion: data.certificacion?.condicion || '', fechaEmision: data.certificacion?.fechaEmision || ''
        })

        setFormFacturacion({
          numeroFactura: data.facturacion?.numeroFactura || '', receptor: data.facturacion?.receptor || '',
          monto: data.facturacion?.monto || '', condicion: data.facturacion?.condicion || '',
          fechaEmision: data.facturacion?.fechaEmision || '', fechaVencimiento: data.facturacion?.fechaVencimiento || '',
          estado: data.facturacion?.estado || 'PENDIENTE', reembolsoComision: data.facturacion?.reembolsoComision || '',
          fechaCancelacion: data.facturacion?.fechaCancelacion || '', tipoPago: data.facturacion?.tipoPago || ''
        })

        setFormPostVenta({
          fechaChip: data.postVenta?.fechaChip || '', fechaPrimerAnual: data.postVenta?.fechaPrimerAnual || '',
          fechaGarantia: data.postVenta?.fechaGarantia || '', detalleGarantia: data.postVenta?.detalleGarantia || '',
          observaciones: data.postVenta?.observaciones || ''
        })
      }
      setLoading(false)
    })
    return () => unsub()
  }, [vin])

  const registrarHistorial = async (descripcion, updateData) => {
    setSubmitting(true)
    try {
      const nuevoHistorial = [...(unidad.historial || []), {
        fecha: Timestamp.now(),
        usuario: usuario?.email || 'Usuario Desconocido',
        accion: 'Edición',
        detalle: descripcion
      }]
      await updateDoc(doc(db, 'unidades', vin), {
        ...updateData,
        historial: nuevoHistorial,
        actualizadoEn: Timestamp.now()
      })
      toast('Cambios guardados correctamente', 'success')
      setModalOpen(null)
    } catch (err) {
      console.error(err)
      toast('Error al guardar cambios', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminarUnidad = async () => {
    setSubmitting(true)
    try {
      await deleteDoc(doc(db, 'unidades', vin))
      toast('Unidad eliminada', 'success')
      navigate('/unidades')
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast('Error al eliminar unidad', 'error')
    } finally {
      setSubmitting(false)
      setShowConfirmDelete(false)
    }
  }

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-ag-red" />
    </div>
  )

  if (!unidad) return <div className="p-8 text-center text-neutral-500">Unidad no encontrada</div>

  return (
    <div className="font-barlow text-ag-ink pb-20">
      <ToastContainer />
      <ConfirmModal
        isOpen={showConfirmDelete}
        title="Eliminar Unidad"
        message={`¿Estás seguro de que deseas eliminar la unidad con VIN ${vin}? Esta acción borrará todos sus datos e historial permanentemente.`}
        confirmLabel="Sí, eliminar"
        danger
        loading={submitting}
        onConfirm={handleEliminarUnidad}
        onCancel={() => setShowConfirmDelete(false)}
      />

      {/* Header Ficha */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-widest text-neutral-500">
            <button onClick={() => navigate('/unidades')} className="hover:text-ag-red transition-colors">UNIDADES</button>
            <span className="mx-2">/</span>
            <span className="text-ag-red">{vin}</span>
          </p>
          <h1 className="font-barlow-condensed text-4xl font-black uppercase tracking-tight text-ag-ink sm:text-[2.5rem]">
            FICHA <span className="text-ag-red">UNIDAD</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="rounded-xl border-2 border-ag-red bg-transparent px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ag-red transition-colors hover:bg-ag-red hover:text-white"
          >
            Eliminar
          </button>
          <button
            onClick={() => navigate('/unidades')}
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-widest text-ag-ink transition-colors hover:border-neutral-300"
          >
            Volver
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* VEHÍCULO */}
        <div className="rounded-2xl border border-neutral-100/90 bg-white p-6 shadow-card-md sm:p-8">
          <CardTitle title="Datos del Vehículo" onEdit={() => setModalOpen('vehiculo')} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <DataItem label="VIN" value={unidad.vin} />
            <DataItem label="Marca" value={unidad.marca} />
            <DataItem label="Modelo" value={unidad.modelo} />
            <DataItem label="Año" value={unidad.anio} />
            <DataItem label="Color" value={unidad.color} />
            <DataItem label="Placa" value={unidad.placa ? unidad.placa : <Badge status="Sin placa" />} />
            <DataItem label="Sede" value={unidad.sede} />
            <DataItem label="Concesionaria" value={unidad.concesionaria} />
            <DataItem label="Tipo Conversión" value={unidad.tipoConversion} />
            <DataItem label="Bloque" value={unidad.bloque} />
            <DataItem label="Fecha Ingreso" value={unidad.fechaIngreso} />
            <div className="flex flex-col">
              <span className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500">Estado</span>
              <div><Badge status={unidad.estado} /></div>
            </div>
            <DataItem label="Motor Serie" value={unidad.motorSerie} />
            <DataItem label="Folio Interno" value={unidad.folioInterno} />
            <DataItem label="Ficha Recepción" value={unidad.fichaRecepcion} />
            <DataItem label="Fecha Entrega" value={unidad.fechaEntrega} />
            <DataItem label="Técnico Electrónico" value={unidad.tecnicoElectronico} />
            <DataItem label="Técnico Mecánico" value={unidad.tecnicoMecanico} />
            <DataItem label="Observación Recepción" value={unidad.observacionRecepcion} span />
          </div>
        </div>

        {/* CONVERSIÓN */}
        <div className="rounded-2xl border border-neutral-100/90 bg-white p-6 shadow-card-md sm:p-8">
          <CardTitle title="Conversión" onEdit={() => setModalOpen('conversion')} editLabel="REGISTRAR/EDITAR" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <DataItem label="Sistema" value={unidad.conversion?.sistema} />
            <DataItem label="Modalidad" value={unidad.conversion?.modalidad} />
            <DataItem label="Bono" value={unidad.conversion?.bono} />
            <DataItem label="Técnico" value={unidad.conversion?.tecnico} />
            <DataItem label="Fecha Inicio" value={unidad.conversion?.fechaInicio} />
            <DataItem label="Fecha Fin" value={unidad.conversion?.fechaFin} />
            <DataItem label="Cilindros" value={unidad.conversion?.cilindros} />
            <DataItem label="Medio Pago" value={unidad.conversion?.medioPago} />
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-neutral-50 p-5 border border-neutral-100">
              <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-widest text-ag-red">Reductor</p>
              <div className="grid grid-cols-2 gap-4">
                <DataItem label="Marca" value={unidad.conversion?.reductor?.marca} />
                <DataItem label="N° Serie" value={unidad.conversion?.reductor?.serie} />
              </div>
            </div>
            <div className="rounded-xl bg-neutral-50 p-5 border border-neutral-100">
              <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-widest text-ag-red">Electrónica</p>
              <div className="grid grid-cols-2 gap-4">
                <DataItem label="Marca" value={unidad.conversion?.electronica?.marca} />
                <DataItem label="N° Serie" value={unidad.conversion?.electronica?.serie} />
              </div>
            </div>
            <div className="rounded-xl bg-neutral-50 p-5 border border-neutral-100 md:col-span-2 lg:col-span-1">
              <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-widest text-ag-red">Tanque</p>
              <div className="grid grid-cols-2 gap-4">
                <DataItem label="Marca" value={unidad.conversion?.tanque?.marca} />
                <DataItem label="Capacidad GL" value={unidad.conversion?.tanque?.capacidad} />
                <DataItem label="Tipo Tanque" value={unidad.conversion?.tanque?.tipoTanque} span />
                <DataItem label="N° Serie" value={unidad.conversion?.tanque?.serie} />
                <DataItem label="Serie Producte" value={unidad.conversion?.tanque?.serieProducte} />
                <DataItem label="F. Fabricación" value={unidad.conversion?.tanque?.fechaFabricacion} />
              </div>
            </div>
          </div>
        </div>

        {/* CERTIFICACIÓN */}
        <div className="rounded-2xl border border-neutral-100/90 bg-white p-6 shadow-card-md sm:p-8">
          <CardTitle title="Certificación" onEdit={() => setModalOpen('certificacion')} editLabel="REGISTRAR/EDITAR" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
            <DataItem label="Certificadora" value={unidad.certificacion?.certificadora} />
            <DataItem label="N° Folio" value={unidad.certificacion?.folio} />
            <div className="flex flex-col">
              <span className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500">Condición</span>
              <div><Badge status={unidad.certificacion?.condicion} /></div>
            </div>
            <DataItem label="Fecha Emisión" value={unidad.certificacion?.fechaEmision} />
          </div>
        </div>

        {/* FACTURACIÓN */}
        <div className="rounded-2xl border border-neutral-100/90 bg-white p-6 shadow-card-md sm:p-8">
          <CardTitle title="Facturación" onEdit={() => setModalOpen('facturacion')} editLabel="REGISTRAR/EDITAR" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <DataItem label="N° Factura" value={unidad.facturacion?.numeroFactura} />
            <DataItem label="Receptor" value={unidad.facturacion?.receptor} />
            <DataItem label="Monto" value={unidad.facturacion?.monto ? `$${Number(unidad.facturacion.monto).toLocaleString('en-US', {minimumFractionDigits: 2})}` : null} />
            <DataItem label="Condición" value={unidad.facturacion?.condicion} />
            <DataItem label="Fecha Emisión" value={unidad.facturacion?.fechaEmision} />
            <DataItem label="Fecha Vencimiento" value={unidad.facturacion?.fechaVencimiento} />
            <DataItem label="Tipo de Pago" value={unidad.facturacion?.tipoPago} />
            <DataItem label="Reembolso/Comisión" value={unidad.facturacion?.reembolsoComision ? `$${Number(unidad.facturacion.reembolsoComision).toLocaleString('en-US', {minimumFractionDigits: 2})}` : null} />
            <DataItem label="Fecha Cancelación" value={unidad.facturacion?.fechaCancelacion} />
            <div className="flex flex-col">
              <span className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500">Estado</span>
              <div><Badge status={getFacturaStatus(unidad.facturacion?.fechaVencimiento, unidad.facturacion?.estado)} /></div>
            </div>
          </div>
        </div>

        {/* POST-VENTA */}
        <div className="rounded-2xl border border-neutral-100/90 bg-white p-6 shadow-card-md sm:p-8">
          <CardTitle title="Post-Venta" onEdit={() => setModalOpen('postventa')} editLabel="REGISTRAR/EDITAR" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
            <DataItem label="Fecha Activación Chip" value={unidad.postVenta?.fechaChip} />
            <div className="flex flex-col">
              <span className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-neutral-500">Fecha Primer Anual</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-ag-ink">{unidad.postVenta?.fechaPrimerAnual || <span className="text-neutral-400">—</span>}</span>
                {unidad.postVenta?.fechaPrimerAnual && <Badge status={getPostVentaStatus(unidad.postVenta?.fechaPrimerAnual)} />}
              </div>
            </div>
            <DataItem label="Fecha Cambio Garantía" value={unidad.postVenta?.fechaGarantia} />
            <DataItem label="Detalle Garantía" value={unidad.postVenta?.detalleGarantia} />
            <DataItem label="Observaciones" value={unidad.postVenta?.observaciones} span />
          </div>
        </div>

        {/* HISTORIAL */}
        <div className="rounded-2xl border border-neutral-100/90 bg-white p-6 shadow-card-md sm:p-8">
          <CardTitle title="Historial de Modificaciones" />
          <div className="flex flex-col gap-4">
            {unidad.historial && unidad.historial.length > 0 ? (
              [...unidad.historial].sort((a, b) => b.fecha.seconds - a.fecha.seconds).map((h, i) => (
                <div key={i} className="border-l-2 border-ag-red pl-4">
                  <p className="mb-1 font-medium text-ag-ink">{h.detalle}</p>
                  <p className="text-[0.7rem] uppercase tracking-widest text-neutral-500">
                    {new Date(h.fecha.toDate()).toLocaleString('es-PE')} — {h.usuario}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No hay historial registrado.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl sm:p-8">
            {/* Modal Vehículo */}
            {modalOpen === 'vehiculo' && (
              <form onSubmit={(e) => { e.preventDefault(); registrarHistorial('Actualización de vehículo', { ...formVehiculo, anio: Number(formVehiculo.anio), placa: formVehiculo.placa || null }) }}>
                <h2 className="mb-6 font-barlow-condensed text-2xl font-extrabold uppercase tracking-wide text-ag-ink">Editar Vehículo</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div><label className={LABEL}>Marca</label><input type="text" value={formVehiculo.marca} onChange={e=>setFormVehiculo({...formVehiculo, marca: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Modelo</label><input type="text" value={formVehiculo.modelo} onChange={e=>setFormVehiculo({...formVehiculo, modelo: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Año</label><input type="number" value={formVehiculo.anio} onChange={e=>setFormVehiculo({...formVehiculo, anio: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Color</label><input type="text" value={formVehiculo.color} onChange={e=>setFormVehiculo({...formVehiculo, color: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Placa</label><input type="text" value={formVehiculo.placa} onChange={e=>setFormVehiculo({...formVehiculo, placa: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Sede</label><select value={formVehiculo.sede} onChange={e=>setFormVehiculo({...formVehiculo, sede: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{SEDES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className={LABEL}>Concesionaria</label><select value={formVehiculo.concesionaria} onChange={e=>setFormVehiculo({...formVehiculo, concesionaria: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{CONCESIONARIAS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className={LABEL}>Tipo Conversión</label><select value={formVehiculo.tipoConversion} onChange={e=>setFormVehiculo({...formVehiculo, tipoConversion: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{TIPOS_CONVERSION.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className={LABEL}>Bloque</label><input type="text" value={formVehiculo.bloque} onChange={e=>setFormVehiculo({...formVehiculo, bloque: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Ingreso</label><input type="date" value={formVehiculo.fechaIngreso} onChange={e=>setFormVehiculo({...formVehiculo, fechaIngreso: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Estado</label><select value={formVehiculo.estado} onChange={e=>setFormVehiculo({...formVehiculo, estado: e.target.value})} className={INPUT}><option value="Por Convertir">Por Convertir</option><option value="Convertido">Convertido</option></select></div>
                  <div><label className={LABEL}>Motor Serie</label><input type="text" value={formVehiculo.motorSerie} onChange={e=>setFormVehiculo({...formVehiculo, motorSerie: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Folio Interno</label><input type="text" value={formVehiculo.folioInterno} onChange={e=>setFormVehiculo({...formVehiculo, folioInterno: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Ficha Recepción</label><input type="text" value={formVehiculo.fichaRecepcion} onChange={e=>setFormVehiculo({...formVehiculo, fichaRecepcion: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Entrega</label><input type="date" value={formVehiculo.fechaEntrega} onChange={e=>setFormVehiculo({...formVehiculo, fechaEntrega: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Téc. Electrónico</label><input type="text" value={formVehiculo.tecnicoElectronico} onChange={e=>setFormVehiculo({...formVehiculo, tecnicoElectronico: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Téc. Mecánico</label><input type="text" value={formVehiculo.tecnicoMecanico} onChange={e=>setFormVehiculo({...formVehiculo, tecnicoMecanico: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div className="col-span-full"><label className={LABEL}>Observación Recepción</label><textarea value={formVehiculo.observacionRecepcion} onChange={e=>setFormVehiculo({...formVehiculo, observacionRecepcion: e.target.value})} className={`${INPUT} min-h-[60px] resize-y`} /></div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(null)} className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ag-ink hover:border-neutral-300">Cancelar</button>
                  <button type="submit" disabled={submitting} className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-ag-red-dark disabled:opacity-60">{submitting ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            )}

            {/* Modal Conversión */}
            {modalOpen === 'conversion' && (
              <form onSubmit={(e) => { e.preventDefault(); registrarHistorial('Actualización de conversión', { conversion: formConversion }) }}>
                <h2 className="mb-6 font-barlow-condensed text-2xl font-extrabold uppercase tracking-wide text-ag-ink">Editar Conversión</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className={LABEL}>Sistema</label><select value={formConversion.sistema} onChange={e=>setFormConversion({...formConversion, sistema: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{SISTEMAS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className={LABEL}>Modalidad</label><select value={formConversion.modalidad} onChange={e=>setFormConversion({...formConversion, modalidad: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{MODALIDADES.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                  <div><label className={LABEL}>Bono</label><select value={formConversion.bono} onChange={e=>setFormConversion({...formConversion, bono: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{BONOS.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
                  <div><label className={LABEL}>Técnico</label><input type="text" value={formConversion.tecnico} onChange={e=>setFormConversion({...formConversion, tecnico: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Inicio</label><input type="date" value={formConversion.fechaInicio} onChange={e=>setFormConversion({...formConversion, fechaInicio: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Fin</label><input type="date" value={formConversion.fechaFin} onChange={e=>setFormConversion({...formConversion, fechaFin: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Cilindros</label><select value={formConversion.cilindros} onChange={e=>setFormConversion({...formConversion, cilindros: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{CILINDROS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className={LABEL}>Medio Pago</label><select value={formConversion.medioPago} onChange={e=>setFormConversion({...formConversion, medioPago: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{MEDIOS_PAGO.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                  
                  <div className="col-span-full mt-4"><p className="font-bold uppercase tracking-widest text-ag-red text-xs">Reductor</p></div>
                  <div><label className={LABEL}>Marca</label><select value={formConversion.reductor.marca} onChange={e=>setFormConversion({...formConversion, reductor: {...formConversion.reductor, marca: e.target.value}})} className={INPUT}><option value="">Seleccionar</option>{REDUCTORES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label className={LABEL}>N° Serie</label><input type="text" value={formConversion.reductor.serie} onChange={e=>setFormConversion({...formConversion, reductor: {...formConversion.reductor, serie: e.target.value.toUpperCase()}})} className={INPUT} /></div>

                  <div className="col-span-full mt-2"><p className="font-bold uppercase tracking-widest text-ag-red text-xs">Electrónica</p></div>
                  <div><label className={LABEL}>Marca</label><select value={formConversion.electronica.marca} onChange={e=>setFormConversion({...formConversion, electronica: {...formConversion.electronica, marca: e.target.value}})} className={INPUT}><option value="">Seleccionar</option>{ELECTRONICAS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label className={LABEL}>N° Serie</label><input type="text" value={formConversion.electronica.serie} onChange={e=>setFormConversion({...formConversion, electronica: {...formConversion.electronica, serie: e.target.value.toUpperCase()}})} className={INPUT} /></div>

                  <div className="col-span-full mt-2"><p className="font-bold uppercase tracking-widest text-ag-red text-xs">Tanque</p></div>
                  <div><label className={LABEL}>Marca</label><select value={formConversion.tanque.marca} onChange={e=>setFormConversion({...formConversion, tanque: {...formConversion.tanque, marca: e.target.value}})} className={INPUT}><option value="">Seleccionar</option>{TANQUES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label className={LABEL}>Capacidad GL</label><select value={formConversion.tanque.capacidad} onChange={e=>setFormConversion({...formConversion, tanque: {...formConversion.tanque, capacidad: e.target.value}})} className={INPUT}><option value="">Seleccionar</option>{(unidad.tipoConversion === 'GNV' ? CAPACIDAD_GNV : CAPACIDAD_GLP).map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label className={LABEL}>Tipo Tanque</label><select value={formConversion.tanque.tipoTanque} onChange={e=>setFormConversion({...formConversion, tanque: {...formConversion.tanque, tipoTanque: e.target.value}})} className={INPUT}><option value="">Seleccionar</option>{TIPOS_TANQUE.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label className={LABEL}>N° Serie</label><input type="text" value={formConversion.tanque.serie} onChange={e=>setFormConversion({...formConversion, tanque: {...formConversion.tanque, serie: e.target.value.toUpperCase()}})} className={INPUT} /></div>
                  <div><label className={LABEL}>Serie Producte</label><input type="text" value={formConversion.tanque.serieProducte} onChange={e=>setFormConversion({...formConversion, tanque: {...formConversion.tanque, serieProducte: e.target.value.toUpperCase()}})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Fabricación</label><input type="date" value={formConversion.tanque.fechaFabricacion} onChange={e=>setFormConversion({...formConversion, tanque: {...formConversion.tanque, fechaFabricacion: e.target.value}})} className={INPUT} /></div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(null)} className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ag-ink hover:border-neutral-300">Cancelar</button>
                  <button type="submit" disabled={submitting} className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-ag-red-dark disabled:opacity-60">{submitting ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            )}

            {/* Modal Certificación */}
            {modalOpen === 'certificacion' && (
              <form onSubmit={(e) => { e.preventDefault(); registrarHistorial('Actualización de certificación', { certificacion: formCertificacion }) }}>
                <h2 className="mb-6 font-barlow-condensed text-2xl font-extrabold uppercase tracking-wide text-ag-ink">Editar Certificación</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className={LABEL}>Certificadora</label><select value={formCertificacion.certificadora} onChange={e=>setFormCertificacion({...formCertificacion, certificadora: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{CERTIFICADORAS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className={LABEL}>N° Folio</label><input type="text" value={formCertificacion.folio} onChange={e=>setFormCertificacion({...formCertificacion, folio: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Condición</label><select value={formCertificacion.condicion} onChange={e=>setFormCertificacion({...formCertificacion, condicion: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{CONDICION_FOLIO.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className={LABEL}>Fecha Emisión</label><input type="date" value={formCertificacion.fechaEmision} onChange={e=>setFormCertificacion({...formCertificacion, fechaEmision: e.target.value})} className={INPUT} /></div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(null)} className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ag-ink hover:border-neutral-300">Cancelar</button>
                  <button type="submit" disabled={submitting} className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-ag-red-dark disabled:opacity-60">{submitting ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            )}

            {/* Modal Facturación */}
            {modalOpen === 'facturacion' && (
              <form onSubmit={(e) => { e.preventDefault(); registrarHistorial('Actualización de facturación', { facturacion: { ...formFacturacion, monto: Number(formFacturacion.monto), reembolsoComision: Number(formFacturacion.reembolsoComision || 0) } }) }}>
                <h2 className="mb-6 font-barlow-condensed text-2xl font-extrabold uppercase tracking-wide text-ag-ink">Editar Facturación</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className={LABEL}>N° Factura</label><input type="text" value={formFacturacion.numeroFactura} onChange={e=>setFormFacturacion({...formFacturacion, numeroFactura: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Receptor</label><select value={formFacturacion.receptor} onChange={e=>setFormFacturacion({...formFacturacion, receptor: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{CONCESIONARIAS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className={LABEL}>Monto ($)</label><input type="number" step="0.01" value={formFacturacion.monto} onChange={e=>setFormFacturacion({...formFacturacion, monto: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Condición Pago</label><input type="text" value={formFacturacion.condicion} onChange={e=>setFormFacturacion({...formFacturacion, condicion: e.target.value.toUpperCase()})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Emisión</label><input type="date" value={formFacturacion.fechaEmision} onChange={e=>setFormFacturacion({...formFacturacion, fechaEmision: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Vencimiento</label><input type="date" value={formFacturacion.fechaVencimiento} onChange={e=>setFormFacturacion({...formFacturacion, fechaVencimiento: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Tipo de Pago</label><select value={formFacturacion.tipoPago} onChange={e=>setFormFacturacion({...formFacturacion, tipoPago: e.target.value})} className={INPUT}><option value="">Seleccionar</option>{TIPOS_PAGO.map(e=><option key={e} value={e}>{e}</option>)}</select></div>
                  <div><label className={LABEL}>Reembolso/Comisión ($)</label><input type="number" step="0.01" value={formFacturacion.reembolsoComision} onChange={e=>setFormFacturacion({...formFacturacion, reembolsoComision: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Cancelación</label><input type="date" value={formFacturacion.fechaCancelacion} onChange={e=>setFormFacturacion({...formFacturacion, fechaCancelacion: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Estado</label><select value={formFacturacion.estado} onChange={e=>setFormFacturacion({...formFacturacion, estado: e.target.value})} className={INPUT}><option value="PENDIENTE">PENDIENTE</option><option value="CANCELADO">CANCELADO</option><option value="NC">NC</option></select></div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(null)} className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ag-ink hover:border-neutral-300">Cancelar</button>
                  <button type="submit" disabled={submitting} className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-ag-red-dark disabled:opacity-60">{submitting ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            )}

            {/* Modal Post-Venta */}
            {modalOpen === 'postventa' && (
              <form onSubmit={(e) => { e.preventDefault(); registrarHistorial('Actualización de post-venta', { postVenta: formPostVenta }) }}>
                <h2 className="mb-6 font-barlow-condensed text-2xl font-extrabold uppercase tracking-wide text-ag-ink">Editar Post-Venta</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className={LABEL}>Fecha Activación Chip</label><input type="date" value={formPostVenta.fechaChip} onChange={e=>setFormPostVenta({...formPostVenta, fechaChip: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Primer Anual</label><input type="date" value={formPostVenta.fechaPrimerAnual} onChange={e=>setFormPostVenta({...formPostVenta, fechaPrimerAnual: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Fecha Cambio Garantía</label><input type="date" value={formPostVenta.fechaGarantia} onChange={e=>setFormPostVenta({...formPostVenta, fechaGarantia: e.target.value})} className={INPUT} /></div>
                  <div><label className={LABEL}>Detalle Garantía</label><input type="text" value={formPostVenta.detalleGarantia} onChange={e=>setFormPostVenta({...formPostVenta, detalleGarantia: e.target.value})} className={INPUT} /></div>
                  <div className="col-span-full"><label className={LABEL}>Observaciones</label><textarea value={formPostVenta.observaciones} onChange={e=>setFormPostVenta({...formPostVenta, observaciones: e.target.value})} className={`${INPUT} min-h-[80px] resize-y`} /></div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(null)} className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ag-ink hover:border-neutral-300">Cancelar</button>
                  <button type="submit" disabled={submitting} className="rounded-xl bg-ag-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-ag-red-dark disabled:opacity-60">{submitting ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
