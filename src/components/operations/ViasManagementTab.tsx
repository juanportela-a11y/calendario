import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Upload, 
  MapPin, 
  HardHat, 
  Plus, 
  Filter, 
  ArrowRight, 
  Image as ImageIcon,
  DollarSign,
  Layers,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { ReporteVia, EstadoVia, SeveridadVia, OpsGlobalFilterState } from '../../types';
import { BARRIOS_PURIFICACION } from '../../data/municipalOpsData';

interface ViasManagementTabProps {
  vias: ReporteVia[];
  filters: OpsGlobalFilterState;
  onAddVia: (newVia: Omit<ReporteVia, 'id_via'>) => void;
  onUpdateViaStatus: (idVia: number, nuevoEstado: EstadoVia, fotoDespues?: string, comentariosTecnicos?: string) => void;
  onSelectViaOnMap?: (via: ReporteVia) => void;
}

export const ViasManagementTab: React.FC<ViasManagementTabProps> = ({
  vias,
  filters,
  onAddVia,
  onUpdateViaStatus,
  onSelectViaOnMap
}) => {
  const [selectedViaForStatus, setSelectedViaForStatus] = useState<ReporteVia | null>(null);
  const [newStatus, setNewStatus] = useState<EstadoVia>('reparacion');
  const [evidencePhotoAfter, setEvidencePhotoAfter] = useState<string>('');
  const [statusComment, setStatusComment] = useState<string>('');

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedEvidencePreview, setSelectedEvidencePreview] = useState<ReporteVia | null>(null);

  // New Via Form State
  const [formData, setFormData] = useState({
    titulo: '',
    barrio: BARRIOS_PURIFICACION[0],
    direccion: '',
    severidad: 'alta' as SeveridadVia,
    tipo_dano: 'Hueco Profundo',
    descripcion: '',
    material_estimado: '',
    cuadrilla_asignada: 'Cuadrilla Mantenimiento Vial Local',
    reportado_por: 'Ing. Carlos Mendoza (Infraestructura)',
    costo_estimado_cop: 5000000,
    prioridad: 'alta' as 'urgente' | 'alta' | 'media' | 'rutinaria',
    foto_antes: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=700&auto=format&fit=crop&q=80',
    lat: 3.8582,
    lng: -74.9285
  });

  // Filtered list
  const filteredVias = vias.filter((v) => {
    if (filters.barrioSeleccionado !== 'todos' && v.barrio !== filters.barrioSeleccionado) return false;
    if (filters.severidadFiltro !== 'todas' && v.severidad !== filters.severidadFiltro) return false;
    if (filters.estadoFiltro !== 'todos' && v.estado !== filters.estadoFiltro) return false;
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match = v.titulo.toLowerCase().includes(q) || v.direccion.toLowerCase().includes(q) || v.descripcion.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isBefore: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isBefore) {
            setFormData(prev => ({ ...prev, foto_antes: reader.result as string }));
          } else {
            setEvidencePhotoAfter(reader.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStatusUpdate = () => {
    if (!selectedViaForStatus) return;
    onUpdateViaStatus(
      selectedViaForStatus.id_via,
      newStatus,
      evidencePhotoAfter.trim() ? evidencePhotoAfter : undefined,
      statusComment.trim() ? statusComment : undefined
    );
    setSelectedViaForStatus(null);
    setEvidencePhotoAfter('');
    setStatusComment('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.direccion.trim()) return;

    onAddVia({
      titulo: formData.titulo,
      direccion: formData.direccion,
      barrio: formData.barrio,
      coordenadas: [formData.lat, formData.lng],
      severidad: formData.severidad,
      tipo_dano: formData.tipo_dano,
      estado: 'reportado',
      descripcion: formData.descripcion,
      foto_antes: formData.foto_antes,
      foto_despues: '',
      material_estimado: formData.material_estimado,
      cuadrilla_asignada: formData.cuadrilla_asignada,
      fecha_reporte: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reportado_por: formData.reportado_por,
      costo_estimado_cop: Number(formData.costo_estimado_cop) || 0,
      prioridad: formData.prioridad
    });

    setShowCreateModal(false);
    // Reset form
    setFormData({
      titulo: '',
      barrio: BARRIOS_PURIFICACION[0],
      direccion: '',
      severidad: 'alta',
      tipo_dano: 'Hueco Profundo',
      descripcion: '',
      material_estimado: '',
      cuadrilla_asignada: 'Cuadrilla Mantenimiento Vial Local',
      reportado_por: 'Ing. Carlos Mendoza (Infraestructura)',
      costo_estimado_cop: 5000000,
      prioridad: 'alta',
      foto_antes: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=700&auto=format&fit=crop&q=80',
      lat: 3.8582,
      lng: -74.9285
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-xl">
              <HardHat className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Gestión de Malla Vial & Reportes de Deterioro
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro, asignación de cuadrillas, control de materiales y evidencia fotográfica de pavimentación en Purificación
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar Nuevo Daño Vial</span>
        </button>
      </div>

      {/* Road Incidents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVias.map((via) => {
          const isCompletado = via.estado === 'completado';
          const isReparacion = via.estado === 'reparacion';
          const isInspeccion = via.estado === 'inspeccion';

          return (
            <div
              key={via.id_via}
              className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isCompletado
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : via.severidad === 'alta'
                  ? 'border-red-200 dark:border-red-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                
                {/* Card Top: Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span 
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        via.severidad === 'alta'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          : via.severidad === 'media'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      Severidad {via.severidad}
                    </span>

                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      #{via.id_via}
                    </span>
                  </div>

                  <span 
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      isCompletado
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : isReparacion
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 animate-pulse'
                        : isInspeccion
                        ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isCompletado
                      ? '✓ Completado / Pavimentado'
                      : isReparacion
                      ? '⚙ En Reparación'
                      : isInspeccion
                      ? '🔍 En Inspección'
                      : '📝 Reportado'}
                  </span>
                </div>

                {/* Title and Location */}
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    {via.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{via.direccion} &bull; <strong className="text-slate-800 dark:text-slate-200">{via.barrio}</strong></span>
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {via.descripcion}
                </p>

                {/* Material & Crew */}
                <div className="space-y-1.5 text-[11px]">
                  {via.material_estimado && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-bold">Material Requerido:</span>
                      <span className="font-extrabold text-blue-700 dark:text-blue-400 truncate max-w-[170px]">{via.material_estimado}</span>
                    </div>
                  )}
                  {via.cuadrilla_asignada && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-bold">Cuadrilla:</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">{via.cuadrilla_asignada}</span>
                    </div>
                  )}
                  {via.costo_estimado_cop && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-bold">Presupuesto Estimado:</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                        ${via.costo_estimado_cop.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  )}
                </div>

                {/* Photo Evidence Preview Button */}
                {(via.foto_antes || via.foto_despues) && (
                  <button
                    onClick={() => setSelectedEvidencePreview(via)}
                    className="w-full py-2 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-[#0D47A1] dark:text-blue-300 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Ver Fotos de Evidencia (Antes {via.foto_despues ? '/ Después' : ''})</span>
                  </button>
                )}

              </div>

              {/* Bottom Card Actions */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {via.fecha_reporte.slice(0, 10)}
                </span>

                <button
                  onClick={() => {
                    setSelectedViaForStatus(via);
                    setNewStatus(via.estado);
                    setEvidencePhotoAfter(via.foto_despues || '');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Actualizar Estado</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredVias.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <HardHat className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">
            No se encontraron reportes viales con los filtros seleccionados
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prueba ajustando el barrio o el término de búsqueda para ver más incidencias viales.
          </p>
        </div>
      )}

      {/* Modal: Actualizar Estado & Adjuntar Fotos de Evidencia */}
      {selectedViaForStatus && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0D47A1] dark:text-blue-400">
                  Control de Obras & Mantenimiento
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Actualizar Reporte #{selectedViaForStatus.id_via}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedViaForStatus(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-2xl">
                <p className="font-bold text-xs text-slate-800 dark:text-white">{selectedViaForStatus.titulo}</p>
                <p className="text-[11px] text-slate-500">📍 {selectedViaForStatus.direccion} ({selectedViaForStatus.barrio})</p>
              </div>

              {/* Status Radio Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Selecciona el Nuevo Estado Operativo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['reportado', 'inspeccion', 'reparacion', 'completado'] as EstadoVia[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                        newStatus === st
                          ? 'bg-[#0D47A1] dark:bg-blue-600 text-white border-[#0D47A1] shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="capitalize">
                        {st === 'completado' ? '✓ Completado / Pavimentado' : st === 'reparacion' ? '⚙ En Reparación' : st === 'inspeccion' ? '🔍 En Inspección' : '📝 Reportado'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Evidence Photo After Upload (Specially for 'completado') */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Fotografía de Evidencia (Después / Finalización):</span>
                  {newStatus === 'completado' && <span className="text-[10px] text-emerald-600 font-bold">Recomendado</span>}
                </label>

                {evidencePhotoAfter ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-36">
                    <img src={evidencePhotoAfter} alt="Evidencia Después" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setEvidencePhotoAfter('')}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50 dark:bg-slate-800/50">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Subir foto desde dispositivo</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG o WEBP</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEvidencePhotoAfter('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=700&auto=format&fit=crop&q=80')}
                        className="text-[10px] text-[#2196F3] underline font-bold"
                      >
                        Usar foto de ejemplo pavimentado
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical comments */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Comentario Técnico o Bitácora:
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Ej: Se aplicó capa asfáltica de 5cm, compactación con rodillo vibratorio y sello de bordes..."
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedViaForStatus(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveStatusUpdate}
                className="px-5 py-2 rounded-xl bg-[#0D47A1] dark:bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md"
              >
                Guardar y Registrar en Bitácora
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Formulario para Reportar Nuevo Daño Vial */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Reportar Nuevo Daño en Malla Vial
                  </h3>
                  <p className="text-xs text-slate-500">Formulario técnico de georreferenciación e inspección</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Título del Daño Vial *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Hundimiento de calzada en acceso sur"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Barrio / Vereda *
                  </label>
                  <select
                    value={formData.barrio}
                    onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {BARRIOS_PURIFICACION.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Dirección Exacta *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Ej: Carrera 5 # 8-20 frente a Droguería"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Nivel de Severidad *
                  </label>
                  <select
                    value={formData.severidad}
                    onChange={(e) => setFormData({ ...formData, severidad: e.target.value as SeveridadVia })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="alta">🔴 Alta / Peligro Inminente</option>
                    <option value="media">🟡 Media / Afectación Moderada</option>
                    <option value="baja">🟢 Baja / Desgaste Menor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Tipo de Daño
                  </label>
                  <select
                    value={formData.tipo_dano}
                    onChange={(e) => setFormData({ ...formData, tipo_dano: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Hueco Profundo">Hueco Profundo / Bache</option>
                    <option value="Hundimiento Calzada">Hundimiento de Calzada</option>
                    <option value="Derrumbe/Obstrucción">Derrumbe / Obstrucción de Vía</option>
                    <option value="Falla de Alcantarillado">Falla de Alcantarillado / Rejilla</option>
                    <option value="Pavimento Agrietado">Pavimento Agrietado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Material Estimado Requerido
                  </label>
                  <input
                    type="text"
                    value={formData.material_estimado}
                    onChange={(e) => setFormData({ ...formData, material_estimado: e.target.value })}
                    placeholder="Ej: 3.5 m³ asfalto en caliente"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Presupuesto Estimado (COP)
                  </label>
                  <input
                    type="number"
                    value={formData.costo_estimado_cop}
                    onChange={(e) => setFormData({ ...formData, costo_estimado_cop: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Descripción Detallada del Daño
                </label>
                <textarea
                  required
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles sobre dimensiones, tráfico afectado, riesgo para peatones..."
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Photo Before Upload */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Fotografía de Evidencia (Antes):
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                    <Camera className="w-4 h-4 text-[#2196F3]" />
                    <span>Cargar Imagen</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} />
                  </label>
                  <span className="text-[11px] text-slate-400 truncate max-w-xs">
                    {formData.foto_antes ? 'Foto cargada correctamente' : 'Sin foto'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md cursor-pointer"
                >
                  Registrar Reporte y Georreferenciar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Comparador de Fotos de Evidencia (Antes vs. Después) */}
      {selectedEvidencePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                  Evidencia Fotográfica de Obra
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedEvidencePreview.titulo}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedEvidencePreview(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-red-600 dark:text-red-400">📷 Estado Inicial (Antes)</span>
                </div>
                <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                  {selectedEvidencePreview.foto_antes ? (
                    <img src={selectedEvidencePreview.foto_antes} alt="Antes" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Sin foto previa</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">📷 Estado Final (Después)</span>
                </div>
                <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                  {selectedEvidencePreview.foto_despues ? (
                    <img src={selectedEvidencePreview.foto_despues} alt="Después" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400">
                      <Clock className="w-6 h-6 text-slate-300 mb-1" />
                      <span>Obra en proceso o pendiente de registro fotográfico</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-300">
              <p><strong>Ubicación:</strong> {selectedEvidencePreview.direccion} ({selectedEvidencePreview.barrio})</p>
              <p><strong>Cuadrilla:</strong> {selectedEvidencePreview.cuadrilla_asignada || 'No asignada'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvidencePreview(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold"
              >
                Cerrar Visor
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
