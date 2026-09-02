import { 
  ReporteVia, 
  CorteProgramado, 
  JornadaSaludEsterilizacion, 
  RegistroAuditoria,
  EncuestaCiudadana,
  ReporteFallaCiudadana
} from '../types';

export const BARRIOS_PURIFICACION = [
  'El Centro',
  'Ospina Pérez',
  'Camilo Torres',
  'El Salado',
  'Villa de las Palmas',
  'Santa Librada',
  'Barrio Hospital',
  'Modelo',
  'Santander',
  'Triana',
  'Puerto Peñón',
  'Malecón Turístico',
  'Vereda Chenche Asoleado',
  'Vereda Chenche Uno',
  'Vereda Campoalegre',
  'Vereda Hato Viejo',
  'Vereda Santa Inés',
  'Vereda Villa Esperanza'
];

export const CUADRILLAS_MUNICIPALES = [
  'Cuadrilla Obras Civiles #1 - Secretaría de Infraestructura',
  'Cuadrilla Mantenimiento Vial Local - Bacheo',
  'Cuadrilla Maquinaria Pesada & Vías Rurales',
  'Cuadrilla Redes & Alcantarillado EMPOPUR',
  'Cuadrilla Emergencias Eléctricas CELSIA Tolima',
  'Equipo Zoonosis y Salud Pública'
];

// Base GPS location for Purificación, Tolima: ~3.8582, -74.9285
export const PURIFICACION_COORDINATES: [number, number] = [3.8582, -74.9285];

// Suggested Detour Routes when main roads are closed
export interface RutaDesvio {
  id_desvio: number;
  nombre: string;
  motivo_cierre: string;
  tramoCerrado: [number, number][];
  rutaAlternativa: [number, number][];
  indicaciones: string;
  tiempoEstimadoMin: number;
  estado: 'activo' | 'planificado';
}

export const RUTAS_DESVIOS_SUGERIDOS: RutaDesvio[] = [
  {
    id_desvio: 1,
    nombre: 'Desvío Obras Malecón Turístico - Carrera 7',
    motivo_cierre: 'Hundimiento de calzada e intervención pesada en Carrera 7',
    tramoCerrado: [
      [3.8596, -74.9272],
      [3.8588, -74.9278]
    ],
    rutaAlternativa: [
      [3.8605, -74.9265],
      [3.8600, -74.9290],
      [3.8584, -74.9288],
      [3.8571, -74.9301]
    ],
    indicaciones: 'Girar en la Calle 3 hacia Carrera 5, continuar por el costado oriental del Parque Principal y conectar por Calle 6 hacia el sur.',
    tiempoEstimadoMin: 6,
    estado: 'activo'
  },
  {
    id_desvio: 2,
    nombre: 'Desvío Mantenimiento Red Matriz - Sector Hospital',
    motivo_cierre: 'Corte y zanja de tubería principal EMPOPUR en Calle 10',
    tramoCerrado: [
      [3.8560, -74.9315],
      [3.8550, -74.9325]
    ],
    rutaAlternativa: [
      [3.8575, -74.9310],
      [3.8565, -74.9340],
      [3.8545, -74.9330]
    ],
    indicaciones: 'Tomar la variante por Barrio Hospital subiendo por Carrera 8 hasta la intersección con Barrio Santa Librada.',
    tiempoEstimadoMin: 8,
    estado: 'activo'
  }
];

