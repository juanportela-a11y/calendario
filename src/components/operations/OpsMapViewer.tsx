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
  Move,
  Navigation,
  CornerUpRight,
  Share2,
  HelpCircle
} from 'lucide-react';
import { 
  ReporteVia, 
  CorteProgramado, 
  JornadaSaludEsterilizacion, 
  MapLayersVisibility,
  OpsGlobalFilterState
} from '../../types';
import { PURIFICACION_COORDINATES, RutaDesvio } from '../../data/municipalOpsData';
import { shareViaWhatsApp } from '../../utils/notificationUtils';

interface OpsMapViewerProps {
  vias: ReporteVia[];
  cortes: CorteProgramado[];
  jornadas: JornadaSaludEsterilizacion[];
  rutasDesvios: RutaDesvio[];
  selectedDesvio: RutaDesvio | null;
  onSelectDesvio: (desvio: RutaDesvio | null) => void;
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
  rutasDesvios,
  selectedDesvio,
  onSelectDesvio,
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
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);

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
    routesLayerGroupRef.current = L.layerGroup().addTo(map);
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

  // Update Markers, Circles & Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    const circlesGroup = circlesLayerGroupRef.current;
    const routesGroup = routesLayerGroupRef.current;
    if (!map || !markersGroup || !circlesGroup || !routesGroup) return;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();
    routesGroup.clearLayers();

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
            ${via.cuadrilla_asignada ? `<p class="text-[11px] text-indigo-700 font-bold">👷 Cuadrilla: ${via.cuadrilla_asignada}</p>` : ''}
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

        const colorBg = isWater ? '#0284c7' : isPower ? '#d97706' : '#ea580c';
        const iconEmoji = isWater ? '💧' : isPower ? '⚡' : '🔥';

        const customHtml = `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
            <div style="background-color: ${colorBg};" class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-black transition-transform hover:scale-125 animate-pulse">
              ${iconEmoji}
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
        popupContent.className = 'p-1 font-sans text-slate-800 text-xs min-w-[240px]';
        popupContent.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2 border-b pb-1">
              <span class="font-extrabold text-[11px] text-slate-500 uppercase">Corte de ${corte.tipo.toUpperCase()}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style="background-color: ${colorBg};">
                ${corte.estado}
              </span>
            </div>
            <p class="font-black text-sm text-slate-900 leading-tight">${corte.titulo}</p>
            <p class="text-[11px] text-slate-600">📍 ${corte.sector_barrio}</p>
            <p class="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded font-medium">⏰ ${corte.fecha_inicio} (${corte.hora_inicio} a ${corte.hora_estimada_fin})</p>
            <p class="text-[10px] text-slate-500">Empresa: ${corte.empresa_prestadora}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersGroup);

        // Radio de Afectación
        if (layersVisibility.radiosAfectacion && corte.radio_afectacion_m > 0) {
          const circle = L.circle(corte.coordenadas, {
            radius: corte.radio_afectacion_m,
            color: colorBg,
            fillColor: colorBg,
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4, 4'
          });
          circle.bindTooltip(`Radio de Afectación: ${corte.radio_afectacion_m}m (${corte.sector_barrio})`, { sticky: true });
          circle.addTo(circlesGroup);
        }
      });
    }

    // 3. CAPA DE JORNADAS DE ZOONOSIS Y SALUD PÚBLICA
    if (layersVisibility.salud) {
      filteredJornadas.forEach((jornada) => {
        const customHtml = `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
            <div class="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-black transition-transform hover:scale-125">
              🐾
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-300"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-salud-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36]
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
        popupContent.className = 'p-1 font-sans text-slate-800 text-xs min-w-[240px]';
        popupContent.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2 border-b pb-1">
              <span class="font-extrabold text-[11px] text-emerald-700 uppercase">Salud & Esterilización</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ${jornada.cupos_ocupados}/${jornada.cupos_totales} Cupos
              </span>
            </div>
            <p class="font-black text-sm text-slate-900 leading-tight">${jornada.titulo}</p>
            <p class="text-[11px] text-slate-600">📍 ${jornada.lugar} (${jornada.barrio})</p>
            <p class="text-[11px] text-slate-800 font-bold">📅 ${jornada.fecha} | ${jornada.hora_inicio} - ${jornada.hora_fin}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersGroup);
      });
    }

    // 4. CAPA DE RUTAS ALTERNATIVAS Y DESVÍOS VIALES
    if (layersVisibility.rutasDesvios) {
      rutasDesvios.forEach((desvio) => {
        // Red dashed line for closed segment
        const closedPolyline = L.polyline(desvio.tramoCerrado, {
          color: '#ef4444',
          weight: 6,
          opacity: 0.85,
          dashArray: '8, 8'
        });
        closedPolyline.bindPopup(`
          <div class="p-1 text-xs">
            <p class="font-bold text-red-600">⛔ Tramo Cerrado</p>
            <p class="font-semibold text-slate-900">${desvio.nombre}</p>
            <p class="text-slate-600">${desvio.motivo_cierre}</p>
          </div>
        `);
        closedPolyline.addTo(routesGroup);

        // Green/Emerald line for suggested detour
        const detourPolyline = L.polyline(desvio.rutaAlternativa, {
          color: '#10b981',
          weight: 5,
          opacity: 0.9
        });

        detourPolyline.bindPopup(`
          <div class="p-1 text-xs space-y-1">
            <p class="font-bold text-emerald-600">🔄 Ruta Alternativa Recomendada</p>
            <p class="font-semibold text-slate-900">${desvio.nombre}</p>
            <p class="text-slate-700 bg-slate-50 p-1 rounded">${desvio.indicaciones}</p>
            <p class="text-blue-800 font-bold">⏱️ Tiempo estimado: ~${desvio.tiempoEstimadoMin} min</p>
          </div>
        `);
        detourPolyline.addTo(routesGroup);
      });
    }
  }, [
    filteredVias,
    filteredCortes,
    filteredJornadas,
    rutasDesvios,
    layersVisibility,
    onUpdateViaCoords,
    onUpdateCorteCoords,
    onUpdateJornadaCoords
  ]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(PURIFICACION_COORDINATES, 15);
    }
  };

  return (
    <div className="relative w-full h-[550px] sm:h-[620px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Side: Status / Add Mode */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsAddMode(!isAddMode)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-2 transition-all ${
              isAddMode
                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/40 animate-pulse'
                : 'bg-slate-900/90 text-white hover:bg-slate-900'
            }`}
          >
            {isAddMode ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddMode ? 'Haz clic en el mapa para ubicar' : 'Ubicar Nuevo Punto'}</span>
          </button>

          <button
            onClick={handleResetView}
            title="Centrar en Purificación"
            className="p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-white shadow-lg backdrop-blur-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Layers Toggle Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setActiveLayerPanel(!activeLayerPanel)}
            className="px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-lg backdrop-blur-md flex items-center gap-2 border border-slate-200 dark:border-slate-800"
          >
            <Layers className="w-4 h-4 text-[#0D47A1] dark:text-blue-400" />
            <span>Filtros y Capas ({Object.values(layersVisibility).filter(Boolean).length})</span>
          </button>
        </div>
      </div>

      {/* Suggested Detours Mini Floating Card */}
      {layersVisibility.rutasDesvios && rutasDesvios.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 max-w-sm hidden sm:block pointer-events-auto">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                <CornerUpRight className="w-4 h-4 text-emerald-600" />
                <span>Desvíos y Rutas Alternas</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {rutasDesvios.length} activas
              </span>
            </div>
            <div className="space-y-1.5">
              {rutasDesvios.map((d) => (
                <div 
                  key={d.id_desvio}
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView(d.rutaAlternativa[0], 16);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors border border-slate-100 dark:border-slate-700/50"
                >
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{d.nombre}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{d.indicaciones}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Layers Panel Drawer (Top Right) */}
      {activeLayerPanel && (
        <div className="absolute top-16 right-4 z-20 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Capas Operativas
            </span>
            <button 
              onClick={() => setActiveLayerPanel(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Cerrar
            </button>
          </div>

          <div className="space-y-2">
            {/* Layer: Vias */}
            <button
              onClick={() => onToggleLayer('vias')}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all ${
                layersVisibility.vias 
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🚧</span>
                <span>Vías Dañadas ({filteredVias.length})</span>
              </div>
              {layersVisibility.vias ? <Eye className="w-4 h-4 text-amber-600" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Layer: Cortes */}
            <button
              onClick={() => onToggleLayer('cortes')}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all ${
                layersVisibility.cortes 
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>💧</span>
                <span>Cortes Servicios ({filteredCortes.length})</span>
              </div>
              {layersVisibility.cortes ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Layer: Zoonosis */}
            <button
              onClick={() => onToggleLayer('salud')}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all ${
                layersVisibility.salud 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🐾</span>
                <span>Zoonosis & Salud ({filteredJornadas.length})</span>
              </div>
              {layersVisibility.salud ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Layer: Radios */}
            <button
              onClick={() => onToggleLayer('radiosAfectacion')}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all ${
                layersVisibility.radiosAfectacion 
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⭕</span>
                <span>Radios de Afectación</span>
              </div>
              {layersVisibility.radiosAfectacion ? <Eye className="w-4 h-4 text-purple-600" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Layer: Rutas Desvíos */}
            <button
              onClick={() => onToggleLayer('rutasDesvios')}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all ${
                layersVisibility.rutasDesvios 
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🔄</span>
                <span>Desvíos y Rutas Alternas</span>
              </div>
              {layersVisibility.rutasDesvios ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Selected Coordinates Notification Toast */}
      {selectedCoordNotice && (
        <div className="absolute bottom-4 right-4 z-20 px-4 py-2 rounded-2xl bg-slate-900/90 text-white text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{selectedCoordNotice}</span>
        </div>
      )}
    </div>
  );
};
