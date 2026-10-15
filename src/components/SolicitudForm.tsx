import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  MesaType,
  MESAS,
  MARCAS,
  AREAS,
  PAISES,
  PIEZAS,
  MESES
} from '../types/solicitud';
import { MesaCustomIcon, MESA_CONFIGS } from '../utils/mesaVisuals';
import {
  guardarSolicitud,
  obtenerDiasSegunSLA,
  calcularDiasHabiles,
  parseCantSegura
} from '../services/storageService';
import {
  Paperclip,
  Send,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload
} from 'lucide-react';

import { ToastType } from './ToastContainer';

interface SolicitudFormProps {
  onSolicitudCreada: (newId: string) => void;
  onGoToSolicitudes: () => void;
  onNotify?: (title: string, message: string, type: ToastType, ticketId?: string) => void;
}

export const SolicitudForm: React.FC<SolicitudFormProps> = ({
  onSolicitudCreada,
  onGoToSolicitudes,
  onNotify
}) => {
  const mesActualIndex = new Date().getMonth();
  const mesActualTexto = MESES[mesActualIndex];

  const [correo, setCorreo] = useState('mateo.lopez@fastmoda.com.co');
  const [solicitante, setSolicitante] = useState('Mateo López');
  const [area, setArea] = useState(AREAS[0]);
  const [mesa, setMesa] = useState<MesaType>('Visual');
  const [marca, setMarca] = useState(MARCAS[1] || MARCAS[0]); // Lili Pink
  const [pais, setPais] = useState(PAISES[0]); // Colombia
  const [pieza, setPieza] = useState(PIEZAS['Visual'][0]);
  const [detallePieza, setDetallePieza] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [fechaRequerida, setFechaRequerida] = useState('');
  const [linkBrief, setLinkBrief] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [diasMinimosSLA, setDiasMinimosSLA] = useState(5);
  const [fechaMinimaCalculada, setFechaMinimaCalculada] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Recalculate SLA min days when mesa, pieza or cantidad changes
  useEffect(() => {
    const dias = obtenerDiasSegunSLA(mesa, pieza, cantidad);
    setDiasMinimosSLA(dias);
    const minDate = calcularDiasHabiles(new Date(), dias);
    setFechaMinimaCalculada(minDate);

    // If current selected date is before minDate or empty, set to minDate
    if (!fechaRequerida || fechaRequerida < minDate) {
      setFechaRequerida(minDate);
    }
  }, [mesa, pieza, cantidad]);

  // Handle mesa change: update pieces list
  const handleMesaChange = (nuevaMesa: MesaType) => {
    setMesa(nuevaMesa);
    const piezasDeMesa = PIEZAS[nuevaMesa] || [];
    setPieza(piezasDeMesa[0] || '');
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!linkBrief.trim()) {
      alert('Por favor especifica el enlace o brief oficial en formato PDF.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = guardarSolicitud({
        correo: correo.trim(),
        solicitante: solicitante.trim(),
        area,
        mesa,
        marca,
        pais,
        pieza,
        detallePieza: detallePieza.trim(),
        cantidad: parseCantSegura(cantidad),
        fechaRequerida,
        linkBrief: linkBrief.trim(),
        descripcion: descripcion.trim(),
        prioridad: 'P3 - Normal'
      });

      setCreatedTicketId(res.id);
      onSolicitudCreada(res.id);
      onNotify?.(
        'Solicitud Radicada',
        `Requerimiento #${res.id} creado para Mesa ${mesa} (${marca}).`,
        'success',
        res.id
      );
      setDetallePieza('');
      setDescripcion('');
      setLinkBrief('');
      setCantidad(1);
    } catch (err: any) {
      alert('Error al guardar la solicitud: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excel loader
  const handleCargarExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dataBinary = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(dataBinary, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheetData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (sheetData && sheetData.length > 0) {
          alert(`Se leyeron ${sheetData.length} registros desde el archivo Excel.`);
          // If first row has fields, populate the form
          const first = sheetData[0];
          if (first['Correo'] || first['correo']) setCorreo(first['Correo'] || first['correo']);
          if (first['Solicitante'] || first['solicitante']) setSolicitante(first['Solicitante'] || first['solicitante']);
          if (first['Proyecto'] || first['detallePieza']) setDetallePieza(first['Proyecto'] || first['detallePieza']);
          if (first['Descripcion'] || first['descripcion']) setDescripcion(first['Descripcion'] || first['descripcion']);
          if (first['Brief'] || first['linkBrief']) setLinkBrief(first['Brief'] || first['linkBrief']);
        }
      } catch (err: any) {
        alert('Error al procesar el archivo Excel: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <section className="max-w-4xl mx-auto my-6 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="border-b border-slate-200 bg-slate-50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Registrar Nueva Solicitud Creativa
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              El SLA iniciará una vez el brief e insumos estén 100% completos (SLA 2026, Sec. 4).
            </p>
          </div>
          <div>
            <input
              type="file"
              id="inputExcel"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleCargarExcel}
            />
            <button
              type="button"
              onClick={() => document.getElementById('inputExcel')?.click()}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar desde Excel</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {createdTicketId && (
          <div className="p-5 m-6 mb-0 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h4 className="font-bold text-sm">¡Solicitud radicada con éxito!</h4>
                <p className="text-xs text-emerald-700">
                  Código de radicado:{' '}
                  <strong className="font-mono text-emerald-900">#{createdTicketId}</strong>. Se ha
                  notificado a la mesa de {mesa}.
                </p>
              </div>
            </div>
            <button
              onClick={onGoToSolicitudes}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              Ver en Solicitudes
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Mes, Correo, Solicitante */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mes (Automático)
              </label>
              <input
                disabled
                value={mesActualTexto}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold bg-slate-100 text-slate-700 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Correo Solicitante *
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nombre Solicitante *
              </label>
              <input
                type="text"
                required
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                placeholder="Nombre completo"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          {/* Visual Selector de Mesa Creativa con Iconos */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Mesa de Trabajo Creativa *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MESAS.map((m) => {
                const cfg = MESA_CONFIGS[m];
                const isSelected = mesa === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMesaChange(m)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/40'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white shadow-xs"
                      style={{ backgroundColor: cfg.colorHex }}
                    >
                      <MesaCustomIcon mesa={m} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-extrabold truncate leading-tight">
                        {m}
                      </span>
                      <span
                        className={`block text-[9px] font-mono truncate ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {cfg.shortCode}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Área, Mesa (Select fallback), Marca */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Área Solicitante *
              </label>
              <select
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-800 outline-none focus:border-blue-500"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Marca *</label>
              <select
                required
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-800 outline-none focus:border-blue-500 font-semibold"
              >
                {MARCAS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: País, Pieza, Nombre Proyecto */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">País *</label>
              <select
                required
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-800 outline-none focus:border-blue-500"
              >
                {PAISES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pieza *</label>
              <select
                required
                value={pieza}
                onChange={(e) => setPieza(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-800 font-medium outline-none focus:border-blue-500"
              >
                {(PIEZAS[mesa] || []).map((pz) => (
                  <option key={pz} value={pz}>
                    {pz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nombre o Número de Proyecto *
              </label>
              <input
                type="text"
                required
                value={detallePieza}
                onChange={(e) => setDetallePieza(e.target.value)}
                placeholder="Ej: Proyecto #102, Campaña Colección A"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50 text-slate-800 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Cantidad & Fecha Requerida con Matriz SLA 2026 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cantidad de Piezas *
              </label>
              <input
                type="number"
                min={1}
                required
                value={cantidad}
                onChange={(e) => setCantidad(parseCantSegura(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50 text-slate-800 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fecha Requerida *
              </label>
              <input
                type="date"
                required
                min={fechaMinimaCalculada}
                value={fechaRequerida}
                onChange={(e) => setFechaRequerida(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50 text-slate-800 outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  ⏱️ Matriz SLA 2026: Mínimo {diasMinimosSLA} días hábiles para esta cantidad y tipo de
                  solicitud.
                </span>
              </p>
            </div>
          </div>

          {/* Row 5: Brief Oficial PDF */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Brief Oficial{' '}
              <span className="text-rose-600 font-extrabold uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-200 ml-1">
                ⚠️ (ÚNICAMENTE FORMATO PDF)
              </span>{' '}
              *
            </label>
            <input
              type="text"
              required
              value={linkBrief}
              onChange={(e) => setLinkBrief(e.target.value)}
              placeholder="Pega el enlace URL o especificación del Brief PDF"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50 text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          {/* Row 6: Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Descripción del Proyecto / Especificaciones *
            </label>
            <textarea
              rows={3}
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Especificaciones técnicas, copys finales aprobados, dimensiones u observaciones..."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50 text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Guardando Solicitud...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Guardar Solicitud en Tiempo Real</span>
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};
