import React, { useState } from 'react';
import {
  ID_HOJA,
  NOMBRE_HOJA,
  PIN_COORDINADOR,
  getAppsScriptUrl,
  setAppsScriptUrl,
  exportarCSV
} from '../services/storageService';
import { HEADERS_GOOGLE_SHEETS, Solicitud } from '../types/solicitud';
import { generateIndexHtml } from '../utils/appsScriptTemplate';
import {
  Sheet,
  ExternalLink,
  Copy,
  Check,
  Download,
  Link,
  Code2,
  Database,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface GoogleSheetsModalProps {
  solicitudes: Solicitud[];
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  solicitudes,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'conexion' | 'indexHtml' | 'codeGs' | 'guia'>('conexion');
  const [urlInput, setUrlInput] = useState(getAppsScriptUrl);
  const [copiedIndex, setCopiedIndex] = useState(false);
  const [copiedCodeGs, setCopiedCodeGs] = useState(false);
  const [savedUrl, setSavedUrl] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setAppsScriptUrl(urlInput);
    setSavedUrl(true);
    setTimeout(() => setSavedUrl(false), 2500);
  };

  const codeGsFull = `// ============ CONFIGURACIÓN DE TU HOJA Y PIN ============
const ID_HOJA = '${ID_HOJA}'; 
const NOMBRE_HOJA = '${NOMBRE_HOJA}';
const PIN_COORDINADOR = '${PIN_COORDINADOR}'; 
const ZONA = Session.getScriptTimeZone();

// 26 Columnas
const HEADERS = [
  '#Solicitud', 'Marca temporal', 'Mes', 'Correo', 'Solicitante', 'Área Solicitante', 
  'Mesa', 'Marca', 'País', 'Pieza', 'Nombre/Número Proyecto', 'Descripción/Link Reference', 
  'Link Brief PDF', 'Cantidad', 'Fecha Requerida', 'Prioridad SLA', 'Aprobación', 'Responsable', 
  'Estado', 'Fecha Asignación', 'Fecha Inicio', 'Ajustes Cantidad', 
  'Notas Ajustes', 'Fecha Cierre', 'Tiempo Total Formateado', 'Link Resultado'
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('BD Solicitudes Diseño - SLA 2026')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getHoja() {
  const ss = SpreadsheetApp.openById(ID_HOJA);
  let sheet = ss.getSheetByName(NOMBRE_HOJA);
  if (!sheet) sheet = ss.getSheets()[0];
  return sheet;
}

function validarPin(pinIngresado) {
  return String(pinIngresado || '').trim() === String(PIN_COORDINADOR).trim();
}

function obtenerDisenadoresPersistentes() {
  const props = PropertiesService.getScriptProperties();
  const json = props.getProperty('DISENADORES_POR_MESA');
  
  if (json) {
    try {
      return JSON.parse(json);
    } catch (e) {}
  }
  
  return {
    'Visual': ['Valentina Monroy', 'Daniel Gutierrez', 'Mónica Hernández', 'Valentina Rodríguez', 'Adriana Herrera', 'Liz Zamantha', 'Duván Guerrero', 'Paola Solano', 'Esteban Banano'],
    'Packaging': ['Valentina Monroy', 'Daniel Gutierrez', 'Mónica Hernández', 'Valentina Rodríguez', 'Adriana Herrera', 'Liz Zamantha', 'Duván Guerrero', 'Paola Solano', 'Esteban Banano'],
    'Pauta': ['Lorena', 'Jorge', 'Tina', 'Jagger', 'F Banano', 'F Mauricio', 'F Paola'],
    'Digital': ['Palomo', 'Sara', 'Camila', 'F Banano', 'F Mauricio', 'F Paola'],
    'Producción': ['Leon', 'Andres', 'Mateo', 'Claudia', 'F Banano', 'F Mauricio', 'F Paola']
  };
}

function guardarDisenadoresPersistentes(objetoDisenadores) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('DISENADORES_POR_MESA', JSON.stringify(objetoDisenadores));
  return true;
}

function obtenerSolicitudes() {
  const sh = getHoja();
  const ultimaFila = sh.getLastRow();
  if (ultimaFila < 2) return [];

  const datos = sh.getRange(2, 1, ultimaFila - 1, 26).getValues();
  const out = [];

  datos.forEach((r, i) => {
    if (!r[3] && !r[0]) return;
    
    let cantVal = parseInt(r[13], 10);
    if (isNaN(cantVal) || cantVal <= 0 || cantVal > 10000) {
      cantVal = 1;
    }

    let mesTxt = String(r[2] || '').trim();
    if (r[1] && r[1] instanceof Date) {
      const mStr = Utilities.formatDate(r[1], ZONA, 'MMMM');
      mesTxt = mStr.charAt(0).toUpperCase() + mStr.slice(1).toLowerCase();
    } else if (mesTxt) {
      mesTxt = mesTxt.charAt(0).toUpperCase() + mesTxt.slice(1).toLowerCase();
    }

    out.push({
      id: String(r[0] || ('F' + (i + 1))),
      marcaTemporal: r[1] ? (r[1] instanceof Date ? Utilities.formatDate(r[1], ZONA, 'yyyy-MM-dd HH:mm:ss') : String(r[1])) : '',
      mes: mesTxt,
      correo: String(r[3] || ''),
      solicitante: String(r[4] || ''),
      area: String(r[5] || ''),
      mesa: String(r[6] || ''),
      marca: String(r[7] || ''),
      pais: String(r[8] || ''),
      pieza: String(r[9] || ''),
      detallePieza: String(r[10] || ''),
      descripcion: String(r[11] || ''),
      linkBrief: String(r[12] || ''),
      cantidad: cantVal,
      fechaRequerida: r[14] ? (r[14] instanceof Date ? Utilities.formatDate(r[14], ZONA, 'yyyy-MM-dd') : String(r[14]).slice(0,10)) : '',
      prioridad: String(r[15] || 'P3 - Normal'),
      aprobacion: String(r[16] || 'Pendiente'),
      responsable: String(r[17] || 'Sin Asignar'),
      estado: String(r[18] || 'Nueva'),
      fechaAsignacion: r[19] ? (r[19] instanceof Date ? Utilities.formatDate(r[19], ZONA, 'yyyy-MM-dd HH:mm:ss') : String(r[19])) : '',
      fechaInicio: r[20] ? (r[20] instanceof Date ? Utilities.formatDate(r[20], ZONA, 'yyyy-MM-dd HH:mm:ss') : String(r[20])) : '',
      ajustesCantidad: Number(r[21]) || 0,
      notasAjustes: String(r[22] || ''),
      fechaCierre: r[23] ? (r[23] instanceof Date ? Utilities.formatDate(r[23], ZONA, 'yyyy-MM-dd HH:mm:ss') : String(r[23])) : '',
      tiempoTotal: String(r[24] || ''),
      linkResultado: String(r[25] || '')
    });
  });

  return out.reverse();
}

function guardarSolicitud(s) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sh = getHoja();
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);

    const totalFilas = sh.getLastRow();
    const id = 'F' + totalFilas; 
    const ahora = new Date();

    const mesActualCalculado = Utilities.formatDate(ahora, ZONA, 'MMMM');
    const mesCapitalizado = mesActualCalculado.charAt(0).toUpperCase() + mesActualCalculado.slice(1).toLowerCase();

    const nuevaFila = [
      id,                                 
      ahora,                              
      mesCapitalizado,            
      s.correo || '',                          
      s.solicitante || '',                      
      s.area || '',                            
      s.mesa || '',                            
      s.marca || '',                           
      s.pais || '',                            
      s.pieza || '',                           
      s.detallePieza || '',               
      s.descripcion || '',                      
      s.linkBrief || '',
      Number(s.cantidad) || 1,                        
      s.fechaRequerida || '',                  
      s.prioridad || 'P3 - Normal',                        
      'Pendiente',                        
      'Sin Asignar',                      
      'Nueva',                            
      '',                                 
      '',                                 
      0,                                  
      '',                                 
      '',                                 
      '',                                 
      ''                                  
    ];

    sh.appendRow(nuevaFila);
    estructurarHojaPorMesas();
    return { status: 'OK', id: id };
  } finally {
    lock.releaseLock();
  }
}

function accionCoordinacion(id, nuevaAprobacion, nuevoEstado, responsable) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sh = getHoja();
    const ultimaFila = sh.getLastRow();
    if (ultimaFila < 2) throw new Error('No hay datos en la hoja.');

    const ids = sh.getRange(2, 1, ultimaFila - 1, 1).getValues();
    let filaEncontrada = -1;

    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        filaEncontrada = i + 2;
        break;
      }
    }

    if (filaEncontrada === -1) throw new Error('Solicitud no encontrada: ' + id);

    const ahora = new Date();
    const rangoAccion = sh.getRange(filaEncontrada, 17, 1, 3);
    const v = rangoAccion.getValues()[0];

    if (nuevaAprobacion) v[0] = nuevaAprobacion;
    if (responsable) v[1] = responsable;
    if (nuevoEstado) v[2] = nuevoEstado;

    rangoAccion.setValues([v]);

    if (responsable && responsable !== 'Sin Asignar') {
      sh.getRange(filaEncontrada, 20).setValue(ahora);
    }

    estructurarHojaPorMesas();
    return true;
  } finally {
    lock.releaseLock();
  }
}

function accionDisenadorTiempo(id, nuevoEstado, accionTiempo, linkResultado) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sh = getHoja();
    const ultimaFila = sh.getLastRow();
    if (ultimaFila < 2) throw new Error('No hay datos en la hoja.');

    const ids = sh.getRange(2, 1, ultimaFila - 1, 1).getValues();
    let filaEncontrada = -1;

    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        filaEncontrada = i + 2;
        break;
      }
    }

    if (filaEncontrada === -1) throw new Error('Solicitud no encontrada: ' + id);

    const ahora = new Date();
    const rangoAccion = sh.getRange(filaEncontrada, 19, 1, 8);
    const v = rangoAccion.getValues()[0];

    if (nuevoEstado) v[0] = nuevoEstado;

    if (accionTiempo === 'inicio') {
      v[2] = ahora;
    }
    
    if (accionTiempo === 'ajuste') {
      v[3] = (Number(v[3]) || 0) + 1;
    }
    
    if (accionTiempo === 'cierre') {
      v[5] = ahora;
      if (linkResultado) v[7] = linkResultado;

      const fInicio = v[2];
      if (fInicio && fInicio instanceof Date) {
        const diffMs = ahora.getTime() - fInicio.getTime();
        const totalSegundos = Math.floor(diffMs / 1000);
        
        let textoTiempo = '';
        if (totalSegundos < 60) {
          textoTiempo = \`\${totalSegundos} seg\`;
        } else {
          const mins = Math.floor(totalSegundos / 60);
          const segs = totalSegundos % 60;
          if (mins < 60) {
            textoTiempo = \`\${mins} min, \${segs} seg\`;
          } else {
            const hrs = Math.floor(mins / 60);
            const remMins = mins % 60;
            textoTiempo = \`\${hrs} h, \${remMins} min, \${segs} seg\`;
          }
        }
        v[6] = textoTiempo;
      }
    }

    rangoAccion.setValues([v]);
    estructurarHojaPorMesas();
    return true;
  } finally {
    lock.releaseLock();
  }
}

function estructurarHojaPorMesas() {
  const ss = SpreadsheetApp.openById(ID_HOJA);
  const hojaPrincipal = getHoja();
  const ultimaFila = hojaPrincipal.getLastRow();
  
  if (ultimaFila < 2) return;
  
  const datos = hojaPrincipal.getRange(1, 1, ultimaFila, 26).getValues();
  const headers = datos[0];
  const filas = datos.slice(1);
  
  const mesas = ['Visual', 'Packaging', 'Pauta', 'Digital', 'Producción'];
  
  mesas.forEach(mesa => {
    let hojaMesa = ss.getSheetByName(mesa);
    if (!hojaMesa) {
      hojaMesa = ss.insertSheet(mesa);
    } else {
      hojaMesa.clear();
    }
    
    hojaMesa.appendRow(headers);
    hojaMesa.getRange(1, 1, 1, 26)
      .setFontWeight('bold')
      .setBackground('#0F172A')
      .setFontColor('#FFFFFF');
    
    const filasMesa = filas.filter(r => String(r[6]).trim().toLowerCase() === mesa.toLowerCase());
    
    if (filasMesa.length > 0) {
      hojaMesa.getRange(2, 1, filasMesa.length, 26).setValues(filasMesa);
    }
    
    hojaMesa.setFrozenRows(1);
  });
}`;

  const copyIndexHtml = () => {
    const html = generateIndexHtml();
    navigator.clipboard.writeText(html);
    setCopiedIndex(true);
    setTimeout(() => setCopiedIndex(false), 2000);
  };

  const downloadIndexHtml = () => {
    const html = generateIndexHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyCodeGs = () => {
    navigator.clipboard.writeText(codeGsFull);
    setCopiedCodeGs(true);
    setTimeout(() => setCopiedCodeGs(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Title & Close */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Sheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Integración con Google Sheets & Apps Script
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                BD Solicitudes Diseño - SLA 2026 (Hoja &quot;{NOMBRE_HOJA}&quot;)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 my-6 overflow-x-auto pb-1 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('conexion')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'conexion'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Conexión & Parámetros
          </button>

          <button
            onClick={() => setActiveTab('indexHtml')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'indexHtml'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Index.html para Apps Script</span>
          </button>

          <button
            onClick={() => setActiveTab('codeGs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'codeGs'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Código Code.gs</span>
          </button>

          <button
            onClick={() => setActiveTab('guia')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'guia'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guía de Despliegue</span>
          </button>
        </div>

        {/* TAB 1: CONEXIÓN & PARÁMETROS */}
        {activeTab === 'conexion' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  ID de Hoja Google
                </span>
                <span className="font-mono text-xs text-emerald-400 break-all select-all font-semibold">
                  {ID_HOJA}
                </span>
                <div className="mt-3">
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${ID_HOJA}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline"
                  >
                    <span>Abrir Hoja en Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Pestaña Principal
                </span>
                <span className="text-sm font-bold text-white block">
                  &quot;{NOMBRE_HOJA}&quot;
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Hojas por Mesa: Visual, Packaging, Pauta, Digital, Producción
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  PIN Coordinador
                </span>
                <span className="font-mono text-lg font-bold text-amber-400 block">
                  {PIN_COORDINADOR}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Configurado en la función validarPin()
                </span>
              </div>
            </div>

            {/* URL Input */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Link className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  URL de Despliegue de tu Web App de Apps Script (Opcional)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Si despliegas tu script como Aplicación Web, puedes vincular aquí su URL pública de
                ejecución:
              </p>

              <form onSubmit={handleSaveUrl} className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all whitespace-nowrap"
                >
                  Guardar Conexión
                </button>
              </form>

              {savedUrl && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡URL guardada correctamente!</span>
                </div>
              )}
            </div>

            {/* CSV Export & 26 Columns */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>26 Columnas Oficiales (SLA 2026)</span>
                </h3>
                <button
                  onClick={() => exportarCSV(solicitudes)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV con 26 Columnas</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {HEADERS_GOOGLE_SHEETS.map((h, i) => (
                  <div
                    key={h}
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono flex items-center gap-1.5"
                  >
                    <span className="text-indigo-400 font-bold">{i + 1}.</span>
                    <span className="truncate" title={h}>
                      {h}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INDEX.HTML PARA APPS SCRIPT */}
        {activeTab === 'indexHtml' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200">
              <span className="font-bold text-white block mb-1">
                ¿Para qué sirve este archivo Index.html?
              </span>
              Tu función <code className="bg-rose-900/60 px-1 py-0.5 rounded text-rose-300 font-mono">doGet()</code> en Apps Script ejecuta:
              <br />
              <code className="text-amber-300 font-mono text-[11px]">
                return HtmlService.createHtmlOutputFromFile(&apos;Index&apos;)
              </code>
              <br />
              Copia este código y pégalo en un archivo llamado <strong>Index.html</strong> en tu editor de Google Apps Script. ¡Tendrá el diseño completo y llamará directamente a <code className="font-mono text-emerald-300">google.script.run</code>!
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Archivo: Index.html (Listo para pegar en Apps Script)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={downloadIndexHtml}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Descargar Index.html</span>
                </button>
                <button
                  onClick={copyIndexHtml}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-rose-600/30"
                >
                  {copiedIndex ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado al Portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Todo el Index.html</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96 scrollbar-thin">
              {generateIndexHtml()}
            </pre>
          </div>
        )}

        {/* TAB 3: CÓDIGO CODE.GS */}
        {activeTab === 'codeGs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Archivo: Código.gs (Tu script backend de Google Apps Script)
              </span>
              <button
                onClick={copyCodeGs}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedCodeGs ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código.gs</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-96 scrollbar-thin">
              {codeGsFull}
            </pre>
          </div>
        )}

        {/* TAB 4: GUÍA DE DESPLIEGUE */}
        {activeTab === 'guia' && (
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Cómo desplegar en Google Apps Script en 3 pasos:</span>
              </h3>

              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-100 block">Abre Google Apps Script vinculado a tu hoja:</strong>
                    <span className="text-slate-400">
                      En tu Google Sheet (<code className="text-emerald-400 font-mono">{NOMBRE_HOJA}</code>), ve al menú superior: <em>Extensiones &gt; Apps Script</em>.
                      Pega el contenido de la pestaña <strong>Código.gs</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-100 block">Crea el archivo Index.html:</strong>
                    <span className="text-slate-400">
                      En el menú lateral izquierdo de Apps Script, presiona el botón <strong>+</strong> &gt; <strong>HTML</strong> y nómbralo exactamente <code className="text-rose-400 font-mono">Index</code>.
                      Pega allí el código de la pestaña <strong>Index.html para Apps Script</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-100 block">Implementar como Aplicación Web:</strong>
                    <span className="text-slate-400">
                      Haz clic en <strong>Implementar &gt; Nueva implementación</strong>.
                      Selecciona Tipo: <em>Aplicación Web</em>.
                      Configura:
                      <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-300">
                        <li><strong>Ejecutar como:</strong> Yo (tu cuenta de correo)</li>
                        <li><strong>Quién tiene acceso:</strong> Cualquier usuario (o cualquier usuario de tu organización)</li>
                      </ul>
                      ¡Copia el enlace resultante y podrás usarla directamente o compartirla con tu equipo!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
