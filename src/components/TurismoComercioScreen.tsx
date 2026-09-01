import React, { useState } from 'react';
import { 
  Compass, 
  Store, 
  Calendar as CalendarIcon, 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  Waves, 
  Landmark, 
  ShoppingBag, 
  ShieldCheck, 
  Pill, 
  Wrench, 
  Utensils, 
  Search,
  Filter,
  CheckCircle2,
  Navigation,
  MessageCircle,
  Share2,
  Info
} from 'lucide-react';
import { Evento } from '../types';

interface TurismoComercioScreenProps {
  events?: Evento[];
  onSelectEvent: (event: Evento) => void;
  onOpenAssistant?: () => void;
}

export const TurismoComercioScreen: React.FC<TurismoComercioScreenProps> = ({
  events = [],
  onSelectEvent,
  onOpenAssistant
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'turismo' | 'gastronomia' | 'comercio' | 'agenda'>('turismo');
  const [searchTerm, setSearchTerm] = useState('');
  const [comercioCategory, setComercioCategory] = useState<'todas' | 'farmacias' | 'ferreterias' | 'restaurantes' | 'artesanias' | 'servicios'>('todas');

  const handleShare = (title: string, address: string) => {
    if (navigator.share) {
      navigator.share({
        title: `${title} - Purificación, Tolima`,
        text: `Conoce ${title} en Purificación, Tolima. Ubicación: ${address}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${title} - Purificación, Tolima. Ubicación: ${address}`);
      alert('Información copiada al portapapeles.');
    }
  };

  const addToGoogleCalendar = (event: Evento) => {
    const title = encodeURIComponent(event.nombre);
    const details = encodeURIComponent(`${event.descripcion}\n\nOrganizado por: ${event.organizador}\nPurifiCalendario Oficial.`);
    const location = encodeURIComponent(`${event.lugar}, Purificación, Tolima`);
    
    const startDate = event.fecha.replace(/-/g, '') + 'T' + (event.hora_inicio ? event.hora_inicio.replace(':', '') + '00' : '080000');
    const endDate = event.fecha.replace(/-/g, '') + 'T' + (event.hora_fin ? event.hora_fin.replace(':', '') + '00' : '180000');
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  const sitiosTuristicos = [
    {
      id: 1,
      nombre: 'Malecón Turístico y Puerto Fluvial Río Magdalena',
      categoria: 'Naturaleza & Gastronomía Ribereña',
      horario: 'Abierto 24 horas &bull; Actividad principal 6:00 AM - 10:00 PM',
      ubicacion: 'Ribera del Río Magdalena, Sector Malecón',
      descripcion: 'Epicentro del folclor y la gastronomía ribereña purificense. Paseos en canoa y lancha a motor, brisa del río, pesca artesanal y restaurantes tradicionales con el famoso Viudo de Capaz.',
      imagen: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      icono: Waves,
      destacado: true,
      recomendacion: 'Ideal para ver el atardecer sobre el río Magdalena y degustar pescado fresco.'
    },
    {
      id: 2,
      nombre: 'Parroquia San Juan Bautista & Parque Central',
      categoria: 'Patrimonio Histórico y Religioso',
      horario: 'Lunes a Domingo: 6:30 AM - 8:00 PM',
      ubicacion: 'Parque Principal de Purificación (Calle 4 con Cra 5)',
      descripcion: 'Monumento arquitectónico emblemático de la época colonial. Alberga retablos históricos y es el centro de las tradicionales celebraciones patronales y de Semana Santa en el suroriente del Tolima.',
      imagen: 'https://images.unsplash.com/photo-1548625361-195feee10fce?w=800&auto=format&fit=crop&q=80',
      icono: Landmark,
      destacado: true,
      recomendacion: 'Visita los altares tallados en madera y toma un café tolimense en el parque.'
    },
    {
      id: 3,
      nombre: 'Balnearios Naturales de Chenche & Quebrada Cucuana',
      categoria: 'Ecoturismo & Senderismo Familiar',
      horario: 'Todos los días: 8:00 AM - 5:00 PM',
      ubicacion: 'Vereda Chenche Asoleado y Vereda El Hato (a 15 min)',
      descripcion: 'Pozos y cascadas de aguas cristalinas ideales para paseos de olla familiares, senderismo ecológico y avistamiento de aves nativas del bosque seco tropical.',
      imagen: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80',
      icono: Compass,
      destacado: false,
      recomendacion: 'Llevar calzado para agua y protección solar ecológica.'
    },
    {
      id: 4,
      nombre: 'Puente Histórico Ospina Pérez',
      categoria: 'Patrimonio de Ingeniería & Mirador Fluvial',
      horario: 'Acceso continuo peatonal y vehicular',
      ubicacion: 'Salida hacia Prado / Saldaña sobre el Río Magdalena',
      descripcion: 'Histórica estructura metálica que conecta a Purificación con la región del sur del Tolima. Ofrece una vista panorámica inigualable del cauce del Río Magdalena y las cordilleras.',
      imagen: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
      icono: Landmark,
      destacado: false,
      recomendacion: 'Excelente punto para fotografía paisajística al amanecer.'
    },
    {
      id: 5,
      nombre: 'Mirador de la Villa & Cerro de la Cruz',
      categoria: 'Senderismo & Fotografía Panorámica',
      horario: '6:00 AM - 6:30 PM',
      ubicacion: 'Sector Alto de la Cruz, Purificación',
      descripcion: 'Sendero ecoturístico que culmina en un mirador con vista de 360 grados sobre el valle del Magdalena, los palmares y el trazado colonial del municipio.',
      imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
      icono: Compass,
      destacado: false,
      recomendacion: 'Caminata de dificultad baja-media, recomendada en horas de la mañana.'
    }
  ];

  const platosTipicos = [
    {
      id: 1,
      nombre: 'Viudo de Capaz al Estilo Purificense',
      descripcion: 'El plato rey del río Magdalena: pescado capaz cocinado en leña sobre plátano, yuca y papa con suculento hogao criollo y caldo concentrado aparte.',
      lugar: 'Restaurantes del Malecón Fluvial y Plaza de Mercado',
      precio: '$22.000 - $30.000 COP',
      icono: '🐟',
      etiqueta: 'Plato Insignia'
    },
    {
      id: 2,
      nombre: 'Nicuro en Salsa Criolla o Frito',
      descripcion: 'Pescado fresco del río Magdalena preparado con especias locales, acompañado de arroz blanco, patacón pisao y ensalada fresca campesina.',
      lugar: 'Estaderos de la Ribera del Río y Vereda Bañao',
      precio: '$20.000 - $28.000 COP',
      icono: '🍲',
      etiqueta: 'Tradicional'
    },
    {
      id: 3,
      nombre: 'Tamal Tolimense con Insulso',
      descripcion: 'Masa de maíz rellena de carne de cerdo, pollo, huevo cocido, papa y zanahoria, envuelto en hoja de plátano y acompañado del dulce insulso de maíz.',
      lugar: 'Parque Principal y Panaderías Tradicionales',
      precio: '$8.000 - $12.000 COP',
      icono: '🫔',
      etiqueta: 'Desayuno Típico'
    },
    {
      id: 4,
      nombre: 'Chicha de Maíz y Masato de Arroz',
      descripcion: 'Bebidas ancestrales fermentadas artesanalmente con clavos de olor y canela, refrescantes para el clima cálido de la Villa de las Palmas.',
      lugar: 'Puestos típicos del Parque Central y Ferias',
      precio: '$3.000 - $5.000 COP',
      icono: '🥤',
      etiqueta: 'Bebida Artesanal'
    }
  ];

  const comercios = [
    {
      id: 1,
      nombre: 'Droguería Purificación Central (De Turno 24 Horas)',
      categoria: 'farmacias',
      tipo: 'Farmacia de Turno 24/7',
      direccion: 'Calle 4 No. 5-22 (Frente al Parque Principal)',
      telefono: '312 456 7890',
      telefonoFijo: '(608) 228-0245',
      horario: 'Servicio Continuo 24 Horas Ininterrumpido',
      servicios: ['Inyectología Certificada', 'Toma de Presión', 'Domicilios al Casco Urbano y Veredas', 'Medicamentos POS y Genéricos'],
      deTurno: true
    },
    {
      id: 2,
      nombre: 'Drogas La Rebaja Purificación',
      categoria: 'farmacias',
      tipo: 'Cadena Farmacéutica',
      direccion: 'Carrera 6 No. 4-18',
      telefono: '310 890 1234',
      telefonoFijo: '(608) 228-0112',
      horario: '7:00 AM - 9:00 PM',
      servicios: ['Medicamentos Especializados', 'Cuidado del Bebé', 'Convenios EPS y Fórmulas'],
      deTurno: false
    },
    {
      id: 3,
      nombre: 'Restaurante & Estadero El Pescador del Río',
      categoria: 'restaurantes',
      tipo: 'Gastronomía Típica Purificense',
      direccion: 'Malecón Turístico Local #4',
      telefono: '314 556 7890',
      telefonoFijo: '(608) 228-0567',
      horario: 'Todos los días: 8:00 AM - 8:00 PM',
      servicios: ['Viudo de Capaz al Carbón', 'Bagre Frito y Sudado', 'Chicha de Maíz Tradicional', 'Música Folclórica'],
      deTurno: false
    },
    {
      id: 4,
      nombre: 'Artesanías & Sombreros de Palma La Tolimense',
      categoria: 'artesanias',
      tipo: 'Artesanías & Souvenirs',
      direccion: 'Calle 5 # 4-30 (Sector Histórico)',
      telefono: '313 778 9900',
      telefonoFijo: '(608) 228-0380',
      horario: 'Lunes a Domingo: 8:00 AM - 7:00 PM',
      servicios: ['Sombreros de Pindo y Suaza', 'Canastos de Palma', 'Dulces Típicos del Tolima', 'Artesanías en Barro'],
      deTurno: false
    },
    {
      id: 5,
      nombre: 'Ferretería El Constructor & Materiales Tolima',
      categoria: 'ferreterias',
      tipo: 'Ferretería & Construcción',
      direccion: 'Carrera 6 # 3-14',
      telefono: '310 445 6789',
      telefonoFijo: '(608) 228-0334',
      horario: 'Lunes a Sábado: 6:30 AM - 6:00 PM | Dom: 7:00 AM - 1:00 PM',
      servicios: ['Cemento y Acero', 'Fontanería y Tubería PVC', 'Pinturas y Herramientas', 'Transporte a Fincas'],
      deTurno: false
    },
    {
      id: 6,
      nombre: 'Serviteca & Taller Motos del Magdalena',
      categoria: 'servicios',
      tipo: 'Mecánica & Repuestos',
      direccion: 'Calle 7 con Carrera 4 Esquina',
      telefono: '311 223 3445',
      telefonoFijo: '(608) 228-0678',
      horario: 'Lunes a Sábado: 7:00 AM - 6:30 PM',
      servicios: ['Mantenimiento Preventivo', 'Repuestos Originales', 'Llantas y Baterías', 'Despinche de Emergencia'],
      deTurno: false
    }
  ];

  const filteredComercios = comercios.filter(c => {
    const matchesCat = comercioCategory === 'todas' || c.categoria === comercioCategory;
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.servicios.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner - High contrast and vibrant light/dark styling */}
      <div className="bg-gradient-to-r from-[#0D47A1] via-blue-700 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-blue-400/20">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/30 text-amber-200">
            <Store className="w-4 h-4 text-amber-300" />
            <span>Guía Municipal Oficial &bull; Purificación, Tolima</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Turismo, Cultura y Comercio Local
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mt-2 leading-relaxed font-normal">
            Descubre los tesoros de la Villa de las Palmas: el majestuoso Río Magdalena, gastronomía ribereña, patrimonio colonial y el directorio de comercios y farmacias de turno 24/7.
          </p>

          {/* Sub-tabs Selector */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/20">
            <button
              onClick={() => setActiveSubTab('turismo')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'turismo'
                  ? 'bg-white text-[#0D47A1] shadow-lg font-black scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Sitios Turísticos ({sitiosTuristicos.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('gastronomia')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'gastronomia'
                  ? 'bg-white text-[#0D47A1] shadow-lg font-black scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Gastronomía Típica</span>
            </button>

            <button
              onClick={() => setActiveSubTab('comercio')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'comercio'
                  ? 'bg-white text-[#0D47A1] shadow-lg font-black scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Pill className="w-4 h-4 text-cyan-400" />
              <span>Farmacias 24h & Comercio</span>
            </button>

            <button
              onClick={() => setActiveSubTab('agenda')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'agenda'
                  ? 'bg-white text-[#0D47A1] shadow-lg font-black scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-rose-400" />
              <span>Agenda de Eventos ({events.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: GUÍA TURÍSTICA */}
      {activeSubTab === 'turismo' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span>Atractivos y Patrimonio de Purificación</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Puntos de interés imperdibles para habitantes y visitantes a orillas del Magdalena.
              </p>
            </div>
            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-all self-start sm:self-auto cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Pedir Recomendaciones a PurifiGuía</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sitiosTuristicos.map((sitio) => {
              const Icon = sitio.icono;
              return (
                <div 
                  key={sitio.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="h-48 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img 
                        src={sitio.imagen} 
                        alt={sitio.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-slate-800 dark:text-white flex items-center gap-1.5 shadow-sm">
                        <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{sitio.categoria}</span>
                      </div>
                      {sitio.destacado && (
                        <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                          ★ Imperdible
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {sitio.nombre}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {sitio.descripcion}
                      </p>

                      <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 text-[11px] text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-slate-700 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{sitio.recomendacion}</span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">{sitio.ubicacion}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span dangerouslySetInnerHTML={{ __html: sitio.horario }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => handleShare(sitio.nombre, sitio.ubicacion)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center cursor-pointer"
                      title="Compartir punto turístico"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sitio.nombre + ' Purificación Tolima')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Cómo Llegar en Maps</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GASTRONOMÍA TÍPICA */}
      {activeSubTab === 'gastronomia' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-6 h-6 text-amber-500" />
                <span>Sabores Típicos del Tolima y del Magdalena</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                La riqueza culinaria ribereña: platos tradicionales, bebidas autóctonas y los mejores lugares para degustarlos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {platosTipicos.map((plato) => (
              <div 
                key={plato.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{plato.icono}</span>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        {plato.etiqueta}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {plato.precio}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {plato.nombre}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {plato.descripcion}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{plato.lugar}</span>
                  </div>
                  <button 
                    onClick={() => setActiveSubTab('comercio')}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Ver restaurantes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COMERCIO & FARMACIAS DE TURNO */}
      {activeSubTab === 'comercio' && (
        <div className="space-y-6">
          {/* Banner Farmacia de Turno */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-emerald-400/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-emerald-100">
                  <Pill className="w-3.5 h-3.5 text-amber-300" />
                  <span>Farmacia de Turno Municipal &bull; Servicio 24 Horas</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight">
                  Droguería Purificación Central
                </h3>
                <p className="text-emerald-100 text-xs sm:text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                  <span>Calle 4 No. 5-22 (Frente al Parque Principal de Purificación)</span>
                </p>
                <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-semibold">
                  <span className="bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-400/30">
                    💉 Inyectología Certificada
                  </span>
                  <span className="bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-400/30">
                    🛵 Domicilios Inmediatos
                  </span>
                  <span className="bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-400/30">
                    ⚡ Turno 24 Horas
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
                <a
                  href="tel:3124567890"
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Llamar: 312 456 7890</span>
                </a>
                <a
                  href="https://wa.me/573124567890?text=Hola,%20solicito%20medicamentos%20de%20turno%20en%20Purificación."
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-2xl bg-emerald-900/70 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider border border-emerald-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>Pedir por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar comercio por nombre, servicio o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-blue-500 font-medium text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setComercioCategory('todas')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  comercioCategory === 'todas'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Todos ({comercios.length})
              </button>
              <button
                onClick={() => setComercioCategory('farmacias')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  comercioCategory === 'farmacias'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Farmacias</span>
              </button>
              <button
                onClick={() => setComercioCategory('restaurantes')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  comercioCategory === 'restaurantes'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Restaurantes</span>
              </button>
              <button
                onClick={() => setComercioCategory('artesanias')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  comercioCategory === 'artesanias'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Artesanías</span>
              </button>
              <button
                onClick={() => setComercioCategory('ferreterias')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  comercioCategory === 'ferreterias'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Ferreterías</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredComercios.map((com) => (
              <div 
                key={com.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {com.tipo}
                    </span>
                    {com.deTurno && (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        ⚡ Turno 24 Horas
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    {com.nombre}
                  </h3>

                  <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{com.direccion}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{com.horario}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="font-bold">{com.telefono} &bull; {com.telefonoFijo}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Servicios & Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {com.servicios.map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <a
                    href={`tel:${com.telefono.replace(/\s+/g, '')}`}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Llamar</span>
                  </a>
                  <a
                    href={`https://wa.me/57${com.telefono.replace(/\s+/g, '')}?text=Hola,%20deseo%20información%20sobre%20sus%20servicios.`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AGENDA DE EVENTOS Y FESTIVIDADES */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>Agenda Cultural y Fiestas Tradicionales</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Consulta los eventos programados en Purificación y agrégalos a tu calendario de Google con un clic.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((ev) => (
              <div 
                key={ev.id_evento}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {ev.categoria?.nombre || 'General'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      📅 {ev.fecha}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {ev.nombre}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {ev.descripcion}
                  </p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{ev.lugar}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{ev.hora_inicio} - {ev.hora_fin}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onSelectEvent(ev)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Ver Detalles</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => addToGoogleCalendar(ev)}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Exportar a Google Calendar"
                  >
                    <span>Google Cal</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
