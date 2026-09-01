export interface EmergencyContact {
  id: string;
  nombre: string;
  entidad: string;
  categoria: 'urgencias' | 'seguridad' | 'servicios' | 'ambiental' | 'institucional';
  telefono: string;
  telefonoAlt?: string;
  whatsapp?: string;
  direccion: string;
  horario: string;
  descripcion: string;
  icono: string;
  badge?: string;
}

export interface RioStationStatus {
  rio: string;
  estacion: string;
  nivelActualMetros: number;
  nivelAlertaAmarilla: number;
  nivelAlertaNaranja: number;
  nivelAlertaRoja: number;
  tendencia: 'estable' | 'subiendo' | 'bajando';
  estado: 'normal' | 'amarilla' | 'naranja' | 'roja';
  ultimaActualizacion: string;
  sectoresRiesgo: string[];
  recomendaciones: string[];
}

export interface RutaAseoBarrio {
  dia: string;
  tipoResiduo: 'Ordinarios' | 'Reciclables' | 'Orgánicos';
  horario: string;
  barrios: string[];
  color: string;
  icono: string;
}

export interface TramiteMunicipal {
  id: string;
  nombre: string;
  dependencia: string;
  descripcion: string;
  requisitos: string[];
  costo: string;
  tiempoRespuesta: string;
  modalidad: 'Presencial' | 'Virtual' | 'Mixta';
  lugar: string;
  enlaceOficial?: string;
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'hospital',
    nombre: 'Hospital La Candelaria E.S.E.',
    entidad: 'Centro Hospitalario de Purificación',
    categoria: 'urgencias',
    telefono: '6082280015',
    telefonoAlt: '3143548902',
    whatsapp: '573143548902',
    direccion: 'Carrera 4 # 9-45, Barrio Ospina Pérez',
    horario: 'Urgencias 24 Horas / Consulta 7:00 AM - 5:00 PM',
    descripcion: 'Atención de emergencias médicas, ambulancias, laboratorio clínico y hospitalización de primer y segundo nivel.',
    icono: '🏥',
    badge: 'Urgencias 24/7'
  },
  {
    id: 'bomberos',
    nombre: 'Cuerpo de Bomberos Voluntarios',
    entidad: 'Gestión del Riesgo y Socorro',
    categoria: 'urgencias',
    telefono: '6082280119',
    telefonoAlt: '3118923401',
    whatsapp: '573118923401',
    direccion: 'Calle 7 # 3-20, Centro',
    horario: '24 Horas Activo',
    descripcion: 'Control de incendios forestales y estructurales, rescate acuático en el Río Magdalena, retiro de panales y árboles caídos.',
    icono: '🚒',
    badge: 'Respuesta Inmediata'
  },
  {
    id: 'policia',
    nombre: 'Estación de Policía Purificación',
    entidad: 'Policía Nacional de Colombia (Distrito Purificación)',
    categoria: 'seguridad',
    telefono: '123',
    telefonoAlt: '3203024567',
    whatsapp: '573203024567',
    direccion: 'Carrera 6 con Calle 5, Plaza Principal',
    horario: '24 Horas',
    descripcion: 'Cuadrantes de vigilancia comunitaria, seguridad ciudadana, resolución pacífica de conflictos y patrullajes rurales.',
    icono: '👮‍♂️',
    badge: 'Línea 123'
  },
  {
    id: 'defensa_civil',
    nombre: 'Defensa Civil Colombiana - Junta Purificación',
    entidad: 'Atención a Desastres y Emergencias',
    categoria: 'urgencias',
    telefono: '3138890234',
    whatsapp: '573138890234',
    direccion: 'Barrio Santa Bárbara',
    horario: '24 Horas en Contingencias',
    descripcion: 'Evacuaciones preventivas, primeros auxilios en eventos masivos y monitoreo de crecientes súbitas.',
    icono: '🧡',
    badge: 'Voluntariado'
  },
  {
    id: 'empur',
    nombre: 'Empresas Públicas de Purificación (EMPUR E.S.P.)',
    entidad: 'Acueducto, Alcantarillado y Aseo',
    categoria: 'servicios',
    telefono: '6082280456',
    telefonoAlt: '3104567890',
    whatsapp: '573104567890',
    direccion: 'Calle 6 # 5-18, Palacio Municipal',
    horario: 'Lunes a Viernes 7:30 AM - 12:00 PM y 2:00 PM - 5:30 PM',
    descripcion: 'Reporte de fugas matrices de agua potable, taponamiento de alcantarillas, rutas de aseo y solicitudes de carro tanque.',
    icono: '💧',
    badge: 'Servicio Público'
  },
  {
    id: 'celsia',
    nombre: 'CELSIA Tolima (Línea de Energía)',
    entidad: 'Distribución y Comercialización de Energía Eléctrica',
    categoria: 'servicios',
    telefono: '018000112115',
    telefonoAlt: '6082770000',
    whatsapp: '573110112115',
    direccion: 'Oficina Virtual y Puntos de Atención Tolima',
    horario: 'Reporte de Daños 24 Horas',
    descripcion: 'Cables caídos, transformadores averiados, interrupción del servicio eléctrico y alumbrado público.',
    icono: '⚡',
    badge: 'Línea Gratuita'
  },
  {
    id: 'alcanos',
    nombre: 'ALCANOS de Colombia (Gas Natural)',
    entidad: 'Distribución de Gas Domiciliario',
    categoria: 'servicios',
    telefono: '018000918808',
    telefonoAlt: '164',
    direccion: 'Carrera 7 # 6-30',
    horario: 'Emergencias 24 Horas (Línea 164)',
    descripcion: 'Olor a gas, fugas en acometidas, suspensiones del servicio y mantenimiento de medidores.',
    icono: '🔥',
    badge: 'Línea 164'
  },
  {
    id: 'cortolima',
    nombre: 'CORTOLIMA (Dirección Territorial Suroriente)',
    entidad: 'Corporación Autónoma Regional del Tolima',
    categoria: 'ambiental',
    telefono: '6082654551',
    whatsapp: '573164476132',
    direccion: 'Sede Territorial Purificación - Prado',
    horario: 'Lunes a Viernes 8:00 AM - 4:00 PM',
    descripcion: 'Protección de cuenca del Río Magdalena, rescate de fauna silvestre, permisos de aprovechamiento forestal y denuncias ambientales.',
    icono: '🌳',
    badge: 'Autoridad Ambiental'
  },
  {
    id: 'personeria',
    nombre: 'Personería Municipal de Purificación',
    entidad: 'Veeduría Ciudadana y Derechos Humanos',
    categoria: 'institucional',
    telefono: '6082280234',
    whatsapp: '573156781234',
    direccion: 'Plaza Principal, 2do Piso Alcaldía',
    horario: 'Lunes a Viernes 8:00 AM - 12:00 PM y 2:00 PM - 5:00 PM',
    descripcion: 'Recepción de PQRS, protección del debido proceso, asesoría jurídica a víctimas y vigilancia de servicios públicos.',
    icono: '⚖️',
    badge: 'Control Social'
  }
];

