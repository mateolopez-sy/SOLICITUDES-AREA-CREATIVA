import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Eye, EyeOff, X, ShieldAlert } from 'lucide-react';
import { validarPin } from '../services/storageService';

interface PinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarPin(pin)) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPin('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        {/* Title */}
        <div className="text-center mb-5">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Acceso a Coordinación
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Módulo restringido. Ingresa la contraseña de autorización para continuar.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPin ? 'text' : 'password'}
              maxLength={20}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="Contraseña"
              className={`w-full text-center tracking-widest px-4 py-3 rounded-xl border text-base font-mono outline-none transition ${
                error
                  ? 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-300'
                  : 'border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
              title={showPin ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-semibold text-center flex items-center justify-center gap-1 animate-shake">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Contraseña incorrecta. Acceso denegado.</span>
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
