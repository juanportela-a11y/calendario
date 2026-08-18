import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Plus, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  AlertTriangle, 
  Droplets, 
  Zap, 
  Flame, 
  HeartHandshake, 
  Compass, 
  Maximize2,
  CheckCircle2,
  XCircle,
  Move
} from 'lucide-react';
import { 
  ReporteVia, 
  CorteProgramado, 
  JornadaSaludEsterilizacion, 
  MapLayersVisibility,
  OpsGlobalFilterState
} from '../../types';
import { PURIFICACION_COORDINATES } from '../../data/municipalOpsData';

interface OpsMapViewerProps {
  vias: ReporteVia[];
  cortes: CorteProgramado[];
  jornadas: JornadaSaludEsterilizacion[];
  layersVisibility: MapLayersVisibility;
  onToggleLayer: (layerKey: keyof MapLayersVisibility) => void;
  filters: OpsGlobalFilterState;
  onMapClickToAdd: (coords: [number, number]) => void;
  onUpdateViaCoords: (idVia: number, newCoords: [number, number]) => void;
  onUpdateCorteCoords: (idCorte: number, newCoords: [number, number]) => void;
  onUpdateJornadaCoords: (idJornada: number, newCoords: [number, number]) => void;
  onSelectVia: (via: ReporteVia) => void;
  onSelectCorte: (corte: CorteProgramado) => void;
  onSelectJornada: (jornada: JornadaSaludEsterilizacion) => void;
}

