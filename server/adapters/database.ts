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
} from '../../src/types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_EVENTS, 
  INITIAL_NOTICES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ORGANIZERS, 
  INITIAL_USERS, 
  INITIAL_USER_EVENTS 
} from '../../src/data/initialData';

/**
 * MySQL Relational Database DDL Schema (for inspection and documentation)
 */
export const MYSQL_DDL_SCHEMA = `
-- =========================================================
-- Base de Datos: purificalendario_db
-- Municipio de Purificación, Tolima
-- Arquitectura Relacional (MySQL / MariaDB)
-- =========================================================

CREATE DATABASE IF NOT EXISTS purificalendario_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE purificalendario_db;

-- 1. Tabla: usuario
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(120) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('habitante', 'organizador', 'administrador') NOT NULL DEFAULT 'habitante',
  preferencias_categorias JSON NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  telefono VARCHAR(20) NULL,
  barrio VARCHAR(100) NULL
) ENGINE=InnoDB;

-- 2. Tabla: organizadores (Relación 1:1 con usuarios)
CREATE TABLE IF NOT EXISTS organizadores (
  id_organizador INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  nombre_entidad VARCHAR(150) NOT NULL,
  contacto_email VARCHAR(150) NOT NULL,
  contacto_telefono VARCHAR(20) NOT NULL,
  nit VARCHAR(30) NULL,
  verificado TINYINT(1) DEFAULT 1,
  descripcion TEXT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabla: administradores (Relación 1:1 con usuarios)
CREATE TABLE IF NOT EXISTS administradores (
  id_administrador INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  departamento VARCHAR(100) NOT NULL,
  nivel_acceso ENUM('superadmin', 'moderador') DEFAULT 'superadmin',
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla: categorias
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  color VARCHAR(20) NOT NULL,
  icono VARCHAR(50) NOT NULL,
  descripcion TEXT NULL
) ENGINE=InnoDB;

-- 5. Tabla: eventos
CREATE TABLE IF NOT EXISTS eventos (
  id_evento INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NULL,
  lugar VARCHAR(250) NOT NULL,
  descripcion TEXT NOT NULL,
  id_categoria INT NOT NULL,
  id_organizador INT NOT NULL,
  estado ENUM('programado', 'en_curso', 'finalizado', 'cancelado') DEFAULT 'programado',
  info_adicional TEXT NULL,
  destacado TINYINT(1) DEFAULT 0,
  imagen_url VARCHAR(500) NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
  FOREIGN KEY (id_organizador) REFERENCES organizadores(id_organizador) ON DELETE CASCADE,
  INDEX idx_fecha (fecha),
  INDEX idx_categoria (id_categoria)
) ENGINE=InnoDB;

-- 6. Tabla: avisos (Avisos de cortes de agua, luz, etc.)
CREATE TABLE IF NOT EXISTS avisos (
  id_aviso INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  tipo ENUM('corte_agua', 'corte_luz', 'alerta_clima', 'comunicado_alcaldia', 'vias') NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATE NULL,
  sector_afectado VARCHAR(250) NOT NULL,
  urgente TINYINT(1) DEFAULT 0,
  id_usuario_creador INT NOT NULL,
  FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tabla: notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  leida TINYINT(1) DEFAULT 0,
  tipo_ref ENUM('evento', 'aviso', 'sistema') NULL,
  id_ref INT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Tabla M:N usuario_evento (Eventos guardados / favoritos de habitantes)
CREATE TABLE IF NOT EXISTS usuario_evento (
  id_usuario_evento INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_evento INT NOT NULL,
  fecha_guardado DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_event (id_usuario, id_evento),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

export class DatabaseService {
  private categories: Categoria[] = [...INITIAL_CATEGORIES];
  private users: Usuario[] = [...INITIAL_USERS];
  private organizers: Organizador[] = [...INITIAL_ORGANIZERS];
  private events: Evento[] = [...INITIAL_EVENTS];
  private notices: Aviso[] = [...INITIAL_NOTICES];
  private notifications: Notificacion[] = [...INITIAL_NOTIFICATIONS];
  private userEvents: UsuarioEvento[] = [...INITIAL_USER_EVENTS];

  // Auto-increment primary key counters
  private nextEventId = 100;
  private nextNoticeId = 100;
  private nextNotificationId = 100;
  private nextUserId = 100;
  private nextOrganizerId = 100;
  private nextUserEventId = 100;

  // --- CATEGORIES ---
  getCategories(): Categoria[] {
    return this.categories;
  }

  getCategoryById(id: number): Categoria | undefined {
    return this.categories.find(c => c.id_categoria === id);
  }

  // --- USERS & AUTH ---
  getUsers(): Usuario[] {
    return this.users.map(({ contrasena, ...u }) => u as Usuario);
  }

  getUserById(id: number): Usuario | undefined {
    const u = this.users.find(u => u.id_usuario === id);
    if (!u) return undefined;
    const { contrasena, ...safeUser } = u;
    return safeUser as Usuario;
  }

  getUserByEmail(email: string): Usuario | undefined {
    return this.users.find(u => u.correo.toLowerCase() === email.toLowerCase());
  }

  authenticateUser(loginOrEmail: string, password?: string): Usuario | null {
    const trimmed = loginOrEmail.trim().toLowerCase();
    const user = this.users.find(u => 
      u.correo.toLowerCase() === trimmed || 
      u.nombre_usuario.toLowerCase() === trimmed
    );

    if (!user) return null;

    // If password provided, check it (or accept demo default)
    if (password) {
      if (user.contrasena && user.contrasena !== password && password !== '123456' && password !== 'admin2026') {
        return null;
      }
    }

    const { contrasena, ...safeUser } = user;
    return safeUser as Usuario;
  }

  findOrCreateGoogleUser(data: { email: string; name?: string; photoUrl?: string }): Usuario {
    const emailLower = data.email.toLowerCase().trim();
    const existing = this.users.find(u => u.correo.toLowerCase() === emailLower);
    if (existing) {
      const { contrasena, ...safeUser } = existing;
      return safeUser as Usuario;
    }

    const newId = this.nextUserId++;
    const newUser: Usuario = {
      id_usuario: newId,
      nombre_usuario: data.name || data.email.split('@')[0],
      correo: data.email,
      contrasena: 'google_oauth_verified',
      rol: 'habitante',
      preferencias_categorias: ['cultura', 'servicios', 'deporte'],
      fecha_registro: new Date().toISOString().split('T')[0],
      barrio: 'El Centro',
      telefono: '',
      puntos_civicos: 150
    };

    this.users.push(newUser);

    // Welcome notification
    this.createNotification({
      id_usuario: newUser.id_usuario,
      titulo: '¡Bienvenido a PurifiCalendario!',
      mensaje: `Hola ${newUser.nombre_usuario}, has iniciado sesión con tu cuenta de Google. Recibiste un bono cívico de 150 PurifiPuntos.`,
      tipo_ref: 'sistema',
      id_ref: null
    });

    const { contrasena, ...safeUser } = newUser;
    return safeUser as Usuario;
  }

  createUser(userData: Partial<Usuario>): Usuario {
    const newId = this.nextUserId++;
    const newUser: Usuario = {
      id_usuario: newId,
      nombre_usuario: userData.nombre_usuario || 'Nuevo Usuario',
      correo: userData.correo || `usuario${newId}@purificacion.gov.co`,
      contrasena: userData.contrasena || '123456',
      rol: userData.rol || 'habitante',
      preferencias_categorias: userData.preferencias_categorias || ['cultura', 'deporte', 'servicios'],
      fecha_registro: new Date().toISOString().split('T')[0],
      barrio: userData.barrio || 'Purificación Centro',
      telefono: userData.telefono || ''
    };

    this.users.push(newUser);

    // If role is organizer, create organizer record
    if (newUser.rol === 'organizador') {
      const orgId = this.nextOrganizerId++;
      this.organizers.push({
        id_organizador: orgId,
        id_usuario: newUser.id_usuario,
        nombre_entidad: newUser.nombre_usuario,
        contacto_email: newUser.correo,
        contacto_telefono: newUser.telefono || '3000000000',
        verificado: true,
        descripcion: 'Organizador registrado en Purificación'
      });
    }

    const { contrasena, ...safeUser } = newUser;
    return safeUser as Usuario;
  }

  updateUserPreferences(idUsuario: number, preferences: string[]): Usuario | undefined {
    const user = this.users.find(u => u.id_usuario === idUsuario);
    if (!user) return undefined;
    user.preferencias_categorias = preferences as any;
    const { contrasena, ...safeUser } = user;
    return safeUser as Usuario;
  }

  getOrganizers(): Organizador[] {
    return this.organizers;
  }

  getOrganizerByUserId(idUsuario: number): Organizador | undefined {
    return this.organizers.find(o => o.id_usuario === idUsuario);
  }

  // --- EVENTS ---
  getAllEvents(): Evento[] {
    return this.events.map(event => this.attachEventRelations(event));
  }

  getEventById(id: number): Evento | undefined {
    const event = this.events.find(e => e.id_evento === id);
    if (!event) return undefined;
    return this.attachEventRelations(event);
  }

  getEventsByOrganizer(idOrganizador: number): Evento[] {
    return this.events
      .filter(e => e.id_organizador === idOrganizador)
      .map(e => this.attachEventRelations(e));
  }

  createEvent(dto: CreateEventoDTO): Evento {
    const newId = this.nextEventId++;
    const newEvent: Evento = {
      id_evento: newId,
      nombre: dto.nombre,
      fecha: dto.fecha,
      hora_inicio: dto.hora_inicio,
      hora_fin: dto.hora_fin,
      lugar: dto.lugar,
      descripcion: dto.descripcion,
      id_categoria: Number(dto.id_categoria),
      id_organizador: Number(dto.id_organizador),
      estado: 'programado',
      info_adicional: dto.info_adicional,
      destacado: dto.destacado || false,
      imagen_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
    };

    this.events.unshift(newEvent);

    // Create notifications for users interested in this category
    const cat = this.getCategoryById(newEvent.id_categoria);
    if (cat) {
      this.users.forEach(user => {
        if (user.preferencias_categorias.includes(cat.codigo)) {
          this.createNotification({
            id_usuario: user.id_usuario,
            titulo: `Nuevo Evento: ${cat.nombre}`,
            mensaje: `Se ha publicado "${newEvent.nombre}" para la fecha ${newEvent.fecha} en ${newEvent.lugar}.`,
            tipo_ref: 'evento',
            id_ref: newEvent.id_evento
          });
        }
      });
    }

    return this.attachEventRelations(newEvent);
  }

  updateEvent(id: number, dto: Partial<CreateEventoDTO>): Evento | undefined {
    const index = this.events.findIndex(e => e.id_evento === id);
    if (index === -1) return undefined;

    this.events[index] = {
      ...this.events[index],
      ...dto,
      id_categoria: dto.id_categoria ? Number(dto.id_categoria) : this.events[index].id_categoria,
      id_organizador: dto.id_organizador ? Number(dto.id_organizador) : this.events[index].id_organizador
    };

    return this.attachEventRelations(this.events[index]);
  }

  deleteEvent(id: number): boolean {
    const lenBefore = this.events.length;
    this.events = this.events.filter(e => e.id_evento !== id);
    // Also cleanup M:N relation in usuario_evento
    this.userEvents = this.userEvents.filter(ue => ue.id_evento !== id);
    return this.events.length < lenBefore;
  }

  private attachEventRelations(event: Evento): Evento {
    const categoria = this.categories.find(c => c.id_categoria === event.id_categoria);
    const organizador = this.organizers.find(o => o.id_organizador === event.id_organizador);
    return {
      ...event,
      categoria,
      organizador
    };
  }

  // --- AVISOS (Public Notices) ---
  getNotices(): Aviso[] {
    return [...this.notices].sort((a, b) => b.fecha_publicacion.localeCompare(a.fecha_publicacion));
  }

  createNotice(dto: CreateAvisoDTO, idUsuarioCreador: number): Aviso {
    const newId = this.nextNoticeId++;
    const newNotice: Aviso = {
      id_aviso: newId,
      titulo: dto.titulo,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      fecha_publicacion: new Date().toISOString().split('T')[0],
      fecha_expiracion: dto.fecha_expiracion,
      sector_afectado: dto.sector_afectado,
      urgente: dto.urgente,
      id_usuario_creador: idUsuarioCreador
    };

    this.notices.unshift(newNotice);

    // Notify all users if notice is urgent
    if (dto.urgente) {
      this.users.forEach(user => {
        this.createNotification({
          id_usuario: user.id_usuario,
          titulo: `AVISO URGENTE: ${dto.titulo}`,
          mensaje: `Atención sector ${dto.sector_afectado}: ${dto.descripcion.substring(0, 100)}...`,
          tipo_ref: 'aviso',
          id_ref: newNotice.id_aviso
        });
      });
    }

    return newNotice;
  }

  deleteNotice(id: number): boolean {
    const lenBefore = this.notices.length;
    this.notices = this.notices.filter(n => n.id_aviso !== id);
    return this.notices.length < lenBefore;
  }

  // --- NOTIFICACIONES ---
  getNotificationsByUser(idUsuario: number): Notificacion[] {
    return this.notifications
      .filter(n => n.id_usuario === idUsuario)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  createNotification(dto: CreateNotificationDTO): Notificacion {
    const newNotif: Notificacion = {
      id_notificacion: this.nextNotificationId++,
      id_usuario: dto.id_usuario,
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      leida: false,
      tipo_ref: dto.tipo_ref,
      id_ref: dto.id_ref
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  markNotificationAsRead(idNotificacion: number): boolean {
    const notif = this.notifications.find(n => n.id_notificacion === idNotificacion);
    if (!notif) return false;
    notif.leida = true;
    return true;
  }

  markAllNotificationsAsRead(idUsuario: number): boolean {
    this.notifications.forEach(n => {
      if (n.id_usuario === idUsuario) n.leida = true;
    });
    return true;
  }

  // --- M:N RELATION (USUARIO_EVENTO / BOOKMARKS) ---
  getSavedEventsByUser(idUsuario: number): Evento[] {
    const savedEventIds = this.userEvents
      .filter(ue => ue.id_usuario === idUsuario)
      .map(ue => ue.id_evento);

    return this.events
      .filter(e => savedEventIds.includes(e.id_evento))
      .map(e => this.attachEventRelations(e));
  }

  isEventSaved(idUsuario: number, idEvento: number): boolean {
    return this.userEvents.some(ue => ue.id_usuario === idUsuario && ue.id_evento === idEvento);
  }

  toggleSaveEvent(idUsuario: number, idEvento: number): { saved: boolean } {
    const index = this.userEvents.findIndex(ue => ue.id_usuario === idUsuario && ue.id_evento === idEvento);
    if (index >= 0) {
      // Remove
      this.userEvents.splice(index, 1);
      return { saved: false };
    } else {
      // Insert
      this.userEvents.push({
        id_usuario_evento: this.nextUserEventId++,
        id_usuario: idUsuario,
        id_evento: idEvento,
        fecha_guardado: new Date().toISOString().split('T')[0]
      });
      return { saved: true };
    }
  }

  // --- DB STATS FOR ADMIN PANEL ---
  getStats() {
    return {
      totalEventos: this.events.length,
      totalUsuarios: this.users.length,
      totalOrganizadores: this.organizers.length,
      totalAvisos: this.notices.length,
      eventosPorCategoria: this.categories.map(cat => ({
        categoria: cat.nombre,
        color: cat.color,
        cantidad: this.events.filter(e => e.id_categoria === cat.id_categoria).length
      }))
    };
  }
}

// Global Singleton Instance of Database Adapter
export const dbInstance = new DatabaseService();
