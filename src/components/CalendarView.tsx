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
  CalendarRange
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

  const [filters, setFilters] = useState<EventFilterState>({
    searchQuery: '',
    categoriaId: null,
    onlyPreferences: false,
    onlySaved: false
  });

  // Month navigation helpers
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

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
    return true;
  });

  // Generate Month Matrix
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Top Controls: Title, View Switcher & Month Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#2196F3]/10 text-[#0D47A1] rounded-2xl">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {monthNames[month]} {year}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Consulta los eventos programados en Purificación, Tolima
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Today Button */}
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Hoy
            </button>

            {/* Prev/Next Controls */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Switcher: Mes / Semana */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('mes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'mes'
                    ? 'bg-[#2196F3] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Semana</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar: Search & Category Chips */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Buscar por evento o lugar..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2196F3] focus:outline-none transition-all"
              />
            </div>

            {/* Preference Toggles */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilters({ ...filters, onlyPreferences: !filters.onlyPreferences })}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  filters.onlyPreferences
                    ? 'bg-blue-100 text-[#0D47A1] border-blue-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2196F3]" />
                <span>Mis Categorías Preferidas</span>
              </button>

              <button
                onClick={() => setFilters({ ...filters, onlySaved: !filters.onlySaved })}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  filters.onlySaved
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-600" />
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
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
                    isSelected ? 'text-white shadow' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? cat.color : undefined,
                    borderColor: isSelected ? cat.color : '#e2e8f0'
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
        </div>
      </div>

      {/* Main Calendar Render */}
      {viewMode === 'mes' ? (
        /* Month View Grid */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-blue-50/70 border-b border-slate-200 text-center text-xs font-extrabold text-[#0D47A1] py-3">
            <div>LUN</div>
            <div>MAR</div>
            <div>MIÉ</div>
            <div>JUE</div>
            <div>VIE</div>
            <div>SÁB</div>
            <div>DOM</div>
          </div>

          {/* Month Days Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarDays.map((cell, idx) => {
              if (!cell.dayNumber || !cell.dateStr) {
                return <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[110px]" />;
              }

              const dayEvents = filteredEvents.filter(e => e.fecha === cell.dateStr);
              const isToday = cell.dateStr === '2026-08-11';
              const isSelected = selectedDay === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDay(cell.dateStr)}
                  className={`min-h-[110px] p-2 transition-all cursor-pointer hover:bg-blue-50/40 relative flex flex-col justify-between ${
                    isToday ? 'bg-blue-50/60 font-bold' : ''
                  } ${isSelected ? 'ring-2 ring-inset ring-[#2196F3] bg-blue-50/80' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        isToday 
                          ? 'bg-[#2196F3] text-white shadow-sm' 
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
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
                      <p className="text-[9px] font-bold text-slate-500 pl-1">
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
                className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between ${
                  isToday ? 'border-[#2196F3] ring-1 ring-[#2196F3]' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">{dayCell.dayName}</p>
                      <p className="text-lg font-black text-slate-900">{dayCell.dayNumber}</p>
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
                      <p className="text-xs text-slate-400 italic py-2 text-center">
                        Sin eventos
                      </p>
                    ) : (
                      dayEvents.map((evt) => {
                        const cat = evt.categoria || categories[0];
                        return (
                          <div
                            key={evt.id_evento}
                            onClick={() => onSelectEvent(evt)}
                            className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition-all text-xs"
                          >
                            <span 
                              className="inline-block px-1.5 py-0.2 text-[9px] font-bold text-white rounded mb-1"
                              style={{ backgroundColor: cat?.color }}
                            >
                              {cat?.nombre}
                            </span>
                            <p className="font-bold text-slate-900 line-clamp-2">{evt.nombre}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{evt.hora_inicio} hs - {evt.lugar}</p>
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
        <div className="bg-blue-50/80 rounded-2xl p-6 border border-blue-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#0D47A1]">
                Eventos para el {selectedDay}
              </h3>
              <p className="text-xs text-slate-600">
                Se encontraron {selectedDayEvents.length} eventos en esta fecha
              </p>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300"
            >
              Cerrar fecha
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-blue-100">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No hay eventos agendados para este día</p>
              <p className="text-xs text-slate-500 mt-1">Explora otras fechas o cambia tus filtros de búsqueda.</p>
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