export const RIO_MAGDALENA_STATUS: RioStationStatus = {
  rio: 'Río Magdalena',
  estacion: 'Estación Hidrológica Purificación (Paso del Río)',
  nivelActualMetros: 4.85,
  nivelAlertaAmarilla: 5.50,
  nivelAlertaNaranja: 6.80,
  nivelAlertaRoja: 7.50,
  tendencia: 'estable',
  estado: 'normal',
  ultimaActualizacion: 'Hoy, Hace 25 minutos (IDEAM / CORTOLIMA)',
  sectoresRiesgo: [
    'Barrio Ospina Pérez (zona baja ribereña)',
    'Sector Camellón del Río',
    'Vereda Santa Bárbara Ribera',
    'Sector Malecón Turístico',
    'Vereda San Antonio Playas'
  ],
  recomendaciones: [
    'Pescadores y lancheros deben portar chaleco salvavidas obligatorio.',
    'Evitar nadar en zonas de remolino bajo el Puente Ospina Pérez.',
    'No arrojar escombros a las rondas hídricas del río ni a las quebradas tributarias.',
    'En caso de fuertes lluvias en la cuenca alta (Huila), estar atentos a la sirena comunitaria.'
  ]
};

export const RUTAS_ASEO: RutaAseoBarrio[] = [
  {
    dia: 'Lunes y Jueves',
    tipoResiduo: 'Ordinarios',
    horario: '6:00 AM - 12:00 PM',
    barrios: ['Centro', 'El Triunfo', 'Ospina Pérez', 'Santa Bárbara', 'Villa del Sol', 'El Refugio'],
    color: '#0D47A1',
    icono: '🗑️'
  },
  {
    dia: 'Martes y Viernes',
    tipoResiduo: 'Ordinarios',
    horario: '6:00 AM - 12:00 PM',
    barrios: ['La Arboleda', 'Los Mangos', 'San Jerónimo', 'Santander', 'Buenos Aires', 'Nuevo Horizonte'],
    color: '#1565C0',
    icono: '🗑️'
  },
  {
    dia: 'Miércoles',
    tipoResiduo: 'Reciclables',
    horario: '7:00 AM - 2:00 PM',
    barrios: ['Todos los Barrios del Casco Urbano y Zona Comercial'],
    color: '#10b981',
    icono: '♻️'
  },
  {
    dia: 'Sábados',
    tipoResiduo: 'Orgánicos',
    horario: '5:00 AM - 11:00 AM',
    barrios: ['Plaza de Mercado', 'Zona Gastronómica Malecón', 'Comercio Centro'],
    color: '#f59e0b',
    icono: '🥬'
  }
];

