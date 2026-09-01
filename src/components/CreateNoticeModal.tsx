import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, Droplet, Zap } from 'lucide-react';
import { CreateAvisoDTO } from '../types';

interface CreateNoticeModalProps {
  onClose: () => void;
  onSubmit: (dto: CreateAvisoDTO) => Promise<void>;
}

export const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateAvisoDTO>({
    titulo: '',
    tipo: 'corte_agua',
    descripcion: '',
    sector_afectado: '',
    urgente: true
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al publicar el aviso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-[#0D47A1] dark:bg-slate-950 text-white flex items-center justify-between border-b dark:border-slate-800">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="text-lg font-black">Publicar Aviso Oficial</h3>
              <p className="text-xs text-blue-200 dark:text-slate-400">Avisos de cortes de agua, luz o comunicados para Purificación</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Título del Aviso *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ej. Suspensión del Servicio de Agua Potable"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Tipo de Servicio / Categoría *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
            >
              <option value="corte_agua">💧 Corte / Suspensión de Agua Potable</option>
              <option value="corte_luz">⚡ Corte de Energía Eléctrica (CELSIA)</option>
              <option value="vias">🚧 Cierre / Mantenimiento Vial</option>
              <option value="comunicado_alcaldia">📢 Comunicado Oficial de Alcaldía</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Barrio o Sector Afectado en Purificación *
            </label>
            <input
              type="text"
              required
              value={formData.sector_afectado}
              onChange={(e) => setFormData({ ...formData, sector_afectado: e.target.value })}
              placeholder="Ej. Barrios El Centro, Modelo y Camilo Torres"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Descripción y Recomendaciones *
            </label>
            <textarea
              required
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Explica el motivo del corte, fechas y horarios previstos..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="urgente"
              checked={formData.urgente}
              onChange={(e) => setFormData({ ...formData, urgente: e.target.checked })}
              className="w-4 h-4 text-[#2196F3] rounded border-slate-300 dark:border-slate-600 focus:ring-[#2196F3]"
            />
            <label htmlFor="urgente" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Marcar como AVISO URGENTE (Genera alerta inmediata)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow"
            >
              {loading ? 'Publicando...' : 'Publicar Aviso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
