import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { SolicitudForm } from './components/SolicitudForm';
import { CoordinacionPanel } from './components/CoordinacionPanel';
import { SolicitudesView } from './components/SolicitudesView';
import { DisenadorView } from './components/DisenadorView';
import { MetricasView } from './components/MetricasView';
import { ToastContainer, ToastNotification, ToastType } from './components/ToastContainer';
import { PinModal } from './components/PinModal';
import {
  obtenerSolicitudes,
  esFinalizadaORechazada,
  ID_HOJA,
  NOMBRE_HOJA,
  PIN_COORDINADOR,
  GOOGLE_DRIVE_URL
} from './services/storageService';
import { Solicitud } from './types/solicitud';
import { FileSpreadsheet, Lock, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('nuevaSolicitud');
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => obtenerSolicitudes());
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Refresh helper
  const handleRefreshSolicitudes = () => {
    setSolicitudes(obtenerSolicitudes());
  };

  // Toast notification manager
  const addToast = (
    title: string,
    message: string,
    type: ToastType = 'info',
    ticketId?: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = { id, title, message, type, ticketId };

    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  // When a new request is created
  const handleSolicitudCreada = (newId: string) => {
    handleRefreshSolicitudes();
  };

  // Open coordination view: ALWAYS opens password modal first
  const handleOpenCoord = () => {
    setShowPinModal(true);
  };

  // Switch tabs helper: if switching away from Coordinacion, lock it again
  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'coordinacion') {
      setShowPinModal(true);
    } else {
      setIsPinUnlocked(false);
      setActiveTab(tab);
    }
  };

  // When PIN is successfully verified
  const handlePinSuccess = () => {
    setShowPinModal(false);
    setIsPinUnlocked(true);
    setActiveTab('coordinacion');
    addToast('Acceso Concedido', 'Contraseña verificada. Bienvenido a Coordinación.', 'success');
  };

  const handlePinClose = () => {
    setShowPinModal(false);
  };

  // Count of open requests
  const abiertasCount = solicitudes.filter((s) => !esFinalizadaORechazada(s.estado)).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Visual Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Password Modal (Triggered every time Coordinación is clicked) */}
      <PinModal
        isOpen={showPinModal}
        onSuccess={handlePinSuccess}
        onClose={handlePinClose}
      />

      {/* Encabezado y Barra Drive */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isPinUnlocked={isPinUnlocked}
        onOpenCoord={handleOpenCoord}
        abiertasCount={abiertasCount}
      />

      {/* Contenido Principal por Pestaña */}
      <main className="flex-1">
        {activeTab === 'nuevaSolicitud' && (
          <SolicitudForm
            onSolicitudCreada={handleSolicitudCreada}
            onGoToSolicitudes={() => handleTabChange('solicitudesTab')}
            onNotify={addToast}
          />
        )}

        {activeTab === 'coordinacion' && (
          <CoordinacionPanel
            solicitudes={solicitudes}
            onRefreshSolicitudes={handleRefreshSolicitudes}
            isPinUnlocked={isPinUnlocked}
            setIsPinUnlocked={setIsPinUnlocked}
            onNotify={addToast}
          />
        )}

        {activeTab === 'solicitudesTab' && (
          <SolicitudesView solicitudes={solicitudes} />
        )}

        {activeTab === 'mesas' && (
          <DisenadorView
            solicitudes={solicitudes}
            onRefreshSolicitudes={handleRefreshSolicitudes}
            onNotify={addToast}
          />
        )}

        {activeTab === 'analitica' && (
          <MetricasView solicitudes={solicitudes} onNotify={addToast} />
        )}
      </main>

      {/* Pie de página con acceso a Drive y datos técnicos */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">BD Solicitudes Creativas SLA 2026</span>
            <span className="text-slate-300">|</span>
            <span>Hoja: <code className="font-mono text-slate-700">{NOMBRE_HOJA}</code></span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={GOOGLE_DRIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ver Hoja Google Sheets ({ID_HOJA.slice(0, 10)}...)</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Acceso Restringido</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
