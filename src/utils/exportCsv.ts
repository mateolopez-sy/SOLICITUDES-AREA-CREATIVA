import { Solicitud } from '../types/solicitud';
import { parseCantSegura } from '../services/storageService';

export const HEADERS_CSV: { key: keyof Solicitud | string; label: string }[] = [
  { key: 'id', label: '#Solicitud' },
  { key: 'marcaTemporal', label: 'Marca temporal' },
  { key: 'mes', label: 'Mes' },
  { key: 'correo', label: 'Correo' },
  { key: 'solicitante', label: 'Solicitante' },
  { key: 'area', label: 'Área Solicitante' },
  { key: 'mesa', label: 'Mesa' },
  { key: 'marca', label: 'Marca' },
  { key: 'pais', label: 'País' },
  { key: 'pieza', label: 'Pieza' },
  { key: 'detallePieza', label: 'Nombre/Número Proyecto' },
  { key: 'descripcion', label: 'Descripción/Link Reference' },
  { key: 'linkBrief', label: 'Link Brief PDF' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'fechaRequerida', label: 'Fecha Requerida' },
  { key: 'prioridad', label: 'Prioridad SLA' },
  { key: 'aprobacion', label: 'Aprobación' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'estado', label: 'Estado' },
  { key: 'fechaAsignacion', label: 'Fecha Asignación' },
  { key: 'fechaInicio', label: 'Fecha Inicio' },
  { key: 'ajustesCantidad', label: 'Ajustes Cantidad' },
  { key: 'notasAjustes', label: 'Notas Ajustes' },
  { key: 'fechaCierre', label: 'Fecha Cierre' },
  { key: 'tiempoTotal', label: 'Tiempo Total Formateado' },
  { key: 'linkResultado', label: 'Link Resultado' }
];

/**
 * Escapes a single CSV cell value according to RFC 4180
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).trim();
  // If string contains comma, double-quote, or newline, escape quotes and wrap in quotes
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports an array of Solicitud objects to a downloadable CSV file.
 * Includes UTF-8 BOM (\uFEFF) to guarantee correct rendering of accents and special characters in Excel.
 */
export function exportarSolicitudesCSV(
  solicitudes: Solicitud[],
  filenamePrefix = 'SLA_2026_BD_Solicitudes_Diseno'
): { success: boolean; count: number; filename: string } {
  if (!solicitudes || solicitudes.length === 0) {
    return { success: false, count: 0, filename: '' };
  }

  // Header row
  const headerRow = HEADERS_CSV.map((h) => escapeCsvCell(h.label)).join(',');

  // Data rows
  const rows = solicitudes.map((item) => {
    return HEADERS_CSV.map((h) => {
      let val: unknown = '';
      if (h.key === 'cantidad') {
        val = parseCantSegura(item.cantidad);
      } else if (h.key in item) {
        val = item[h.key as keyof Solicitud];
      }
      return escapeCsvCell(val);
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${dateStr}.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, count: solicitudes.length, filename };
}