export const OpsMapViewer: React.FC<OpsMapViewerProps> = ({
  vias,
  cortes,
  jornadas,
  layersVisibility,
  onToggleLayer,
  filters,
  onMapClickToAdd,
  onUpdateViaCoords,
  onUpdateCorteCoords,
  onUpdateJornadaCoords,
  onSelectVia,
  onSelectCorte,
  onSelectJornada
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [selectedCoordNotice, setSelectedCoordNotice] = useState<string | null>(null);
  const [activeLayerPanel, setActiveLayerPanel] = useState<boolean>(true);

  // Filter items based on global filters
  const filteredVias = vias.filter(v => {
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

  const filteredCortes = cortes.filter(c => {
    if (filters.barrioSeleccionado !== 'todos' && !c.sector_barrio.toLowerCase().includes(filters.barrioSeleccionado.toLowerCase())) return false;
    if (filters.estadoFiltro !== 'todos' && c.estado !== filters.estadoFiltro) return false;
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match = c.titulo.toLowerCase().includes(q) || c.motivo.toLowerCase().includes(q) || c.sector_barrio.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const filteredJornadas = jornadas.filter(j => {
    if (filters.barrioSeleccionado !== 'todos' && j.barrio !== filters.barrioSeleccionado) return false;
    if (filters.estadoFiltro !== 'todos' && j.estado !== filters.estadoFiltro) return false;
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match = j.titulo.toLowerCase().includes(q) || j.lugar.toLowerCase().includes(q) || j.barrio.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: PURIFICACION_COORDINATES,
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors | Purificación, Tolima'
    }).addTo(map);

    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    circlesLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Click on Map for Direct Editing / Add Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddMode) {
        const coords: [number, number] = [Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5))];
        setSelectedCoordNotice(`Punto seleccionado: Lat ${coords[0]}, Lng ${coords[1]}`);
        onMapClickToAdd(coords);
        setIsAddMode(false);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isAddMode, onMapClickToAdd]);

  // Update Markers & Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    const circlesGroup = circlesLayerGroupRef.current;
    if (!map || !markersGroup || !circlesGroup) return;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();

    // 1. CAPA DE VÍAS DAÑADAS
    if (layersVisibility.vias) {
      filteredVias.forEach((via) => {
        const isCompletado = via.estado === 'completado';
        const isReparacion = via.estado === 'reparacion';
        const isInspeccion = via.estado === 'inspeccion';

        const colorBg = isCompletado
          ? '#10b981' // Green
          : via.severidad === 'alta'
          ? '#ef4444' // Red
          : via.severidad === 'media'
          ? '#f59e0b' // Amber
          : '#3b82f6'; // Blue

        const statusLabel = isCompletado
          ? 'Completado / Pavimentado'
          : isReparacion
          ? 'En Reparación'
          : isInspeccion
          ? 'En Inspección'
          : 'Reportado';

        const customHtml = `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
            <div style="background-color: ${colorBg};" class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-black transition-transform hover:scale-125">
              🚧
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-300"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-via-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const marker = L.marker(via.coordenadas, {
          icon,
          draggable: true,
          title: via.titulo
        });

        // Drag marker to adjust location
        marker.on('dragend', (event) => {
          const newPos = event.target.getLatLng();
          onUpdateViaCoords(via.id_via, [Number(newPos.lat.toFixed(5)), Number(newPos.lng.toFixed(5))]);
        });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 font-sans text-slate-800 text-xs min-w-[220px]';
        popupContent.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2 border-b pb-1">
              <span class="font-extrabold text-[11px] text-slate-500 uppercase">Daño Vial #${via.id_via}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: ${colorBg};">
                ${statusLabel}
              </span>
            </div>
            <p class="font-black text-sm text-slate-900 leading-tight">${via.titulo}</p>
            <p class="text-[11px] text-slate-600">📍 ${via.direccion} (${via.barrio})</p>
            <p class="text-[11px] text-slate-700 bg-slate-100 p-1.5 rounded">${via.descripcion}</p>
            ${via.material_estimado ? `<p class="text-[10px] text-blue-800 font-bold">📦 Material: ${via.material_estimado}</p>` : ''}
            <div class="pt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Arrastra para reubicar</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersGroup);
      });
    }

    // 2. CAPA DE CORTES PROGRAMADOS DE SERVICIOS
    if (layersVisibility.cortes) {
      filteredCortes.forEach((corte) => {
        const isWater = corte.tipo === 'agua';
        const isPower = corte.tipo === 'energia';
        const isGas = corte.tipo === 'gas';

        const colorBg = isWater ? '#0284c7' : isPower ? '#eab308' : '#ea580c';
        const serviceEmoji = isWater ? '💧' : isPower ? '⚡' : '🔥';

        const customHtml = `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
            <div style="background-color: ${colorBg};" class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-black transition-transform hover:scale-125">
              ${serviceEmoji}
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-300"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-corte-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const marker = L.marker(corte.coordenadas, {
          icon,
          draggable: true,
          title: corte.titulo
        });

        marker.on('dragend', (event) => {
          const newPos = event.target.getLatLng();
          onUpdateCorteCoords(corte.id_corte, [Number(newPos.lat.toFixed(5)), Number(newPos.lng.toFixed(5))]);
        });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 font-sans text-slate-800 text-xs min-w-[220px]';
        popupContent.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2 border-b pb-1">
              <span class="font-extrabold text-[11px] text-slate-500 uppercase">Corte ${corte.tipo.toUpperCase()}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: ${colorBg};">
                ${corte.estado.toUpperCase()}
              </span>
            </div>
            <p class="font-black text-sm text-slate-900 leading-tight">${corte.titulo}</p>
            <p class="text-[11px] text-slate-600">📍 Sector: ${corte.sector_barrio}</p>
            <p class="text-[11px] font-bold text-slate-700">🕒 ${corte.fecha_inicio} (${corte.hora_inicio} - ${corte.hora_estimada_fin})</p>
            <p class="text-[11px] text-slate-700 bg-slate-100 p-1.5 rounded">${corte.motivo}</p>
            <p class="text-[10px] text-slate-500">👷 ${corte.cuadrilla_responsable}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersGroup);

        // Draw Affectation Radius Circle if enabled
        if (layersVisibility.radiosAfectacion && corte.radio_afectacion_m) {
          const circle = L.circle(corte.coordenadas, {
            color: colorBg,
            fillColor: colorBg,
            fillOpacity: 0.18,
            radius: corte.radio_afectacion_m,
            weight: 2,
            dashArray: '4, 6'
          });
          circle.bindTooltip(`Radio de Afectación: ${corte.radio_afectacion_m}m (${corte.sector_barrio})`);
          circle.addTo(circlesGroup);
        }
      });
    }

    // 3. CAPA DE JORNADAS DE SALUD Y ESTERILIZACIÓN
    if (layersVisibility.salud) {
      filteredJornadas.forEach((jornada) => {
        const customHtml = `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
            <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-black transition-transform hover:scale-125">
              🐾
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-300"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-salud-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const marker = L.marker(jornada.coordenadas, {
          icon,
          draggable: true,
          title: jornada.titulo
        });

        marker.on('dragend', (event) => {
          const newPos = event.target.getLatLng();
          onUpdateJornadaCoords(jornada.id_jornada, [Number(newPos.lat.toFixed(5)), Number(newPos.lng.toFixed(5))]);
        });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 font-sans text-slate-800 text-xs min-w-[220px]';
        popupContent.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2 border-b pb-1">
              <span class="font-extrabold text-[11px] text-emerald-700 uppercase">Jornada Zoonosis</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ${jornada.cupos_ocupados}/${jornada.cupos_totales} Cupos
              </span>
            </div>
            <p class="font-black text-sm text-slate-900 leading-tight">${jornada.titulo}</p>
            <p class="text-[11px] text-slate-600">📍 ${jornada.lugar} (${jornada.barrio})</p>
            <p class="text-[11px] font-bold text-slate-700">📅 Fecha: ${jornada.fecha} (${jornada.hora_inicio} - ${jornada.hora_fin})</p>
            <p class="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded font-medium">📋 ${jornada.requisitos}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersGroup);
      });
    }

  }, [layersVisibility, filteredVias, filteredCortes, filteredJornadas, onUpdateViaCoords, onUpdateCorteCoords, onUpdateJornadaCoords]);

  // Center map on Purificación
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(PURIFICACION_COORDINATES, 15, { animate: true });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
      
      {/* Map Control Bar Top */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#2196F3]/10 text-[#0D47A1] dark:text-blue-400 rounded-xl">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Visualización Geográfica & Mapa de Capas Interactivo
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Municipio de Purificación, Tolima &bull; Coordenadas 3.8582° N, 74.9285° O
            </p>
          </div>
        </div>

        {/* Map Top Action Tools */}
        <div className="flex items-center gap-2">
          
          {/* Add Report by clicking map button */}
          <button
            onClick={() => setIsAddMode(!isAddMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs cursor-pointer ${
              isAddMode
                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 animate-pulse'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{isAddMode ? 'Haz clic en el mapa...' : 'Añadir Reporte en Mapa'}</span>
          </button>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Centrar en Purificación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Toggle Layers Panel Button */}
          <button
            onClick={() => setActiveLayerPanel(!activeLayerPanel)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              activeLayerPanel
                ? 'bg-blue-50 dark:bg-blue-950/80 text-[#0D47A1] dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 text-[#2196F3]" />
            <span>Capas</span>
          </button>

        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-slate-100 dark:bg-slate-950 z-0">
        
        {/* The Leaflet Div */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Add Mode Helper Banner */}
        {isAddMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-amber-500 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-extrabold flex items-center gap-2 animate-bounce">
            <MapPin className="w-4 h-4" />
            <span>Haz clic en cualquier calle o vereda para ubicar el nuevo reporte</span>
            <button 
              onClick={() => setIsAddMode(false)}
              className="ml-2 bg-amber-700 hover:bg-amber-800 px-2 py-0.5 rounded text-[10px]"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Floating Layer Controls Widget */}
        {activeLayerPanel && (
          <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-64 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2196F3]" />
                <span>Capas del Mapa</span>
              </span>
              <span className="text-[10px] text-slate-400">On / Off</span>
            </div>

            <div className="space-y-2">
              
              {/* Layer 1: Vías Dañadas */}
              <button
                onClick={() => onToggleLayer('vias')}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  layersVisibility.vias
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🚧</span>
                  <div className="text-left">
                    <p className="leading-tight font-extrabold">Vías Dañadas</p>
                    <p className="text-[10px] font-normal opacity-80">{filteredVias.length} puntos activos</p>
                  </div>
                </div>
                {layersVisibility.vias ? <Eye className="w-4 h-4 text-amber-600" /> : <EyeOff className="w-4 h-4" />}
              </button>

              {/* Layer 2: Cortes de Servicios */}
              <button
                onClick={() => onToggleLayer('cortes')}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  layersVisibility.cortes
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">💧⚡</span>
                  <div className="text-left">
                    <p className="leading-tight font-extrabold">Cortes de Servicios</p>
                    <p className="text-[10px] font-normal opacity-80">{filteredCortes.length} sectores</p>
                  </div>
                </div>
                {layersVisibility.cortes ? <Eye className="w-4 h-4 text-sky-600" /> : <EyeOff className="w-4 h-4" />}
              </button>

              {/* Layer 3: Jornadas Salud & Zoonosis */}
              <button
                onClick={() => onToggleLayer('salud')}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  layersVisibility.salud
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🐾</span>
                  <div className="text-left">
                    <p className="leading-tight font-extrabold">Jornadas Zoonosis</p>
                    <p className="text-[10px] font-normal opacity-80">{filteredJornadas.length} puestos</p>
                  </div>
                </div>
                {layersVisibility.salud ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4" />}
              </button>

              {/* Layer 4: Radios de Cobertura */}
              <button
                onClick={() => onToggleLayer('radiosAfectacion')}
                className={`w-full p-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-between ${
                  layersVisibility.radiosAfectacion
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'text-slate-400'
                }`}
              >
                <span>Mostrar Radios de Afectación</span>
                <span className="text-xs">{layersVisibility.radiosAfectacion ? '✓' : '✗'}</span>
              </button>

            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Move className="w-3 h-3 text-[#2196F3]" />
              <span>Puedes arrastrar los pines para calibrar su posición</span>
            </div>

          </div>
        )}

        {/* Bottom Legend Pill */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Vía Crítica</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Vía Media</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Pavimentado</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Corte Agua</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span>Corte Energía</span>
          </div>
        </div>

      </div>

    </div>
  );
};
