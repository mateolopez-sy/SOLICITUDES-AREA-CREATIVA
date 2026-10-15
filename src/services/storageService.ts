import * as XLSX from 'xlsx';
import {
  Solicitud,
  DisenadoresPorMesa,
  MesaType,
  HEADERS_GOOGLE_SHEETS,
  MESES,
  INTEGRANTES_IMPRESOS
} from '../types/solicitud';

export const PIN_COORDINADOR = '1234';
export const ID_HOJA = '1p_TysQB2dVnjtsSCL-nHEGhB-zStrmVFsEGJPRGiZ1s';
export const NOMBRE_HOJA = 'Solicitudes';
export const GOOGLE_DRIVE_URL = `https://docs.google.com/spreadsheets/d/${ID_HOJA}/edit?usp=drive_web`;

const STORAGE_KEY_SOLICITUDES = 'bd_diseno_solicitudes_v2';
const STORAGE_KEY_DISENADORES = 'DISENADORES_POR_MESA';
const STORAGE_KEY_APPS_SCRIPT_URL = 'bd_diseno_apps_script_url';

export const DEFAULT_DISENADORES: DisenadoresPorMesa = {
  Visual: [...INTEGRANTES_IMPRESOS],
  Packaging: [...INTEGRANTES_IMPRESOS],
  Pauta: ['Lorena', 'Jorge', 'Tina', 'Jagger', 'F Banano', 'F Mauricio', 'F Paola'],
  Digital: ['Palomo', 'Sara', 'Camila', 'F Banano', 'F Mauricio', 'F Paola'],
  Producción: ['Leon', 'Andres', 'Mateo', 'Claudia', 'F Banano', 'F Mauricio', 'F Paola']
};

export function parseCantSegura(val: any): number {
  const n = parseInt(val, 10);
  return isNaN(n) || n <= 0 || n > 10000 ? 1 : n;
}

export function calcularDiasHabiles(fechaInicio: Date | string, diasHabiles: number): string {
  const fecha = new Date(fechaInicio);
  let agregados = 0;
  while (agregados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    const diaSemana = fecha.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      agregados++;
    }
  }
  return fecha.toISOString().slice(0, 10);
}

export function obtenerDiasSegunSLA(mesa: string, pieza: string, cantidad: number): number {
  const c = parseCantSegura(cantidad);

  if (mesa === 'Producción') {
    if (pieza.includes('Edición de Video')) {
      return c <= 2 ? 3 : c <= 5 ? 5 : c <= 10 ? 8 : 12;
    }
    if (pieza.includes('Shooting Fotográfico')) {
      return c <= 1 ? 4 : c <= 3 ? 6 : 9;
    }
    if (pieza.includes('Retoque de Imagen')) {
      return c <= 5 ? 3 : c <= 15 ? 5 : c <= 30 ? 8 : 12;
    }
    if (pieza.includes('Creación con IA')) {
      return c <= 3 ? 3 : c <= 8 ? 5 : 8;
    }
    return c <= 3 ? 3 : c <= 8 ? 5 : 8;
  }

  if (mesa === 'Packaging') {
    if (pieza.includes('Propuesta de KV')) return c <= 2 ? 4 : 6;
    if (pieza.includes('Planos Técnicos')) return c <= 4 ? 3 : c <= 10 ? 5 : 8;
    if (pieza.includes('Mockups')) return c <= 3 ? 3 : 5;
    if (pieza.includes('Órdenes de China - Tech')) return c <= 3 ? 4 : 6;
    if (pieza.includes('Órdenes de China - Beauty')) return c <= 5 ? 3 : 5;
    if (pieza.includes('Órdenes de China - Lifestyle')) return c <= 5 ? 2 : 4;
    if (pieza.includes('Empaques Especiales')) return c <= 3 ? 3 : 5;
    if (pieza.includes('Etiqueta, Soporte')) return c <= 5 ? 2 : 4;
    if (pieza.includes('Empaques Termos')) return c <= 3 ? 3 : 5;
  }

  if (mesa === 'Visual') {
    if (pieza.includes('KV de Campaña')) return c <= 3 ? 5 : c <= 8 ? 8 : 12;
    if (pieza.includes('Desarrollo de Piezas')) return c <= 5 ? 4 : 7;
    if (pieza.includes('P.O.P.') || pieza.includes('Vitrina')) return c <= 5 ? 4 : c <= 12 ? 6 : 9;
    if (pieza.includes('Apertura de Tiendas')) return 5;
    if (pieza.includes('Banners / Cenefas')) return c <= 5 ? 3 : 5;
    if (pieza.includes('Material Impreso')) return c <= 5 ? 3 : 5;
  }

  if (mesa === 'Digital') {
    if (pieza === 'Banners redes sociales') return c <= 5 ? 3 : 5;
    if (pieza === 'KV particular') return c <= 5 ? 5 : 9;
    if (pieza === 'Edición de video') return c <= 3 ? 5 : 8;
    if (pieza === 'Historias') return c <= 5 ? 3 : 5;
    if (pieza === 'Key visual campaña digital') return c <= 3 ? 5 : 8;
    if (pieza === 'Piezas digitales campaña' || pieza === 'Tripleta') return c <= 8 ? 8 : 12;
    if (pieza === 'Post') return c <= 3 ? 3 : 5;
    if (pieza === 'Reels') return c <= 3 ? 5 : 8;
  }

  if (mesa === 'Pauta') {
    if (pieza.includes('Pauta digital') || pieza.includes('Optimización')) return c <= 10 ? 4 : 7;
    if (pieza.includes('Banners app')) return c <= 15 ? 4 : 7;
    if (pieza.includes('KV campaña')) return c <= 2 ? 5 : 8;
    if (pieza.includes('Historias') || pieza.includes('Contenido portafolio')) return c <= 5 ? 3 : 5;
    if (pieza.includes('Legales')) return c <= 5 ? 2 : 4;
    if (pieza.includes('Mailing')) return c <= 3 ? 3 : 5;
    if (pieza.includes('Landing')) return c === 1 ? 3 : 5;
    if (pieza.includes('Motion')) return c <= 3 ? 4 : 7;
    if (pieza.includes('Kit campaña')) return c === 1 ? 7 : 12;
  }

  return c >= 10 ? 7 : c >= 5 ? 5 : 3;
}

