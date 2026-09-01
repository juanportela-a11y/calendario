import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  Bell, 
  PhoneCall, 
  FileText,
  Activity,
  Compass,
  Waves,
  ShieldCheck
} from 'lucide-react';

interface HeroBannerProps {
  onExploreEvents: () => void;
  onExploreNotices: () => void;
  onExploreOperations?: () => void;
  onExploreTurismo?: () => void;
  onOpenEmergencies?: () => void;
  onOpenAssistant?: () => void;
  onOpenServicesGuide?: () => void;
  totalEventsCount: number;
  totalNoticesCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreEvents,
  onExploreNotices,
  onExploreOperations,
  onExploreTurismo,
  onOpenEmergencies,
  onOpenAssistant,
  onOpenServicesGuide,
  totalEventsCount,
  totalNoticesCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2559] via-[#0D47A1] to-[#1A237E] text-white shadow-xl border border-blue-400/30">
      
      {/* Decorative Magdalena River flow and subtle gradient orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-6xl space-y-6">
        
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold border border-white/20 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Purificación, Tolima &bull; Villa de las Palmas</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Plataforma Cívica Activa</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenEmergencies && (
              <button
                onClick={onOpenEmergencies}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-sm border border-red-400/40 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-white animate-bounce" />
                <span>Emergencias 123</span>
              </button>
            )}

            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-950/80 hover:bg-indigo-900 text-cyan-200 text-xs font-semibold transition-all border border-cyan-400/40 hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Asistente Cívico IA</span>
              </button>
            )}
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-3xl space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Purifi<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-200">Calendario</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
            Portal oficial municipal de agenda cultural, eventos deportivos, estado del Río Magdalena, cortes de servicios públicos y participación ciudadana para Purificación, Tolima.
          </p>
        </div>

        {/* Action Controls Button Matrix */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {onExploreOperations && (
            <button
              onClick={onExploreOperations}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Centro de Control Operativo</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            </button>
          )}

          <button
            onClick={onExploreEvents}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-98 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Ver Calendario ({totalEventsCount})</span>
          </button>

          <button
            onClick={onExploreNotices}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-98 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Avisos de Servicios ({totalNoticesCount})</span>
          </button>

          {onOpenServicesGuide && (
            <button
              onClick={onOpenServicesGuide}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm border border-emerald-400/40 backdrop-blur-md transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>Rutas de Aseo & Trámites</span>
            </button>
          )}

          {onExploreTurismo && (
            <button
              onClick={onExploreTurismo}
              className="px-4 py-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs sm:text-sm border border-purple-400/40 backdrop-blur-md transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-purple-200 shrink-0" />
              <span>Turismo & Comercio</span>
            </button>
          )}
        </div>

        {/* Footer Real-Time Micro-Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/15 text-xs text-blue-100">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 shadow-xs" />
            <span className="font-semibold text-[11px] truncate">Cultura & Tradición Tolimense</span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-xs" />
            <span className="font-semibold text-[11px] truncate">Salud & Zoonosis Comunitaria</span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
            <Waves className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="font-semibold text-[11px] truncate">Monitoreo Río Magdalena</span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="font-semibold text-[11px] truncate">EMPUR E.S.P. & CELSIA</span>
          </div>
        </div>

      </div>
    </div>
  );
};

