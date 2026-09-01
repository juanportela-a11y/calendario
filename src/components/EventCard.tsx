import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bookmark, 
  BookmarkCheck, 
  Building2, 
  ArrowRight,
  Sparkles,
  Info
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      
      {/* Card Header & Badge */}
      <div>
        {/* Optional Event Image or Category Color Top Bar */}
        {evento.imagen_url ? (
          <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img 
              src={evento.imagen_url} 
              alt={evento.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            
            {/* Category Tag on Image */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md backdrop-blur-md" style={{ backgroundColor: cat.color }}>
              <span>{cat.nombre}</span>
            </div>

            {/* Featured Star Badge */}
            {evento.destacado && (
              <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>DESTACADO</span>
              </div>
            )}

            {/* Date Overlay Pill */}
            <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 shadow">
              <Calendar className="w-3.5 h-3.5 text-[#2196F3]" />
              <span>{evento.fecha}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 pb-0">
            <div className="flex items-center justify-between mb-2">
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: cat.color }}
              >
                {cat.nombre}
              </span>
              {evento.destacado && (
                <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Destacado
                </span>
              )}
            </div>
          </div>
        )}

        <div className="p-5 space-y-3">
          <h3 
            onClick={() => onSelectEvent(evento)}
            className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-[#2196F3] dark:group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {evento.nombre}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <span>{evento.hora_inicio} {evento.hora_fin ? `- ${evento.hora_fin}` : 'hs'}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <span className="line-clamp-1">{evento.lugar}</span>
            </div>

            {evento.organizador && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="line-clamp-1">{evento.organizador.nombre_entidad}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed pt-1">
            {evento.descripcion}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-5 pt-0 flex items-center justify-between gap-2">
        <button
          onClick={() => onToggleSave(evento.id_evento)}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            isSaved
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
              <Bookmark className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Guardar</span>
            </>
          )}
        </button>

        <button
          onClick={() => onSelectEvent(evento)}
          className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-[#2196F3] text-[#0D47A1] dark:text-blue-300 hover:text-white dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1 group/btn border border-blue-100 dark:border-blue-900/50"
        >
          <span>Ver Detalles</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
