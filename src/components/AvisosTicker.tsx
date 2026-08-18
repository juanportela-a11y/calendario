import React from 'react';
import { ShieldAlert, Droplet, Zap, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Aviso } from '../types';

interface AvisosTickerProps {
  notices: Aviso[];
  onViewAll: () => void;
}

export const AvisosTicker: React.FC<AvisosTickerProps> = ({ notices, onViewAll }) => {
  const urgentNotices = notices.filter(n => n.urgente);
  const [closed, setClosed] = React.useState(false);

  if (urgentNotices.length === 0 || closed) return null;

  const currentNotice = urgentNotices[0];

  const getNoticeIcon = (tipo: string) => {
    switch (tipo) {
      case 'corte_agua':
        return <Droplet className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />;
      case 'corte_luz':
        return <Zap className="w-4 h-4 text-amber-700 dark:text-amber-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-700 dark:text-red-400" />;
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-2xl p-4 shadow-sm mb-8 flex items-center justify-between gap-4 border-y border-r border-amber-200 dark:border-amber-900/60">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl flex-shrink-0">
          {getNoticeIcon(currentNotice.tipo)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
              AVISO URGENTE
            </span>
            <span className="text-xs text-amber-900 dark:text-amber-200 font-semibold">
              Sector: {currentNotice.sector_afectado}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {currentNotice.titulo}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
            {currentNotice.descripcion}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onViewAll}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
        >
          <span>Ver todos ({notices.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setClosed(true)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50"
          title="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
