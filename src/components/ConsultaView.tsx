import React, { useState } from 'react';
import { Solicitud } from '../types/solicitud';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Calendar,
  RotateCcw
} from 'lucide-react';

interface ConsultaViewProps {
  solicitudes: Solicitud[];
  initialTicketId?: string;
}

export const ConsultaView: React.FC<ConsultaViewProps> = ({
  solicitudes,
  initialTicketId = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialTicketId);
  const [selectedTicket, setSelectedTicket] = useState<Solicitud | null>(() => {
    if (initialTicketId) {
      return solicitudes.find((s) => s.id.toLowerCase() === initialTicketId.toLowerCase()) || null;
    }
    return solicitudes[0] || null;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const clean = searchTerm.trim().toLowerCase().replace('#', '');
    const found = solicitudes.find(
      (s) =>
        s.id.toLowerCase() === clean ||
        s.id.toLowerCase() === `f${clean}` ||
        s.correo.toLowerCase().includes(clean) ||
        s.detallePieza.toLowerCase().includes(clean)
    );

    if (found) {
      setSelectedTicket(found);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Finalizada':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'En Proceso':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'En Ajuste':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Nueva':
        return 'bg-slate-700 text-slate-300 border-slate-600';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Consulta y Rastreo de Requerimientos
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl mx-auto">
          Ingresa tu número de radicado (ej: #F105) o correo electrónico para verificar el estado
          en tiempo real, diseñador asignado y tiempos SLA.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 max-w-lg mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar #Ticket (ej. F105) o correo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-lg text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Main Ticket Display */}
      {selectedTicket ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xl font-extrabold text-amber-400">
                    #{selectedTicket.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                      selectedTicket.estado
                    )}`}
                  >
                    {selectedTicket.estado}
                  </span>
                  <span className="text-xs text-slate-400">
                    Mesa de {selectedTicket.mesa}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">
                  {selectedTicket.detallePieza}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedTicket.pieza} ({selectedTicket.cantidad} unidades) · {selectedTicket.marca} ({selectedTicket.pais})
                </p>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-slate-400">Fecha Límite Requerida:</span>
                <span className="text-sm font-bold text-rose-400">
                  {selectedTicket.fechaRequerida || 'No especificada'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {selectedTicket.prioridad}
                </span>
              </div>
            </div>

            {/* Visual Timeline of Stages */}
            <div className="pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                Progreso del Ciclo de Vida del Requerimiento
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {/* Step 1: Solicitud */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">
                    ✓
                  </div>
                  <h4 className="text-xs font-bold text-white">1. Solicitada</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {selectedTicket.solicitante}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    {selectedTicket.marcaTemporal || 'Recibida'}
                  </span>
                </div>

                {/* Step 2: Aprobación & Asignación */}
                <div
                  className={`p-4 rounded-xl border relative ${
                    selectedTicket.aprobacion === 'Aprobado'
                      ? 'bg-slate-950 border-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                      selectedTicket.aprobacion === 'Aprobado'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {selectedTicket.aprobacion === 'Aprobado' ? '✓' : '2'}
                  </div>
                  <h4 className="text-xs font-bold text-white">
                    2. Aprobación & Asignación
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Responsable: <strong className="text-indigo-400">{selectedTicket.responsable}</strong>
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    {selectedTicket.fechaAsignacion || 'Pendiente'}
                  </span>
                </div>

                {/* Step 3: Producción */}
                <div
                  className={`p-4 rounded-xl border relative ${
                    selectedTicket.fechaInicio
                      ? 'bg-slate-950 border-blue-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                      selectedTicket.fechaInicio
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {selectedTicket.fechaInicio ? '⏱' : '3'}
                  </div>
                  <h4 className="text-xs font-bold text-white">3. Producción Gráfica</h4>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {selectedTicket.ajustesCantidad > 0
                      ? `${selectedTicket.ajustesCantidad} ajuste(s) registrado(s)`
                      : 'En elaboración'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Inicio: {selectedTicket.fechaInicio || 'Por iniciar'}
                  </span>
                </div>

                {/* Step 4: Cierre & Entrega */}
                <div
                  className={`p-4 rounded-xl border relative ${
                    selectedTicket.fechaCierre
                      ? 'bg-emerald-950/40 border-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                      selectedTicket.fechaCierre
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {selectedTicket.fechaCierre ? '★' : '4'}
                  </div>
                  <h4 className="text-xs font-bold text-white">4. Entrega Final</h4>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {selectedTicket.tiempoTotal ? (
                      <span className="text-emerald-400 font-semibold">
                        Tiempo: {selectedTicket.tiempoTotal}
                      </span>
                    ) : (
                      'En espera de cierre'
                    )}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    {selectedTicket.fechaCierre || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Links and Deliverables Section */}
            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold mb-1">
                  Insumos & Brief del Solicitante:
                </span>
                {selectedTicket.linkBrief ? (
                  <a
                    href={selectedTicket.linkBrief}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:underline mt-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Brief PDF en pestaña nueva</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">No se adjuntó enlace de brief</span>
                )}
                <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-900 whitespace-pre-wrap">
                  {selectedTicket.descripcion}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold mb-1">
                  Entregable del Diseñador:
                </span>
                {selectedTicket.linkResultado ? (
                  <div>
                    <a
                      href={selectedTicket.linkResultado}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-emerald-400 font-bold hover:underline mt-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Descargar / Ver Entregable Final</span>
                    </a>
                    <p className="text-xs text-slate-500 mt-2">
                      Subido por {selectedTicket.responsable} el {selectedTicket.fechaCierre}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    La pieza aún está en proceso o en revisión. El enlace de descarga estará disponible
                    tan pronto el diseñador complete el cierre.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Other recent requests from same requester */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3">
              Todas las Solicitudes en el Sistema ({solicitudes.length})
            </h3>
            <div className="divide-y divide-slate-800/80">
              {solicitudes.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedTicket(s)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      #{s.id}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {s.detallePieza}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {s.solicitante} · {s.mesa}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${getStatusBadge(
                        s.estado
                      )}`}
                    >
                      {s.estado}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
          No se encontró ninguna solicitud con ese criterio.
        </div>
      )}
    </div>
  );
};
