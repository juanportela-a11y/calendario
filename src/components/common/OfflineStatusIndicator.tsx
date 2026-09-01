import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Database, AlertTriangle, ShieldCheck } from 'lucide-react';
import { OfflineStorageManager, STORAGE_KEYS } from '../../utils/offlineStorage';

interface OfflineStatusIndicatorProps {
  onSyncOfflineData?: () => Promise<void>;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({ onSyncOfflineData }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const updateQueueCount = () => {
    const queue = OfflineStorageManager.getQueue();
    setOfflineQueueCount(queue.length);
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (lastSync) {
      setLastSyncTime(new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  useEffect(() => {
    updateQueueCount();

    const handleOnline = () => {
      setIsOnline(true);
      if (onSyncOfflineData) {
        setIsSyncing(true);
        onSyncOfflineData().finally(() => {
          setIsSyncing(false);
          updateQueueCount();
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(updateQueueCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [onSyncOfflineData]);

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('Sin conexión a Internet. Las acciones están guardadas localmente y se sincronizarán en cuanto vuelva la señal.');
      return;
    }
    setIsSyncing(true);
    if (onSyncOfflineData) {
      await onSyncOfflineData();
    }
    setIsSyncing(false);
    updateQueueCount();
  };

  if (isOnline && offlineQueueCount === 0 && !showDetails) {
    return null;
  }

  return (
    <div className="w-full bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5 transition-all text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {!isOnline ? (
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <WifiOff className="w-4 h-4" />
              <span>Modo Offline Activo: Visualizando reportes y avisos en caché local</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Conectado &bull; Datos municipales sincronizados</span>
            </div>
          )}

          {lastSyncTime && (
            <span className="hidden md:inline text-slate-400 text-[11px]">
              (Última sincronización: {lastSyncTime})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {offlineQueueCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/40 text-[11px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{offlineQueueCount} reporte(s) guardados para enviar</span>
            </div>
          )}

          {isOnline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-slate-400 hover:text-white text-[11px] underline cursor-pointer"
          >
            {showDetails ? 'Ocultar' : 'Detalles de Caché'}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Almacenamiento: LocalStorage + Memoria de Red</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Persistencia: Avisos, Vías, Cortes y Jornadas disponibles 100% offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Cola pendiente: {offlineQueueCount} acciones cívicas</span>
          </div>
        </div>
      )}
    </div>
  );
};
