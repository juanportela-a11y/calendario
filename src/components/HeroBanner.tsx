import React from 'react';
import { Calendar, Search, MapPin, Sparkles, ChevronRight, BellRing } from 'lucide-react';

interface HeroBannerProps {
  onExploreEvents: () => void;
  onExploreNotices: () => void;
  onExploreOperations?: () => void;
  totalEventsCount: number;
  totalNoticesCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreEvents,
  onExploreNotices,
  onExploreOperations,
  totalEventsCount,
  totalNoticesCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#2196F3] text-white shadow-xl mb-8 border border-blue-300/40">
      {/* Decorative Background Elements & Palm Patterns */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      
      {/* Subtle Magdalena River wave overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold mb-4 border border-white/20">
          <MapPin className="w-3.5 h-3.5 text-[#64B5F6]" />
          <span>Municipio de Purificación &bull; Tolima</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white mb-4">
          Purifi<span className="text-[#64B5F6]">Calendario</span>
        </h1>

        <p className="text-base sm:text-lg text-blue-100 font-normal max-w-2xl mb-8 leading-relaxed">
          Toda la agenda de eventos culturales, deportivos, jornadas de salud pública, avisos de cortes programados de agua y luz en un solo lugar fácil de consultar para la comunidad de Purificación.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {onExploreOperations && (
            <button
              onClick={onExploreOperations}
              className="px-5 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
            >
              <span>🚧 Centro de Control Operativo</span>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </button>
          )}

          <button
            onClick={onExploreEvents}
            className="px-5 py-3.5 rounded-xl bg-white text-[#0D47A1] font-bold text-sm shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 transform active:scale-95"
          >
            <Calendar className="w-4 h-4 text-[#2196F3]" />
            <span>Calendario ({totalEventsCount})</span>
          </button>

          <button
            onClick={onExploreNotices}
            className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/30 backdrop-blur-md transition-all flex items-center gap-2"
          >
            <BellRing className="w-4 h-4 text-amber-300" />
            <span>Avisos ({totalNoticesCount})</span>
          </button>
        </div>

        {/* Key Municipal Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-8 border-t border-white/15 text-xs text-blue-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Cultura & Folclor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Salud & Vacunación</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Esterilización Animal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Avisos Agua/Luz</span>
          </div>
        </div>
      </div>
    </div>
  );
};
