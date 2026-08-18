import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Info, 
  Phone, 
  Mail,
  Download,
  Check
} from 'lucide-react';
import { Evento } from '../types';
import { EventoDomain } from '../domain/entities';

interface EventDetailModalProps {
  evento: Evento | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (idEvento: number) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  evento,
  onClose,
  isSaved,
  onToggleSave
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!evento) return null;

  const cat = evento.categoria || EventoDomain.getCategoryMeta('cultura');

  const handleCopyShare = () => {
    const text = `🎉 Evento en Purificación, Tolima: ${evento.nombre}\n📅 Fecha: ${evento.fecha}\n⏰ Hora: ${evento.hora_inicio}\n📍 Lugar: ${evento.lugar}\n\nConsulta más en PurifiCalendario`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PurifiCalendario//Purificacion Tolima//ES
BEGIN:VEVENT
SUMMARY:${evento.nombre}
DESCRIPTION:${evento.descripcion} - Organizador: ${evento.organizador?.nombre_entidad || 'Purificacion Tolima'}
LOCATION:${evento.lugar}
DTSTART:${evento.fecha.replace(/-/g, '')}T${evento.hora_inicio.replace(':', '')}00
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${evento.nombre.toLowerCase().replace(/ /g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image or Color Banner */}
        <div className="relative h-56 w-full bg-gradient-to-r from-[#0D47A1] to-[#2196F3] overflow-hidden flex-shrink-0">
          {evento.imagen_url && (
            <img 
              src={evento.imagen_url} 
              alt={evento.nombre} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-black/30" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Tag */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md backdrop-blur-md" style={{ backgroundColor: cat.color }}>
            {cat.nombre}
          </div>

          {/* Title on Image */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <p className="text-xs font-medium text-blue-200 uppercase tracking-wider mb-1">
              {EventoDomain.formatFechaCompleta(evento.fecha)}
            </p>
            <h2 className="text-2xl font-black leading-tight drop-shadow-md">
              {evento.nombre}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Date, Time & Location Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-100 text-[#0D47A1] rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Horario</p>
                <p className="text-sm font-bold text-slate-800">
                  {evento.hora_inicio} {evento.hora_fin ? `a ${evento.hora_fin}` : 'hs'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Lugar / Dirección</p>
                <p className="text-sm font-bold text-slate-800">
                  {evento.lugar}
                </p>
              </div>
            </div>
          </div>

          {/* Organizer Box */}
          {evento.organizador && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Entidad Organizadora</p>
                    {evento.organizador.verificado && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{evento.organizador.nombre_entidad}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {evento.organizador.contacto_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {evento.organizador.contacto_telefono}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-[#0D47A1]">
              Descripción del Evento
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {evento.descripcion}
            </p>
          </div>

          {/* Additional Information / Recommedations */}
          {evento.info_adicional && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Información Adicional e Instrucciones</span>
              </div>
              <p className="leading-relaxed pl-5 text-slate-700">
                {evento.info_adicional}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onToggleSave(evento.id_evento)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              isSaved
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-600" />
                <span>Guardado en Mis Eventos</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-slate-600" />
                <span>Guardar Evento de Interés</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Compartir</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadIcs}
              className="px-4 py-2.5 rounded-xl bg-[#2196F3] hover:bg-[#0D47A1] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Añadir a mi Calendario (.ics)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
