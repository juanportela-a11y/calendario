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
  Check,
  CalendarPlus,
  ExternalLink,
  Bell,
  BellRing
} from 'lucide-react';
import { Evento } from '../types';
import { EventoDomain } from '../domain/entities';
import { downloadICSFile, getGoogleCalendarUrl } from '../utils/calendarSyncUtils';
import { shareViaWhatsApp, requestPushNotificationPermission } from '../utils/notificationUtils';
import { triggerInstantSavedEventNotification } from '../utils/savedEventNotificationService';

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

  const handleWhatsAppShare = () => {
    shareViaWhatsApp(
      `Evento: ${evento.nombre}`,
      `Fecha: ${evento.fecha} (${evento.hora_inicio})\nLugar: ${evento.lugar}\n${evento.descripcion}`,
      evento.lugar
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col"
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-black/40" />

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
            <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-md">
              {evento.nombre}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Quick Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#0D47A1] dark:text-blue-300">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Fecha</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {evento.fecha}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Hora de Inicio</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {evento.hora_inicio} {evento.hora_fin ? `- ${evento.hora_fin}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:col-span-2">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Ubicación</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {evento.lugar}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Descripción del Evento
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {evento.descripcion}
            </p>
          </div>

          {/* Additional Info / Registration */}
          {evento.info_adicional && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#0D47A1] dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                <span className="font-bold block mb-1">Información Adicional o Requisitos:</span>
                {evento.info_adicional}
              </div>
            </div>
          )}

          {/* Organizer Details */}
          {evento.organizador && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Organizado Por
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {evento.organizador.nombre_entidad}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Entidad Promotora Oficial
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  {evento.organizador.contacto_telefono && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evento.organizador.contacto_telefono}</span>
                    </div>
                  )}
                  {evento.organizador.contacto_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[140px]">{evento.organizador.contacto_email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Local Browser Notification & Saved Event Reminder Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-[#0D47A1] text-white rounded-xl flex-shrink-0">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Alerta Local de Inicio de Evento
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {isSaved
                    ? 'Este evento está en tus guardados. Recibirás una notificación automática en tu navegador antes de iniciar.'
                    : 'Guarda este evento para recibir alertas del navegador cuando esté próximo a comenzar.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                const granted = await requestPushNotificationPermission();
                if (granted) {
                  triggerInstantSavedEventNotification(evento);
                }
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0D47A1] dark:text-blue-300 border border-blue-200 dark:border-blue-700 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Probar Alerta</span>
            </button>
          </div>

          {/* Calendar Sync & Export Integrations */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CalendarPlus className="w-4 h-4 text-[#0D47A1] dark:text-blue-400" />
              <span>Sincronizar con tu Calendario Personal</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={getGoogleCalendarUrl(evento)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>📅 Añadir a Google Calendar</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <button
                onClick={() => downloadICSFile(evento)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Descargar Apple / Outlook (.ics)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 rounded-b-3xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(evento.id_evento)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isSaved
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 fill-slate-950" />
                  <span>Guardado</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Guardar Evento</span>
                </>
              )}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyShare}
              className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-md"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
