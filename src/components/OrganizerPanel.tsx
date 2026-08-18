import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Categoria, CreateEventoDTO, Evento, Usuario } from '../types';

interface OrganizerPanelProps {
  currentUser: Usuario;
  categories: Categoria[];
  myEvents: Evento[];
  onCreateEvent: (dto: CreateEventoDTO) => Promise<void>;
  onUpdateEvent: (id: number, dto: Partial<CreateEventoDTO>) => Promise<void>;
  onDeleteEvent: (id: number) => Promise<void>;
}

export const OrganizerPanel: React.FC<OrganizerPanelProps> = ({
  currentUser,
  categories,
  myEvents,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent
}) => {
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState<CreateEventoDTO>({
    nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fin: '12:00',
    lugar: '',
    descripcion: '',
    id_categoria: categories[0]?.id_categoria || 1,
    id_organizador: 1, // Will be bound dynamically
    info_adicional: '',
    destacado: false
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],
      hora_inicio: '09:00',
      hora_fin: '12:00',
      lugar: '',
      descripcion: '',
      id_categoria: categories[0]?.id_categoria || 1,
      id_organizador: 1,
      info_adicional: '',
      destacado: false
    });
    setEditingEventId(null);
    setShowForm(false);
    setErrorMsg('');
  };

  const handleEditClick = (evt: Evento) => {
    setFormData({
      nombre: evt.nombre,
      fecha: evt.fecha,
      hora_inicio: evt.hora_inicio,
      hora_fin: evt.hora_fin || '',
      lugar: evt.lugar,
      descripcion: evt.descripcion,
      id_categoria: evt.id_categoria,
      id_organizador: evt.id_organizador,
      info_adicional: evt.info_adicional || '',
      destacado: evt.destacado
    });
    setEditingEventId(evt.id_evento);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (editingEventId) {
        await onUpdateEvent(editingEventId, formData);
      } else {
        await onCreateEvent(formData);
      }
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3 backdrop-blur-md">
            <Building2 className="w-4 h-4 text-emerald-200" />
            <span>Portal Oficial de Entidades Organizadoras</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Panel de Gestión de Eventos
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Registra la información de los eventos de tu entidad y mantén actualizada la programación de Purificación.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="px-5 py-3 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all flex items-center gap-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <span>{showForm ? 'Cancelar / Ver Mis Eventos' : 'Registrar Nuevo Evento'}</span>
        </button>
      </div>

      {/* Form Container */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {editingEventId ? 'Editar Información del Evento' : 'Registrar Nuevo Evento en Purificación'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proporciona los datos requeridos. Los habitantes interesados recibirán notificaciones automáticamente.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Event Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Encuentro Municipal de Danza Folclórica"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Categoría del Evento *
                </label>
                <select
                  value={formData.id_categoria}
                  onChange={(e) => setFormData({ ...formData, id_categoria: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Fecha del Evento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Hora de Inicio *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  placeholder="08:00 AM"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Hora de Finalización (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.hora_fin || ''}
                  onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                  placeholder="12:00 PM"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Location */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Lugar o Dirección en Purificación *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                  placeholder="Ej. Parque Principal Villa de las Palmas / Malecón"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Descripción Detallada *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe la programación, actividades y objetivo del evento..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Additional Info */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Información Adicional (Recomendaciones, vestimenta, cupos)
                </label>
                <input
                  type="text"
                  value={formData.info_adicional || ''}
                  onChange={(e) => setFormData({ ...formData, info_adicional: e.target.value })}
                  placeholder="Ej. Entrada libre. Llevar hidratación y ropa cómoda."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-750"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                {loading ? 'Guardando...' : editingEventId ? 'Actualizar Evento' : 'Publicar Evento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Registered Events */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          Mis Eventos Registrados ({myEvents.length})
        </h3>

        {myEvents.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aún no has registrado ningún evento</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Haz clic en "Registrar Nuevo Evento" para comenzar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {myEvents.map((evt) => (
              <div
                key={evt.id_evento}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: evt.categoria?.color || '#3b82f6' }}
                    >
                      {evt.categoria?.nombre}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {evt.fecha} &bull; {evt.hora_inicio}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {evt.nombre}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{evt.lugar}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleEditClick(evt)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0D47A1] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Actualizar</span>
                  </button>

                  <button
                    onClick={() => onDeleteEvent(evt.id_evento)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                    title="Eliminar evento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
