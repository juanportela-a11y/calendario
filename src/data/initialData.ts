import { 
  Aviso, 
  Categoria, 
  Evento, 
  Notificacion, 
  Organizador, 
  Usuario, 
  UsuarioEvento 
} from '../types';
import { SYSTEM_CATEGORIES } from '../domain/entities';

export const INITIAL_CATEGORIES: Categoria[] = SYSTEM_CATEGORIES;

export const INITIAL_USERS: Usuario[] = [
  {
    id_usuario: 1,
    nombre_usuario: 'Carlos Rodríguez',
    correo: 'habitante@purificacion.gov.co',
    rol: 'habitante',
    preferencias_categorias: ['cultura', 'deporte', 'servicios'],
    fecha_registro: '2026-01-15',
    telefono: '3124567890',
    barrio: 'El Centro'
  },
  {
    id_usuario: 2,
    nombre_usuario: 'Casa de la Cultura Purificación',
    correo: 'cultura@purificacion-tolima.gov.co',
    rol: 'organizador',
    preferencias_categorias: ['cultura', 'educacion'],
    fecha_registro: '2026-01-10',
    telefono: '3158889900',
    barrio: 'Villa de las Palmas'
  },
  {
    id_usuario: 3,
    nombre_usuario: 'Administrador Municipal Purificación',
    correo: 'admin@purificacion-tolima.gov.co',
    rol: 'administrador',
    preferencias_categorias: ['cultura', 'deporte', 'educacion', 'salud', 'bienestar', 'servicios', 'comunidad'],
    fecha_registro: '2026-01-01',
    telefono: '3200001122',
    barrio: 'Alcaldía Municipal'
  },
  {
    id_usuario: 4,
    nombre_usuario: 'IMDER Purificación (Deportes)',
    correo: 'deportes@purificacion-tolima.gov.co',
    rol: 'organizador',
    preferencias_categorias: ['deporte'],
    fecha_registro: '2026-02-01',
    telefono: '3117772233',
    barrio: 'Villa Olímpica'
  },
  {
    id_usuario: 5,
    nombre_usuario: 'Secretaría de Salud & E.S.E. Hospital Nuevo San Rafael',
    correo: 'salud@hospitalpurificacion.gov.co',
    rol: 'organizador',
    preferencias_categorias: ['salud', 'bienestar'],
    fecha_registro: '2026-02-05',
    telefono: '3189994455',
    barrio: 'Barrio Hospital'
  }
];

export const INITIAL_ORGANIZERS: Organizador[] = [
  {
    id_organizador: 1,
    id_usuario: 2,
    nombre_entidad: 'Dirección de Cultura y Turismo de Purificación',
    contacto_email: 'cultura@purificacion-tolima.gov.co',
    contacto_telefono: '3158889900',
    nit: '890.701.234-1',
    verificado: true,
    descripcion: 'Ente encargado de velar por las tradiciones folclóricas, festivales y patrimonio de Purificación.'
  },
  {
    id_organizador: 2,
    id_usuario: 4,
    nombre_entidad: 'Instituto Municipal para el Deporte y la Recreación (IMDER)',
    contacto_email: 'deportes@purificacion-tolima.gov.co',
    contacto_telefono: '3117772233',
    nit: '890.701.234-2',
    verificado: true,
    descripcion: 'Promotor del deporte aficionado, escuelas de formación y actividades recreativas a orillas del Magdalena.'
  },
  {
    id_organizador: 3,
    id_usuario: 5,
    nombre_entidad: 'E.S.E. Hospital Nuevo San Rafael de Purificación',
    contacto_email: 'salud@hospitalpurificacion.gov.co',
    contacto_telefono: '3189994455',
    nit: '890.701.234-3',
    verificado: true,
    descripcion: 'Institución prestadora de servicios de salud pública y prevención en el municipio.'
  }
];

