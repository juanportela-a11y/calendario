import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle, 
  ShieldAlert, 
  Droplets, 
  Calendar, 
  Phone, 
  MapPin, 
  ArrowRight,
  RefreshCw,
  Volume2,
  VolumeX,
  Compass,
  Utensils,
  Wrench,
  ThumbsUp,
  Award,
  Zap,
  Waves,
  Mic,
  MicOff,
  RotateCcw,
  Calculator,
  Pill,
  Trash2,
  CheckCircle2,
  PhoneCall,
  Activity,
  Flame
} from 'lucide-react';
import { useOpsStore } from '../../stores/useOpsStore';
import { EMERGENCY_CONTACTS, RUTAS_ASEO, TRAMITES_MUNICIPALES, RIO_MAGDALENA_STATUS, FARMACIAS_TURNO } from '../../data/municipalServicesData';
import { INITIAL_EVENTS } from '../../data/initialData';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  actionLink?: {
    tab?: string;
    label: string;
  };
  interactiveWidget?: 'predial_calc' | 'pharmacy_lookup' | 'trash_lookup' | 'civic_quiz';
  quizData?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    answered?: boolean;
    userSelected?: number;
  };
  rated?: boolean;
}

interface PurifiGuiaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  onEarnPoints?: (points: number) => void;
}

