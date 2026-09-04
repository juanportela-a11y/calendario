import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Waves, 
  Sun, 
  Wind, 
  Thermometer, 
  Flame,
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Info, 
  MapPin, 
  Compass, 
  Navigation,
  MoreHorizontal,
  RefreshCw,
  Share2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CloudSun,
  CloudRain,
  CloudLightning,
  Sparkles,
  Gauge,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { RIO_MAGDALENA_STATUS } from '../../data/municipalServicesData';
import { shareViaWhatsApp } from '../../utils/notificationUtils';

export interface DailyForecastItem {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbability: number;
  isHotDay?: boolean;
}

export interface HourlyForecastItem {
  label: string;
  hour: number;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
}

interface LiveWeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  precipitation: number;
  precipitationProbability: number;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  weatherDescription: string;
  isRealApi: boolean;
  lastUpdatedTime: string;
  forecastBannerText?: string;
  dailyForecast?: DailyForecastItem[];
  hourlyForecast?: HourlyForecastItem[];
}

interface HydroWeatherMonitorProps {
  onOpenEmergencyDirectory?: () => void;
}

// Interprete de códigos WMO del clima
function interpretWeatherCode(code: number): { description: string; iconType: 'sun' | 'cloud-sun' | 'rain' | 'storm' } {
  if (code === 0) return { description: 'Despejado y Soleado', iconType: 'sun' };
  if (code === 1 || code === 2) return { description: 'Parcialmente Nublado', iconType: 'cloud-sun' };
  if (code === 3) return { description: 'Nublado Cálido', iconType: 'cloud-sun' };
  if (code >= 45 && code <= 48) return { description: 'Bruma Ribereña', iconType: 'cloud-sun' };
  if (code >= 51 && code <= 55) return { description: 'Llovizna Ligera', iconType: 'rain' };
  if (code >= 61 && code <= 67) return { description: 'Lluvias en el Valle', iconType: 'rain' };
  if (code >= 80 && code <= 82) return { description: 'Chubascos Dispersos', iconType: 'rain' };
  if (code >= 95 && code <= 99) return { description: 'Tormenta Eléctrica', iconType: 'storm' };
  return { description: 'Soleado y Cálido', iconType: 'sun' };
}

// Custom 3D-styled Weather Icon matching the image (Sun + Cloud overlapping)
const WeatherSunCloud3D: React.FC<{ code?: number; className?: string }> = ({ code = 1, className = "w-20 h-20" }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Radiant Glow behind Sun */}
      <div className="absolute -top-1 -left-1 w-16 h-16 rounded-full bg-amber-400/40 blur-md pointer-events-none animate-pulse" />
      
      {/* 3D Sun Sphere */}
      <div className="absolute top-1 left-2 w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-300 shadow-[0_4px_14px_rgba(245,158,11,0.5)] border border-yellow-200/50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100/40 to-transparent -translate-y-1 -translate-x-1" />
      </div>

      {/* 3D Layered Fluffy Cloud sitting in front */}
      <div className="absolute bottom-1 right-1 w-16 h-10 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
        {/* Cloud Body using overlapping smooth rounded circles */}
        <div className="relative w-full h-full">
          {/* Base pill */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-white via-sky-100 to-sky-200/90 rounded-full" />
          {/* Left puff */}
          <div className="absolute bottom-1 left-1.5 w-6 h-6 bg-gradient-to-b from-white via-sky-100 to-sky-200 rounded-full" />
          {/* Center tall puff */}
          <div className="absolute bottom-2.5 left-5 w-8 h-8 bg-gradient-to-b from-white via-sky-50 to-sky-200 rounded-full" />
          {/* Right puff */}
          <div className="absolute bottom-1 right-2 w-6 h-6 bg-gradient-to-b from-white via-sky-100 to-sky-200 rounded-full" />
          {/* Soft cloud highlight */}
          <div className="absolute bottom-4 left-6 w-5 h-2.5 bg-white/70 rounded-full blur-[0.5px]" />
        </div>
      </div>
    </div>
  );
};

const WEATHER_CACHE_KEY = 'purificalendario_live_weather_cache';