export const INITIAL_ENCUESTAS: EncuestaCiudadana[] = [
  {
    id_encuesta: 1,
    titulo: '¿Cuál sector vial debe priorizarse para pavimentación en el segundo semestre?',
    descripcion: 'La Alcaldía Municipal de Purificación consulta a la ciudadanía para destinar los recursos del fondo de malla vial urbana y rural.',
    categoria: 'obras',
    fecha_cierre: '2026-09-15',
    opciones: [
      { id_opcion: 1, texto: 'Acceso y corredor Malecón Turístico - Río Magdalena', votos: 142 },
      { id_opcion: 2, texto: 'Vía principal Barrio Santander hacia Escuela', votos: 89 },
      { id_opcion: 3, texto: 'Vía terciaria Vereda Chenche Asoleado', votos: 178 },
      { id_opcion: 4, texto: 'Conexión Barrio Camilo Torres con Ospina Pérez', votos: 65 }
    ],
    total_votos: 474,
    votos_usuarios: {},
    estado: 'activa'
  },
  {
    id_encuesta: 2,
    titulo: 'Horario preferido para las Jornadas Masivas de Esterilización de Mascotas',
    descripcion: 'Ayúdanos a coordinar con la Secretaría de Salud y Hospital Nuevo San Rafael el horario de mayor conveniencia.',
    categoria: 'salud',
    fecha_cierre: '2026-09-01',
    opciones: [
      { id_opcion: 1, texto: 'Sábados en la mañana (07:00 a.m. a 01:00 p.m.)', votos: 215 },
      { id_opcion: 2, texto: 'Domingos jornada continua (08:00 a.m. a 03:00 p.m.)', votos: 190 },
      { id_opcion: 3, texto: 'Días entre semana (Martes y Jueves)', votos: 42 }
    ],
    total_votos: 447,
    votos_usuarios: {},
    estado: 'activa'
  }
];

