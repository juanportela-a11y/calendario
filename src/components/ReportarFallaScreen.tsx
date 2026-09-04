import React, { useState } from 'react';
import { 
  Droplet, 
  Zap, 
  Trash2, 
  Milestone, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Camera, 
  X, 
  Send, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Building2, 
  Check, 
  ChevronRight, 
  Filter,
  Calendar,
  Layers as LayersIcon,
  Megaphone,
  Power,
  Vote,
  PhoneCall,
  Users,
  Wrench,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useOpsStore } from '../stores/useOpsStore';
import { TipoFalla, Usuario, ReporteFallaCiudadana } from '../types';
import { BARRIOS_PURIFICACION, PURIFICACION_COORDINATES } from '../data/municipalOpsData';
import { HomeCitizenPollWidget } from './home/HomeCitizenPollWidget';

interface ReportarFallaScreenProps {
  currentUser: Usuario | null;
  onNavigateToTab?: (tab: string) => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  onOpenServicesGuide?: () => void;
  onOpenAssistant?: () => void;
  onOpenEmergencies?: () => void;
}

export const ReportarFallaScreen: React.FC<ReportarFallaScreenProps> = ({
  currentUser,
  onNavigateToTab,
  onLogout,
  onOpenAuth,
  onOpenServicesGuide,
  onOpenAssistant,
  onOpenEmergencies
}) => {
  const { fallas, addReporteFalla, showToast } = useOpsStore();

  // Screen Submenu Tab State
  const [activeScreenTab, setActiveScreenTab] = useState<'formulario' | 'mis-reportes' | 'consultas' | 'cuadrillas'>('formulario');

  // Form State
  const [selectedTipo, setSelectedTipo] = useState<TipoFalla>('aseo');
  const [descripcion, setDescripcion] = useState('');
  const [barrio, setBarrio] = useState(currentUser?.barrio || 'El Centro');
  const [direccionExacta, setDireccionExacta] = useState('');
  const [coordenadas, setCoordenadas] = useState<[number, number] | null>(PURIFICACION_COORDINATES);
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccessId, setSubmittedSuccessId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('todos');

  // Categories config matching the screenshot icons & labels
  const categories: { id: TipoFalla; label: string; icon: React.FC<{ className?: string }>; color: string; desc: string }[] = [
    {
      id: 'agua',
      label: 'AGUA',
      icon: ({ className }) => <Droplet className={className || 'w-6 h-6'} />,
      color: 'text-sky-500',
      desc: 'Fugas, baja presión, desabastecimiento, alcantarillado'
    },
    {
      id: 'luz',
      label: 'LUZ',
      icon: ({ className }) => <Zap className={className || 'w-6 h-6'} />,
      color: 'text-amber-500',
      desc: 'Alumbrado público, cables caídos, cortes de energía'
    },
    {
      id: 'aseo',
      label: 'ASEO',
      icon: ({ className }) => <Trash2 className={className || 'w-6 h-6'} />,
      color: 'text-emerald-500',
      desc: 'Recolección de basuras, escombros, barrido'
    },
    {
      id: 'vias',
      label: 'VÍAS',
      icon: ({ className }) => <Milestone className={className || 'w-6 h-6'} />,
      color: 'text-indigo-500',
      desc: 'Huecos en la calzada, pavimento, señalización, derrumbes'
    }
  ];

  // Contactos directos de Cuadrillas y Operaciones
  const cuadrillasContactos = [
    {
      entidad: 'EMPOPUR E.S.P. - Acueducto & Alcantarillado',
      servicio: 'Agua Potable y Fugas en Vía Pública',
      telefono: '310 856 2390',
      disponibilidad: 'Lunes a Domingo 24 Horas',
      icon: Droplet,
      color: 'text-sky-500',
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/40'
    },
    {
      entidad: 'CELSIA Tolima - Cuadrilla Eléctrica',
      servicio: 'Línea de Emergencias Eléctricas y Transformadores',
      telefono: '01 8000 112 115',
      disponibilidad: 'Línea Gratuita Nacional 24/7',
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40'
    },
    {
      entidad: 'División de Aseo Urbano EMPOPUR',
      servicio: 'Recolección de Basuras y Puntos Críticos',
      telefono: '314 456 7812',
      disponibilidad: 'Lunes a Sábado 6:00 AM - 6:00 PM',
      icon: Trash2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40'
    },
    {
      entidad: 'Secretaría de Infraestructura y Malla Vial',
      servicio: 'Reparcheo de Calzadas y Pavimentación',
      telefono: '608 228 0122',
      disponibilidad: 'Lunes a Viernes 8:00 AM - 5:00 PM',
      icon: Milestone,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40'
    }
  ];

  // Geolocation Handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('⚠️ Tu navegador no soporta geolocalización. Selecciona el barrio manualmente.');
      setShowLocationPicker(true);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCoordenadas(coords);
        setLocationLabel(`GPS: ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
        setIsLocating(false);
        showToast('📍 ¡Ubicación geográfica detectada con éxito!');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setCoordenadas(PURIFICACION_COORDINATES);
        setLocationLabel(`Purificación Centro (${PURIFICACION_COORDINATES[0]}, ${PURIFICACION_COORDINATES[1]})`);
        setIsLocating(false);
        setShowLocationPicker(true);
        showToast('📍 Ubicación fijada en Purificación, Tolima. Puedes ajustar el barrio.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Image upload handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descripcion.trim()) {
      showToast('⚠️ Por favor describe brevemente el problema.');
      return;
    }

    setSubmitting(true);
    try {
      const ubicacionCompleta = direccionExacta.trim() 
        ? `${barrio}, ${direccionExacta.trim()}` 
        : `${barrio}${locationLabel ? ` (${locationLabel})` : ''}`;

      const created = await addReporteFalla({
        tipo: selectedTipo,
        descripcion: descripcion.trim(),
        ubicacion: ubicacionCompleta,
        barrio: barrio,
        coordenadas: coordenadas || PURIFICACION_COORDINATES,
        foto_url: fotoPreview || undefined,
        id_usuario: currentUser?.id_usuario,
        nombre_ciudadano: currentUser?.nombre_usuario || 'Ciudadano Anónimo',
        correo_ciudadano: currentUser?.correo,
        telefono_ciudadano: currentUser?.telefono
      });

      setSubmittedSuccessId(created.id_falla);
      setDescripcion('');
      setDireccionExacta('');
      setFotoPreview(null);
      setSubmitting(false);
      setActiveScreenTab('mis-reportes');

      // Scroll smoothly to reports list
      setTimeout(() => {
        const el = document.getElementById('mis-reportes-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      console.error('Error submitting report:', err);
      showToast('⚠️ Ocurrió un error al registrar el reporte.');
      setSubmitting(false);
    }
  };

  // Quick suggestions based on selected category
  const quickSuggestions: Record<TipoFalla, string[]> = {
    agua: ['Fuga de agua en vía pública', 'Sin suministro de agua potable', 'Baja presión constante', 'Tapa de alcantarillado rota'],
    luz: ['Luminaria de alumbrado apagada', 'Corte repentino de energía', 'Cables de poste sueltos', 'Chispas en transformador'],
    aseo: ['Punto crítico de basuras acumuladas', 'Ruta de aseo no pasó hoy', 'Escombros arrojados en parque', 'Falta caneca pública'],
    vias: ['Hueco profundo en calzada', 'Hundimiento peligroso', 'Vía sin pavimentar erosionada', 'Señal de Pare caída']
  };

  // Status Badge Helper
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'resuelto':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Resuelto</span>
          </span>
        );
      case 'cuadrilla_asignada':
      case 'en_reparacion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
            <span>En Proceso</span>
          </span>
        );
      case 'en_revision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>En Revisión</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Pendiente</span>
          </span>
        );
    }
  };

  // Filtered reports
  const filteredReports = fallas.filter((r) => {
    if (filterType === 'todos') return true;
    return r.tipo === filterType;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* MENÚ SUPERIOR DE SECCIONES (TABS DE CIUDADANÍA Y REPORTES) */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveScreenTab('formulario')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeScreenTab === 'formulario'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Radicar Reporte</span>
        </button>

        <button
          onClick={() => setActiveScreenTab('mis-reportes')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeScreenTab === 'mis-reportes'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Mis Reportes ({fallas.length})</span>
        </button>

        <button
          onClick={() => setActiveScreenTab('consultas')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeScreenTab === 'consultas'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Consultas & Votación</span>
        </button>

        <button
          onClick={() => setActiveScreenTab('cuadrillas')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeScreenTab === 'cuadrillas'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Líneas de Cuadrillas</span>
        </button>
      </div>

      {/* Accesos Rápidos Complementarios */}
      {(onOpenServicesGuide || onOpenAssistant || onOpenEmergencies) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          {onOpenServicesGuide && (
            <button
              onClick={onOpenServicesGuide}
              className="flex-1 min-w-[180px] p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-2xs"
            >
              <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">Rutas de Aseo & Trámites EMPOPUR</span>
            </button>
          )}

          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="flex-1 min-w-[180px] p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-blue-700 dark:text-blue-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-2xs"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">Consultar con PurifiGuía IA</span>
            </button>
          )}

          {onOpenEmergencies && (
            <button
              onClick={onOpenEmergencies}
              className="flex-1 min-w-[180px] p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100/80 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-2xs"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">Líneas de Emergencia 24/7</span>
            </button>
          )}
        </div>
      )}

      {/* TAB 1: FORMULARIO PRINCIPAL DE REPORTE (Estilo fiel a la imagen solicitada) */}
      {activeScreenTab === 'formulario' && (
        <div className="bg-white dark:bg-slate-900 rounded-[36px] shadow-sm border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 md:p-12 transition-all animate-fade-in">
          
          {/* TÍTULO PRINCIPAL: REPORTAR FALLA */}
          <div className="text-center space-y-1 mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#0A2540] dark:text-white uppercase font-sans">
              REPORTAR FALLA
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Notifica incidencias de servicios públicos e infraestructura en Purificación para atención inmediata.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            
            {/* 4 BOTONES DE CATEGORÍAS (AGUA, LUZ, ASEO, VÍAS) */}
            <div className="flex items-center justify-center gap-3 sm:gap-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedTipo === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedTipo(cat.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-full transition-all cursor-pointer select-none group min-w-[72px] sm:min-w-[84px] ${
                      isSelected
                        ? 'border-2 border-[#2563EB] bg-blue-50/80 dark:bg-blue-950/50 shadow-sm scale-105'
                        : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                    title={cat.desc}
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-white dark:bg-slate-900 shadow-2xs' : 'bg-white/80 dark:bg-slate-700/60'
                    }`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110 ${
                        isSelected ? 'text-[#2563EB]' : cat.color
                      }`} />
                    </div>
                    <span className={`text-[11px] sm:text-xs font-black tracking-wider uppercase ${
                      isSelected ? 'text-[#2563EB] dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SECCIÓN DE UBICACIÓN LIBRE Y ORGANIZADA */}
            <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750 p-4 sm:p-5 space-y-3.5 transition-all">
              {/* Header de Ubicación con botón GPS */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block leading-tight">
                      Ubicación de la Incidencia
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Indica el sector en Purificación (texto 100% libre o selecciona sugerencia)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="Detectar coordenadas exactas por satélite / GPS"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Detectando GPS...' : (locationLabel ? locationLabel : 'Detectar mi GPS')}</span>
                </button>
              </div>

              {/* Campos de Entrada: Barrio/Vereda (Libre) y Dirección Exacta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Barrio, Vereda o Sector:
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md">
                      Libre
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="barrios-purificacion-datalist"
                      value={barrio}
                      onChange={(e) => setBarrio(e.target.value)}
                      placeholder="Escribe tu barrio, vereda o sector..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-2xs placeholder:text-slate-400"
                    />
                    <datalist id="barrios-purificacion-datalist">
                      {BARRIOS_PURIFICACION.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Dirección o Punto de Referencia:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Cra 7 # 4-20, frente al parque o poste #12"
                    value={direccionExacta}
                    onChange={(e) => setDireccionExacta(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Sugerencias Rápidas de 1 Clic para agilidad sin restringir la libertad */}
              <div className="pt-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                    Sugerencias:
                  </span>
                  {['El Centro', 'Ospina Pérez', 'Santa Librada', 'Santander', 'Camilo Torres', 'Vereda Chenche Asoleado', 'Vereda Hato Viejo'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setBarrio(sug)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                        barrio === sug
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ÁREA DE TEXTO: "Describe el problema..." */}
            <div className="space-y-2">
              <div className="relative rounded-3xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-4 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-850">
                <textarea
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el problema..."
                  className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none font-medium leading-relaxed"
                  maxLength={500}
                />
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-700/40 text-[11px] text-slate-400">
                  <label className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{fotoPreview ? 'Foto adjuntada' : 'Adjuntar foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <span>{descripcion.length}/500</span>
                </div>
              </div>

              {/* Foto preview si se adjuntó */}
              {fotoPreview && (
                <div className="relative inline-block mt-2">
                  <img 
                    src={fotoPreview} 
                    alt="Evidencia del reporte" 
                    className="w-24 h-24 object-cover rounded-2xl border-2 border-blue-400 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setFotoPreview(null)}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-md hover:bg-rose-600"
                    title="Quitar foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Sugerencias Rápidas */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickSuggestions[selectedTipo].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDescripcion((prev) => prev ? `${prev}. ${sug}` : sug)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* BOTÓN PRINCIPAL: ENVIAR REPORTE */}
            <button
              type="submit"
              disabled={submitting || !descripcion.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-sm tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>ENVIANDO REPORTE...</span>
                </>
              ) : (
                <>
                  <span>ENVIAR REPORTE</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Badge de Recompensa Cívica */}
            <div className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ganas <strong>+30 PurifiPuntos</strong> cívicos por cada reporte radicado</span>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MIS REPORTES & SEGUIMIENTO CIUDADANO */}
      {activeScreenTab === 'mis-reportes' && (
        <div id="mis-reportes-section" className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Mis Reportes & Seguimiento Ciudadano</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atención en tiempo real por la Alcaldía Municipal, EMPOPUR y cuadrillas operativas.
              </p>
            </div>

            {/* Filtros por Categoría */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['todos', 'agua', 'luz', 'aseo', 'vias'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                    filterType === f
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Reportes */}
          {filteredReports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Aún no hay reportes en esta categoría
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Utiliza el formulario de reporte para notificar cualquier falla en tu barrio o sector.
              </p>
              <button
                onClick={() => setActiveScreenTab('formulario')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
              >
                Crear Nuevo Reporte
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((reporte) => {
                const catConfig = categories.find(c => c.id === reporte.tipo) || categories[0];
                const CatIcon = catConfig.icon;

                return (
                  <div
                    key={reporte.id_falla}
                    className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all space-y-3 ${
                      submittedSuccessId === reporte.id_falla 
                        ? 'border-2 border-emerald-500 shadow-md ring-2 ring-emerald-100 dark:ring-emerald-950/50' 
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <CatIcon className={`w-5 h-5 ${catConfig.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                              {catConfig.label}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              #REP-{reporte.id_falla.toString().slice(-4)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[180px]">{reporte.ubicacion}</span>
                          </p>
                        </div>
                      </div>

                      {getStatusBadge(reporte.estado)}
                    </div>

                    {/* Descripción */}
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {reporte.descripcion}
                    </p>

                    {/* Respuesta oficial si existe */}
                    {reporte.respuesta_oficial && (
                      <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{reporte.empresa_responsable || 'Alcaldía Municipal'}</span>
                        </div>
                        <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
                          "{reporte.respuesta_oficial}"
                        </p>
                      </div>
                    )}

                    {/* Footer del card */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <span>{reporte.fecha_reporte}</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        +{reporte.puntos_ganados || 30} PTS Cívicos
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONSULTAS CIUDADANAS & PRESUPUESTO PARTICIPATIVO */}
      {activeScreenTab === 'consultas' && (
        <div className="space-y-4 animate-fade-in">
          <HomeCitizenPollWidget
            currentUser={currentUser}
            onVoteSuccess={(points) => {
              showToast(`✓ ¡Has ganado +${points} PurifiPuntos por tu voto ciudadano!`);
            }}
          />

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Transparencia & Presupuesto Comunitario</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Las consultas ciudadanas de Purificación permiten a los habitantes definir prioridades en obras de infraestructura, vías terciarias, redes de agua y parques recreativos. Cada voto genera puntos acumulables para beneficios en trámites cívicos.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: LÍNEAS DE ATENCIÓN DE CUADRILLAS */}
      {activeScreenTab === 'cuadrillas' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-1">
              <PhoneCall className="w-4 h-4 text-blue-600" />
              <span>Directorio Telefónico de Cuadrillas & Mantenimiento</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comunícate directamente con las empresas prestadoras de servicios en Purificación, Tolima.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cuadrillasContactos.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl border transition-all space-y-3 ${c.bg}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                        <Icon className={`w-5 h-5 ${c.color}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">{c.entidad}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.servicio}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      🕒 {c.disponibilidad}
                    </span>
                    <a
                      href={`tel:${c.telefono.replace(/\s+/g, '')}`}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{c.telefono}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOTER BARRA DE NAVEGACIÓN INFERIOR (Estilo idéntico a la barra inferior de la imagen) */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
        <div className="flex items-center justify-around">
          
          {/* Botón 1: INICIO */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('inicio')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider">INICIO</span>
          </button>

          {/* Botón 2: EVENTOS */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('calendario')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <LayersIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider">EVENTOS</span>
          </button>

          {/* Botón 3: REPORTAR (Activo en esta sección) */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('reportar')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-[#2563EB] dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-950/60 transition-colors cursor-pointer"
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-wider">REPORTAR</span>
          </button>

          {/* Botón 4: SALIR / ACCEDER */}
          {currentUser ? (
            <button
              onClick={() => onLogout && onLogout()}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer group"
              title="Cerrar Sesión"
            >
              <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-wider">SALIR</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth && onOpenAuth()}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
              title="Iniciar Sesión"
            >
              <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-wider">ACCEDER</span>
            </button>
          )}

        </div>
      </div>

    </div>
  );
};