export const PurifiGuiaAssistantModal: React.FC<PurifiGuiaAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onEarnPoints
}) => {
  const { vias, cortes, jornadas } = useOpsStore();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Soy **PurifiGuía**, tu asistente cívico e interactivo de Purificación, Tolima. 🌴\n\nPuedes interactuar conmigo por voz o texto, usar herramientas interactivas integradas, consultar cortes de servicios públicos en vivo, monitorear el Río Magdalena, buscar farmacias de turno o participar en trivias cívicas para ganar PurifiPuntos.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        '💧 Cortes de agua y luz hoy',
        '💊 ¿Qué farmacia está de turno?',
        '🧮 Simular Descuento Predial',
        '🌴 ¿Qué hacer en Purificación?',
        '🍲 Platos típicos y Viudo de Capaz',
        '🚧 Vías cerradas y daños',
        '🌊 Nivel del Río Magdalena',
        '🎯 Trivia Cívica (+15 Pts)',
        '🚨 Teléfonos de emergencia 24h'
      ]
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Embedded widget states
  const [predialValue, setPredialValue] = useState<string>('50000000');
  const [selectedBarrioTrash, setSelectedBarrioTrash] = useState<string>('El Centro');
  const [bonusPointsToast, setBonusPointsToast] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Web Speech API Voice Recognition (STT)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'es-CO';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setRecognitionError('No se pudo capturar voz. Intenta escribiendo.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz por micrófono.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current.stop();
      }
    }
  };

  // Speech Synthesis
  const speakText = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Remove markdown symbols for speech
    const cleanText = textToSpeak
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/•/g, '')
      .replace(/#/g, '')
      .replace(/🌴|💧|🍲|🚧|🌊|🚨|📅|💊|🧮|🎯/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-CO';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const triggerPointsToast = (pts: number) => {
    setBonusPointsToast(pts);
    if (onEarnPoints) {
      onEarnPoints(pts);
    }
    setTimeout(() => setBonusPointsToast(null), 3000);
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: '¡Conversación reiniciada! ¿En qué te puedo colaborar sobre Purificación hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          '💧 Cortes de agua y luz hoy',
          '💊 ¿Qué farmacia está de turno?',
          '🧮 Simular Descuento Predial',
          '🌴 ¿Qué hacer en Purificación?',
          '🍲 Platos típicos y Viudo de Capaz',
          '🚧 Vías cerradas y daños',
          '🎯 Trivia Cívica (+15 Pts)'
        ]
      }
    ]);
  };

  const generateBotReply = (query: string): Message => {
    const q = query.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Trivia / Quiz Cívico
    if (q.includes('trivia') || q.includes('quiz') || q.includes('juego') || q.includes('pregunta') || q.includes('puntos')) {
      const quizes = [
        {
          question: '¿Cuál es el plato emblemático por excelencia de la gastronomía ribereña en Purificación?',
          options: ['Viudo de Capaz al carbón', 'Ajiaco Santafereño', 'Bandeja Paisa', 'Arroz Atollado'],
          correctIndex: 0,
          explanation: '¡Correcto! El Viudo de Capaz servido en plátano y yuca con su caldo concentrado es el plato insignia del Río Magdalena en Purificación.'
        },
        {
          question: '¿Cómo se llama el histórico puente colgante sobre el Río Magdalena en Purificación?',
          options: ['Puente Pumarejo', 'Puente Ospina Pérez', 'Puente San Roque', 'Puente de Boyacá'],
          correctIndex: 1,
          explanation: '¡Excelente! El Puente Mariano Ospina Pérez es un ícono de la ingeniería y conectividad fluvial en el sur del Tolima.'
        },
        {
          question: '¿Cuál es la empresa municipal encargada del servicio de acueducto y alcantarillado en Purificación?',
          options: ['EPM', 'EMPUR E.S.P.', 'Triple A', 'Acuavalle'],
          correctIndex: 1,
          explanation: '¡Exacto! EMPUR E.S.P. es la Empresa Municipal de Servicios Públicos de Purificación.'
        }
      ];
      const randomQuiz = quizes[Math.floor(Math.random() * quizes.length)];

      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: '🎯 **¡Desafío Cívico de Purificación!**\nResponde correctamente para ganar **+15 PurifiPuntos** cívicos:',
        timestamp: time,
        interactiveWidget: 'civic_quiz',
        quizData: {
          ...randomQuiz,
          answered: false
        }
      };
    }

    // Predial / Simulador
    if (q.includes('predial') || q.includes('impuesto') || q.includes('descuento') || q.includes('simular') || q.includes('calcular') || q.includes('hacienda')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: '🧮 **Simulador Interactivo de Descuento Impuesto Predial (Alcaldía de Purificación):**\n\nIngresa el valor del avalúo catastral de tu inmueble para calcular la tarifa estimada y el descuento del 15% por pronto pago vigente:',
        timestamp: time,
        interactiveWidget: 'predial_calc',
        quickReplies: ['📋 Otros trámites municipales', '🚨 Teléfonos de emergencia']
      };
    }

    // Farmacias de turno
    if (q.includes('farmacia') || q.includes('drogueria') || q.includes('droguería') || q.includes('medicina') || q.includes('turno') || q.includes('medicamento')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: '💊 **Directorio Interactivo de Farmacias y Droguerías de Turno:**\n\nEncuentra las farmacias disponibles hoy en el centro y barrios de Purificación:',
        timestamp: time,
        interactiveWidget: 'pharmacy_lookup',
        actionLink: { tab: 'turismo', label: 'Ver Farmacias y Comercio en Mapa' },
        quickReplies: ['🚨 Hospital y Ambulancias', '💧 Cortes de agua y luz hoy']
      };
    }

    // Basura / Aseo / Recolección
    if (q.includes('aseo') || q.includes('basura') || q.includes('camion') || q.includes('camión') || q.includes('recicla') || q.includes('empur')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: '🚛 **Rutas y Horarios de Recolección de Residuos (EMPUR E.S.P.):**\n\nSelecciona tu barrio para conocer los días y horarios exactos en que pasa el camión compactador:',
        timestamp: time,
        interactiveWidget: 'trash_lookup',
        quickReplies: ['💧 Cortes de agua y luz hoy', '🚧 Vías cerradas y daños']
      };
    }

    // Cortes de agua / luz
    if (q.includes('corte') || q.includes('agua') || q.includes('luz') || q.includes('gas') || q.includes('energía') || q.includes('servicio')) {
      const activeCortes = cortes.filter(c => c.estado === 'programado' || c.estado === 'en_curso');
      if (activeCortes.length === 0) {
        return {
          id: Date.now().toString(),
          sender: 'bot',
          text: '✅ **Excelente noticia:** No hay reportes de suspensiones masivas o cortes no programados en este momento en el casco urbano de Purificación.',
          timestamp: time,
          quickReplies: ['🚧 Vías cerradas', '🚨 Teléfonos de emergencia', '🌊 Nivel del Río Magdalena']
        };
      }
      const summary = activeCortes.map(c => `• **${c.tipo.toUpperCase()}** (${c.empresa_prestadora}): ${c.motivo} en sector *${c.sector_barrio}*. Horario: ${c.fecha_inicio} ${c.hora_inicio} a ${c.fecha_estimada_fin} ${c.hora_estimada_fin}.`).join('\n\n');
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Se registran los siguientes mantenimientos o cortes programados:\n\n${summary}\n\nPuedes consultar el mapa con los radios de afectación en el Centro de Control.`,
        timestamp: time,
        actionLink: { tab: 'operaciones', label: 'Ver Centro de Operaciones' },
        quickReplies: ['🚧 Vías cerradas', '📞 Teléfono EMPUR / CELSIA']
      };
    }

    // Turismo / Qué hacer / Atractivos
    if (q.includes('turismo') || q.includes('hacer') || q.includes('paseo') || q.includes('visitar') || q.includes('malecon') || q.includes('malecón') || q.includes('chenche') || q.includes('rio magdalena') || q.includes('atractivo') || q.includes('balneario')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `🌴 **Principales Atractivos Turísticos en Purificación:**\n\n1. 🌊 **Malecón Turístico:** Paseos en lancha por el Río Magdalena, brisa fresca y restaurantes típicos ribereños.\n2. ⛪ **Parroquia San Juan Bautista & Parque Central:** Hermosa arquitectura colonial, ceibas gigantescas y café campesino.\n3. 🏞️ **Balnearios de Chenche y Quebrada Cucuana:** Pozos naturales cristalinos para paseo de olla familiar y ecoturismo.\n4. 🌉 **Puente Mariano Ospina Pérez:** Vista panorámica impresionante del majestuoso valle del Alto Magdalena.\n\n¿Deseas consultar la guía interactiva de turismo y comercio?`,
        timestamp: time,
        actionLink: { tab: 'turismo', label: 'Abrir Guía Turística Completa' },
        quickReplies: ['🍲 Platos típicos y Viudo de Capaz', '📅 Agenda de fiestas y eventos', '🚨 Teléfonos de emergencia']
      };
    }

    // Gastronomía / Comida / Pescado
    if (q.includes('comida') || q.includes('plato') || q.includes('gastronom') || q.includes('viudo') || q.includes('pescado') || q.includes('nicuro') || q.includes('tamal') || q.includes('restaurante')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `🍲 **Gastronomía Típica Purificense:**\n\n• **Viudo de Capaz al Carbón:** El plato rey de Purificación, servido en plátano y yuca con hogao criollo y caldo concentrado de pescado.\n• **Nicuro Frito o en Salsa Criolla:** Pescado fresco del Río Magdalena con arroz blanco, patacón pisao y ensalada de aguacate.\n• **Tamal Tolimense e Insulso Dulce:** Envuelta en hoja de plátano con pollo, cerdo, huevo y masa de maíz.\n• **Chicha de Maíz y Masato de Arroz:** Bebidas tradicionales artesanales refrescantes.`,
        timestamp: time,
        actionLink: { tab: 'turismo', label: 'Ver Directorio de Restaurantes' },
        quickReplies: ['🌴 ¿Qué hacer en Purificación?', '💊 Farmacias de turno']
      };
    }

    // Vías y desvíos
    if (q.includes('via') || q.includes('vía') || q.includes('cerrad') || q.includes('desvio') || q.includes('desvío') || q.includes('calle') || q.includes('carrera') || q.includes('bache') || q.includes('paviment')) {
      const activeVias = vias.filter(v => v.estado !== 'completado');
      if (activeVias.length === 0) {
        return {
          id: Date.now().toString(),
          sender: 'bot',
          text: '✅ El tráfico fluye con normalidad en los corredores viales principales de Purificación y sobre el Puente Ospina Pérez.',
          timestamp: time,
          quickReplies: ['💧 Cortes de agua y luz hoy', '📅 Próximos eventos']
        };
      }
      const summary = activeVias.slice(0, 3).map(v => `• **${v.titulo}** (${v.barrio} - ${v.direccion}): ${v.descripcion}. Tipo de daño: *${v.tipo_dano}*. Estado: *${v.estado}*.`).join('\n\n');
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `🚧 **Vías en mantenimiento o con reporte de afectación:**\n\n${summary}\n\nPuedes radicar nuevos baches o ver el estado en tiempo real en el Centro de Control.`,
        timestamp: time,
        actionLink: { tab: 'operaciones', label: 'Abrir Centro de Control Vial' },
        quickReplies: ['💧 Cortes de agua y luz hoy', '🚨 Teléfonos de emergencia']
      };
    }

    // Zoonosis / Vacunación
    if (q.includes('mascota') || q.includes('perro') || q.includes('gato') || q.includes('esteriliz') || q.includes('zoonosis') || q.includes('vacun') || q.includes('salud')) {
      const activeJornadas = jornadas.filter(j => j.estado === 'programada' || j.estado === 'en_curso');
      if (activeJornadas.length === 0) {
        return {
          id: Date.now().toString(),
          sender: 'bot',
          text: 'Actualmente no hay jornadas masivas abiertas, pero la Secretaría de Salud y el Hospital Nuevo San Rafael atienden vacunación antirrábica de lunes a viernes.',
          timestamp: time,
          quickReplies: ['📞 Teléfono Hospital', '📋 Trámites alcaldía']
        };
      }
      const summary = activeJornadas.map(j => `• **${j.titulo}** en *${j.lugar}* (${j.barrio}): Fecha ${j.fecha}, ${j.hora_inicio} a ${j.hora_fin}. Cupos disponibles: ${j.cupos_totales - j.cupos_ocupados}/${j.cupos_totales}.`).join('\n\n');
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `🐾 **Jornadas Gratuitas de Zoonosis y Salud Municipal:**\n\n${summary}\n\n*Recuerda llevar a tu mascota en ayuno de 8 horas.* Puedes inscribirte en el Centro de Operaciones.`,
        timestamp: time,
        actionLink: { tab: 'operaciones', label: 'Inscribir Mascota en Zoonosis' },
        quickReplies: ['💧 Cortes de agua y luz hoy', '🚨 Teléfonos de emergencia']
      };
    }

    // Río Magdalena
    if (q.includes('rio') || q.includes('río') || q.includes('magdalena') || q.includes('clima') || q.includes('inunda') || q.includes('lluvia') || q.includes('caudal')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `🌊 **Estación Hidrológica Río Magdalena (Purificación):**\n\n• **Nivel Actual:** ${RIO_MAGDALENA_STATUS.nivelActualMetros} metros\n• **Estado de Alerta:** ${RIO_MAGDALENA_STATUS.estado.toUpperCase()} (Nivel seguro navegable)\n• **Tendencia:** ${RIO_MAGDALENA_STATUS.tendencia}\n• **Sectores vigilados:** Ospina Pérez, Camellón del Río, Malecón Turístico.\n\nRecomendación de Gestión del Riesgo: Uso obligatorio de chaleco salvavidas en cruces en canoa o lancha.`,
        timestamp: time,
        quickReplies: ['🚨 Teléfonos de emergencia', '🌴 ¿Qué hacer en Purificación?']
      };
    }

    // Teléfonos de emergencia
    if (q.includes('emergencia') || q.includes('telefono') || q.includes('teléfono') || q.includes('bombero') || q.includes('policia') || q.includes('policía') || q.includes('hospital') || q.includes('ambulancia')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `🚨 **Líneas de Auxilio y Emergencia 24 Horas en Purificación:**\n\n• 🏥 **Hospital Nuevo San Rafael (Urgencias):** 608-228-0015 / 314-354-8902\n• 🚒 **Cuerpo de Bomberos Purificación:** 608-228-0119 / 311-892-3401\n• 👮 **Policía Nacional Estación:** 123 / 320-302-4567\n• 💧 **EMPUR E.S.P. (Urgencias Acueducto):** 608-228-0456\n• ⚡ **CELSIA Tolima (Daños Eléctricos):** 018000-112115`,
        timestamp: time,
        quickReplies: ['💧 Cortes de agua y luz hoy', '📋 Trámites de la alcaldía']
      };
    }

    // Eventos
    if (q.includes('evento') || q.includes('calendario') || q.includes('fiesta') || q.includes('feria') || q.includes('fin de semana') || q.includes('folclor')) {
      const nextEvents = INITIAL_EVENTS.slice(0, 3).map(e => `• **${e.nombre}**: ${e.fecha} a las ${e.hora_inicio} en *${e.lugar}*`).join('\n');
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `📅 **Eventos y Actividades Próximas en Purificación:**\n\n${nextEvents}\n\nPuedes consultar la agenda completa con selector de fechas en el Calendario Municipal.`,
        timestamp: time,
        actionLink: { tab: 'calendario', label: 'Ver Calendario Oficial' },
        quickReplies: ['🌴 ¿Qué hacer en Purificación?', '💧 Cortes de agua y luz hoy']
      };
    }

    // Trámites
    if (q.includes('tramite') || q.includes('trámite') || q.includes('sisben') || q.includes('sisbén') || q.includes('residencia') || q.includes('alcaldia') || q.includes('alcaldía')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `📋 **Trámites Frecuentes en el Palacio Municipal:**\n\n1. **Impuesto Predial Unificado:** Liquidación con 15% de descuento por pronto pago.\n2. **Certificado de Residencia:** Expedido por la Secretaría de Gobierno (Cédula + Recibo de agua/luz + Carta JAC).\n3. **Sisbén IV:** Solicitud de encuesta en la oficina del Sisbén / Casa de la Cultura.\n\nHorario de atención: Lunes a Jueves 7:30 AM - 12:00 PM y 2:00 PM - 5:30 PM.`,
        timestamp: time,
        quickReplies: ['🧮 Simular Descuento Predial', '🚨 Teléfonos de emergencia']
      };
    }

    // Default general response
    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: `He procesado tu consulta sobre "${query}". En Purificación puedes consultar los siguientes canales interactivos oficiales:`,
      timestamp: time,
      quickReplies: [
        '💧 Cortes de agua y luz hoy',
        '💊 ¿Qué farmacia está de turno?',
        '🧮 Simular Descuento Predial',
        '🌴 ¿Qué hacer en Purificación?',
        '🍲 Platos típicos y Viudo de Capaz',
        '🚧 Vías cerradas y daños',
        '🌊 Nivel del Río Magdalena',
        '🎯 Trivia Cívica (+15 Pts)',
        '🚨 Teléfonos de emergencia'
      ]
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotReply(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      if (voiceEnabled) {
        speakText(botResponse.text);
      }
    }, 400);
  };

  const handleRateMessage = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, rated: true } : m));
    triggerPointsToast(5);
  };

  const handleAnswerQuiz = (msgId: string, optionIndex: number) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.quizData && !m.quizData.answered) {
        const isCorrect = optionIndex === m.quizData.correctIndex;
        if (isCorrect) {
          triggerPointsToast(15);
        }
        return {
          ...m,
          quizData: {
            ...m.quizData,
            answered: true,
            userSelected: optionIndex
          }
        };
      }
      return m;
    }));
  };

  if (!isOpen) return null;

  const parsedPredialVal = parseFloat(predialValue) || 0;
  const predialTariff = parsedPredialVal * 0.006; // Tarifa 6 por mil urbana
  const predialDiscount = predialTariff * 0.15; // 15% pronto pago
  const predialFinal = Math.max(0, predialTariff - predialDiscount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full h-[90vh] max-h-[740px] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bonus Points Notification Toast */}
        {bonusPointsToast !== null && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce border-2 border-white">
            <Award className="w-4 h-4" />
            <span>¡+{bonusPointsToast} PurifiPuntos Cívicos Ganados!</span>
          </div>
        )}

        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0D47A1] via-blue-700 to-indigo-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 font-black shadow-inner">
                <Bot className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0D47A1] absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">PurifiGuía Interactivo 2.0</h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-300/30 flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-emerald-400" />
                  <span>En Línea</span>
                </span>
              </div>
              <p className="text-xs text-blue-100">Asistente cívico oficial con IA de Purificación, Tolima</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              title="Reiniciar chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  setVoiceEnabled(!voiceEnabled);
                }
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                voiceEnabled || isSpeaking
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title={voiceEnabled ? 'Voz activada (clic para silenciar)' : 'Activar lectura por voz'}
            >
              {isSpeaking ? <Volume2 className="w-4 h-4 animate-pulse text-slate-950" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Cerrar Asistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Category Bar */}
        <div className="bg-blue-50/80 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => handleSend('💧 Cortes de agua y luz hoy')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 hover:border-blue-400 whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
            <span>Cortes de Agua/Luz</span>
          </button>

          <button
            onClick={() => handleSend('💊 ¿Qué farmacia está de turno?')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 hover:border-blue-400 whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
          >
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            <span>Farmacias Turno</span>
          </button>

          <button
            onClick={() => handleSend('🧮 Simular Descuento Predial')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 hover:border-blue-400 whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            <span>Predial</span>
          </button>

          <button
            onClick={() => handleSend('🌴 ¿Qué hacer en Purificación?')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 hover:border-blue-400 whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Turismo & Malecón</span>
          </button>

          <button
            onClick={() => handleSend('🎯 Trivia Cívica (+15 Pts)')}
            className="px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-700 hover:border-amber-500 whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Trivia Cívica</span>
          </button>

          <button
            onClick={() => handleSend('🚨 Teléfonos de emergencia 24h')}
            className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-300 dark:border-rose-700 hover:border-rose-500 whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergencias</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/60 dark:bg-slate-950/40">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div className="flex items-start gap-2.5 max-w-[95%] sm:max-w-[85%]">
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div 
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Interactive Widget 1: Predial Calculator */}
                  {msg.interactiveWidget === 'predial_calc' && (
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-blue-50/80 dark:bg-slate-900/90 border border-blue-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-blue-900 dark:text-blue-300">
                          Valor Avalúo Catastral ($ COP):
                        </span>
                        <span className="text-xs font-black text-blue-700 dark:text-blue-400">
                          ${Number(predialValue || 0).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={predialValue}
                          onChange={(e) => setPredialValue(e.target.value)}
                          placeholder="Ej: 50000000"
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-blue-200/60 dark:border-slate-700">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="text-slate-400 text-[10px]">Impuesto Base (6x1000):</p>
                          <p className="font-extrabold text-slate-700 dark:text-slate-200">${Math.round(predialTariff).toLocaleString()}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Descuento 15% Pronto Pago:</p>
                          <p className="font-extrabold text-emerald-700 dark:text-emerald-300">-${Math.round(predialDiscount).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="bg-blue-600 text-white p-2.5 rounded-xl flex items-center justify-between text-xs font-black shadow-xs">
                        <span>Total Neto a Pagar:</span>
                        <span className="text-sm">${Math.round(predialFinal).toLocaleString()} COP</span>
                      </div>
                    </div>
                  )}

                  {/* Interactive Widget 2: Pharmacy Lookup */}
                  {msg.interactiveWidget === 'pharmacy_lookup' && (
                    <div className="mt-3.5 space-y-2">
                      {FARMACIAS_TURNO.map((f, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{f.nombre}</span>
                              {f.es24Horas && (
                                <span className="text-[9px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded">24H</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-500" />
                              <span>{f.direccion} ({f.barrio})</span>
                            </p>
                          </div>
                          <a
                            href={`tel:${f.telefono.replace(/[^0-9]/g, '')}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shadow-xs"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Llamar</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Widget 3: Trash Schedule Lookup */}
                  {msg.interactiveWidget === 'trash_lookup' && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Rutas de Aseo:</label>
                        <select
                          value={selectedBarrioTrash}
                          onChange={(e) => setSelectedBarrioTrash(e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white font-bold"
                        >
                          {RUTAS_ASEO.map((r, idx) => (
                            <option key={idx} value={r.dia}>{r.dia} ({r.tipoResiduo})</option>
                          ))}
                        </select>
                      </div>

                      {(() => {
                        const ruta = RUTAS_ASEO.find(r => r.dia === selectedBarrioTrash) || RUTAS_ASEO[0];
                        return (
                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                            <p className="font-extrabold text-blue-600 dark:text-blue-400">
                              {ruta.icono} {ruta.dia} &bull; {ruta.tipoResiduo}
                            </p>
                            <p className="text-slate-600 dark:text-slate-300">⏰ <strong>Horario:</strong> {ruta.horario}</p>
                            <p className="text-slate-600 dark:text-slate-300">
                              📍 <strong>Sectores y Barrios:</strong> {ruta.barrios.join(', ')}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Interactive Widget 4: Civic Trivia Quiz */}
                  {msg.interactiveWidget === 'civic_quiz' && msg.quizData && (
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-slate-900 border border-amber-200 dark:border-amber-800 space-y-3">
                      <p className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                        {msg.quizData.question}
                      </p>

                      <div className="space-y-1.5">
                        {msg.quizData.options.map((opt, optIdx) => {
                          const answered = msg.quizData?.answered;
                          const isCorrect = optIdx === msg.quizData?.correctIndex;
                          const isSelected = msg.quizData?.userSelected === optIdx;

                          let btnClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-800 dark:text-slate-200';
                          if (answered) {
                            if (isCorrect) {
                              btnClass = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                            } else if (isSelected) {
                              btnClass = 'bg-red-500 text-white border-red-600 font-bold';
                            } else {
                              btnClass = 'opacity-50 bg-slate-100 dark:bg-slate-800';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={answered}
                              onClick={() => handleAnswerQuiz(msg.id, optIdx)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition-all flex items-center justify-between ${btnClass}`}
                            >
                              <span>{opt}</span>
                              {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </button>
                          );
                        })}
                      </div>

                      {msg.quizData.answered && (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                          {msg.quizData.userSelected === msg.quizData.correctIndex ? (
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              <span>{msg.quizData.explanation}</span>
                            </p>
                          ) : (
                            <p className="text-slate-600 dark:text-slate-300">
                              Respuesta correcta: <strong>{msg.quizData.options[msg.quizData.correctIndex]}</strong>. {msg.quizData.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Link to App Tab */}
                  {msg.actionLink && onNavigateTab && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => {
                          stopSpeaking();
                          onClose();
                          if (msg.actionLink?.tab) {
                            onNavigateTab(msg.actionLink.tab);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 font-bold text-xs flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-2xs"
                      >
                        <span>{msg.actionLink.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Feedback & Speech Tools */}
                  {msg.sender === 'bot' && (
                    <div className="mt-2 pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-700/50">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(msg.text)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5 cursor-pointer font-semibold"
                          title="Escuchar respuesta con voz natural"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Escuchar</span>
                        </button>
                        
                        {!msg.rated ? (
                          <button
                            onClick={() => handleRateMessage(msg.id)}
                            className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-0.5 cursor-pointer font-semibold"
                            title="Respuesta útil (+5 PurifiPuntos)"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Útil (+5 PTS)</span>
                          </button>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                            <Award className="w-3 h-3" />
                            <span>+5 PTS</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Quick Replies */}
              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-10 max-w-[90%]">
                  {msg.quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(qr)}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-slate-700 shadow-2xs transition-all hover:scale-105 cursor-pointer"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
              <Bot className="w-4 h-4 animate-bounce text-blue-500" />
              <span>PurifiGuía está procesando datos municipales...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Voice Listening Bar Indicator */}
        {isListening && (
          <div className="bg-red-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>Escuchando tu voz... Habla ahora (ej: "¿Qué farmacia está de turno?")</span>
            </div>
            <button 
              onClick={toggleListening}
              className="text-[11px] underline font-black cursor-pointer"
            >
              Detener
            </button>
          </div>
        )}

        {recognitionError && (
          <div className="bg-amber-100 text-amber-800 px-4 py-1 text-[11px] font-semibold flex items-center justify-between">
            <span>{recognitionError}</span>
            <button onClick={() => setRecognitionError(null)} className="text-xs">&times;</button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 sm:px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isListening 
                  ? 'bg-red-600 text-white border-red-600 animate-pulse shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700'
              }`}
              title={isListening ? 'Detener micrófono' : 'Hablar por micrófono'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregunta sobre turismo, cortes de agua, predial, farmacias o eventos..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
