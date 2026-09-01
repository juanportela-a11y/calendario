import { Evento, Aviso } from '../types';

export function getGoogleCalendarUrl(evento: Evento): string {
  const title = encodeURIComponent(evento.nombre);
  const details = encodeURIComponent(`${evento.descripcion}\n\nOrganizado por: ${evento.organizador?.nombre_entidad || 'Alcaldía de Purificación'}\nLugar: ${evento.lugar}`);
  const location = encodeURIComponent(`${evento.lugar}, Purificación, Tolima, Colombia`);
  
  // Format dates: YYYYMMDDTHHmmssZ
  const startDateStr = `${evento.fecha.replace(/-/g, '')}T${evento.hora_inicio.replace(':', '')}00`;
  const endDateStr = evento.hora_fin 
    ? `${evento.fecha.replace(/-/g, '')}T${evento.hora_fin.replace(':', '')}00`
    : `${evento.fecha.replace(/-/g, '')}T${(parseInt(evento.hora_inicio.split(':')[0]) + 2).toString().padStart(2, '0')}${evento.hora_inicio.split(':')[1] || '00'}00`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${details}&location=${location}&sprop=website:purificalendario.gov.co`;
}

export function getAvisoGoogleCalendarUrl(aviso: Aviso): string {
  const title = encodeURIComponent(`[AVISO MUNICIPAL] ${aviso.titulo}`);
  const details = encodeURIComponent(`${aviso.descripcion}\n\nSector afectado: ${aviso.sector_afectado}\nAlcaldía de Purificación`);
  const location = encodeURIComponent(`${aviso.sector_afectado}, Purificación, Tolima`);
  const todayFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const startDateStr = `${todayFormatted}T080000`;
  const endDateStr = `${todayFormatted}T180000`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${details}&location=${location}`;
}

export function downloadICSFile(evento: Evento): void {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PurifiCalendario//Purificacion Tolima//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:purifi-${evento.id_evento}-${Date.now()}@purificacion.gov.co
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${evento.nombre}
DESCRIPTION:${evento.descripcion.replace(/\n/g, '\\n')} - Organizador: ${evento.organizador?.nombre_entidad || 'Purificación Tolima'}
LOCATION:${evento.lugar}, Purificación, Tolima
DTSTART:${evento.fecha.replace(/-/g, '')}T${evento.hora_inicio.replace(':', '')}00
${evento.hora_fin ? `DTEND:${evento.fecha.replace(/-/g, '')}T${evento.hora_fin.replace(':', '')}00` : ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${evento.nombre.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
