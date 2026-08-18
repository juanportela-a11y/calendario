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
  AlertTriangle,
  Cloud,
  CloudCheck,
  RefreshCw
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
import { 
  seedInitialOpsDataIfEmpty,
  subscribeToVias,
  saveViaToFirestore,
  subscribeToCortes,
  saveCorteToFirestore,
  subscribeToJornadas,
  saveJornadaToFirestore,
  subscribeToAuditLogs,
  saveAuditLogToFirestore
} from '../../adapters/firebaseOpsAdapter';
import { OpsMetricsHeader } from './OpsMetricsHeader';
import { OpsMapViewer } from './OpsMapViewer';
import { ViasManagementTab } from './ViasManagementTab';
import { CortesManagementTab } from './CortesManagementTab';
import { SaludEsterilizacionTab } from './SaludEsterilizacionTab';
import { AuditLogFooter } from './AuditLogFooter';

export const MunicipalOpsDashboard: React.FC = () => {
  // State synchronized with Firebase Firestore
  const [vias, setVias] = useState<ReporteVia[]>(INITIAL_VIAS);
  const [cortes, setCortes] = useState<CorteProgramado[]>(INITIAL_CORTES);
  const [jornadas, setJornadas] = useState<JornadaSaludEsterilizacion[]>(INITIAL_JORNADAS_SALUD);
  const [auditLogs, setAuditLogs] = useState<RegistroAuditoria[]>(INITIAL_AUDIT_LOGS);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);

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

  // Initialize Firebase Firestore Data & Realtime Listeners
  useEffect(() => {
    let unsubVias: (() => void) | undefined;
    let unsubCortes: (() => void) | undefined;
    let unsubJornadas: (() => void) | undefined;
    let unsubLogs: (() => void) | undefined;

    const initFirestore = async () => {
      try {
        await seedInitialOpsDataIfEmpty();
        setIsFirebaseSynced(true);

        unsubVias = subscribeToVias((data) => {
          if (data && data.length > 0) setVias(data);
        });

        unsubCortes = subscribeToCortes((data) => {
          if (data && data.length > 0) setCortes(data);
        });

        unsubJornadas = subscribeToJornadas((data) => {
          if (data && data.length > 0) setJornadas(data);
        });

        unsubLogs = subscribeToAuditLogs((data) => {
          if (data && data.length > 0) setAuditLogs(data);
        });
      } catch (err) {
        console.error('Failed to initialize Firestore sync:', err);
      }
    };

    initFirestore();

    return () => {
      if (unsubVias) unsubVias();
      if (unsubCortes) unsubCortes();
      if (unsubJornadas) unsubJornadas();
      if (unsubLogs) unsubLogs();
    };
  }, []);

  // Helper to add audit log to state and Firebase Firestore
  const logAction = async (
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
    try {
      await saveAuditLogToFirestore(newLog);
    } catch (e) {
      console.error('Error saving audit log to Firestore:', e);
    }
  };

  // --- Handlers for Vías ---
  const handleAddVia = async (newViaData: Omit<ReporteVia, 'id_via'>) => {
    const newId = Math.max(...vias.map(v => v.id_via), 100) + 1;
    const newVia: ReporteVia = {
      ...newViaData,
      id_via: newId
    };

    setVias(prev => [newVia, ...prev]);
    try {
      await saveViaToFirestore(newVia);
    } catch (e) {
      console.error('Error saving via to Firestore:', e);
    }

    await logAction(
      'Vías',
      'CREACIÓN',
      `Registró nuevo daño vial #${newId} "${newVia.titulo}" en ${newVia.direccion} (${newVia.barrio})`,
      newId,
      undefined,
      `Severidad: ${newVia.severidad} | Estado: ${newVia.estado}`
    );
    showToast(`✓ Daño vial #${newId} guardado en Firestore y georreferenciado.`);
  };

  const handleUpdateViaStatus = async (
    idVia: number, 
    nuevoEstado: EstadoVia, 
    fotoDespues?: string, 
    comentariosTecnicos?: string
  ) => {
    const target = vias.find(v => v.id_via === idVia);
    if (!target) return;

    const oldEstado = target.estado;
    const updated: ReporteVia = {
      ...target,
      estado: nuevoEstado,
      foto_despues: fotoDespues || target.foto_despues,
      fecha_actualizacion: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setVias(prev => prev.map(v => v.id_via === idVia ? updated : v));
    try {
      await saveViaToFirestore(updated);
    } catch (e) {
      console.error('Error updating via in Firestore:', e);
    }

    await logAction(
      'Vías',
      nuevoEstado === 'completado' ? 'CIERRE_INCIDENCIA' : 'ACTUALIZACIÓN_ESTADO',
      `Actualizó estado de vía #${idVia} a [${nuevoEstado.toUpperCase()}]. ${comentariosTecnicos ? `Nota: "${comentariosTecnicos}"` : ''}`,
      idVia,
      `Estado previo: ${oldEstado}`,
      `Nuevo estado: ${nuevoEstado}${fotoDespues ? ' | Evidencia adjuntada' : ''}`
    );
    showToast(`✓ Estado de vía #${idVia} actualizado a [${nuevoEstado.toUpperCase()}].`);
  };

  const handleUpdateViaCoords = async (idVia: number, newCoords: [number, number]) => {
    const target = vias.find(v => v.id_via === idVia);
    if (!target) return;

    const updated: ReporteVia = { ...target, coordenadas: newCoords };
    setVias(prev => prev.map(v => v.id_via === idVia ? updated : v));

    try {
      await saveViaToFirestore(updated);
    } catch (e) {
      console.error('Error updating via coords in Firestore:', e);
    }

    await logAction(
      'Mapa',
      'CAMBIO_COORDENADAS',
      `Reubicó marcador de daño vial #${idVia} a [Lat: ${newCoords[0]}, Lng: ${newCoords[1]}] mediante arrastre en mapa`,
      idVia,
      `Coords previas: [${target.coordenadas.join(', ')}]`,
      `Nuevas coords: [${newCoords.join(', ')}]`
    );
    showToast(`📍 Ubicación de vía #${idVia} guardada en Firestore.`);
  };

  // --- Handlers for Cortes ---
  const handleAddCorte = async (newCorteData: Omit<CorteProgramado, 'id_corte'>) => {
    const newId = Math.max(...cortes.map(c => c.id_corte), 200) + 1;
    const newCorte: CorteProgramado = {
      ...newCorteData,
      id_corte: newId
    };

    setCortes(prev => [newCorte, ...prev]);
    try {
      await saveCorteToFirestore(newCorte);
    } catch (e) {
      console.error('Error saving corte to Firestore:', e);
    }

    await logAction(
      'Cortes',
      'CREACIÓN',
      `Programó corte de ${newCorte.tipo.toUpperCase()} #${newId} en sector "${newCorte.sector_barrio}" para el ${newCorte.fecha_inicio}`,
      newId,
      undefined,
      `Horario: ${newCorte.hora_inicio} a ${newCorte.hora_estimada_fin} | Cuadrilla: ${newCorte.cuadrilla_responsable}`,
      newCorte.creado_por,
      'Empresa Prestadora de Servicios'
    );
    showToast(`✓ Corte de ${newCorte.tipo.toUpperCase()} #${newId} guardado en Firestore.`);
  };

  const handleUpdateCorteStatus = async (idCorte: number, nuevoEstado: EstadoCorte) => {
    const target = cortes.find(c => c.id_corte === idCorte);
    if (!target) return;

    const updated: CorteProgramado = { ...target, estado: nuevoEstado };
    setCortes(prev => prev.map(c => c.id_corte === idCorte ? updated : c));

    try {
      await saveCorteToFirestore(updated);
    } catch (e) {
      console.error('Error updating corte status in Firestore:', e);
    }

    await logAction(
      'Cortes',
      'ACTUALIZACIÓN_ESTADO',
      `Cambió estado de corte #${idCorte} a [${nuevoEstado.toUpperCase()}]`,
      idCorte,
      `Estado: ${target.estado}`,
      `Nuevo estado: ${nuevoEstado}`
    );
    showToast(`✓ Estado de corte #${idCorte} actualizado en Firestore.`);
  };

  const handleUpdateCorteCoords = async (idCorte: number, newCoords: [number, number]) => {
    const target = cortes.find(c => c.id_corte === idCorte);
    if (!target) return;

    const updated: CorteProgramado = { ...target, coordenadas: newCoords };
    setCortes(prev => prev.map(c => c.id_corte === idCorte ? updated : c));

    try {
      await saveCorteToFirestore(updated);
    } catch (e) {
      console.error('Error updating corte coords in Firestore:', e);
    }

    await logAction(
      'Mapa',
      'CAMBIO_COORDENADAS',
      `Reubicó centro de afectación de corte #${idCorte} a [Lat: ${newCoords[0]}, Lng: ${newCoords[1]}]`,
      idCorte
    );
    showToast(`📍 Centro de corte #${idCorte} guardado en Firestore.`);
  };

  // --- Handlers for Salud & Zoonosis ---
  const handleAddJornada = async (newJornadaData: Omit<JornadaSaludEsterilizacion, 'id_jornada'>) => {
    const newId = Math.max(...jornadas.map(j => j.id_jornada), 300) + 1;
    const newJornada: JornadaSaludEsterilizacion = {
      ...newJornadaData,
      id_jornada: newId
    };

    setJornadas(prev => [newJornada, ...prev]);
    try {
      await saveJornadaToFirestore(newJornada);
    } catch (e) {
      console.error('Error saving jornada to Firestore:', e);
    }

    await logAction(
      'Salud & Esterilización',
      'CREACIÓN',
      `Programó nueva jornada de salud/esterilización #${newId} "${newJornada.titulo}" en ${newJornada.lugar} para el ${newJornada.fecha}`,
      newId,
      undefined,
      `Cupos: ${newJornada.cupos_totales} | Entidad: ${newJornada.responsable_entidad}`,
      newJornada.creado_por,
      'Secretaría de Salud y Protección Social'
    );
    showToast(`🐾 Jornada #${newId} guardada en Firestore.`);
  };

  const handleAddInscrito = async (
    idJornada: number, 
    nuevoInscritoData: Omit<InscritoJornada, 'id_inscrito' | 'id_jornada'>
  ) => {
    const target = jornadas.find(j => j.id_jornada === idJornada);
    if (!target) return;

    const newInscritoId = Date.now();
    const newInscrito: InscritoJornada = {
      ...nuevoInscritoData,
      id_inscrito: newInscritoId,
      id_jornada: idJornada
    };

    const updated: JornadaSaludEsterilizacion = {
      ...target,
      cupos_ocupados: Math.min(target.cupos_totales, target.cupos_ocupados + 1),
      inscritos: [newInscrito, ...target.inscritos]
    };

    setJornadas(prev => prev.map(j => j.id_jornada === idJornada ? updated : j));

    try {
      await saveJornadaToFirestore(updated);
    } catch (e) {
      console.error('Error updating jornada inscritos in Firestore:', e);
    }

    await logAction(
      'Salud & Esterilización',
      'REGISTRO_INSCRIPCIÓN',
      `Inscribió a mascota "${newInscrito.mascota_nombre}" (${newInscrito.especie}) - Tutor: ${newInscrito.tutor_nombre} en jornada #${idJornada}`,
      idJornada,
      undefined,
      `Turno: ${newInscrito.hora_turno} | Barrio: ${newInscrito.barrio}`
    );
    showToast(`✓ Mascota inscrita y sincronizada con Firestore.`);
  };

  const handleAddPersonal = async (
    idJornada: number, 
    nuevoPersonalData: Omit<PersonalSaludAsignado, 'id_personal'>
  ) => {
    const target = jornadas.find(j => j.id_jornada === idJornada);
    if (!target) return;

    const newPersonalId = Date.now();
    const newStaff: PersonalSaludAsignado = {
      ...nuevoPersonalData,
      id_personal: newPersonalId
    };

    const updated: JornadaSaludEsterilizacion = {
      ...target,
      personal_asignado: [...target.personal_asignado, newStaff]
    };

    setJornadas(prev => prev.map(j => j.id_jornada === idJornada ? updated : j));

    try {
      await saveJornadaToFirestore(updated);
    } catch (e) {
      console.error('Error updating personal in Firestore:', e);
    }

    await logAction(
      'Salud & Esterilización',
      'ASIGNACIÓN_PERSONAL',
      `Asignó al profesional ${newStaff.nombre} (${newStaff.cargo}) a la jornada #${idJornada}`,
      idJornada
    );
    showToast(`✓ Funcionario asignado y guardado en Firestore.`);
  };

  const handleUpdateInscritoStatus = async (
    idJornada: number, 
    idInscrito: number, 
    nuevoEstado: 'inscrito' | 'atendido' | 'cancelado'
  ) => {
    const target = jornadas.find(j => j.id_jornada === idJornada);
    if (!target) return;

    const updated: JornadaSaludEsterilizacion = {
      ...target,
      inscritos: target.inscritos.map(i => i.id_inscrito === idInscrito ? { ...i, estado: nuevoEstado } : i)
    };

    setJornadas(prev => prev.map(j => j.id_jornada === idJornada ? updated : j));

    try {
      await saveJornadaToFirestore(updated);
    } catch (e) {
      console.error('Error updating inscrito status in Firestore:', e);
    }

    showToast(`✓ Estado de paciente actualizado en Firestore.`);
  };

  const handleUpdateJornadaCoords = async (idJornada: number, newCoords: [number, number]) => {
    const target = jornadas.find(j => j.id_jornada === idJornada);
    if (!target) return;

    const updated: JornadaSaludEsterilizacion = { ...target, coordenadas: newCoords };
    setJornadas(prev => prev.map(j => j.id_jornada === idJornada ? updated : j));

    try {
      await saveJornadaToFirestore(updated);
    } catch (e) {
      console.error('Error updating jornada coords in Firestore:', e);
    }

    await logAction(
      'Mapa',
      'CAMBIO_COORDENADAS',
      `Reubicó punto de atención de jornada #${idJornada} a [Lat: ${newCoords[0]}, Lng: ${newCoords[1]}]`,
      idJornada
    );
    showToast(`📍 Punto de jornada #${idJornada} actualizado en Firestore.`);
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

      {/* Cloud Sync Status Banner */}
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Base de Datos Firebase Firestore Conectada & Sincronizada en Tiempo Real</span>
        </div>
        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          Proyecto: keen-karst-0xctm (Purificación, Tolima)
        </span>
      </div>

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