export const TRAMITES_MUNICIPALES: TramiteMunicipal[] = [
  {
    id: 'predial',
    nombre: 'Liquidación y Pago de Impuesto Predial Unificado',
    dependencia: 'Secretaría de Hacienda Municipal',
    descripcion: 'Obtén tu factura del impuesto predial con descuentos por pronto pago de hasta el 15% vigentes.',
    requisitos: [
      'Número de Cédula del Propietario',
      'Número de Ficha Catastral o Referencia del Inmueble (recibo anterior)'
    ],
    costo: 'Gratuito (Solo el valor liquidado del impuesto)',
    tiempoRespuesta: 'Inmediata',
    modalidad: 'Mixta',
    lugar: 'Ventanilla Única de Hacienda, Palacio Municipal o Portal Web',
    enlaceOficial: 'https://purificacion-tolima.gov.co'
  },
  {
    id: 'residencia',
    nombre: 'Certificado de Residencia Municipal',
    dependencia: 'Secretaría General y de Gobierno',
    descripcion: 'Documento oficial que certifica que el ciudadano habita en el municipio de Purificación para trámites laborales o subsidios.',
    requisitos: [
      'Fotocopia de la Cédula de Ciudadanía',
      'Copia de recibo de servicio público (agua o energía reciente)',
      'Certificado de la Junta de Acción Comunal (JAC) de su barrio o vereda'
    ],
    costo: 'Gratuito',
    tiempoRespuesta: '24 a 48 horas hábiles',
    modalidad: 'Presencial',
    lugar: 'Secretaría de Gobierno, 1er Piso Alcaldía'
  },
  {
    id: 'sisben',
    nombre: 'Encuesta Nueva o Actualización del Sisbén IV',
    dependencia: 'Oficina Municipal del Sisbén',
    descripcion: 'Solicitud para la aplicación de la ficha de caracterización socioeconómica Sisbén IV para acceso a programas sociales.',
    requisitos: [
      'Documento de identidad de todos los miembros del núcleo familiar',
      'Dirección exacta de la vivienda en Purificación',
      'Recibo de servicio público con nomenclatura'
    ],
    costo: 'Gratuito',
    tiempoRespuesta: '8 a 15 días hábiles para visita de encuestador',
    modalidad: 'Presencial',
    lugar: 'Oficina Sisbén, Casa de la Cultura / Alcaldía'
  },
  {
    id: 'pqrs',
    nombre: 'Radicación de Peticiones, Quejas, Reclamos y Sugerencias (PQRS)',
    dependencia: 'Oficina de Atención al Ciudadano y Control Interno',
    descripcion: 'Canal formal para radicar solicitudes de intervención de vías, denuncias, peticiones de información y sugerencias.',
    requisitos: [
      'Datos completos del solicitante (nombre, cédula, teléfono, correo)',
      'Exposición clara y concisa de los hechos',
      'Evidencias o soportes (fotos, documentos si aplica)'
    ],
    costo: 'Gratuito',
    tiempoRespuesta: '10 a 15 días hábiles según Ley 1755 de 2015',
    modalidad: 'Mixta',
    lugar: 'Ventanilla Única de Radicación o Plataforma PurifiCalendario'
  },
  {
    id: 'esterilizacion_cupo',
    nombre: 'Inscripción a Jornada Municipal de Zoonosis y Esterilización',
    dependencia: 'Secretaría de Salud y Protección Animal',
    descripcion: 'Registro prioritario para caninos y felinos en condición de vulnerabilidad para esterilización quirúrgica y vacunación antirrábica.',
    requisitos: [
      'Mascota mayor a 4 meses y menor a 7 años en buen estado de salud',
      'Ayuno de 8 horas previas (agua y comida)',
      'Presentar carné de vacunas si lo posee y llevar manta para recuperación'
    ],
    costo: '100% Gratuito subsidiado por el Municipio',
    tiempoRespuesta: 'Asignación de turno según cupos de la jornada',
    modalidad: 'Mixta',
    lugar: 'Puntos móviles por barrio o desde la pestaña Zoonosis de PurifiCalendario'
  }
];