export function esFinalizadaORechazada(estado: string): boolean {
  const est = String(estado || '').toLowerCase();
  return est.includes('finaliz') || est.includes('cerrad') || est.includes('rechazad');
}

// Initial realistic demo data matching user brands
const INITIAL_DEMO_DATA: Solicitud[] = [
  {
    id: 'F105',
    marcaTemporal: '2026-10-15 08:30:12',
    mes: 'Octubre',
    correo: 'mateo.lopez@fastmoda.com.co',
    solicitante: 'Mateo López',
    area: 'Mercadeo',
    mesa: 'Pauta',
    marca: 'Lili Pink',
    pais: 'Colombia',
    pieza: 'Pauta digital Meta/Google',
    detallePieza: 'Campaña Cyber Days Lili Pink 2026',
    descripcion: 'Pauta de conversión para feed y stories con descuento del 40%. Colores de temporada.',
    linkBrief: 'https://drive.google.com/file/d/sample-brief-cyber2026/view',
    cantidad: 4,
    fechaRequerida: '2026-10-21',
    prioridad: 'P3 - Normal',
    aprobacion: 'Aprobado',
    responsable: 'Lorena',
    estado: 'En proceso',
    fechaAsignacion: '2026-10-15 09:00:00',
    fechaInicio: '2026-10-15 09:30:00',
    ajustesCantidad: 0,
    notasAjustes: '',
    fechaCierre: '',
    tiempoTotal: '',
    linkResultado: ''
  },
  {
    id: 'F104',
    marcaTemporal: '2026-10-14 14:15:20',
    mes: 'Octubre',
    correo: 'carolina.gomez@fastmoda.com.co',
    solicitante: 'Carolina Gómez',
    area: 'Digital',
    mesa: 'Digital',
    marca: 'Yoi',
    pais: 'México',
    pieza: 'Banners redes sociales',
    detallePieza: 'Lanzamiento Colección Hogar Yoi',
    descripcion: 'Banner hero para desktop (1920x600) y móvil. Incluir tipografía institucional y botón CTA.',
    linkBrief: 'https://drive.google.com/file/d/sample-brief-primavera/view',
    cantidad: 2,
    fechaRequerida: '2026-10-20',
    prioridad: 'P3 - Normal',
    aprobacion: 'Aprobado',
    responsable: 'Sara',
    estado: 'Ajustes',
    fechaAsignacion: '2026-10-14 15:00:00',
    fechaInicio: '2026-10-14 15:45:00',
    ajustesCantidad: 1,
    notasAjustes: 'Ajustar contraste en texto secundario.',
    fechaCierre: '',
    tiempoTotal: '',
    linkResultado: 'https://figma.com/file/sample-banner-hero-yoi'
  },
  {
    id: 'F103',
    marcaTemporal: '2026-10-14 11:10:00',
    mes: 'Octubre',
    correo: 'andres.marquez@fastmoda.com.co',
    solicitante: 'Andrés Márquez',
    area: 'Visual',
    mesa: 'Visual',
    marca: 'Fast Moda',
    pais: 'Costa Rica',
    pieza: 'Vitrina / Dinteles / Cajas de Luz',
    detallePieza: 'Renovación Tienda Flagship San José',
    descripcion: 'Diseño para vitrina frontal formato 3m x 2.20m. Texturas y acabados dorados.',
    linkBrief: 'https://drive.google.com/file/d/sample-brief-vitrina-cr/view',
    cantidad: 1,
    fechaRequerida: '2026-10-21',
    prioridad: 'P3 - Normal',
    aprobacion: 'Aprobado',
    responsable: 'Valentina Monroy',
    estado: 'Finalizada',
    fechaAsignacion: '2026-10-14 11:30:00',
    fechaInicio: '2026-10-14 12:00:00',
    ajustesCantidad: 0,
    notasAjustes: '',
    fechaCierre: '2026-10-14 16:25:30',
    tiempoTotal: '4 h, 25 min, 30 seg',
    linkResultado: 'https://drive.google.com/drive/folders/sample-vitrina-final'
  },
  {
    id: 'F102',
    marcaTemporal: '2026-10-13 16:40:00',
    mes: 'Octubre',
    correo: 'natalia.rojas@fastmoda.com.co',
    solicitante: 'Natalia Rojas',
    area: 'Producto',
    mesa: 'Packaging',
    marca: 'Lili Pink Beauty & Wellness',
    pais: 'Colombia',
    pieza: 'Etiqueta, Soporte o Faja de Medias',
    detallePieza: 'Etiquetas Colección Panty Seamless 2026',
    descripcion: 'Hang tag troquelado en cartón kraft reciclado de 350g con stamping plateado.',
    linkBrief: 'https://drive.google.com/file/d/sample-brief-hangtag/view',
    cantidad: 3,
    fechaRequerida: '2026-10-20',
    prioridad: 'P3 - Normal',
    aprobacion: 'Aprobado',
    responsable: 'Daniel Gutierrez',
    estado: 'Finalizada',
    fechaAsignacion: '2026-10-13 17:00:00',
    fechaInicio: '2026-10-14 08:30:00',
    ajustesCantidad: 1,
    notasAjustes: 'Modificar código de barras y composición textil.',
    fechaCierre: '2026-10-14 11:45:15',
    tiempoTotal: '3 h, 15 min, 15 seg',
    linkResultado: 'https://drive.google.com/drive/folders/sample-hangtags-lp'
  },
  {
    id: 'F101',
    marcaTemporal: '2026-10-15 07:15:00',
    mes: 'Octubre',
    correo: 'felipe.torres@fastmoda.com.co',
    solicitante: 'Felipe Torres',
    area: 'Wholesale',
    mesa: 'Producción',
    marca: 'Yahad',
    pais: 'Ecuador',
    pieza: 'Edición de Video',
    detallePieza: 'Video Promocional Pantallas Mall del Sol',
    descripcion: 'Edición formato 16:9 y 9:16 para pantallas digitales con subtítulos en alta resolución.',
    linkBrief: 'https://drive.google.com/file/d/sample-brief-video-ecuador/view',
    cantidad: 2,
    fechaRequerida: '2026-10-22',
    prioridad: 'P3 - Normal',
    aprobacion: 'Pendiente',
    responsable: 'Sin Asignar',
    estado: 'Nueva',
    fechaAsignacion: '',
    fechaInicio: '',
    ajustesCantidad: 0,
    notasAjustes: '',
    fechaCierre: '',
    tiempoTotal: '',
    linkResultado: ''
  }
];

