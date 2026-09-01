import React, { useState } from 'react';
import { 
  Droplets, 
  Waves, 
  Sun, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Info, 
  MapPin, 
  Compass, 
  RefreshCw,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RIO_MAGDALENA_STATUS } from '../../data/municipalServicesData';
import { shareViaWhatsApp } from '../../utils/notificationUtils';

interface HydroWeatherMonitorProps {
  onOpenEmergencyDirectory?: () => void;
}

export const HydroWeatherMonitor: React.FC<HydroWeatherMonitorProps> = ({
  onOpenEmergencyDirectory
}) => {
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const status = RIO_MAGDALENA_STATUS;
  const percentage = Math.min(100, Math.round((status.nivelActualMetros / status.nivelAlertaRoja) * 100));

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const handleShareRiverReport = () => {
    shareViaWhatsApp(
      `MONITOR HIDROLÓGICO DEL RÍO MAGDALENA - PURIFICACIÓN`,
      `🌊 Nivel Actual: ${status.nivelActualMetros}m\n⚠️ Estado: ${status.estado.toUpperCase()}\n📈 Tendencia: ${status.tendencia}\n📍 Estación: ${status.estacion}\nℹ️ Sectores en monitoreo: ${status.sectoresRiesgo.join(', ')}`,
      'Purificación, Tolima'
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Monitor Hidrometeorológico & Nivel del Río Magdalena
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                IDEAM • CORTOLIMA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vigilancia hidrológica, alertas tempranas y clima en tiempo real para la Villa de las Palmas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            title="Actualizar datos"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={handleShareRiverReport}
            title="Compartir reporte por WhatsApp"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>
        </div>
      </div>

      {/* Weather & Climate Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Temp */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">32°C</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Sensación: 35°C</p>
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3.5 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">8 (Muy Alto)</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Protección Solar</p>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">68%</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Humedad Valle</p>
          </div>
        </div>

        {/* Rain Probability */}
        <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">15%</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Viento: 11 km/h NE</p>
          </div>
        </div>
      </div>

      {/* River Magdalena Level Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 text-white shadow-lg border border-cyan-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-cyan-400" />
              <h4 className="font-black text-base tracking-wide text-white">Nivel del Río Magdalena en Purificación</h4>
            </div>
            <p className="text-xs text-cyan-200/80">{status.estacion} &bull; {status.ultimaActualizacion}</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Nivel Normal ({status.nivelActualMetros}m)</span>
            </span>
          </div>
        </div>

        {/* Dynamic Water Gauge Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-200">
            <span>Cota de Sequía (2.0m)</span>
            <span className="text-amber-300">Alerta Amarilla (5.5m)</span>
            <span className="text-orange-400">Alerta Naranja (6.8m)</span>
            <span className="text-red-400">Desbordamiento (7.5m)</span>
          </div>

          <div className="w-full h-5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 transition-all duration-700 relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-950 px-1 bg-white/80 rounded">
                {status.nivelActualMetros}m
              </div>
            </div>
          </div>
        </div>

        {/* Sectors and Recommendations Accordion */}
        <div className="pt-2 border-t border-cyan-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-cyan-300">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Tendencia: <strong className="text-white capitalize">{status.tendencia}</strong> &bull; Monitoreo 24/7 activo</span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-cyan-300 hover:text-cyan-100 flex items-center gap-1 transition-colors"
          >
            <span>{expanded ? 'Ocultar sectores' : 'Ver sectores ribereños'}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <div className="pt-3 border-t border-cyan-900/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
            <div className="space-y-1.5 bg-slate-900/60 p-3.5 rounded-2xl border border-cyan-900/30">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Sectores en Observación Permanente:</span>
              </p>
              <ul className="list-disc list-inside text-cyan-100 space-y-1 text-[11px]">
                {status.sectoresRiesgo.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 bg-slate-900/60 p-3.5 rounded-2xl border border-cyan-900/30">
              <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Recomendaciones Oficiales de Gestión del Riesgo:</span>
              </p>
              <ul className="list-disc list-inside text-cyan-100 space-y-1 text-[11px]">
                {status.recomendaciones.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
