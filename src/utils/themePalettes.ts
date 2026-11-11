/**
 * themePalettes.ts
 * Sistema integral de paletas cromáticas para PurifiCalendario.
 * Permite cambiar la totalidad de los colores de la plataforma (botones, gradientes,
 * tarjetas, bordes, anillos e indicadores) de forma reactiva y persistente.
 */

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  primary: string;
  primaryHover: string;
  primaryTextLight: string;
  primaryTextDark: string;
  gradientFrom: string;
  gradientTo: string;
  subtleBgLight: string;
  subtleBgDark: string;
  subtleBorderLight: string;
  subtleBorderDark: string;
  ring: string;
}

export const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'classic-blue',
    name: 'Azul Magdalena (Clásico)',
    description: 'Azul institucional del Río Magdalena y Purificación',
    primary: '#0284c7',
    primaryHover: '#0369a1',
    primaryTextLight: '#0284c7',
    primaryTextDark: '#38bdf8',
    gradientFrom: '#0D47A1',
    gradientTo: '#2196F3',
    subtleBgLight: 'rgba(2, 132, 199, 0.08)',
    subtleBgDark: 'rgba(56, 189, 248, 0.12)',
    subtleBorderLight: 'rgba(2, 132, 199, 0.25)',
    subtleBorderDark: 'rgba(56, 189, 248, 0.30)',
    ring: '#0284c7'
  },
  {
    id: 'emerald-tolima',
    name: 'Esmeralda Tolima',
    description: 'Verde cordillerano, arrozales y fertilidad del valle',
    primary: '#059669',
    primaryHover: '#047857',
    primaryTextLight: '#059669',
    primaryTextDark: '#34d399',
    gradientFrom: '#064e3b',
    gradientTo: '#10b981',
    subtleBgLight: 'rgba(5, 150, 105, 0.08)',
    subtleBgDark: 'rgba(52, 211, 153, 0.12)',
    subtleBorderLight: 'rgba(5, 150, 105, 0.25)',
    subtleBorderDark: 'rgba(52, 211, 153, 0.30)',
    ring: '#059669'
  },
  {
    id: 'sunset-amber',
    name: 'Atardecer Ocre & Oro',
    description: 'Cálido resplandor del sol poniente sobre el malecón',
    primary: '#d97706',
    primaryHover: '#b45309',
    primaryTextLight: '#d97706',
    primaryTextDark: '#fbbf24',
    gradientFrom: '#78350f',
    gradientTo: '#f59e0b',
    subtleBgLight: 'rgba(217, 119, 6, 0.08)',
    subtleBgDark: 'rgba(251, 191, 36, 0.12)',
    subtleBorderLight: 'rgba(217, 119, 6, 0.25)',
    subtleBorderDark: 'rgba(251, 191, 36, 0.30)',
    ring: '#d97706'
  },
  {
    id: 'royal-purple',
    name: 'Violeta Orquídea Real',
    description: 'Elegancia festiva inspirada en la orquídea tolimense',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryTextLight: '#7c3aed',
    primaryTextDark: '#a78bfa',
    gradientFrom: '#4c1d95',
    gradientTo: '#8b5cf6',
    subtleBgLight: 'rgba(124, 58, 237, 0.08)',
    subtleBgDark: 'rgba(167, 139, 250, 0.12)',
    subtleBorderLight: 'rgba(124, 58, 237, 0.25)',
    subtleBorderDark: 'rgba(167, 139, 250, 0.30)',
    ring: '#7c3aed'
  },
  {
    id: 'ruby-crimson',
    name: 'Rubí Campesino & Pasión',
    description: 'Calidez humana, energía cívica y tradición cultural',
    primary: '#e11d48',
    primaryHover: '#be123c',
    primaryTextLight: '#e11d48',
    primaryTextDark: '#fb7185',
    gradientFrom: '#881337',
    gradientTo: '#f43f5e',
    subtleBgLight: 'rgba(225, 29, 72, 0.08)',
    subtleBgDark: 'rgba(251, 113, 133, 0.12)',
    subtleBorderLight: 'rgba(225, 29, 72, 0.25)',
    subtleBorderDark: 'rgba(251, 113, 133, 0.30)',
    ring: '#e11d48'
  },
  {
    id: 'caribbean-teal',
    name: 'Turquesa Manantial',
    description: 'Aguas cristalinas, serenidad y naturaleza ribereña',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryTextLight: '#0d9488',
    primaryTextDark: '#2dd4bf',
    gradientFrom: '#134e4a',
    gradientTo: '#14b8a6',
    subtleBgLight: 'rgba(13, 148, 136, 0.08)',
    subtleBgDark: 'rgba(45, 212, 191, 0.12)',
    subtleBorderLight: 'rgba(13, 148, 136, 0.25)',
    subtleBorderDark: 'rgba(45, 212, 191, 0.30)',
    ring: '#0d9488'
  },
  {
    id: 'terracotta-craft',
    name: 'Terracota Artesanal',
    description: 'Alfarería típica, arcilla ribereña y calidez de hogar',
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryTextLight: '#ea580c',
    primaryTextDark: '#fb923c',
    gradientFrom: '#7c2d12',
    gradientTo: '#f97316',
    subtleBgLight: 'rgba(234, 88, 12, 0.08)',
    subtleBgDark: 'rgba(251, 146, 60, 0.12)',
    subtleBorderLight: 'rgba(234, 88, 12, 0.25)',
    subtleBorderDark: 'rgba(251, 146, 60, 0.30)',
    ring: '#ea580c'
  },
  {
    id: 'graphite-slate',
    name: 'Grafito & Titanio Ejecutivo',
    description: 'Elegancia sobria, alto contraste y modernidad neutral',
    primary: '#475569',
    primaryHover: '#334155',
    primaryTextLight: '#334155',
    primaryTextDark: '#cbd5e1',
    gradientFrom: '#0f172a',
    gradientTo: '#64748b',
    subtleBgLight: 'rgba(71, 85, 105, 0.08)',
    subtleBgDark: 'rgba(203, 213, 225, 0.12)',
    subtleBorderLight: 'rgba(71, 85, 105, 0.25)',
    subtleBorderDark: 'rgba(203, 213, 225, 0.30)',
    ring: '#475569'
  }
];

