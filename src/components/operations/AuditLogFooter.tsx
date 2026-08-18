import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Layers, 
  HardHat, 
  Droplets, 
  PawPrint,
  MapPin,
  Sparkles
} from 'lucide-react';
import { RegistroAuditoria } from '../../types';

interface AuditLogFooterProps {
  logs: RegistroAuditoria[];
  onClearLogs?: () => void;
}

export const AuditLogFooter: React.FC<AuditLogFooterProps> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('todos');

  const filteredLogs = logs.filter(l => {
    if (moduleFilter !== 'todos' && l.modulo !== moduleFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match = 
        l.funcionario_nombre.toLowerCase().includes(q) || 
        l.funcionario_rol.toLowerCase().includes(q) || 
        l.descripcion.toLowerCase().includes(q) ||
        l.accion.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getModuleBadge = (modulo: RegistroAuditoria['modulo']) => {
    switch (modulo) {
      case 'Vías':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
          icon: <HardHat className="w-3 h-3" />
        };
      case 'Cortes':
        return {
          bg: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300',
          icon: <Droplets className="w-3 h-3" />
        };
      case 'Salud & Esterilización':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
          icon: <PawPrint className="w-3 h-3" />
        };
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-950 text-[#0D47A1] dark:text-blue-300',
          icon: <MapPin className="w-3 h-3" />
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
      
      {/* Header Bar: Toggle and Summary */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Bitácora de Auditoría & Trazabilidad Municipal
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0D47A1] dark:text-blue-300">
                {logs.length} registros
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Historial cronológico inmutable de intervenciones, cambios de estado y modificaciones por funcionario
            </p>
          </div>
        </div>

        <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar por funcionario, acción o detalle..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos los Módulos</option>
                <option value="Vías">Malla Vial</option>
                <option value="Cortes">Cortes de Servicios</option>
                <option value="Salud & Esterilización">Zoonosis & Salud</option>
                <option value="Mapa">Georreferenciación / Mapa</option>
              </select>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => {
              const badge = getModuleBadge(log.modulo);

              return (
                <div
                  key={log.id_log}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${badge.bg}`}>
                        {badge.icon}
                        <span>{log.modulo}</span>
                      </span>

                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {log.accion}
                      </span>

                      <span className="text-[11px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#2196F3]" />
                        <span>{log.funcionario_nombre}</span>
                      </span>

                      <span className="text-[10px] text-slate-500 font-medium">
                        ({log.funcionario_rol})
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {log.descripcion}
                    </p>

                    {(log.detalles_anteriores || log.detalles_nuevos) && (
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-0.5">
                        {log.detalles_anteriores && (
                          <p className="text-slate-500">
                            <span className="font-bold text-red-500">Previo:</span> {log.detalles_anteriores}
                          </p>
                        )}
                        {log.detalles_nuevos && (
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-emerald-600">Nuevo:</span> {log.detalles_nuevos}
                          </p>
                        )}
                      </div>
                    )}

                  </div>

                  <div className="shrink-0 text-right sm:text-right">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      <span>{log.timestamp}</span>
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No se encontraron registros de auditoría que coincidan con la búsqueda.
            </div>
          )}

        </div>
      )}

    </div>
  );
};