export const INITIAL_VIAS: ReporteVia[] = [
  {
    id_via: 101,
    titulo: 'Hundimiento severo de calzada en acceso al Malecón',
    direccion: 'Carrera 7 con Calle 4 - Sector Malecón',
    barrio: 'Malecón Turístico',
    coordenadas: [3.8596, -74.9272],
    severidad: 'alta',
    tipo_dano: 'Hundimiento Calzada',
    estado: 'reparacion',
    descripcion: 'Pérdida de banca y fisura profunda por socavación cercana a la margen del río. Afecta el tránsito de transporte intermunicipal.',
    foto_antes: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=700&auto=format&fit=crop&q=80',
    foto_despues: '',
    material_estimado: '8.5 m³ asfalto MDC-2 + 15 m³ base granular',
    cuadrilla_asignada: 'Cuadrilla Obras Civiles #1 - Secretaría de Infraestructura',
    fecha_reporte: '2026-08-10 09:30',
    fecha_actualizacion: '2026-08-16 14:20',
    reportado_por: 'Ing. Carlos Mendoza (Planeación)',
    costo_estimado_cop: 18500000,
    prioridad: 'urgente',
    origen_reporte: 'inspeccion_oficial'
  },
  {
    id_via: 102,
    titulo: 'Hueco profundo y desgaste de capa asfáltica',
    direccion: 'Calle 8 # 5-42 frente a Escuela Santander',
    barrio: 'Santander',
    coordenadas: [3.8571, -74.9301],
    severidad: 'media',
    tipo_dano: 'Hueco Profundo',
    estado: 'inspeccion',
    descripcion: 'Bache de aproximadamente 1.8 metros de diámetro y 18 cm de profundidad. Riesgo constante para motociclistas y rutas escolares.',
    foto_antes: 'https://images.unsplash.com/photo-1584463699039-b9d997d91d6f?w=700&auto=format&fit=crop&q=80',
    material_estimado: '2.5 m³ asfalto frío de parcheo',
    cuadrilla_asignada: 'Cuadrilla Mantenimiento Vial Local - Bacheo',
    fecha_reporte: '2026-08-12 11:15',
    fecha_actualizacion: '2026-08-14 08:00',
    reportado_por: 'Habitante Líder Comunal - JAC Santander',
    costo_estimado_cop: 3200000,
    prioridad: 'alta',
    origen_reporte: 'ciudadano',
    telefono_contacto: '3157778899'
  },
  {
    id_via: 103,
    titulo: 'Tapa de alcantarilla fracturada y rejilla colapsada',
    direccion: 'Carrera 4 con Calle 6 - Esquina Parque Principal',
    barrio: 'El Centro',
    coordenadas: [3.8584, -74.9288],
    severidad: 'alta',
    tipo_dano: 'Falla de Alcantarillado',
    estado: 'completado',
    descripcion: 'Reemplazo total de marco de hierro fundido y concreto hidráulico de alta resistencia por parte de EMPOPUR.',
    foto_antes: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=700&auto=format&fit=crop&q=80',
    foto_despues: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=700&auto=format&fit=crop&q=80',
    material_estimado: 'Marco fundido 60x60cm + Concreto MR-42',
    cuadrilla_asignada: 'Cuadrilla Redes & Alcantarillado EMPOPUR',
    fecha_reporte: '2026-08-05 16:45',
    fecha_actualizacion: '2026-08-15 17:30',
    reportado_por: 'Inspector de Tránsito Municipal',
    costo_estimado_cop: 2400000,
    prioridad: 'alta',
    origen_reporte: 'inspeccion_oficial'
  },
  {
    id_via: 104,
    titulo: 'Deslizamiento menor y lodo en vía terciaria',
    direccion: 'Km 2.5 Sector Entrada Vereda Chenche Asoleado',
    barrio: 'Vereda Chenche Asoleado',
    coordenadas: [3.8520, -74.9215],
    severidad: 'media',
    tipo_dano: 'Derrumbe/Obstrucción',
    estado: 'reportado',
    descripcion: 'Material de arrastre por lluvias de la cordillera. Paso restringido a un solo carril para camperos y motocicletas.',
    foto_antes: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&auto=format&fit=crop&q=80',
    material_estimado: 'Retiro mecánico 20 m³ + cuneteo',
    cuadrilla_asignada: 'Cuadrilla Maquinaria Pesada & Vías Rurales',
    fecha_reporte: '2026-08-15 06:20',
    reportado_por: 'Comunidad Veredal Chenche',
    costo_estimado_cop: 4500000,
    prioridad: 'media',
    origen_reporte: 'ciudadano',
    telefono_contacto: '3201112233'
  },
  {
    id_via: 105,
    titulo: 'Fisuras en bloque de pavimento y grietas cocodrilo',
    direccion: 'Calle 5 entre Carreras 8 y 9 - Sector Hospital',
    barrio: 'Barrio Hospital',
    coordenadas: [3.8562, -74.9318],
    severidad: 'baja',
    tipo_dano: 'Pavimento Agrietado',
    estado: 'inspeccion',
    descripcion: 'Fatiga del asfalto por tránsito de ambulancias y vehículos de carga. Se programa sellado de grietas con emulsión asfáltica.',
    foto_antes: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=700&auto=format&fit=crop&q=80',
    material_estimado: 'Emulsión catiónica CSS-1h + arena triturada',
    cuadrilla_asignada: 'Cuadrilla Mantenimiento Vial Local - Bacheo',
    fecha_reporte: '2026-08-14 10:00',
    reportado_por: 'Comité de Veeduría Ciudadana',
    costo_estimado_cop: 1800000,
    prioridad: 'rutinaria',
    origen_reporte: 'ciudadano'
  }
];

