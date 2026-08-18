import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  Droplets, 
  PawPrint, 
  Map as MapIcon, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  ReporteVia, 
  CorteProgramado, 
  JornadaSaludEsterilizacion, 
  RegistroAuditoria, 
  OpsGlobalFilterState, 
  MapLayersVisibility,
  EstadoVia,
  EstadoCorte,
  InscritoJornada,
  PersonalSaludAsignado
} from '../../types';
import { 
  INITIAL_VIAS, 
  INITIAL_CORTES, 
  INITIAL_JORNADAS_SALUD, 
  INITIAL_AUDIT_LOGS 
} from '../../data/municipalOpsData';
import { OpsMetricsHeader } from './OpsMetricsHeader';
import { OpsMapViewer } from './OpsMapViewer';
import { ViasManagementTab } from './ViasManagementTab';
import { CortesManagementTab } from './CortesManagementTab';
import { SaludEsterilizacionTab } from './SaludEsterilizacionTab';
import { AuditLogFooter } from './AuditLogFooter';

export const MunicipalOpsDashboard: React.FC = () => {
  // Main state with localStorage persistence
  const [vias, setVias] = useState<ReporteVia[]>(() => {
    const saved = localStorage.getItem('purifi_ops_vias');
    return saved ? JSON.parse(saved) : INITIAL_VIAS;
  });

  const [cortes, setCortes] = useState<CorteProgramado[]>(() => {
    const saved = localStorage.getItem('purifi_ops_cortes');
    return saved ? JSON.parse(saved) : INITIAL_CORTES;
  });

  const [jornadas, setJornadas] = useState<JornadaSaludEsterilizacion[]>(() => {
    const saved = localStorage.getItem('purifi_ops_jornadas');
    return saved ? JSON.parse(saved) : INITIAL_JORNADAS_SALUD;
  });

  const [auditLogs, setAuditLogs] = useState<RegistroAuditoria[]>(() => {
    const saved = localStorage.getItem('purifi_ops_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Active module tab: 'vias' | 'cortes' | 'salud'
  const [activeTab, setActiveTab] = useState<'vias' | 'cortes' | 'salud'>('vias');

  // Layer visibility state for Map
  const [layersVisibility, setLayersVisibility] = useState<MapLayersVisibility>({
    vias: true,
    cortes: true,
    salud: true,
    radiosAfectacion: true
  });

  // Global filters
  const [filters, setFilters] = useState<OpsGlobalFilterState>({
    searchQuery: '',
    barrioSeleccionado: 'todos',
    severidadFiltro: 'todas',
    estadoFiltro: 'todos'
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('purifi_ops_vias', JSON.stringify(vias));
  }, [vias]);

  useEffect(() => {
    localStorage.setItem('purifi_ops_cortes', JSON.stringify(cortes));
  }, [cortes]);

  useEffect(() => {
    localStorage.setItem('purifi_ops_jornadas', JSON.stringify(jornadas));
  }, [jornadas]);

  useEffect(() => {
    localStorage.setItem('purifi_ops_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper to add audit log
  const logAction = (
    modulo: RegistroAuditoria['modulo'],
    accion: RegistroAuditoria['accion'],
    descripcion: string,
    id_referencia?: number,
    detalles_anteriores?: string,
    detalles_nuevos?: string,
    funcionario_nombre: string = 'Ing. Carlos Mendoza',
    funcionario_rol: string = 'Secretaría de Infraestructura y Planeación'
  ) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const newLog: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp,
      funcionario_nombre,
      funcionario_rol,
      modulo,
      accion,
      descripcion,
      id_referencia,
      detalles_anteriores,
      detalles_nuevos
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- Handlers for Vías ---
  const handleAddVia = (newViaData: Omit<ReporteVia, 'id_via'>) => {
    const newId = Math.max(...vias.map(v => v.id_via), 100) + 1;
    const newVia: ReporteVia = {
      ...newViaData,
      id_via: newId
    };
    setVias(prev => [newVia, ...prev]);
    logAction(
      'Vías',
      'CREACIÓN',
      `Registró nuevo daño vial #${newId} "${newVia.titulo}" en ${newVia.direccion} (${newVia.barrio})`,
      newId,
      undefined,
      `Severidad: ${newVia.severidad} | Estado: ${newVia.estado}`
    );
    showToast(`✓ Daño vial #${newId} registrado y georreferenciado con éxito.`);
  };

  const handleUpdateViaStatus = (
    idVia: number, 
    nuevoEstado: EstadoVia, 
    fotoDespues?: string, 
    comentariosTecnicos?: string
  ) => {
    setVias(prev => prev.map(v => {
      if (v.id_via === idVia) {
        const oldEstado = v.estado;
        const updated = {
          ...v,
          estado: nuevoEstado,
          foto_despues: fotoDespues || v.foto_despues,
          fecha_actualizacion: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
        logAction(
          'Vías',
          nuevoEstado === 'completado' ? 'CIERRE_INCIDENCIA' : 'ACTUALIZACIÓN_ESTADO',
          `Actualizó estado de vía #${idVia} a [${nuevoEstado.toUpperCase()}]. ${comentariosTecnicos ? `Nota: "${comentariosTecnicos}"` : ''}`,
          idVia,
          `Estado previo: ${oldEstado}`,
          `Nuevo estado: ${nuevoEstado}${fotoDespues ? ' | Evidencia adjuntada' : ''}`
        );
        return updated;
      }
      return v;
    }));
    showToast(`✓ Estado de vía #${idVia} actualizado a [${nuevoEstado.toUpperCase()}].`);
  };

  const handleUpdateViaCoords = (idVia: number, newCoords: [number, number]) => {
    setVias(prev => prev.map(v => {
      if (v.id_via === idVia) {
        logAction(
          'Mapa',
          'CAMBIO_COORDENADAS',
          `Reubicó marcador de daño vial #${idVia} a [Lat: ${newCoords[0]}, Lng: ${newCoords[1]}] mediante arrastre en mapa`,
          idVia,
          `Coords previas: [${v.coordenadas.join(', ')}]`,
          `Nuevas coords: [${newCoords.join(', ')}]`
        );
        return { ...v, coordenadas: newCoords };
      }
      return v;
    }));
    showToast(`📍 Ubicación de vía #${idVia} actualizada en el mapa.`);
  };

  // --- Handlers for Cortes ---
  const handleAddCorte = (newCorteData: Omit<CorteProgramado, 'id_corte'>) => {
    const newId = Math.max(...cortes.map(c => c.id_corte), 200) + 1;
    const newCorte: CorteProgramado = {
      ...newCorteData,
      id_corte: newId
    };
    setCortes(prev => [newCorte, ...prev]);
    logAction(
      'Cortes',
      'CREACIÓN',
      `Programó corte de ${newCorte.tipo.toUpperCase()} #${newId} en sector "${newCorte.sector_barrio}" para el ${newCorte.fecha_inicio}`,
      newId,
      undefined,
      `Horario: ${newCorte.hora_inicio} a ${newCorte.hora_estimada_fin} | Cuadrilla: ${newCorte.cuadrilla_responsable}`,
      newCorte.creado_por,
      'Empresa Prestadora de Servicios'
    );
    showToast(`✓ Corte de ${newCorte.tipo.toUpperCase()} #${newId} programado y difundido.`);
  };

  const handleUpdateCorteStatus = (idCorte: number, nuevoEstado: EstadoCorte) => {
    setCortes(prev => prev.map(c => {
      if (c.id_corte === idCorte) {
        logAction(
          'Cortes',
          'ACTUALIZACIÓN_ESTADO',
          `Cambió estado de corte #${idCorte} a [${nuevoEstado.toUpperCase()}]`,
          idCorte,
          `Estado: ${c.estado}`,
          `Nuevo estado: ${nuevoEstado}`
        );
        return { ...c, estado: nuevoEstado };
      }
      return c;
    }));
    showToast(`✓ Estado de corte #${idCorte} actualizado a [${nuevoEstado.toUpperCase()}].`);
  };

  const handleUpdateCorteCoords = (idCorte: number, newCoords: [number, number]) => {
    setCortes(prev => prev.map(c => {
      if (c.id_corte === idCorte) {
        logAction(
          'Mapa',
          'CAMBIO_COORDENADAS',
          `Reubicó centro de afectación de corte #${idCorte} a [Lat: ${newCoords[0]}, Lng: ${newCoords[1]}]`,
          idCorte
        );
        return { ...c, coordenadas: newCoords };
      }
      return c;
    }));
    showToast(`📍 Centro de corte #${idCorte} actualizado en el mapa.`);
  };

  // --- Handlers for Salud & Zoonosis ---
  const handleAddJornada = (newJornadaData: Omit<JornadaSaludEsterilizacion, 'id_jornada'>) => {
    const newId = Math.max(...jornadas.map(j => j.id_jornada), 300) + 1;
    const newJornada: JornadaSaludEsterilizacion = {
      ...newJornadaData,
      id_jornada: newId
    };
    setJornadas(prev => [newJornada, ...prev]);
    logAction(
      'Salud & Esterilización',
      'CREACIÓN',
      `Programó nueva jornada de salud/esterilización #${newId} "${newJornada.titulo}" en ${newJornada.lugar} para el ${newJornada.fecha}`,
      newId,
      undefined,
      `Cupos: ${newJornada.cupos_totales} | Entidad: ${newJornada.responsable_entidad}`,
      newJornada.creado_por,
      'Secretaría de Salud y Protección Social'
    );
    showToast(`🐾 Jornada #${newId} programada con éxito.`);
  };

  const handleAddInscrito = (
    idJornada: number, 
    nuevoInscritoData: Omit<InscritoJornada, 'id_inscrito' | 'id_jornada'>
  ) => {
    setJornadas(prev => prev.map(j => {
      if (j.id_jornada === idJornada) {
        const newInscritoId = Date.now();
        const newInscrito: InscritoJornada = {
          ...nuevoInscritoData,
          id_inscrito: newInscritoId,
          id_jornada: idJornada
        };
        logAction(
          'Salud & Esterilización',
          'REGISTRO_INSCRIPCIÓN',
          `Inscribió a mascota "${newInscrito.mascota_nombre}" (${newInscrito.especie}) - Tutor: ${newInscrito.tutor_nombre} en jornada #${idJornada}`,
          idJornada,
          undefined,
          `Turno: ${newInscrito.hora_turno} | Barrio: ${newInscrito.barrio}`
        );
        return {
          ...j,
          cupos_ocupados: Math.min(j.cupos_totales, j.cupos_ocupados + 1),
          inscritos: [newInscrito, ...j.inscritos]
        };
      }
      return j;
    }));
    showToast(`✓ Mascota inscrita y turno asignado exitosamente.`);
  };

  const handleAddPersonal = (
    idJornada: number, 
    nuevoPersonalData: Omit<PersonalSaludAsignado, 'id_personal'>
  ) => {
    setJornadas(prev => prev.map(j => {
      if (j.id_jornada === idJornada) {
        const newPersonalId = Date.now();
        const newStaff: PersonalSaludAsignado = {
          ...nuevoPersonalData,
          id_personal: newPersonalId
        };
        logAction(
          'Salud & Esterilización',
          'ASIGNACIÓN_PERSONAL',
          `Asignó al profesional ${newStaff.nombre} (${newStaff.cargo}) a la jornada #${idJornada}`,
          idJornada
        );
        return {
          ...j,
          personal_asignado: [...j.personal_asignado, newStaff]
        };
      }
      return j;
    }));
    showToast(`✓ Funcionario asignado al equipo médico.`);
  };

  const handleUpdateInscritoStatus = (
    idJornada: number, 
    idInscrito: number, 
    nuevoEstado: 'inscrito' | 'atendido' | 'cancelado'
  ) => {
    setJornadas(prev => prev.map(j => {
      if (j.id_jornada === idJornada) {
        return {
          ...j,
          inscritos: j.inscritos.map(i => i.id_inscrito === idInscrito ? { ...i, estado: nuevoEstado } : i)
        };
      }
      return j;
    }));
    showToast(`✓ Paciente marcado como [${nuevoEstado.toUpperCase()}].`);
  };

  const handleUpdateJornadaCoords = (idJornada: number, newCoords: [number, number]) => {
    setJornadas(prev => prev.map(j => {
      if (j.id_jornada === idJornada) {
        logAction(
          'Mapa',
          'CAMBIO_COORDENADAS',
          `Reubicó punto de atención de jornada #${idJornada} a [Lat: ${newCoords[0]}, Lng: ${newCoords[1]}]`,
          idJornada
        );
        return { ...j, coordenadas: newCoords };
      }
      return j;
    }));
    showToast(`📍 Punto de jornada #${idJornada} actualizado.`);
  };

  // Map direct click handler to open the respective tab or create flow
  const handleMapClickToAdd = (coords: [number, number]) => {
    showToast(`📍 Punto seleccionado [${coords[0]}, ${coords[1]}]. Puedes registrarlo en el módulo activo.`);
  };

  const handleToggleLayer = (layerKey: keyof MapLayersVisibility) => {
    setLayersVisibility(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      barrioSeleccionado: 'todos',
      severidadFiltro: 'todas',
      estadoFiltro: 'todos'
    });
  };

  const handleQuickAdd = (tipo: 'via' | 'corte' | 'jornada') => {
    if (tipo === 'via') setActiveTab('vias');
    if (tipo === 'corte') setActiveTab('cortes');
    if (tipo === 'jornada') setActiveTab('salud');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border border-slate-700 animate-slide-in">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Metrics Panel with Global Filters */}
      <OpsMetricsHeader
        vias={vias}
        cortes={cortes}
        jornadas={jornadas}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        onQuickAdd={handleQuickAdd}
      />

      {/* 2. Interactive Leaflet Map with Layer Controls and Direct Editing */}
      <OpsMapViewer
        vias={vias}
        cortes={cortes}
        jornadas={jornadas}
        layersVisibility={layersVisibility}
        onToggleLayer={handleToggleLayer}
        filters={filters}
        onMapClickToAdd={handleMapClickToAdd}
        onUpdateViaCoords={handleUpdateViaCoords}
        onUpdateCorteCoords={handleUpdateCorteCoords}
        onUpdateJornadaCoords={handleUpdateJornadaCoords}
        onSelectVia={() => setActiveTab('vias')}
        onSelectCorte={() => setActiveTab('cortes')}
        onSelectJornada={() => setActiveTab('salud')}
      />

      {/* 3. Module Tabs Navigation */}
      <div className="space-y-4">
        
        {/* Module Tab Selector */}
        <div className="bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 border border-slate-200 dark:border-slate-700">
          
          <button
            onClick={() => setActiveTab('vias')}
            className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'vias'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardHat className={`w-4 h-4 ${activeTab === 'vias' ? 'text-amber-500' : ''}`} />
            <span>Gestión de Vías & Deterioro ({vias.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cortes')}
            className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'cortes'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Droplets className={`w-4 h-4 ${activeTab === 'cortes' ? 'text-sky-500' : ''}`} />
            <span>Control de Cortes de Servicios ({cortes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('salud')}
            className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'salud'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PawPrint className={`w-4 h-4 ${activeTab === 'salud' ? 'text-emerald-500' : ''}`} />
            <span>Jornadas de Salud & Esterilización ({jornadas.length})</span>
          </button>

        </div>

        {/* Tab Module Content */}
        <div>
          {activeTab === 'vias' && (
            <ViasManagementTab
              vias={vias}
              filters={filters}
              onAddVia={handleAddVia}
              onUpdateViaStatus={handleUpdateViaStatus}
            />
          )}

          {activeTab === 'cortes' && (
            <CortesManagementTab
              cortes={cortes}
              filters={filters}
              onAddCorte={handleAddCorte}
              onUpdateCorteStatus={handleUpdateCorteStatus}
            />
          )}

          {activeTab === 'salud' && (
            <SaludEsterilizacionTab
              jornadas={jornadas}
              filters={filters}
              onAddJornada={handleAddJornada}
              onAddInscrito={handleAddInscrito}
              onAddPersonal={handleAddPersonal}
              onUpdateInscritoStatus={handleUpdateInscritoStatus}
            />
          )}
        </div>

      </div>

      {/* 4. Panel de Bitácora y Auditoría (Footer) */}
      <AuditLogFooter logs={auditLogs} />

    </div>
  );
};
