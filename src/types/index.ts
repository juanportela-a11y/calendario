// Database Relational Entities & App Types for PurifiCalendario

export type UserRole = 'habitante' | 'organizador' | 'administrador' | 'funcionario_obras' | 'funcionario_salud';

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
  puntos_civicos?: number;
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
  tipo_ref?: 'evento' | 'aviso' | 'sistema' | 'via' | 'salud' | 'reporte_ciudadano';
  id_ref?: number;
}

export interface UsuarioEvento {
  id_usuario_evento: number; // Primary Key
  id_usuario: number; // Foreign Key -> Usuario(id_usuario)
  id_evento: number; // Foreign Key -> Evento(id_evento)
  fecha_guardado: string;
}

// ==========================================
// MÓDULOS DE GESTIÓN OPERATIVA MUNICIPAL
// ==========================================

export type SeveridadVia = 'alta' | 'media' | 'baja';
export type EstadoVia = 'reportado' | 'inspeccion' | 'reparacion' | 'completado';

export interface ReporteVia {
  id_via: number;
  titulo: string;
  direccion: string;
  barrio: string;
  coordenadas: [number, number]; // [lat, lng]
  severidad: SeveridadVia;
  tipo_dano: string; // 'Hueco Profundo', 'Hundimiento Calzada', 'Derrumbe/Obstrucción', 'Falla de Alcantarillado', 'Pavimento Agrietado'
  estado: EstadoVia;
  descripcion: string;
  foto_antes?: string;
  foto_despues?: string;
  material_estimado?: string;
  cuadrilla_asignada?: string;
  fecha_reporte: string;
  fecha_actualizacion?: string;
  reportado_por: string;
  costo_estimado_cop?: number;
  prioridad: 'urgente' | 'alta' | 'media' | 'rutinaria';
  origen_reporte?: 'ciudadano' | 'inspeccion_oficial';
  telefono_contacto?: string;
}

export type TipoCorteServicio = 'agua' | 'energia' | 'gas';
export type EstadoCorte = 'programado' | 'en_curso' | 'restablecido';

export interface CorteProgramado {
  id_corte: number;
  tipo: TipoCorteServicio;
  titulo: string;
  motivo: string;
  sector_barrio: string;
  coordenadas: [number, number];
  radio_afectacion_m: number;
  fecha_inicio: string;
  hora_inicio: string;
  fecha_estimada_fin: string;
  hora_estimada_fin: string;
  cuadrilla_responsable: string;
  empresa_prestadora: string; // 'Empresas Públicas de Purificación EMPOPUR', 'CELSIA Tolima', 'Alcanos de Colombia'
  estado: EstadoCorte;
  urgente: boolean;
  poblacion_afectada_aprox?: number;
  puntos_distribucion_emergencia?: string;
  creado_por: string;
}

export type TipoJornadaSalud = 
  | 'esterilizacion_canina_felina' 
  | 'vacunacion_antirrabica' 
  | 'tamizaje_salud_publica' 
  | 'desparasitacion_masiva';

export type EstadoJornada = 'programada' | 'en_curso' | 'finalizada';

export interface PersonalAsignado {
  id_personal: number;
  nombre: string;
  cargo: string;
  tarjeta_profesional?: string;
  entidad: string;
}

export type PersonalSaludAsignado = PersonalAsignado;

export interface InscripcionMascota {
  id_inscrito: number;
  id_jornada: number;
  tutor_nombre: string;
  tutor_cedula: string;
  tutor_telefono: string;
  barrio: string;
  mascota_nombre: string;
  especie: 'canino' | 'felino';
  raza?: string;
  edad_meses?: number;
  hora_turno: string;
  estado: 'inscrito' | 'atendido' | 'no_asistio' | 'cancelado';
}

export type InscritoJornada = InscripcionMascota;

export interface JornadaSaludEsterilizacion {
  id_jornada: number;
  titulo: string;
  tipo: TipoJornadaSalud;
  lugar: string;
  barrio: string;
  coordenadas: [number, number];
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cupos_totales: number;
  cupos_ocupados: number;
  personal_asignado: PersonalAsignado[];
  inscritos: InscripcionMascota[];
  requisitos: string;
  estado: EstadoJornada;
  responsable_entidad: string;
  creado_por: string;
}

// ==========================================
// PARTICIPACIÓN CIUDADANA Y ENCUESTAS
// ==========================================

export interface ReporteCiudadanoDTO {
  tipo: 'via_danada' | 'esterilizacion_mascotas' | 'corte_servicio' | 'alerta_ambiental' | 'alumbrado_publico';
  titulo: string;
  descripcion: string;
  direccion: string;
  barrio: string;
  coordenadas?: [number, number];
  foto_url?: string;
  nombre_ciudadano: string;
  telefono: string;
}

export interface EncuestaCiudadana {
  id_encuesta: number;
  titulo: string;
  descripcion: string;
  categoria: 'obras' | 'salud' | 'cultura' | 'servicios';
  fecha_cierre: string;
  opciones: {
    id_opcion: number;
    texto: string;
    votos: number;
  }[];
  total_votos: number;
  votos_usuarios: Record<string, number>; // userId -> opcionId
  estado: 'activa' | 'cerrada';
}

// Panel de Bitácora y Auditoría
export type ModuloAuditoria = 
  | 'Vías' 
  | 'Cortes' 
  | 'Salud & Esterilización' 
  | 'Eventos'
  | 'Avisos'
  | 'Usuarios'
  | 'Notificaciones'
  | 'Mapa' 
  | 'Sistema' 
  | 'Ciudadanía';

export type AccionAuditoria = 
  | 'CREACIÓN' 
  | 'ACTUALIZACIÓN'
  | 'ACTUALIZACIÓN_ESTADO' 
  | 'ACTUALIZAR_ROL'
  | 'ELIMINACIÓN'
  | 'INICIO_SESIÓN'
  | 'REGISTRO_USUARIO'
  | 'ACTUALIZACIÓN_PREFERENCIAS'
  | 'BROADCAST_NOTIFICACIÓN'
  | 'GUARDAR_EVENTO'
  | 'ADJUNCIÓN_FOTO' 
  | 'ASIGNACIÓN_PERSONAL' 
  | 'ASIGNACIÓN_CUADRILLA'
  | 'CAMBIO_COORDENADAS' 
  | 'CIERRE_INCIDENCIA'
  | 'REGISTRO_INSCRIPCIÓN'
  | 'REPORTE_CIUDADANO'
  | 'VOTO_ENCUESTA';

export interface RegistroAuditoria {
  id_log: number;
  timestamp: string; // ISO or formatted string
  funcionario_nombre: string;
  funcionario_rol: string;
  funcionario_avatar?: string;
  modulo: ModuloAuditoria;
  accion: AccionAuditoria;
  descripcion: string;
  id_referencia?: number | string;
  detalles_anteriores?: string;
  detalles_nuevos?: string;
}

// Map Layers Visibility State
export interface MapLayersVisibility {
  vias: boolean;
  cortes: boolean;
  salud: boolean;
  radiosAfectacion: boolean;
  rutasDesvios: boolean;
}

// Global Filter for Ops Dashboard
export interface OpsGlobalFilterState {
  searchQuery: string;
  barrioSeleccionado: string; // 'todos' or barrio name
  estadoFiltro: string; // 'todos' or specific state
  severidadFiltro: string; // 'todas' | 'alta' | 'media' | 'baja'
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
  imagen_url?: string;
  cupo_maximo?: number;
  requiere_inscripcion?: boolean;
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
  tipo_ref?: 'evento' | 'aviso' | 'sistema' | 'via' | 'salud';
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
