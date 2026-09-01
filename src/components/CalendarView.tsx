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
      
      {/* Header Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Top Controls: Title, Year Switcher, View Switcher & Month Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#2196F3]/10 dark:bg-blue-950/60 text-[#0D47A1] dark:text-blue-400 rounded-2xl">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="flex items-center gap-1.5 text-xl font-black text-slate-900 dark:text-white hover:text-[#2196F3] dark:hover:text-blue-400 transition-colors group"
                >
                  <span>{monthNames[month]}</span>
                  <span className="text-[#2196F3] dark:text-blue-400">{year}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-[#2196F3] transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Quick Month Dropdown Menu */}
                {showMonthDropdown && (
                  <div className="absolute top-full left-0 mt-2 z-30 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-72 animate-fade-in">
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
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {availableYears.map(y => (
                <button
                  key={y}
                  onClick={() => handleSelectYear(y)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    year === y
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            {/* Today Button */}
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
            >
              Hoy
            </button>

            {/* Prev/Next Controls */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Switcher: Mes / Semana */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('mes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'mes'
                    ? 'bg-[#2196F3] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Mes</span>
              </button>

              <button
                onClick={() => setViewMode('semana')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'semana'
                    ? 'bg-[#2196F3] text-white shadow-sm'
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
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-[#2196F3]" />
              <span>Menú de Meses del Año ({year})</span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Haz clic en cualquier mes para navegar al instante
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
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                    isCurrent
                      ? 'bg-[#0D47A1] dark:bg-blue-600 text-white shadow-md ring-2 ring-blue-400 dark:ring-blue-300 scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-750'
                  }`}
                  title={`${mName} ${year} - ${count} evento(s)`}
                >
                  <span className="hidden sm:inline text-[11px] font-extrabold">{monthShortNames[idx]}</span>
                  <span className="sm:hidden text-[11px] font-extrabold">{monthShortNames[idx]}</span>
                  
                  {count > 0 ? (
                    <span 
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-black mt-0.5 ${
                        isCurrent
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
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
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Buscar por evento o lugar..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-750 focus:border-[#2196F3] focus:outline-none transition-all"
              />
            </div>

            {/* Preference Toggles */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilters({ ...filters, onlyPreferences: !filters.onlyPreferences })}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  filters.onlyPreferences
                    ? 'bg-blue-100 dark:bg-blue-950/70 text-[#0D47A1] dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2196F3]" />
                <span>Mis Categorías Preferidas</span>
              </button>

              <button
                onClick={() => setFilters({ ...filters, onlySaved: !filters.onlySaved })}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  filters.onlySaved
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Eventos Guardados ({savedEventIds.length})</span>
              </button>
            </div>
          </div>

          {/* Category Color Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
            <button
              onClick={() => setFilters({ ...filters, categoriaId: null })}
              className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border ${
                filters.categoriaId === null
                  ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
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
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected 
                      ? 'text-white shadow' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                  }`}
                  style={{
                    backgroundColor: isSelected ? cat.color : undefined,
                    borderColor: isSelected ? cat.color : undefined
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }} 
                  />
                  <span>{cat.nombre}</span>
                </button>
              );
            })}
          </div>

          {/* Date Picker Temporal Range Selector */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-blue-50/40 dark:bg-slate-800/40 p-3 rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0D47A1] dark:text-blue-300">
                <CalendarRange className="w-4 h-4 text-blue-600" />
                <span>Rango Temporal:</span>
              </div>

              {/* Date Inputs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 text-[10px] font-bold">Desde:</span>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="bg-transparent text-slate-800 dark:text-slate-100 text-xs outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
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
              <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">Accesos rápidos:</span>
              <button
                onClick={() => handleApplyDatePreset('today')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Hoy
              </button>
              <button
                onClick={() => handleApplyDatePreset('this_week')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Esta Semana
              </button>
              <button
                onClick={() => handleApplyDatePreset('weekend')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Fin de Semana
              </button>
              <button
                onClick={() => handleApplyDatePreset('this_month')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Este Mes
              </button>
              <button
                onClick={() => handleApplyDatePreset('next_30')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Próximos 30 Días
              </button>

              {(filters.startDate || filters.endDate) && (
                <button
                  onClick={() => handleApplyDatePreset('all')}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all cursor-pointer flex items-center gap-1"
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

      {/* Main Calendar Render */}
      {viewMode === 'mes' ? (
        /* Month View Grid */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-blue-50/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-extrabold text-[#0D47A1] dark:text-blue-400 py-3">
            <div>LUN</div>
            <div>MAR</div>
            <div>MIÉ</div>
            <div>JUE</div>
            <div>VIE</div>
            <div>SÁB</div>
            <div>DOM</div>
          </div>

          {/* Month Days Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
            {calendarDays.map((cell, idx) => {
              if (!cell.dayNumber || !cell.dateStr) {
                return <div key={`empty-${idx}`} className="bg-slate-50/50 dark:bg-slate-950/40 min-h-[110px]" />;
              }

              const dayEvents = filteredEvents.filter(e => e.fecha === cell.dateStr);
              const isToday = cell.dateStr === '2026-08-11';
              const isSelected = selectedDay === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDay(cell.dateStr)}
                  className={`min-h-[110px] p-2 transition-all cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/30 relative flex flex-col justify-between ${
                    isToday ? 'bg-blue-50/60 dark:bg-blue-950/40 font-bold' : 'dark:bg-slate-900'
                  } ${isSelected ? 'ring-2 ring-inset ring-[#2196F3] bg-blue-50/80 dark:bg-blue-950/60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        isToday 
                          ? 'bg-[#2196F3] text-white shadow-sm' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-1.5 py-0.2 rounded-full border border-blue-200 dark:border-blue-800/60">
                        {dayEvents.length} {dayEvents.length === 1 ? 'evt' : 'evts'}
                      </span>
                    )}
                  </div>

                  {/* Day Event Chips */}
                  <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-20">
                    {dayEvents.slice(0, 3).map((evt) => {
                      const cat = evt.categoria || categories[0];
                      return (
                        <div
                          key={evt.id_evento}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(evt);
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white truncate shadow-xs cursor-pointer hover:opacity-90"
                          style={{ backgroundColor: cat?.color || '#3b82f6' }}
                          title={`${evt.nombre} (${evt.hora_inicio})`}
                        >
                          {evt.hora_inicio} {evt.nombre}
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 pl-1">
                        +{dayEvents.length - 3} más
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
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {getWeekDays().map((dayCell) => {
            const dayEvents = filteredEvents.filter(e => e.fecha === dayCell.dateStr);
            const isToday = dayCell.dateStr === '2026-08-11';

            return (
              <div 
                key={dayCell.dateStr}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-sm flex flex-col justify-between ${
                  isToday 
                    ? 'border-[#2196F3] dark:border-blue-500 ring-1 ring-[#2196F3]' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{dayCell.dayName}</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{dayCell.dayNumber}</p>
                    </div>
                    {isToday && (
                      <span className="bg-[#2196F3] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        HOY
                      </span>
                    )}
                  </div>

                  {/* Day Events */}
                  <div className="space-y-2 mt-3">
                    {dayEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 text-center">
                        Sin eventos
                      </p>
                    ) : (
                      dayEvents.map((evt) => {
                        const cat = evt.categoria || categories[0];
                        return (
                          <div
                            key={evt.id_evento}
                            onClick={() => onSelectEvent(evt)}
                            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-slate-750 cursor-pointer transition-all text-xs"
                          >
                            <span 
                              className="inline-block px-1.5 py-0.2 text-[9px] font-bold text-white rounded mb-1"
                              style={{ backgroundColor: cat?.color }}
                            >
                              {cat?.nombre}
                            </span>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-2">{evt.nombre}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{evt.hora_inicio} hs - {evt.lugar}</p>
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

      {/* Selected Day Event Drawer / List */}
      {selectedDay && (
        <div className="bg-blue-50/80 dark:bg-slate-900/90 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#0D47A1] dark:text-blue-300">
                Eventos para el {selectedDay}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Se encontraron {selectedDayEvents.length} eventos en esta fecha
              </p>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700"
            >
              Cerrar fecha
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-850 rounded-xl border border-blue-100 dark:border-slate-800">
              <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No hay eventos agendados para este día</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Explora otras fechas o cambia tus filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
