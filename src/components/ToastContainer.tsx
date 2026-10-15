import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  UserCheck,
  RotateCcw,
  Play,
  Check
} from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'assign';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  ticketId?: string;
}

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'assign':
        return <UserCheck className="w-5 h-5 text-indigo-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'assign':
        return 'border-indigo-500/50 bg-slate-900/95 text-indigo-200';
      case 'success':
        return 'border-emerald-500/50 bg-slate-900/95 text-emerald-200';
      case 'warning':
        return 'border-amber-500/50 bg-slate-900/95 text-amber-200';
      case 'error':
        return 'border-rose-500/50 bg-slate-900/95 text-rose-200';
      case 'info':
      default:
        return 'border-blue-500/50 bg-slate-900/95 text-blue-200';
    }
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl p-3.5 shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 flex items-start justify-between gap-3 ${getBorderColor(
            toast.type
          )}`}
          style={{ animation: 'slideInRight 0.25s ease-out' }}
        >
          <div className="flex items-start gap-3">
            <div className="pt-0.5">{getIcon(toast.type)}</div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white tracking-tight">
                  {toast.title}
                </h4>
                {toast.ticketId && (
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                    #{toast.ticketId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition"
            title="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
