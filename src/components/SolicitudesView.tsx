import React, { useState, useMemo } from 'react';
import { Solicitud, MesaType, MESAS } from '../types/solicitud';
import { parseCantSegura } from '../services/storageService';
import { MesaCustomIcon, MesaBadge } from '../utils/mesaVisuals';
import { FolderOpen, Search, ArrowUpRight } from 'lucide-react';

interface SolicitudesViewProps {
  solicitudes: Solicitud[];
}

export const SolicitudesView: React.FC<SolicitudesViewProps> = ({ solicitudes }) => {
  const [mesaActiva, setMesaActiva] = useState<MesaType>('Visual');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  const getEstiloAprobacion = (aprobacion: string) => {
    const ap = String(aprobacion || '').toLowerCase();
    if (ap.includes('aprob')) {
      return { className: 'bg-emerald-600 text-white', label: '🟢 Aprobado' };
    }
    if (ap.includes('rechaz')) {
      return { className: 'bg-rose-600 text-white', label: '🔴 Rechazado' };
    }
    return { className: 'bg-amber-500 text-white', label: '🟡 Pendiente' };
  };

  const getEstiloEstado = (estado: string) => {
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

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return solicitudes.filter((s) => {
      if (s.mesa !== mesaActiva) return false;
      if (
        estadoFiltro !== 'TODOS' &&
        !s.estado.toLowerCase().includes(estadoFiltro.toLowerCase())
      ) {
        return false;
      }
      if (q) {
        const full = [
          s.id,
          s.correo,
          s.solicitante,
          s.area,
          s.descripcion,
          s.pieza,
          s.responsable,
          s.detallePieza,
          s.marca
        ]
          .join(' ')
          .toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });
  }, [solicitudes, mesaActiva, estadoFiltro, busqueda]);

  return (
    <section className="max-w-7xl mx-auto my-6 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              <span>Vista General de Solicitudes</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulta todas las tareas registradas con identificación de color por estado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="border border-slate-300 rounded-lg p-1.5 text-xs bg-white text-slate-800 font-semibold outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="Nueva">⚪ Nueva / Pendiente</option>
              <option value="En proceso">🔵 En proceso</option>
              <option value="Ajustes">🟠 En Ajustes</option>
              <option value="Finalizada">🟢 Finalizada</option>
              <option value="Rechazada">🔴 Rechazada</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar solicitud..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-800 outline-none focus:border-blue-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Mesa Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {MESAS.map((m) => {
            const isSelected = m === mesaActiva;
            return (
              <button
                key={m}
                onClick={() => setMesaActiva(m)}
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

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">#Solicitud</th>
                <th className="p-3">Mesa</th>
                <th className="p-3">Solicitante / Área</th>
                <th className="p-3">Proyecto & Detalle</th>
                <th className="p-3 text-center">Cant.</th>
                <th className="p-3">Diseñador</th>
                <th className="p-3 text-center">Aprobación</th>
                <th className="p-3 text-center">Estado Operativo</th>
                <th className="p-3 text-center">Tiempo Registrado</th>
                <th className="p-3 text-center">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-slate-400">
                    No se encontraron solicitudes registradas para esta mesa y filtro.
                  </td>
                </tr>
              ) : (
                filtradas.map((s) => {
                  const estAprob = getEstiloAprobacion(s.aprobacion);
                  const estOper = getEstiloEstado(s.estado);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{s.id}</td>
                      <td className="p-3 whitespace-nowrap">
                        <MesaBadge mesa={s.mesa} />
                      </td>
                      <td className="p-3">
                        <span className="font-semibold">{s.solicitante}</span>
                        <br />
                        <span className="text-slate-500 text-[11px]">
                          {s.area} · <span className="text-slate-400">{s.marca}</span>
                        </span>
                      </td>
                      <td className="p-3 max-w-xs">
                        <span className="font-medium text-slate-800">{s.pieza}</span>
                        {s.detallePieza && (
                          <div className="text-slate-500 text-[11px] truncate">
                            {s.detallePieza}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold">{parseCantSegura(s.cantidad)}</td>
                      <td className="p-3 font-medium whitespace-nowrap">{s.responsable}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${estAprob.className}`}
                        >
                          {estAprob.label}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${estOper.className}`}
                        >
                          {estOper.label}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {s.tiempoTotal || 'N/A'}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {s.linkResultado ? (
                          <a
                            href={s.linkResultado}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline font-bold inline-flex items-center gap-1"
                          >
                            <span>Ver</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
