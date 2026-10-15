import React, { useState, useMemo } from 'react';
import {
  Solicitud,
  MesaType,
  DisenadoresPorMesa,
  MESAS
} from '../types/solicitud';
import { MesaBadge, MesaCustomIcon } from '../utils/mesaVisuals';
import {
  validarPin,
  accionCoordinacion,
  obtenerDisenadoresPersistentes,
  exportarExcelPorMesas,
  parseCantSegura,
  esFinalizadaORechazada
} from '../services/storageService';
import {
  ShieldCheck,
  Search,
  FileSpreadsheet,
  Lock,
  Unlock,
  FileText,
  ExternalLink,
  Users,
  CheckCircle,
  AlertTriangle,
  Filter,
  UserX,
  Layers,
  Sparkles
} from 'lucide-react';
import { ToastType } from './ToastContainer';

interface CoordinacionPanelProps {
  solicitudes: Solicitud[];
  onRefreshSolicitudes: () => void;
  isPinUnlocked: boolean;
  setIsPinUnlocked: (unlocked: boolean) => void;
  onNotify?: (title: string, message: string, type: ToastType, ticketId?: string) => void;
}

export const CoordinacionPanel: React.FC<CoordinacionPanelProps> = ({
  solicitudes,
  onRefreshSolicitudes,
  isPinUnlocked,
  setIsPinUnlocked,
  onNotify
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Top Filters
  const [mesaActiva, setMesaActiva] = useState<MesaType | 'Todas'>('Todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('PENDIENTES_ASIGNACION');
  const [busqueda, setBusqueda] = useState('');

  const disenadores = obtenerDisenadoresPersistentes();

  // Handle PIN unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarPin(pinInput)) {
      setIsPinUnlocked(true);
      setPinError(false);
      setPinInput('');
      onNotify?.('Acceso Concedido', 'Has ingresado a la Consola de Coordinación.', 'success');
    } else {
      setPinError(true);
    }
  };

  // Counts for KPIs
  const totalPendientesAsignacion = useMemo(() => {
    return solicitudes.filter(
      (s) => s.responsable === 'Sin Asignar' && !esFinalizadaORechazada(s.estado)
    ).length;
  }, [solicitudes]);

  const totalEnProceso = useMemo(() => {
    return solicitudes.filter((s) => s.estado === 'En proceso' || s.estado === 'Ajustes').length;
  }, [solicitudes]);

  const totalFinalizadas = useMemo(() => {
    return solicitudes.filter((s) => s.estado === 'Finalizada').length;
  }, [solicitudes]);

  // Filtered requests based on Mesa, Estado, and Search
  const solicitudesFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return solicitudes.filter((s) => {
      // 1. Filter by Mesa
      if (mesaActiva !== 'Todas' && s.mesa !== mesaActiva) return false;

      // 2. Filter by Estado
      if (filtroEstado === 'PENDIENTES_ASIGNACION') {
        if (s.responsable !== 'Sin Asignar' || esFinalizadaORechazada(s.estado)) {
          return false;
        }
      } else if (filtroEstado === 'ABIERTAS') {
        if (esFinalizadaORechazada(s.estado)) return false;
      } else if (filtroEstado !== 'TODOS') {
        if (!s.estado.toLowerCase().includes(filtroEstado.toLowerCase())) {
          return false;
        }
      }

      // 3. Filter by Search Query
      if (q) {
        const fullText = [
          s.id,
          s.correo,
          s.solicitante,
          s.area,
          s.descripcion,
          s.pieza,
          s.responsable,
          s.prioridad,
          s.detallePieza,
          s.marca
        ]
          .join(' ')
          .toLowerCase();
        if (!fullText.includes(q)) return false;
      }
      return true;
    });
  }, [solicitudes, mesaActiva, filtroEstado, busqueda]);

  // Handle auto-save coordination
  const handleAutoGuardar = (id: string, nuevaAprobacion?: string, nuevoResponsable?: string) => {
    const targetReq = solicitudes.find((s) => s.id === id);
    const prevResponsable = targetReq?.responsable;
    const prevAprobacion = targetReq?.aprobacion;

    accionCoordinacion(id, nuevaAprobacion, undefined, nuevoResponsable);
    onRefreshSolicitudes();

    // Trigger visual toast notifications
    if (nuevoResponsable !== undefined && nuevoResponsable !== prevResponsable) {
      if (nuevoResponsable !== 'Sin Asignar') {
        onNotify?.(
          'Diseñador Asignado',
          `Solicitud #${id} asignada a ${nuevoResponsable} (Mesa ${targetReq?.mesa || ''}).`,
          'assign',
          id
        );
      } else {
        onNotify?.(
          'Asignación Removida',
          `La solicitud #${id} quedó en estado Sin Asignar.`,
          'warning',
          id
        );
      }
    }

    if (nuevaAprobacion !== undefined && nuevaAprobacion !== prevAprobacion) {
      if (nuevaAprobacion === 'Aprobado') {
        onNotify?.(
          'Solicitud Aprobada',
          `La solicitud #${id} ha sido aprobada por Coordinación.`,
          'success',
          id
        );
      } else if (nuevaAprobacion === 'Rechazado') {
        onNotify?.(
          'Solicitud Rechazada',
          `La solicitud #${id} fue rechazada y pasó a estado Rechazada.`,
          'error',
          id
        );
      } else {
        onNotify?.(
          'Aprobación Pendiente',
          `La solicitud #${id} quedó en estado Pendiente.`,
          'info',
          id
        );
      }
    }
  };

  // Status badges helper
  const getBadgeEstado = (estado: string) => {
    const est = String(estado || '').toLowerCase();
    if (est.includes('proceso') || est.includes('iniciad')) {
      return { className: 'bg-blue-600 text-white', label: '🔵 En proceso' };
    }
    if (est.includes('ajuste')) {
      return { className: 'bg-amber-600 text-white', label: '🟠 En Ajustes' };
    }
    if (est.includes('finaliz') || est.includes('cerrad')) {
      return { className: 'bg-emerald-600 text-white', label: '🟢 Finalizada' };
    }
    if (est.includes('rechazad')) {
      return { className: 'bg-rose-600 text-white', label: '🔴 Rechazada' };
    }
    return { className: 'bg-slate-600 text-white', label: '⚪ Nueva' };
  };

  // If locked, render PIN unlock screen
  if (!isPinUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-white border border-slate-200 text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Acceso a Coordinación</h2>
        <p className="text-xs text-slate-500 mb-4">
          Ingresa la contraseña de Coordinación para acceder a este módulo.
        </p>

        <form onSubmit={handleUnlock} className="space-y-3">
          <input
            type="password"
            maxLength={20}
            autoFocus
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError(false);
            }}
            placeholder="Contraseña"
            className="w-full text-center tracking-widest px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-lg font-mono focus:outline-none focus:border-blue-500"
          />
          {pinError && (
            <p className="text-xs text-rose-500 font-semibold">
              ❌ Contraseña incorrecta. Acceso denegado.
            </p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-4">
      {/* Top Banner & Quick KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setFiltroEstado('PENDIENTES_ASIGNACION');
          }}
          className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
            filtroEstado === 'PENDIENTES_ASIGNACION'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              ⚠️ Pendientes Asignación
            </span>
            <span className="text-xl font-black text-amber-900 mt-0.5 block">
              {totalPendientesAsignacion}
            </span>
          </div>
          <UserX className="w-6 h-6 text-amber-600" />
        </button>

        <button
          onClick={() => {
            setFiltroEstado('ABIERTAS');
          }}
          className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
            filtroEstado === 'ABIERTAS'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Total Abiertas
            </span>
            <span className="text-xl font-black text-blue-900 mt-0.5 block">
              {solicitudes.filter((s) => !esFinalizadaORechazada(s.estado)).length}
            </span>
          </div>
          <Layers className="w-6 h-6 text-blue-600" />
        </button>

        <button
          onClick={() => {
            setFiltroEstado('En proceso');
          }}
          className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
            filtroEstado === 'En proceso'
              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
              En Producción Activa
            </span>
            <span className="text-xl font-black text-indigo-900 mt-0.5 block">
              {totalEnProceso}
            </span>
          </div>
          <CheckCircle className="w-6 h-6 text-indigo-600" />
        </button>

        <button
          onClick={() => {
            setFiltroEstado('Finalizada');
          }}
          className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
            filtroEstado === 'Finalizada'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Finalizadas / Entregadas
            </span>
            <span className="text-xl font-black text-emerald-900 mt-0.5 block">
              {totalFinalizadas}
            </span>
          </div>
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        </button>
      </div>

      {/* Main Panel Box */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
        {/* Header with Title and Global Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Consola de Coordinación y Asignación de Diseñadores
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Utiliza los filtros de <strong>Mesa</strong> y <strong>Estado</strong> para localizar
              de inmediato las solicitudes que necesitan ser asignadas.
            </p>
          </div>

          <button
            onClick={() => exportarExcelPorMesas(solicitudes)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel (Por Mesas)</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* BARRA DE FILTROS SUPERIOR (MESA, ESTADO, BUSCADOR)              */}
        {/* ============================================================== */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Filtros Principales de Coordinación
            </h3>
            {filtroEstado === 'PENDIENTES_ASIGNACION' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                Mostrando solo solicitudes sin diseñador
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* 1. Filtro por MESA */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Filtrar por Mesa / Área:
              </label>
              <select
                value={mesaActiva}
                onChange={(e) => setMesaActiva(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-900 font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Todas">🏢 Todas las Mesas ({solicitudes.length})</option>
                {MESAS.map((m) => {
                  const cantMesaSinAsignar = solicitudes.filter(
                    (s) => s.mesa === m && s.responsable === 'Sin Asignar' && !esFinalizadaORechazada(s.estado)
                  ).length;
                  const totalMesa = solicitudes.filter((s) => s.mesa === m).length;
                  return (
                    <option key={m} value={m}>
                      {m} ({totalMesa} totales {cantMesaSinAsignar > 0 ? `· ⚠️ ${cantMesaSinAsignar} sin asignar` : ''})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2. Filtro por ESTADO */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Filtrar por Estado Operativo:
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={`w-full border rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 ${
                  filtroEstado === 'PENDIENTES_ASIGNACION'
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-extrabold'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              >
                <option value="PENDIENTES_ASIGNACION">
                  ⚠️ Pendientes de Asignación (Sin Asignar) [{totalPendientesAsignacion}]
                </option>
                <option value="ABIERTAS">🔵 Todas las Abiertas (Por Gestionar)</option>
                <option value="TODOS">📋 Todos los Estados</option>
                <option value="Nueva">⚪ Nuevas</option>
                <option value="En proceso">🔵 En proceso</option>
                <option value="Ajustes">🟠 En Ajustes</option>
                <option value="Finalizada">🟢 Finalizadas</option>
                <option value="Rechazada">🔴 Rechazadas</option>
              </select>
            </div>

            {/* 3. Buscador por Texto */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Búsqueda Rápida:
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ticket, solicitante, proyecto..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500">Acceso rápido:</span>

            <button
              type="button"
              onClick={() => {
                setFiltroEstado('PENDIENTES_ASIGNACION');
                setMesaActiva('Todas');
                setBusqueda('');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                filtroEstado === 'PENDIENTES_ASIGNACION' && mesaActiva === 'Todas'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white border border-slate-200 text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span>⚠️ Ver Todas las Pendientes de Asignación ({totalPendientesAsignacion})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFiltroEstado('ABIERTAS');
                setMesaActiva('Todas');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filtroEstado === 'ABIERTAS' && mesaActiva === 'Todas'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Ver Todas las Abiertas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFiltroEstado('TODOS');
                setMesaActiva('Todas');
                setBusqueda('');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
            >
              Restablecer Filtros
            </button>
          </div>
        </div>

        {/* Pestañas por Mesa secundarias */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
          <button
            onClick={() => setMesaActiva('Todas')}
            className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 font-bold ${
              mesaActiva === 'Todas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Todas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                mesaActiva === 'Todas' ? 'bg-blue-800 text-white' : 'bg-slate-300 text-slate-800'
              }`}
            >
              {solicitudes.length}
            </span>
          </button>

          {MESAS.map((m) => {
            const cantMesaSinAsignar = solicitudes.filter(
              (s) => s.mesa === m && s.responsable === 'Sin Asignar' && !esFinalizadaORechazada(s.estado)
            ).length;
            const isSelected = m === mesaActiva;

            return (
              <button
                key={m}
                onClick={() => setMesaActiva(m)}
                className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 font-semibold ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MesaCustomIcon mesa={m} size="sm" />
                <span>{m}</span>
                {cantMesaSinAsignar > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                    {cantMesaSinAsignar}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table of requests */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">#Solicitud</th>
                <th className="p-3">Solicitante / Área</th>
                <th className="p-3">Mesa</th>
                <th className="p-3">Proyecto & Brief PDF</th>
                <th className="p-3">Prioridad SLA</th>
                <th className="p-3 text-center">Estado Diseñador</th>
                <th className="p-3">Asignar Diseñador</th>
                <th className="p-3 text-center">Aprobación Coordinador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <UserX className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">
                      No hay solicitudes para los filtros seleccionados.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Prueba seleccionando &quot;Todas las Mesas&quot; o &quot;Todos los Estados&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((s) => {
                  const disOpciones = disenadores[s.mesa] || [];
                  const estBadge = getBadgeEstado(s.estado);
                  const sinAsignar = s.responsable === 'Sin Asignar';

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50 transition ${
                        sinAsignar ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* ID & Timestamp */}
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        <span className="font-mono text-sm text-blue-700 font-extrabold">
                          #{s.id}
                        </span>
                        <br />
                        <span className="text-[10px] text-slate-400 font-normal">
                          {s.marcaTemporal}
                        </span>
                      </td>

                      {/* Requester & Area */}
                      <td className="p-3">
                        <span className="font-semibold text-slate-900">{s.solicitante}</span>
                        <br />
                        <span className="text-slate-500 text-[11px]">{s.area}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {s.marca} · {s.pais}
                        </span>
                      </td>

                      {/* Mesa */}
                      <td className="p-3 whitespace-nowrap">
                        <MesaBadge mesa={s.mesa} />
                      </td>

                      {/* Project & Brief */}
                      <td className="p-3 max-w-xs">
                        <span className="font-semibold text-slate-800">
                          {s.pieza} ({parseCantSegura(s.cantidad)} pzs)
                        </span>
                        <br />
                        <span className="text-slate-500 text-[11px] font-semibold">
                          {s.detallePieza || 'Sin proyecto'}
                        </span>
                        <br />
                        {s.linkBrief ? (
                          <a
                            href={s.linkBrief}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline text-[11px] font-bold inline-flex items-center gap-1 mt-0.5"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Ver Brief PDF</span>
                          </a>
                        ) : (
                          <span className="text-rose-500 text-[10px] font-semibold">
                            Sin Brief
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="p-3 font-bold text-[11px] text-slate-700 whitespace-nowrap">
                        {s.prioridad}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Req: {s.fechaRequerida}
                        </div>
                      </td>

                      {/* Designer State Badge */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${estBadge.className}`}
                        >
                          {estBadge.label}
                        </span>
                      </td>

                      {/* Assign Designer Dropdown */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <select
                            value={s.responsable}
                            onChange={(e) => handleAutoGuardar(s.id, undefined, e.target.value)}
                            className={`border rounded-lg p-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-400 w-44 transition ${
                              sinAsignar
                                ? 'border-amber-400 bg-amber-50 text-amber-950 font-extrabold shadow-sm ring-1 ring-amber-300'
                                : 'border-slate-300 bg-white text-slate-800'
                            }`}
                          >
                            <option value="Sin Asignar">⚠️ Sin Asignar</option>
                            {disOpciones.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          {sinAsignar && (
                            <span className="text-[10px] text-amber-700 font-bold block">
                              Requiere asignación
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Coordinator Approval Dropdown */}
                      <td className="p-3 text-center">
                        <select
                          value={s.aprobacion}
                          onChange={(e) => handleAutoGuardar(s.id, e.target.value, undefined)}
                          className="border border-slate-300 rounded-lg p-1.5 text-[11px] font-extrabold bg-white text-slate-800 shadow-sm outline-none focus:border-blue-500 w-32"
                        >
                          <option value="Pendiente">🟡 Pendiente</option>
                          <option value="Aprobado">🟢 Aprobado</option>
                          <option value="Rechazado">🔴 Rechazado</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
