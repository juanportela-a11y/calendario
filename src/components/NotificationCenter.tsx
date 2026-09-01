import React, { useState } from 'react';
import { 
  Bell, 
  BellRing,
  BellOff,
  CheckCheck, 
  Calendar, 
  ShieldAlert, 
  Info, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  BookmarkCheck,
  ChevronRight,
  Send
} from 'lucide-react';
import { Evento, Notificacion } from '../types';
import { getEventDateDetails } from '../utils/savedEventNotificationService';

interface NotificationCenterProps {
  notifications: Notificacion[];
  savedEvents?: Evento[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onNavigateToTab?: (tab: string) => void;
  onSelectEvent?: (evento: Evento) => void;
  notificationService?: {
    isSupported: boolean;
    permission: NotificationPermission | 'unsupported';
    isEnabled: boolean;
    upcomingEvents: Evento[];
    requestPermission: () => Promise<boolean>;
    toggleEnabled: (enabled: boolean) => void;
    triggerTest: (evento: Evento) => boolean;
  };
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  savedEvents = [],
  onMarkRead,
  onMarkAllRead,
  onNavigateToTab,
  onSelectEvent,
  notificationService
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'urgent' | 'events'>('all');
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.leida).length;

  const isGranted = notificationService?.permission === 'granted';
  const isSupported = notificationService?.isSupported ?? true;
  const isEnabled = notificationService?.isEnabled ?? true;

  const handleRequestPermission = async () => {
    if (!notificationService) return;
    const granted = await notificationService.requestPermission();
    if (granted) {
      setTestNotificationFeedback('¡Permiso concedido! Las alertas de eventos guardados están activadas.');
    } else {
      setTestNotificationFeedback('No se pudo activar el permiso. Revisa la configuración de notificaciones de tu navegador.');
    }
    setTimeout(() => setTestNotificationFeedback(null), 6000);
  };