export const INITIAL_CORTES: CorteProgramado[] = [
  {
    id_corte: 201,
    tipo: 'agua',
    titulo: 'Mantenimiento Preventivo y Lavado de Tanques de Almacenamiento Central',
    motivo: 'Lavado periódico semestral exigido por la Secretaría de Salud del Tolima y desinfección de la planta de tratamiento de agua potable (PTAP).',
    sector_barrio: 'El Centro, Modelo, Ospina Pérez, Triana y Puerto Peñón',
    coordenadas: [3.8580, -74.9280],
    radio_afectacion_m: 650,
    fecha_inicio: '2026-08-19',
    hora_inicio: '06:00',
    fecha_estimada_fin: '2026-08-19',
    hora_estimada_fin: '18:00',
    cuadrilla_responsable: 'Cuadrilla Operativa Planta EMPOPUR (Ing. Javier Tovar)',
    empresa_prestadora: 'Empresas Públicas de Purificación EMPOPUR',
    estado: 'programado',
    urgente: true,
    poblacion_afectada_aprox: 8500,
    puntos_distribucion_emergencia: 'Carro tanque 1: Parque Principal (08:00 a 12:00) | Carro tanque 2: Parque Modelo (13:00 a 17:00)',
    creado_por: 'Ing. Rodrigo Cárdenas (Director Técnico EMPOPUR)'
  },
  {
    id_corte: 202,
    tipo: 'energia',
    titulo: 'Repotenciación de Circuito 13.2kV y Poda de Árboles en Líneas de Media Tensión',
    motivo: 'Instalación de seccionadores telecontrolados y cambio de aisladores de porcelana para evitar fluctuaciones por tormentas eléctricas.',
    sector_barrio: 'Santa Librada, Camilo Torres y Barrio Hospital',
    coordenadas: [3.8555, -74.9310],
    radio_afectacion_m: 450,
    fecha_inicio: '2026-08-22',
    hora_inicio: '07:30',
    fecha_estimada_fin: '2026-08-22',
    hora_estimada_fin: '15:30',
    cuadrilla_responsable: 'Cuadrilla Líneas Vivas CELSIA Tolima #4',
    empresa_prestadora: 'CELSIA Tolima S.A. E.S.P.',
    estado: 'programado',
    urgente: false,
    poblacion_afectada_aprox: 3200,
    puntos_distribucion_emergencia: 'Planta de emergencia conectada en Hospital Nuevo San Rafael.',
    creado_por: 'Centro de Control CELSIA Ibagué'
  },
  {
    id_corte: 203,
    tipo: 'gas',
    titulo: 'Empalme de Nueva Red Matriz Urbana y Pruebas de Hermeticidad',
    motivo: 'Ampliación de cobertura hacia el sector Villa de las Palmas y revisión de válvulas reguladoras barriales.',
    sector_barrio: 'Villa de las Palmas y El Salado',
    coordenadas: [3.8630, -74.9250],
    radio_afectacion_m: 350,
    fecha_inicio: '2026-08-16',
    hora_inicio: '13:00',
    fecha_estimada_fin: '2026-08-16',
    hora_estimada_fin: '17:00',
    cuadrilla_responsable: 'Cuadrilla Técnica Redes Alcanos Tolima',
    empresa_prestadora: 'Alcanos de Colombia S.A. E.S.P.',
    estado: 'restablecido',
    urgente: false,
    poblacion_afectada_aprox: 1800,
    creado_por: 'Ing. Germán Morales (Alcanos)'
  }
];