export function validarPin(pin: string): boolean {
  return String(pin || '').trim() === String(PIN_COORDINADOR).trim();
}

export function obtenerDisenadoresPersistentes(): DisenadoresPorMesa {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISENADORES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading designers:', e);
  }
  return DEFAULT_DISENADORES;
}

export function guardarDisenadoresPersistentes(disenadores: DisenadoresPorMesa): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_DISENADORES, JSON.stringify(disenadores));
    return true;
  } catch (e) {
    console.error('Error saving designers:', e);
    return false;
  }
}

export function obtenerSolicitudes(): Solicitud[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SOLICITUDES);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.error('Error reading solicitudes:', e);
  }
  guardarTodasLasSolicitudes(INITIAL_DEMO_DATA);
  return INITIAL_DEMO_DATA;
}

export function guardarTodasLasSolicitudes(solicitudes: Solicitud[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_SOLICITUDES, JSON.stringify(solicitudes));
    return true;
  } catch (e) {
    console.error('Error saving solicitudes:', e);
    return false;
  }
}

export function formatTiempo(diffMs: number): string {
  const totalSegundos = Math.max(0, Math.floor(diffMs / 1000));
  if (totalSegundos < 60) {
    return `${totalSegundos} seg`;
  }
  const mins = Math.floor(totalSegundos / 60);
  const segs = totalSegundos % 60;
  if (mins < 60) {
    return `${mins} min, ${segs} seg`;
  }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs} h, ${remMins} min, ${segs} seg`;
}

export function formatDateNow(): { full: string; dateOnly: string; month: string } {
  const now = new Date();
  const year = now.getFullYear();
  const monthNum = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return {
    full: `${year}-${monthNum}-${day} ${hours}:${minutes}:${seconds}`,
    dateOnly: `${year}-${monthNum}-${day}`,
    month: MESES[now.getMonth()]
  };
}

export function guardarSolicitud(payload: Partial<Solicitud>): { status: 'OK'; id: string } {
  const current = obtenerSolicitudes();
  const { full, month } = formatDateNow();

  let nextNum = 1;
  current.forEach((item) => {
    const match = item.id.match(/^F(\d+)$/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n >= nextNum) nextNum = n + 1;
    }
  });
  const id = `F${nextNum}`;

  const nuevaSolicitud: Solicitud = {
    id,
    marcaTemporal: full,
    mes: month,
    correo: payload.correo || '',
    solicitante: payload.solicitante || '',
    area: payload.area || '',
    mesa: (payload.mesa as MesaType) || 'Visual',
    marca: payload.marca || '',
    pais: payload.pais || '',
    pieza: payload.pieza || '',
    detallePieza: payload.detallePieza || '',
    descripcion: payload.descripcion || '',
    linkBrief: payload.linkBrief || '',
    cantidad: parseCantSegura(payload.cantidad),
    fechaRequerida: payload.fechaRequerida || '',
    prioridad: payload.prioridad || 'P3 - Normal',
    aprobacion: 'Pendiente',
    responsable: 'Sin Asignar',
    estado: 'Nueva',
    fechaAsignacion: '',
    fechaInicio: '',
    ajustesCantidad: 0,
    notasAjustes: '',
    fechaCierre: '',
    tiempoTotal: '',
    linkResultado: ''
  };

  const updated = [nuevaSolicitud, ...current];
  guardarTodasLasSolicitudes(updated);

  syncToAppsScript({
    action: 'guardarSolicitud',
    solicitud: nuevaSolicitud
  }).catch(() => {});

  return { status: 'OK', id };
}

export function accionCoordinacion(
  id: string,
  nuevaAprobacion?: string,
  nuevoEstado?: string,
  responsable?: string
): boolean {
  const current = obtenerSolicitudes();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return false;

  const { full } = formatDateNow();
  const item = { ...current[index] };

  if (nuevaAprobacion) {
    item.aprobacion = nuevaAprobacion as any;
    if (nuevaAprobacion === 'Rechazado') {
      item.estado = 'Rechazada';
    }
  }

  if (nuevoEstado) item.estado = nuevoEstado as any;

  if (responsable) {
    item.responsable = responsable;
    if (responsable !== 'Sin Asignar' && !item.fechaAsignacion) {
      item.fechaAsignacion = full;
    }
    if (responsable !== 'Sin Asignar' && item.estado === 'Nueva') {
      item.estado = 'En proceso';
    }
  }

  current[index] = item;
  guardarTodasLasSolicitudes(current);

  syncToAppsScript({
    action: 'accionCoordinacion',
    id,
    nuevaAprobacion,
    nuevoEstado: item.estado,
    responsable
  }).catch(() => {});

  return true;
}

export function accionDisenadorTiempo(
  id: string,
  nuevoEstado?: string,
  accionTiempo?: 'inicio' | 'ajuste' | 'cierre',
  linkResultado?: string,
  notasAjustes?: string
): boolean {
  const current = obtenerSolicitudes();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return false;

  const { full } = formatDateNow();
  const item = { ...current[index] };

  if (nuevoEstado) item.estado = nuevoEstado as any;

  if (accionTiempo === 'inicio') {
    if (!item.fechaInicio) {
      item.fechaInicio = full;
    }
    item.estado = 'En proceso';
  }

  if (accionTiempo === 'ajuste') {
    item.ajustesCantidad = (Number(item.ajustesCantidad) || 0) + 1;
    if (notasAjustes) {
      const stamp = `[Ajuste #${item.ajustesCantidad} - ${full.slice(5, 16)}]: ${notasAjustes}`;
      item.notasAjustes = item.notasAjustes ? `${item.notasAjustes}\n${stamp}` : stamp;
    }
    item.estado = 'Ajustes';
  }

  if (accionTiempo === 'cierre') {
    item.fechaCierre = full;
    item.estado = 'Finalizada';
    if (linkResultado) item.linkResultado = linkResultado;

    if (item.fechaInicio) {
      const fInicioDate = new Date(item.fechaInicio.replace(' ', 'T'));
      const fCierreDate = new Date();
      if (!isNaN(fInicioDate.getTime())) {
        const diffMs = fCierreDate.getTime() - fInicioDate.getTime();
        item.tiempoTotal = formatTiempo(diffMs);
      }
    }
  }

  current[index] = item;
  guardarTodasLasSolicitudes(current);

  syncToAppsScript({
    action: 'accionDisenadorTiempo',
    id,
    nuevoEstado: item.estado,
    accionTiempo,
    linkResultado,
    notasAjustes
  }).catch(() => {});

  return true;
}

