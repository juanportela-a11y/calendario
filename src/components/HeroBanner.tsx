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
  ShieldCheck,
  Megaphone,
  ArrowRight,
  Clock,
  Pill,
  Sun
} from 'lucide-react';

interface HeroBannerProps {
  onExploreEvents: () => void;
  onExploreNotices: () => void;
  onExploreOperations?: () => void;
  onExploreTurismo?: () => void;
  onExploreReportar?: () => void;
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
  onExploreReportar,
  onOpenEmergencies,
  onOpenAssistant,
  onOpenServicesGuide,
  totalEventsCount,
  totalNoticesCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#081f4a] via-[#0D47A1] to-[#152e72] text-white shadow-2xl border border-blue-400/25 transition-all duration-300">
      
      {/* Decorative Magdalena River flow and subtle gradient orbs */}
      <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-cyan-400/20 blur-[90px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute -bottom-40 -left-40 w-[26rem] h-[26rem] rounded-full bg-blue-500/25 blur-[80px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/20 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 p-6 sm:p-9 lg:p-12 space-y-8">
        
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-xs font-semibold border border-white/15 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Purificación, Tolima</span>
              <span className="text-white/40">·</span>
              <span className="text-cyan-200">Villa de las Palmas</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-400/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Portal Ciudadano Activo</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEmergencies && (
              <button
                onClick={onOpenEmergencies}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-sm border border-red-400/30 hover:scale-105 active:scale-95 cursor-pointer"
                title="Líneas de emergencia de Purificación (Hospital, Bomberos, Policía)"
              >
                <PhoneCall className="w-3.5 h-3.5 text-white" />
                <span>Líneas 123</span>
              </button>
            )}

            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-cyan-200 text-xs font-bold transition-all border border-cyan-400/30 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md shadow-xs"
                title="Consultas ciudadanas con IA"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>PurifiGuía IA</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Main Grid (Headline & Visual Civic Pulse Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Primary Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-md border border-cyan-500/30 inline-block">
                Agenda Digital &bull; Servicios Públicos &bull; Participación
              </span>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                El pulso vivo de nuestra tierra,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  en tus manos.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-blue-100/90 font-normal leading-relaxed max-w-xl">
                Descubre los eventos culturales y deportivos, reporta fallas de alumbrado o acueducto en tu barrio y mantente al día con los avisos oficiales de Purificación, Tolima.
              </p>
            </div>

            {/* Main Action Buttons (Prioritized Visual Hierarchy) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              
              {/* Primary Star Action: Explorar Agenda */}
              <button
                onClick={onExploreEvents}
                className="px-6 py-3.5 rounded-2xl bg-white text-blue-950 hover:bg-blue-50 font-black text-sm shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
              >
                <Calendar className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span>Explorar Agenda Municipal</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                  {totalEventsCount}
                </span>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform ml-1" />
              </button>

              {/* Secondary Civic Action: Reportar Falla */}
              {onExploreReportar && (
                <button
                  onClick={onExploreReportar}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg hover:shadow-amber-500/20 transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>Reportar Falla</span>
                  <span className="text-[10px] font-black uppercase bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded-md">
                    +30 Pts
                  </span>
                </button>
              )}
            </div>

            {/* Quick Links Navigation Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-blue-200/80 mr-1">Accesos directos:</span>
              
              <button
                onClick={onExploreNotices}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-300" />
                <span>Avisos ({totalNoticesCount})</span>
              </button>

              {onExploreOperations && (
                <button
                  onClick={onExploreOperations}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-200 font-semibold text-xs border border-white/15 backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Centro Operativo</span>
                </button>
              )}

              {onOpenServicesGuide && (
                <button
                  onClick={onOpenServicesGuide}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs border border-white/15 backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Rutas de Aseo</span>
                </button>
              )}

              {onExploreTurismo && (
                <button
                  onClick={onExploreTurismo}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 font-semibold text-xs border border-white/15 backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-purple-300" />
                  <span>Turismo</span>
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Interactive Live Civic Pulse Widget (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 space-y-4 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-200">
                    Hoy en Purificación
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-blue-200 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Tiempo Real</span>
                </div>
              </div>

              {/* Status Row 1: Río Magdalena & Clima */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Río Magdalena</p>
                    <p className="text-[10px] text-cyan-200">Caudal Estable · Sin Riesgo</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Normal
                  </span>
                  <p className="text-[10px] text-blue-200 mt-0.5">28°C Soleado</p>
                </div>
              </div>

              {/* Status Row 2: Farmacia de Turno */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Drogas La Rebaja</p>
                    <p className="text-[10px] text-blue-200">Frente al Parque Candelaria</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-300 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-400/40">
                  Turno 24H
                </span>
              </div>

              {/* Status Row 3: Conectividad y Vías */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Puente Ospina Pérez</p>
                    <p className="text-[10px] text-blue-200">Vía Saldaña - Neiva - Bogotá</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-200 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-400/30">
                  Fluido
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Real-Time Micro-Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10 text-xs text-blue-100">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
            <span className="font-semibold text-[11px] truncate">Cultura & Tradición Tolimense</span>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-semibold text-[11px] truncate">Salud & Zoonosis Comunitaria</span>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
            <Waves className="w-3 h-3 text-cyan-300 shrink-0" />
            <span className="font-semibold text-[11px] truncate">Monitoreo Río Magdalena</span>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
            <ShieldCheck className="w-3 h-3 text-amber-300 shrink-0" />
            <span className="font-semibold text-[11px] truncate">EMPUR E.S.P. & CELSIA</span>
          </div>
        </div>

      </div>
    </div>
  );
};
