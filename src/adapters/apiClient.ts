import { 
  Aviso, 
  Categoria, 
  CategoryCode,
  CreateAvisoDTO, 
  CreateEventoDTO, 
  Evento, 
  Notificacion, 
  Organizador, 
  Usuario 
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_EVENTS, 
  INITIAL_NOTICES, 
  INITIAL_ORGANIZERS, 
  INITIAL_USERS 
} from '../data/initialData';
import { 
  saveEventoToFirestore, 
  deleteEventoFromFirestore,
  saveAvisoToFirestore,
  deleteAvisoFromFirestore,
  saveUsuarioToFirestore,
  saveNotificacionToFirestore
} from './firebaseOpsAdapter';
import { triggerLocalPush } from '../utils/notificationUtils';

let localEvents: Evento[] = [...INITIAL_EVENTS];
let localNotices: Aviso[] = [...INITIAL_NOTICES];

export class ApiClientAdapter {
  private static async request<T>(endpoint: string, options?: RequestInit, fallbackData?: T): Promise<T> {
    try {
      let activeUser: any = null;
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('purifi_active_user') : null;
        if (stored) activeUser = JSON.parse(stored);
      } catch {}

      const authHeaders: Record<string, string> = {};
      if (activeUser?.rol) authHeaders['x-user-role'] = activeUser.rol;
      if (activeUser?.id_usuario) authHeaders['x-user-id'] = String(activeUser.id_usuario);

      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options?.headers,
        },
        ...options,
      });

      if (!res.ok) {
        if (fallbackData !== undefined) {
          return fallbackData;
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw err;
    }
  }

  // DDL Schema
  static async getDdlSchema(): Promise<string> {
    try {
      const res = await fetch('/api/ddl');
      if (!res.ok) return '-- Schema MySQL DDL para Purificación Tolima\nCREATE DATABASE IF NOT EXISTS purificalendario_db;';
      return res.text();
    } catch {
      return '-- Schema MySQL DDL para Purificación Tolima\nCREATE DATABASE IF NOT EXISTS purificalendario_db;';
    }
  }

  // Categories
  static async getCategories(): Promise<Categoria[]> {
    return this.request<Categoria[]>('/api/categories', undefined, INITIAL_CATEGORIES);
  }

  // Events
  static async getEvents(params?: {
    categoriaId?: number | null;
    searchQuery?: string;
    month?: number;
    year?: number;
    organizerId?: number;
  }): Promise<Evento[]> {
    const query = new URLSearchParams();
    if (params?.categoriaId) query.append('categoriaId', String(params.categoriaId));
    if (params?.searchQuery) query.append('searchQuery', params.searchQuery);
    if (params?.month !== undefined) query.append('month', String(params.month));
    if (params?.year !== undefined) query.append('year', String(params.year));
    if (params?.organizerId) query.append('organizerId', String(params.organizerId));

    const url = `/api/events${query.toString() ? `?${query.toString()}` : ''}`;
    return this.request<Evento[]>(url, undefined, localEvents);
  }

  static async getEventById(id: number): Promise<Evento> {
    const fallback = localEvents.find(e => e.id_evento === id) || INITIAL_EVENTS[0];
    return this.request<Evento>(`/api/events/${id}`, undefined, fallback);
  }

  static async createEvent(dto: CreateEventoDTO): Promise<Evento> {
    const fallbackEvent: Evento = {
      id_evento: Date.now(),
      nombre: dto.nombre,
      fecha: dto.fecha,
      hora_inicio: dto.hora_inicio,
      hora_fin: dto.hora_fin,
      lugar: dto.lugar,
      descripcion: dto.descripcion,
      id_categoria: dto.id_categoria,
      id_organizador: dto.id_organizador || 1,
      estado: 'programado',
      info_adicional: dto.info_adicional,
      destacado: dto.destacado || false,
      imagen_url: dto.imagen_url,
      cupo_maximo: dto.cupo_maximo,
      requiere_inscripcion: dto.requiere_inscripcion
    };

    let resultEvent = fallbackEvent;
    try {
      resultEvent = await this.request<Evento>('/api/events', {
        method: 'POST',
        body: JSON.stringify(dto),
      }, fallbackEvent);
    } catch (e) {
      console.warn('API createEvent fallback to local:', e);
    }

    localEvents.unshift(resultEvent);

    // Real-time synchronization to Firebase Firestore
    try {
      await saveEventoToFirestore(resultEvent);
    } catch (fsErr) {
      console.error('Firestore saveEvento error:', fsErr);
    }

    // Trigger local push notification & broadcast
    try {
      triggerLocalPush(
        `Nuevo Evento: ${resultEvent.nombre}`,
        `📅 ${resultEvent.fecha} a las ${resultEvent.hora_inicio} en ${resultEvent.lugar}. ¡Toca para ver detalles!`,
        `event-${resultEvent.id_evento}`
      );
      this.broadcastNotification({
        titulo: `Nuevo Evento: ${resultEvent.nombre}`,
        mensaje: `Se ha publicado un nuevo evento para el ${resultEvent.fecha} en ${resultEvent.lugar}.`,
        tipo_ref: 'evento',
        id_ref: resultEvent.id_evento
      }).catch(() => {});
    } catch {}

    return resultEvent;
  }

  static async updateEvent(id: number, dto: Partial<CreateEventoDTO>): Promise<Evento> {
    const existing = localEvents.find(e => e.id_evento === id) || INITIAL_EVENTS[0];
    const fallbackUpdated: Evento = { ...existing, ...dto };

    let resultEvent = fallbackUpdated;
    try {
      resultEvent = await this.request<Evento>(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      }, fallbackUpdated);
    } catch (e) {
      console.warn('API updateEvent fallback to local:', e);
    }

    localEvents = localEvents.map(e => e.id_evento === id ? resultEvent : e);

    // Sync to Firestore
    try {
      await saveEventoToFirestore(resultEvent);
    } catch (fsErr) {
      console.error('Firestore updateEvento error:', fsErr);
    }

    // Notification on event update
    try {
      triggerLocalPush(
        `Evento Actualizado: ${resultEvent.nombre}`,
        `Se han actualizado detalles del evento programado para ${resultEvent.fecha}.`,
        `event-update-${resultEvent.id_evento}`
      );
    } catch {}

    return resultEvent;
  }

  static async deleteEvent(id: number): Promise<{ success: boolean }> {
    localEvents = localEvents.filter(e => e.id_evento !== id);

    try {
      await deleteEventoFromFirestore(id);
    } catch (e) {
      console.warn('Firestore deleteEvento error:', e);
    }

    return this.request<{ success: boolean }>(`/api/events/${id}`, {
      method: 'DELETE',
    }, { success: true });
  }

  // Avisos (Notices)
  static async getNotices(): Promise<Aviso[]> {
    return this.request<Aviso[]>('/api/notices', undefined, localNotices);
  }

  static async createNotice(dto: CreateAvisoDTO, idUsuarioCreador: number): Promise<Aviso> {
    const fallbackNotice: Aviso = {
      id_aviso: Date.now(),
      titulo: dto.titulo,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      fecha_publicacion: new Date().toISOString().split('T')[0],
      fecha_expiracion: dto.fecha_expiracion,
      sector_afectado: dto.sector_afectado,
      urgente: dto.urgente,
      id_usuario_creador: idUsuarioCreador
    };

    let resultNotice = fallbackNotice;
    try {
      resultNotice = await this.request<Aviso>('/api/notices', {
        method: 'POST',
        body: JSON.stringify({ ...dto, id_usuario_creador: idUsuarioCreador }),
      }, fallbackNotice);
    } catch (e) {
      console.warn('API createNotice fallback:', e);
    }

    localNotices.unshift(resultNotice);

    try {
      await saveAvisoToFirestore(resultNotice);
    } catch (fsErr) {
      console.error('Firestore saveAviso error:', fsErr);
    }

    if (resultNotice.urgente) {
      triggerLocalPush(
        `🚨 AVISO URGENTE: ${resultNotice.titulo}`,
        `${resultNotice.sector_afectado}: ${resultNotice.descripcion}`,
        `aviso-${resultNotice.id_aviso}`
      );
    }

    return resultNotice;
  }

  static async deleteNotice(id: number): Promise<{ success: boolean }> {
    localNotices = localNotices.filter(n => n.id_aviso !== id);

    try {
      await deleteAvisoFromFirestore(id);
    } catch (e) {
      console.warn('Firestore deleteAviso error:', e);
    }

    return this.request<{ success: boolean }>(`/api/notices/${id}`, {
      method: 'DELETE',
    }, { success: true });
  }

  // Notifications
  static async getNotifications(userId: number): Promise<Notificacion[]> {
    return this.request<Notificacion[]>(`/api/notifications/user/${userId}`, undefined, []);
  }

  static async createNotification(dto: { id_usuario: number; titulo: string; mensaje: string; tipo_ref?: 'evento' | 'aviso' | 'sistema' | 'via' | 'salud' | 'reporte_ciudadano'; id_ref?: number }): Promise<Notificacion> {
    const fallbackNotif: Notificacion = {
      id_notificacion: Date.now(),
      id_usuario: dto.id_usuario,
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      fecha: new Date().toISOString(),
      leida: false,
      tipo_ref: dto.tipo_ref,
      id_ref: dto.id_ref
    };

    try {
      await saveNotificacionToFirestore(fallbackNotif);
    } catch (e) {
      console.warn('Firestore saveNotificacion error:', e);
    }

    return this.request<Notificacion>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(dto),
    }, fallbackNotif);
  }

  static async broadcastNotification(dto: { titulo: string; mensaje: string; tipo_ref?: string; id_ref?: number }): Promise<{ success: boolean; count: number }> {
    try {
      // Save global notification to Firestore (id_usuario: 0 represents broadcast)
      await saveNotificacionToFirestore({
        id_notificacion: Date.now(),
        id_usuario: 0,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        fecha: new Date().toISOString(),
        leida: false,
        tipo_ref: dto.tipo_ref,
        id_ref: dto.id_ref
      });
    } catch (e) {
      console.warn('Firestore broadcastNotification error:', e);
    }

    return this.request<{ success: boolean; count: number }>('/api/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(dto),
    }, { success: true, count: 1 });
  }

  static async askPurifiGuiaAi(message: string, history?: { role: 'user' | 'model'; text: string }[]): Promise<{ reply: string | null; fallback?: boolean; error?: string }> {
    return this.request<{ reply: string | null; fallback?: boolean; error?: string }>('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }, { reply: null, fallback: true });
  }

  static async markNotificationRead(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    }, { success: true });
  }

  static async markAllNotificationsRead(userId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/user/${userId}/read-all`, {
      method: 'POST',
    }, { success: true });
  }

  // Bookmarks (UsuarioEvento)
  static async getSavedEvents(userId: number): Promise<Evento[]> {
    return this.request<Evento[]>(`/api/bookmarks/user/${userId}`, undefined, []);
  }

  static async checkIsSaved(userId: number, eventId: number): Promise<{ isSaved: boolean }> {
    return this.request<{ isSaved: boolean }>(`/api/bookmarks/check?userId=${userId}&eventId=${eventId}`, undefined, { isSaved: false });
  }

  static async toggleSaveEvent(userId: number, eventId: number): Promise<{ saved: boolean }> {
    return this.request<{ saved: boolean }>('/api/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId, eventId }),
    }, { saved: true });
  }

  // Users & Auth
  static async getUsers(): Promise<Usuario[]> {
    return this.request<Usuario[]>('/api/users', undefined, INITIAL_USERS);
  }

  static async getUserById(id: number): Promise<Usuario> {
    const fallback = INITIAL_USERS.find(u => u.id_usuario === id) || INITIAL_USERS[0];
    return this.request<Usuario>(`/api/users/${id}`, undefined, fallback);
  }

  static async login(loginOrEmail: string, password?: string): Promise<{ success: boolean; user: Usuario; token: string }> {
    const cleanLogin = loginOrEmail.toLowerCase().trim();
    const fallbackUser: Usuario = INITIAL_USERS.find(u => 
      u.correo.toLowerCase() === cleanLogin || 
      u.nombre_usuario.toLowerCase().includes(cleanLogin)
    ) || {
      id_usuario: Date.now(),
      nombre_usuario: loginOrEmail.includes('@') ? loginOrEmail.split('@')[0] : loginOrEmail,
      correo: loginOrEmail.includes('@') ? loginOrEmail : `${cleanLogin}@purificacion-tolima.gov.co`,
      contrasena: password || '123456',
      rol: 'habitante',
      fecha_registro: new Date().toISOString().split('T')[0],
      preferencias_categorias: ['cultura', 'deporte', 'educacion'],
      puntos_civicos: 50
    };

    return this.request<{ success: boolean; user: Usuario; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login: loginOrEmail, password }),
    }, {
      success: true,
      user: fallbackUser,
      token: `purifi_token_${fallbackUser.id_usuario}`
    });
  }

  static async loginWithGoogle(googleData: { email: string; name?: string; photoUrl?: string }): Promise<{ success: boolean; user: Usuario; token: string }> {
    const emailClean = googleData.email.toLowerCase().trim();
    const existing = INITIAL_USERS.find(u => u.correo.toLowerCase() === emailClean);
    const fallbackUser: Usuario = existing || {
      id_usuario: Date.now(),
      nombre_usuario: googleData.name || emailClean.split('@')[0],
      correo: emailClean,
      contrasena: 'google_oauth',
      rol: 'habitante',
      fecha_registro: new Date().toISOString().split('T')[0],
      preferencias_categorias: ['cultura', 'salud', 'deporte', 'servicios'],
      puntos_civicos: 100
    };

    let res: { success: boolean; user: Usuario; token: string };
    try {
      res = await this.request<{ success: boolean; user: Usuario; token: string }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(googleData),
      }, {
        success: true,
        user: fallbackUser,
        token: `purifi_google_${fallbackUser.id_usuario}`
      });
    } catch {
      res = {
        success: true,
        user: fallbackUser,
        token: `purifi_google_${fallbackUser.id_usuario}`
      };
    }

    if (res.user) {
      if (!INITIAL_USERS.some(u => u.id_usuario === res.user.id_usuario)) {
        INITIAL_USERS.push(res.user);
      }
      try {
        await saveUsuarioToFirestore(res.user);
      } catch (e) {
        console.warn('Error saving Google user to Firestore:', e);
      }
    }

    return res;
  }

  static async register(userData: Partial<Usuario>): Promise<{ success: boolean; user: Usuario; token: string }> {
    const fallbackUser: Usuario = {
      id_usuario: Date.now(),
      nombre_usuario: userData.nombre_usuario || 'Ciudadano Purificación',
      correo: userData.correo || 'usuario@purificacion-tolima.gov.co',
      contrasena: userData.contrasena || '123456',
      rol: userData.rol || 'habitante',
      barrio: userData.barrio || 'Villa de las Palmas',
      telefono: userData.telefono || '3100000000',
      fecha_registro: new Date().toISOString().split('T')[0],
      preferencias_categorias: (userData.preferencias_categorias as CategoryCode[]) || ['cultura', 'deporte'],
      puntos_civicos: 50
    };

    let res: { success: boolean; user: Usuario; token: string };
    try {
      res = await this.request<{ success: boolean; user: Usuario; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }, {
        success: true,
        user: fallbackUser,
        token: `purifi_reg_${fallbackUser.id_usuario}`
      });
    } catch {
      res = {
        success: true,
        user: fallbackUser,
        token: `purifi_reg_${fallbackUser.id_usuario}`
      };
    }

    if (res.user) {
      if (!INITIAL_USERS.some(u => u.id_usuario === res.user.id_usuario)) {
        INITIAL_USERS.push(res.user);
      }
      try {
        await saveUsuarioToFirestore(res.user);
      } catch (e) {
        console.warn('Error saving registered user to Firestore:', e);
      }
    }

    return res;
  }

  static async loginOrCreateUser(data: Partial<Usuario>): Promise<Usuario> {
    const fallback = INITIAL_USERS.find(u => u.correo === data.correo) || {
      id_usuario: Date.now(),
      nombre_usuario: data.nombre_usuario || 'Ciudadano Purificación',
      correo: data.correo || 'habitante@purificacion-tolima.gov.co',
      contrasena: '123456',
      rol: 'habitante' as const,
      fecha_registro: new Date().toISOString().split('T')[0],
      preferencias_categorias: ['cultura' as CategoryCode],
      puntos_civicos: 50
    };
    const res = await this.request<Usuario>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }, fallback);

    if (res) {
      if (!INITIAL_USERS.some(u => u.id_usuario === res.id_usuario)) {
        INITIAL_USERS.push(res);
      }
      try {
        await saveUsuarioToFirestore(res);
      } catch (e) {}
    }
    return res;
  }

  static async updateUserPreferences(userId: number, preferences: string[]): Promise<Usuario> {
    const user = INITIAL_USERS.find(u => u.id_usuario === userId) || INITIAL_USERS[0];
    const updated: Usuario = { ...user, preferencias_categorias: preferences as CategoryCode[] };
    const res = await this.request<Usuario>(`/api/users/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    }, updated);

    if (res) {
      const idx = INITIAL_USERS.findIndex(u => u.id_usuario === res.id_usuario);
      if (idx !== -1) INITIAL_USERS[idx] = res;
      try {
        await saveUsuarioToFirestore(res);
      } catch (e) {}
    }
    return res;
  }

  static async updateUser(userId: number, data: Partial<Usuario>): Promise<Usuario> {
    const user = INITIAL_USERS.find(u => u.id_usuario === userId) || INITIAL_USERS[0];
    const updated: Usuario = { ...user, ...data };
    const res = await this.request<Usuario>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, updated);

    if (res) {
      const idx = INITIAL_USERS.findIndex(u => u.id_usuario === res.id_usuario);
      if (idx !== -1) INITIAL_USERS[idx] = res;
      try {
        await saveUsuarioToFirestore(res);
      } catch (e) {}
    }
    return res;
  }

  // Password Recovery Methods
  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; token?: string; demoLink?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const existing = INITIAL_USERS.find(u => u.correo.toLowerCase() === cleanEmail);
    const mockToken = `PURIFI-${Math.floor(100000 + Math.random() * 900000)}`;

    return this.request<{ success: boolean; message: string; token?: string; demoLink?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail }),
    }, {
      success: true,
      message: `Código de recuperación generado para ${cleanEmail}.`,
      token: mockToken,
      demoLink: `/recuperar?token=${mockToken}`
    });
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string; user?: Usuario }> {
    const fallbackUser = INITIAL_USERS[0];
    return this.request<{ success: boolean; message: string; user?: Usuario }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: token.trim().toUpperCase(), newPassword }),
    }, {
      success: true,
      message: 'Contraseña actualizada con éxito.',
      user: { ...fallbackUser, contrasena: newPassword }
    });
  }

  // Organizers
  static async getOrganizers(): Promise<Organizador[]> {
    return this.request<Organizador[]>('/api/organizers', undefined, INITIAL_ORGANIZERS);
  }

  static async getOrganizerByUserId(userId: number): Promise<Organizador> {
    const fallback = INITIAL_ORGANIZERS.find(o => o.id_usuario === userId) || INITIAL_ORGANIZERS[0];
    return this.request<Organizador>(`/api/organizers/user/${userId}`, undefined, fallback);
  }

  // Admin Stats
  static async getAdminStats(): Promise<{
    totalEventos: number;
    totalUsuarios: number;
    totalOrganizadores: number;
    totalAvisos: number;
    eventosPorCategoria: { categoria: string; color: string; cantidad: number }[];
  }> {
    const fallbackStats = {
      totalEventos: INITIAL_EVENTS.length,
      totalUsuarios: INITIAL_USERS.length,
      totalOrganizadores: INITIAL_ORGANIZERS.length,
      totalAvisos: INITIAL_NOTICES.length,
      eventosPorCategoria: [
        { categoria: 'Cultura', color: '#8B5CF6', cantidad: 3 },
        { categoria: 'Deporte', color: '#10B981', cantidad: 2 },
        { categoria: 'Salud', color: '#EF4444', cantidad: 2 }
      ]
    };
    return this.request('/api/admin/stats', undefined, fallbackStats);
  }
}
