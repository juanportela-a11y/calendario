import React, { useEffect, useState, Suspense, lazy } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Bookmark, 
  Clock, 
  MapPin, 
  Bell,
  CalendarRange,
  X
} from 'lucide-react';

import { 
  Aviso, 
  Categoria, 
  CreateAvisoDTO, 
  CreateEventoDTO, 
  Evento, 
  Notificacion, 
  Organizador, 
  Usuario 
} from './types';
import { ApiClientAdapter } from './adapters/apiClient';
import { OfflineStorageManager, STORAGE_KEYS } from './utils/offlineStorage';
import { OfflineStatusIndicator } from './components/common/OfflineStatusIndicator';
import { useUpcomingEventNotifier } from './utils/savedEventNotificationService';

// Core Essential Components
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { UrgentAlertBanner } from './components/UrgentAlertBanner';
import { CitizenQuickHub } from './components/home/CitizenQuickHub';
import { HomeCitizenPollWidget } from './components/home/HomeCitizenPollWidget';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { HydroWeatherMonitor } from './components/weather/HydroWeatherMonitor';
import { EmergencyDirectoryModal } from './components/emergency/EmergencyDirectoryModal';
import { WasteAndServicesGuideModal } from './components/services/WasteAndServicesGuideModal';
import { PurifiGuiaAssistantModal } from './components/assistant/PurifiGuiaAssistantModal';
import { FloatingActionsMenu } from './components/FloatingActionsMenu';
import { CalendarSkeleton, DashboardCardSkeleton } from './components/common/SkeletonLoaders';
import { useOpsStore } from './stores/useOpsStore';

