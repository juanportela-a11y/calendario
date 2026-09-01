import { Aviso, CorteProgramado, JornadaSaludEsterilizacion, ReporteVia } from '../types';

export interface PushNotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function generateWhatsAppAlertUrl(titulo: string, descripcion: string, sector: string, telefonoDestino: string = ''): string {
  const text = `🚨 *ALERTA OFICIAL - ALCALDÍA DE PURIFICACIÓN, TOLIMA* 🚨\n\n📌 *Asunto:* ${titulo}\n📍 *Sector Afectado:* ${sector}\nℹ️ *Detalles:* ${descripcion}\n\n📲 Consulta más información en tiempo real en la plataforma *PurifiCalendario*.`;
  const encodedText = encodeURIComponent(text);
  if (telefonoDestino.trim()) {
    const cleanPhone = telefonoDestino.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
    return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

export function shareViaWhatsApp(titulo: string, descripcion: string, sector: string): void {
  const url = generateWhatsAppAlertUrl(titulo, descripcion, sector);
  window.open(url, '_blank');
}

export async function requestPushNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones de escritorio.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('PurifiCalendario Conectado', {
          body: 'Has activado las alertas y recordatorios de eventos municipales de Purificación.',
          icon: '/icon-192.svg',
          badge: '/icon-192.svg'
        });
      } else {
        new Notification('PurifiCalendario Conectado', {
          body: 'Has activado las alertas y recordatorios de eventos municipales de Purificación.',
          icon: '/icon-192.svg'
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error solicitando permisos de notificación:', error);
    return false;
  }
}

export function triggerLocalPush(titulo: string, cuerpo: string, tag?: string, data?: any): void {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(titulo, {
          body: cuerpo,
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          tag: tag || 'purificalendario-alert',
          data: data || { url: '/' }
        });
      }).catch(() => {
        new Notification(titulo, { 
          body: cuerpo, 
          icon: '/icon-192.svg',
          tag: tag || 'purificalendario-alert' 
        });
      });
    } else {
      new Notification(titulo, { 
        body: cuerpo, 
        icon: '/icon-192.svg',
        tag: tag || 'purificalendario-alert' 
      });
    }
  }
}