export const INITIAL_JORNADAS_SALUD: JornadaSaludEsterilizacion[] = [
  {
    id_jornada: 301,
    titulo: 'Gran Jornada Municipal de Esterilización Quirúrgica Canina y Felina',
    tipo: 'esterilizacion_canina_felina',
    lugar: 'Coliseo Abierto Villa Olímpica (Canchas Cubiertas)',
    barrio: 'Villa de las Palmas',
    coordenadas: [3.8625, -74.9260],
    fecha: '2026-08-21',
    hora_inicio: '07:30',
    hora_fin: '15:30',
    cupos_totales: 60,
    cupos_ocupados: 48,
    personal_asignado: [
      { id_personal: 1, nombre: 'Dr. Mario Ortiz Méndez', cargo: 'Médico Veterinario Zootecnista (Cirujano Principal)', tarjeta_profesional: 'COMVEZCOL # 14892', entidad: 'Secretaría de Salud Departamental / Municipal' },
      { id_personal: 2, nombre: 'Dra. Patricia Navarro', cargo: 'Médica Veterinaria Anestesióloga', tarjeta_profesional: 'COMVEZCOL # 18320', entidad: 'E.S.E. Hospital Nuevo San Rafael' },
      { id_personal: 3, nombre: 'Aux. Lucía Silva', cargo: 'Auxiliar Técnica de Zoonosis y Recuperación', entidad: 'Dirección de Salud Pública' },
      { id_personal: 4, nombre: 'Aux. Andrés Guarnizo', cargo: 'Coordinador de Triage y Registro de Pacientes', entidad: 'Alcaldía Municipal de Purificación' }
    ],
    inscritos: [
      { id_inscrito: 1, id_jornada: 301, tutor_nombre: 'María Camila Gómez', tutor_cedula: '1.110.456.789', tutor_telefono: '3142223344', barrio: 'El Centro', mascota_nombre: 'Rocky', especie: 'canino', raza: 'Criollo', edad_meses: 18, hora_turno: '07:30', estado: 'inscrito' },
      { id_inscrito: 2, id_jornada: 301, tutor_nombre: 'José Antonio Perdomo', tutor_cedula: '14.289.330', tutor_telefono: '3118889911', barrio: 'Camilo Torres', mascota_nombre: 'Luna', especie: 'felino', raza: 'Común Europeo', edad_meses: 10, hora_turno: '08:00', estado: 'inscrito' },
      { id_inscrito: 3, id_jornada: 301, tutor_nombre: 'Ana Mercedes Tique', tutor_cedula: '65.789.120', tutor_telefono: '3205557788', barrio: 'Ospina Pérez', mascota_nombre: 'Max', especie: 'canino', raza: 'Labrador Mestizo', edad_meses: 24, hora_turno: '08:30', estado: 'inscrito' },
      { id_inscrito: 4, id_jornada: 301, tutor_nombre: 'Wilson Prada', tutor_cedula: '93.388.400', tutor_telefono: '3157771122', barrio: 'Modelo', mascota_nombre: 'Michi', especie: 'felino', raza: 'Siamés mestizo', edad_meses: 14, hora_turno: '09:00', estado: 'atendido' },
      { id_inscrito: 5, id_jornada: 301, tutor_nombre: 'Esperanza Lozano', tutor_cedula: '38.200.111', tutor_telefono: '3129990033', barrio: 'Santander', mascota_nombre: 'Toby', especie: 'canino', raza: 'Criollo', edad_meses: 36, hora_turno: '09:30', estado: 'inscrito' }
    ],
    requisitos: '1. Ayuno estricto de agua y comida de 8 horas. 2. Traer carné de vacunación si lo tiene. 3. Gatos en guacal o tula aireada. 4. Perros con collar y bozal si son de manejo especial. 5. Traer cobija térmica para recuperación.',
    estado: 'programada',
    responsable_entidad: 'Secretaría de Salud y Protección Social de Purificación',
    creado_por: 'Dra. Elena Vargas (Secretaria de Salud Municipal)'
  },
  {
    id_jornada: 302,
    titulo: 'Brigada Rural de Vacunación Antirrábica y Desparasitación Gratuita',
    tipo: 'vacunacion_antirrabica',
    lugar: 'Puesto de Salud Rural Vereda Chenche Uno',
    barrio: 'Vereda Chenche Uno',
    coordenadas: [3.8490, -74.9180],
    fecha: '2026-08-25',
    hora_inicio: '08:00',
    hora_fin: '13:00',
    cupos_totales: 100,
    cupos_ocupados: 35,
    personal_asignado: [
      { id_personal: 5, nombre: 'Dr. Hernando Bonilla', cargo: 'Médico Veterinario Epidemiólogo', tarjeta_profesional: 'COMVEZCOL # 09412', entidad: 'Secretaría de Salud' },
      { id_personal: 6, nombre: 'Tec. Viviana Quintero', cargo: 'Técnica de Saneamiento Ambiental', entidad: 'Hospital Nuevo San Rafael' }
    ],
    inscritos: [
      { id_inscrito: 6, id_jornada: 302, tutor_nombre: 'Fabio Nelson Tapiero', tutor_cedula: '5.890.123', tutor_telefono: '3174448899', barrio: 'Vereda Chenche Uno', mascota_nombre: 'Kaiser', especie: 'canino', raza: 'Pastor mestizo', edad_meses: 40, hora_turno: '08:15', estado: 'inscrito' },
      { id_inscrito: 7, id_jornada: 302, tutor_nombre: 'Gloria Inés Yara', tutor_cedula: '28.900.555', tutor_telefono: '3161112244', barrio: 'Vereda Chenche Uno', mascota_nombre: 'Pelusa', especie: 'felino', raza: 'Criollo', edad_meses: 12, hora_turno: '08:45', estado: 'inscrito' }
    ],
    requisitos: 'Mascotas mayores de 3 meses en buen estado de salud. Registro por orden de llegada con cédula del propietario.',
    estado: 'programada',
    responsable_entidad: 'E.S.E. Hospital Nuevo San Rafael de Purificación',
    creado_por: 'Dra. Elena Vargas (Secretaria de Salud Municipal)'
  }
];

