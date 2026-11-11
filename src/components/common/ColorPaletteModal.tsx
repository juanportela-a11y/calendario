import React, { useState } from 'react';
import { Palette, Check, RotateCcw, X, Sparkles, Pipette } from 'lucide-react';
import { ColorPalette, PRESET_PALETTES, createCustomPalette, applyPaletteToDOM } from '../../utils/themePalettes';
import { playSettingsSound } from '../../utils/soundUtils';

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: ColorPalette;
  onSelectPalette: (palette: ColorPalette) => void;
}

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  onSelectPalette
}) => {
  const [customHex, setCustomHex] = useState(
    currentPalette.id === 'custom' ? currentPalette.primary : '#0284c7'
  );

  if (!isOpen) return null;

  const handleSelect = (palette: ColorPalette) => {
    playSettingsSound();
    applyPaletteToDOM(palette);
    onSelectPalette(palette);
  };

  const handleApplyCustomHex = (hex: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
    const custom = createCustomPalette(hex);
    handleSelect(custom);
  };

  const handleReset = () => {
    const defaultPalette = PRESET_PALETTES[0];
    handleSelect(defaultPalette);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#111d3d] border border-slate-200 dark:border-blue-900/60 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Paleta de Colores de la Página</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  Global
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cambia todos los colores de la plataforma por tu combinación favorita
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar selector de color"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Preset Palettes Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Paletas Temáticas Recomendadas</span>
              <span className="text-[11px] font-medium lowercase text-slate-400">8 opciones</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_PALETTES.map((palette) => {
                const isSelected = currentPalette.id === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => handleSelect(palette)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Color swatch & gradient ring */}
                      <div 
                        className="w-8 h-8 rounded-xl flex-shrink-0 shadow-xs border border-white/40 flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${palette.gradientFrom}, ${palette.gradientTo})`
                        }}
                      >
                        <div 
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: palette.primary }}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {palette.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {palette.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Pipette className="w-3.5 h-3.5 text-blue-600" />
                <span>Elegir Cualquier Color Personalizado</span>
              </label>
              {currentPalette.id === 'custom' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Activo
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Selecciona cualquier tono del espectro. Calcularemos automáticamente los gradientes, contrastes y sombras para toda la web.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Native HTML Color Input */}
              <div className="relative flex items-center">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => {
                    const newHex = e.target.value;
                    setCustomHex(newHex);
                    handleApplyCustomHex(newHex);
                  }}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 overflow-hidden bg-transparent"
                  title="Elige tu color personalizado"
                />
              </div>

              {/* Hex text input */}
              <div className="flex-1 min-w-[140px] flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                <span className="text-xs font-bold text-slate-400">HEX</span>
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomHex(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      handleApplyCustomHex(val);
                    }
                  }}
                  placeholder="#0284C7"
                  className="w-full text-xs font-mono font-bold text-slate-900 dark:text-white uppercase bg-transparent outline-none"
                  maxLength={7}
                />
              </div>

              {/* Quick Preset Swatches for fast inspiration */}
              <div className="flex items-center gap-1.5">
                {['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#64748b'].map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => {
                      setCustomHex(swatch);
                      handleApplyCustomHex(swatch);
                    }}
                    className="w-6 h-6 rounded-lg border border-white/60 dark:border-slate-900 shadow-2xs hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    style={{ backgroundColor: swatch }}
                    title={`Aplicar tono ${swatch}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Restaurar el color azul clásico institucional"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Original</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
