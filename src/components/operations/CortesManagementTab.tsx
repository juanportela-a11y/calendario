import React, { useState } from 'react';
import { 
  Droplets, 
  Zap, 
  Flame, 
  Clock, 
  MapPin, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Truck, 
  X,
  Radio,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CorteProgramado, TipoCorteServicio, EstadoCorte, OpsGlobalFilterState } from '../../types';
import { BARRIOS_PURIFICACION } from '../../data/municipalOpsData';

interface CortesManagementTabProps {
  cortes: CorteProgramado[];
  filters: OpsGlobalFilterState;
  onAddCorte: (newCorte: Omit<CorteProgramado, 'id_corte'>) => void;
  onUpdateCorteStatus: (idCorte: number, nuevoEstado: EstadoCorte) => void;
}

export const CortesManagementTab: React.FC<CortesManagementTabProps> = ({
  cortes,
  filters,
  onAddCorte,
  onUpdateCorteStatus
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    tipo: 'agua' as TipoCorteServicio,
    titulo: '',
    motivo: '',
    sector_barrio: BARRIOS_PURIFICACION[0],
    fecha_inicio: new Date().toISOString().split('T')[0],
    hora_inicio: '08:00',
    fecha_estimada_fin: new Date().toISOString().split('T')[0],
    hora_estimada_fin: '16:00',
    cuadrilla_responsable: 'Cuadrilla Técnica #1 EMPOPUR',
    empresa_prestadora: 'Empresas Públicas de Purificación EMPOPUR',
    radio_afectacion_m: 600,
    poblacion_afectada_aprox: 2500,
    puntos_distribucion_emergencia: 'Carrotanque en el Parque Principal y frente al Hospital',
    urgente: true,
    creado_por: 'Ing. Rodrigo Cárdenas (EMPOPUR)',
    lat: 3.8582,
    lng: -74.9285
  });

  // Filtered Cortes
  const filteredCortes = cortes.filter((c) => {
    if (filters.barrioSeleccionado !== 'todos' && !c.sector_barrio.toLowerCase().includes(filters.barrioSeleccionado.toLowerCase())) return false;
    if (filters.estadoFiltro !== 'todos' && c.estado !== filters.estadoFiltro) return false;
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match = c.titulo.toLowerCase().includes(q) || c.motivo.toLowerCase().includes(q) || c.sector_barrio.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleTipoChange = (tipo: TipoCorteServicio) => {
    let empresa = 'Empresas Públicas de Purificación EMPOPUR';
    let cuadrilla = 'Cuadrilla Técnica #1 EMPOPUR';
    if (tipo === 'energia') {
      empresa = 'CELSIA Tolima S.A. E.S.P.';
      cuadrilla = 'Cuadrilla Líneas Vivas CELSIA 04';
    } else if (tipo === 'gas') {
      empresa = 'Alcanos de Colombia S.A. E.S.P.';
      cuadrilla = 'Cuadrilla Especializada Redes Alcanos';
    }
    setFormData(prev => ({
      ...prev,
      tipo,
      empresa_prestadora: empresa,
      cuadrilla_responsable: cuadrilla
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.motivo.trim()) return;

    onAddCorte({
      tipo: formData.tipo,
      titulo: formData.titulo,
      motivo: formData.motivo,
      sector_barrio: formData.sector_barrio,
      coordenadas: [formData.lat, formData.lng],
      radio_afectacion_m: Number(formData.radio_afectacion_m) || 500,
      fecha_inicio: formData.fecha_inicio,
      hora_inicio: formData.hora_inicio,
      fecha_estimada_fin: formData.fecha_estimada_fin,
      hora_estimada_fin: formData.hora_estimada_fin,
      cuadrilla_responsable: formData.cuadrilla_responsable,
      empresa_prestadora: formData.empresa_prestadora,
      estado: 'programado',
      urgente: formData.urgente,
      poblacion_afectada_aprox: Number(formData.poblacion_afectada_aprox) || 0,
      puntos_distribucion_emergencia: formData.puntos_distribucion_emergencia,
      creado_por: formData.creado_por
    });

    setShowCreateModal(false);
    // Reset
    setFormData({
      tipo: 'agua',
      titulo: '',
      motivo: '',
      sector_barrio: BARRIOS_PURIFICACION[0],
      fecha_inicio: new Date().toISOString().split('T')[0],
      hora_inicio: '08:00',
      fecha_estimada_fin: new Date().toISOString().split('T')[0],
      hora_estimada_fin: '16:00',
      cuadrilla_responsable: 'Cuadrilla Técnica #1 EMPOPUR',
      empresa_prestadora: 'Empresas Públicas de Purificación EMPOPUR',
      radio_afectacion_m: 600,
      poblacion_afectada_aprox: 2500,
      puntos_distribucion_emergencia: 'Carrotanque en el Parque Principal y frente al Hospital',
      urgente: true,
      creado_por: 'Ing. Rodrigo Cárdenas (EMPOPUR)',
      lat: 3.8582,
      lng: -74.9285
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 rounded-xl">
              <Droplets className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Control de Cortes Programados de Servicios Públicos
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Programación obligatoria con motivo técnico, cuadrilla, hora de inicio/cierre y planes de contingencia (Acueducto, Energía y Gas)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Nuevo Corte</span>
        </button>
      </div>

      {/* Grid of Service Cuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCortes.map((corte) => {
          const isWater = corte.tipo === 'agua';
          const isPower = corte.tipo === 'energia';
          const isGas = corte.tipo === 'gas';

          const isEnCurso = corte.estado === 'en_curso';
          const isRestablecido = corte.estado === 'restablecido';

          const colorTheme = isWater 
            ? 'sky' 
            : isPower 
            ? 'amber' 
            : 'orange';

          return (
            <div
              key={corte.id_corte}
              className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isEnCurso
                  ? 'border-red-300 dark:border-red-900/70 ring-1 ring-red-400/40'
                  : isRestablecido
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                
                {/* Top Type & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-xs ${
                        isWater 
                          ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300' 
                          : isPower 
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' 
                          : 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300'
                      }`}
                    >
                      {isWater ? '💧' : isPower ? '⚡' : '🔥'}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        Corte #{corte.id_corte} &bull; {corte.tipo.toUpperCase()}
                      </span>
                      <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                        {corte.empresa_prestadora}
                      </p>
                    </div>
                  </div>

                  <span 
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      isEnCurso
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 animate-pulse'
                        : isRestablecido
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}
                  >
                    {isEnCurso ? '● En Curso' : isRestablecido ? '✓ Restablecido' : '🕒 Programado'}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    {corte.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Sector: <strong className="text-slate-800 dark:text-slate-200">{corte.sector_barrio}</strong></span>
                  </p>
                </div>

                {/* Motivo Formulario Obligatorio */}
                <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Motivo Técnico Obligatorio:</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {corte.motivo}
                  </p>
                </div>

                {/* Schedule & Crew */}
                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Hora Inicio:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{corte.fecha_inicio} &bull; {corte.hora_inicio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Hora Restablecimiento:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{corte.fecha_estimada_fin} &bull; {corte.hora_estimada_fin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Cuadrilla Asignada:</span>
                    <span className="font-extrabold text-blue-700 dark:text-blue-400 truncate max-w-[170px]">{corte.cuadrilla_responsable}</span>
                  </div>
                  {corte.poblacion_afectada_aprox && (
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Población Afectada:</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">~{corte.poblacion_afectada_aprox.toLocaleString()} habs.</span>
                    </div>
                  )}
                </div>

                {/* Emergency supply notice */}
                {corte.puntos_distribucion_emergencia && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Abastecimiento Alterno:</strong> {corte.puntos_distribucion_emergencia}</span>
                  </div>
                )}

              </div>

              {/* Bottom Quick State Change Action */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  Por: {corte.creado_por.split('(')[0]}
                </span>

                <div className="flex items-center gap-1.5">
                  {corte.estado === 'programado' && (
                    <button
                      onClick={() => onUpdateCorteStatus(corte.id_corte, 'en_curso')}
                      className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all"
                    >
                      Iniciar Corte
                    </button>
                  )}
                  {corte.estado === 'en_curso' && (
                    <button
                      onClick={() => onUpdateCorteStatus(corte.id_corte, 'restablecido')}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                    >
                      ✓ Restablecer Servicio
                    </button>
                  )}
                  {corte.estado === 'restablecido' && (
                    <span className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Servicio Normal</span>
                    </span>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {filteredCortes.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Droplets className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">
            No se encontraron cortes de servicios con los filtros actuales
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            El suministro de acueducto, energía y gas opera con normalidad en los sectores consultados.
          </p>
        </div>
      )}

      {/* Modal: Formulario Obligatorio de Programación de Corte */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded-xl">
                  <Droplets className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Programar Suspensión / Corte de Servicio
                  </h3>
                  <p className="text-xs text-slate-500">Formulario con validación de horario, motivo y cuadrilla técnica</p>
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
              
              {/* Service Type Switcher */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Tipo de Servicio Público *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTipoChange('agua')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                      formData.tipo === 'agua'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>💧</span>
                    <span>Acueducto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTipoChange('energia')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                      formData.tipo === 'energia'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>⚡</span>
                    <span>Energía</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTipoChange('gas')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                      formData.tipo === 'gas'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>🔥</span>
                    <span>Gas Natural</span>
                  </button>
                </div>
              </div>

              {/* Titulo */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Título del Comunicado del Corte *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Mantenimiento en válvula reguladora de presión"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Motivo Obligatorio */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Motivo Técnico Obligatorio *
                </label>
                <textarea
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Explique detalladamente la razón de la suspensión (poda, reemplazo de transformador, lavado de tanques, reparación de fuga matriz)..."
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Sector / Barrio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Sectores o Barrios Afectados *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sector_barrio}
                    onChange={(e) => setFormData({ ...formData, sector_barrio: e.target.value })}
                    placeholder="Ej: El Centro, Modelo, Ospina Pérez"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Empresa Prestadora
                  </label>
                  <input
                    type="text"
                    value={formData.empresa_prestadora}
                    onChange={(e) => setFormData({ ...formData, empresa_prestadora: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Horas Inicio y Cierre Obligatorias */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Fecha Cierre *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_estimada_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_estimada_fin: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Hora Cierre *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.hora_estimada_fin}
                    onChange={(e) => setFormData({ ...formData, hora_estimada_fin: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Cuadrilla y Abastecimiento de Emergencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Cuadrilla Técnica Asignada *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cuadrilla_responsable}
                    onChange={(e) => setFormData({ ...formData, cuadrilla_responsable: e.target.value })}
                    placeholder="Ej: Cuadrilla 2 Redes EMPOPUR"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Puntos de Abastecimiento Alterno
                  </label>
                  <input
                    type="text"
                    value={formData.puntos_distribucion_emergencia}
                    onChange={(e) => setFormData({ ...formData, puntos_distribucion_emergencia: e.target.value })}
                    placeholder="Ej: Carrotanque Parque Principal"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
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
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-md cursor-pointer"
                >
                  Publicar y Notificar a la Comunidad
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
