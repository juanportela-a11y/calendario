import { CreateAvisoDTO, CreateEventoDTO } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEvento(data: Partial<CreateEventoDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.nombre || data.nombre.trim().length < 3) {
    errors.nombre = 'El nombre del evento debe tener al menos 3 caracteres.';
  }

  if (!data.fecha) {
    errors.fecha = 'Debe seleccionar una fecha para el evento.';
  }

  if (!data.hora_inicio) {
    errors.hora_inicio = 'Debe especificar la hora de inicio.';
  }

  if (!data.lugar || data.lugar.trim().length < 3) {
    errors.lugar = 'Debe indicar el lugar o dirección del evento en Purificación.';
  }

  if (!data.descripcion || data.descripcion.trim().length < 10) {
    errors.descripcion = 'La descripción debe tener al menos 10 caracteres explicativos.';
  }

  if (!data.id_categoria || data.id_categoria <= 0) {
    errors.id_categoria = 'Debe seleccionar una categoría válida.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateAviso(data: Partial<CreateAvisoDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.titulo || data.titulo.trim().length < 5) {
    errors.titulo = 'El título del aviso debe tener al menos 5 caracteres.';
  }

  if (!data.descripcion || data.descripcion.trim().length < 10) {
    errors.descripcion = 'Proporcione una descripción detallada del aviso o corte.';
  }

  if (!data.sector_afectado || data.sector_afectado.trim().length < 3) {
    errors.sector_afectado = 'Especifique el barrio o sector afectado en Purificación.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
