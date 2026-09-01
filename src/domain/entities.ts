import { Categoria, CategoryCode } from '../types';

export const SYSTEM_CATEGORIES: Categoria[] = [
  {
    id_categoria: 1,
    nombre: 'Cultura y Patrimonio',
    codigo: 'cultura',
    color: '#8B5CF6', // Purple
    icono: 'Landmark',
    descripcion: 'Festivales, música, danza, folclor tolimense y tradiciones de la Villa de las Palmas.'
  },
  {
    id_categoria: 2,
    nombre: 'Deporte y Recreación',
    codigo: 'deporte',
    color: '#EF4444', // Red
    icono: 'Trophy',
    descripcion: 'Torneos municipales, ciclopaseos nocturnos y atletismo en el Malecón.'
  },
  {
    id_categoria: 3,
    nombre: 'Educación y Talleres',
    codigo: 'educacion',
    color: '#3B82F6', // Blue
    icono: 'GraduationCap',
    descripcion: 'Capacitaciones, talleres digitales, charlas de emprendimiento y bibliotecas.'
  },
  {
    id_categoria: 4,
    nombre: 'Salud Pública',
    codigo: 'salud',
    color: '#10B981', // Green
    icono: 'HeartPulse',
    descripcion: 'Jornadas de citología, vacunación infantil, prevención y brigadas médicas rurales.'
  },
  {
    id_categoria: 5,
    nombre: 'Bienestar Animal y Familiar',
    codigo: 'bienestar',
    color: '#F59E0B', // Amber
    icono: 'PawPrint',
    descripcion: 'Jornadas de esterilización canina/felina, vacunación antirrábica y encuentros familiares.'
  },
  {
    id_categoria: 6,
    nombre: 'Servicios Públicos',
    codigo: 'servicios',
    color: '#0284C7', // Cyan/Sky
    icono: 'Zap',
    descripcion: 'Mantenimiento del acueducto, suspensiones de agua, cortes de luz y aseo urbano.'
  },
  {
    id_categoria: 7,
    nombre: 'Comunidad y Ferias',
    codigo: 'comunidad',
    color: '#EC4899', // Pink
    icono: 'Users',
    descripcion: 'Mercados campesinos, ferias artesanas, asambleas comunitarias y presupuestos.'
  }
];

export class EventoDomain {
  static isUpcoming(fechaStr: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return fechaStr >= today;
  }

  static formatFechaCompleta(fechaStr: string): string {
    if (!fechaStr) return '';
    const [year, month, day] = fechaStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static getCategoryMeta(codigo: CategoryCode): Categoria {
    return SYSTEM_CATEGORIES.find(c => c.codigo === codigo) || SYSTEM_CATEGORIES[0];
  }
}
