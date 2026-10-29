import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bookmark, 
  BookmarkCheck, 
  Building2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Evento } from '../types';
import { EventoDomain } from '../domain/entities';

interface EventCardProps {
  evento: Evento;
  isSaved: boolean;
  onToggleSave: (idEvento: number) => void;
  onSelectEvent: (evento: Evento) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  evento,
  isSaved,
  onToggleSave,
  onSelectEvent
}) => {
  const cat = evento.categoria || EventoDomain.getCategoryMeta('cultura');

  // Format readable date
  const dateFormatted = React.useMemo(() => {
    try {
      const parts = evento.fecha.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
      }
    } catch {
      // fallback
    }
    return evento.fecha;
  }, [evento.fecha]);

  return (
    <div 
      className="bg-white dark:bg-[#111d3d] rounded-3xl border border-slate-200/90 dark:border-slate-700/80 hover:border-sky-500/80 dark:hover:border-sky-400/80 shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 overflow-hidden flex flex-col justify-between group transform hover:-translate-y-1.5"
    >
      {/* Top Media & Header */}
      <div>
        {evento.imagen_url ? (
          <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img 
              src={evento.imagen_url} 
              alt={evento.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/30" />
            
            {/* Category Tag on Image */}
            <div 
              className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black text-white shadow-lg backdrop-blur-md" 
              style={{ backgroundColor: cat.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>{cat.nombre}</span>
            </div>

            {/* Featured Star Badge */}
            {evento.destacado && (
              <div className="absolute top-3.5 right-3.5 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>DESTACADO</span>
              </div>
            )}

            {/* Date Overlay Pill */}
            <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 shadow-md border border-white/20">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{dateFormatted}</span>
            </div>
          </div>
        ) : (
          <div className="p-5 pb-0">
            <div className="flex items-center justify-between mb-2">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-white shadow-xs"
                style={{ backgroundColor: cat.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {cat.nombre}
              </span>
              {evento.destacado && (
                <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-500" />
                  DESTACADO
                </span>
              )}
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-3.5">
          <h3 
            onClick={() => onSelectEvent(evento)}
            className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {evento.nombre}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span>{evento.hora_inicio} {evento.hora_fin ? `- ${evento.hora_fin}` : 'hs'}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
              <span className="line-clamp-1 text-slate-700 dark:text-slate-300">{evento.lugar}</span>
            </div>

            {evento.organizador && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="line-clamp-1">{evento.organizador.nombre_entidad}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-200 line-clamp-2 leading-relaxed pt-1 font-medium">
            {evento.descripcion}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 sm:px-6 pb-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
        <button
          onClick={() => onToggleSave(evento.id_evento)}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border ${
            isSaved
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
              : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title={isSaved ? 'Evento guardado en mis favoritos' : 'Guardar evento'}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
              <span>Guardado</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              <span>Guardar</span>
            </>
          )}
        </button>

        <button
          onClick={() => onSelectEvent(evento)}
          className="px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 dark:hover:text-slate-950 text-sky-900 dark:text-sky-300 text-xs font-black transition-all flex items-center gap-1.5 group/btn border border-sky-200/80 dark:border-sky-800/60 cursor-pointer shadow-2xs active:scale-95"
        >
          <span>Ver Ficha</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
