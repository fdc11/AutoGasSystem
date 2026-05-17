import { useState } from 'react'
import { writeBatch, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import * as XLSX from 'xlsx'

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (val) => {
  if (!val) return ''
  if (val instanceof Date) return val.toISOString().split('T')[0]
  return String(val).trim()
}

const normalizeText = (val) => {
  if (!val) return ''
  return String(val).trim().toUpperCase()
}

const normalizeCertificadora = (val) => {
  const map = {
    'BUREAO VERITAS': 'BUREAU VERITAS',
    'VERITAS PERU ': 'VERITAS PERU',
    'VERITAS PERÚ': 'VERITAS PERU',
  }
  const v = String(val || '').trim()
  return map[v] || v
}

const mapFilaAUnidad = (fila) => {
  const vin = String(fila[16] || '').trim()
  if (!vin) return null

  return {
    vin,
    folio: fila[1] ? String(fila[1]).trim() : '',
    anio: fila[15] ? Number(fila[15]) : null,
    mes: normalizeText(fila[3]),
    bloque: fila[4] instanceof Date ? '' : fila[4] ? String(fila[4]).trim() : '',
    sede: normalizeText(fila[5]),
    tipoConversion: normalizeText(fila[6]),
    concesionaria: normalizeText(fila[7]),
    estado: normalizeText(fila[8]) === 'CONVERTIDO' ? 'Convertido' : 'Por Convertir',
    propietario: normalizeText(fila[9]),
    dniRuc: fila[10] ? String(fila[10]).trim() : '',
    telefono: fila[11] ? String(fila[11]).trim() : '',
    placa: normalizeText(fila[12]),
    marca: normalizeText(fila[13]),
    modelo: normalizeText(fila[14]),
    motorSerie: normalizeText(fila[17]),
    kilometraje: fila[18] ? String(fila[18]).trim() : '',
    sistemaGas: normalizeText(fila[19]),
    fichaRecepcion: fila[29] ? String(fila[29]).trim() : '',
    fechaIngreso: formatDate(fila[30]),
    tecnicoElectronico: normalizeText(fila[31]),
    tecnicoMecanico: normalizeText(fila[32]),
    observacionRecepcion: fila[33] ? String(fila[33]).trim() : '',
    fechaEntrega: formatDate(fila[34]),
    folioInterno: fila[1] ? String(fila[1]).trim() : '',
    facturacion: {
      numeroFactura: fila[20] ? String(fila[20]).trim() : '',
      monto: fila[21] ? Number(fila[21]) : null,
      condicion: normalizeText(fila[22]),
      fechaEmision: formatDate(fila[23]),
      fechaVencimiento: formatDate(fila[24]),
      reembolsoComision: fila[25] ? Number(fila[25]) : null,
      fechaCancelacion: formatDate(fila[26]),
      estado: normalizeText(fila[27]),
      tipoBono: normalizeText(fila[28]),
    },
    certificacion: {
      certificadora: normalizeCertificadora(fila[35]),
      folio: fila[36] ? String(fila[36]).trim() : '',
      condicion: normalizeText(fila[37]),
      fechaEmision: formatDate(fila[38]),
    },
    conversion: {
      reductor: {
        marca: normalizeText(fila[39]),
        serie: fila[40] ? String(fila[40]).trim() : '',
      },
      electronica: {
        marca: normalizeText(fila[41]),
        serie: fila[42] ? String(fila[42]).trim() : '',
      },
      tanque: {
        marca: normalizeText(fila[43]),
        capacidad: fila[44] ? String(fila[44]).trim() : '',
        fechaFabricacion: formatDate(fila[45]),
        serie: fila[46] ? String(fila[46]).trim() : '',
        serieProducte: fila[47] ? String(fila[47]).trim() : '',
        tipoTanque: normalizeText(fila[48]),
      },
    },
    postVenta: {
      fechaChip: formatDate(fila[49]),
      fechaPrimerAnual: formatDate(fila[50]),
      fechaGarantia: formatDate(fila[51]),
      detalleGarantia: fila[52] ? String(fila[52]).trim() : '',
      observaciones: fila[53] ? String(fila[53]).trim() : '',
    },
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
    historial: [],
  }
}

const procesarExcel = (buffer) => {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })
  const ws = wb.Sheets['CONTROL DE CONVERSIONES']
  if (!ws) throw new Error("No se encontró la hoja 'CONTROL DE CONVERSIONES'")

  const filas = XLSX.utils.sheet_to_json(ws, { header: 1 })
  const datosFilas = filas.slice(5)

  const registros = datosFilas
    .filter((fila) => fila[0] !== null && fila[0] !== undefined && fila[0] !== '')
    .map((fila, idx) => {
      const unidad = mapFilaAUnidad(fila)
      return {
        item: idx + 1,
        vin: String(fila[16] || '').trim(),
        marca: normalizeText(fila[13]),
        modelo: normalizeText(fila[14]),
        sede: normalizeText(fila[5]),
        tipo: normalizeText(fila[6]),
        estado: normalizeText(fila[8]) === 'CONVERTIDO' ? 'Convertido' : 'Por Convertir',
        numeroFactura: fila[20] ? String(fila[20]).trim() : '',
        valido: !!String(fila[16] || '').trim(),
        datos: unidad,
      }
    })

  return registros
}