export const INITIAL_AUDIT_LOGS: RegistroAuditoria[] = [
  {
    id_log: 1,
    timestamp: '2026-08-18 07:45',
    funcionario_nombre: 'Ing. Carlos Mendoza',
    funcionario_rol: 'Secretaría de Infraestructura y Vías',
    modulo: 'Vías',
    accion: 'ACTUALIZACIÓN_ESTADO',
    descripcion: 'Cambió estado del reporte #101 "Hundimiento en acceso al Malecón" de [Inspección] a [En Reparación]. Asignó Cuadrilla #1.',
    id_referencia: 101,
    detalles_anteriores: 'Estado: inspeccion',
    detalles_nuevos: 'Estado: reparacion | Cuadrilla: Obras Civiles #1'
  },
  {
    id_log: 2,
    timestamp: '2026-08-17 16:30',
    funcionario_nombre: 'Dra. Elena Vargas',
    funcionario_rol: 'Secretaría de Salud y Protección Social',
    modulo: 'Salud & Esterilización',
    accion: 'ASIGNACIÓN_PERSONAL',
    descripcion: 'Asignó al equipo quirúrgico liderado por el Dr. Mario Ortiz y Dra. Patricia Navarro para la jornada del 21 de agosto en Villa Olímpica.',
    id_referencia: 301,
    detalles_nuevos: '4 profesionales asignados, 60 cupos habilitados'
  },
  {
    id_log: 3,
    timestamp: '2026-08-17 09:15',
    funcionario_nombre: 'Ing. Rodrigo Cárdenas',
    funcionario_rol: 'Jefe Operativo EMPOPUR',
    modulo: 'Cortes',
    accion: 'CREACIÓN',
    descripcion: 'Programó corte de agua en sector El Centro, Modelo y Ospina Pérez para el 19 de agosto por lavado de tanques centrales.',
    id_referencia: 201,
    detalles_nuevos: 'Radio: 650m | Horario: 06:00 a 18:00'
  },
  {
    id_log: 4,
    timestamp: '2026-08-15 17:35',
    funcionario_nombre: 'Ing. Carlos Mendoza',
    funcionario_rol: 'Secretaría de Infraestructura y Vías',
    modulo: 'Vías',
    accion: 'CIERRE_INCIDENCIA',
    descripcion: 'Cerró y marcó como [Completado] el reporte #103 "Tapa de alcantarilla Parque Principal". Adjuntó fotografía de evidencia de finalización.',
    id_referencia: 103,
    detalles_anteriores: 'Estado: reparacion',
    detalles_nuevos: 'Estado: completado | Evidencia fotográfica cargada'
  },
  {
    id_log: 5,
    timestamp: '2026-08-14 11:20',
    funcionario_nombre: 'Arq. Felipe Triana',
    funcionario_rol: 'Dirección de Planeación Municipal',
    modulo: 'Mapa',
    accion: 'CAMBIO_COORDENADAS',
    descripcion: 'Reubicó marcador geográfico de falla vial #105 mediante herramienta de arrastre en el mapa a las coordenadas [3.8615, -74.9330].',
    id_referencia: 105
  },
  {
    id_log: 6,
    timestamp: '2026-08-13 14:00',
    funcionario_nombre: 'Aux. Andrés Guarnizo',
    funcionario_rol: 'Coordinador Zoonosis',
    modulo: 'Salud & Esterilización',
    accion: 'REGISTRO_INSCRIPCIÓN',
    descripcion: 'Inscribió mascota canina "Max" (Tutor: Ana Mercedes Tique) en turno de las 08:30 a.m. para esterilización.',
    id_referencia: 301
  }
];

