import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  Bell, 
  PhoneCall, 
  ShieldAlert, 
  FileText,
  Activity,
  Layers,
  Award
} from 'lucide-react';

interface HeroBannerProps {
  onExploreEvents: () => void;
  onExploreNotices: () => void;
  onExploreOperations?: () => void;
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
  onOpenEmergencies,
  onOpenAssistant,
  onOpenServicesGuide,
  totalEventsCount,
  totalNoticesCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl mb-8 border border-blue-400/30">
      
      {/* Decorative Magdalena River flow and gradient orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-6xl">
        
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold border border-white/20 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-cyan-300" />
            <span>Purificación, Tolima &bull; Villa de las Palmas</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Plataforma Cívica Activa</span>
          </div>

          {onOpenEmergencies && (
            <button
              onClick={onOpenEmergencies}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-sm border border-red-400/40 hover:scale-105 active:scale-95 cursor-pointer"
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
              <span>Asistente Cívico PurifiGuía</span>
            </button>
          )}
        </div>

        {/* Headline */}
        <div className="max-w-3xl mb-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white mb-3">
            Purifi<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-200">Calendario</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-blue-100 font-normal leading-relaxed">
            Portal oficial de agenda comunitaria, eventos culturales, deportivos, monitoreo del Río Magdalena, avisos de servicios públicos y participación ciudadana para todos los habitantes de Purificación.
          </p>
        </div>

        {/* Action Controls Button Matrix */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onExploreOperations && (
            <button
              onClick={onExploreOperations}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-slate-950" />
              <span>Centro de Control Operativo</span>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </button>
          )}

          <button
            onClick={onExploreEvents}
            className="px-5 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Ver Calendario ({totalEventsCount})</span>
          </button>

          <button
            onClick={onExploreNotices}
            className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span>Avisos de Servicios ({totalNoticesCount})</span>
          </button>

          {onOpenServicesGuide && (
            <button
              onClick={onOpenServicesGuide}
              className="px-4 py-3 rounded-2xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm border border-emerald-400/40 backdrop-blur-md transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span>Rutas de Aseo & Trámites</span>
            </button>
          )}
        </div>

        {/* Footer Statistics & Categories Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/15 text-xs text-blue-100">
          <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl backdrop-blur-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm" />
            <span className="font-semibold">Cultura, Folclor & Tradición</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl backdrop-blur-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
            <span className="font-semibold">Salud Pública & Zoonosis</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl backdrop-blur-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
            <span className="font-semibold">Monitoreo Río Magdalena</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl backdrop-blur-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <span className="font-semibold">Acueducto EMPUR & Energía</span>
          </div>
        </div>

      </div>
    </div>
  );
};
