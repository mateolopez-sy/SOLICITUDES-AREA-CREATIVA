import React, { useState, useMemo } from 'react';
import { Solicitud, MESAS, MESES, MARCAS, MesaType } from '../types/solicitud';
import {
  parseCantSegura,
  esFinalizadaORechazada,
  obtenerDisenadoresPersistentes
} from '../services/storageService';
import { PieChartCard, PieSegment } from './PieChartCard';
import { MESA_CONFIGS, MesaBadge, MesaCustomIcon } from '../utils/mesaVisuals';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Award,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Palette,
  ExternalLink,
  Zap,
  Filter,
  Check,
  RotateCcw,
  Tag,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { exportarSolicitudesCSV } from '../utils/exportCsv';
import { ToastType } from './ToastContainer';

interface MetricasViewProps {
  solicitudes: Solicitud[];
  onNotify?: (title: string, message: string, type: ToastType, ticketId?: string) => void;
}

export const MetricasView: React.FC<MetricasViewProps> = ({ solicitudes, onNotify }) => {
  const mesActualIndex = new Date().getMonth();
  const [mesSel, setMesSel] = useState<string>(MESES[mesActualIndex]);
  const [mesaSel, setMesaSel] = useState<string>('TODAS');

  const disenadoresPorMesa = obtenerDisenadoresPersistentes();

  // Safe month extraction
  const extraerNombreMes = (s: Solicitud): string => {
    if (s.mes && String(s.mes).trim() !== '') {
      return String(s.mes).trim();
    }
    if (s.marcaTemporal) {
      const raw = String(s.marcaTemporal).trim();
      if (raw.length >= 7 && raw.includes('-')) {
        const partes = raw.split('-');
        const mesNum = parseInt(partes[1], 10);
        if (!isNaN(mesNum) && mesNum >= 1 && mesNum <= 12) {
          return MESES[mesNum - 1];
        }
      }
      const d = new Date(raw.replace(' ', 'T'));
      if (!isNaN(d.getTime())) {
        return MESES[d.getMonth()];
      }
    }
    return 'Enero';
  };

  const clean = (str: string) =>
    String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Filtered dataset for analytics
  const dataAnalitica = useMemo(() => {
    return solicitudes.filter((s) => {
      const mesCalculado = extraerNombreMes(s);
      if (mesSel !== 'TODOS' && clean(mesCalculado) !== clean(mesSel)) return false;
      if (mesaSel !== 'TODAS' && s.mesa !== mesaSel) return false;
      return true;
    });
  }, [solicitudes, mesSel, mesaSel]);

  // CSV Export State and Handlers
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportarVista = () => {
    if (dataAnalitica.length === 0) {
      if (onNotify) {
        onNotify('Sin registros para exportar', 'No hay solicitudes bajo los filtros seleccionados.', 'warning');
      }
      return;
    }
    const prefix = `SLA_2026_${mesSel === 'TODOS' ? 'Anual' : mesSel}_${mesaSel === 'TODAS' ? 'TodasMesas' : mesaSel}`;
    const res = exportarSolicitudesCSV(dataAnalitica, prefix);
    if (res.success) {
      const msg = `Se exportaron ${res.count} solicitudes filtradas en formato CSV (${res.filename})`;
      setExportNotice(msg);
      setTimeout(() => setExportNotice(null), 5000);
      if (onNotify) {
        onNotify('Respaldo CSV Descargado', msg, 'success');
      }
    }
  };

  const handleExportarTodo = () => {
    if (solicitudes.length === 0) {
      if (onNotify) {
        onNotify('Base de datos vacía', 'No hay registros en la base de datos.', 'warning');
      }
      return;
    }
    const res = exportarSolicitudesCSV(solicitudes, 'SLA_2026_BD_Completa_Diseno');
    if (res.success) {
      const msg = `Se exportó la base completa con ${res.count} solicitudes (${res.filename})`;
      setExportNotice(msg);
      setTimeout(() => setExportNotice(null), 5000);
      if (onNotify) {
        onNotify('Copia Completa CSV Descargada', msg, 'success');
      }
    }
  };

  // Overall KPIs
  const totalSolicitudes = dataAnalitica.length;
  const totalPiezas = dataAnalitica.reduce(
    (acc, s) => acc + parseCantSegura(s.cantidad),
    0
  );

  const finalizadas = dataAnalitica.filter(
    (s) =>
      esFinalizadaORechazada(s.estado) &&
      !String(s.estado).toLowerCase().includes('rechazad')
  );
  const piezasFinalizadas = finalizadas.reduce(
    (acc, s) => acc + parseCantSegura(s.cantidad),
    0
  );

  const enProceso = dataAnalitica
    .filter((s) => !esFinalizadaORechazada(s.estado))
    .reduce((acc, s) => acc + parseCantSegura(s.cantidad), 0);

  const enAjustes = dataAnalitica
    .filter((s) => String(s.estado).toLowerCase().includes('ajuste'))
    .reduce((acc, s) => acc + parseCantSegura(s.cantidad), 0);

  const efectividad =
    totalPiezas > 0 ? Math.round((piezasFinalizadas / totalPiezas) * 100) : 0;

  // On-time SLA delivery check
  const onTimeCount = finalizadas.filter((s) => {
    if (!s.fechaRequerida || !s.fechaCierre) return true;
    return s.fechaCierre.slice(0, 10) <= s.fechaRequerida.slice(0, 10);
  }).length;

  const slaCompliance =
    finalizadas.length > 0 ? Math.round((onTimeCount / finalizadas.length) * 100) : 100;

  // Design Adjustment Iteration Rate
  const solicitudesConAjustes = dataAnalitica.filter(
    (s) => Number(s.ajustesCantidad || 0) > 0 || String(s.estado).toLowerCase().includes('ajuste')
  ).length;
  const ratioAjustes =
    totalSolicitudes > 0 ? Math.round((solicitudesConAjustes / totalSolicitudes) * 100) : 0;

  // 1. Gráfico Circular: Distribución por Mesa con Iconos Custom
  const mesaSegments: PieSegment[] = useMemo(() => {
    return MESAS.map((m) => {
      const count = dataAnalitica.filter((s) => s.mesa === m).length;
      const cfg = MESA_CONFIGS[m];
      return {
        label: cfg.label,
        value: count,
        color: cfg.colorHex,
        sublabel: cfg.tagline,
        iconNode: (
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center text-white"
            style={{ backgroundColor: cfg.colorHex }}
          >
            <MesaCustomIcon mesa={m} size="sm" />
          </span>
        )
      };
    });
  }, [dataAnalitica]);

  // 2. Gráfico Circular: Estado Actual del Flujo
  const estadoSegments: PieSegment[] = useMemo(() => {
    const counts = {
      nueva: 0,
      proceso: 0,
      ajustes: 0,
      finalizada: 0,
      rechazada: 0
    };

    dataAnalitica.forEach((s) => {
      const est = String(s.estado || '').toLowerCase();
      if (est.includes('proceso') || est.includes('iniciad')) {
        counts.proceso++;
      } else if (est.includes('ajuste')) {
        counts.ajustes++;
      } else if (est.includes('finaliz') || est.includes('cerrad')) {
        counts.finalizada++;
      } else if (est.includes('rechazad')) {
        counts.rechazada++;
      } else {
        counts.nueva++;
      }
    });

    return [
      {
        label: 'Pendiente / Nueva',
        value: counts.nueva,
        color: '#94A3B8',
        sublabel: 'En espera de brief/asignación'
      },
      {
        label: 'En Proceso',
        value: counts.proceso,
        color: '#3B82F6',
        sublabel: 'En mesa de trabajo'
      },
      {
        label: 'En Ajustes',
        value: counts.ajustes,
        color: '#F59E0B',
        sublabel: 'Ronda de feedback'
      },
      {
        label: 'Finalizada',
        value: counts.finalizada,
        color: '#10B981',
        sublabel: 'Aprobada y entregada'
      },
      {
        label: 'Rechazada',
        value: counts.rechazada,
        color: '#EF4444',
        sublabel: 'Brief no conforme'
      }
    ];
  }, [dataAnalitica]);

  // 3. Gráfico Circular: Distribución por Marca de Moda
  const marcasSegments: PieSegment[] = useMemo(() => {
    const colors: Record<string, string> = {
      'Lili Pink': '#EC4899',
      'Lili Pink Beauty & Wellness': '#F472B6',
      'Yoi': '#F59E0B',
      'Fast Moda': '#6366F1',
      'Yahad': '#10B981'
    };

    return MARCAS.map((marca) => {
      const count = dataAnalitica.filter((s) => s.marca === marca).length;
      return {
        label: marca,
        value: count,
        color: colors[marca] || '#8B5CF6'
      };
    }).filter((seg) => seg.value > 0);
  }, [dataAnalitica]);

  // 4. Gráfico Circular: Prioridad SLA
  const prioridadSegments: PieSegment[] = useMemo(() => {
    const p1 = dataAnalitica.filter((s) => s.prioridad?.includes('P1')).length;
    const p2 = dataAnalitica.filter((s) => s.prioridad?.includes('P2')).length;
    const p3 = dataAnalitica.filter((s) => s.prioridad?.includes('P3')).length;
    const p4 = dataAnalitica.filter((s) => s.prioridad?.includes('P4')).length;

    return [
      { label: 'P1 - Urgente', value: p1, color: '#EF4444', sublabel: '24 a 48 horas' },
      { label: 'P2 - Alta', value: p2, color: '#F97316', sublabel: '3 a 4 días' },
      { label: 'P3 - Normal', value: p3, color: '#3B82F6', sublabel: '5 días hábiles' },
      { label: 'P4 - Planificada', value: p4, color: '#8B5CF6', sublabel: '> 7 días' }
    ];
  }, [dataAnalitica]);

  // Top Piezas más solicitadas
  const topPiezas = useMemo(() => {
    const freq: Record<string, number> = {};
    dataAnalitica.forEach((s) => {
      const p = s.pieza || 'Pieza General';
      freq[p] = (freq[p] || 0) + parseCantSegura(s.cantidad);
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [dataAnalitica]);

  // Performance stats by designer
  const statsDis = useMemo(() => {
    const stats: Record<
      string,
      {
        solicitudes: number;
        piezasTotales: number;
        finalizadas: number;
        enProceso: number;
        ajustes: number;
        mesa: string;
      }
    > = {};

    const mesasAProcesar = mesaSel === 'TODAS' ? MESAS : [mesaSel as MesaType];
    mesasAProcesar.forEach((m) => {
      const listaDis = disenadoresPorMesa[m] || [];
      listaDis.forEach((d) => {
        if (!stats[d]) {
          stats[d] = {
            solicitudes: 0,
            piezasTotales: 0,
            finalizadas: 0,
            enProceso: 0,
            ajustes: 0,
            mesa: m
          };
        }
      });
    });

    dataAnalitica.forEach((s) => {
      let dis = String(s.responsable || 'Sin Asignar').trim();
      if (
        ['finalizada', 'nueva', 'en proceso', 'ajustes', 'rechazada'].includes(
          dis.toLowerCase()
        )
      ) {
        dis = 'Sin Asignar';
      }

      if (!stats[dis]) {
        stats[dis] = {
          solicitudes: 0,
          piezasTotales: 0,
          finalizadas: 0,
          enProceso: 0,
          ajustes: 0,
          mesa: s.mesa || '-'
        };
      }

      const c = parseCantSegura(s.cantidad);
      stats[dis].solicitudes++;
      stats[dis].piezasTotales += c;

      const est = String(s.estado || '').toLowerCase();
      if (esFinalizadaORechazada(est) && !est.includes('rechazad')) {
        stats[dis].finalizadas += c;
      } else if (!esFinalizadaORechazada(est)) {
        stats[dis].enProceso += c;
      }
      if (Number(s.ajustesCantidad || 0) > 0 || est.includes('ajuste')) {
        stats[dis].ajustes += 1;
      }
    });

    return stats;
  }, [dataAnalitica, mesaSel, disenadoresPorMesa]);

  // Designer rankings sorted by output
  const topDisenadores = useMemo(() => {
    return Object.entries(statsDis)
      .sort((a, b) => b[1].finalizadas - a[1].finalizadas || b[1].enProceso - a[1].enProceso);
  }, [statsDis]);

  // Recent deliverables feed
  const entregasRecientes = useMemo(() => {
    return dataAnalitica
      .filter((s) => s.fechaCierre && s.estado === 'Finalizada')
      .sort((a, b) => (b.fechaCierre || '').localeCompare(a.fechaCierre || ''))
      .slice(0, 5);
  }, [dataAnalitica]);

  // Avatar initial generator
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarGradient = (idx: number) => {
    const gradients = [
      'from-blue-600 to-indigo-600',
      'from-rose-500 to-fuchsia-600',
      'from-cyan-500 to-teal-600',
      'from-purple-600 to-pink-600',
      'from-amber-500 to-orange-600'
    ];
    return gradients[idx % gradients.length];
  };

  return (
    <section className="max-w-7xl mx-auto my-6 px-4 space-y-7 antialiased">
      {/* 1. Hero Creative Design Hub Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl">
        {/* Ambient Creative Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-300 text-xs font-bold mb-3 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Estudio Creativo & SLA 2026 · Fast Moda</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-display">
              Tablero de Rendimiento Creativo
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Monitoreo en tiempo real de producción gráfica, tiempos de respuesta SLA y
              distribución por mesas de diseño para Lili Pink, Yoi, Fast Moda, Studio F y Yahad.
            </p>
          </div>

          {/* Quick Studio Health Gauge */}
          <div className="flex items-center gap-4 bg-slate-950/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl shrink-0">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#1E293B"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke={slaCompliance >= 90 ? '#10B981' : '#F59E0B'}
                  strokeWidth="6"
                  strokeDasharray={`${(slaCompliance / 100) * 163.36} 163.36`}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-sm font-black text-white font-mono tabular-nums">
                {slaCompliance}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Cumplimiento SLA
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    slaCompliance >= 90 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                />
                <span>{slaCompliance >= 90 ? 'Rango Óptimo' : 'Bajo Observación'}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                {onTimeCount} de {finalizadas.length} a tiempo
              </span>
            </div>
          </div>
        </div>

        {/* Studio Filter & Export Controls */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 font-medium">Mes:</span>
              <select
                value={mesSel}
                onChange={(e) => setMesSel(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer pr-1"
              >
                <option value="TODOS" className="bg-slate-900 text-white">Todos los Meses</option>
                {MESES.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400 font-medium">Mesa:</span>
              <select
                value={mesaSel}
                onChange={(e) => setMesaSel(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer pr-1"
              >
                <option value="TODAS" className="bg-slate-900 text-white">Todas las Mesas</option>
                {MESAS.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {(mesSel !== MESES[mesActualIndex] || mesaSel !== 'TODAS') && (
              <button
                onClick={() => {
                  setMesSel(MESES[mesActualIndex]);
                  setMesaSel('TODAS');
                }}
                className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-white transition font-semibold px-2.5 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer Filtros</span>
              </button>
            )}
          </div>

          {/* CSV Export Button Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportarVista}
              title="Descargar archivo CSV con las solicitudes filtradas actualmente"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer border border-indigo-400/30 group"
            >
              <Download className="w-3.5 h-3.5 text-indigo-200 group-hover:scale-110 transition-transform" />
              <span>Exportar Selección CSV</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
                {dataAnalitica.length}
              </span>
            </button>

            <button
              onClick={handleExportarTodo}
              title="Descargar copia de seguridad completa de todas las solicitudes SLA 2026 en CSV"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-700/80"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Todo ({solicitudes.length})</span>
            </button>
          </div>
        </div>

        {/* Export Notification Banner */}
        {exportNotice && (
          <div className="relative z-10 mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-fade-in shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{exportNotice}</span>
            </div>
            <span className="text-[11px] text-emerald-400/80 font-mono">UTF-8 / Excel Ready</span>
          </div>
        )}
      </div>

      {/* 2. MESAS CREATIVAS CON ICONOS GENERADOS & ESTILO ESTUDIO */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 font-display">
              Mesas de Especialidad Creativa
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Haz clic en una mesa para aislar sus métricas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {MESAS.map((m) => {
            const cfg = MESA_CONFIGS[m];
            const mesaTasks = dataAnalitica.filter((s) => s.mesa === m);
            const abiertasMesa = mesaTasks.filter((s) => !esFinalizadaORechazada(s.estado)).length;
            const cerradasMesa = mesaTasks.filter((s) => s.estado === 'Finalizada').length;
            const isSelected = mesaSel === m;

            return (
              <button
                key={m}
                type="button"
                onClick={() => setMesaSel(isSelected ? 'TODAS' : m)}
                className={`relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-700 shadow-xl ring-2 ring-indigo-500'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                {/* Glow accent */}
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35"
                  style={{ backgroundColor: cfg.colorHex }}
                />

                <div className="flex items-start justify-between mb-3 relative z-10">
                  {/* Generated Custom SVG Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md bg-gradient-to-br ${cfg.gradientClass} transition-transform group-hover:scale-105`}
                  >
                    <MesaCustomIcon mesa={m} size="md" />
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full tabular-nums ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {mesaTasks.length} sol.
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className={`font-extrabold text-sm tracking-tight ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {cfg.name}
                    </h3>
                    <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 opacity-70">
                      {cfg.shortCode}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {cfg.tagline}
                  </p>
                </div>

                {/* Status footer for each mesa */}
                <div
                  className={`mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs font-semibold relative z-10 ${
                    isSelected ? 'border-slate-800' : 'border-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1 text-[11px] text-amber-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{abiertasMesa} activas</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{cerradasMesa} listas</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 5 KPI METRICS RIBBON (ESTUDIO MODERNO) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Solicitudes
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono tabular-nums">
            {totalSolicitudes}
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">tickets radicados</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Piezas Solicitadas
          </p>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1 font-mono tabular-nums">
            {totalPiezas}
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">volumen total</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Piezas Entregadas
          </p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 font-mono tabular-nums">
            {piezasFinalizadas}
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">entregas finalizadas</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            En Producción
          </p>
          <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-1 font-mono tabular-nums">
            {enProceso}
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
            {enAjustes > 0 ? `${enAjustes} en ajustes` : 'en mesa activa'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Ratio de Entrega
          </p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1 font-mono tabular-nums">
            {efectividad}%
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
            iteración {ratioAjustes}%
          </span>
        </div>
      </div>

      {/* 4. SERIE DE GRÁFICOS CIRCULARES CON ICONOS DE MESAS Y BRANDING */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">
              Distribución Gráfica y Proporciones
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Interactúa con los segmentos circulares para inspeccionar datos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Gráfico 1: Por Mesa con Iconos */}
          <PieChartCard
            title="Distribución por Mesa Creativa"
            subtitle="Carga de trabajo por especialidad visual"
            segments={mesaSegments}
            centerLabel="Solicitudes"
            centerValue={totalSolicitudes}
          />

          {/* Gráfico 2: Por Estado Operativo */}
          <PieChartCard
            title="Pipeline & Estado Operativo"
            subtitle="Fase actual en la cadena de diseño"
            segments={estadoSegments}
            centerLabel="Total"
            centerValue={totalSolicitudes}
          />

          {/* Gráfico 3: Por Marca de Moda */}
          <PieChartCard
            title="Volumen por Marca"
            subtitle="Participación para Lili Pink, Yoi, Fast Moda..."
            segments={marcasSegments}
            centerLabel="Marcas"
            centerValue={marcasSegments.length}
          />
        </div>
      </div>

      {/* 5. SECCIÓN INFERIOR: RANKING DE PIEZAS + RENDIMIENTO DISEÑADORES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Piezas Creativas */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">
                Piezas Más Solicitadas
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Volumen</span>
          </div>

          {topPiezas.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No hay registros disponibles.</p>
          ) : (
            <div className="space-y-3.5">
              {topPiezas.map(([pieza, cant], idx) => {
                const maxCant = topPiezas[0][1] || 1;
                const pct = Math.round((cant / maxCant) * 100);
                return (
                  <div key={pieza} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {idx + 1}. {pieza}
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {cant} u.
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vitrina de Entregas Recientes */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">
                Vitrina de Entregas Recientes
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Últimos artes cerrados</span>
          </div>

          {entregasRecientes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No hay solicitudes finalizadas en este mes.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {entregasRecientes.map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MesaBadge mesa={s.mesa} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{s.id}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-semibold text-slate-800 truncate">{s.detallePieza || s.pieza}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {s.marca} · Diseñador: <strong className="text-slate-600">{s.responsable}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                      {s.tiempoTotal || 'Completado'}
                    </span>
                    {s.linkResultado && (
                      <a
                        href={s.linkResultado}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded-md"
                      >
                        <span>Ver Arte</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Tabla de Rendimiento por Diseñador */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">
              Rendimiento y Producción por Diseñador
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {Object.keys(statsDis).length} creativos en roster
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Creativo / Responsable</th>
                <th className="p-3">Mesa Principal</th>
                <th className="p-3 text-center">Tickets</th>
                <th className="p-3 text-center">Cant. Piezas</th>
                <th className="p-3 text-center">Finalizadas</th>
                <th className="p-3 text-center">En Mesa</th>
                <th className="p-3 text-center">Rondas Ajustes</th>
                <th className="p-3 text-center">Efectividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topDisenadores.map(([disName, st], idx) => {
                const ratio =
                  st.piezasTotales > 0
                    ? Math.round((st.finalizadas / st.piezasTotales) * 100)
                    : 0;

                return (
                  <tr key={disName} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${getAvatarGradient(
                            idx
                          )} text-white flex items-center justify-center font-bold text-[10px] shadow-xs`}
                        >
                          {getInitials(disName)}
                        </div>
                        <span>{disName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {MESAS.includes(st.mesa as MesaType) ? (
                        <MesaBadge mesa={st.mesa as MesaType} />
                      ) : (
                        <span className="text-slate-400">{st.mesa}</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-semibold">{st.solicitudes}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-900">
                      {st.piezasTotales}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-600">
                      {st.finalizadas}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-amber-600">
                      {st.enProceso}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-500">
                      {st.ajustes > 0 ? (
                        <span className="text-amber-700 font-semibold">{st.ajustes} r.</span>
                      ) : (
                        <span>0</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          ratio >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : ratio >= 50
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ratio}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
