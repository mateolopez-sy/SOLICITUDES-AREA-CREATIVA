import React, { useState } from 'react';

export interface PieSegment {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
  iconNode?: React.ReactNode;
}

interface PieChartCardProps {
  title: string;
  subtitle?: string;
  segments: PieSegment[];
  centerLabel?: string;
  centerValue?: string | number;
  actionSlot?: React.ReactNode;
}

export const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  subtitle,
  segments,
  centerLabel,
  centerValue,
  actionSlot
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  // Donut geometry constants
  const size = 190;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/90 shadow-xl backdrop-blur-sm flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            {title}
          </h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {actionSlot && <div>{actionSlot}</div>}
      </div>

      {total === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-xs font-medium">
          No hay solicitudes registradas para este filtro.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-1">
          {/* Circular Donut Chart */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90 filter drop-shadow-md"
            >
              {/* Background track circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#1E293B"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Segments */}
              {segments.map((seg, idx) => {
                if (seg.value <= 0) return null;
                const percent = seg.value / total;
                const strokeDasharray = `${percent * circumference} ${circumference}`;
                const strokeDashoffset = -(accumulatedPercent * circumference);
                accumulatedPercent += percent;

                const isHovered = hoveredIndex === idx;

                return (
                  <circle
                    key={seg.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={seg.color}
                    strokeWidth={isHovered ? strokeWidth + 5 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="none"
                    strokeLinecap="butt"
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {hoveredIndex !== null && segments[hoveredIndex] ? (
                <>
                  <span
                    className="text-2xl font-black leading-tight tabular-nums font-mono"
                    style={{ color: segments[hoveredIndex].color }}
                  >
                    {Math.round((segments[hoveredIndex].value / total) * 100)}%
                  </span>
                  <span className="text-[11px] text-white font-bold max-w-[90px] truncate">
                    {segments[hoveredIndex].label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {segments[hoveredIndex].value} sol.
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black text-white leading-tight tabular-nums font-mono">
                    {centerValue ?? total}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {centerLabel ?? 'Total'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="flex-1 w-full space-y-1.5">
            {segments.map((seg, idx) => {
              const percent = total > 0 ? Math.round((seg.value / total) * 100) : 0;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={seg.label}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                    isHovered
                      ? 'bg-slate-800/90 shadow-md ring-1 ring-white/10'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {seg.iconNode ? (
                      <span className="shrink-0">{seg.iconNode}</span>
                    ) : (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: seg.color }}
                      />
                    )}
                    <div className="min-w-0">
                      <span className="text-xs text-slate-200 truncate font-semibold block">
                        {seg.label}
                      </span>
                      {seg.sublabel && (
                        <span className="text-[10px] text-slate-500 block truncate">
                          {seg.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className="text-xs font-bold text-white font-mono tabular-nums">
                      {seg.value}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums w-10 text-right">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
