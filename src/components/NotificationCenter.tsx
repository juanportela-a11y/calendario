import React from 'react';
import { Bell, CheckCheck, Calendar, ShieldAlert, Info, Clock } from 'lucide-react';
import { Notificacion } from '../types';

interface NotificationCenterProps {
  notifications: Notificacion[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead
}) => {
  const unreadCount = notifications.filter(n => !n.leida).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/70 text-[#0D47A1] dark:text-blue-300 rounded-2xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Centro de Notificaciones
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Avisos personalizados según tus categorías preferidas de Purificación
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

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tienes notificaciones pendientes</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Las novedades sobre eventos y avisos urgentes aparecerán aquí.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id_notificacion}
              onClick={() => !notif.leida && onMarkRead(notif.id_notificacion)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !notif.leida
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
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
