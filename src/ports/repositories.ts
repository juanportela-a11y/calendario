import { 
  Aviso, 
  Categoria, 
  CreateAvisoDTO, 
  CreateEventoDTO, 
  CreateNotificationDTO, 
  Evento, 
  Notificacion, 
  Organizador, 
  Usuario, 
  UsuarioEvento 
} from '../types';

export interface IEventRepository {
  getAllEvents(): Promise<Evento[]>;
  getEventById(id: number): Promise<Evento | null>;
  getEventsByOrganizer(idOrganizador: number): Promise<Evento[]>;
  createEvent(data: CreateEventoDTO): Promise<Evento>;
  updateEvent(id: number, data: Partial<CreateEventoDTO>): Promise<Evento | null>;
  deleteEvent(id: number): Promise<boolean>;
}

export interface ICategoryRepository {
  getCategories(): Promise<Categoria[]>;
  getCategoryById(id: number): Promise<Categoria | null>;
}

export interface IUserRepository {
  getUsers(): Promise<Usuario[]>;
  getUserById(id: number): Promise<Usuario | null>;
  getUserByEmail(email: string): Promise<Usuario | null>;
  createUser(user: Partial<Usuario>): Promise<Usuario>;
  updatePreferences(idUsuario: number, prefs: string[]): Promise<Usuario | null>;
  getOrganizers(): Promise<Organizador[]>;
  getOrganizerByUserId(idUsuario: number): Promise<Organizador | null>;
}

export interface INoticeRepository {
  getNotices(): Promise<Aviso[]>;
  createNotice(notice: CreateAvisoDTO, idUsuario: number): Promise<Aviso>;
  deleteNotice(id: number): Promise<boolean>;
}

export interface INotificationRepository {
  getNotificationsByUser(idUsuario: number): Promise<Notificacion[]>;
  createNotification(data: CreateNotificationDTO): Promise<Notificacion>;
  markAsRead(idNotificacion: number): Promise<boolean>;
  markAllAsRead(idUsuario: number): Promise<boolean>;
}

export interface IUserEventRepository {
  getSavedEventsByUser(idUsuario: number): Promise<Evento[]>;
  isSaved(idUsuario: number, idEvento: number): Promise<boolean>;
  toggleSaveEvent(idUsuario: number, idEvento: number): Promise<{ saved: boolean }>;
}
