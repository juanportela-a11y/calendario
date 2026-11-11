/**
 * soundUtils.ts
 * Motor de audio ligero y consistente basado en la Web Audio API nativa.
 * Genera el tono sutil y armónico utilizado en la confirmación de ajustes/preferencias
 * y lo reutiliza de forma idéntica para las notificaciones cívicas.
 */

// Singleton lazy para reutilizar el AudioContext respetando el ciclo de vida del navegador
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtxClass) return null;

  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new AudioCtxClass();
    } catch {
      return null;
    }
  }
  return sharedAudioContext;
}

/**
 * Reproduce el tono distintivo de confirmación de ajustes (Chime armónico dual: 587 Hz -> 880 Hz).
 * Volumen por defecto: 0.15 (discreto, profesional y no intrusivo).
 * 
 * Cumplimiento con Autoplay:
 * - Si el contexto está 'suspended' o el navegador bloquea la reproducción por falta de
 *   interacción previa del usuario, no fuerza la ejecución y falla silenciosamente.
 */
export function playSettingsSound(volume: number = 0.15): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Respetar las políticas de autoplay del navegador sin forzar
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // El navegador requiere interacción previa del usuario; no forzar
      });
      if (ctx.state === 'suspended') {
        return;
      }
    }

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    gainNode.connect(ctx.destination);

    // Oscilador 1: Tono base (Re 5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // Sube a La 5 (880 Hz)
    osc1.connect(gainNode);

    // Oscilador 2: Armónico suave (La 5 - 880 Hz a Re 6 - 1174.66 Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18);
    osc2.connect(gainNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (err) {
    // Manejo no intrusivo de errores de audio
    console.debug('Autoplay de audio restringido o no soportado:', err);
  }
}
