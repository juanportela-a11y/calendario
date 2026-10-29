import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Sparkles, 
  Check, 
  Grid, 
  List, 
  Bookmark,
  CalendarRange,
  ChevronDown,
  CalendarDays,
  X,
  BellRing
} from 'lucide-react';
import { Categoria, Evento, EventFilterState } from '../types';
import { EventCard } from './EventCard';

interface CalendarViewProps {
  categories: Categoria[];
  events: Evento[];
  savedEventIds: number[];
  userCategoryPreferences: string[];
  onToggleSave: (idEvento: number) => void;
  onSelectEvent: (evento: Evento) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  categories,
  events,
  savedEventIds,
  userCategoryPreferences,
  onToggleSave,
  onSelectEvent
}) => {
  const [viewMode, setViewMode] = useState<'mes' | 'semana'>('mes');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 11)); // Default Aug 2026
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);

  const [filters, setFilters] = useState<EventFilterState>({
    searchQuery: '',
    categoriaId: null,
    onlyPreferences: false,
    onlySaved: false,
    startDate: '',
    endDate: ''
  });

  // Date range presets helper
  const handleApplyDatePreset = (preset: 'all' | 'today' | 'this_week' | 'weekend' | 'this_month' | 'next_30') => {
    const today = new Date(2026, 7, 11); // August 11, 2026 base date
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (preset === 'all') {
      setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));
      return;
    }

    if (preset === 'today') {
      const todayStr = formatDate(today);
      setFilters(prev => ({ ...prev, startDate: todayStr, endDate: todayStr }));
      return;
    }

    if (preset === 'this_week') {
      const start = new Date(today);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setFilters(prev => ({ ...prev, startDate: formatDate(start), endDate: formatDate(end) }));
      return;
    }

    if (preset === 'weekend') {
      const sat = new Date(today);
      const day = sat.getDay();
      const diff = sat.getDate() + (6 - day);
      sat.setDate(diff);
      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);
      setFilters(prev => ({ ...prev, startDate: formatDate(sat), endDate: formatDate(sun) }));
      return;
    }

    if (preset === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setFilters(prev => ({ ...prev, startDate: formatDate(start), endDate: formatDate(end) }));
      return;
    }

    if (preset === 'next_30') {
      const end = new Date(today);
      end.setDate(today.getDate() + 30);
      setFilters(prev => ({ ...prev, startDate: formatDate(today), endDate: formatDate(end) }));
      return;
    }
  };

  // Month navigation helpers
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthShortNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const availableYears = [2025, 2026, 2027];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handleSelectMonth = (targetMonthIndex: number) => {
    const newD = new Date(year, targetMonthIndex, 1);
    setCurrentDate(newD);
    setSelectedDay(null);
    setShowMonthDropdown(false);
  };

  const handleSelectYear = (targetYear: number) => {
    const newD = new Date(targetYear, month, 1);
    setCurrentDate(newD);
    setSelectedDay(null);
  };

  const handlePrev = () => {
    const newD = new Date(currentDate);
    if (viewMode === 'mes') {
      newD.setMonth(newD.getMonth() - 1);
    } else {
      newD.setDate(newD.getDate() - 7);
    }
    setCurrentDate(newD);
  };

  const handleNext = () => {
    const newD = new Date(currentDate);
    if (viewMode === 'mes') {
      newD.setMonth(newD.getMonth() + 1);
    } else {
      newD.setDate(newD.getDate() + 7);
    }
    setCurrentDate(newD);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 7, 11));
    setSelectedDay('2026-08-11');
  };

  // Event counts by month for current year
  const getEventCountForMonth = (mIndex: number) => {
    const mPrefix = `${year}-${String(mIndex + 1).padStart(2, '0')}`;
    return events.filter(e => e.fecha.startsWith(mPrefix)).length;
  };

  // Filtered events
  const filteredEvents = events.filter(e => {
    // Category
    if (filters.categoriaId && e.id_categoria !== filters.categoriaId) {
      return false;
    }
    // Preferences
    if (filters.onlyPreferences) {
      const catCode = e.categoria?.codigo || 'cultura';
      if (!userCategoryPreferences.includes(catCode)) return false;
    }
    // Saved
    if (filters.onlySaved && !savedEventIds.includes(e.id_evento)) {
      return false;
    }
    // Search
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match = e.nombre.toLowerCase().includes(q) ||
        e.lugar.toLowerCase().includes(q) ||
        e.descripcion.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Date Range Filter
    if (filters.startDate && e.fecha < filters.startDate) {
      return false;
    }
    if (filters.endDate && e.fecha > filters.endDate) {
      return false;
    }
    return true;
  });

  // Generate Month Matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Adjusted for Monday start
  const startingOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const calendarDays: Array<{ dayNumber: number | null; dateStr: string | null }> = [];
  
  for (let i = 0; i < startingOffset; i++) {
    calendarDays.push({ dayNumber: null, dateStr: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    calendarDays.push({
      dayNumber: day,
      dateStr: `${year}-${monthStr}-${dayStr}`
    });
  }

  // Week View Calculations
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays: Array<{ dayNumber: number; dateStr: string; dayName: string }> = [];
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      weekDays.push({
        dayNumber: d.getDate(),
        dateStr: `${d.getFullYear()}-${mStr}-${dStr}`,
        dayName: dayNames[i]
      });
    }
    return weekDays;
  };

  const selectedDayEvents = selectedDay 
    ? filteredEvents.filter(e => e.fecha === selectedDay)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Header Controls Bar (Glassmorphism & Luminous Ambient Aura) */}
      <div className="bg-white/80 dark:bg-[#111d3d]/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-xl dark:shadow-[0_12px_40px_-10px_rgba(2,6,23,0.7)] space-y-5 transition-all duration-300 relative overflow-hidden">
        {/* Subtle decorative glow for dark theme */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-cyan-400/10 dark:bg-cyan-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-600/10 dark:bg-blue-600/15 blur-3xl pointer-events-none" />
        
        {/* Top Controls: Title, Year Switcher, View Switcher & Month Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-blue-500/20 to-cyan-500/15 dark:from-blue-600/30 dark:to-cyan-400/20 text-[#0D47A1] dark:text-cyan-300 rounded-2xl border border-blue-200/60 dark:border-cyan-500/30 shadow-xs">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="flex items-center gap-1.5 text-xl font-black text-slate-900 dark:text-white hover:text-[#2196F3] dark:hover:text-cyan-300 transition-all group cursor-pointer border border-transparent dark:border-slate-700/40 px-2 py-1 rounded-xl"
                >
                  <span>{monthNames[month]}</span>
                  <span className="text-[#2196F3] dark:text-cyan-400">{year}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-[#2196F3] dark:group-hover:text-cyan-300 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Quick Month Dropdown Menu */}
                {showMonthDropdown && (
                  <div className="absolute top-full left-0 mt-2 z-30 bg-white/95 dark:bg-[#111d3d]/95 backdrop-blur-2xl p-4 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl w-72 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Seleccionar Año</span>
                      <div className="flex items-center gap-1">
                        {availableYears.map(y => (
                          <button
                            key={y}
                            onClick={() => handleSelectYear(y)}
                            className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
                              y === year
                                ? 'bg-[#2196F3] text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {monthNames.map((mName, idx) => {
                        const count = getEventCountForMonth(idx);
                        const isCurrentMonth = idx === month;
                        return (
                          <button
                            key={mName}
                            onClick={() => handleSelectMonth(idx)}
                            className={`p-2 rounded-xl text-left text-xs font-bold transition-all flex flex-col justify-between ${
                              isCurrentMonth
                                ? 'bg-[#0D47A1] dark:bg-blue-600 text-white shadow-xs'
                                : 'hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="truncate">{monthShortNames[idx]}</span>
                            {count > 0 && (
                              <span className={`text-[9px] font-extrabold ${isCurrentMonth ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'}`}>
                                {count} {count === 1 ? 'evt' : 'evts'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Consulta los eventos programados en Purificación, Tolima
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Year Quick Buttons */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
              {availableYears.map(y => (
                <button
                  key={y}
                  onClick={() => handleSelectYear(y)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    year === y
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            {/* Today Button */}
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-300 text-xs font-bold rounded-xl border border-slate-200/70 dark:border-slate-700/70 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            >
              Hoy
            </button>

            {/* Prev/Next Controls */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Switcher: Mes / Semana */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
              <button
                onClick={() => setViewMode('mes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'mes'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Mes</span>
              </button>

              <button
                onClick={() => setViewMode('semana')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'semana'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Semana</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated 12-Months Menu Bar (Menú de Meses del Año) */}
        <div className="pt-3 border-t border-slate-100/80 dark:border-slate-800/80 relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-[#2196F3] dark:text-cyan-400" />
              <span>Menú de Meses del Año ({year})</span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Navegación mensual instantánea
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {monthNames.map((mName, idx) => {
              const isCurrent = idx === month;
              const count = getEventCountForMonth(idx);

              return (
                <button
                  key={mName}
                  onClick={() => handleSelectMonth(idx)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-[#0D47A1] via-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-cyan-300 dark:ring-cyan-400 scale-[1.04]'
                      : 'bg-slate-50/80 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-750/70 hover:scale-[1.02]'
                  }`}
                  title={`${mName} ${year} - ${count} evento(s)`}
                >
                  <span className="text-[11px] font-black">{monthShortNames[idx]}</span>
                  
                  {count > 0 ? (
                    <span 
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-black mt-0.5 ${
                        isCurrent
                          ? 'bg-white/25 text-white'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300'
                      }`}
                    >
                      {count}
                    </span>
                  ) : (
                    <span className="text-[9px] opacity-30 mt-0.5">&bull;</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters Bar: Search & Category Chips */}
        <div className="pt-3.5 border-t border-slate-100/80 dark:border-slate-800/80 space-y-3.5 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search Input with Glassmorphism */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-cyan-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Buscar por evento, temática o lugar..."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl bg-slate-50/90 dark:bg-slate-850/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#2196F3] dark:focus:border-cyan-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-2xs"
              />
            </div>

            {/* Preference Toggles with Luminous Aura */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilters({ ...filters, onlyPreferences: !filters.onlyPreferences })}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-95 ${
                  filters.onlyPreferences
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                    : 'bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-750'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Mis Categorías</span>
              </button>

              <button
                onClick={() => setFilters({ ...filters, onlySaved: !filters.onlySaved })}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-95 ${
                  filters.onlySaved
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-md shadow-amber-500/30'
                    : 'bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-750'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Guardados ({savedEventIds.length})</span>
              </button>
            </div>
          </div>

          {/* Category Color Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
            <button
              onClick={() => setFilters({ ...filters, categoriaId: null })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border cursor-pointer hover:scale-105 active:scale-95 ${
                filters.categoriaId === null
                  ? 'bg-gradient-to-r from-slate-900 to-blue-900 dark:from-blue-600 dark:to-cyan-600 text-white border-transparent shadow-md'
                  : 'bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-750'
              }`}
            >
              Todas las Categorías
            </button>

            {categories.map((cat) => {
              const isSelected = filters.categoriaId === cat.id_categoria;
              return (
                <button
                  key={cat.id_categoria}
                  onClick={() => setFilters({ ...filters, categoriaId: isSelected ? null : cat.id_categoria })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-105 active:scale-95 ${
                    isSelected 
                      ? 'text-white shadow-md' 
                      : 'bg-slate-50/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                  style={{
                    backgroundColor: isSelected ? cat.color : undefined,
                    borderColor: isSelected ? cat.color : undefined
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full shadow-2xs" 
                    style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }} 
                  />
                  <span>{cat.nombre}</span>
                </button>
              );
            })}
          </div>

          {/* Date Picker Temporal Range Selector (Glassmorphic Container) */}
          <div className="pt-3 border-t border-slate-100/80 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/70 dark:from-slate-850/80 dark:via-blue-950/40 dark:to-slate-850/80 backdrop-blur-md p-3.5 rounded-2xl border border-blue-100/80 dark:border-blue-900/40 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0D47A1] dark:text-cyan-300">
                <CalendarRange className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Rango Temporal:</span>
              </div>

              {/* Date Inputs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
                  <span className="text-slate-400 text-[10px] font-bold">Desde:</span>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="bg-transparent text-slate-800 dark:text-slate-100 text-xs outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
                  <span className="text-slate-400 text-[10px] font-bold">Hasta:</span>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="bg-transparent text-slate-800 dark:text-slate-100 text-xs outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Quick Range Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase hidden sm:inline">Accesos:</span>
              <button
                onClick={() => handleApplyDatePreset('today')}
                className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/70 dark:border-slate-700/70 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                Hoy
              </button>
              <button
                onClick={() => handleApplyDatePreset('this_week')}
                className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/70 dark:border-slate-700/70 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                Esta Semana
              </button>
              <button
                onClick={() => handleApplyDatePreset('weekend')}
                className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/70 dark:border-slate-700/70 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                Fin de Semana
              </button>
              <button
                onClick={() => handleApplyDatePreset('this_month')}
                className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/70 dark:border-slate-700/70 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                Este Mes
              </button>
              <button
                onClick={() => handleApplyDatePreset('next_30')}
                className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/70 dark:border-slate-700/70 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                Próximos 30 Días
              </button>

              {(filters.startDate || filters.endDate) && (
                <button
                  onClick={() => handleApplyDatePreset('all')}
                  className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <X className="w-3 h-3" />
                  <span>Limpiar fechas</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Events Notification Notice */}
      {filters.onlySaved && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-amber-500/15 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl flex-shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Recordatorios Locales Activos para Eventos Guardados</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                El navegador enviará una alerta automática antes de que comiencen tus {savedEventIds.length} eventos favoritos de Purificación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Calendar Render (Glassmorphism & Luminous Animated Visuals) */}
      {viewMode === 'mes' ? (
        /* Month View Grid */
        <div className="bg-white/80 dark:bg-[#111d3d]/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl dark:shadow-[0_16px_45px_-10px_rgba(2,6,23,0.8)] overflow-hidden transition-all duration-300 relative">
          
          {/* Subtle Ambient Radial Lighting for Dark Mode */}
          <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-blue-600/10 dark:bg-blue-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-cyan-400/10 dark:bg-cyan-400/15 blur-3xl pointer-events-none" />

          {/* Days Header */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-blue-50/95 via-indigo-50/80 to-blue-50/95 dark:from-[#17264e] dark:via-[#1c3061] dark:to-[#17264e] border-b border-slate-200/80 dark:border-slate-700/80 text-center text-xs font-black tracking-widest text-[#0D47A1] dark:text-cyan-300 py-3.5 shadow-2xs relative z-10">
            <div>LUN</div>
            <div>MAR</div>
            <div>MIÉ</div>
            <div>JUE</div>
            <div>VIE</div>
            <div>SÁB</div>
            <div>DOM</div>
          </div>

          {/* Month Days Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100/80 dark:divide-slate-700/60 border-b border-slate-100 dark:border-slate-700/80 relative z-10">
            {calendarDays.map((cell, idx) => {
              if (!cell.dayNumber || !cell.dateStr) {
                return <div key={`empty-${idx}`} className="bg-slate-50/40 dark:bg-slate-950/40 min-h-[118px]" />;
              }

              const dayEvents = filteredEvents.filter(e => e.fecha === cell.dateStr);
              const isToday = cell.dateStr === '2026-08-11';
              const isSelected = selectedDay === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDay(cell.dateStr)}
                  className={`min-h-[118px] p-2.5 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group hover:scale-[1.01] hover:z-10 hover:shadow-lg ${
                    isToday
                      ? 'bg-gradient-to-br from-blue-50/90 to-cyan-50/60 dark:from-blue-950/60 dark:to-cyan-950/40 font-bold border-l-2 border-l-blue-500 dark:border-l-cyan-400'
                      : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/25 bg-transparent'
                  } ${
                    isSelected
                      ? 'ring-2 ring-inset ring-[#2196F3] dark:ring-cyan-400 bg-blue-100/60 dark:bg-blue-950/70 shadow-inner'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`text-xs font-black px-2 py-0.5 rounded-full transition-transform group-hover:scale-110 ${
                          isToday 
                            ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30' 
                            : isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-300'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {isToday && (
                        <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-300">
                          Hoy
                        </span>
                      )}
                    </div>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-extrabold text-blue-700 dark:text-cyan-300 bg-blue-100/90 dark:bg-cyan-950/80 px-1.5 py-0.5 rounded-full border border-blue-200/80 dark:border-cyan-800/60 shadow-2xs group-hover:scale-105 transition-transform">
                        {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
                      </span>
                    )}
                  </div>

                  {/* Day Event Chips */}
                  <div className="space-y-1 mt-1.5 flex-1 overflow-y-auto max-h-20 scrollbar-none">
                    {dayEvents.slice(0, 3).map((evt) => {
                      const cat = evt.categoria || categories[0];
                      return (
                        <div
                          key={evt.id_evento}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(evt);
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-white truncate shadow-xs cursor-pointer hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-1 border border-white/20 hover:shadow-md"
                          style={{ backgroundColor: cat?.color || '#3b82f6' }}
                          title={`${evt.nombre} (${evt.hora_inicio}) - ${evt.lugar}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 opacity-80" />
                          <span className="truncate">{evt.hora_inicio} {evt.nombre}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <p className="text-[9px] font-black text-blue-600 dark:text-cyan-300 pl-1">
                        +{dayEvents.length - 3} más...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Week View Grid */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3.5">
          {getWeekDays().map((dayCell) => {
            const dayEvents = filteredEvents.filter(e => e.fecha === dayCell.dateStr);
            const isToday = dayCell.dateStr === '2026-08-11';

            return (
              <div 
                key={dayCell.dateStr}
                className={`bg-white/80 dark:bg-[#0c152a]/75 backdrop-blur-xl rounded-3xl border p-4 shadow-md flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isToday 
                    ? 'border-cyan-400 dark:border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_20px_rgba(56,189,248,0.25)]' 
                    : 'border-slate-200/80 dark:border-blue-500/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100/80 dark:border-slate-800/80">
                    <div>
                      <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dayCell.dayName}</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{dayCell.dayNumber}</p>
                    </div>
                    {isToday && (
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        HOY
                      </span>
                    )}
                  </div>

                  {/* Day Events */}
                  <div className="space-y-2 mt-3.5">
                    {dayEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic py-3 text-center">
                        Sin eventos
                      </p>
                    ) : (
                      dayEvents.map((evt) => {
                        const cat = evt.categoria || categories[0];
                        return (
                          <div
                            key={evt.id_evento}
                            onClick={() => onSelectEvent(evt)}
                            className="p-3 rounded-2xl border border-slate-100/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-400/60 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-750 cursor-pointer transition-all text-xs shadow-2xs hover:shadow-md hover:scale-[1.02]"
                          >
                            <span 
                              className="inline-block px-1.5 py-0.2 text-[9px] font-black text-white rounded-md mb-1.5 shadow-2xs"
                              style={{ backgroundColor: cat?.color }}
                            >
                              {cat?.nombre}
                            </span>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{evt.nombre}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{evt.hora_inicio} hs &bull; {evt.lugar}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Day Event Drawer / List (Glassmorphism & Luminous Aura) */}
      {selectedDay && (
        <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/80 dark:from-[#0c152a]/95 dark:to-blue-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-blue-200/80 dark:border-cyan-500/30 shadow-2xl space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-[#0D47A1] dark:text-cyan-300 tracking-tight">
                Eventos para el {selectedDay}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Se encontraron {selectedDayEvents.length} actividad(es) agendada(s) para esta jornada
              </p>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="px-3.5 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300/80 dark:border-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              Cerrar fecha
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="p-8 text-center bg-white/80 dark:bg-slate-850/80 backdrop-blur-md rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm">
              <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">No hay eventos agendados para este día</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Explora otras fechas o cambia tus filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {selectedDayEvents.map(evt => (
                <EventCard
                  key={evt.id_evento}
                  evento={evt}
                  isSaved={savedEventIds.includes(evt.id_evento)}
                  onToggleSave={onToggleSave}
                  onSelectEvent={onSelectEvent}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