  const handleRunTest = (evento?: Evento) => {
    const targetEvent: Evento = evento || (savedEvents.length > 0 ? savedEvents[0] : {
      id_evento: 9999,
      nombre: 'Festival Folclórico y Cultural del Río Magdalena',
      titulo: 'Festival Folclórico y Cultural del Río Magdalena',
      descripcion: 'Encuentro de danzas ribereñas, comparsas y reinado municipal.',
      fecha: 'Hoy',
      fecha_inicio: new Date().toISOString().slice(0, 10),
      hora_inicio: '18:00',
      lugar: 'Malecón Turístico del Río Magdalena',
      categoria: {
        id_categoria: 1,
        nombre: 'Cultura y Patrimonio',
        color: '#0D47A1',
        icono: '🎭',
        descripcion: 'Eventos culturales'
      },
      id_categoria: 1,
      id_organizador: 1,
      organizador: {
        id_organizador: 1,
        nombre_entidad: 'Alcaldía de Purificación',
        correo_contacto: 'contacto@purificacion-tolima.gov.co',
        telefono_contacto: '3120000000',
        tipo: 'publica'
      },
      destacado: true
    });

    if (notificationService) {
      const ok = notificationService.triggerTest(targetEvent);
      if (ok) {
        setTestNotificationFeedback(`🔔 Alerta de prueba enviada para "${targetEvent.nombre}". ¡Revisa la bandeja de notificaciones de tu sistema!`);
      } else {
        setTestNotificationFeedback('Las notificaciones no están soportadas en esta vista.');
      }
    }
    setTimeout(() => setTestNotificationFeedback(null), 6000);
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'unread') return !n.leida;
    if (filterType === 'urgent') return n.tipo_ref === 'aviso';
    if (filterType === 'events') return n.tipo_ref === 'evento';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Main Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/70 text-[#0D47A1] dark:text-blue-300 rounded-2xl relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Centro de Notificaciones y Alertas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Avisos urgentes de la Alcaldía y recordatorios locales de eventos guardados
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0D47A1] dark:text-blue-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-blue-200 dark:border-blue-800"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Marcar todas como leídas</span>
          </button>
        )}
      </div>

      {/* Local Browser Notification Settings & Upcoming Saved Events Box */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-blue-700/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md flex-shrink-0">
              {isGranted ? (
                <BellRing className="w-6 h-6 text-amber-300 animate-pulse" />
              ) : (
                <BellOff className="w-6 h-6 text-slate-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold tracking-tight">
                  Alertas del Navegador para Eventos Guardados
                </h3>
                {isGranted ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ACTIVAS
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    PENDIENTE DE ACTIVACIÓN
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
                Utiliza la API de notificaciones nativa del navegador para recibir avisos automáticos cuando tus eventos guardados estén próximos a comenzar en Purificación.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            {!isGranted ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95"
              >
                <BellRing className="w-4 h-4" />
                <span>Activar Alertas Locales</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleRunTest()}
                className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 whitespace-nowrap active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Probar Notificación</span>
              </button>
            )}

            {isGranted && notificationService && (
              <label className="flex items-center gap-2 cursor-pointer bg-white/10 px-3 py-2 rounded-xl border border-white/15 text-xs font-bold select-none">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => notificationService.toggleEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Auto-avisos</span>
              </label>
            )}
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {testNotificationFeedback && (
          <div className="p-3 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>{testNotificationFeedback}</span>
          </div>
        )}

        {/* Upcoming Saved Events Carousel / List */}
        {savedEvents.length > 0 && (
          <div className="pt-3 border-t border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-200">
              <span className="flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-amber-400" />
                Tus Eventos Guardados ({savedEvents.length}):
              </span>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('calendario')}
                  className="text-blue-300 hover:text-white flex items-center gap-0.5 font-bold transition-colors"
                >
                  <span>Ver en Calendario</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {savedEvents.slice(0, 4).map((evt) => {
                const details = getEventDateDetails(evt);
                return (
                  <div
                    key={evt.id_evento}
                    className="p-3 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/10 transition-all flex items-center justify-between gap-3 text-left group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {details.isToday && (
                          <span className="px-2 py-0.2 rounded-md bg-red-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                            ¡Hoy!
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-white truncate">
                          {evt.nombre}
                        </h4>
                      </div>
                      <p className="text-[11px] text-blue-200 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-300 flex-shrink-0" />
                        <span>{evt.lugar}</span>
                        <span>&bull;</span>
                        <Clock className="w-3 h-3 text-amber-300 flex-shrink-0" />
                        <span>{evt.hora_inicio}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRunTest(evt)}
                      title="Probar notificación para este evento"
                      className="p-2 rounded-xl bg-white/15 hover:bg-amber-400 hover:text-slate-950 text-white transition-colors flex-shrink-0"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            filterType === 'all'
              ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Todas ({notifications.length})
        </button>

        <button
          onClick={() => setFilterType('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            filterType === 'unread'
              ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          No leídas ({unreadCount})
        </button>

        <button
          onClick={() => setFilterType('urgent')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            filterType === 'urgent'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Avisos Urgentes
        </button>

        <button
          onClick={() => setFilterType('events')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            filterType === 'events'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Eventos Culturales
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No tienes notificaciones en este filtro
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Los avisos emitidos por la administración municipal y tus recordatorios cívicos aparecerán aquí.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id_notificacion}
              onClick={() => !notif.leida && onMarkRead(notif.id_notificacion)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !notif.leida
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-85'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  notif.tipo_ref === 'aviso'
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                    : 'bg-blue-100 dark:bg-blue-950/70 text-[#0D47A1] dark:text-blue-300'
                }`}>
                  {notif.tipo_ref === 'aviso' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <Calendar className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {notif.titulo}
                    </h4>
                    {!notif.leida && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {notif.mensaje}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{notif.fecha}</span>
                  </p>
                </div>
              </div>

              {!notif.leida && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(notif.id_notificacion);
                  }}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs whitespace-nowrap"
                >
                  Marcar leída
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
