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
  Bell
} from 'lucide-react';
import { Aviso, Categoria, CreateAvisoDTO, CreateEventoDTO, Evento, Organizador, Usuario } from '../types';

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
  onOpenDdl
}) => {
  const [activeTab, setActiveTab] = useState<'eventos' | 'avisos' | 'usuarios' | 'organizadores'>('eventos');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0D47A1] to-[#1565C0] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black mb-3 shadow">
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            <span>Panel de Administración Exclusivo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Administración Central - PurifiCalendario
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
            Control total sobre eventos, avisos de servicios públicos, categorias, usuarios y organizadores del municipio de Purificación, Tolima.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenDdl}
            className="px-4 py-2.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-100 text-xs font-bold border border-blue-400/40 flex items-center gap-1.5"
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
            <div className="p-3 bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalAvisos}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Avisos de Servicios</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalUsuarios}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Habitantes Registrados</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalOrganizadores}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Entidades Organizadoras</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'eventos', label: `Eventos (${events.length})`, icon: Calendar },
            { id: 'avisos', label: `Avisos (${notices.length})`, icon: ShieldAlert },
            { id: 'usuarios', label: `Usuarios (${users.length})`, icon: Users },
            { id: 'organizadores', label: `Organizadores (${organizers.length})`, icon: Building2 }
          ].map(tab => {
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
            placeholder="Filtrar registros..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-750 focus:outline-none"
          />
        </div>
      </div>

      {/* Tab Content Tables */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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

        {activeTab === 'usuarios' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Barrio</th>
                  <th className="p-4">Preferencias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users
                  .filter(u => u.nombre_usuario.toLowerCase().includes(search.toLowerCase()))
                  .map(u => (
                    <tr key={u.id_usuario} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{u.nombre_usuario}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{u.correo}</td>
                      <td className="p-4">
                        <span className="capitalize bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{u.barrio || 'N/A'}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {u.preferencias_categorias.join(', ')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'organizadores' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Entidad Organizadora</th>
                  <th className="p-4">Contacto Email</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {organizers
                  .filter(o => o.nombre_entidad.toLowerCase().includes(search.toLowerCase()))
                  .map(o => (
                    <tr key={o.id_organizador} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{o.nombre_entidad}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{o.contacto_email}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{o.contacto_telefono}</td>
                      <td className="p-4">
                        <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Verificado
                        </span>
                      </td>
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
