import { describe, test, expect } from 'vitest';
import { EventoDomain, SYSTEM_CATEGORIES } from './entities';
import { validateEvento, validateAviso, EventoSchema, AvisoSchema, ViaReportSchema, CorteServiceSchema } from './validation';

describe('Domain Entities & Validation Unit Tests', () => {
  test('SYSTEM_CATEGORIES contains expected municipal categories', () => {
    expect(SYSTEM_CATEGORIES.length).toBeGreaterThanOrEqual(7);
    const codes = SYSTEM_CATEGORIES.map(c => c.codigo);
    expect(codes).toContain('cultura');
    expect(codes).toContain('salud');
    expect(codes).toContain('bienestar');
    expect(codes).toContain('servicios');
  });

  test('EventoDomain.isUpcoming correctly classifies dates', () => {
    const pastDate = '2020-01-01';
    const futureDate = '2099-12-31';
    expect(EventoDomain.isUpcoming(pastDate)).toBe(false);
    expect(EventoDomain.isUpcoming(futureDate)).toBe(true);
  });

  test('validateEvento validates correct event payload', () => {
    const validEvent = {
      nombre: 'Festival Folclórico del Río Magdalena',
      fecha: '2026-08-30',
      hora_inicio: '18:00',
      lugar: 'Malecón Turístico Purificación',
      descripcion: 'Gran presentación de danzas tradicionales y música tolimense.',
      id_categoria: 1,
      id_organizador: 1
    };

    const res = validateEvento(validEvent);
    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });

  test('validateEvento catches missing mandatory fields', () => {
    const invalidEvent = {
      nombre: 'Ab', // too short
      fecha: 'invalid-date',
      lugar: '',
      descripcion: 'Corto',
      id_categoria: 0
    };

    const res = validateEvento(invalidEvent);
    expect(res.isValid).toBe(false);
    expect(res.errors.nombre).toBeDefined();
  });

  test('validateAviso validates emergency notice correctly', () => {
    const validAviso = {
      titulo: 'Corte de Agua Emergencia',
      tipo: 'corte_agua' as const,
      descripcion: 'Suspensión del suministro por daño de tubería principal en El Centro.',
      sector_afectado: 'Barrio El Centro',
      urgente: true
    };

    const res = validateAviso(validAviso);
    expect(res.isValid).toBe(true);
  });

  test('ViaReportSchema validates operational road report', () => {
    const validVia = {
      titulo: 'Hueco profundo Carrera 7 con Calle 5',
      direccion: 'Carrera 7 #5-20',
      barrio: 'Centro',
      tipo_dano: 'Hueco Profundo',
      severidad: 'alta' as const,
      estado: 'reportado' as const,
      descripcion: 'Deterioro de la carpeta asfáltica que afecta el tránsito vehicular.',
      coordenadas: [3.8582, -74.9285] as [number, number],
      reportado_por: 'Ing. Carlos Mendoza',
      prioridad: 'alta' as const
    };

    const parseResult = ViaReportSchema.safeParse(validVia);
    expect(parseResult.success).toBe(true);
  });

  test('CorteServiceSchema validates utility cut payload', () => {
    const validCorte = {
      tipo: 'agua' as const,
      titulo: 'Mantenimiento Red Matriz Acueducto',
      motivo: 'Sustitución de válvula de paso de 8 pulgadas',
      sector_barrio: 'Barrios Santa Librada y Camilo Torres',
      coordenadas: [3.8582, -74.9285] as [number, number],
      radio_afectacion_m: 350,
      fecha_inicio: '2026-08-30',
      hora_inicio: '07:00',
      fecha_estimada_fin: '2026-08-30',
      hora_estimada_fin: '16:00',
      cuadrilla_responsable: 'EMPOPUR Cuadrilla 1',
      empresa_prestadora: 'Empresas Públicas de Purificación',
      estado: 'programado' as const,
      urgente: false,
      creado_por: 'Central Operativa'
    };

    const parseResult = CorteServiceSchema.safeParse(validCorte);
    expect(parseResult.success).toBe(true);
  });
});
