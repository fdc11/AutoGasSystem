import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const SEDES = ['ICA', 'HUANCAYO', 'LIMA', 'NAZCA', 'CHINCHA', 'TRUJILLO', 'AYACUCHO']
const CONCESIONARIAS = ['AUTONIZA', 'VARI', 'FOTÓN', 'WANKAMOTORS', 'OTROS']
const TIPOS_CONVERSION = ['GLP', 'GNV']
const SISTEMAS = ['SISTEMA DE 3RA GENERACIÓN', 'SISTEMA DE 5TA GENERACIÓN', 'SISTEMA DE 6TA GENERACIÓN - OBD']
const MODALIDADES = ['AUTONIZA', 'VARI', 'FOTÓN']
const BONOS = ['BONO 1 - FISE GASOLINA (S/ 1,000)', 'BONO 2 - FISE GLP (S/ 2,000)', 'SIN BONO']
const CERTIFICADORAS = ['BUREAU VERITAS', 'VERITAS PERU', 'MOTORGAS', 'OTANOR', 'N.E']
const REDUCTORES = ['KME', 'LANDIRENZO', 'LANDIRENZO OBD', 'LOVATO', 'TOMASETTO ACHILLE', 'EMMGAS', 'N.E']
const ELECTRONICAS = ['KME', 'AEB DIGITRONIC', 'EUROPEGAS', 'LANDIRENZO', 'LOVATO', 'LOVATO SMART II', 'N.E']
const TANQUES = ['AMS', 'ATIKER', 'CY', 'FESA', 'IMPROSIL', 'KOLOS', 'LD', 'POVIS', 'SAKA', 'SINOMA', 'TASET', 'TUBOJET', 'YA', 'N.E']
const CAPACIDAD_GLP = ['7GL', '9GL', '10GL', '11GL', '12GL', '13GL', '14GL', '15GL', 'N.E']
const CAPACIDAD_GNV = ['2GL', '3GL', '4GL', '5GL', 'N.E']
const CILINDROS = ['3-4CC', '5-6CC', '8CC', 'N.E']
const MEDIOS_PAGO = ['EFECTIVO', 'YAPE/PLIN', 'DEPÓSITO BANCARIO']
const ESTADOS_FACTURA = ['CANCELADO', 'PENDIENTE', 'NC']
const CONDICION_FOLIO = ['EMITIDO', 'PENDIENTE', 'FICTICIOS']
const TIPOS_TANQUE = ['TOROIDAL DE BRIDA INTERNA - GLP', 'TOROIDAL DE BRIDA EXTERNA - GLP', 'CILÍNDRICO - GLP', 'CILÍNDRICO - GNV', 'LENTEJA - GLP', 'N.E']
const TIPOS_PAGO = ['POR CONVERSIÓN', 'POR SERVICIO']

