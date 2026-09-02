import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2, Calendar, MapPin, Tag } from 'lucide-react';

export interface DeleteTargetInfo {
  type: 'evento' | 'aviso' | 'via' | 'encuesta';
  id: number;
  title: string;
  subtitle?: string;
  categoryOrSector?: string;
  date?: string;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  target: DeleteTargetInfo | null;
  onClose: () => void;
  onConfirm: (target: DeleteTargetInfo) => Promise<void> | void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  target,
  onClose,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !target) return null;

  const typeLabels: Record<DeleteTargetInfo['type'], { singular: string; color: string; badge: string }> = {
    evento: { singular: 'Evento Municipal', color: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300' },
    aviso: { singular: 'Aviso de Servicio', color: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' },
    via: { singular: 'Reporte de Malla Vial', color: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' },
    encuesta: { singular: 'Consulta Ciudadana', color: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' }
  };

  const currentTypeInfo = typeLabels[target.type] || {
    singular: 'Registro Municipal',
    color: 'text-red-600',
    badge: 'bg-red-100 text-red-800'
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(target);
      onClose();
    } catch (error) {
      console.error('Error executing deletion:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up text-slate-900 dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-delete-title"
      >
        {/* Header with Danger Warning */}
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 text-white rounded-2xl shadow-sm flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-delete-title" className="text-base font-black text-rose-950 dark:text-rose-100 leading-tight">
                ¿Eliminar {currentTypeInfo.singular}?
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 font-medium">
                Esta acción retirará el registro permanentemente.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Details Card */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${currentTypeInfo.badge}`}>
                {currentTypeInfo.singular} #{target.id}
              </span>
              {target.categoryOrSector && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{target.categoryOrSector}</span>
                </span>
              )}
            </div>

            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
              {target.title}
            </h4>

            {target.subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                {target.subtitle}
              </p>
            )}

            {(target.date || target.categoryOrSector) && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                {target.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{target.date}</span>
                  </span>
                )}
                {target.categoryOrSector && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span className="truncate max-w-[180px]">{target.categoryOrSector}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              El elemento se eliminará de la base de datos de <strong>Firestore</strong>, se removerá del calendario municipal y se registrará en la pista de auditoría.
            </p>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="p-5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-red-600/20 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Definitivamente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