export interface FarmaciaTurno {
  nombre: string;
  direccion: string;
  barrio: string;
  telefono: string;
  es24Horas: boolean;
  horario: string;
}

export const FARMACIAS_TURNO: FarmaciaTurno[] = [
  {
    nombre: 'Droguería La Principal de Purificación',
    direccion: 'Carrera 5 # 6-24',
    barrio: 'El Centro',
    telefono: '6082280145',
    es24Horas: true,
    horario: '24 Horas de Turno'
  },
  {
    nombre: 'Drogas La Rebaja Purificación',
    direccion: 'Calle 7 # 4-38',
    barrio: 'El Centro',
    telefono: '6082280290',
    es24Horas: true,
    horario: '6:00 AM - 11:00 PM'
  },
  {
    nombre: 'Farmacia San Roque',
    direccion: 'Carrera 4 # 8-12',
    barrio: 'Ospina Pérez',
    telefono: '3124567891',
    es24Horas: false,
    horario: '7:00 AM - 9:00 PM'
  },
  {
    nombre: 'Droguería Multisalud Purificación',
    direccion: 'Calle 5 # 7-10',
    barrio: 'Santa Bárbara',
    telefono: '3157890123',
    es24Horas: false,
    horario: '7:00 AM - 10:00 PM'
  }
];

export const FAQS_PURIFICACION = [
  {
    pregunta: '¿Dónde se reporta un daño en la red de acueducto o alcantarillado?',
    respuesta: 'Puedes radicarlo inmediatamente en la sección "Reporte Vecinal" de PurifiCalendario, o comunicarte a la línea de emergencias de EMPUR E.S.P. al 608-228-0456 o WhatsApp 310-456-7890.'
  },
  {
    pregunta: '¿Qué días funciona la Plaza de Mercado y el Mercado Campesino?',
    respuesta: 'La Plaza de Mercado Central atiende todos los días, con días de abastecimiento mayorista y mercado campesino los Viernes, Sábados y Domingos desde las 5:00 AM con productos frescos del campo purifiquense.'
  },
  {
    pregunta: '¿Cómo inscribir a mi mascota en las jornadas de esterilización?',
    respuesta: 'Ingresa al Centro de Operaciones en la pestaña "Zoonosis", ubica la jornada programada en tu barrio o coliseo más cercano y haz clic en "Inscribir Mascota". Es totalmente gratuito.'
  },
  {
    pregunta: '¿Cuál es el horario de atención en la Alcaldía Municipal?',
    respuesta: 'El Palacio Municipal de Purificación atiende al público de Lunes a Jueves de 7:30 AM a 12:00 PM y de 2:00 PM a 5:30 PM; los Viernes de 7:30 AM a 12:00 PM y de 2:00 PM a 4:30 PM.'
  },
  {
    pregunta: '¿Cómo enterarme de cortes programados de agua o energía?',
    respuesta: 'En PurifiCalendario puedes activar las "Alertas Push" en el botón superior o revisar el visor geográfico en vivo donde se marcan las zonas con cortes y radios de afectación actualizados.'
  }
];
