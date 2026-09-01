// Offline Storage & Sync Engine for PurifiCalendario

export interface OfflineQueueItem {
  id: string;
  type: 'reporte_via' | 'inscripcion_mascota' | 'lectura_aviso' | 'voto_encuesta';
  payload: any;
  timestamp: string;
}

export const STORAGE_KEYS = {
  NOTICES: 'purifi_offline_notices',
  EVENTS: 'purifi_offline_events',
  VIAS: 'purifi_offline_vias',
  CORTES: 'purifi_offline_cortes',
  JORNADAS: 'purifi_offline_jornadas',
  QUEUE: 'purifi_offline_queue',
  LAST_SYNC: 'purifi_offline_last_sync'
};

export class OfflineStorageManager {
  static saveCache<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Error saving offline cache:', e);
    }
  }

  static getCache<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      const parsed = JSON.parse(item);
      return parsed.data || fallback;
    } catch (e) {
      console.warn('Error reading offline cache:', e);
      return fallback;
    }
  }

  static getCacheTimestamp(key: string): string | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const parsed = JSON.parse(item);
      return parsed.updatedAt || null;
    } catch (e) {
      return null;
    }
  }

  // Offline queue for citizen actions performed without connectivity
  static enqueueAction(type: OfflineQueueItem['type'], payload: any): void {
    try {
      const existingQueue: OfflineQueueItem[] = this.getQueue();
      const newItem: OfflineQueueItem = {
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        payload,
        timestamp: new Date().toISOString()
      };
      existingQueue.push(newItem);
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(existingQueue));
    } catch (e) {
      console.warn('Error enqueueing offline action:', e);
    }
  }

  static getQueue(): OfflineQueueItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  static clearQueue(): void {
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
  }

  // Backup all municipal datasets to offline storage
  static syncAllToOffline(notices: any[], events: any[], vias: any[], cortes: any[], jornadas: any[]): void {
    if (notices.length > 0) this.saveCache(STORAGE_KEYS.NOTICES, notices);
    if (events.length > 0) this.saveCache(STORAGE_KEYS.EVENTS, events);
    if (vias.length > 0) this.saveCache(STORAGE_KEYS.VIAS, vias);
    if (cortes.length > 0) this.saveCache(STORAGE_KEYS.CORTES, cortes);
    if (jornadas.length > 0) this.saveCache(STORAGE_KEYS.JORNADAS, jornadas);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }
}