// Dynamic Lazy Loading & Code Splitting for Heavy Modules
const CalendarView = lazy(() => import('./components/CalendarView').then(m => ({ default: m.CalendarView })));
const MunicipalOpsDashboard = lazy(() => import('./components/operations/MunicipalOpsDashboard').then(m => ({ default: m.MunicipalOpsDashboard })));
const TurismoComercioScreen = lazy(() => import('./components/TurismoComercioScreen').then(m => ({ default: m.TurismoComercioScreen })));
const AvisosScreen = lazy(() => import('./components/AvisosScreen').then(m => ({ default: m.AvisosScreen })));
const NotificationCenter = lazy(() => import('./components/NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const UserProfile = lazy(() => import('./components/UserProfile').then(m => ({ default: m.UserProfile })));
const OrganizerPanel = lazy(() => import('./components/OrganizerPanel').then(m => ({ default: m.OrganizerPanel })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const DatabaseInspectorModal = lazy(() => import('./components/DatabaseInspectorModal').then(m => ({ default: m.DatabaseInspectorModal })));
const CreateNoticeModal = lazy(() => import('./components/CreateNoticeModal').then(m => ({ default: m.CreateNoticeModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));

export default function App() {
  // Application State
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('purificheck_dark');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('purificheck_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('purificheck_dark', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  
  // Data State
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [events, setEvents] = useState<Evento[]>([]);
  const [notices, setNotices] = useState<Aviso[]>([]);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [savedEvents, setSavedEvents] = useState<Evento[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [organizers, setOrganizers] = useState<Organizador[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Active User State with local storage persistence (null by default for mandatory auth/registration flow)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('purifi_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  // Modal Control States
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(() => {
    const saved = localStorage.getItem('purifi_active_user');
    return !saved; // Show Auth Modal immediately on initial startup when no account is active
  });
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'switch'>('login');
  const [showDdlModal, setShowDdlModal] = useState(false);
  const [showCreateNoticeModal, setShowCreateNoticeModal] = useState(false);
  const [showEmergenciesModal, setShowEmergenciesModal] = useState(false);
  const [showServicesGuideModal, setShowServicesGuideModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);

  // Event Directory Filters
  const [searchEventText, setSearchEventText] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');

  // Date range presets helper for directory
  const handleApplyDatePreset = (preset: 'all' | 'today' | 'this_week' | 'weekend' | 'this_month' | 'next_30') => {
    const today = new Date(2026, 7, 11);
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (preset === 'all') {
      setEventStartDate('');
      setEventEndDate('');
      return;
    }

    if (preset === 'today') {
      const todayStr = formatDate(today);
      setEventStartDate(todayStr);
      setEventEndDate(todayStr);
      return;
    }

    if (preset === 'this_week') {
      const start = new Date(today);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setEventStartDate(formatDate(start));
      setEventEndDate(formatDate(end));
      return;
    }

    if (preset === 'weekend') {
      const sat = new Date(today);
      const day = sat.getDay();
      const diff = sat.getDate() + (6 - day);
      sat.setDate(diff);
      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);
      setEventStartDate(formatDate(sat));
      setEventEndDate(formatDate(sun));
      return;
    }

    if (preset === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setEventStartDate(formatDate(start));
      setEventEndDate(formatDate(end));
      return;
    }

    if (preset === 'next_30') {
      const end = new Date(today);
      end.setDate(today.getDate() + 30);
      setEventStartDate(formatDate(today));
      setEventEndDate(formatDate(end));
      return;
    }
  };

  // Ops Store Integration
  const { 
    markNoticeAsReadByCitizen, 
    notifiedUsers, 
    vias, 
    cortes, 
    jornadas, 
    auditLogs,
    initFirestoreSync,
    addAuditLog 
  } = useOpsStore();

  const urgentNotice = notices.find(n => n.urgente) || null;

  // Real-time Firestore synchronization active at the root level of the application
  useEffect(() => {
    const cleanupSync = initFirestoreSync();
    return () => {
      if (cleanupSync) cleanupSync();
    };
  }, []);

  // Load initial data from backend API & Sync Offline
  const loadAllData = async () => {
    try {
      setIsLoadingInitial(true);
      const [cats, evts, nts, usrs, orgs] = await Promise.all([
        ApiClientAdapter.getCategories(),
        ApiClientAdapter.getEvents(),
        ApiClientAdapter.getNotices(),
        ApiClientAdapter.getUsers(),
        ApiClientAdapter.getOrganizers()
      ]);

      setCategories(cats);
      setEvents(evts);
      setNotices(nts);
      setUsers(usrs);
      setOrganizers(orgs);

      // Persist latest datasets to Offline Storage including audit logs
      OfflineStorageManager.syncAllToOffline(nts, evts, vias, cortes, jornadas, auditLogs);

      // Load user specific data
      if (currentUser && currentUser.id_usuario) {
        const [userNotifs, userSaved] = await Promise.all([
          ApiClientAdapter.getNotifications(currentUser.id_usuario),
          ApiClientAdapter.getSavedEvents(currentUser.id_usuario)
        ]);
        setNotifications(userNotifs);
        setSavedEvents(userSaved);
      } else {
        setNotifications([]);
        setSavedEvents([]);
      }

      // Load admin stats if admin
      const stats = await ApiClientAdapter.getAdminStats();
      setAdminStats(stats);
    } catch (err) {
      console.error('Error cargando datos del servidor:', err);
      // Fallback from offline cache
      const cachedNotices = OfflineStorageManager.getCache(STORAGE_KEYS.NOTICES, []);
      const cachedEvents = OfflineStorageManager.getCache(STORAGE_KEYS.EVENTS, []);
      if (cachedNotices.length > 0) setNotices(cachedNotices);
      if (cachedEvents.length > 0) setEvents(cachedEvents);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentUser?.id_usuario]);

  // Saved Event IDs for quick check
  const savedEventIds = savedEvents.map(e => e.id_evento);

  // Local Browser Notification Service for Upcoming Saved Events
  const eventNotifier = useUpcomingEventNotifier(savedEvents, currentUser?.id_usuario);

  // Handlers
  const handleToggleSave = async (idEvento: number) => {
    if (!currentUser) {
      openAuthWithTab('login');
      return;
    }
    try {
      const isAlreadySaved = savedEventIds.includes(idEvento);
      await ApiClientAdapter.toggleSaveEvent(currentUser.id_usuario, idEvento);
      const updatedSaved = await ApiClientAdapter.getSavedEvents(currentUser.id_usuario);
      setSavedEvents(updatedSaved);

      const targetEv = events.find(e => e.id_evento === idEvento);
      await addAuditLog({
        funcionario_nombre: currentUser.nombre_usuario,
        funcionario_rol: 'Ciudadano / Usuario',
        modulo: 'Eventos',
        accion: 'GUARDAR_EVENTO',
        descripcion: isAlreadySaved 
          ? `Removió evento #${idEvento}${targetEv ? ` "${targetEv.nombre}"` : ''} de sus eventos guardados`
          : `Guardó evento #${idEvento}${targetEv ? ` "${targetEv.nombre}"` : ''} en su agenda personal`,
        id_referencia: idEvento
      });
    } catch (err) {
      console.error('Error al guardar evento:', err);
    }
  };

  const handleUpdateUserPreferences = async (preferences: string[]) => {
    if (!currentUser) return;
    try {
      const updatedUser = await ApiClientAdapter.updateUserPreferences(currentUser.id_usuario, preferences);
      setCurrentUser(updatedUser);
      localStorage.setItem('purifi_active_user', JSON.stringify(updatedUser));

      await addAuditLog({
        funcionario_nombre: currentUser.nombre_usuario,
        funcionario_rol: currentUser.rol || 'Ciudadano',
        modulo: 'Usuarios',
        accion: 'ACTUALIZACIÓN_PREFERENCIAS',
        descripcion: `Actualizó sus categorías de interés (${preferences.length} categorías seleccionadas)`,
        id_referencia: currentUser.id_usuario,
        detalles_nuevos: preferences.join(', ')
      });
    } catch (err) {
      console.error('Error actualizando preferencias:', err);
    }
  };

  const handleCreateEvent = async (dto: CreateEventoDTO) => {
    let orgId = 1;
    if (currentUser) {
      const myOrg = organizers.find(o => o.id_usuario === currentUser.id_usuario);
      if (myOrg) orgId = myOrg.id_organizador;
    }

    const created = await ApiClientAdapter.createEvent({ ...dto, id_organizador: orgId });
    await addAuditLog({
      funcionario_nombre: currentUser ? currentUser.nombre_usuario : 'Organizador Comunitario',
      funcionario_rol: currentUser ? (currentUser.rol === 'administrador' ? 'Alcaldía / Administrador' : 'Organizador') : 'Organizador Comunitario',
      modulo: 'Eventos',
      accion: 'CREACIÓN',
      descripcion: `Creó el evento "${dto.nombre}" programado para el ${dto.fecha} en ${dto.lugar}`,
      id_referencia: created ? (created as any).id_evento : undefined,
      detalles_nuevos: `Fecha: ${dto.fecha} ${dto.hora_inicio} | Categoría ID: ${dto.id_categoria}`
    });
    await loadAllData();
  };

  const handleUpdateEvent = async (id: number, dto: Partial<CreateEventoDTO>) => {
    await ApiClientAdapter.updateEvent(id, dto);
    await addAuditLog({
      funcionario_nombre: currentUser ? currentUser.nombre_usuario : 'Administrador',
      funcionario_rol: 'Gestor Municipal de Eventos',
      modulo: 'Eventos',
      accion: 'ACTUALIZACIÓN',
      descripcion: `Actualizó datos del evento #${id}${dto.nombre ? `: "${dto.nombre}"` : ''}`,
      id_referencia: id,
      detalles_nuevos: JSON.stringify(dto)
    });
    await loadAllData();
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este evento?')) {
      const ev = events.find(e => e.id_evento === id);
      await ApiClientAdapter.deleteEvent(id);
      await addAuditLog({
        funcionario_nombre: currentUser ? currentUser.nombre_usuario : 'Administrador',
        funcionario_rol: 'Administración Municipal',
        modulo: 'Eventos',
        accion: 'ELIMINACIÓN',
        descripcion: `Eliminó el evento #${id}${ev ? `: "${ev.nombre}"` : ''}`,
        id_referencia: id
      });
      await loadAllData();
    }
  };

  const handleCreateNotice = async (dto: CreateAvisoDTO) => {
    if (!currentUser) return;
    const created = await ApiClientAdapter.createNotice(dto, currentUser.id_usuario);
    await addAuditLog({
      funcionario_nombre: currentUser.nombre_usuario,
      funcionario_rol: currentUser.rol === 'administrador' ? 'Alcaldía Municipal' : 'Funcionario',
      modulo: 'Avisos',
      accion: 'CREACIÓN',
      descripcion: `Publicó aviso oficial: "${dto.titulo}" [${dto.urgente ? 'URGENTE' : 'Informativo'}]`,
      id_referencia: created ? (created as any).id_aviso : undefined,
      detalles_nuevos: `Sector: ${dto.sector_afectado || 'General'}`
    });
    await loadAllData();
  };

  const handleDeleteNotice = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este aviso?')) {
      const notice = notices.find(n => n.id_aviso === id);
      await ApiClientAdapter.deleteNotice(id);
      await addAuditLog({
        funcionario_nombre: currentUser ? currentUser.nombre_usuario : 'Administrador',
        funcionario_rol: 'Administración Municipal',
        modulo: 'Avisos',
        accion: 'ELIMINACIÓN',
        descripcion: `Retiró el aviso oficial #${id}${notice ? `: "${notice.titulo}"` : ''}`,
        id_referencia: id
      });
      await loadAllData();
    }
  };

  const handleMarkNotifRead = async (id: number) => {
    if (!currentUser) return;
    await ApiClientAdapter.markNotificationRead(id);
    const updatedNotifs = await ApiClientAdapter.getNotifications(currentUser.id_usuario);
    setNotifications(updatedNotifs);
  };

  const handleMarkAllNotifsRead = async () => {
    if (!currentUser) return;
    await ApiClientAdapter.markAllNotificationsRead(currentUser.id_usuario);
    const updatedNotifs = await ApiClientAdapter.getNotifications(currentUser.id_usuario);
    setNotifications(updatedNotifs);
  };

  const handleSendBroadcastNotification = async (titulo: string, mensaje: string, tipo: string) => {
    await ApiClientAdapter.broadcastNotification({
      titulo,
      mensaje,
      tipo_ref: tipo
    });
    await addAuditLog({
      funcionario_nombre: currentUser ? currentUser.nombre_usuario : 'Central de Comunicaciones',
      funcionario_rol: 'Prensa & Difusión Municipal',
      modulo: 'Notificaciones',
      accion: 'BROADCAST_NOTIFICACIÓN',
      descripcion: `Difundió notificación masiva a la comunidad: "${titulo}"`,
      detalles_nuevos: `Mensaje: ${mensaje.slice(0, 100)}...`
    });
    if (currentUser && currentUser.id_usuario) {
      const userNotifs = await ApiClientAdapter.getNotifications(currentUser.id_usuario);
      setNotifications(userNotifs);
    }
  };

  const handleLoginUser = async (login: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await ApiClientAdapter.login(login, pass);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('purifi_active_user', JSON.stringify(res.user));
        setShowAuthModal(false);

        await addAuditLog({
          funcionario_nombre: res.user.nombre_usuario,
          funcionario_rol: res.user.rol || 'Ciudadano',
          modulo: 'Usuarios',
          accion: 'INICIO_SESIÓN',
          descripcion: `Inició sesión en el portal municipal (${res.user.correo})`,
          id_referencia: res.user.id_usuario
        });

        await loadAllData();
        return { success: true };
      }
      return { success: false, error: 'Credenciales inválidas' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error en inicio de sesión' };
    }
  };

  const handleRegisterUser = async (data: Partial<Usuario>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await ApiClientAdapter.register(data);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('purifi_active_user', JSON.stringify(res.user));
        setShowAuthModal(false);

        await addAuditLog({
          funcionario_nombre: res.user.nombre_usuario,
          funcionario_rol: res.user.rol || 'Ciudadano Registrado',
          modulo: 'Usuarios',
          accion: 'REGISTRO_USUARIO',
          descripcion: `Nuevo usuario registrado: ${res.user.nombre_usuario} (${res.user.correo}) - Barrio: ${res.user.barrio || 'No especificado'}`,
          id_referencia: res.user.id_usuario
        });

        await loadAllData();
        return { success: true };
      }
      return { success: false, error: 'No se pudo crear la cuenta' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrar el usuario' };
    }
  };

  const handleGoogleLogin = async (data: { email: string; name?: string; photoUrl?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await ApiClientAdapter.loginWithGoogle(data);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('purifi_active_user', JSON.stringify(res.user));
        setShowAuthModal(false);

        await addAuditLog({
          funcionario_nombre: res.user.nombre_usuario,
          funcionario_rol: res.user.rol || 'Ciudadano (Google)',
          modulo: 'Usuarios',
          accion: 'INICIO_SESIÓN',
          descripcion: `Autenticación con Google exitosa: ${res.user.correo}`,
          id_referencia: res.user.id_usuario
        });

        await loadAllData();
        return { success: true };
      }
      return { success: false, error: 'No se pudo iniciar sesión con Google' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error en autenticación con Google' };
    }
  };

  const handleLogoutUser = () => {
    localStorage.removeItem('purifi_active_user');
    setCurrentUser(null);
    setSavedEvents([]);
    setNotifications([]);
    openAuthWithTab('login');
    setActiveTab('inicio');
  };

  const handleSelectUser = (u: Usuario) => {
    setCurrentUser(u);
    localStorage.setItem('purifi_active_user', JSON.stringify(u));
  };

  const openAuthWithTab = (tab: 'login' | 'register' | 'switch' = 'login') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  const unreadNotifsCount = notifications.filter(n => !n.leida).length;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F0F6FF] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-[#2196F3] selection:text-white transition-colors duration-200">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={handleSelectUser}
        unreadCount={unreadNotifsCount}
        onOpenAuth={() => openAuthWithTab('login')}
        onOpenLogin={() => openAuthWithTab('login')}
        onOpenRegister={() => openAuthWithTab('register')}
        onGoogleLogin={handleGoogleLogin}
        onLogout={handleLogoutUser}
        onOpenDdl={() => setShowDdlModal(true)}
        allUsers={users}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenEmergencies={() => setShowEmergenciesModal(true)}
        onOpenServicesGuide={() => setShowServicesGuideModal(true)}
        onOpenAssistant={() => setShowAssistantModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Single Optimal Urgent Notification Banner */}
        {urgentNotice && (
          <UrgentAlertBanner
            notice={urgentNotice}
            currentUser={currentUser}
            notifiedCount={notifiedUsers.length}
            totalNoticesCount={notices.length}
            onViewAll={() => setActiveTab('avisos')}
            onConfirmRead={(notice) => {
              markNoticeAsReadByCitizen(notice.titulo, currentUser?.nombre_usuario || 'Invitado');
            }}
          />
        )}

        {/* TAB 1: INICIO (HOME SCREEN) */}
        {activeTab === 'inicio' && (
          <div className="space-y-8">
            {/* Hero Presentation */}
            <HeroBanner
              onExploreEvents={() => setActiveTab('calendario')}
              onExploreNotices={() => setActiveTab('avisos')}
              onExploreOperations={() => setActiveTab('operaciones')}
              onOpenEmergencies={() => setShowEmergenciesModal(true)}
              onOpenAssistant={() => setShowAssistantModal(true)}
              onOpenServicesGuide={() => setShowServicesGuideModal(true)}
              totalEventsCount={events.length}
              totalNoticesCount={notices.length}
            />

            {/* River Magdalena & Weather Station Live Monitor */}
            <HydroWeatherMonitor 
              onOpenEmergencyDirectory={() => setShowEmergenciesModal(true)}
            />

            {/* Daily Citizen Quick Services Hub (Pharmacies, Waste collection, Road status, Town hall services) */}
            <CitizenQuickHub
              onOpenEmergencies={() => setShowEmergenciesModal(true)}
              onOpenServicesGuide={() => setShowServicesGuideModal(true)}
              onOpenOpsDashboard={() => setActiveTab('operaciones')}
            />

            {/* Citizen Participatory Poll / Presupuesto Participativo */}
            <HomeCitizenPollWidget
              currentUser={currentUser}
              onVoteSuccess={(points) => {
                if (currentUser) {
                  const updatedPoints = (currentUser.puntos_civicos || 0) + points;
                  const updatedUser = { ...currentUser, puntos_civicos: updatedPoints };
                  setCurrentUser(updatedUser);
                  localStorage.setItem('purifi_active_user', JSON.stringify(updatedUser));
                }
              }}
            />

            {/* Quick Category Badges */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider text-[#0D47A1] dark:text-blue-400">
                  Categorías Principales del Municipio
                </h3>
                <button 
                  onClick={() => setActiveTab('calendario')}
                  className="text-xs font-bold text-[#2196F3] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id_categoria}
                    onClick={() => {
                      setSelectedCategoryFilter(cat.id_categoria);
                      setActiveTab('eventos');
                    }}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all text-left flex flex-col justify-between group"
                  >
                    <span 
                      className="w-3 h-3 rounded-full mb-2 group-hover:scale-125 transition-transform" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{cat.nombre}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {events.filter(e => e.id_categoria === cat.id_categoria).length} eventos
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured & Upcoming Events Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Próximos Eventos Destacados
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Actividades culturales, deportivas y jornadas de salud agendadas en Purificación
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('eventos')}
                  className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0D47A1] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-1.5"
                >
                  <span>Ver todos los eventos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.slice(0, 6).map((evt) => (
                  <EventCard
                    key={evt.id_evento}
                    evento={evt}
                    isSaved={savedEventIds.includes(evt.id_evento)}
                    onToggleSave={handleToggleSave}
                    onSelectEvent={(e) => setSelectedEvent(e)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: CENTRO DE CONTROL & OPERACIONES MUNICIPALES (Lazy Loaded) */}
        {activeTab === 'operaciones' && (
          <Suspense fallback={<DashboardCardSkeleton />}>
            <MunicipalOpsDashboard />
          </Suspense>
        )}

        {/* TAB 2: CALENDARIO (Lazy Loaded) */}
        {activeTab === 'calendario' && (
          <Suspense fallback={<CalendarSkeleton />}>
            <CalendarView
              categories={categories}
              events={events}
              savedEventIds={savedEventIds}
              userCategoryPreferences={currentUser?.preferencias_categorias || []}
              onToggleSave={handleToggleSave}
              onSelectEvent={(e) => setSelectedEvent(e)}
            />
          </Suspense>
        )}

        {/* TAB 3: EVENTOS (DIRECTORY) */}
        {activeTab === 'eventos' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Directorio de Eventos
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Filtra y explora las actividades por categoría, palabra clave o rango de fechas
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchEventText}
                    onChange={(e) => setSearchEventText(e.target.value)}
                    placeholder="Buscar evento, lugar u organizador..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Date Range Picker Bar */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <CalendarRange className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Filtrar por Rango Temporal:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'today', label: 'Hoy' },
                      { id: 'this_week', label: 'Esta Semana' },
                      { id: 'weekend', label: 'Fin de Semana' },
                      { id: 'this_month', label: 'Este Mes' },
                      { id: 'next_30', label: 'Próx. 30 Días' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyDatePreset(p.id as any)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all border ${
                          (!eventStartDate && !eventEndDate && p.id === 'all')
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}

                    {(eventStartDate || eventEndDate) && (
                      <button
                        onClick={() => handleApplyDatePreset('all')}
                        className="px-2 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-1 transition-all"
                        title="Limpiar filtro de fechas"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Limpiar</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Desde:</span>
                    <input
                      type="date"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      className="w-full text-xs bg-transparent text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Hasta:</span>
                    <input
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      className="w-full text-xs bg-transparent text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                <button
                  onClick={() => setSelectedCategoryFilter(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border whitespace-nowrap ${
                    selectedCategoryFilter === null
                      ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  Todas ({events.length})
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategoryFilter === cat.id_categoria;
                  const count = events.filter(e => e.id_categoria === cat.id_categoria).length;
                  return (
                    <button
                      key={cat.id_categoria}
                      onClick={() => setSelectedCategoryFilter(isSelected ? null : cat.id_categoria)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected ? 'text-white shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                      style={{
                        backgroundColor: isSelected ? cat.color : undefined,
                        borderColor: isSelected ? cat.color : undefined
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }} />
                      <span>{cat.nombre} ({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Event Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events
                .filter(e => {
                  if (selectedCategoryFilter && e.id_categoria !== selectedCategoryFilter) return false;
                  if (eventStartDate && e.fecha < eventStartDate) return false;
                  if (eventEndDate && e.fecha > eventEndDate) return false;
                  if (searchEventText.trim()) {
                    const q = searchEventText.toLowerCase();
                    return (
                      e.nombre.toLowerCase().includes(q) ||
                      e.lugar.toLowerCase().includes(q) ||
                      e.descripcion.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map((evt) => (
                  <EventCard
                    key={evt.id_evento}
                    evento={evt}
                    isSaved={savedEventIds.includes(evt.id_evento)}
                    onToggleSave={handleToggleSave}
                    onSelectEvent={(e) => setSelectedEvent(e)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: AVISOS (Lazy Loaded) */}
        {activeTab === 'avisos' && (
          <Suspense fallback={<DashboardCardSkeleton />}>
            <AvisosScreen
              notices={notices}
              currentUser={currentUser}
              onDeleteNotice={handleDeleteNotice}
              onOpenCreateNotice={() => setShowCreateNoticeModal(true)}
            />
          </Suspense>
        )}

        {/* TAB 5: NOTIFICACIONES (Lazy Loaded) */}
        {activeTab === 'notificaciones' && (
          <Suspense fallback={<DashboardCardSkeleton />}>
            <NotificationCenter
              notifications={notifications}
              savedEvents={savedEvents}
              onMarkRead={handleMarkNotifRead}
              onMarkAllRead={handleMarkAllNotifsRead}
              onNavigateToTab={setActiveTab}
              onSelectEvent={(e) => setSelectedEvent(e)}
              notificationService={eventNotifier}
            />
          </Suspense>
        )}

        {/* TAB 6: MI PERFIL (Lazy Loaded) */}
        {activeTab === 'perfil' && (
          <Suspense fallback={<DashboardCardSkeleton />}>
            <UserProfile
              currentUser={currentUser}
              categories={categories}
              savedEvents={savedEvents}
              onUpdatePreferences={handleUpdateUserPreferences}
              onToggleSave={handleToggleSave}
              onSelectEvent={(e) => setSelectedEvent(e)}
              onOpenAuth={() => openAuthWithTab('switch')}
              onLogout={handleLogoutUser}
            />
          </Suspense>
        )}

        {/* TAB 7: PANEL ORGANIZADOR (Lazy Loaded) */}
        {activeTab === 'panel-organizador' && (
          <Suspense fallback={<DashboardCardSkeleton />}>
            <OrganizerPanel
              currentUser={currentUser}
              categories={categories}
              myEvents={events.filter(e => {
                const myOrg = organizers.find(o => o.id_usuario === currentUser?.id_usuario);
                return myOrg ? e.id_organizador === myOrg.id_organizador : true;
              })}
              onCreateEvent={handleCreateEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </Suspense>
        )}

        {/* TAB 8: TURISMO & COMERCIO (Lazy Loaded) */}
        {activeTab === 'turismo' && (
          <Suspense fallback={<DashboardCardSkeleton />}>
            <TurismoComercioScreen
              onSelectEvent={(e) => setSelectedEvent(e)}
            />
          </Suspense>
        )}

        {/* TAB 9: PANEL ADMIN (Lazy Loaded with RBAC) */}
        {activeTab === 'panel-admin' && (
          <Suspense fallback={<DashboardCardSkeleton />}>
            {currentUser?.rol === 'administrador' ? (
              <AdminPanel
                stats={adminStats}
                events={events}
                notices={notices}
                users={users}
                organizers={organizers}
                categories={categories}
                onOpenCreateEvent={() => {
                  setActiveTab('panel-organizador');
                }}
                onOpenCreateNotice={() => setShowCreateNoticeModal(true)}
                onDeleteEvent={handleDeleteEvent}
                onDeleteNotice={handleDeleteNotice}
                onOpenDdl={() => setShowDdlModal(true)}
                onSendBroadcastNotification={handleSendBroadcastNotification}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto space-y-4 shadow-sm my-10">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Acceso Restringido &bull; Solo Administrador Municipal
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Las funciones de despacho de cuadrillas viales, emisión masiva de notificaciones, auditoría del sistema y publicación de avisos urgentes requieren permisos de Administrador Municipal.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => openAuthWithTab('switch')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow"
                  >
                    Cambiar a Cuenta Administrador
                  </button>
                  <button
                    onClick={() => setActiveTab('inicio')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                  >
                    Volver al Inicio
                  </button>
                </div>
              </div>
            )}
          </Suspense>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0D47A1] dark:bg-slate-950 text-blue-100 dark:text-slate-300 py-10 mt-16 border-t border-blue-900 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-blue-600 text-[#0D47A1] dark:text-white font-black text-lg flex items-center justify-center">
              P
            </div>
            <span className="text-xl font-black text-white">PurifiCalendario</span>
          </div>
          <p className="text-xs text-blue-200 dark:text-slate-400 max-w-lg mx-auto">
            Plataforma municipal para la organización y difusión de eventos culturales, deportivos, jornadas de salud pública y avisos de servicios comunitarios en Purificación, Tolima.
          </p>
          <div className="pt-4 border-t border-blue-800 dark:border-slate-800 text-[11px] text-blue-300 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>&copy; {new Date().getFullYear()} PurifiCalendario &bull; Municipio de Purificación, Tolima</span>
            <button
              onClick={() => setShowDdlModal(true)}
              className="text-[#64B5F6] font-semibold hover:underline"
            >
              Arquitectura Hexagonal & Base de Datos MySQL
            </button>
          </div>
        </div>
      </footer>

      {/* Lazy Loaded Modals */}
      {selectedEvent && (
        <EventDetailModal
          evento={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isSaved={savedEventIds.includes(selectedEvent.id_evento)}
          onToggleSave={handleToggleSave}
        />
      )}

      {showDdlModal && (
        <Suspense fallback={null}>
          <DatabaseInspectorModal onClose={() => setShowDdlModal(false)} />
        </Suspense>
      )}

      {showCreateNoticeModal && (
        <Suspense fallback={null}>
          <CreateNoticeModal
            onClose={() => setShowCreateNoticeModal(false)}
            onSubmit={handleCreateNotice}
          />
        </Suspense>
      )}

      {showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            currentUser={currentUser}
            allUsers={users}
            onSelectUser={handleSelectUser}
            onLoginUser={handleLoginUser}
            onRegisterUser={handleRegisterUser}
            onGoogleLogin={handleGoogleLogin}
            onLogoutUser={handleLogoutUser}
            initialTab={authModalTab}
          />
        </Suspense>
      )}

      {/* Emergency Helplines Directory Modal */}
      <EmergencyDirectoryModal
        isOpen={showEmergenciesModal}
        onClose={() => setShowEmergenciesModal(false)}
      />

      {/* Waste & Municipal Services Guide Modal */}
      <WasteAndServicesGuideModal
        isOpen={showServicesGuideModal}
        onClose={() => setShowServicesGuideModal(false)}
      />

      {/* PurifiGuía AI Civic Assistant Modal */}
      <PurifiGuiaAssistantModal
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Unified Floating Actions Menu */}
      <FloatingActionsMenu
        onOpenAssistant={() => setShowAssistantModal(true)}
        onOpenEmergencies={() => setShowEmergenciesModal(true)}
      />
    </div>
  );
}