export default function FichaUnidad() {
  const { vin } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  
  const [unidad, setUnidad] = useState(null)
  const [modalOpen, setModalOpen] = useState(null) // 'vehiculo', 'conversion', 'certificacion', 'facturacion', 'postventa'
  
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
        
        // Inicializar formularios
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
          estado: data.facturacion?.estado || '', reembolsoComision: data.facturacion?.reembolsoComision || '',
          fechaCancelacion: data.facturacion?.fechaCancelacion || '', tipoPago: data.facturacion?.tipoPago || ''
        })

        setFormPostVenta({
          fechaChip: data.postVenta?.fechaChip || '', fechaPrimerAnual: data.postVenta?.fechaPrimerAnual || '',
          fechaGarantia: data.postVenta?.fechaGarantia || '', detalleGarantia: data.postVenta?.detalleGarantia || '',
          observaciones: data.postVenta?.observaciones || ''
        })
      }
    })
    return () => unsub()
  }, [vin])

  const registrarHistorial = async (descripcion, updateData) => {
    const nuevoHistorial = [...(unidad.historial || []), {
      fecha: Timestamp.now(),
      usuario: usuario.email,
      accion: 'Edición',
      detalle: descripcion
    }]
    await updateDoc(doc(db, 'unidades', vin), {
      ...updateData,
      historial: nuevoHistorial,
      actualizadoEn: Timestamp.now()
    })
    setModalOpen(null)
  }

  const handleGuardarVehiculo = async (e) => {
    e.preventDefault()
    await registrarHistorial('Actualización de datos del vehículo', {
      marca: formVehiculo.marca, modelo: formVehiculo.modelo, anio: Number(formVehiculo.anio), color: formVehiculo.color,
      placa: formVehiculo.placa || null, sede: formVehiculo.sede, concesionaria: formVehiculo.concesionaria,
      tipoConversion: formVehiculo.tipoConversion, bloque: formVehiculo.bloque, fechaIngreso: formVehiculo.fechaIngreso, estado: formVehiculo.estado,
      motorSerie: formVehiculo.motorSerie, folioInterno: formVehiculo.folioInterno, fichaRecepcion: formVehiculo.fichaRecepcion,
      fechaEntrega: formVehiculo.fechaEntrega, tecnicoElectronico: formVehiculo.tecnicoElectronico, tecnicoMecanico: formVehiculo.tecnicoMecanico,
      observacionRecepcion: formVehiculo.observacionRecepcion
    })
  }

  const handleGuardarConversion = async (e) => {
    e.preventDefault()
    await registrarHistorial('Actualización de datos de conversión', { conversion: formConversion })
  }

  const handleGuardarCertificacion = async (e) => {
    e.preventDefault()
    await registrarHistorial('Actualización de datos de certificación', { certificacion: formCertificacion })
  }

  const handleGuardarFacturacion = async (e) => {
    e.preventDefault()
    await registrarHistorial('Actualización de datos de facturación', { facturacion: { ...formFacturacion, monto: Number(formFacturacion.monto), reembolsoComision: Number(formFacturacion.reembolsoComision || 0) } })
  }

  const handleGuardarPostVenta = async (e) => {
    e.preventDefault()
    await registrarHistorial('Actualización de datos post-venta', { postVenta: formPostVenta })
  }

  const handleEliminarUnidad = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta unidad? \nEsta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'unidades', vin))
        navigate('/unidades')
      } catch (error) {
        console.error('Error al eliminar unidad:', error)
      }
    }
  }

  const renderBadgeStatus = (text, status) => {
    let bg = 'rgba(255,255,255,0.1)'
    let color = '#ffffff'
    if (status === 'EMITIDO' || status === 'CANCELADO' || status === 'AL DÍA') { bg = 'rgba(34,197,94,0.15)'; color = '#22c55e' }
    if (status === 'PENDIENTE' || status === 'PRÓXIMO A VENCER') { bg = 'rgba(245,158,11,0.15)'; color = '#f59e0b' }
    if (status === 'VENCIDO') { bg = 'rgba(227,6,19,0.15)'; color = '#e30613' }
    return <span style={{ backgroundColor: bg, color: color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{text}</span>
  }

  const checkPostVentaStatus = (fecha) => {
    if (!fecha) return null
    const hoy = new Date()
    const fAnual = new Date(fecha)
    const diff = (fAnual - hoy) / (1000 * 60 * 60 * 24)
    if (diff < 0) return renderBadgeStatus('VENCIDO', 'VENCIDO')
    if (diff <= 30) return renderBadgeStatus('PRÓXIMO A VENCER', 'PRÓXIMO A VENCER')
    return renderBadgeStatus('AL DÍA', 'AL DÍA')
  }

  const inputStyle = { width: '100%', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '2px', color: '#1a1a1a', fontFamily: 'Barlow, sans-serif', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', marginBottom: '0.25rem', fontSize: '0.7rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.1em' }
  const cardStyle = { backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem' }
  const cardTitleStyle = { fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1a1a', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const dataGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }
  const dataItemStyle = { display: 'flex', flexDirection: 'column' }
  const dataLabelStyle = { fontSize: '0.65rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }
  const dataValueStyle = { fontSize: '0.9rem', color: '#1a1a1a', fontWeight: '500' }
  const btnStyle = { backgroundColor: 'transparent', border: '1px solid #e0e0e0', color: '#1a1a1a', padding: '0.4rem 0.8rem', borderRadius: '2px', fontFamily: 'Barlow, sans-serif', fontWeight: '600', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }

  if (!unidad) return <div style={{ color: '#1a1a1a', fontFamily: 'Barlow, sans-serif' }}>Cargando...</div>

  return (
    <div style={{ fontFamily: 'Barlow, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p style={{ color: '#666666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            <span style={{ cursor: 'pointer', color: '#1a1a1a' }} onClick={() => navigate('/unidades')}>UNIDADES</span> &gt; <span style={{ color: '#e30613' }}>{vin}</span>
          </p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a1a1a', margin: 0 }}>
            FICHA <span style={{ color: '#e30613' }}>UNIDAD</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={handleEliminarUnidad} 
            style={{ 
              backgroundColor: 'transparent', 
              border: '1px solid #e30613', 
              color: '#e30613', 
              padding: '0.6rem 1.5rem', 
              borderRadius: '2px', 
              fontFamily: 'Barlow, sans-serif', 
              fontWeight: '600', 
              fontSize: '0.7rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.2em', 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#e30613'; e.target.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#e30613'; }}
          >
            ELIMINAR UNIDAD
          </button>
          <button onClick={() => navigate('/unidades')} style={btnStyle}>VOLVER</button>
        </div>
      </div>

      {/* SECCION 1: VEHICULO */}
      <div style={cardStyle}>
        <div style={cardTitleStyle}>
          <span>DATOS DEL VEHÍCULO</span>
          <button onClick={() => setModalOpen('vehiculo')} style={btnStyle}>EDITAR</button>
        </div>
        <div style={dataGridStyle}>
          <div style={dataItemStyle}><span style={dataLabelStyle}>VIN</span><span style={dataValueStyle}>{unidad.vin}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>MARCA</span><span style={dataValueStyle}>{unidad.marca}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>MODELO</span><span style={dataValueStyle}>{unidad.modelo}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>AÑO</span><span style={dataValueStyle}>{unidad.anio}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>COLOR</span><span style={dataValueStyle}>{unidad.color}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>PLACA</span><span style={dataValueStyle}>{unidad.placa || renderBadgeStatus('SIN PLACA', '')}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>SEDE</span><span style={dataValueStyle}>{unidad.sede}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>CONCESIONARIA</span><span style={dataValueStyle}>{unidad.concesionaria}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>TIPO CONVERSIÓN</span><span style={dataValueStyle}>{unidad.tipoConversion}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>BLOQUE</span><span style={dataValueStyle}>{unidad.bloque}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA INGRESO</span><span style={dataValueStyle}>{unidad.fechaIngreso}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>ESTADO</span><span>{renderBadgeStatus(unidad.estado, unidad.estado === 'Convertido' ? 'EMITIDO' : 'PENDIENTE')}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>MOTOR SERIE</span><span style={dataValueStyle}>{unidad.motorSerie || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FOLIO INTERNO</span><span style={dataValueStyle}>{unidad.folioInterno || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FICHA RECEPCIÓN</span><span style={dataValueStyle}>{unidad.fichaRecepcion || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA ENTREGA</span><span style={dataValueStyle}>{unidad.fechaEntrega || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>TÉCNICO ELECTRÓNICO</span><span style={dataValueStyle}>{unidad.tecnicoElectronico || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>TÉCNICO MECÁNICO</span><span style={dataValueStyle}>{unidad.tecnicoMecanico || '-'}</span></div>
          <div style={{ ...dataItemStyle, gridColumn: '1 / -1' }}><span style={dataLabelStyle}>OBSERVACIÓN RECEPCIÓN</span><span style={dataValueStyle}>{unidad.observacionRecepcion || '-'}</span></div>
        </div>
      </div>

      {/* SECCION 2: CONVERSION */}
      <div style={cardStyle}>
        <div style={cardTitleStyle}>
          <span>CONVERSIÓN</span>
          <button onClick={() => setModalOpen('conversion')} style={btnStyle}>REGISTRAR/EDITAR CONVERSIÓN</button>
        </div>
        <div style={dataGridStyle}>
          <div style={dataItemStyle}><span style={dataLabelStyle}>SISTEMA</span><span style={dataValueStyle}>{unidad.conversion?.sistema || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>MODALIDAD</span><span style={dataValueStyle}>{unidad.conversion?.modalidad || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>BONO</span><span style={dataValueStyle}>{unidad.conversion?.bono || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>TÉCNICO</span><span style={dataValueStyle}>{unidad.conversion?.tecnico || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA INICIO</span><span style={dataValueStyle}>{unidad.conversion?.fechaInicio || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA FIN</span><span style={dataValueStyle}>{unidad.conversion?.fechaFin || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>CILINDROS</span><span style={dataValueStyle}>{unidad.conversion?.cilindros || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>MEDIO PAGO</span><span style={dataValueStyle}>{unidad.conversion?.medioPago || '-'}</span></div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
            <p style={{ fontSize: '0.75rem', color: '#e30613', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>REDUCTOR</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={dataItemStyle}><span style={dataLabelStyle}>MARCA</span><span style={dataValueStyle}>{unidad.conversion?.reductor?.marca || '-'}</span></div>
              <div style={dataItemStyle}><span style={dataLabelStyle}>N° SERIE</span><span style={dataValueStyle}>{unidad.conversion?.reductor?.serie || '-'}</span></div>
            </div>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
            <p style={{ fontSize: '0.75rem', color: '#e30613', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>ELECTRÓNICA</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={dataItemStyle}><span style={dataLabelStyle}>MARCA</span><span style={dataValueStyle}>{unidad.conversion?.electronica?.marca || '-'}</span></div>
              <div style={dataItemStyle}><span style={dataLabelStyle}>N° SERIE</span><span style={dataValueStyle}>{unidad.conversion?.electronica?.serie || '-'}</span></div>
            </div>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '0.75rem', color: '#e30613', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>TANQUE</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={dataItemStyle}><span style={dataLabelStyle}>MARCA</span><span style={dataValueStyle}>{unidad.conversion?.tanque?.marca || '-'}</span></div>
              <div style={dataItemStyle}><span style={dataLabelStyle}>CAPACIDAD GL</span><span style={dataValueStyle}>{unidad.conversion?.tanque?.capacidad || '-'}</span></div>
              <div style={dataItemStyle}><span style={dataLabelStyle}>TIPO TANQUE</span><span style={dataValueStyle}>{unidad.conversion?.tanque?.tipoTanque || '-'}</span></div>
              <div style={dataItemStyle}><span style={dataLabelStyle}>N° SERIE</span><span style={dataValueStyle}>{unidad.conversion?.tanque?.serie || '-'}</span></div>
              <div style={dataItemStyle}><span style={dataLabelStyle}>SERIE PRODUCTE</span><span style={dataValueStyle}>{unidad.conversion?.tanque?.serieProducte || '-'}</span></div>
              <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA FABRICACIÓN</span><span style={dataValueStyle}>{unidad.conversion?.tanque?.fechaFabricacion || '-'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCION 3: CERTIFICACION */}
      <div style={cardStyle}>
        <div style={cardTitleStyle}>
          <span>CERTIFICACIÓN</span>
          <button onClick={() => setModalOpen('certificacion')} style={btnStyle}>REGISTRAR/EDITAR CERTIFICACIÓN</button>
        </div>
        <div style={dataGridStyle}>
          <div style={dataItemStyle}><span style={dataLabelStyle}>CERTIFICADORA</span><span style={dataValueStyle}>{unidad.certificacion?.certificadora || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>N° FOLIO</span><span style={dataValueStyle}>{unidad.certificacion?.folio || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>CONDICIÓN</span><span>{unidad.certificacion?.condicion ? renderBadgeStatus(unidad.certificacion.condicion, unidad.certificacion.condicion) : '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA EMISIÓN</span><span style={dataValueStyle}>{unidad.certificacion?.fechaEmision || '-'}</span></div>
        </div>
      </div>

      {/* SECCION 4: FACTURACION */}
      <div style={cardStyle}>
        <div style={cardTitleStyle}>
          <span>FACTURACIÓN</span>
          <button onClick={() => setModalOpen('facturacion')} style={btnStyle}>REGISTRAR/EDITAR FACTURA</button>
        </div>
        <div style={dataGridStyle}>
          <div style={dataItemStyle}><span style={dataLabelStyle}>N° FACTURA</span><span style={dataValueStyle}>{unidad.facturacion?.numeroFactura || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>RECEPTOR</span><span style={dataValueStyle}>{unidad.facturacion?.receptor || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>MONTO</span><span style={dataValueStyle}>{unidad.facturacion?.monto ? `$${Number(unidad.facturacion.monto).toLocaleString('en-US', {minimumFractionDigits: 2})}` : '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>CONDICIÓN</span><span style={dataValueStyle}>{unidad.facturacion?.condicion || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA EMISIÓN</span><span style={dataValueStyle}>{unidad.facturacion?.fechaEmision || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA VENCIMIENTO</span><span style={dataValueStyle}>{unidad.facturacion?.fechaVencimiento || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>TIPO DE PAGO</span><span style={dataValueStyle}>{unidad.facturacion?.tipoPago || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>REEMBOLSO/COMISIÓN</span><span style={dataValueStyle}>{unidad.facturacion?.reembolsoComision ? `$${Number(unidad.facturacion.reembolsoComision).toLocaleString('en-US', {minimumFractionDigits: 2})}` : '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA CANCELACIÓN</span><span style={dataValueStyle}>{unidad.facturacion?.fechaCancelacion || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>ESTADO</span><span>{unidad.facturacion?.estado ? renderBadgeStatus(unidad.facturacion.estado, unidad.facturacion.estado) : '-'}</span></div>
        </div>
      </div>

      {/* SECCION 5: POST-VENTA */}
      <div style={cardStyle}>
        <div style={cardTitleStyle}>
          <span>POST-VENTA</span>
          <button onClick={() => setModalOpen('postventa')} style={btnStyle}>REGISTRAR/EDITAR POST-VENTA</button>
        </div>
        <div style={dataGridStyle}>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA ACTIVACIÓN CHIP</span><span style={dataValueStyle}>{unidad.postVenta?.fechaChip || '-'}</span></div>
          <div style={dataItemStyle}>
            <span style={dataLabelStyle}>FECHA PRIMER ANUAL</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={dataValueStyle}>{unidad.postVenta?.fechaPrimerAnual || '-'}</span>
              {checkPostVentaStatus(unidad.postVenta?.fechaPrimerAnual)}
            </div>
          </div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>FECHA CAMBIO GARANTÍA</span><span style={dataValueStyle}>{unidad.postVenta?.fechaGarantia || '-'}</span></div>
          <div style={dataItemStyle}><span style={dataLabelStyle}>DETALLE GARANTÍA</span><span style={dataValueStyle}>{unidad.postVenta?.detalleGarantia || '-'}</span></div>
          <div style={{ ...dataItemStyle, gridColumn: '1 / -1' }}><span style={dataLabelStyle}>OBSERVACIONES</span><span style={dataValueStyle}>{unidad.postVenta?.observaciones || '-'}</span></div>
        </div>
      </div>

      {/* SECCION 6: HISTORIAL */}
      <div style={cardStyle}>
        <div style={cardTitleStyle}>
          <span>HISTORIAL</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {unidad.historial && unidad.historial.length > 0 ? (
            [...unidad.historial].sort((a, b) => b.fecha.seconds - a.fecha.seconds).map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', paddingLeft: '1rem', borderLeft: '2px solid #e30613' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', color: '#1a1a1a', marginBottom: '0.25rem', fontWeight: '500' }}>{h.detalle}</p>
                  <p style={{ fontSize: '0.7rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(h.fecha.toDate()).toLocaleString('es-PE')} — {h.usuario}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#666666', fontSize: '0.85rem' }}>No hay historial registrado.</p>
          )}
        </div>
      </div>

      {/* MODALES */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px', padding: '2rem', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {modalOpen === 'vehiculo' && (
              <form onSubmit={handleGuardarVehiculo}>
                <h2 style={cardTitleStyle}>EDITAR VEHÍCULO</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={labelStyle}>MARCA</label><input type="text" value={formVehiculo.marca} onChange={e => setFormVehiculo({ ...formVehiculo, marca: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>MODELO</label><input type="text" value={formVehiculo.modelo} onChange={e => setFormVehiculo({ ...formVehiculo, modelo: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>AÑO</label><input type="number" value={formVehiculo.anio} onChange={e => setFormVehiculo({ ...formVehiculo, anio: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>COLOR</label><input type="text" value={formVehiculo.color} onChange={e => setFormVehiculo({ ...formVehiculo, color: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>PLACA</label><input type="text" value={formVehiculo.placa} onChange={e => setFormVehiculo({ ...formVehiculo, placa: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>SEDE</label><select value={formVehiculo.sede} onChange={e => setFormVehiculo({ ...formVehiculo, sede: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{SEDES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label style={labelStyle}>CONCESIONARIA</label><select value={formVehiculo.concesionaria} onChange={e => setFormVehiculo({ ...formVehiculo, concesionaria: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{CONCESIONARIAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label style={labelStyle}>TIPO CONVERSIÓN</label><select value={formVehiculo.tipoConversion} onChange={e => setFormVehiculo({ ...formVehiculo, tipoConversion: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{TIPOS_CONVERSION.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label style={labelStyle}>BLOQUE</label><input type="text" value={formVehiculo.bloque} onChange={e => setFormVehiculo({ ...formVehiculo, bloque: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA INGRESO</label><input type="date" value={formVehiculo.fechaIngreso} onChange={e => setFormVehiculo({ ...formVehiculo, fechaIngreso: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>ESTADO</label><select value={formVehiculo.estado} onChange={e => setFormVehiculo({ ...formVehiculo, estado: e.target.value })} style={inputStyle}><option value="Por Convertir">Por Convertir</option><option value="Convertido">Convertido</option></select></div>
                  <div><label style={labelStyle}>MOTOR SERIE</label><input type="text" value={formVehiculo.motorSerie} onChange={e => setFormVehiculo({ ...formVehiculo, motorSerie: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FOLIO INTERNO</label><input type="text" value={formVehiculo.folioInterno} onChange={e => setFormVehiculo({ ...formVehiculo, folioInterno: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FICHA RECEPCIÓN</label><input type="text" value={formVehiculo.fichaRecepcion} onChange={e => setFormVehiculo({ ...formVehiculo, fichaRecepcion: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA ENTREGA</label><input type="date" value={formVehiculo.fechaEntrega} onChange={e => setFormVehiculo({ ...formVehiculo, fechaEntrega: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>TÉCNICO ELECTRÓNICO</label><input type="text" value={formVehiculo.tecnicoElectronico} onChange={e => setFormVehiculo({ ...formVehiculo, tecnicoElectronico: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>TÉCNICO MECÁNICO</label><input type="text" value={formVehiculo.tecnicoMecanico} onChange={e => setFormVehiculo({ ...formVehiculo, tecnicoMecanico: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>OBSERVACIÓN RECEPCIÓN</label><textarea value={formVehiculo.observacionRecepcion} onChange={e => setFormVehiculo({ ...formVehiculo, observacionRecepcion: e.target.value })} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} /></div>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(null)} style={btnStyle}>CANCELAR</button>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#e30613', borderColor: '#e30613', color: '#ffffff' }}>GUARDAR</button>
              </div>
              </form>
            )}

            {modalOpen === 'conversion' && (
              <form onSubmit={handleGuardarConversion}>
                <h2 style={cardTitleStyle}>EDITAR CONVERSIÓN</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={labelStyle}>SISTEMA</label><select value={formConversion.sistema} onChange={e => setFormConversion({ ...formConversion, sistema: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{SISTEMAS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label style={labelStyle}>MODALIDAD</label><select value={formConversion.modalidad} onChange={e => setFormConversion({ ...formConversion, modalidad: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                  <div><label style={labelStyle}>BONO</label><select value={formConversion.bono} onChange={e => setFormConversion({ ...formConversion, bono: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{BONOS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                  <div><label style={labelStyle}>TÉCNICO</label><input type="text" value={formConversion.tecnico} onChange={e => setFormConversion({ ...formConversion, tecnico: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA INICIO</label><input type="date" value={formConversion.fechaInicio} onChange={e => setFormConversion({ ...formConversion, fechaInicio: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA FIN</label><input type="date" value={formConversion.fechaFin} onChange={e => setFormConversion({ ...formConversion, fechaFin: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>CILINDROS</label><select value={formConversion.cilindros} onChange={e => setFormConversion({ ...formConversion, cilindros: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{CILINDROS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label style={labelStyle}>MEDIO PAGO</label><select value={formConversion.medioPago} onChange={e => setFormConversion({ ...formConversion, medioPago: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{MEDIOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                  
                  <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}><p style={{ fontSize: '0.8rem', color: '#e30613', fontWeight: '700', textTransform: 'uppercase' }}>REDUCTOR</p></div>
                  <div><label style={labelStyle}>MARCA</label><select value={formConversion.reductor.marca} onChange={e => setFormConversion({ ...formConversion, reductor: { ...formConversion.reductor, marca: e.target.value } })} style={inputStyle}><option value="">Seleccionar</option>{REDUCTORES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label style={labelStyle}>N° SERIE</label><input type="text" value={formConversion.reductor.serie} onChange={e => setFormConversion({ ...formConversion, reductor: { ...formConversion.reductor, serie: e.target.value.toUpperCase() } })} style={inputStyle} /></div>

                  <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}><p style={{ fontSize: '0.8rem', color: '#e30613', fontWeight: '700', textTransform: 'uppercase' }}>ELECTRÓNICA</p></div>
                  <div><label style={labelStyle}>MARCA</label><select value={formConversion.electronica.marca} onChange={e => setFormConversion({ ...formConversion, electronica: { ...formConversion.electronica, marca: e.target.value } })} style={inputStyle}><option value="">Seleccionar</option>{ELECTRONICAS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label style={labelStyle}>N° SERIE</label><input type="text" value={formConversion.electronica.serie} onChange={e => setFormConversion({ ...formConversion, electronica: { ...formConversion.electronica, serie: e.target.value.toUpperCase() } })} style={inputStyle} /></div>

                  <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}><p style={{ fontSize: '0.8rem', color: '#e30613', fontWeight: '700', textTransform: 'uppercase' }}>TANQUE</p></div>
                  <div><label style={labelStyle}>MARCA</label><select value={formConversion.tanque.marca} onChange={e => setFormConversion({ ...formConversion, tanque: { ...formConversion.tanque, marca: e.target.value } })} style={inputStyle}><option value="">Seleccionar</option>{TANQUES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label style={labelStyle}>CAPACIDAD GL</label><select value={formConversion.tanque.capacidad} onChange={e => setFormConversion({ ...formConversion, tanque: { ...formConversion.tanque, capacidad: e.target.value } })} style={inputStyle}><option value="">Seleccionar</option>{(unidad.tipoConversion === 'GNV' ? CAPACIDAD_GNV : CAPACIDAD_GLP).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label style={labelStyle}>TIPO TANQUE</label><select value={formConversion.tanque.tipoTanque} onChange={e => setFormConversion({ ...formConversion, tanque: { ...formConversion.tanque, tipoTanque: e.target.value } })} style={inputStyle}><option value="">Seleccionar</option>{TIPOS_TANQUE.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label style={labelStyle}>N° SERIE</label><input type="text" value={formConversion.tanque.serie} onChange={e => setFormConversion({ ...formConversion, tanque: { ...formConversion.tanque, serie: e.target.value.toUpperCase() } })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>SERIE PRODUCTE</label><input type="text" value={formConversion.tanque.serieProducte} onChange={e => setFormConversion({ ...formConversion, tanque: { ...formConversion.tanque, serieProducte: e.target.value.toUpperCase() } })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA FABRICACIÓN</label><input type="date" value={formConversion.tanque.fechaFabricacion} onChange={e => setFormConversion({ ...formConversion, tanque: { ...formConversion.tanque, fechaFabricacion: e.target.value } })} style={inputStyle} /></div>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(null)} style={btnStyle}>CANCELAR</button>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#e30613', borderColor: '#e30613', color: '#ffffff' }}>GUARDAR</button>
              </div>
              </form>
            )}

            {modalOpen === 'certificacion' && (
              <form onSubmit={handleGuardarCertificacion}>
                <h2 style={cardTitleStyle}>EDITAR CERTIFICACIÓN</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={labelStyle}>CERTIFICADORA</label><select value={formCertificacion.certificadora} onChange={e => setFormCertificacion({ ...formCertificacion, certificadora: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{CERTIFICADORAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label style={labelStyle}>N° FOLIO</label><input type="text" value={formCertificacion.folio} onChange={e => setFormCertificacion({ ...formCertificacion, folio: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>CONDICIÓN</label><select value={formCertificacion.condicion} onChange={e => setFormCertificacion({ ...formCertificacion, condicion: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{CONDICION_FOLIO.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label style={labelStyle}>FECHA EMISIÓN</label><input type="date" value={formCertificacion.fechaEmision} onChange={e => setFormCertificacion({ ...formCertificacion, fechaEmision: e.target.value })} style={inputStyle} /></div>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(null)} style={btnStyle}>CANCELAR</button>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#e30613', borderColor: '#e30613', color: '#ffffff' }}>GUARDAR</button>
              </div>
              </form>
            )}

            {modalOpen === 'facturacion' && (
              <form onSubmit={handleGuardarFacturacion}>
                <h2 style={cardTitleStyle}>EDITAR FACTURACIÓN</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={labelStyle}>N° FACTURA</label><input type="text" value={formFacturacion.numeroFactura} onChange={e => setFormFacturacion({ ...formFacturacion, numeroFactura: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>RECEPTOR</label><select value={formFacturacion.receptor} onChange={e => setFormFacturacion({ ...formFacturacion, receptor: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{CONCESIONARIAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label style={labelStyle}>MONTO ($)</label><input type="number" step="0.01" value={formFacturacion.monto} onChange={e => setFormFacturacion({ ...formFacturacion, monto: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>CONDICIÓN PAGO</label><input type="text" value={formFacturacion.condicion} onChange={e => setFormFacturacion({ ...formFacturacion, condicion: e.target.value.toUpperCase() })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA EMISIÓN</label><input type="date" value={formFacturacion.fechaEmision} onChange={e => setFormFacturacion({ ...formFacturacion, fechaEmision: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA VENCIMIENTO</label><input type="date" value={formFacturacion.fechaVencimiento} onChange={e => setFormFacturacion({ ...formFacturacion, fechaVencimiento: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>TIPO DE PAGO</label><select value={formFacturacion.tipoPago} onChange={e => setFormFacturacion({ ...formFacturacion, tipoPago: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{TIPOS_PAGO.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                  <div><label style={labelStyle}>REEMBOLSO/COMISIÓN ($)</label><input type="number" step="0.01" value={formFacturacion.reembolsoComision} onChange={e => setFormFacturacion({ ...formFacturacion, reembolsoComision: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA CANCELACIÓN</label><input type="date" value={formFacturacion.fechaCancelacion} onChange={e => setFormFacturacion({ ...formFacturacion, fechaCancelacion: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>ESTADO</label><select value={formFacturacion.estado} onChange={e => setFormFacturacion({ ...formFacturacion, estado: e.target.value })} style={inputStyle}><option value="">Seleccionar</option>{ESTADOS_FACTURA.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(null)} style={btnStyle}>CANCELAR</button>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#e30613', borderColor: '#e30613', color: '#ffffff' }}>GUARDAR</button>
              </div>
              </form>
            )}

            {modalOpen === 'postventa' && (
              <form onSubmit={handleGuardarPostVenta}>
                <h2 style={cardTitleStyle}>EDITAR POST-VENTA</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={labelStyle}>FECHA ACTIVACIÓN CHIP</label><input type="date" value={formPostVenta.fechaChip} onChange={e => setFormPostVenta({ ...formPostVenta, fechaChip: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA PRIMER ANUAL</label><input type="date" value={formPostVenta.fechaPrimerAnual} onChange={e => setFormPostVenta({ ...formPostVenta, fechaPrimerAnual: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>FECHA CAMBIO GARANTÍA</label><input type="date" value={formPostVenta.fechaGarantia} onChange={e => setFormPostVenta({ ...formPostVenta, fechaGarantia: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>DETALLE GARANTÍA</label><input type="text" value={formPostVenta.detalleGarantia} onChange={e => setFormPostVenta({ ...formPostVenta, detalleGarantia: e.target.value })} style={inputStyle} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>OBSERVACIONES</label><textarea value={formPostVenta.observaciones} onChange={e => setFormPostVenta({ ...formPostVenta, observaciones: e.target.value })} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} /></div>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(null)} style={btnStyle}>CANCELAR</button>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#e30613', borderColor: '#e30613', color: '#ffffff' }}>GUARDAR</button>
              </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
