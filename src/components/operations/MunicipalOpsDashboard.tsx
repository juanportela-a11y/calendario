import React, { useEffect, useState, Suspense, lazy } from 'react';
import { 
  HardHat, 
  Droplets, 
  PawPrint, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  CloudCheck,
  RefreshCw,
  Vote,
  MessageSquarePlus,
  FileSpreadsheet,
  FileText,
  Waves
} from 'lucide-react';
import { useOpsStore } from '../../stores/useOpsStore';
import { OpsMetricsHeader } from './OpsMetricsHeader';
import { ViasManagementTab } from './ViasManagementTab';
import { CortesManagementTab } from './CortesManagementTab';
import { SaludEsterilizacionTab } from './SaludEsterilizacionTab';
import { CitizenParticipationSection } from './CitizenParticipationSection';
import { CitizenReportModal } from './CitizenReportModal';
import { AuditLogFooter } from './AuditLogFooter';
import { Skeleton } from '../common/SkeletonLoaders';
import { HydroWeatherMonitor } from '../weather/HydroWeatherMonitor';
import { generateMunicipalOpsPDF, exportViasToCSV } from '../../utils/exportUtils';

// On-demand lazy load for Map to optimize bundle & avoid Leaflet overhead when not needed
const OpsMapViewerLazy = lazy(() => 
  import('./OpsMapViewer').then(mod => ({ default: mod.OpsMapViewer }))
);

export const MunicipalOpsDashboard: React.FC = () => {
  const {
    vias,
    cortes,
    jornadas,
    auditLogs,
    encuestas,
    rutasDesvios,
    selectedDesvio,
    isFirebaseSynced,
    isLoading,
    activeTab,
    layersVisibility,
    filters,
    toastMessage,
    setActiveTab,
    toggleLayer,
    setFilters,
    resetFilters,
    setSelectedDesvio,
    initFirestoreSync,
    addVia,
    updateViaStatus,
    updateViaCoords,
    addCorte,
    updateCorteStatus,
    updateCorteCoords,
    addJornada,
    addInscrito,
    addPersonal,
    updateInscritoStatus,
    updateJornadaCoords,
    submitReporteCiudadano,
    voteEncuesta
  } = useOpsStore();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Initialize Firestore listeners & real-time synchronization
  useEffect(() => {
    const cleanup = initFirestoreSync();
    return cleanup;
  }, [initFirestoreSync]);

  return (
    <div id="municipal-ops-dashboard" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-in">
      
      {/* Cloud Sync & Municipal Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-blue-700/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-2xl border border-blue-400/30 backdrop-blur-xs">
            <Activity className="w-5 h-5 animate-pulse text-[#4FC3F7]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Centro de Operaciones & Control Territorial
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                En Vivo • Tolima
              </span>
            </div>
            <p className="text-xs text-blue-200/80 font-medium">
              Alcaldía de Purificación • Gestión Integral de Vías, Servicios, Zoonosis y Participación Ciudadana
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Citizen Report button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Reporte Vecinal</span>
          </button>

          {isFirebaseSynced ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <CloudCheck className="w-4 h-4" />
              <span>Firestore Offline-Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Sincronizando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Metrics Header with Global Filters */}
      <OpsMetricsHeader 
        vias={vias}
        cortes={cortes}
        jornadas={jornadas}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
      />

      {/* Interactive Map Section (On-Demand Lazy Loaded with Suspense) */}
      <Suspense fallback={
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 h-[480px] flex flex-col items-center justify-center space-y-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <p className="text-sm font-bold text-slate-500">Cargando visor geográfico y capas...</p>
        </div>
      }>
        <OpsMapViewerLazy 
          vias={vias}
          cortes={cortes}
          jornadas={jornadas}
          rutasDesvios={rutasDesvios}
          selectedDesvio={selectedDesvio}
          onSelectDesvio={setSelectedDesvio}
          layersVisibility={layersVisibility}
          onToggleLayer={toggleLayer}
          filters={filters}
          onMapClickToAdd={() => setIsReportModalOpen(true)}
          onUpdateViaCoords={updateViaCoords}
          onUpdateCorteCoords={updateCorteCoords}
          onUpdateJornadaCoords={updateJornadaCoords}
          onSelectVia={() => {}}
          onSelectCorte={() => {}}
          onSelectJornada={() => {}}
        />
      </Suspense>

      {/* Organized Module Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 overflow-x-auto">
        
        <button
          id="tab-btn-vias"
          onClick={() => setActiveTab('vias')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'vias'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Malla Vial ({vias.length})</span>
        </button>

        <button
          id="tab-btn-cortes"
          onClick={() => setActiveTab('cortes')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'cortes'
              ? 'bg-sky-500 text-white shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Cortes Servicios ({cortes.length})</span>
        </button>

        <button
          id="tab-btn-salud"
          onClick={() => setActiveTab('salud')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'salud'
              ? 'bg-emerald-600 text-white shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PawPrint className="w-4 h-4" />
          <span>Zoonosis ({jornadas.length})</span>
        </button>

        <button
          id="tab-btn-participacion"
          onClick={() => setActiveTab('participacion')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'participacion'
              ? 'bg-[#0D47A1] text-white shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Vote className="w-4 h-4 text-emerald-400" />
          <span>Consultas Ciudadanas ({encuestas.length})</span>
        </button>

        <button
          id="tab-btn-rio"
          onClick={() => setActiveTab('rio')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'rio'
              ? 'bg-cyan-700 text-white shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Waves className="w-4 h-4 text-cyan-300" />
          <span>Río Magdalena & Clima</span>
        </button>

      </div>

      {/* Module Content Area */}
      <div className="mt-4">
        {activeTab === 'vias' && (
          <ViasManagementTab 
            vias={vias}
            filters={filters}
            onAddVia={addVia}
            onUpdateViaStatus={updateViaStatus}
          />
        )}

        {activeTab === 'cortes' && (
          <CortesManagementTab 
            cortes={cortes}
            filters={filters}
            onAddCorte={addCorte}
            onUpdateCorteStatus={updateCorteStatus}
          />
        )}

        {activeTab === 'salud' && (
          <SaludEsterilizacionTab 
            jornadas={jornadas}
            filters={filters}
            onAddJornada={addJornada}
            onAddInscrito={addInscrito}
            onAddPersonal={addPersonal}
            onUpdateInscritoStatus={updateInscritoStatus}
          />
        )}

        {activeTab === 'participacion' && (
          <CitizenParticipationSection 
            encuestas={encuestas}
            onVote={voteEncuesta}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'rio' && (
          <HydroWeatherMonitor />
        )}
      </div>

      {/* Audit Log Footer (Virtualized) */}
      <AuditLogFooter logs={auditLogs} />

      {/* Citizen Report Modal with Geolocation & Photo Upload */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={submitReporteCiudadano}
      />

    </div>
  );
};