// ─── Íconos inline SVG ───────────────────────────────────────────────────────

function IconUpload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function IconFile() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function Importacion() {
  const [dragging, setDragging] = useState(false)
  const [archivo, setArchivo] = useState(null)
  const [registros, setRegistros] = useState([])
  const [error, setError] = useState(null)
  const [importando, setImportando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [exito, setExito] = useState(false)

  const registrosValidos = registros.filter((r) => r.valido)
  const registrosInvalidos = registros.filter((r) => !r.valido)

  const leerArchivo = (file) => {
    if (!file) return
    setError(null)
    setExito(false)
    setRegistros([])
    setArchivo(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = new Uint8Array(e.target.result)
        const resultado = procesarExcel(buffer)
        setRegistros(resultado)
      } catch (err) {
        setError(err.message)
        setArchivo(null)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) leerArchivo(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) leerArchivo(file)
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  const handleImportar = async () => {
    if (!registrosValidos.length) return
    setImportando(true)
    setProgreso(0)

    try {
      const batch = writeBatch(db)
      registrosValidos.forEach((r) => {
        const ref = doc(db, 'unidades', r.vin)
        batch.set(ref, r.datos, { merge: true })
      })

      // Simula progreso visual mientras Firebase procesa
      const interval = setInterval(() => {
        setProgreso((prev) => {
          if (prev >= 85) { clearInterval(interval); return prev }
          return prev + 10
        })
      }, 200)

      await batch.commit()
      clearInterval(interval)
      setProgreso(100)
      setExito(true)
    } catch (err) {
      setError('Error al importar: ' + err.message)
    } finally {
      setImportando(false)
    }
  }

  const handleReset = () => {
    setArchivo(null)
    setRegistros([])
    setError(null)
    setExito(false)
    setProgreso(0)
  }

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (exito) {
    return (
      <div className="font-barlow text-ag-ink">
        <div className="mb-8">
          <h1 className="font-barlow-condensed text-4xl font-black uppercase tracking-tight text-ag-ink sm:text-[2.5rem]">
            IMPORTAR <span className="text-ag-red">EXCEL</span>
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-100/90 bg-white p-16 shadow-card-md text-center">
          <div className="mb-4 text-emerald-500">
            <IconCheck />
          </div>
          <h2 className="font-barlow-condensed text-3xl font-extrabold uppercase tracking-wide text-ag-ink">
            Importación completada
          </h2>
          <p className="mt-2 text-neutral-500">
            <span className="font-bold text-ag-ink">{registrosValidos.length}</span> registros guardados correctamente en Firestore.
          </p>
          <button
            onClick={handleReset}
            className="mt-8 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-widest text-ag-ink transition-colors hover:border-neutral-300"
          >
            Importar otro archivo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="font-barlow text-ag-ink pb-20">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-barlow-condensed text-4xl font-black uppercase tracking-tight text-ag-ink sm:text-[2.5rem]">
          IMPORTAR <span className="text-ag-red">EXCEL</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Carga el archivo "CONTROL DE CONVERSIONES" para importar o actualizar registros en Firestore.
        </p>
      </div>

      {/* Zona drag & drop */}
      {!registros.length && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`rounded-2xl border-2 border-dashed bg-white p-16 text-center transition-colors ${dragging
              ? 'border-ag-red bg-ag-red/5'
              : 'border-neutral-200 hover:border-neutral-300'
            }`}
        >
          <div className={`mx-auto mb-4 ${dragging ? 'text-ag-red' : 'text-neutral-300'}`}>
            <IconUpload />
          </div>
          <p className="font-barlow-condensed text-xl font-bold uppercase tracking-wide text-ag-ink">
            Arrastra tu Excel aquí
          </p>
          <p className="mt-1 text-sm text-neutral-400">Solo archivos .xlsx</p>

          <label className="mt-6 inline-block cursor-pointer rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-ag-ink transition-colors hover:border-neutral-300">
            o selecciona el archivo
            <input
              id="importar-archivo-input"
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          ⚠ {error}
          <button onClick={handleReset} className="ml-4 underline opacity-70 hover:opacity-100">
            Reintentar
          </button>
        </div>
      )}

      {/* Previsualización */}
      {registros.length > 0 && (
        <div className="flex flex-col gap-6">

          {/* Resumen */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm">
              <IconFile />
              <span className="font-semibold text-ag-ink">{archivo?.name}</span>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-bold text-emerald-700">
                ✓ {registrosValidos.length} válidos
              </span>
              {registrosInvalidos.length > 0 && (
                <span className="rounded-lg bg-red-50 px-3 py-1.5 font-bold text-red-600">
                  ✗ {registrosInvalidos.length} sin VIN
                </span>
              )}
            </div>
            <button
              onClick={handleReset}
              className="ml-auto text-xs uppercase tracking-wide text-neutral-400 underline hover:text-ag-ink"
            >
              Cambiar archivo
            </button>
          </div>

          {/* Tabla */}
          <div className="rounded-2xl border border-neutral-100/90 bg-white shadow-card-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    {['#', 'VIN', 'MARCA', 'MODELO', 'SEDE', 'TIPO', 'ESTADO', 'N° FACTURA'].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r, i) => (
                    <tr
                      key={i}
                      className={`border-b border-neutral-50 text-xs transition-colors last:border-0 ${r.valido
                          ? 'hover:bg-emerald-50/40'
                          : 'bg-red-50/60 hover:bg-red-50'
                        }`}
                    >
                      <td className="px-4 py-2.5 text-neutral-400">{r.item}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-ag-ink">
                        {r.vin || (
                          <span className="font-sans font-medium text-red-500">— sin VIN —</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-ag-ink">{r.marca || '—'}</td>
                      <td className="px-4 py-2.5 text-ag-ink">{r.modelo || '—'}</td>
                      <td className="px-4 py-2.5 text-neutral-600">{r.sede || '—'}</td>
                      <td className="px-4 py-2.5">
                        {r.tipo ? (
                          <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${r.tipo === 'GNV'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                            }`}>
                            {r.tipo}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.estado ? (
                          <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${r.estado === 'Convertido'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-neutral-100 text-neutral-500'
                            }`}>
                            {r.estado}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-neutral-600">{r.numeroFactura || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Barra de progreso + botón */}
          {importando && (
            <div className="rounded-2xl border border-neutral-100/90 bg-white p-6 shadow-card-md">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-ag-ink">Importando registros...</span>
                <span className="font-bold text-ag-red">{progreso}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-ag-red transition-all duration-300"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          )}

          {!importando && (
            <div className="flex justify-end">
              <button
                id="importar-registros-btn"
                onClick={handleImportar}
                disabled={!registrosValidos.length}
                className="rounded-xl bg-ag-red px-7 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-ag-red-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Importar {registrosValidos.length} registros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
