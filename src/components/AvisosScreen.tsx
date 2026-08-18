import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Droplet, 
  Zap, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Search, 
  Plus, 
  Info, 
  Trash2 
} from 'lucide-react';
import { Aviso, Usuario } from '../types';

interface AvisosScreenProps {
  notices: Aviso[];
  currentUser: Usuario;
  onDeleteNotice?: (idAviso: number) => void;
  onOpenCreateNotice?: () => void;
}

export const AvisosScreen: React.FC<AvisosScreenProps> = ({
  notices,
  currentUser,
  onDeleteNotice,
  onOpenCreateNotice
}) => {
  const [filterType, setFilterType] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotices = notices.filter(n => {
    if (filterType !== 'todos' && n.tipo !== filterType) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        n.titulo.toLowerCase().includes(q) ||
        n.descripcion.toLowerCase().includes(q) ||
        n.sector_afectado.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getNoticeBadge = (tipo: string) => {
    switch (tipo) {
      case 'corte_agua':
        return {
          icon: Droplet,
          label: 'Corte de Agua',
          colorClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
          iconColor: 'text-cyan-700'
        };
      case 'corte_luz':
        return {
          icon: Zap,
          label: 'Corte de Energía (Luz)',
          colorClass: 'bg-amber-100 text-amber-900 border-amber-300',
          iconColor: 'text-amber-700'
        };
      case 'vias':
        return {
          icon: AlertTriangle,
          label: 'Obras & Tránsito Vías',
          colorClass: 'bg-purple-100 text-purple-900 border-purple-300',
          iconColor: 'text-purple-700'
        };
      default:
        return {
          icon: ShieldAlert,
          label: 'Comunicado Oficial',
          colorClass: 'bg-blue-100 text-blue-900 border-blue-300',
          iconColor: 'text-blue-700'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0D47A1] to-[#2196F3] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3 backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>Información Oficial de Servicios Públicos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Avisos Comunitarios de Purificación
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Entérate a tiempo sobre suspensiones programadas de agua, mantenimiento de luz de CELSIA, obras viales y comunicados municipales.
          </p>
        </div>

        {currentUser.rol === 'administrador' && onOpenCreateNotice && (
          <button
            onClick={onOpenCreateNotice}
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Nuevo Aviso</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Type Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'todos', label: 'Todos los Avisos' },
            { id: 'corte_agua', label: 'Cortes de Agua' },
            { id: 'corte_luz', label: 'Cortes de Luz' },
            { id: 'vias', label: 'Vías y Tránsito' },
            { id: 'comunicado_alcaldia', label: 'Alcaldía' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-[#0D47A1] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por barrio o palabra..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2196F3] focus:outline-none"
          />
        </div>
      </div>

      {/* Notice List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotices.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No se encontraron avisos comunitarios</p>
            <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otra categoría o limpiando la búsqueda.</p>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const badge = getNoticeBadge(notice.tipo);
            const Icon = badge.icon;

            return (
              <div
                key={notice.id_aviso}
                className={`bg-white rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md relative space-y-4 ${
                  notice.urgente 
                    ? 'border-amber-400/80 bg-amber-50/20' 
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${badge.colorClass}`}>
                      <Icon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                      <span>{badge.label}</span>
                    </span>

                    {notice.urgente && (
                      <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                        URGENTE
                      </span>
                    )}
                  </div>

                  {currentUser.rol === 'administrador' && onDeleteNotice && (
                    <button
                      onClick={() => onDeleteNotice(notice.id_aviso)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar aviso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {notice.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {notice.descripcion}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Sector: {notice.sector_afectado}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Publicado: {notice.fecha_publicacion}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
