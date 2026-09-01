import { z } from 'zod';
import { CreateAvisoDTO, CreateEventoDTO } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Zod Schemas for Runtime Validation
export const EventoSchema = z.object({
  nombre: z.string().min(3, 'El nombre del evento debe tener al menos 3 caracteres.'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe seleccionar una fecha válida (YYYY-MM-DD).'),
  hora_inicio: z.string().min(1, 'Debe especificar la hora de inicio.'),
  hora_fin: z.string().optional(),
  lugar: z.string().min(3, 'Debe indicar el lugar o dirección del evento en Purificación.'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres explicativos.'),
  id_categoria: z.number().min(1, 'Debe seleccionar una categoría válida.'),
  id_organizador: z.number().min(1, 'Debe indicar el organizador.'),
  info_adicional: z.string().optional(),
  destacado: z.boolean().optional(),
  cupo_maximo: z.number().positive().optional(),
  requiere_inscripcion: z.boolean().optional()
});

export const AvisoSchema = z.object({
  titulo: z.string().min(5, 'El título del aviso debe tener al menos 5 caracteres.'),
  tipo: z.enum(['corte_agua', 'corte_luz', 'alerta_clima', 'comunicado_alcaldia', 'vias']),
  descripcion: z.string().min(10, 'Proporcione una descripción detallada del aviso o corte.'),
  sector_afectado: z.string().min(3, 'Especifique el barrio o sector afectado en Purificación.'),
  urgente: z.boolean(),
  fecha_expiracion: z.string().optional()
});

export const ViaReportSchema = z.object({
  titulo: z.string().min(4, 'El título del reporte vial debe tener al menos 4 caracteres.'),
  direccion: z.string().min(3, 'Indique la carrera, calle o dirección específica.'),
  barrio: z.string().min(2, 'Indique el barrio o vereda.'),
  tipo_dano: z.string().min(3, 'Seleccione o escriba el tipo de daño vial.'),
  severidad: z.enum(['alta', 'media', 'baja']),
  estado: z.enum(['reportado', 'inspeccion', 'reparacion', 'completado']),
  descripcion: z.string().min(6, 'Detalle la afección de la vía.'),
  coordenadas: z.tuple([z.number(), z.number()]),
  reportado_por: z.string().min(2, 'Nombre de funcionario responsable.'),
  prioridad: z.enum(['urgente', 'alta', 'media', 'rutinaria'])
});

export const CorteServiceSchema = z.object({
  tipo: z.enum(['agua', 'energia', 'gas']),
  titulo: z.string().min(4, 'El título del corte debe tener al menos 4 caracteres.'),
  motivo: z.string().min(5, 'Especifique el motivo técnico del corte.'),
  sector_barrio: z.string().min(2, 'Especifique el sector o barrios afectados.'),
  coordenadas: z.tuple([z.number(), z.number()]),
  radio_afectacion_m: z.number().min(10, 'El radio mínimo de afectación es 10 metros.'),
  fecha_inicio: z.string().min(1, 'Fecha requerida.'),
  hora_inicio: z.string().min(1, 'Hora de inicio requerida.'),
  fecha_estimada_fin: z.string().min(1, 'Fecha estimada de fin requerida.'),
  hora_estimada_fin: z.string().min(1, 'Hora estimada de fin requerida.'),
  cuadrilla_responsable: z.string().min(2, 'Indique la cuadrilla a cargo.'),
  empresa_prestadora: z.string().min(2, 'Indique la empresa prestadora.'),
  estado: z.enum(['programado', 'en_curso', 'restablecido']),
  urgente: z.boolean(),
  creado_por: z.string().min(2, 'Responsable del registro.')
});

export function validateEvento(data: Partial<CreateEventoDTO>): ValidationResult {
  const result = EventoSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  }
  const errors: Record<string, string> = {};
  result.error.issues.forEach(err => {
    const field = err.path.join('.');
    errors[field] = err.message;
  });
  return { isValid: false, errors };
}

export function validateAviso(data: Partial<CreateAvisoDTO>): ValidationResult {
  const result = AvisoSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  }
  const errors: Record<string, string> = {};
  result.error.issues.forEach(err => {
    const field = err.path.join('.');
    errors[field] = err.message;
  });
  return { isValid: false, errors };
}
