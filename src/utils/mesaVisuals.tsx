import React from 'react';
import { MesaType } from '../types/solicitud';

export interface MesaConfig {
  name: MesaType;
  label: string;
  shortCode: string;
  tagline: string;
  description: string;
  colorHex: string;
  gradientClass: string;
  bgGlow: string;
  borderClass: string;
  textClass: string;
  softBg: string;
  badgeBg: string;
  badgeBorder: string;
  softwareUsed: string[];
}

export const MESA_CONFIGS: Record<MesaType, MesaConfig> = {
  Visual: {
    name: 'Visual',
    label: 'Mesa Visual',
    shortCode: 'VM',
    tagline: 'Vitrinismo, POP & Retail Design',
    description: 'Diseño de experiencias en tienda, exhibiciones comerciales, señalética y vitrinas de alto impacto.',
    colorHex: '#3B82F6',
    gradientClass: 'from-blue-600 via-indigo-600 to-sky-500',
    bgGlow: 'rgba(59, 130, 246, 0.25)',
    borderClass: 'border-blue-500/30',
    textClass: 'text-blue-400',
    softBg: 'bg-blue-500/10',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-500/30',
    softwareUsed: ['Photoshop', 'Illustrator', '3ds Max', 'SketchUp']
  },
  Packaging: {
    name: 'Packaging',
    label: 'Mesa Packaging',
    shortCode: 'PKG',
    tagline: 'Empaques, Troqueles & Dielines',
    description: 'Ingeniería gráfica de empaques, cajas, bolsas de lujo, etiquetas termoencogibles y guías de corte.',
    colorHex: '#06B6D4',
    gradientClass: 'from-cyan-500 via-teal-500 to-emerald-400',
    bgGlow: 'rgba(6, 182, 212, 0.25)',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-400',
    softBg: 'bg-cyan-500/10',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/30',
    softwareUsed: ['Illustrator', 'Esko Studio', 'Cinema 4D', 'InDesign']
  },
  Pauta: {
    name: 'Pauta',
    label: 'Mesa Pauta',
    shortCode: 'ADS',
    tagline: 'Performance, Reels & Paid Media',
    description: 'Campañas de alto rendimiento para Meta Ads, TikTok Spark Ads, Google Display y piezas de conversión.',
    colorHex: '#F43F5E',
    gradientClass: 'from-rose-500 via-pink-600 to-fuchsia-500',
    bgGlow: 'rgba(244, 63, 94, 0.25)',
    borderClass: 'border-rose-500/30',
    textClass: 'text-rose-400',
    softBg: 'bg-rose-500/10',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-500/30',
    softwareUsed: ['After Effects', 'Premiere', 'Photoshop', 'Figma']
  },
  Digital: {
    name: 'Digital',
    label: 'Mesa Digital',
    shortCode: 'DIG',
    tagline: 'UI/UX, E-Commerce & Web Assets',
    description: 'Banners web para tiendas online, interfaces de usuario, newsletters, lookbooks interactivos y landing pages.',
    colorHex: '#8B5CF6',
    gradientClass: 'from-violet-600 via-purple-600 to-indigo-500',
    bgGlow: 'rgba(139, 92, 246, 0.25)',
    borderClass: 'border-purple-500/30',
    textClass: 'text-purple-400',
    softBg: 'bg-purple-500/10',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/30',
    softwareUsed: ['Figma', 'Photoshop', 'Illustrator', 'Animate']
  },
  Producción: {
    name: 'Producción',
    label: 'Mesa Producción',
    shortCode: 'PRD',
    tagline: 'Preprensa, Gran Formato & Retoque',
    description: 'Retoque fotográfico digital pro, separación de color CMYK, pruebas de impresión y artes finales para fábrica.',
    colorHex: '#F59E0B',
    gradientClass: 'from-amber-500 via-orange-500 to-yellow-400',
    bgGlow: 'rgba(245, 158, 11, 0.25)',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
    softBg: 'bg-amber-500/10',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    softwareUsed: ['Photoshop Pro', 'InDesign', 'Acrobat Pro', 'Capture One']
  }
};

/**
 * Custom high-resolution vector SVG icons for the Design Studio Mesas
 */