const STORAGE_KEY = 'purificalendario_theme_palette';
const CUSTOM_HEX_STORAGE_KEY = 'purificalendario_custom_hex';

/**
 * Convierte un color HEX en valores RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16)
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16)
    };
  }
  return null;
}

/**
 * Ajusta la luminosidad de un color HEX
 */
function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (val: number) => {
    const res = Math.round(val + (percent / 100) * 255);
    return Math.min(255, Math.max(0, res));
  };
  const r = adjust(rgb.r).toString(16).padStart(2, '0');
  const g = adjust(rgb.g).toString(16).padStart(2, '0');
  const b = adjust(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Crea una paleta cromática completa a partir de cualquier código HEX elegido por el usuario
 */
export function createCustomPalette(hex: string): ColorPalette {
  const rgb = hexToRgb(hex) || { r: 2, g: 132, b: 199 };
  const darkPrimary = adjustBrightness(hex, -20);
  const hoverColor = adjustBrightness(hex, -15);
  const lightVariant = adjustBrightness(hex, 35);
  const gradientFrom = adjustBrightness(hex, -30);
  const gradientTo = adjustBrightness(hex, 15);

  return {
    id: 'custom',
    name: 'Personalizado',
    description: `Color de autor (${hex.toUpperCase()})`,
    primary: hex,
    primaryHover: hoverColor,
    primaryTextLight: darkPrimary,
    primaryTextDark: lightVariant,
    gradientFrom,
    gradientTo,
    subtleBgLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
    subtleBgDark: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)`,
    subtleBorderLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`,
    subtleBorderDark: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.38)`,
    ring: hex
  };
}

/**
 * Aplica la paleta al elemento <html> configurando variables CSS dinámicas y data-attribute
 */
export function applyPaletteToDOM(palette: ColorPalette): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.setAttribute('data-palette', palette.id);

  // Inyección de variables CSS que gobiernan todos los componentes
  root.style.setProperty('--theme-primary', palette.primary);
  root.style.setProperty('--theme-primary-hover', palette.primaryHover);
  root.style.setProperty('--theme-primary-text-light', palette.primaryTextLight);
  root.style.setProperty('--theme-primary-text-dark', palette.primaryTextDark);
  root.style.setProperty('--theme-gradient-from', palette.gradientFrom);
  root.style.setProperty('--theme-gradient-to', palette.gradientTo);
  root.style.setProperty('--theme-subtle-bg-light', palette.subtleBgLight);
  root.style.setProperty('--theme-subtle-bg-dark', palette.subtleBgDark);
  root.style.setProperty('--theme-subtle-border-light', palette.subtleBorderLight);
  root.style.setProperty('--theme-subtle-border-dark', palette.subtleBorderDark);
  root.style.setProperty('--theme-ring', palette.ring);

  // Respaldo en localStorage
  try {
    localStorage.setItem(STORAGE_KEY, palette.id);
    if (palette.id === 'custom') {
      localStorage.setItem(CUSTOM_HEX_STORAGE_KEY, palette.primary);
    }
  } catch (e) {
    console.debug('No se pudo guardar la paleta en localStorage:', e);
  }
}

/**
 * Obtiene la paleta guardada actualmente o la predeterminada
 */
export function getSavedPalette(): { palette: ColorPalette; customHex?: string } {
  if (typeof window === 'undefined') {
    return { palette: PRESET_PALETTES[0] };
  }

  try {
    const savedId = localStorage.getItem(STORAGE_KEY);
    const customHex = localStorage.getItem(CUSTOM_HEX_STORAGE_KEY) || '#0284c7';

    if (savedId === 'custom' && customHex) {
      return { palette: createCustomPalette(customHex), customHex };
    }

    const matched = PRESET_PALETTES.find(p => p.id === savedId);
    if (matched) {
      return { palette: matched, customHex };
    }
  } catch {
    // Retorno de fallback
  }

  return { palette: PRESET_PALETTES[0] };
}