// Generate dates dynamically relative to current date (Aug 2026) so events look current and upcoming
const today = new Date();
const formatDate = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_EVENTS: Evento[] = [
  {
    id_evento: 1,
    nombre: 'Festival Folclórico y Cultural del Río Magdalena - Purificación 2026',
    fecha: formatDate(2),
    hora_inicio: '16:00',
    hora_fin: '22:30',
    lugar: 'Malecón Turístico y Plazoleta Principal Villa de las Palmas',
    descripcion: 'Encuentro de danzas folclóricas tolimenses, comparsas, muestras artesanales y muestras gastronómicas con viudo de capaz e insulsos tradicionales de Purificación.',
    id_categoria: 1, // Cultura
    id_organizador: 1,
    estado: 'programado',
    info_adicional: 'Entrada libre para toda la familia. Se recomienda llevar ropa fresca y calzado cómodo.',
    destacado: true,
    imagen_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
  },
  {
    id_evento: 2,
    nombre: 'Ciclopaseo Nocturno Comunitario "Ruta por el Magdalena"',
    fecha: formatDate(4),
    hora_inicio: '18:30',
    hora_fin: '20:30',
    lugar: 'Punto de encuentro: Parque Principal de Purificación',
    descripcion: 'Recorrido en bicicleta por las principales vías del casco urbano y el paso del Malecón. Promovemos la movilidad sostenible y la integración familiar.',
    id_categoria: 2, // Deporte
    id_organizador: 2,
    estado: 'programado',
    info_adicional: 'Uso obligatorio de casco y luces de reflectantes en las bicicletas. Acompañamiento de la Policía de Tránsito.',
    destacado: true,
    imagen_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=80'
  },
  {
    id_evento: 3,
    nombre: 'Jornada Masiva de Esterilización y Vacunación Antirrábica Canina y Felina',
    fecha: formatDate(6),
    hora_inicio: '08:00',
    hora_fin: '14:00',
    lugar: 'Coliseo Abierto Villa Olímpica',
    descripcion: 'Atención gratuita para mascotas de estratos 1 y 2 de Purificación. Incluye cirugía de esterilización, vacuna contra la rabia y desparasitación.',
    id_categoria: 5, // Bienestar Animal
    id_organizador: 3,
    estado: 'programado',
    info_adicional: 'Mascotas con ayuno de 8 horas. Llevar cobija. Los gatos deben ser transportados en guacal o tula respirable.',
    destacado: true,
    imagen_url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80'
  },
  {
    id_evento: 4,
    nombre: 'Brigada de Salud Pública y Tamizaje Cardiovascular',
    fecha: formatDate(8),
    hora_inicio: '07:30',
    hora_fin: '13:00',
    lugar: 'Centro de Salud Vereda Chenche Uno y Puesto de Salud Saludable',
    descripcion: 'Toma de tensión arterial, glicemia, tamizaje de peso y talla, citologías de cuello uterino y consulta médica preventiva gratuita.',
    id_categoria: 4, // Salud
    id_organizador: 3,
    estado: 'programado',
    info_adicional: 'Llevar documento de identidad original y carnet de salud o EPS.',
    destacado: false,
    imagen_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id_evento: 5,
    nombre: 'Feria Campesina y Mercado Verde "Sabores de Nuestra Tierra"',
    fecha: formatDate(10),
    hora_inicio: '06:00',
    hora_fin: '13:30',
    lugar: 'Plaza de Mercado Municipal de Purificación',
    descripcion: 'Venta directa de productores rurales de Purificación: frutas tropicales, cacao, plátano, cachama fresca, productos orgánicos y artesanías de la región.',
    id_categoria: 7, // Comunidad
    id_organizador: 1,
    estado: 'programado',
    info_adicional: 'Apoye al campesinado purificense comprando sin intermediarios. Traiga su bolsa reutilizable.',
    destacado: true,
    imagen_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80'
  },
  {
    id_evento: 6,
    nombre: 'Taller de Innovación Digital y Marketing para Comerciantes de Purificación',
    fecha: formatDate(12),
    hora_inicio: '15:00',
    hora_fin: '17:30',
    lugar: 'Biblioteca Pública Municipal Hernando Arango',
    descripcion: 'Capacitación práctica en creación de catálogo en WhatsApp Business, cobros digitales por PSE/Nequi y promoción del turismo local.',
    id_categoria: 3, // Educación
    id_organizador: 1,
    estado: 'programado',
    info_adicional: 'Cupos limitados a 35 participantes. Traer teléfono inteligente con datos.',
    destacado: false,
    imagen_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80'
  },
  {
    id_evento: 7,
    nombre: 'Torneo Municipal de Microfútbol Interbarrios "Copa Villa de las Palmas"',
    fecha: formatDate(15),
    hora_inicio: '19:00',
    hora_fin: '22:00',
    lugar: 'Cancha Polideportiva Barrio Camilo Torres',
    descripcion: 'Fase eliminatoria del torneo interbarrios con la participación de 16 equipos locales. Premiación a goleador, valla menos vencida y campeón.',
    id_categoria: 2, // Deporte
    id_organizador: 2,
    estado: 'programado',
    info_adicional: 'Entrada gratuita para los aficionados. Ambiente seguro y familiar.',
    destacado: false,
    imagen_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_NOTICES: Aviso[] = [
  {
    id_aviso: 1,
    titulo: 'Mantenimiento Preventivo de Planta de Tratamiento - Suspensión de Agua',
    tipo: 'corte_agua',
    descripcion: 'Empresas Públicas de Purificación informa lavados de tanques de almacenamiento e inspección en la tubería principal. Recolectar agua suficiente.',
    fecha_publicacion: formatDate(-1),
    fecha_expiracion: formatDate(1),
    sector_afectado: 'Barrios El Centro, Modelo, Ospina Perez y Camilo Torres',
    urgente: true,
    id_usuario_creador: 3
  },
  {
    id_aviso: 2,
    titulo: 'Mantenimiento en Redes Eléctricas de CELSIA Tolima',
    tipo: 'corte_luz',
    descripcion: 'Interrupción temporal del servicio de energía eléctrica para poda de árboles e instalación de transformador de alta capacidad.',
    fecha_publicacion: formatDate(0),
    fecha_expiracion: formatDate(3),
    sector_afectado: 'Veredas Chenche, Campoalegre y Zona Industrial de Purificación',
    urgente: true,
    id_usuario_creador: 3
  },
  {
    id_aviso: 3,
    titulo: 'Aviso de Cierre Temporal por Obras en Puente sobre Río Saldaña y Vía Purificación-Prado',
    tipo: 'vias',
    descripcion: 'Paso restringido a un solo carril entre las 08:00 a.m. y las 05:00 p.m. por parcheo y repavimentación en la calzada.',
    fecha_publicacion: formatDate(-2),
    fecha_expiracion: formatDate(5),
    sector_afectado: 'Acceso Sur de Purificación y Salida hacia Prado',
    urgente: false,
    id_usuario_creador: 3
  }
];

export const INITIAL_NOTIFICATIONS: Notificacion[] = [
  {
    id_notificacion: 1,
    id_usuario: 1,
    titulo: 'Aviso Urgente de Servicios Públicos',
    mensaje: 'Recordatorio: Mañana habrá corte programado de agua en el sector El Centro de Purificación.',
    fecha: formatDate(0),
    leida: false,
    tipo_ref: 'aviso',
    id_ref: 1
  },
  {
    id_notificacion: 2,
    id_usuario: 1,
    titulo: 'Nuevo evento en Cultura y Patrimonio',
    mensaje: 'Se ha publicado el "Festival Folclórico y Cultural del Río Magdalena". ¡Agrégalo a tus guardados!',
    fecha: formatDate(-1),
    leida: true,
    tipo_ref: 'evento',
    id_ref: 1
  }
];

export const INITIAL_USER_EVENTS: UsuarioEvento[] = [
  {
    id_usuario_evento: 1,
    id_usuario: 1,
    id_evento: 1,
    fecha_guardado: '2026-08-01'
  },
  {
    id_usuario_evento: 2,
    id_usuario: 1,
    id_evento: 3,
    fecha_guardado: '2026-08-02'
  }
];