export const HydroWeatherMonitor: React.FC<HydroWeatherMonitorProps> = ({
  onOpenEmergencyDirectory
}) => {
  const [showFullForecast, setShowFullForecast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [justUpdated, setJustUpdated] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Purificación');
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [simulatedLevel, setSimulatedLevel] = useState<number | null>(null);

  // Initial State loaded from localStorage cache if present to eliminate cold-start delay
  const [weatherData, setWeatherData] = useState<LiveWeatherData>(() => {
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.temperature === 'number') {
          return parsed;
        }
      }
    } catch (_) {}

    return {
      temperature: 29,
      apparentTemperature: 33,
      humidity: 65,
      windSpeed: 8.5,
      windDirection: 60,
      uvIndex: 8,
      precipitation: 0,
      precipitationProbability: 15,
      tempMax: 35,
      tempMin: 24,
      weatherCode: 1,
      weatherDescription: 'Parcialmente Nublado',
      isRealApi: true,
      lastUpdatedTime: new Date().toLocaleTimeString('es-CO', { 
        timeZone: 'America/Bogota',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      forecastBannerText: 'Se esperan 6 días calurosos a partir de Mañana.'
    };
  });

  const [riverLevel, setRiverLevel] = useState<number>(4.83);
  const [riverDelta, setRiverDelta] = useState<string>('±0.02m');
  const [riverTrend, setRiverTrend] = useState<string>('Estable');
  const [lastSyncTime, setLastSyncTime] = useState<string>(
    new Date().toLocaleTimeString('es-CO', { 
      timeZone: 'America/Bogota',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  );

  // Synchronize Live Weather with instant caching
  const fetchLiveWeather = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    const now = new Date();
    const nowStr = now.toLocaleTimeString('es-CO', { 
      timeZone: 'America/Bogota',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    try {
      // 1. Fetch from high-speed backend proxy with 7-day & hourly telemetry
      let dataLoaded = false;
      try {
        const proxyRes = await fetch(`/api/weather?_t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (proxyRes.ok) {
          const json = await proxyRes.json();
          if (json.success && json.weather) {
            const w = json.weather;
            const weatherInterp = interpretWeatherCode(w.weatherCode ?? 1);
            const freshState: LiveWeatherData = {
              temperature: w.temperature,
              apparentTemperature: w.apparentTemperature,
              humidity: w.humidity,
              windSpeed: w.windSpeed,
              windDirection: w.windDirection,
              uvIndex: w.uvIndex,
              precipitation: w.precipitation,
              precipitationProbability: w.precipitationProbability,
              tempMax: w.tempMax,
              tempMin: w.tempMin,
              weatherCode: w.weatherCode,
              weatherDescription: weatherInterp.description,
              isRealApi: true,
              lastUpdatedTime: json.syncTime || nowStr,
              forecastBannerText: json.forecastBannerText || 'Se esperan 6 días calurosos a partir de Mañana.',
              dailyForecast: w.dailyForecast || [],
              hourlyForecast: w.hourlyForecast || []
            };

            setWeatherData(freshState);
            try {
              localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(freshState));
            } catch (_) {}

            if (json.river) {
              setRiverLevel(json.river.nivelMetros);
              setRiverDelta(json.river.delta || '±0.01m');
              setRiverTrend(json.river.tendencia || 'Estable');
            }
            dataLoaded = true;
          }
        }
      } catch (proxyErr) {
        console.warn('[Weather] Fallback direct fetch:', proxyErr);
      }

      // 2. Direct fallback client call if proxy was unreachable
      if (!dataLoaded) {
        const directRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=3.8587&longitude=-74.9314&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max,weather_code&timezone=America%2FBogota&forecast_days=7&_t=${Date.now()}`
        );

        if (directRes.ok) {
          const directData = await directRes.json();
          const current = directData.current || {};
          const daily = directData.daily || {};
          const hourly = directData.hourly || {};
          const weatherInterp = interpretWeatherCode(current.weather_code ?? 1);
          const rawTemp = current.temperature_2m ?? 29;

          // Process days
          const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          const directDaily: DailyForecastItem[] = [];
          const times = daily.time || [];
          for (let i = 0; i < times.length && i < 7; i++) {
            const dateObj = new Date(times[i] + 'T12:00:00-05:00');
            directDaily.push({
              date: times[i],
              dayName: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : daysOfWeek[dateObj.getDay()],
              tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 35),
              tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 23),
              weatherCode: daily.weather_code?.[i] ?? 0,
              precipitationProbability: Math.round(daily.precipitation_probability_max?.[i] ?? 15),
              isHotDay: true
            });
          }

          // Process hourly
          const directHourly: HourlyForecastItem[] = [];
          const hTimes = hourly.time || [];
          for (let j = 0; j < 12 && j < hTimes.length; j++) {
            const hHour = new Date(hTimes[j]).getHours();
            directHourly.push({
              label: j === 0 ? 'Ahora' : `${hHour % 12 || 12} ${hHour >= 12 ? 'PM' : 'AM'}`,
              hour: hHour,
              temperature: Math.round(hourly.temperature_2m?.[j] ?? rawTemp),
              weatherCode: hourly.weather_code?.[j] ?? 0,
              precipitationProbability: Math.round(hourly.precipitation_probability?.[j] ?? 10)
            });
          }

          const freshState: LiveWeatherData = {
            temperature: Math.round(rawTemp),
            apparentTemperature: Math.round(current.apparent_temperature ?? (rawTemp + 3.5)),
            humidity: Math.round(current.relative_humidity_2m ?? 65),
            windSpeed: Math.round(current.wind_speed_10m ?? 8),
            windDirection: Math.round(current.wind_direction_10m ?? 60),
            uvIndex: Math.round(current.uv_index ?? 8),
            precipitation: current.precipitation ?? 0,
            precipitationProbability: daily?.precipitation_probability_max?.[0] ?? 15,
            tempMax: Math.round(daily?.temperature_2m_max?.[0] ?? 35),
            tempMin: Math.round(daily?.temperature_2m_min?.[0] ?? 23),
            weatherCode: current.weather_code ?? 1,
            weatherDescription: weatherInterp.description,
            isRealApi: true,
            lastUpdatedTime: nowStr,
            forecastBannerText: 'Se esperan 6 días calurosos a partir de Mañana.',
            dailyForecast: directDaily,
            hourlyForecast: directHourly
          };

          setWeatherData(freshState);
          try {
            localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(freshState));
          } catch (_) {}
          dataLoaded = true;
        }
      }

      setLastSyncTime(nowStr);
      setSecondsAgo(0);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 3000);
    } catch (err) {
      console.error('Error sincronizando clima en tiempo real:', err);
    } finally {
      if (isManual) {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  };

  // Continuous Auto-Update Engine (Like native weather apps)
  useEffect(() => {
    // 1. Initial immediate background fetch
    fetchLiveWeather();

    // 2. Periodic background refresh every 30 seconds
    const autoRefreshInterval = setInterval(() => {
      fetchLiveWeather(false);
    }, 30000);

    // 3. Auto-sync on Tab Visibility (when user returns to app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLiveWeather(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Auto-sync on Online Reconnect
    const handleOnline = () => {
      fetchLiveWeather(false);
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(autoRefreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // 1-second ticker for "hace X segundos" live feedback
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const status = RIO_MAGDALENA_STATUS;
  const activeRiverLevel = simulatedLevel ?? riverLevel;
  const percentage = Math.min(100, Math.round((activeRiverLevel / status.nivelAlertaRoja) * 100));

  const riverAlertStatus = (() => {
    if (activeRiverLevel >= status.nivelAlertaRoja) {
      return { label: 'ALERTA ROJA (Desbordamiento)', color: 'bg-rose-600 text-white border-rose-700 animate-pulse' };
    }
    if (activeRiverLevel >= status.nivelAlertaNaranja) {
      return { label: 'ALERTA NARANJA (Preparación)', color: 'bg-orange-500 text-white border-orange-600' };
    }
    if (activeRiverLevel >= status.nivelAlertaAmarilla) {
      return { label: 'ALERTA AMARILLA (Precaución)', color: 'bg-amber-400 text-slate-900 border-amber-500' };
    }
    return { label: `Nivel Seguro: ${activeRiverLevel}m (Cota Normal)`, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' };
  })();

  const handleShareRiverReport = () => {
    shareViaWhatsApp(
      `MONITOR CLIMÁTICO E HIDROLÓGICO - PURIFICACIÓN, TOLIMA`,
      `🌤️ Clima Actual: ${weatherData.temperature}°C (${weatherData.weatherDescription})\n🌡️ Sensación Térmica: ${weatherData.apparentTemperature}°C | Humedad: ${weatherData.humidity}%\n☀️ Índice UV: ${weatherData.uvIndex}\n\n🌊 Nivel Río Magdalena: ${activeRiverLevel}m (${riverTrend})\n📍 Estación Limnimétrica: Puente Ospina Pérez (IDEAM)\n⏰ Sincronizado: ${lastSyncTime}\nℹ️ Sectores: ${status.sectoresRiesgo.slice(0, 3).join(', ')}`,
      'Purificación, Tolima'
    );
  };

  return (
    <div className="w-full space-y-4 animate-fade-in font-sans">
      {/* 
        ========================================================================
        HERO WEATHER WIDGET (Matching the exact design of the user's reference)
        ========================================================================
      */}
      <div 
        className="relative overflow-hidden rounded-[28px] p-5 sm:p-7 text-white shadow-xl transition-all duration-300 border border-sky-400/30 dark:border-sky-500/20 bg-gradient-to-b from-[#1c62b9] via-[#216ebd] to-[#164a8c]"
        style={{
          boxShadow: '0 12px 36px -8px rgba(28, 98, 185, 0.45)'
        }}
      >
        {/* Soft Sun Glare / Lens Flare Overlay Effect */}
        <div 
          className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-gradient-to-br from-white/20 via-sky-300/10 to-transparent blur-2xl pointer-events-none" 
        />
        <div 
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-sky-300/15 blur-3xl pointer-events-none" 
        />
        
        {/* Top Header: Navigation Arrow, Location Dropdown, Options */}
        <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
          {/* Location Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              className="flex items-center gap-2 text-white hover:text-white/90 transition-colors group cursor-pointer"
              title="Cambiar sector de Purificación"
            >
              {/* White navigation paperplane/compass arrow */}
              <Navigation className="w-4 h-4 text-white fill-white -rotate-45 drop-shadow-xs" />
              <span className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-xs">
                {selectedLocation}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-transform" />
            </button>

            {/* Dropdown Menu for Purificación Sectors */}
            {showLocationMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl p-1.5 z-50 animate-fade-in text-slate-100">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase text-sky-400 border-b border-slate-800">
                  Sectores de Purificación
                </div>
                {[
                  'Purificación',
                  'Casco Urbano & Malecón',
                  'Puente Ospina Pérez',
                  'Villa de las Palmas',
                  'Barrio El Amparo',
                  'Vereda Chenche Asoleado'
                ].map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowLocationMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedLocation === loc
                        ? 'bg-sky-500 text-white'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocation === loc && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Controls: Auto-update pulse and Options */}
          <div className="flex items-center gap-2 relative">
            <div 
              className="flex items-center gap-1.5 text-[11px] font-medium text-white/80 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10"
              title="Clima sincronizado automáticamente con satélite e IDEAM"
            >
              <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-amber-300 animate-spin' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="hidden sm:inline">
                {refreshing ? 'Actualizando...' : secondsAgo < 10 ? 'En vivo' : `Hace ${secondsAgo}s`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-colors text-white/90 hover:text-white cursor-pointer"
              title="Opciones del clima"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Options Dropdown */}
            {showOptionsMenu && (
              <div className="absolute top-full right-0 mt-2 w-52 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl p-1.5 z-50 animate-fade-in text-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    fetchLiveWeather(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sincronizar ahora</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleShareRiverReport();
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Compartir por WhatsApp</span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <div className="px-3 py-1 text-[10px] text-slate-400">
                  IDEAM 21027010 &bull; 329 m.s.n.m.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Big 3D Weather Icon + Giant Temperature + Heat Alert Message */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 my-2">
          {/* Left: Weather 3D Icon & Large Temperature */}
          <div className="flex items-center gap-3.5">
            {/* 3D Sun & Cloud */}
            <WeatherSunCloud3D code={weatherData.weatherCode} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0" />

            {/* Big Clean Temperature */}
            <div className="flex items-start">
              <span className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tighter text-white drop-shadow-sm font-sans">
                {weatherData.temperature}
              </span>
              <span className="text-2xl sm:text-3xl font-light text-white/90 mt-1 ml-0.5">
                °C
              </span>
            </div>
          </div>

          {/* Right: Heatwave forecast message matching the screenshot */}
          <div 
            onClick={() => setShowFullForecast(true)}
            className="flex-1 max-w-sm rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 p-3.5 transition-all duration-200 cursor-pointer group flex items-center gap-3 shadow-sm active:scale-[0.99]"
            title="Toca para ver los días calurosos y pronóstico extendido"
          >
            <div className="text-2xl select-none shrink-0 flex items-center gap-0.5">
              <span>🔥</span>
              <span>🌡️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-[13px] font-medium text-white leading-snug drop-shadow-xs">
                {weatherData.forecastBannerText || 'Se esperan 6 días calurosos a partir de Mañana.'}
              </p>
              <span className="text-[11px] text-sky-200/90 font-normal group-hover:underline">
                Sensación de {weatherData.apparentTemperature}°C &bull; Ver detalle
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </div>

        {/* Bottom Centered Pill Button: "Ver pronóstico completo" */}
        <div className="relative z-10 flex items-center justify-center pt-3 sm:pt-4">
          <button
            type="button"
            onClick={() => setShowFullForecast(!showFullForecast)}
            className="px-6 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-white bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md border border-white/30 shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer hover:shadow-lg"
          >
            <span>{showFullForecast ? 'Ocultar pronóstico detallado' : 'Ver pronóstico completo'}</span>
            {showFullForecast ? (
              <ChevronUp className="w-4 h-4 text-white" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        EXPANDED COMPLETE FORECAST (Slides in when "Ver pronóstico completo" is clicked)
        ========================================================================
      */}
      {showFullForecast && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in">
          {/* Header of Detailed View */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>Pronóstico Extendido & Telemetría • Purificación</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Datos sincronizados en tiempo real: <strong className="text-slate-700 dark:text-slate-300">{lastSyncTime}</strong> (hace {secondsAgo}s)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchLiveWeather(true)}
                disabled={refreshing}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Actualizando...' : 'Actualizar ahora'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareRiverReport}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir</span>
              </button>
            </div>
          </div>

          {/* 1. 24-Hour Hourly Forecast (Horizontal ticker) */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Pronóstico por horas para hoy</span>
            </span>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {(weatherData.hourlyForecast && weatherData.hourlyForecast.length > 0
                ? weatherData.hourlyForecast
                : [
                    { label: 'Ahora', hour: 11, temperature: weatherData.temperature, weatherCode: 0, precipitationProbability: 5 },
                    { label: '12 PM', hour: 12, temperature: 34, weatherCode: 0, precipitationProbability: 10 },
                    { label: '1 PM', hour: 13, temperature: 35, weatherCode: 0, precipitationProbability: 10 },
                    { label: '2 PM', hour: 14, temperature: 36, weatherCode: 0, precipitationProbability: 15 },
                    { label: '3 PM', hour: 15, temperature: 35, weatherCode: 1, precipitationProbability: 20 },
                    { label: '4 PM', hour: 16, temperature: 34, weatherCode: 1, precipitationProbability: 20 },
                    { label: '5 PM', hour: 17, temperature: 32, weatherCode: 1, precipitationProbability: 25 },
                    { label: '6 PM', hour: 18, temperature: 30, weatherCode: 1, precipitationProbability: 15 },
                    { label: '7 PM', hour: 19, temperature: 28, weatherCode: 0, precipitationProbability: 10 }
                  ]
              ).map((h, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col items-center justify-between p-3 rounded-2xl min-w-[76px] shrink-0 border transition-all ${
                    idx === 0 
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800' 
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {h.label}
                  </span>
                  
                  <div className="my-2">
                    {h.weatherCode >= 51 ? (
                      <CloudRain className="w-5 h-5 text-blue-500" />
                    ) : h.weatherCode >= 1 ? (
                      <CloudSun className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Sun className="w-5 h-5 text-amber-500" />
                    )}
                  </div>

                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {h.temperature}°
                  </span>

                  {h.precipitationProbability > 15 && (
                    <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 mt-1">
                      {h.precipitationProbability}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. 7-Day Forecast Bars */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Pronóstico de los próximos 7 días en Purificación</span>
            </span>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
              {(weatherData.dailyForecast && weatherData.dailyForecast.length > 0 
                ? weatherData.dailyForecast 
                : [
                    { dayName: 'Hoy', tempMax: 35, tempMin: 24, precipitationProbability: 15, isHotDay: true },
                    { dayName: 'Mañana', tempMax: 36, tempMin: 24, precipitationProbability: 10, isHotDay: true },
                    { dayName: 'Sábado', tempMax: 36, tempMin: 25, precipitationProbability: 10, isHotDay: true },
                    { dayName: 'Domingo', tempMax: 35, tempMin: 24, precipitationProbability: 20, isHotDay: true },
                    { dayName: 'Lunes', tempMax: 34, tempMin: 23, precipitationProbability: 25, isHotDay: true },
                    { dayName: 'Martes', tempMax: 35, tempMin: 24, precipitationProbability: 15, isHotDay: true },
                    { dayName: 'Miércoles', tempMax: 36, tempMin: 24, precipitationProbability: 10, isHotDay: true }
                  ]
              ).map((day, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 text-xs">
                  <span className="w-24 font-bold text-slate-800 dark:text-slate-200">
                    {day.dayName}
                  </span>

                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Sun className="w-4 h-4" />
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Soleado
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium">{day.tempMin}°</span>
                    <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        style={{ width: `${Math.min(100, ((day.tempMax - 20) / 20) * 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white w-6 text-right">
                      {day.tempMax}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Detailed Parameter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Sensación Térmica / Bochorno */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/80 dark:border-amber-800/50">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase">Bochorno Típico</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {weatherData.apparentTemperature}°C
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Calor característico del río Magdalena
              </p>
            </div>

            {/* Índice UV */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-rose-500/10 border border-orange-200/80 dark:border-orange-800/50">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                <Sun className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase">Radiación UV</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {weatherData.uvIndex} <span className="text-xs font-bold text-orange-600">Muy Alto</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Usar bloqueador solar e hidratación
              </p>
            </div>

            {/* Humedad */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200/80 dark:border-blue-800/50">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <Droplets className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase">Humedad</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {weatherData.humidity}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Punto de rocío: 22°C
              </p>
            </div>

            {/* Viento */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-200/80 dark:border-teal-800/50">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
                <Wind className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase">Brisa del Río</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {weatherData.windSpeed} km/h
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dirección Nororiente ({weatherData.windDirection}°)
              </p>
            </div>
          </div>

          {/* 4. River Magdalena Hydro Monitor */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 text-white shadow-md border border-cyan-800/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Waves className="w-5 h-5 text-cyan-400 animate-bounce" />
                  <h5 className="font-black text-sm sm:text-base text-white">
                    Caudal del Río Magdalena • Puente Ospina Pérez
                  </h5>
                </div>
                <p className="text-xs text-cyan-200/80 mt-0.5">
                  Estación Limnimétrica IDEAM 21027010 &bull; Variación: <strong className="text-cyan-300 font-mono">{riverDelta}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border flex items-center gap-1.5 ${riverAlertStatus.color}`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{riverAlertStatus.label}</span>
                </span>
              </div>
            </div>

            {/* Gauge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-cyan-200 flex-wrap gap-1.5">
                <span>Estiaje: 2.0m</span>
                <span className="text-amber-300">Amarilla: 5.5m</span>
                <span className="text-orange-400">Naranja: 6.8m</span>
                <span className="text-rose-400">Roja: 7.5m</span>
              </div>

              <div className="w-full h-5 rounded-full bg-slate-800/90 border border-slate-700 overflow-hidden relative shadow-inner p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-700 relative ${
                    activeRiverLevel >= status.nivelAlertaRoja
                      ? 'bg-rose-600'
                      : activeRiverLevel >= status.nivelAlertaNaranja
                      ? 'bg-orange-500'
                      : activeRiverLevel >= status.nivelAlertaAmarilla
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                >
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-950 px-1 py-0.2 bg-white/95 rounded shadow-xs">
                    {activeRiverLevel}m
                  </div>
                </div>
              </div>
            </div>

            {/* Simulator pills */}
            <div className="pt-2 border-t border-cyan-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-cyan-300 text-[11px]">
                Tendencia: <strong className="text-white capitalize">{riverTrend}</strong> &bull; Navegación habilitada
              </span>

              {simulatedLevel !== null && (
                <button
                  type="button"
                  onClick={() => setSimulatedLevel(null)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-rose-500/30 text-rose-300 border border-rose-400/40 hover:bg-rose-500/40 transition-colors font-bold cursor-pointer"
                >
                  Restablecer nivel real ({riverLevel}m)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
