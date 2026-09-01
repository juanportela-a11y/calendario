import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Recycle, 
  FileText, 
  Bus, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Search, 
  CheckCircle2, 
  ExternalLink,
  HelpCircle,
  Sparkles,
  Send,
  Building2,
  Calendar
} from 'lucide-react';
import { RUTAS_ASEO, TRAMITES_MUNICIPALES, FAQS_PURIFICACION, TramiteMunicipal } from '../../data/municipalServicesData';

interface WasteAndServicesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportModal?: () => void;
}

export const WasteAndServicesGuideModal: React.FC<WasteAndServicesGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenReportModal
}) => {
  const [activeTab, setActiveTab] = useState<'aseo' | 'mercado_transporte' | 'tramites' | 'faqs'>('aseo');
  const [selectedBarrioSearch, setSelectedBarrioSearch] = useState('');
  const [selectedTramite, setSelectedTramite] = useState<TramiteMunicipal | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-700 to-[#0D47A1] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <Building2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Guía de Servicios Domiciliarios & Trámites</h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-400/30 border border-emerald-300/40">
                  Purificación
                </span>
              </div>
              <p className="text-xs text-emerald-100">Rutas de aseo EMPUR, Plaza de Mercado, Transporte y Trámites de la Alcaldía</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'aseo', label: '🗑️ Rutas de Aseo EMPUR', icon: Trash2 },
            { id: 'mercado_transporte', label: '🛒 Plaza de Mercado & Rutas', icon: ShoppingBag },
            { id: 'tramites', label: '📋 Trámites & Sisbén', icon: FileText },
            { id: 'faqs', label: '💡 Preguntas Frecuentes', icon: HelpCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#0D47A1] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: RUTAS DE ASEO */}
          {activeTab === 'aseo' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                    Cronograma Oficial de Recolección de Residuos
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Operado por Empresas Públicas de Purificación (EMPUR E.S.P.)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold px-2 py-1 bg-blue-600 text-white rounded-lg">
                    Línea Aseo: 608-228-0456
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {RUTAS_ASEO.map((ruta, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{ruta.icono}</span>
                        <div>
                          <h5 className="text-sm font-black text-slate-900 dark:text-white">{ruta.dia}</h5>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            Residuos {ruta.tipoResiduo}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ruta.horario}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Barrios Cubiertos:</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {ruta.barrios.map((b, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Saca tus bolsas de basura máximo 1 hora antes del paso del camión recolector para mantener limpias las calles de Purificación.</span>
              </div>
            </div>
          )}

          {/* TAB 2: PLAZA DE MERCADO & TRANSPORTE */}
          {activeTab === 'mercado_transporte' && (
            <div className="space-y-4 animate-fade-in">
              {/* Plaza de mercado card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xl">
                    🛒
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Plaza de Mercado Central & Mercado Campesino</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Carrera 5 entre Calles 6 y 7, Centro de Purificación</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Días Fuertes de Mercado</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Viernes, Sábado y Domingo</p>
                    <p className="text-[11px] text-slate-500">5:00 AM a 2:00 PM</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Sector Carnes & Pescados</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Todos los días</p>
                    <p className="text-[11px] text-slate-500">Pescado fresco del Río Magdalena</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Feria Ganadera y Equina</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Primer Domingo de cada mes</p>
                    <p className="text-[11px] text-slate-500">Coliseo de Ferias Municipal</p>
                  </div>
                </div>
              </div>

              {/* Transportation card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xl">
                    🚌
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Terminal y Rutas de Transporte Intermunicipal</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Salidas desde Purificación hacia el resto del Tolima y el país</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white">Purificación ↔ Ibagué (Por El Espinal / Saldaña)</span>
                      <p className="text-[11px] text-slate-500">Empresas: Cointrasur, Velotax, Flota Huila (Cada 30 min, 5:00 AM - 6:30 PM)</p>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-300">~2h 30m</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white">Purificación ↔ Prado (Represa Hidroprado)</span>
                      <p className="text-[11px] text-slate-500">Camperos y microbuses de la Asociación de Transportadores de Prado (Cada 45 min)</p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-300">~35m</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white">Paso en Lancha / Canoa por el Río Magdalena</span>
                      <p className="text-[11px] text-slate-500">Paso continuo entre el Malecón de Purificación y las veredas ribereñas (6:00 AM - 6:00 PM)</p>
                    </div>
                    <span className="font-bold text-cyan-600 dark:text-cyan-300">5 min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRÁMITES MUNICIPALES */}
          {activeTab === 'tramites' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {TRAMITES_MUNICIPALES.map((tramite) => (
                  <div
                    key={tramite.id}
                    onClick={() => setSelectedTramite(tramite)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-[#0D47A1] cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {tramite.modalidad}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {tramite.costo}
                      </span>
                    </div>

                    <h5 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {tramite.nombre}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tramite.descripcion}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                      <span>{tramite.dependencia}</span>
                      <span className="text-[#0D47A1] dark:text-blue-400 font-bold">Ver requisitos &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tramite Detail Modal/Drawer if selected */}
              {selectedTramite && (
                <div className="p-5 rounded-3xl bg-blue-50 dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Guía Paso a Paso</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{selectedTramite.nombre}</h4>
                    </div>
                    <button onClick={() => setSelectedTramite(null)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300">{selectedTramite.descripcion}</p>

                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Requisitos Obligatorios:</p>
                    <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {selectedTramite.requisitos.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="font-bold text-slate-500">Lugar de radicación:</span>
                      <p className="text-slate-800 dark:text-slate-200">{selectedTramite.lugar}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">Tiempo de respuesta:</span>
                      <p className="text-slate-800 dark:text-slate-200">{selectedTramite.tiempoRespuesta}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PREGUNTAS FRECUENTES */}
          {activeTab === 'faqs' && (
            <div className="space-y-3 animate-fade-in">
              {FAQS_PURIFICACION.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1.5">
                  <h5 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#0D47A1] dark:text-blue-400 shrink-0" />
                    <span>{faq.pregunta}</span>
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                    {faq.respuesta}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">Alcaldía Municipal de Purificación &bull; Nit: 890.702.046-1</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0D47A1] text-white font-bold"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