export const INITIAL_FALLAS: ReporteFallaCiudadana[] = [
  {
    id_falla: 501,
    tipo: 'aseo',
    descripcion: 'Acumulación de residuos sólidos y ramas secas en esquina del parque infantil tras la jornada del fin de semana.',
    ubicacion: 'Barrio Ospina Pérez, frente al parque infantil',
    barrio: 'Ospina Pérez',
    coordenadas: [3.8575, -74.9290],
    nombre_ciudadano: 'María Camila Rozo',
    correo_ciudadano: 'mcrozo@purificacion.gov.co',
    telefono_ciudadano: '312 456 7890',
    fecha_reporte: '2026-08-28 09:30',
    estado: 'cuadrilla_asignada',
    empresa_responsable: 'EMPOPUR E.S.P. - División Aseo',
    cuadrilla_asignada: 'Ruta 2 Recolección Pesada',
    respuesta_oficial: 'Cuadrilla de barrido y volqueta programada para hoy a las 2:00 PM.',
    puntos_ganados: 30
  },
  {
    id_falla: 502,
    tipo: 'agua',
    descripcion: 'Fuga de agua potable visible en la acometida sobre la acera peatonal con pérdida constante de presión.',
    ubicacion: 'Carrera 7 con Calle 5, Barrio El Centro',
    barrio: 'El Centro',
    coordenadas: [3.8582, -74.9285],
    nombre_ciudadano: 'Julián Gómez',
    correo_ciudadano: 'jgomez@gmail.com',
    telefono_ciudadano: '310 987 6543',
    fecha_reporte: '2026-08-27 14:15',
    estado: 'en_reparacion',
    empresa_responsable: 'EMPOPUR E.S.P. - Acueducto',
    cuadrilla_asignada: 'Técnicos de Redes Primarias',
    respuesta_oficial: 'Técnicos se encuentran en sitio realizando cambio de válvula reguladora.',
    puntos_ganados: 30
  },
  {
    id_falla: 503,
    tipo: 'luz',
    descripcion: 'Luminaria de alumbrado público parpadea constantemente y no ilumina el tramo peatonal.',
    ubicacion: 'Calle 8 # 3-45, Barrio Santa Librada',
    barrio: 'Santa Librada',
    coordenadas: [3.8590, -74.9310],
    nombre_ciudadano: 'Claudia Marcela Peña',
    fecha_reporte: '2026-08-25 19:40',
    estado: 'resuelto',
    empresa_responsable: 'CELSIA Tolima & Alumbrado Purificación',
    fecha_solucion: '2026-08-26 11:00',
    respuesta_oficial: 'Se realizó reemplazo de bombilla LED de 100W y fotocelda.',
    puntos_ganados: 30
  },
  {
    id_falla: 504,
    tipo: 'vias',
    descripcion: 'Hueco de gran profundidad formado por aguas lluvias cerca al reductor de velocidad.',
    ubicacion: 'Avenida Santander frente a ferretería Central',
    barrio: 'Santander',
    coordenadas: [3.8610, -74.9320],
    nombre_ciudadano: 'Pedro Nel Ospina',
    fecha_reporte: '2026-08-24 08:20',
    estado: 'en_revision',
    empresa_responsable: 'Secretaría de Infraestructura y Vías',
    respuesta_oficial: 'Ingeniero de obras programó visita técnica para cubicación de asfalto.',
    puntos_ganados: 30
  }
];
