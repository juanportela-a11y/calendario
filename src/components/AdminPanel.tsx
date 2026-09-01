import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Calendar, 
  Users, 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  Database, 
  CheckCircle2, 
  BarChart3,
  Search,
  Bell,
  HardHat,
  FileSpreadsheet,
  FileText,
  Clock,
  History,
  Check
} from 'lucide-react';
import { Aviso, Categoria, CreateAvisoDTO, CreateEventoDTO, Evento, Organizador, Usuario, ReporteVia, CorteProgramado } from '../types';
import { useOpsStore } from '../stores/useOpsStore';
import { CUADRILLAS_MUNICIPALES } from '../data/municipalOpsData';
import { exportAuditLogsToCSV, exportCortesToCSV, exportViasToCSV, generateMunicipalOpsPDF } from '../utils/exportUtils';

interface AdminPanelProps {
  stats: {
    totalEventos: number;
    totalUsuarios: number;
    totalOrganizadores: number;
    totalAvisos: number;
    eventosPorCategoria: { categoria: string; color: string; cantidad: number }[];
  } | null;
  events: Evento[];
  notices: Aviso[];
  users: Usuario[];
  organizers: Organizador[];
  categories: Categoria[];
  onOpenCreateEvent: () => void;
  onOpenCreateNotice: () => void;
  onDeleteEvent: (id: number) => Promise<void>;
  onDeleteNotice: (id: number) => Promise<void>;
  onOpenDdl: () => void;
  onSendBroadcastNotification?: (titulo: string, mensaje: string, tipo: string) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  stats,
  events,
  notices,
  users,
  organizers,
  categories,
  onOpenCreateEvent,
  onOpenCreateNotice,
  onDeleteEvent,
  onDeleteNotice,
  onOpenDdl,
  onSendBroadcastNotification
}) => {
  const [activeTab, setActiveTab] = useState<'eventos' | 'avisos' | 'despacho_cuadrillas' | 'lectura_avisos' | 'encuestas_admin' | 'auditoria' | 'usuarios' | 'despacho_notificaciones'>('eventos');
  const [search, setSearch] = useState('');

  // Notification form state
  const [notifTitulo, setNotifTitulo] = useState('');
  const [notifMensaje, setNotifMensaje] = useState('');
  const [notifTipo, setNotifTipo] = useState<'alerta' | 'aviso' | 'evento' | 'sistema'>('alerta');
  const [notifSuccess, setNotifSuccess] = useState(false);
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Encuesta form state
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [opcion1, setOpcion1] = useState('');
  const [opcion2, setOpcion2] = useState('');
  const [opcion3, setOpcion3] = useState('');
  const [categoriaEncuesta, setCategoriaEncuesta] = useState<'obras' | 'salud' | 'cultura' | 'servicios'>('obras');

  const { 
    vias, 
    cortes, 
    jornadas, 
    auditLogs, 
    updateViaCuadrilla, 
    deleteReporteVia,
    notifiedUsers, 
    encuestas, 
    addCustomEncuesta, 
    deleteCustomEncuesta 
  } = useOpsStore();

  const handleSendNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitulo.trim() || !notifMensaje.trim() || !onSendBroadcastNotification) return;

    try {
      setIsSendingNotif(true);
      await onSendBroadcastNotification(notifTitulo.trim(), notifMensaje.trim(), notifTipo);
      setNotifSuccess(true);
      setNotifTitulo('');
      setNotifMensaje('');
      setTimeout(() => setNotifSuccess(false), 4000);
    } catch (err) {
      console.error('Error enviando notificación:', err);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const handleAssignCuadrilla = async (idVia: number, cuadrilla: string) => {
    await updateViaCuadrilla(idVia, cuadrilla, 'Administrador Despacho Central');
  };

  const handleCreateEncuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaPregunta.trim() || !opcion1.trim() || !opcion2.trim()) return;

    const opciones = [opcion1.trim(), opcion2.trim()];
    if (opcion3.trim()) opciones.push(opcion3.trim());

    await addCustomEncuesta(nuevaPregunta, opciones, categoriaEncuesta, 'Administrador Municipal');
    setNuevaPregunta('');
    setOpcion1('');
    setOpcion2('');
    setOpcion3('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0D47A1] to-[#1565C0] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black mb-3 shadow">
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            <span>Centro de Control Administrativo & Despacho</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Administración Central - PurifiCalendario
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
            Control de eventos, avisos, asignación operativa de cuadrillas a vías, historial de auditoría y exportación de reportes oficiales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Buttons */}
          <button
            onClick={() => generateMunicipalOpsPDF(vias, cortes, jornadas)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <FileText className="w-4 h-4" />
            <span>Descargar PDF Oficial</span>
          </button>

          <button
            onClick={() => exportViasToCSV(vias)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenDdl}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-100 text-xs font-bold border border-blue-400/30 flex items-center gap-1.5"
          >
            <Database className="w-4 h-4 text-[#64B5F6]" />
            <span>Ver BD MySQL</span>
          </button>

          <button
            onClick={onOpenCreateNotice}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Aviso</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/70 text-[#0D47A1] dark:text-blue-300 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalEventos}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Eventos Totales</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 rounded-2xl">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{vias.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Vías & Incidencias</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalUsuarios}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Usuarios Registrados</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-300 rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalAvisos}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Avisos Urgentes</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: 'eventos', label: `Eventos (${events.length})`, icon: Calendar },
            { id: 'despacho_cuadrillas', label: `Despacho de Cuadrillas (${vias.length})`, icon: HardHat },
            { id: 'despacho_notificaciones', label: 'Enviar Notificación', icon: Bell },
            { id: 'lectura_avisos', label: `Lectura de Avisos (${notifiedUsers.length})`, icon: CheckCircle2 },
            { id: 'encuestas_admin', label: `Encuestas (${encuestas.length})`, icon: BarChart3 },
            { id: 'auditoria', label: `Historial de Auditoría (${auditLogs.length})`, icon: History },
            { id: 'avisos', label: `Avisos (${notices.length})`, icon: ShieldAlert },
            { id: 'usuarios', label: `Usuarios (${users.length})`, icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0D47A1] dark:bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar registros..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* TAB 1: DESPACHO Y ASIGNACIÓN DE CUADRILLAS */}
        {activeTab === 'despacho_cuadrillas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Incidencia / Vía</th>
                  <th className="p-4">Barrio / Ubicación</th>
                  <th className="p-4">Severidad & Daño</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Cuadrilla Asignada</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vias
                  .filter(v => v.titulo.toLowerCase().includes(search.toLowerCase()) || v.barrio.toLowerCase().includes(search.toLowerCase()))
                  .map((via) => (
                    <tr key={via.id_via} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{via.titulo}</div>
                        <div className="text-[10px] text-slate-500">ID #{via.id_via} • {via.fecha_reporte}</div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <p className="font-semibold">{via.barrio}</p>
                        <p className="text-[11px] text-slate-500">{via.direccion}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          via.severidad === 'alta' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {via.severidad}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{via.tipo_dano}</p>
                      </td>
                      <td className="p-4">
                        <span className="capitalize font-bold text-slate-700 dark:text-slate-300">{via.estado}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={via.cuadrilla_asignada || ''}
                          onChange={(e) => handleAssignCuadrilla(via.id_via, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                        >
                          <option value="">-- Asignar Cuadrilla --</option>
                          {CUADRILLAS_MUNICIPALES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        {via.cuadrilla_asignada ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Asignada
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-bold">Pendiente</span>
                        )}
                        <button
                          onClick={() => deleteReporteVia(via.id_via, 'Administrador Central')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase transition-all shadow-xs flex items-center gap-1"
                          title="Marcar como Solucionado y Archivar"
                        >
                          <Check className="w-3 h-3" />
                          <span>Solucionar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: LECTURA DE AVISOS URGENTES Y CONFIRMACIONES */}
        {activeTab === 'lectura_avisos' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Monitoreo de Confirmaciones de Lectura</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Trazabilidad de ciudadanos que han verificado y aceptado las alertas urgentes del municipio.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-xs rounded-xl border border-emerald-300 dark:border-emerald-700/60 self-start sm:self-auto">
                {notifiedUsers.length} Notificaciones Confirmadas
              </span>
            </div>

            {notifiedUsers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Ningún ciudadano ha interactuado con la alerta urgente activa en este momento.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Los registros aparecerán aquí tan pronto los habitantes presionen "Enterado".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {notifiedUsers.map((u, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{u.nombre}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] mt-0.5">
                        {u.avisoTitulo}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {u.fecha}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: GESTIÓN DE ENCUESTAS Y CONSULTAS CIUDADANAS */}
        {activeTab === 'encuestas_admin' && (
          <div className="p-6 space-y-6">
            {/* Formulario de Creación de Encuesta */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Publicar Nueva Consulta / Presupuesto Participativo
                </h4>
              </div>

              <form onSubmit={handleCreateEncuesta} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Pregunta o Proyecto a Someter a Votación
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: ¿Cuál obra comunitaria debe priorizarse en el segundo semestre?"
                    value={nuevaPregunta}
                    onChange={(e) => setNuevaPregunta(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Opción 1 *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Pavimentación Vías"
                      value={opcion1}
                      onChange={(e) => setOpcion1(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Opción 2 *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Iluminación LED Parques"
                      value={opcion2}
                      onChange={(e) => setOpcion2(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Opción 3 (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: Centro de Zoonosis"
                      value={opcion3}
                      onChange={(e) => setOpcion3(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <select
                    value={categoriaEncuesta}
                    onChange={(e) => setCategoriaEncuesta(e.target.value as any)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="obras">Categoría: Obras Públicas</option>
                    <option value="salud">Categoría: Salud & Zoonosis</option>
                    <option value="cultura">Categoría: Cultura & Fiestas</option>
                    <option value="servicios">Categoría: Servicios Públicos</option>
                  </select>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publicar Encuesta</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Listado de Encuestas Activas */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Encuestas Activas y Resultados en Vivo ({encuestas.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {encuestas.map((enc) => (
                  <div
                    key={enc.id_encuesta}
                    className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {enc.categoria}
                        </span>
                        <button
                          onClick={() => deleteCustomEncuesta(enc.id_encuesta)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Eliminar encuesta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h5 className="text-xs font-black text-slate-800 dark:text-white leading-snug">
                        {enc.titulo}
                      </h5>

                      <div className="mt-3 space-y-2">
                        {enc.opciones.map((op) => {
                          const pct = enc.total_votos > 0 ? Math.round((op.votos / enc.total_votos) * 100) : 0;
                          return (
                            <div key={op.id_opcion} className="space-y-1">
                              <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                <span>{op.texto}</span>
                                <span>{op.votos} votos ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-medium">
                      Total votos registrados: <strong>{enc.total_votos}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDITORIA Y HISTORIAL DE MODIFICACIONES */}
        {activeTab === 'auditoria' && (
          <div className="overflow-x-auto">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">Pista de Auditoría Oficial e Inmutable</p>
                <p className="text-[11px] text-slate-500">Registro con marca temporal de cada cambio de estado, asignación y reporte</p>
              </div>
              <button
                onClick={() => exportAuditLogsToCSV(auditLogs)}
                className="px-3 py-1.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold hover:bg-blue-800 flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Bitácora CSV</span>
              </button>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Funcionario / Usuario</th>
                  <th className="p-4">Módulo</th>
                  <th className="p-4">Acción</th>
                  <th className="p-4">Detalle del Cambio</th>
                  <th className="p-4">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs
                  .filter(l => l.descripcion.toLowerCase().includes(search.toLowerCase()) || l.funcionario_nombre.toLowerCase().includes(search.toLowerCase()))
                  .map((log) => (
                    <tr key={log.id_log} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {log.timestamp}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{log.funcionario_nombre}</div>
                        <div className="text-[10px] text-slate-500">{log.funcionario_rol}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                          {log.modulo}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {log.accion.replace('_', ' ')}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs">
                        {log.descripcion}
                      </td>
                      <td className="p-4 text-[11px] font-mono text-slate-400">
                        {log.id_referencia ? `#${log.id_referencia}` : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: EVENTOS */}
        {activeTab === 'eventos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Evento</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Fecha / Hora</th>
                  <th className="p-4">Lugar</th>
                  <th className="p-4">Organizador</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events
                  .filter(e => e.nombre.toLowerCase().includes(search.toLowerCase()))
                  .map(evt => (
                    <tr key={evt.id_evento} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{evt.nombre}</td>
                      <td className="p-4">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: evt.categoria?.color }}
                        >
                          {evt.categoria?.nombre}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{evt.fecha} ({evt.hora_inicio})</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{evt.lugar}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{evt.organizador?.nombre_entidad}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDeleteEvent(evt.id_evento)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                          title="Eliminar evento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: AVISOS */}
        {activeTab === 'avisos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Aviso</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Sector Afectado</th>
                  <th className="p-4">Urgencia</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {notices
                  .filter(n => n.titulo.toLowerCase().includes(search.toLowerCase()))
                  .map(notice => (
                    <tr key={notice.id_aviso} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{notice.titulo}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 capitalize">{notice.tipo.replace('_', ' ')}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{notice.sector_afectado}</td>
                      <td className="p-4">
                        {notice.urgente ? (
                          <span className="bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 dark:border-red-800">Urgente</span>
                        ) : (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded">Normal</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDeleteNotice(notice.id_aviso)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                          title="Eliminar aviso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: DESPACHO DE NOTIFICACIONES */}
        {activeTab === 'despacho_notificaciones' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Emisión y Despacho de Notificaciones Ciudadanas</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Envía alertas y avisos oficiales que llegarán inmediatamente a los dispositivos de los habitantes registrados.
                </p>
              </div>
            </div>

            {notifSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Notificación emitida y despachada con éxito a toda la ciudadanía.</span>
              </div>
            )}

            <form onSubmit={handleSendNotif} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Título de la Notificación *
                  </label>
                  <input
                    type="text"
                    required
                    value={notifTitulo}
                    onChange={(e) => setNotifTitulo(e.target.value)}
                    placeholder="Ej. Alerta de Cierre Vial por Obras en Calle 7"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Tipo de Mensaje *
                  </label>
                  <select
                    value={notifTipo}
                    onChange={(e) => setNotifTipo(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                  >
                    <option value="alerta">🚨 Alerta Prioritaria / Operativa</option>
                    <option value="aviso">📢 Aviso de Servicio Municipal</option>
                    <option value="evento">🎉 Invitación a Evento Oficial</option>
                    <option value="sistema">⚙️ Comunicado del Sistema</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Mensaje Detallado *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={notifMensaje}
                    onChange={(e) => setNotifMensaje(e.target.value)}
                    placeholder="Escriba las instrucciones, sector afectado, horarios o recomendaciones para los ciudadanos..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingNotif}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Bell className={`w-4 h-4 ${isSendingNotif ? 'animate-bounce' : ''}`} />
                  <span>{isSendingNotif ? 'Despachando Notificación...' : 'Despachar Notificación a la Comunidad'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Nombre Usuario</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users
                  .filter(u => u.nombre_usuario.toLowerCase().includes(search.toLowerCase()) || u.correo.toLowerCase().includes(search.toLowerCase()))
                  .map(user => (
                    <tr key={user.id_usuario} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{user.nombre_usuario}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{user.correo}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {user.rol}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{user.fecha_registro}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
