// Database Relational Entities & App Types for PurifiCalendario

export type UserRole = 'habitante' | 'organizador' | 'administrador';

export type CategoryCode = 
  | 'cultura' 
  | 'deporte' 
  | 'educacion' 
  | 'salud' 
  | 'bienestar' 
  | 'servicios' 
  | 'comunidad';

export interface Categoria {
  id_categoria: number; // Primary Key
  nombre: string;
  codigo: CategoryCode;
  color: string; // Hex or Tailwind color class
  icono: string; // Lucide icon identifier
  descripcion: string;
}

export interface Usuario {
  id_usuario: number; // Primary Key
  nombre_usuario: string;
  correo: string;
  contrasena?: string;
  rol: UserRole;
  preferencias_categorias: CategoryCode[]; // Stored as array or JSON in DB
  fecha_registro: string;
  telefono?: string;
  barrio?: string;
}

export interface Organizador {
  id_organizador: number; // Primary Key
  id_usuario: number; // Foreign Key -> Usuario(id_usuario)
  nombre_entidad: string;
  contacto_email: string;
  contacto_telefono: string;
  nit?: string;
  verificado: boolean;
  descripcion?: string;
}

export interface Administrador {
  id_administrador: number; // Primary Key
  id_usuario: number; // Foreign Key -> Usuario(id_usuario)
  departamento: string;
  nivel_acceso: 'superadmin' | 'moderador';
}

export interface Evento {
  id_evento: number; // Primary Key
  nombre: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fin?: string;
  lugar: string;
  descripcion: string;
  id_categoria: number; // Foreign Key -> Categoria(id_categoria)
  id_organizador: number; // Foreign Key -> Organizador(id_organizador)
  estado: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
  info_adicional?: string;
  destacado: boolean;
  cupo_maximo?: number;
  requiere_inscripcion?: boolean;
  imagen_url?: string;
  // Joined fields for rich UI display
  categoria?: Categoria;
  organizador?: Organizador;
}

export interface Aviso {
  id_aviso: number; // Primary Key
  titulo: string;
  tipo: 'corte_agua' | 'corte_luz' | 'alerta_clima' | 'comunicado_alcaldia' | 'vias';
  descripcion: string;
  fecha_publicacion: string;
  fecha_expiracion?: string;
  sector_afectado: string;
  urgente: boolean;
  id_usuario_creador: number; // Foreign Key -> Usuario(id_usuario)
}

export interface Notificacion {
  id_notificacion: number; // Primary Key
  id_usuario: number; // Foreign Key -> Usuario(id_usuario)
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo_ref?: 'evento' | 'aviso' | 'sistema';
  id_ref?: number;
}

export interface UsuarioEvento {
  id_usuario_evento: number; // Primary Key
  id_usuario: number; // Foreign Key -> Usuario(id_usuario)
  id_evento: number; // Foreign Key -> Evento(id_evento)
  fecha_guardado: string;
}

// DTOs for creating entities
export interface CreateEventoDTO {
  nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin?: string;
  lugar: string;
  descripcion: string;
  id_categoria: number;
  id_organizador: number;
  info_adicional?: string;
  destacado?: boolean;
}

export interface CreateAvisoDTO {
  titulo: string;
  tipo: 'corte_agua' | 'corte_luz' | 'alerta_clima' | 'comunicado_alcaldia' | 'vias';
  descripcion: string;
  sector_afectado: string;
  urgente: boolean;
  fecha_expiracion?: string;
}

export interface CreateNotificationDTO {
  id_usuario: number;
  titulo: string;
  mensaje: string;
  tipo_ref?: 'evento' | 'aviso' | 'sistema';
  id_ref?: number;
}

// Filter State for Calendar & Event search
export interface EventFilterState {
  searchQuery: string;
  categoriaId: number | null;
  onlyPreferences: boolean;
  onlySaved: boolean;
  startDate?: string;
  endDate?: string;
  selectedMonth?: number; // 0 - 11
  selectedYear?: number;
}
