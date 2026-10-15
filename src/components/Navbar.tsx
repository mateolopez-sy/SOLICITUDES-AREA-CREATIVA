import React from 'react';
import {
  Palette,
  PlusCircle,
  Lock,
  ListFilter,
  UserCheck,
  LineChart,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { GOOGLE_DRIVE_URL } from '../services/storageService';

export type ActiveTab = 'nuevaSolicitud' | 'coordinacion' | 'solicitudesTab' | 'mesas' | 'analitica';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isPinUnlocked: boolean;
  onOpenCoord: () => void;
  abiertasCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isPinUnlocked,
  onOpenCoord,
  abiertasCount
}) => {
  return (
    <>
      {/* Top Header */}
      <header className="bg-slate-950 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 pt-3 pb-1 flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 mb-2 md:mb-0 cursor-pointer group"
            onClick={() => setActiveTab('nuevaSolicitud')}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 via-blue-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base leading-tight text-white tracking-tight font-display">
                  BD Solicitudes Diseño
                </h1>
                <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SLA 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Estudio Creativo · Fast Moda, Lili Pink, Yoi & Yahad
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('nuevaSolicitud')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'nuevaSolicitud'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Nueva Solicitud</span>
            </button>

            <button
              onClick={onOpenCoord}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'coordinacion'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Coordinación</span>
            </button>

            <button
              onClick={() => setActiveTab('solicitudesTab')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'solicitudesTab'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ListFilter className="w-4 h-4 text-indigo-400" />
              <span>Solicitudes</span>
            </button>

            <button
              onClick={() => setActiveTab('mesas')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mesas'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Diseñadores</span>
            </button>

            <button
              onClick={() => setActiveTab('analitica')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'analitica'
                  ? 'bg-fuchsia-600 text-white font-bold shadow-md shadow-fuchsia-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <LineChart className="w-4 h-4 text-fuchsia-400" />
              <span>Analítica</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Barra Google Drive */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-800">BD solicitudes diseño</span>
            <span className="text-slate-300">|</span>
            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
              {abiertasCount} Abiertas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={GOOGLE_DRIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Abrir Base de Datos (Google Drive)</span>
              <ArrowUpRight className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
