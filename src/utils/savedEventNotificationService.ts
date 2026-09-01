import { useEffect, useState, useCallback } from 'react';
import { Evento } from '../types';
import { triggerLocalPush } from './notificationUtils';

const STORAGE_KEY_ENABLED = 'purifi_saved_events_notif_enabled';
const STORAGE_KEY_NOTIFIED_PREFIX = 'purifi_notif_evt_';

export interface NotificationStatus {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isEnabled: boolean;
}

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function isSavedEventsNotificationEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(STORAGE_KEY_ENABLED);
  return val === null ? true : val === 'true';
}

export function setSavedEventsNotificationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
}

/**
 * Normaliza y parsea la fecha y hora de un evento para calcular el tiempo restante en milisegundos.
 */
export function getEventDateDetails(evento: Evento): {
  eventDate: Date;
  isToday: boolean;
  isTomorrow: boolean;
  hoursDiff: number;
  hasPassed: boolean;
} {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  // Parse date string (YYYY-MM-DD)
  const eventDateRaw = evento.fecha || (evento as any).fecha_inicio || todayStr;
  const dateParts = eventDateRaw.split('-');
  const year = parseInt(dateParts[0], 10) || now.getFullYear();
  const month = (parseInt(dateParts[1], 10) || (now.getMonth() + 1)) - 1;
  const day = parseInt(dateParts[2], 10) || now.getDate();

  // Parse time (HH:MM or 12h format)
  let hour = 10;
  let minute = 0;
  if (evento.hora_inicio) {
    const timeMatch = evento.hora_inicio.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
      const meridian = timeMatch[3]?.toUpperCase();
      if (meridian === 'PM' && hour < 12) hour += 12;
      if (meridian === 'AM' && hour === 12) hour = 0;
    }
  }

  const eventDate = new Date(year, month, day, hour, minute);
  const diffMs = eventDate.getTime() - now.getTime();
  const hoursDiff = diffMs / (1000 * 60 * 60);

  const eventDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  return {
    eventDate,
    isToday: eventDateStr === todayStr,
    isTomorrow: eventDateStr === tomorrowStr,
    hoursDiff,
    hasPassed: diffMs < -(1000 * 60 * 60 * 2) // considerado pasado después de 2 horas de haber empezado
  };
}

/**
 * Evalúa los eventos guardados y dispara notificaciones locales para aquellos próximos a comenzar.
 */
export function checkUpcomingSavedEvents(
  savedEvents: Evento[],
  userId: number | string = 'guest'
): { notifiedCount: number; upcomingEvents: Evento[] } {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    return { notifiedCount: 0, upcomingEvents: [] };
  }

  if (!isSavedEventsNotificationEnabled()) {
    return { notifiedCount: 0, upcomingEvents: [] };
  }

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  let notifiedCount = 0;
  const upcomingEvents: Evento[] = [];

  savedEvents.forEach((evento) => {
    const details = getEventDateDetails(evento);

    // Consideramos próximo si es hoy (y no ha terminado) o si es en las próximas 24 horas
    const isUpcoming = (details.isToday && !details.hasPassed) || (details.hoursDiff > 0 && details.hoursDiff <= 24);

    if (isUpcoming) {
      upcomingEvents.push(evento);

      const notificationKey = `${STORAGE_KEY_NOTIFIED_PREFIX}${userId}_${evento.id_evento}_${todayKey}`;
      const alreadyNotified = localStorage.getItem(notificationKey);

      if (!alreadyNotified) {
        const eventTitle = evento.nombre || (evento as any).titulo || 'Evento en Purificación';
        let title = `🎉 ¡Recordatorio: ${eventTitle}!`;
        let body = '';

        if (details.isToday) {
          body = `📍 Lugar: ${evento.lugar} • ⏰ Hoy a las ${evento.hora_inicio || 'la hora indicada'}. ¡Tu evento guardado está por comenzar!`;
        } else {
          body = `📍 Lugar: ${evento.lugar} • ⏰ Mañana a las ${evento.hora_inicio || 'la hora indicada'}. ¡Prepárate para asistir en Purificación!`;
        }

        triggerLocalPush(title, body, `saved-event-${evento.id_evento}`, {
          url: '/?tab=calendario',
          eventId: evento.id_evento
        });

        localStorage.setItem(notificationKey, 'true');
        notifiedCount++;
      }
    }
  });

  return { notifiedCount, upcomingEvents };
}

/**
 * Dispara una alerta de prueba inmediata para un evento guardado.
 */
export function triggerInstantSavedEventNotification(evento: Evento): boolean {
  if (!isBrowserNotificationSupported()) return false;

  const eventTitle = evento.nombre || (evento as any).titulo || 'Evento en Purificación';
  const eventDateStr = evento.fecha || (evento as any).fecha_inicio || '';
  const title = `🔔 Recordatorio Cívico: ${eventTitle}`;
  const body = `📍 ${evento.lugar} • ⏰ ${evento.hora_inicio}${eventDateStr ? ` (${eventDateStr})` : ''}. Tu alerta de PurifiCalendario está activa en este dispositivo.`;

  triggerLocalPush(title, body, `test-saved-event-${evento.id_evento}`, {
    url: '/?tab=calendario',
    eventId: evento.id_evento
  });

  return true;
}

/**
 * Hook de React para monitorear eventos guardados y gestionar permisos de notificación del navegador.
 */
export function useUpcomingEventNotifier(
  savedEvents: Evento[],
  userId?: number
) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getBrowserNotificationPermission()
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(isSavedEventsNotificationEnabled());
  const [upcomingEvents, setUpcomingEvents] = useState<Evento[]>([]);

  // Sincronizar estado de permisos
  const refreshPermission = useCallback(() => {
    setPermission(getBrowserNotificationPermission());
    setIsEnabled(isSavedEventsNotificationEnabled());
  }, []);

  // Solicitar permiso al usuario
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isBrowserNotificationSupported()) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setIsEnabled(true);
        setSavedEventsNotificationEnabled(true);
        // Disparar mensaje de bienvenida / confirmación
        triggerLocalPush(
          '🔔 Notificaciones de PurifiCalendario Activas',
          'Recibirás recordatorios automáticos cuando tus eventos guardados de Purificación estén próximos a iniciar.',
          'welcome-notif'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al solicitar permisos de notificación:', err);
      return false;
    }
  }, []);

  const toggleEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    setSavedEventsNotificationEnabled(enabled);
  }, []);

  // Verificar eventos próximos al cargar y periódicamente
  useEffect(() => {
    if (savedEvents.length === 0) {
      setUpcomingEvents([]);
      return;
    }

    const runCheck = () => {
      const { upcomingEvents: upcoming } = checkUpcomingSavedEvents(savedEvents, userId || 'guest');
      setUpcomingEvents(upcoming);
    };

    // Ejecutar chequeo inicial
    runCheck();

    // Re-evaluar cada 3 minutos
    const interval = setInterval(runCheck, 180000);
    return () => clearInterval(interval);
  }, [savedEvents, userId]);

  return {
    isSupported: isBrowserNotificationSupported(),
    permission,
    isEnabled,
    upcomingEvents,
    refreshPermission,
    requestPermission,
    toggleEnabled,
    triggerTest: triggerInstantSavedEventNotification
  };
}
