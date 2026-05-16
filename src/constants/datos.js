// ─── Fuente única de verdad para todas las listas del sistema ──────────────
// Si se agrega una sede, concesionaria u opción, SOLO hay que editar este archivo.

export const SEDES = ['ICA', 'HUANCAYO', 'LIMA', 'NAZCA', 'CHINCHA', 'TRUJILLO', 'AYACUCHO']

export const CONCESIONARIAS = ['AUTONIZA', 'VARI', 'FOTÓN', 'WANKAMOTORS', 'OTROS']

export const TIPOS_CONVERSION = ['GLP', 'GNV']

export const SISTEMAS = [
  'SISTEMA DE 3RA GENERACIÓN',
  'SISTEMA DE 5TA GENERACIÓN',
  'SISTEMA DE 6TA GENERACIÓN - OBD',
]

export const MODALIDADES = ['AUTONIZA', 'VARI', 'FOTÓN']

export const BONOS = [
  'BONO 1 - FISE GASOLINA (S/ 1,000)',
  'BONO 2 - FISE GLP (S/ 2,000)',
  'SIN BONO',
]

export const CERTIFICADORAS = ['BUREAU VERITAS', 'VERITAS PERU', 'MOTORGAS', 'OTANOR', 'N.E']

export const REDUCTORES = [
  'KME', 'LANDIRENZO', 'LANDIRENZO OBD', 'LOVATO',
  'TOMASETTO ACHILLE', 'EMMGAS', 'N.E',
]

export const ELECTRONICAS = [
  'KME', 'AEB DIGITRONIC', 'EUROPEGAS',
  'LANDIRENZO', 'LOVATO', 'LOVATO SMART II', 'N.E',
]

export const TANQUES = [
  'AMS', 'ATIKER', 'CY', 'FESA', 'IMPROSIL', 'KOLOS',
  'LD', 'POVIS', 'SAKA', 'SINOMA', 'TASET', 'TUBOJET', 'YA', 'N.E',
]

export const CAPACIDAD_GLP = ['7GL', '9GL', '10GL', '11GL', '12GL', '13GL', '14GL', '15GL', 'N.E']
export const CAPACIDAD_GNV = ['2GL', '3GL', '4GL', '5GL', 'N.E']

export const CILINDROS = ['3-4CC', '5-6CC', '8CC', 'N.E']

export const MEDIOS_PAGO = ['EFECTIVO', 'YAPE/PLIN', 'DEPÓSITO BANCARIO']

export const ESTADOS_FACTURA = ['CANCELADO', 'PENDIENTE', 'NC']

export const CONDICION_FACTURA = ['CONTADO', 'CRÉDITO']

export const CONDICION_FOLIO = ['EMITIDO', 'PENDIENTE', 'FICTICIOS']

export const TIPOS_TANQUE = [
  'TOROIDAL DE BRIDA INTERNA - GLP',
  'TOROIDAL DE BRIDA EXTERNA - GLP',
  'CILÍNDRICO - GLP',
  'CILÍNDRICO - GNV',
  'LENTEJA - GLP',
  'N.E',
]

export const TIPOS_PAGO = ['POR CONVERSIÓN', 'POR SERVICIO']

export const MESES = [
  { val: 0, label: 'ENERO' },
  { val: 1, label: 'FEBRERO' },
  { val: 2, label: 'MARZO' },
  { val: 3, label: 'ABRIL' },
  { val: 4, label: 'MAYO' },
  { val: 5, label: 'JUNIO' },
  { val: 6, label: 'JULIO' },
  { val: 7, label: 'AGOSTO' },
  { val: 8, label: 'SEPTIEMBRE' },
  { val: 9, label: 'OCTUBRE' },
  { val: 10, label: 'NOVIEMBRE' },
  { val: 11, label: 'DICIEMBRE' },
]

export const ANIOS = ['2023', '2024', '2025', '2026', '2027']

export const ESTADOS_UNIDAD = ['Por Convertir', 'Convertido']
