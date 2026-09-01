import React, { useState } from 'react';
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
  Building2
} from 'lucide-react';
import { RUTAS_ASEO, EMERGENCY_CONTACTS } from '../../data/municipalServicesData';

interface CitizenQuickHubProps {
  onOpenEmergencies?: () => void;
  onOpenServicesGuide?: () => void;
  onOpenOpsDashboard?: () => void;
}

export const CitizenQuickHub: React.FC<CitizenQuickHubProps> = ({
  onOpenEmergencies,
  onOpenServicesGuide,
  onOpenOpsDashboard
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'farmacias' | 'aseo' | 'vias' | 'tramites'>('farmacias');

  // Farmacias de Turno en Purificación
  const farmaciasTurno = [
    {
      nombre: 'Drogas La Rebaja Purificación',
      direccion: 'Carrera 7 # 6-12, Plaza Principal',
      telefono: '310 215 8890',
      horario: 'Atención 24 Horas de Turno',
      abierto: true,
      servicios: ['Inyectología', 'Domicilios', 'Pago con Tarjeta']
    },
    {
      nombre: 'Droguería San Rafael',
      direccion: 'Calle 7 # 4-35, Frente al Hospital',
      telefono: '314 354 8902',
      horario: '6:00 AM - 10:00 PM (Turno Noche)',
      abierto: true,
      servicios: ['Fórmulas Médicas', 'Primeros Auxilios']
    },
    {
      nombre: 'Farmacia del Parque Tolima',
      direccion: 'Carrera 6 # 5-40, Parque Central',
      telefono: '608 228 0145',
      horario: '7:00 AM - 9:00 PM',
      abierto: true,
      servicios: ['Cuidado Personal', 'Pediatría']
    }
  ];

  // Estado de los Corredores Viales de Purificación
  const corredoresViales = [
    {
      corredor: 'Puente Ospina Pérez (Río Magdalena)',
      ruta: 'Purificación ↔ Saldaña / Bogotá / Neiva',
      estado: 'Transitable Normal',
      tipo: 'bueno',
      detalles: 'Paso fluido en ambos sentidos sin restricciones.'
    },
    {
      corredor: 'Vía Purificación ↔ El Guamo / Ibagué',
      ruta: 'Sector Chenche Ambaló - Guamo',
      estado: 'Precaución por Mantenimiento',
      tipo: 'regular',
      detalles: 'Trabajos de reparcheo e instalación de señalización vial.'
    },
    {
      corredor: 'Vía Purificación ↔ Prado (Represa)',
      ruta: 'Sector Hato Viejo - Represa Hidroprado',
      estado: 'Transitable Normal',
      tipo: 'bueno',
      detalles: 'Vía despejada, tránsito turístico habilitado.'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in">
      
      {/* Title & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Servicios Esenciales de Purificación
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Centro de Información Diaria Ciudadana
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turnos de farmacias, rutas de aseo de hoy, movilidad vial y acceso rápido a trámites.
          </p>
        </div>

        {/* Quick Tab Selector */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex flex-wrap gap-1">
          <button
            onClick={() => setActiveSubTab('farmacias')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'farmacias'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-rose-500" />
            <span>Farmacias de Turno</span>
          </button>

          <button
            onClick={() => setActiveSubTab('aseo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'aseo'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Rutas de Aseo</span>
          </button>

          <button
            onClick={() => setActiveSubTab('vias')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'vias'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-amber-500" />
            <span>Movilidad & Vías</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tramites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'tramites'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Trámites Alcaldía</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FARMACIAS DE TURNO */}
      {activeSubTab === 'farmacias' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <p className="font-semibold">
                <strong>Farmacias de Turno Nocturno y 24 Horas:</strong> Disponibilidad para hoy en el casco urbano de Purificación.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase bg-white dark:bg-rose-900 px-2 py-0.5 rounded text-rose-700 dark:text-rose-200">
              Sector Salud
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {farmaciasTurno.map((farm, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                      Abierto Ahora
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      24H
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {farm.nombre}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span>{farm.direccion}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${farm.telefono.replace(/\s+/g, '')}`}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{farm.telefono}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RUTAS DE ASEO */}
      {activeSubTab === 'aseo' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="font-semibold">
                <strong>Horarios de Recolección de Residuos EMPUR E.S.P.:</strong> Saca la basura únicamente en el horario programado.
              </p>
            </div>
            {onOpenServicesGuide && (
              <button
                onClick={onOpenServicesGuide}
                className="text-[11px] font-black underline text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
              >
                Guía Completa
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {RUTAS_ASEO.map((ruta, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{ruta.icono}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {ruta.tipoResiduo}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    {ruta.dia}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {ruta.horario}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-slate-700 dark:text-slate-200">Sectores:</p>
                  <p className="line-clamp-2">{ruta.barrios.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ESTADO DE VÍAS Y MOVILIDAD */}
      {activeSubTab === 'vias' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="font-semibold">
                <strong>Corredores de Acceso a Purificación:</strong> Reporte vial en tiempo real de la red troncal y puentes.
              </p>
            </div>
            {onOpenOpsDashboard && (
              <button
                onClick={onOpenOpsDashboard}
                className="text-[11px] font-black underline text-amber-800 hover:text-amber-950 dark:text-amber-300"
              >
                Mapa de Baches
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {corredoresViales.map((via, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {via.corredor}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      ({via.ruta})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {via.detalles}
                  </p>
                </div>

                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl self-start sm:self-auto ${
                  via.tipo === 'bueno'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                }`}>
                  {via.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TRÁMITES MUNICIPALES */}
      {activeSubTab === 'tramites' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs text-purple-800 dark:text-purple-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <p className="font-semibold">
                <strong>Ventanilla Única de Atención en Purificación:</strong> Consulta requisitos para realizar trámites oficiales.
              </p>
            </div>
            {onOpenServicesGuide && (
              <button
                onClick={onOpenServicesGuide}
                className="text-[11px] font-black underline text-purple-800 hover:text-purple-950 dark:text-purple-300"
              >
                Ver todos
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                nombre: 'Impuesto Predial Unificado',
                dep: 'Secretaría de Hacienda',
                desc: 'Descarga tu factura y accede a descuentos por pronto pago.',
                lugar: 'Palacio Municipal, 1er Piso'
              },
              {
                nombre: 'Certificado de Residencia',
                dep: 'Secretaría de Gobierno',
                desc: 'Acredita tu residencia en el municipio de Purificación.',
                lugar: 'Secretaría General'
              },
              {
                nombre: 'Actualización Sisbén IV',
                dep: 'Oficina Sisbén Purificación',
                desc: 'Solicita nueva encuesta o traslado de ficha socioeconómica.',
                lugar: 'Casa de la Cultura'
              }
            ].map((tramite, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                    {tramite.dep}
                  </span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1">
                    {tramite.nombre}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {tramite.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400">
                  📍 {tramite.lugar}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
