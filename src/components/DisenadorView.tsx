import React, { useState, useMemo } from 'react';
import {
  Solicitud,
  MesaType,
  MESAS,
  DisenadoresPorMesa
} from '../types/solicitud';
import { MesaCustomIcon, MesaBadge } from '../utils/mesaVisuals';
import {
  obtenerDisenadoresPersistentes,
  guardarDisenadoresPersistentes,
  accionDisenadorTiempo,
  parseCantSegura,
  esFinalizadaORechazada
} from '../services/storageService';
import {
  UserCheck,
  UserPlus,
  X,
  Play,
  RotateCcw,
  Check,
  FileText,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

import { ToastType } from './ToastContainer';

interface DisenadorViewProps {
  solicitudes: Solicitud[];
  onRefreshSolicitudes: () => void;
  onNotify?: (title: string, message: string, type: ToastType, ticketId?: string) => void;
}

export const DisenadorView: React.FC<DisenadorViewProps> = ({
  solicitudes,
  onRefreshSolicitudes,
  onNotify
}) => {
  const [mesaTrabajoActiva, setMesaTrabajoActiva] = useState<MesaType>('Visual');
  const [disenadores, setDisenadores] = useState<DisenadoresPorMesa>(obtenerDisenadoresPersistentes);
  const [nuevoDisenadorInput, setNuevoDisenadorInput] = useState('');
  const [filtroDisenador, setFiltroDisenador] = useState<string>('TODOS');

  // Modal for finalization
  const [finalizarModalId, setFinalizarModalId] = useState<string | null>(null);
  const [linkEntrega, setLinkEntrega] = useState('');

  const disList = disenadores[mesaTrabajoActiva] || [];

  // Add designer
  const handleAgregarDisenador = (e: React.FormEvent) => {
    e.preventDefault();
    const nombre = nuevoDisenadorInput.trim();
    if (!nombre) return;

    if (!disList.includes(nombre)) {
      const updated = {
        ...disenadores,
        [mesaTrabajoActiva]: [...disList, nombre]
      };
      setDisenadores(updated);
      guardarDisenadoresPersistentes(updated);
      setNuevoDisenadorInput('');
      onNotify?.('Diseñador Añadido', `${nombre} fue agregado a la Mesa ${mesaTrabajoActiva}.`, 'success');
    }
  };

  // Remove designer
  const handleEliminarDisenador = (nombre: string) => {
    const updated = {
      ...disenadores,
      [mesaTrabajoActiva]: disList.filter((d) => d !== nombre)
    };
    setDisenadores(updated);
    guardarDisenadoresPersistentes(updated);
    onNotify?.('Diseñador Retirado', `${nombre} fue eliminado de la Mesa ${mesaTrabajoActiva}.`, 'info');
  };

  // Actions
  const handleIniciar = (id: string) => {
    accionDisenadorTiempo(id, 'En proceso', 'inicio');
    onRefreshSolicitudes();
    onNotify?.('Producción Iniciada', `La solicitud #${id} cambió de estado a "En proceso".`, 'info', id);
  };

  const handleRegistrarAjuste = (id: string, cantAjustes: number) => {
    const nuevoNumeroAjuste = cantAjustes + 1;
    if (cantAjustes >= 3) {
      alert(
        '⚠️ LÍMITE DE SLA ALCANZADO (SLA 2026, Sec. 5):\n\nEsta solicitud ya consumió sus 3 rondas de ajustes de diseño permitidas. Toda ronda adicional (4.ª en adelante) equivale a +0.5 piezas y requiere ser ingresada de nuevo como una nueva solicitud.'
      );
    }
    accionDisenadorTiempo(id, 'Ajustes', 'ajuste');
    onRefreshSolicitudes();
    onNotify?.(
      'Ajuste Registrado',
      `Solicitud #${id} pasó a estado "Ajustes" (Ronda ${nuevoNumeroAjuste}/3).`,
      'warning',
      id
    );
  };

  const handleOpenFinalizar = (id: string) => {
    setFinalizarModalId(id);
    setLinkEntrega('');
  };

  const handleConfirmFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalizarModalId) return;

    accionDisenadorTiempo(finalizarModalId, 'Finalizada', 'cierre', linkEntrega.trim());
    const finishedId = finalizarModalId;
    setFinalizarModalId(null);
    setLinkEntrega('');
    onRefreshSolicitudes();
    onNotify?.(
      '¡Solicitud Finalizada!',
      `La solicitud #${finishedId} fue entregada y su tiempo quedó sellado.`,
      'success',
      finishedId
    );
  };

  // Helper styles matching user CSS classes
  const getCardStyle = (estado: string) => {
    const est = String(estado || '').toLowerCase();
    if (est.includes('proceso') || est.includes('iniciad')) {
      return {
        cardBorder: 'border-2 border-blue-600 bg-blue-50/60',
        badgeClass: 'bg-blue-600 text-white',
        label: '🔵 En proceso'
      };
    }
    if (est.includes('ajuste')) {
      return {
        cardBorder: 'border-2 border-amber-500 bg-amber-50/60',
        badgeClass: 'bg-amber-600 text-white',
        label: '🟠 En Ajustes'
      };
    }
    if (est.includes('finaliz') || est.includes('cerrad')) {
      return {
        cardBorder: 'border-2 border-emerald-600 bg-emerald-50/60',
        badgeClass: 'bg-emerald-600 text-white',
        label: '🟢 Finalizada'
      };
    }
    if (est.includes('rechazad')) {
      return {
        cardBorder: 'border-2 border-rose-600 bg-rose-50/60',
        badgeClass: 'bg-rose-600 text-white',
        label: '🔴 Rechazada'
      };
    }
    return {
      cardBorder: 'border-2 border-slate-400 bg-slate-50',
      badgeClass: 'bg-slate-600 text-white',
      label: '⚪ Nueva'
    };
  };

  const getAprobacionBadge = (aprobacion: string) => {
    const ap = String(aprobacion || '').toLowerCase();
    if (ap.includes('aprob')) return { className: 'bg-emerald-600 text-white', label: '🟢 Aprobado' };
    if (ap.includes('rechaz')) return { className: 'bg-rose-600 text-white', label: '🔴 Rechazado' };
    return { className: 'bg-amber-500 text-white', label: '🟡 Pendiente' };
  };

  // Active tasks for this mesa
  const tareasMesa = useMemo(() => {
    return solicitudes.filter((s) => {
      if (s.mesa !== mesaTrabajoActiva) return false;
      if (esFinalizadaORechazada(s.estado)) return false;
      if (filtroDisenador !== 'TODOS' && s.responsable !== filtroDisenador) return false;
      return true;
    });
  }, [solicitudes, mesaTrabajoActiva, filtroDisenador]);

  return (
    <section className="max-w-7xl mx-auto my-6 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
        {/* Title & Subtitle */}
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Mesa del Diseñador - Tareas Pendientes y En Proceso
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Máximo 3 rondas de ajuste por solicitud (SLA 2026, Sec. 5). Rondas adicionales requieren
            re-ingreso.
          </p>
        </div>

        {/* Mesa Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {MESAS.map((m) => {
            const isSelected = m === mesaTrabajoActiva;
            return (
              <button
                key={m}
                onClick={() => {
                  setMesaTrabajoActiva(m);
                  setFiltroDisenador('TODOS');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MesaCustomIcon mesa={m} size="sm" />
                <span>{m}</span>
              </button>
            );
          })}
        </div>

        {/* Designer Manager for this Mesa */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Diseñadores de la Mesa ({mesaTrabajoActiva})
              </h3>
              <p className="text-[11px] text-slate-500">
                Integrantes de esta mesa (los cambios se guardan permanentemente).
              </p>
            </div>

            <form onSubmit={handleAgregarDisenador} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={nuevoDisenadorInput}
                onChange={(e) => setNuevoDisenadorInput(e.target.value)}
                placeholder="Nombre del diseñador..."
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-800 outline-none focus:border-blue-500 w-full sm:w-56"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {disList.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xl"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>{d}</span>
                <button
                  type="button"
                  onClick={() => handleEliminarDisenador(d)}
                  className="text-slate-400 hover:text-rose-600 ml-1 transition"
                  title="Eliminar diseñador"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Filter by Designer Header */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <h3 className="text-sm font-bold text-slate-800">
            Solicitudes Activas ({tareasMesa.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filtrar diseñador:</span>
            <select
              value={filtroDisenador}
              onChange={(e) => setFiltroDisenador(e.target.value)}
              className="border border-slate-300 rounded-lg p-1.5 text-xs bg-white text-slate-800 font-medium outline-none focus:border-blue-500 w-48"
            >
              <option value="TODOS">Todos los diseñadores</option>
              {disList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareasMesa.length === 0 ? (
            <p className="text-slate-400 text-xs col-span-full text-center py-8">
              No hay solicitudes activas para esta mesa.
            </p>
          ) : (
            tareasMesa.map((s) => {
              const estilo = getCardStyle(s.estado);
              const estAprob = getAprobacionBadge(s.aprobacion);
              const cantAjustes = Number(s.ajustesCantidad) || 0;

              return (
                <div
                  key={s.id}
                  className={`rounded-2xl p-4 shadow-sm space-y-3 ${estilo.cardBorder}`}
                >
                  {/* Top: ID & Badges */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{s.id}</span>
                      <MesaBadge mesa={s.mesa} />
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${estAprob.className}`}
                      >
                        {estAprob.label}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${estilo.badgeClass}`}
                      >
                        {estilo.label}
                      </span>
                    </div>
                  </div>

                  {/* Piece & Project */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {s.pieza} ({parseCantSegura(s.cantidad)} pzs)
                    </h4>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">
                      {s.detallePieza || 'Proyecto Sin Nombre'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {s.solicitante} - <span className="font-semibold">{s.area}</span> (
                      {s.marca})
                    </p>
                  </div>

                  {/* Details box */}
                  <div className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                    <p className="line-clamp-3">
                      <strong>Detalle:</strong> {s.descripcion}
                    </p>
                    {s.linkBrief && (
                      <p className="pt-1">
                        <a
                          href={s.linkBrief}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline font-bold inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Abrir Brief PDF</span>
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Footer: Responsable & Ajustes Counter */}
                  <div className="text-xs font-semibold text-slate-600 flex justify-between items-center pt-1 border-t border-slate-200/80">
                    <span>Diseñador: {s.responsable}</span>
                    <span
                      className={
                        cantAjustes >= 3 ? 'text-rose-600 font-extrabold' : 'text-slate-600'
                      }
                    >
                      Ronda Ajuste: {cantAjustes}/3
                    </span>
                  </div>

                  {/* 3 Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleIniciar(s.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded text-[10px] flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <Play className="w-3 h-3" />
                      <span>Iniciar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRegistrarAjuste(s.id, cantAjustes)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 rounded text-[10px] flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Ajuste ({cantAjustes})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenFinalizar(s.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded text-[10px] flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <Check className="w-3 h-3" />
                      <span>Finalizar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Finalizar Tarea */}
      {finalizarModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Finalizar Solicitud #{finalizarModalId}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pega el enlace con el resultado de la pieza entregada (Google Drive, Dropbox, Figma,
              etc.):
            </p>

            <form onSubmit={handleConfirmFinalizar} className="space-y-4">
              <div>
                <input
                  type="url"
                  required
                  autoFocus
                  value={linkEntrega}
                  onChange={(e) => setLinkEntrega(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFinalizarModalId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  Confirmar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
