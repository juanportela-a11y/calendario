import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Droplet, 
  Zap, 
  Users,
  ArrowRight
} from 'lucide-react';
import { Aviso, Usuario } from '../types';

interface UrgentAlertBannerProps {
  notice?: Aviso | null;
  urgentNotice?: Aviso | null;
  currentUser?: Usuario;
  onConfirmRead: (notice: Aviso) => void;
  onViewAll?: () => void;
  totalNoticesCount?: number;
  notifiedCount?: number;
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  notice,
  urgentNotice,
  currentUser,
  onConfirmRead,
  onViewAll,
  totalNoticesCount = 0,
  notifiedCount = 0
}) => {
  const activeNotice = notice || urgentNotice;
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  if (!activeNotice || !activeNotice.urgente || isDismissed) {
    return null;
  }

  const handleConfirm = () => {
    setHasConfirmed(true);
    onConfirmRead(activeNotice);
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'corte_agua':
      case 'agua':
        return <Droplet className="w-5 h-5 text-cyan-200 animate-bounce" />;
      case 'corte_luz':
      case 'energia':
        return <Zap className="w-5 h-5 text-amber-200 animate-pulse" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-200 animate-bounce" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl shadow-lg border border-red-400/40 p-4 mb-6 relative overflow-hidden animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        
        {/* Urgent Message & Icon */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md flex-shrink-0">
            {getIcon(activeNotice.tipo)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white text-red-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                ⚠️ AVISO URGENTE MUNICIPAL
              </span>
              {activeNotice.sector_afectado && (
                <span className="text-xs text-red-100 font-semibold">
                  Sector: <strong>{activeNotice.sector_afectado}</strong>
                </span>
              )}
              {notifiedCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-red-950/50 px-2 py-0.5 rounded-full text-emerald-300 font-bold border border-emerald-400/30">
                  <Users className="w-3 h-3" />
                  <span>{notifiedCount} confirmaron lectura</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
              <strong>{activeNotice.titulo}:</strong> {activeNotice.descripcion}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0 self-end lg:self-center">
          
          {/* Enterado Button */}
          {!hasConfirmed ? (
            <button
              onClick={handleConfirm}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
              title="Confirmar que leíste este aviso municipal y ganar PurifiPuntos"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Enterado (+15 PTS)</span>
            </button>
          ) : (
            <span className="px-3 py-2 rounded-xl bg-emerald-700/90 text-white font-extrabold text-xs flex items-center gap-1.5 border border-emerald-400/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>¡Lectura Confirmada!</span>
            </span>
          )}

          {/* View all notices */}
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1 border border-white/20"
              title="Ver listado completo de avisos"
            >
              <span>Ver todos {totalNoticesCount > 0 ? `(${totalNoticesCount})` : ''}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-all"
            title="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
