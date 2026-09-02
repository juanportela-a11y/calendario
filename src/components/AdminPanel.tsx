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
  Check,
  RefreshCw,
  Award,
  MapPin,
  Phone,
  Megaphone,
  Droplets,
  Zap,
  Trash,
  ExternalLink,
  MessageSquare,
  Camera,
  CheckSquare,
  AlertCircle,
  X
} from 'lucide-react';
import { Aviso, Categoria, CreateAvisoDTO, CreateEventoDTO, Evento, Organizador, Usuario, ReporteVia, CorteProgramado, ReporteFallaCiudadana, EstadoFalla } from '../types';
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
  onRefreshAll?: () => Promise<void> | void;
  onUpdateUserRole?: (userId: number, newRole: any) => Promise<void>;
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
  onSendBroadcastNotification,
  onRefreshAll,
  onUpdateUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'eventos' | 'reportes_fallas' | 'avisos' | 'despacho_cuadrillas' | 'lectura_avisos' | 'encuestas_admin' | 'auditoria' | 'usuarios' | 'despacho_notificaciones'>('eventos');
  const [search, setSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('todos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fallas filter & management state
  const [fallaTipoFilter, setFallaTipoFilter] = useState<'todos' | 'agua' | 'luz' | 'aseo' | 'vias'>('todos');
  const [fallaEstadoFilter, setFallaEstadoFilter] = useState<'todos' | 'pendiente' | 'notificado' | 'solucionado'>('todos');
  const [autoDeleteOnSolucionado, setAutoDeleteOnSolucionado] = useState<boolean>(true);
  const [selectedFallaModal, setSelectedFallaModal] = useState<ReporteFallaCiudadana | null>(null);
  const [respuestaOficialInput, setRespuestaOficialInput] = useState<string>('');
  const [previewFotoUrl, setPreviewFotoUrl] = useState<string | null>(null);

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
  const [auditModuloFilter, setAuditModuloFilter] = useState<string>('todos');

  const { 
    vias, 
    cortes, 
    jornadas, 
    auditLogs, 
    lastAuditSyncTime,
    isFirebaseSynced,
    updateViaCuadrilla, 
    deleteReporteVia,
    notifiedUsers, 
    encuestas, 
    addCustomEncuesta, 
    deleteCustomEncuesta,
    fallas,
    updateFallaEstado,
    deleteReporteFalla
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
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Descargar PDF Oficial</span>
          </button>

          <button
            onClick={() => exportViasToCSV(vias)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenDdl}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-100 text-xs font-bold border border-blue-400/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-4 h-4 text-[#64B5F6]" />
            <span>Ver BD MySQL</span>
          </button>

          <button
            onClick={onOpenCreateNotice}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Aviso</span>
          </button>
        </div>
      </div>

      {/* Live Sync Status & Quick Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/80 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 px-4 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isFirebaseSynced ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isFirebaseSynced ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isFirebaseSynced ? 'Sincronización en Tiempo Real Activa (Firestore & Node/MySQL)' : 'Sincronización en Memoria Activa'}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-600 pl-2.5 hidden sm:inline">
            Último pulso: {lastAuditSyncTime || 'En línea'}
          </span>
        </div>

        {onRefreshAll && (
          <button
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await onRefreshAll();
              } finally {
                setTimeout(() => setIsRefreshing(false), 500);
              }
            }}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
          </button>
        )}
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
            { id: 'reportes_fallas', label: `Reportes Ciudadanos (${fallas.length})`, icon: Megaphone, highlight: fallas.filter(f => f.estado === 'pendiente').length > 0 },
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap relative ${
                  isActive
                    ? 'bg-[#0D47A1] dark:bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse absolute top-1.5 right-1.5" />
                )}
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
        
        {/* TAB 0: GESTIÓN DE REPORTES CIUDADANOS (AGUA, LUZ, ASEO, VÍAS) */}
        {activeTab === 'reportes_fallas' && (
          <div className="p-6 space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                  <span>Gestión y Resolución de Reportes Ciudadanos</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Los reportes ingresan por defecto en estado <strong className="text-amber-600 dark:text-amber-400">Pendiente</strong>. Cámbielos a <strong className="text-blue-600 dark:text-blue-400">Notificado</strong> o <strong className="text-emerald-600 dark:text-emerald-400">Solucionado</strong>.
                </p>
              </div>

              {/* Auto-delete toggle on Solucionado */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start lg:self-auto">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={autoDeleteOnSolucionado}
                    onChange={(e) => setAutoDeleteOnSolucionado(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <span>Borrar automáticamente al marcar como «Solucionado»</span>
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase">
                  {autoDeleteOnSolucionado ? 'Auto-limpieza Activa' : 'Conservar en BD'}
                </span>
              </div>
            </div>

            {/* Quick Stats & Sub-Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Total Recibidos</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{fallas.length}</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-900/40">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">🟡 Pendientes</span>
                <span className="text-xl font-black text-amber-900 dark:text-amber-200">
                  {fallas.filter(f => f.estado === 'pendiente').length}
                </span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/40">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">🔵 Notificados</span>
                <span className="text-xl font-black text-blue-900 dark:text-blue-200">
                  {fallas.filter(f => f.estado === 'notificado' || f.estado === 'en_revision' || f.estado === 'cuadrilla_asignada' || f.estado === 'en_reparacion').length}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">🟢 Solucionados</span>
                <span className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                  {fallas.filter(f => f.estado === 'solucionado' || f.estado === 'resuelto').length}
                </span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1">Servicio:</span>
                {(['todos', 'agua', 'luz', 'aseo', 'vias'] as const).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setFallaTipoFilter(tipo)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      fallaTipoFilter === tipo
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tipo === 'todos' ? 'Todos los Servicios' : tipo === 'agua' ? '💧 Agua' : tipo === 'luz' ? '⚡ Luz' : tipo === 'aseo' ? '🗑️ Aseo' : '🛣️ Vías'}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1">Estado:</span>
                {(['todos', 'pendiente', 'notificado', 'solucionado'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFallaEstadoFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      fallaEstadoFilter === st
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'todos' ? 'Todos los Estados' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports List / Table */}
            {fallas.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  ¡Bandeja de reportes despejada!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  No hay reportes de fallas pendientes o todos los casos han sido solucionados y eliminados.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {fallas
                  .filter(f => {
                    const matchesSearch = 
                      f.descripcion.toLowerCase().includes(search.toLowerCase()) ||
                      f.barrio.toLowerCase().includes(search.toLowerCase()) ||
                      f.ubicacion.toLowerCase().includes(search.toLowerCase()) ||
                      (f.nombre_ciudadano && f.nombre_ciudadano.toLowerCase().includes(search.toLowerCase())) ||
                      (f.telefono_ciudadano && f.telefono_ciudadano.includes(search));
                    
                    const matchesTipo = fallaTipoFilter === 'todos' || f.tipo === fallaTipoFilter;
                    
                    const matchesEstado = 
                      fallaEstadoFilter === 'todos' ||
                      (fallaEstadoFilter === 'pendiente' && f.estado === 'pendiente') ||
                      (fallaEstadoFilter === 'notificado' && (f.estado === 'notificado' || f.estado === 'en_revision' || f.estado === 'cuadrilla_asignada' || f.estado === 'en_reparacion')) ||
                      (fallaEstadoFilter === 'solucionado' && (f.estado === 'solucionado' || f.estado === 'resuelto'));

                    return matchesSearch && matchesTipo && matchesEstado;
                  })
                  .map((falla) => {
                    const isPendiente = falla.estado === 'pendiente';
                    const isNotificado = falla.estado === 'notificado' || falla.estado === 'en_revision' || falla.estado === 'cuadrilla_asignada' || falla.estado === 'en_reparacion';
                    const isSolucionado = falla.estado === 'solucionado' || falla.estado === 'resuelto';

                    return (
                      <div
                        key={falla.id_falla}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                              falla.tipo === 'agua'
                                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                                : falla.tipo === 'luz'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : falla.tipo === 'aseo'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                            }`}>
                              {falla.tipo === 'agua' && <Droplets className="w-5 h-5" />}
                              {falla.tipo === 'luz' && <Zap className="w-5 h-5" />}
                              {falla.tipo === 'aseo' && <Trash className="w-5 h-5" />}
                              {falla.tipo === 'vias' && <HardHat className="w-5 h-5" />}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                  ID #{falla.id_falla} • {falla.tipo.toUpperCase()}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  {falla.fecha_reporte}
                                </span>
                                {falla.empresa_responsable && (
                                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                    {falla.empresa_responsable}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {falla.descripcion}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                  <strong className="text-slate-700 dark:text-slate-300">{falla.barrio}</strong> ({falla.ubicacion})
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-blue-500" />
                                  {falla.nombre_ciudadano}
                                  {falla.telefono_ciudadano && (
                                    <span className="font-mono text-slate-600 dark:text-slate-300 ml-1">
                                      📞 {falla.telefono_ciudadano}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Foto thumbnail if available */}
                          {falla.foto_url && (
                            <button
                              onClick={() => setPreviewFotoUrl(falla.foto_url || null)}
                              className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 self-start cursor-pointer"
                              title="Ver fotografía adjunta"
                            >
                              <img
                                src={falla.foto_url}
                                alt="Evidencia reporte"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                                <Camera className="w-4 h-4 mr-1" /> Ver
                              </div>
                            </button>
                          )}
                        </div>

                        {/* Official Response note if exists */}
                        {falla.respuesta_oficial && (
                          <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-bold">Respuesta Oficial Notificada a la Comunidad:</strong>
                              <span>{falla.respuesta_oficial}</span>
                            </div>
                          </div>
                        )}

                        {/* Interactive Status Selector & Auto-Delete Action Bar */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              Cambiar Estado:
                            </span>

                            {/* Option 1: PENDIENTE */}
                            <button
                              onClick={() => updateFallaEstado(falla.id_falla, 'pendiente')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isPendiente
                                  ? 'bg-amber-500 text-white shadow-xs font-black ring-2 ring-amber-300'
                                  : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-amber-200 hover:bg-amber-50'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pendiente</span>
                            </button>

                            {/* Option 2: NOTIFICADO */}
                            <button
                              onClick={() => {
                                setSelectedFallaModal(falla);
                                setRespuestaOficialInput(falla.respuesta_oficial || 'Reporte notificado formalmente a la cuadrilla de atención técnica.');
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isNotificado
                                  ? 'bg-blue-600 text-white shadow-xs font-black ring-2 ring-blue-300'
                                  : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border border-blue-200 hover:bg-blue-50'
                              }`}
                            >
                              <Bell className="w-3.5 h-3.5" />
                              <span>Notificado {falla.cuadrilla_asignada ? `(${falla.cuadrilla_asignada})` : ''}</span>
                            </button>

                            {/* Option 3: SOLUCIONADO */}
                            <button
                              onClick={() => updateFallaEstado(falla.id_falla, 'solucionado', falla.respuesta_oficial || 'Falla reparada satisfactoriamente en terreno.', autoDeleteOnSolucionado)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSolucionado
                                  ? 'bg-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-300'
                                  : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 hover:bg-emerald-50'
                              }`}
                              title={autoDeleteOnSolucionado ? 'Marca como solucionado y elimina automáticamente' : 'Marca como solucionado'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Solucionado {autoDeleteOnSolucionado ? '(& Borrar)' : ''}</span>
                            </button>
                          </div>

                          {/* Quick direct action buttons */}
                          <div className="flex items-center gap-2">
                            {/* Direct: Solucionar y Borrar Automáticamente */}
                            <button
                              onClick={() => updateFallaEstado(falla.id_falla, 'solucionado', 'Falla atendida y reparada por la cuadrilla municipal.', true)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              title="Marca la falla como solucionada y la elimina automáticamente del panel"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>Solucionar y Borrar</span>
                            </button>

                            {/* Direct: Delete Report */}
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Está seguro de eliminar permanentemente el reporte #${falla.id_falla}?`)) {
                                  deleteReporteFalla(falla.id_falla);
                                }
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
                              title="Eliminar reporte"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Modal para Notificar a Cuadrilla y Responder al Ciudadano */}
            {selectedFallaModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold text-xs">
                        #{selectedFallaModal.id_falla}
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Notificar Cuadrilla & Actualizar Estado
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedFallaModal(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedFallaModal.descripcion}
                    </p>
                    <p className="text-slate-500">
                      Ubicación: {selectedFallaModal.barrio} ({selectedFallaModal.ubicacion})
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Respuesta Oficial / Instrucción a Cuadrilla:
                    </label>
                    <textarea
                      rows={3}
                      value={respuestaOficialInput}
                      onChange={(e) => setRespuestaOficialInput(e.target.value)}
                      placeholder="Ej: Cuadrilla de fontanería EMPOPUR despachada al sitio. Hora estimada de llegada: 2:30 PM..."
                      className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedFallaModal(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        updateFallaEstado(
                          selectedFallaModal.id_falla,
                          'notificado',
                          respuestaOficialInput.trim() || 'Reporte notificado a la cuadrilla de atención técnica.'
                        );
                        setSelectedFallaModal(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Guardar y Marcar Notificado</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para Visualizar Fotografía */}
            {previewFotoUrl && (
              <div 
                onClick={() => setPreviewFotoUrl(null)}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-700 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-900 dark:text-white">Fotografía de Evidencia Adjunta</span>
                    <button
                      onClick={() => setPreviewFotoUrl(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <img
                    src={previewFotoUrl}
                    alt="Evidencia Reporte Ciudadano"
                    className="w-full max-h-[70vh] object-contain rounded-xl bg-slate-950"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
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
          <div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 dark:text-white text-xs">Pista de Auditoría Oficial e Inmutable</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    En tiempo real {lastAuditSyncTime ? `(${lastAuditSyncTime})` : ''}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Registro histórico sincronizado permanentemente con Firestore y almacenamiento seguro</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportAuditLogsToCSV(auditLogs)}
                  className="px-3 py-1.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold hover:bg-blue-800 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exportar Bitácora CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Filtrar Módulo:</span>
              {['todos', 'Vías', 'Eventos', 'Avisos', 'Usuarios', 'Cortes', 'Salud & Esterilización', 'Notificaciones', 'Ciudadanía'].map((mod) => (
                <button
                  key={mod}
                  onClick={() => setAuditModuloFilter(mod)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    auditModuloFilter === mod
                      ? 'bg-[#0D47A1] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {mod === 'todos' ? 'Todos los Módulos' : mod}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
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
                    .filter(l => {
                      const matchesSearch = l.descripcion.toLowerCase().includes(search.toLowerCase()) || 
                                           l.funcionario_nombre.toLowerCase().includes(search.toLowerCase()) ||
                                           l.accion.toLowerCase().includes(search.toLowerCase()) ||
                                           (l.id_referencia && String(l.id_referencia).includes(search));
                      const matchesModulo = auditModuloFilter === 'todos' || l.modulo === auditModuloFilter;
                      return matchesSearch && matchesModulo;
                    })
                    .map((log) => {
                      const getModuloBadge = (modulo: string) => {
                        switch (modulo) {
                          case 'Vías': return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                          case 'Eventos': return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
                          case 'Avisos': return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
                          case 'Usuarios': return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                          case 'Cortes': return 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800';
                          case 'Salud & Esterilización': return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                          case 'Notificaciones': return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                          case 'Ciudadanía': return 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800';
                          default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                        }
                      };

                      return (
                        <tr key={log.id_log} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900 dark:text-white">{log.funcionario_nombre}</div>
                            <div className="text-[10px] text-slate-500">{log.funcionario_rol}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getModuloBadge(log.modulo)}`}>
                              {log.modulo}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                            <span className="font-mono text-[11px]">{log.accion.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 max-w-sm">
                            <p>{log.descripcion}</p>
                            {log.detalles_nuevos && (
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{log.detalles_nuevos}</p>
                            )}
                          </td>
                          <td className="p-4 text-[11px] font-mono text-slate-400 whitespace-nowrap">
                            {log.id_referencia ? `#${log.id_referencia}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {auditLogs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No hay registros de auditoría almacenados actualmente.
                </div>
              )}
            </div>
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
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {['todos', 'habitante', 'organizador', 'administrador', 'funcionario_obras', 'funcionario_salud'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      userRoleFilter === role
                        ? 'bg-[#0D47A1] dark:bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {role === 'todos' ? `Todos (${users.length})` : `${role.replace('_', ' ')} (${users.filter(u => u.rol === role).length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Correo</th>
                    <th className="p-4">Ubicación / Barrio</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Puntos Cívicos</th>
                    <th className="p-4">Rol en el Sistema</th>
                    <th className="p-4">Fecha Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users
                    .filter(u => {
                      const matchesSearch = u.nombre_usuario.toLowerCase().includes(search.toLowerCase()) || 
                                           u.correo.toLowerCase().includes(search.toLowerCase()) ||
                                           (u.barrio && u.barrio.toLowerCase().includes(search.toLowerCase()));
                      const matchesRole = userRoleFilter === 'todos' || u.rol === userRoleFilter;
                      return matchesSearch && matchesRole;
                    })
                    .map(user => (
                      <tr key={user.id_usuario} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{user.nombre_usuario}</span>
                            {user.rol === 'administrador' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-black">ADMIN</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">ID #{user.id_usuario}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{user.correo}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{user.barrio || 'El Centro'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{user.telefono || '310 000 0000'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[11px] border border-amber-200 dark:border-amber-800">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>{user.puntos_civicos || 50} pts</span>
                          </span>
                        </td>
                        <td className="p-4">
                          {onUpdateUserRole ? (
                            <select
                              value={user.rol}
                              onChange={(e) => onUpdateUserRole(user.id_usuario, e.target.value)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-white capitalize focus:outline-none"
                            >
                              <option value="habitante">Habitante</option>
                              <option value="organizador">Organizador</option>
                              <option value="funcionario_obras">Funcionario Obras</option>
                              <option value="funcionario_salud">Funcionario Salud</option>
                              <option value="administrador">Administrador</option>
                            </select>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {user.rol}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">{user.fecha_registro}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