export const MesaCustomIcon: React.FC<{
  mesa: MesaType;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ mesa, className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10'
  };

  const currentSize = sizeMap[size];

  switch (mesa) {
    case 'Visual':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${currentSize} ${className}`}
        >
          {/* Eye with retail perspective frame and shine */}
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 9v1m2 2h1" strokeWidth="2" />
          {/* Showcase corner guides */}
          <path d="M5 4h-2v2M21 4h-2v2M5 20h-2v-2M21 20h-2v-2" strokeWidth="1.2" opacity="0.7" />
        </svg>
      );

    case 'Packaging':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${currentSize} ${className}`}
        >
          {/* 3D isometric box with flap folds & dieline crease */}
          <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.29 7 12 12.5 20.71 7" />
          <line x1="12" y1="22.5" x2="12" y2="12.5" />
          {/* Cutter scissor notch indicator */}
          <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
      );

    case 'Pauta':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${currentSize} ${className}`}
        >
          {/* Dynamic broadcast loudspeaker + sound spark energy */}
          <path d="m3 11 18-5v12L3 13v-2z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          <path d="M7 12V8" strokeWidth="2" />
          {/* Energy spark rings for ads */}
          <path d="M18 4l2-2M21 12h2M18 20l2 2" strokeWidth="1.8" />
        </svg>
      );

    case 'Digital':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${currentSize} ${className}`}
        >
          {/* Dual screen desktop + mobile + UX bezier curve */}
          <rect width="18" height="12" x="3" y="3" rx="2" />
          <path d="M8 21h8M12 17v4" />
          {/* Pen tool / interactive cursor inside */}
          <path d="m9 9 6 3-3 1-1 3-2-7z" fill="currentColor" fillOpacity="0.3" />
        </svg>
      );

    case 'Producción':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${currentSize} ${className}`}
        >
          {/* Print registration mark / CMYK target / optical lens */}
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="1" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="1" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="23" y2="12" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${currentSize} ${className}`}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m12 8 4 4-4 4M8 12h8" />
        </svg>
      );
  }
};

/**
 * Compact clean badge for tables, lists, and headers
 */
export const MesaBadge: React.FC<{
  mesa: MesaType;
  showTagline?: boolean;
  size?: 'sm' | 'md';
}> = ({ mesa, showTagline = false, size = 'sm' }) => {
  const cfg = MESA_CONFIGS[mesa] || MESA_CONFIGS.Visual;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold tracking-wide border transition-all ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${cfg.badgeBg} ${cfg.textClass} ${cfg.badgeBorder}`}
      style={{
        boxShadow: `0 1px 6px ${cfg.bgGlow}`
      }}
    >
      <MesaCustomIcon mesa={mesa} size="sm" className="shrink-0" />
      <span className="font-bold">{cfg.name}</span>
      {showTagline && (
        <span className="hidden sm:inline opacity-70 font-normal">· {cfg.tagline}</span>
      )}
    </span>
  );
};

/**
 * Rich Studio Card Emblem with gradients and design studio tools
 */
export const MesaEmblemCard: React.FC<{
  mesa: MesaType;
  active?: boolean;
  onClick?: () => void;
  count?: number;
}> = ({ mesa, active = false, onClick, count }) => {
  const cfg = MESA_CONFIGS[mesa] || MESA_CONFIGS.Visual;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative text-left w-full p-4 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        active
          ? 'bg-slate-900 border-white/20 shadow-xl ring-2 ring-blue-500/50'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-lg'
      }`}
    >
      {/* Ambient gradient blur behind icon */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35"
        style={{ background: cfg.colorHex }}
      />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Custom Icon Box */}
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br ${cfg.gradientClass} text-white transition-transform group-hover:scale-105`}
          >
            <MesaCustomIcon mesa={mesa} size="md" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-white group-hover:text-blue-300 transition-colors">
                {cfg.label}
              </h4>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                {cfg.shortCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium line-clamp-1">
              {cfg.tagline}
            </p>
          </div>
        </div>

        {typeof count === 'number' && (
          <div className="text-right shrink-0">
            <span className="text-lg font-black font-mono text-white tabular-nums">
              {count}
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">
              Solicitudes
            </span>
          </div>
        )}
      </div>

      {/* Software tools chip list */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap relative z-10">
        {cfg.softwareUsed.map((tool) => (
          <span
            key={tool}
            className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/60"
          >
            {tool}
          </span>
        ))}
      </div>
    </button>
  );
};