export function getAppsScriptUrl(): string {
  return localStorage.getItem(STORAGE_KEY_APPS_SCRIPT_URL) || '';
}

export function setAppsScriptUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_APPS_SCRIPT_URL, url.trim());
}

async function syncToAppsScript(payload: any): Promise<void> {
  const url = getAppsScriptUrl();
  if (!url) return;

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Sync failed:', e);
  }
}

export function exportarExcelPorMesas(solicitudes: Solicitud[]): void {
  if (!solicitudes || solicitudes.length === 0) {
    alert('No hay solicitudes para exportar.');
    return;
  }

  const workbook = XLSX.utils.book_new();

  // Consolidado
  const wsConsolidado = XLSX.utils.json_to_sheet(solicitudes);
  XLSX.utils.book_append_sheet(workbook, wsConsolidado, 'Consolidado');

  // Per Mesa
  const mesas: MesaType[] = ['Visual', 'Packaging', 'Pauta', 'Digital', 'Producción'];
  mesas.forEach((mesa) => {
    const datosMesa = solicitudes.filter((s) => s.mesa === mesa);
    if (datosMesa.length > 0) {
      const wsMesa = XLSX.utils.json_to_sheet(datosMesa);
      XLSX.utils.book_append_sheet(workbook, wsMesa, mesa);
    }
  });

  XLSX.writeFile(
    workbook,
    `Solicitudes_Diseno_Por_Mesas_SLA2026_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

export function exportarCSV(solicitudes: Solicitud[]): void {
  const rows = [HEADERS_GOOGLE_SHEETS];

  solicitudes.forEach((s) => {
    rows.push([
      s.id,
      s.marcaTemporal,
      s.mes,
      s.correo,
      s.solicitante,
      s.area,
      s.mesa,
      s.marca,
      s.pais,
      s.pieza,
      s.detallePieza,
      s.descripcion,
      s.linkBrief,
      String(s.cantidad),
      s.fechaRequerida,
      s.prioridad,
      s.aprobacion,
      s.responsable,
      s.estado,
      s.fechaAsignacion,
      s.fechaInicio,
      String(s.ajustesCantidad),
      s.notasAjustes,
      s.fechaCierre,
      s.tiempoTotal,
      s.linkResultado
    ]);
  });

  const csvContent = rows
    .map((e) =>
      e
        .map((val) => `"${String(val || '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Solicitudes_Diseno_SLA2026_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
