import React from 'react';
import { 
  AlertTriangle, 
  Droplets, 
  Zap, 
  Flame, 
  HeartHandshake, 
  Activity, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  PawPrint
} from 'lucide-react';
import { 
  ReporteVia, 
  CorteProgramado, 
  JornadaSaludEsterilizacion, 
  OpsGlobalFilterState 
} from '../../types';
import { BARRIOS_PURIFICACION } from '../../data/municipalOpsData';

interface OpsMetricsHeaderProps {
  vias: ReporteVia[];
  cortes: CorteProgramado[];
  jornadas: JornadaSaludEsterilizacion[];
  filters: OpsGlobalFilterState;
  onFilterChange: (filters: OpsGlobalFilterState) => void;
  onResetFilters: () => void;
  onQuickAdd: (tipo: 'via' | 'corte' | 'jornada') => void;
}

export const OpsMetricsHeader: React.FC<OpsMetricsHeaderProps> = ({
  vias,
  cortes,
  jornadas,
  filters,
  onFilterChange,
  onResetFilters,
  onQuickAdd
}) => {
  // Metrics calculations
  const totalViasActivas = vias.filter(v => v.estado !== 'completado').length;
  const viasAltaSeveridad = vias.filter(v => v.severidad === 'alta' && v.estado !== 'completado').length;
  const viasEnReparacion = vias.filter(v => v.estado === 'reparacion').length;
  const viasCompletadas = vias.filter(v => v.estado === 'completado').length;

  const cortesEnCurso = cortes.filter(c => c.estado === 'en_curso').length;
  const cortesProgramados = cortes.filter(c => c.estado === 'programado').length;
  const poblacionAfectadaTotal = cortes
    .filter(c => c.estado !== 'restablecido')
    .reduce((sum, c) => sum + (c.poblacion_afectada_aprox || 0), 0);

  const totalCupos = jornadas.reduce((sum, j) => sum + j.cupos_totales, 0);
  const totalCuposOcupados = jornadas.reduce((sum, j) => sum + j.cupos_ocupados, 0);
  const totalMascotasInscritas = jornadas.reduce((sum, j) => sum + j.inscritos.length, 0);

  const totalIncidenciasActivas = totalViasActivas + cortesEnCurso + cortesProgramados;

  const isFiltered = 
    filters.searchQuery.trim() !== '' || 
    filters.barrioSeleccionado !== 'todos' || 
    filters.estadoFiltro !== 'todos' || 
    filters.severidadFiltro !== 'todas';

  return (
    <div className="space-y-4">
      {/* Top Banner: Title & Operational Status */}
      <div className="bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#1976D2] dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 rounded-3xl p-6 text-white shadow-md border border-blue-800/40 relative overflow-hidden">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-blue-100 border border-white/20">
              <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>Centro de Control Operativo Municipal de Purificación</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Monitoreo Territorial & Gestión de Servicios Públicos
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
              Supervisión en tiempo real de la malla vial urbana y rural, cortes programados de agua/energía y brigadas de zoonosis y salud pública en Purificación, Tolima.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => onQuickAdd('via')}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-950" />
              <span>Reportar Daño Vial</span>
            </button>

            <button
              onClick={() => onQuickAdd('corte')}
              className="px-4 py-2.5 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Droplets className="w-4 h-4 text-sky-950" />
              <span>Programar Corte</span>
            </button>

            <button
              onClick={() => onQuickAdd('jornada')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PawPrint className="w-4 h-4 text-emerald-950" />
              <span>Nueva Jornada Zoonosis</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Incidencias Totales Activas */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Incidencias Activas
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalIncidenciasActivas}
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                En seguimiento
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {viasAltaSeveridad} con severidad crítica
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Vías Dañadas & Reparaciones */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Malla Vial Afectada
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalViasActivas}
              </span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                {viasEnReparacion} en obra
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {viasCompletadas} tramos pavimentados
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#0D47A1] dark:text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Cortes Programados & Población */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cortes de Servicios
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {cortesEnCurso + cortesProgramados}
              </span>
              {cortesEnCurso > 0 && (
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md animate-pulse">
                  {cortesEnCurso} en curso
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ~{poblacionAfectadaTotal.toLocaleString()} habitantes afectados
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Jornadas de Salud & Esterilización */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cupos Zoonosis / Salud
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalCuposOcupados}/{totalCupos}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                {Math.round((totalCuposOcupados / (totalCupos || 1)) * 100)}% ocupado
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {totalMascotasInscritas} mascotas registradas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Global Filter Bar: Barrios, Zonas, Severidad y Búsqueda */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Buscar por dirección, motivo de corte, cuadrilla o palabra clave..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-750 focus:border-[#2196F3] focus:outline-none transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Barrio Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <select
              value={filters.barrioSeleccionado}
              onChange={(e) => onFilterChange({ ...filters, barrioSeleccionado: e.target.value })}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Barrios & Veredas</option>
              {BARRIOS_PURIFICACION.map((barrio) => (
                <option key={barrio} value={barrio}>
                  {barrio}
                </option>
              ))}
            </select>
          </div>

          {/* Severidad Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-[#2196F3]" />
            <select
              value={filters.severidadFiltro}
              onChange={(e) => onFilterChange({ ...filters, severidadFiltro: e.target.value })}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="todas">Cualquier Severidad</option>
              <option value="alta">🔴 Severidad Alta / Crítica</option>
              <option value="media">🟡 Severidad Media</option>
              <option value="baja">🟢 Severidad Baja</option>
            </select>
          </div>

          {/* Estado Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <select
              value={filters.estadoFiltro}
              onChange={(e) => onFilterChange({ ...filters, estadoFiltro: e.target.value })}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              <option value="reportado">Reportado</option>
              <option value="inspeccion">En Inspección</option>
              <option value="reparacion">En Reparación / Obra</option>
              <option value="completado">Completado / Pavimentado</option>
              <option value="en_curso">Corte en Curso</option>
              <option value="programado">Corte / Jornada Programada</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold hover:bg-red-100 flex items-center gap-1 transition-colors"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
