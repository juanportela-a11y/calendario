import { 
  Aviso, 
  Categoria, 
  CreateAvisoDTO, 
  CreateEventoDTO, 
  Evento, 
  Notificacion, 
  Organizador, 
  Usuario 
} from '../types';

export class ApiClientAdapter {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }

  // DDL Schema
  static async getDdlSchema(): Promise<string> {
    const res = await fetch('/api/ddl');
    return res.text();
  }

  // Categories
  static async getCategories(): Promise<Categoria[]> {
    return this.request<Categoria[]>('/api/categories');
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
    return this.request<Evento[]>(url);
  }

  static async getEventById(id: number): Promise<Evento> {
    return this.request<Evento>(`/api/events/${id}`);
  }

  static async createEvent(dto: CreateEventoDTO): Promise<Evento> {
    return this.request<Evento>('/api/events', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  static async updateEvent(id: number, dto: Partial<CreateEventoDTO>): Promise<Evento> {
    return this.request<Evento>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  static async deleteEvent(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Avisos (Notices)
  static async getNotices(): Promise<Aviso[]> {
    return this.request<Aviso[]>('/api/notices');
  }

  static async createNotice(dto: CreateAvisoDTO, idUsuarioCreador: number): Promise<Aviso> {
    return this.request<Aviso>('/api/notices', {
      method: 'POST',
      body: JSON.stringify({ ...dto, id_usuario_creador: idUsuarioCreador }),
    });
  }

  static async deleteNotice(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notices/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  static async getNotifications(userId: number): Promise<Notificacion[]> {
    return this.request<Notificacion[]>(`/api/notifications/user/${userId}`);
  }

  static async markNotificationRead(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  static async markAllNotificationsRead(userId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/user/${userId}/read-all`, {
      method: 'POST',
    });
  }

  // Bookmarks (UsuarioEvento)
  static async getSavedEvents(userId: number): Promise<Evento[]> {
    return this.request<Evento[]>(`/api/bookmarks/user/${userId}`);
  }

  static async checkIsSaved(userId: number, eventId: number): Promise<{ isSaved: boolean }> {
    return this.request<{ isSaved: boolean }>(`/api/bookmarks/check?userId=${userId}&eventId=${eventId}`);
  }

  static async toggleSaveEvent(userId: number, eventId: number): Promise<{ saved: boolean }> {
    return this.request<{ saved: boolean }>('/api/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId, eventId }),
    });
  }

  // Users & Auth
  static async getUsers(): Promise<Usuario[]> {
    return this.request<Usuario[]>('/api/users');
  }

  static async getUserById(id: number): Promise<Usuario> {
    return this.request<Usuario>(`/api/users/${id}`);
  }

  static async loginOrCreateUser(data: Partial<Usuario>): Promise<Usuario> {
    return this.request<Usuario>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateUserPreferences(userId: number, preferences: string[]): Promise<Usuario> {
    return this.request<Usuario>(`/api/users/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  }

  // Organizers
  static async getOrganizers(): Promise<Organizador[]> {
    return this.request<Organizador[]>('/api/organizers');
  }

  static async getOrganizerByUserId(userId: number): Promise<Organizador> {
    return this.request<Organizador>(`/api/organizers/user/${userId}`);
  }

  // Admin Stats
  static async getAdminStats(): Promise<{
    totalEventos: number;
    totalUsuarios: number;
    totalOrganizadores: number;
    totalAvisos: number;
    eventosPorCategoria: { categoria: string; color: string; cantidad: number }[];
  }> {
    return this.request('/api/admin/stats');
  }
}
