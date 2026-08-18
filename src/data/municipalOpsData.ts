import { 
  ReporteVia, 
  CorteProgramado, 
  JornadaSaludEsterilizacion, 
  RegistroAuditoria 
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

// Base GPS location for Purificación, Tolima: ~3.8582, -74.9285
export const PURIFICACION_COORDINATES: [number, number] = [3.8582, -74.9285];

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
    prioridad: 'urgente'
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
    cuadrilla_asignada: 'Cuadrilla Mantenimiento Vial Local',
    fecha_reporte: '2026-08-12 11:15',
    fecha_actualizacion: '2026-08-14 08:00',
    reportado_por: 'Habitante Líder Comunal - JAC Santander',
    costo_estimado_cop: 3200000,
    prioridad: 'alta'
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
    cuadrilla_asignada: 'Cuadrilla Redes EMPOPUR',
    fecha_reporte: '2026-08-05 16:45',
    fecha_actualizacion: '2026-08-15 17:30',
    reportado_por: 'Inspector de Tránsito Municipal',
    costo_estimado_cop: 2400000,
    prioridad: 'alta'
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
    descripcion: 'Desprendimiento de talud por lluvias en la madrugada. Paso restringido a un solo carril de camperos y camiones lecheros.',
    foto_antes: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&auto=format&fit=crop&q=80',
    material_estimado: 'Horas máquina retroexcavadora + Motoniveladora',
    cuadrilla_asignada: 'Banco de Maquinaria Amarilla Gobernación-Municipio',
    fecha_reporte: '2026-08-17 06:20',
    fecha_actualizacion: '2026-08-17 07:10',
    reportado_por: 'Presidente JAC Chenche Asoleado',
    costo_estimado_cop: 5600000,
    prioridad: 'alta'
  },
  {
    id_via: 105,
    titulo: 'Pavimento agrietado y piel de cocodrilo',
    direccion: 'Avenida Principal Barrio Camilo Torres # 12-15',
    barrio: 'Camilo Torres',
    coordenadas: [3.8615, -74.9330],
    severidad: 'baja',
    tipo_dano: 'Pavimento Agrietado',
    estado: 'inspeccion',
    descripcion: 'Agrietamiento superficial sobre 60 metros lineales. Requiere fresado y sello de juntas asfálticas.',
    foto_antes: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=700&auto=format&fit=crop&q=80',
    material_estimado: 'Emulsión asfáltica de rotura rápida + Gravilla 3/8',
    cuadrilla_asignada: 'Cuadrilla Mantenimiento Vial Local',
    fecha_reporte: '2026-08-14 10:00',
    fecha_actualizacion: '2026-08-15 09:30',
    reportado_por: 'Arq. Felipe Triana (Planeación)',
    costo_estimado_cop: 4100000,
    prioridad: 'media'
  }
];

export const INITIAL_CORTES: CorteProgramado[] = [
  {
    id_corte: 201,
    tipo: 'agua',
    titulo: 'Corte Programado por Lavado de Tanques de Almacenamiento Central',
    motivo: 'Mantenimiento preventivo anual, desinfección de celdas de almacenamiento y calibración de macro-medidores en la planta El Diamante.',
    sector_barrio: 'El Centro, Modelo, Ospina Pérez y Camilo Torres',
    coordenadas: [3.8582, -74.9285],
    radio_afectacion_m: 650,
    fecha_inicio: '2026-08-19',
    hora_inicio: '06:00',
    fecha_estimada_fin: '2026-08-19',
    hora_estimada_fin: '18:00',
    cuadrilla_responsable: 'Cuadrilla Técnica #2 EMPOPUR - Red de Distribución',
    empresa_prestadora: 'Empresas Públicas de Purificación EMPOPUR',
    estado: 'programado',
    urgente: true,
    poblacion_afectada_aprox: 6200,
    puntos_distribucion_emergencia: 'Carrotanque móvil en Parque Principal y frente al Hospital Nuevo San Rafael',
    creado_por: 'Ing. Rodrigo Cárdenas (Jefe Técnico EMPOPUR)'
  },
  {
    id_corte: 202,
    tipo: 'energia',
    titulo: 'Mantenimiento en Línea de Media Tensión 13.2 kV y Poda de Árboles',
    motivo: 'Instalación de reconectador automático y despeje de ramas sobre circuitos primarios de la subestación Purificación.',
    sector_barrio: 'Vereda Chenche Asoleado y Vereda Campoalegre',
    coordenadas: [3.8530, -74.9210],
    radio_afectacion_m: 900,
    fecha_inicio: '2026-08-18',
    hora_inicio: '08:00',
    fecha_estimada_fin: '2026-08-18',
    hora_estimada_fin: '15:30',
    cuadrilla_responsable: 'Cuadrilla Redes CELSIA Tolima 04',
    empresa_prestadora: 'CELSIA Tolima S.A. E.S.P.',
    estado: 'en_curso',
    urgente: true,
    poblacion_afectada_aprox: 1850,
    puntos_distribucion_emergencia: 'Planta eléctrica de respaldo activada en el Puesto de Salud Chenche',
    creado_por: 'Ing. Mateo Guzmán (Coordinador CELSIA)'
  },
  {
    id_corte: 203,
    tipo: 'gas',
    titulo: 'Empalme de Red Matriz y Válvula de Seccionamiento de Gas Natural',
    motivo: 'Ampliación de cobertura residencial e interconexión del nuevo anillo de distribución.',
    sector_barrio: 'Villa de las Palmas y Santa Librada',
    coordenadas: [3.8630, -74.9250],
    radio_afectacion_m: 450,
    fecha_inicio: '2026-08-22',
    hora_inicio: '22:00',
    fecha_estimada_fin: '2026-08-23',
    hora_estimada_fin: '04:00',
    cuadrilla_responsable: 'Cuadrilla Especializada Redes de Gas Alcanos',
    empresa_prestadora: 'Alcanos de Colombia S.A. E.S.P.',
    estado: 'programado',
    urgente: false,
    poblacion_afectada_aprox: 2400,
    puntos_distribucion_emergencia: 'Monitoreo técnico de presión con brigada de guardia',
    creado_por: 'Supervisión Técnica Alcanos'
  }
];

export const INITIAL_JORNADAS_SALUD: JornadaSaludEsterilizacion[] = [
  {
    id_jornada: 301,
    titulo: 'Gran Jornada Municipal de Esterilización y Vacunación Antirrábica Zoonosis',
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
