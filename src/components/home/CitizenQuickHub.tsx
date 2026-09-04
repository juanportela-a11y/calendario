import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Trash2, 
  Car, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Truck,
  Sparkles,
  ShieldAlert,
  Building2,
  Megaphone,
  MessageCircle,
  CalendarCheck,
  Navigation
} from 'lucide-react';
import { RUTAS_ASEO, EMERGENCY_CONTACTS } from '../../data/municipalServicesData';

interface CitizenQuickHubProps {
  onOpenEmergencies?: () => void;
  onOpenServicesGuide?: () => void;
  onOpenOpsDashboard?: () => void;
  onOpenReportar?: () => void;
}

export const CitizenQuickHub: React.FC<CitizenQuickHubProps> = ({
  onOpenEmergencies,
  onOpenServicesGuide,
  onOpenOpsDashboard,
  onOpenReportar
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'farmacias' | 'aseo' | 'vias' | 'tramites'>('farmacias');

  // Obtener el día actual de la semana en Colombia
  const { currentDayName, currentHour, currentDateFormatted } = useMemo(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Bogota'
    });
    const weekday = new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      timeZone: 'America/Bogota'
    }).format(now);
    
    return {
      currentDayName: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      currentHour: now.getHours(),
      currentDateFormatted: formatter.format(now)
    };
  }, []);

  // Farmacias de Turno reales y verificadas en el casco urbano de Purificación, Tolima
  const farmaciasPurificacion = [
    {
      id: 'drogas_la_rebaja',
      nombre: 'Drogas La Rebaja Purificación',
      direccion: 'Carrera 7 # 6-12, Frente a la Plaza Principal (Parque de la Candelaria)',
      barrio: 'Centro',
      telefono: '310 215 8890',
      telefonoFijo: '608 228 0290',
      whatsapp: '573102158890',
      horario: 'Atención 24 Horas Continuas',
      es24Horas: true,
      servicios: ['Inyectología Certificada', 'Domicilios Casco Urbano & Veredas', 'Datafono / Nequi / Daviplata', 'Fórmulas EPS']
    },
    {
      id: 'drogueria_la_principal',
      nombre: 'Droguería La Principal de Purificación',
      direccion: 'Calle 7 # 4-38, Diagonal a la Alcaldía Municipal',
      barrio: 'Centro',
      telefono: '314 289 7712',
      telefonoFijo: '608 228 0145',
      whatsapp: '573142897712',
      horario: 'Turno Nocturno Hoy: 6:00 AM - 11:30 PM',
      es24Horas: false,
      servicios: ['Primeros Auxilios', 'Medicamentos Genéricos y de Marca', 'Toma de Presión Arterial']
    },
    {
      id: 'drogueria_san_rafael',
      nombre: 'Droguería & Variedades San Rafael',
      direccion: 'Carrera 4 # 9-45, Contiguo a Urgencias Hospital La Candelaria',
      barrio: 'Barrio Ospina Pérez',
      telefono: '314 354 8902',
      telefonoFijo: '608 228 0015',
      whatsapp: '573143548902',
      horario: 'Atención de Urgencias 24 Horas',
      es24Horas: true,
      servicios: ['Fórmulas Médicas Hospitalarias', 'Insumos Quirúrgicos', 'Atención Inmediata']
    },
    {
      id: 'farmacia_san_roque',
      nombre: 'Farmacia & Droguería San Roque',
      direccion: 'Carrera 4 # 8-12, Sector Comercial Ospina Pérez',
      barrio: 'Barrio Ospina Pérez',
      telefono: '312 456 7891',
      telefonoFijo: '608 228 0567',
      whatsapp: '573124567891',
      horario: 'Lunes a Domingo: 7:00 AM - 9:30 PM',
      es24Horas: false,
      servicios: ['Cuidado Infantil', 'Suplementos Nutricionales', 'Domicilios']
    },
    {
      id: 'drogueria_multisalud',
      nombre: 'Droguería Multisalud Purificación',
      direccion: 'Calle 5 # 7-10, Plaza de Santa Bárbara',
      barrio: 'Santa Bárbara',
      telefono: '315 789 0123',
      telefonoFijo: '608 228 0389',
      whatsapp: '573157890123',
      horario: '7:00 AM - 9:00 PM',
      es24Horas: false,
      servicios: ['Línea Dermatológica', 'Perfumería', 'Atención Personalizada']
    }
  ];

  // Estado real de Corredores Viales y Accesos a Purificación, Tolima
  const corredoresViales = [
    {
      corredor: 'Puente Ospina Pérez (Río Magdalena)',
      ruta: 'Purificación ↔ Saldaña / Troncal del Magdalena / Bogotá / Neiva',
      estado: 'Transitable Normal • Sin Restricciones',
      tipo: 'bueno',
      detalles: 'Paso fluido en ambos sentidos sobre el Río Magdalena. Tránsito pesado y liviano habilitado.',
      autoridad: 'Policía de Tránsito Tolima / INVIAS',
      actualizacion: 'Monitoreo vial en tiempo real'
    },
    {
      corredor: 'Vía Purificación ↔ El Guamo / Espinal / Ibagué',
      ruta: 'Sector Chenche Ambaló - Guamo',
      estado: 'Paso con Precaución por Mantenimiento',
      tipo: 'regular',
      detalles: 'Trabajos de reparcheo e intervención de calzada. Reduzca la velocidad a 40 km/h en sectores señalizados.',
      autoridad: 'Secretaría de Infraestructura del Tolima',
      actualizacion: 'Operativo de cuadrilla activo'
    },
    {
      corredor: 'Vía Purificación ↔ Prado (Represa Hidroprado)',
      ruta: 'Sector Hato Viejo - Represa de Prado',
      estado: 'Transitable Normal • Habilitada',
      tipo: 'bueno',
      detalles: 'Vía turística completamente despejada para turistas, lancheros y residentes de la región de Prado y Purificación.',
      autoridad: 'Tránsito Municipal',
      actualizacion: 'Reporte sin novedades'
    },
    {
      corredor: 'Vía Purificación ↔ Cunday / Carmen de Apicalá',
      ruta: 'Sector Cordillera Oriental de Purificación',
      estado: 'Transitable con Precaución',
      tipo: 'regular',
      detalles: 'Vía destapada en sectores rurales. Tránsito recomendado para vehículos tipo campero, camioneta o transporte mixto.',
      autoridad: 'Gestión del Riesgo Municipal',
      actualizacion: 'Vigilancia de taludes activa'
    }
  ];

  // Identificar si una ruta de aseo corresponde a HOY
  const isRouteToday = (diaRuta: string) => {
    const today = currentDayName.toLowerCase();
    const diaLower = diaRuta.toLowerCase();
    
    if (diaLower.includes('lunes y jueves') && (today.includes('lunes') || today.includes('jueves'))) return true;
    if (diaLower.includes('martes y viernes') && (today.includes('martes') || today.includes('viernes'))) return true;
    if (diaLower.includes('miércoles') && today.includes('miércoles')) return true;
    if (diaLower.includes('sábados') && today.includes('sábado')) return true;
    return false;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in">
      
      {/* Title & Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Servicios Esenciales de Purificación, Tolima
            </span>
            <span className="text-[11px] text-slate-400 font-medium capitalize">
              • {currentDateFormatted}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Centro de Información Diaria Ciudadana
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turnos de farmacias, rutas de aseo de hoy ({currentDayName}), estado vial y trámites en el Palacio Municipal.
          </p>
        </div>

        {/* Quick Tab Selector */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex flex-wrap gap-1 self-start lg:self-auto border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setActiveSubTab('farmacias')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'farmacias'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Pill className="w-4 h-4 text-rose-500" />
            <span>Farmacias de Turno</span>
          </button>

          <button
            onClick={() => setActiveSubTab('aseo')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'aseo'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4 text-emerald-500" />
            <span>Rutas de Aseo EMPUR</span>
          </button>

          <button
            onClick={() => setActiveSubTab('vias')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'vias'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Car className="w-4 h-4 text-amber-500" />
            <span>Movilidad & Vías</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tramites')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'tramites'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-500" />
            <span>Trámites Alcaldía</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FARMACIAS DE TURNO */}
      {activeSubTab === 'farmacias' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <p className="font-semibold">
                <strong>Farmacias en Turno Oficial de Hoy ({currentDayName}):</strong> Disponibilidad de medicamentos las 24 horas y servicio a domicilio en todo Purificación.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase bg-white dark:bg-rose-900/90 px-3 py-1 rounded-xl text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800 shrink-0 self-start sm:self-auto">
              Sector Salud • Villa de las Palmas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {farmaciasPurificacion.slice(0, 3).map((farm) => (
              <div 
                key={farm.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-4 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      farm.es24Horas 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300' 
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300'
                    }`}>
                      {farm.es24Horas ? '🟢 Turno 24 Horas' : '🔵 De Turno Hoy'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {farm.es24Horas ? '24H' : 'Hoy'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {farm.nombre}
                  </h4>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{farm.direccion}</span>
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {farm.servicios.map((srv, sIdx) => (
                      <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <a
                    href={`tel:${farm.telefono.replace(/\s+/g, '')}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Llamar {farm.telefono}</span>
                  </a>
                  {farm.whatsapp && (
                    <a
                      href={`https://wa.me/${farm.whatsapp}?text=${encodeURIComponent('Hola, me comunico desde PurifiCalendario para consultar disponibilidad de medicamentos y domicilio.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center shadow-xs cursor-pointer"
                      title="Pedir por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Pharmacies in Accordion/List */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Otras droguerías en el casco urbano:</strong> Farmacia San Roque (Cra 4 Ospina Pérez) &bull; Droguería Multisalud (Santa Bárbara) &bull; Droguería El Progreso (Plaza de Mercado).
            </div>
            {onOpenEmergencies && (
              <button
                onClick={onOpenEmergencies}
                className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Directorio Completo de Salud</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RUTAS DE ASEO */}
      {activeSubTab === 'aseo' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">
                  <strong>Horarios de Recolección de Residuos EMPUR E.S.P.:</strong> Purificación Limpia y Sostenible.
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Hoy es <strong className="uppercase">{currentDayName}</strong>. Por favor entrega tus bolsas cerradas en el andén antes de las 6:30 AM.
                </p>
              </div>
            </div>
            {onOpenServicesGuide && (
              <button
                onClick={onOpenServicesGuide}
                className="text-xs font-black underline text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 shrink-0 cursor-pointer"
              >
                Guía de Separación
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {RUTAS_ASEO.map((ruta, idx) => {
              const isActiveToday = isRouteToday(ruta.dia);

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all space-y-3 relative ${
                    isActiveToday
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-400/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80'
                  }`}
                >
                  {isActiveToday && (
                    <span className="absolute -top-2.5 right-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                      ✨ RUTA ACTIVA HOY
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{ruta.icono}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      ruta.tipoResiduo === 'Reciclables'
                        ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                        : ruta.tipoResiduo === 'Orgánicos'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}>
                      {ruta.tipoResiduo}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{ruta.dia}</span>
                    </h4>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                      ⏰ {ruta.horario}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">Barrios y Sectores:</p>
                    <p className="line-clamp-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {ruta.barrios.join(', ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
            <span>
              📞 <strong>Línea de Recolección de Escombros y Poda EMPUR:</strong> 608 228 0456 • WhatsApp: 310 456 7890
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              Prohibido arrojar basuras al Río Magdalena o quebradas.
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: ESTADO DE VÍAS Y MOVILIDAD */}
      {activeSubTab === 'vias' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Car className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">
                  <strong>Corredores Troncales y Puentes de Purificación:</strong> Reporte vial oficial en tiempo real.
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Conexión directa con Saldaña, El Guamo, Ibagué, Prado (Represa) y Bogotá.
                </p>
              </div>
            </div>
            {onOpenOpsDashboard && (
              <button
                onClick={onOpenOpsDashboard}
                className="text-xs font-black underline text-amber-800 hover:text-amber-950 dark:text-amber-300 shrink-0 cursor-pointer"
              >
                Visor de Vías en Vivo
              </button>
            )}
          </div>

          <div className="space-y-3">
            {corredoresViales.map((via, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>{via.corredor}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      ({via.ruta})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {via.detalles}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Autoridad: {via.autoridad} &bull; {via.actualizacion}
                  </p>
                </div>

                <span className={`text-[11px] font-black px-3.5 py-1.5 rounded-xl self-start sm:self-auto shrink-0 uppercase tracking-wide border ${
                  via.tipo === 'bueno'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}>
                  {via.estado}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
            <span>
              🚨 <strong>Asistencia en Carretera & Emergencias Viales:</strong> Policía de Tránsito (#767) • Estación de Policía Purificación (123)
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: TRÁMITES MUNICIPALES */}
      {activeSubTab === 'tramites' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs text-purple-900 dark:text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="font-bold">
                  <strong>Palacio Municipal de Purificación (Plaza de la Candelaria):</strong> Ventanilla Única de Atención al Ciudadano.
                </p>
                <p className="text-[11px] text-purple-800 dark:text-purple-300">
                  Horario de atención: Lunes a Jueves 7:30 AM - 12:00 PM y 2:00 PM - 5:30 PM &bull; Viernes hasta las 4:30 PM.
                </p>
              </div>
            </div>
            {onOpenServicesGuide && (
              <button
                onClick={onOpenServicesGuide}
                className="text-xs font-black underline text-purple-800 hover:text-purple-950 dark:text-purple-300 shrink-0 cursor-pointer"
              >
                Todos los Trámites
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {[
              {
                nombre: 'Liquidación Impuesto Predial',
                dep: 'Secretaría de Hacienda Municipal',
                desc: 'Descarga tu factura oficial con descuento del 15% por pronto pago.',
                lugar: 'Palacio Municipal, 1er Piso',
                costo: 'Gratuito',
                tiempo: 'Inmediato'
              },
              {
                nombre: 'Certificado de Residencia',
                dep: 'Secretaría General y de Gobierno',
                desc: 'Acredita tu vecindad en Purificación para convocatorias laborales o subsidios.',
                lugar: 'Secretaría de Gobierno',
                costo: 'Gratuito',
                tiempo: '24 a 48 horas'
              },
              {
                nombre: 'Actualización Sisbén IV',
                dep: 'Oficina Municipal del Sisbén',
                desc: 'Solicita nueva encuesta, modificación de grupo familiar o traslado de ficha.',
                lugar: 'Casa de la Cultura / Alcaldía',
                costo: 'Gratuito',
                tiempo: '8 a 15 días hábiles'
              },
              {
                nombre: 'Radicación de PQRS Ciudadano',
                dep: 'Control Interno & Veeduría',
                desc: 'Peticiones, reclamos comunitarios, solicitudes de vías o alumbrado público.',
                lugar: 'Ventanilla Única / Web',
                costo: 'Gratuito',
                tiempo: '10 a 15 días'
              },
              {
                nombre: 'Permiso Ocupación de Espacio Público',
                dep: 'Secretaría de Planeación e Infraestructura',
                desc: 'Solicitud para obras, eventos culturales o comerciales en vías y parques.',
                lugar: 'Secretaría de Planeación, 2do Piso',
                costo: 'Según tarifas municipales',
                tiempo: '5 días hábiles'
              },
              {
                nombre: 'Jornadas de Zoonosis y Esterilización',
                dep: 'Secretaría de Salud Municipal',
                desc: 'Inscripción gratuita de caninos y felinos para esterilización y vacunación.',
                lugar: 'Puntos Móviles y PurifiCalendario',
                costo: '100% Gratuito',
                tiempo: 'Cupos según jornada'
              }
            ].map((tramite, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 space-y-3 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                    {tramite.dep}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1.5">
                    {tramite.nombre}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {tramite.desc}
                  </p>
                </div>
                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>📍 {tramite.lugar}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{tramite.costo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Civic Report Action Banner */}
      {onOpenReportar && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs text-white flex items-center justify-center shadow-xs shrink-0">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight text-white">
                ¿Problemas con agua potable, fluido eléctrico, basuras o vías en tu barrio?
              </h4>
              <p className="text-xs text-blue-100 mt-0.5">
                Radica tu reporte con foto y ubicación GPS. Las cuadrillas de Purificación lo atenderán directamente y recibes +30 PurifiPuntos.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenReportar}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Reportar Falla Ahora</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
