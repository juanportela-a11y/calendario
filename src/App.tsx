import React, { useEffect, useState } from 'react';
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
  Bell
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

// Components
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AvisosTicker } from './components/AvisosTicker';
import { CalendarView } from './components/CalendarView';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { AvisosScreen } from './components/AvisosScreen';
import { NotificationCenter } from './components/NotificationCenter';
import { UserProfile } from './components/UserProfile';
import { OrganizerPanel } from './components/OrganizerPanel';
import { AdminPanel } from './components/AdminPanel';
import { DatabaseInspectorModal } from './components/DatabaseInspectorModal';
import { CreateNoticeModal } from './components/CreateNoticeModal';
import { AuthModal } from './components/AuthModal';
import { MunicipalOpsDashboard } from './components/operations/MunicipalOpsDashboard';

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

  // Active User State
  const [currentUser, setCurrentUser] = useState<Usuario>({
    id_usuario: 1,
    nombre_usuario: 'Carlos Rodríguez',
    correo: 'habitante@purificacion.gov.co',
    rol: 'habitante',
    preferencias_categorias: ['cultura', 'deporte', 'servicios'],
    fecha_registro: '2026-01-15',
    barrio: 'El Centro'
  });

  // Modal Control States
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDdlModal, setShowDdlModal] = useState(false);
  const [showCreateNoticeModal, setShowCreateNoticeModal] = useState(false);

  // Event Directory Filters
  const [searchEventText, setSearchEventText] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);

  // Load initial data from backend API
  const loadAllData = async () => {
    try {
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

      // Load user specific data
      if (currentUser.id_usuario) {
        const [userNotifs, userSaved] = await Promise.all([
          ApiClientAdapter.getNotifications(currentUser.id_usuario),
          ApiClientAdapter.getSavedEvents(currentUser.id_usuario)
        ]);
        setNotifications(userNotifs);
        setSavedEvents(userSaved);
      }

      // Load admin stats if admin
      const stats = await ApiClientAdapter.getAdminStats();
      setAdminStats(stats);
    } catch (err) {
      console.error('Error cargando datos del servidor:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentUser.id_usuario]);

  // Saved Event IDs for quick check
  const savedEventIds = savedEvents.map(e => e.id_evento);

  // Handlers
  const handleToggleSave = async (idEvento: number) => {
    try {
      await ApiClientAdapter.toggleSaveEvent(currentUser.id_usuario, idEvento);
      const updatedSaved = await ApiClientAdapter.getSavedEvents(currentUser.id_usuario);
      setSavedEvents(updatedSaved);
    } catch (err) {
      console.error('Error al guardar evento:', err);
    }
  };

  const handleUpdateUserPreferences = async (preferences: string[]) => {
    try {
      const updatedUser = await ApiClientAdapter.updateUserPreferences(currentUser.id_usuario, preferences);
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error('Error actualizando preferencias:', err);
    }
  };

  const handleCreateEvent = async (dto: CreateEventoDTO) => {
    // Determine organizer ID for current user
    let orgId = 1;
    const myOrg = organizers.find(o => o.id_usuario === currentUser.id_usuario);
    if (myOrg) orgId = myOrg.id_organizador;

    await ApiClientAdapter.createEvent({ ...dto, id_organizador: orgId });
    await loadAllData();
  };

  const handleUpdateEvent = async (id: number, dto: Partial<CreateEventoDTO>) => {
    await ApiClientAdapter.updateEvent(id, dto);
    await loadAllData();
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este evento?')) {
      await ApiClientAdapter.deleteEvent(id);
      await loadAllData();
    }
  };

  const handleCreateNotice = async (dto: CreateAvisoDTO) => {
    await ApiClientAdapter.createNotice(dto, currentUser.id_usuario);
    await loadAllData();
  };

  const handleDeleteNotice = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este aviso?')) {
      await ApiClientAdapter.deleteNotice(id);
      await loadAllData();
    }
  };

  const handleMarkNotifRead = async (id: number) => {
    await ApiClientAdapter.markNotificationRead(id);
    const updatedNotifs = await ApiClientAdapter.getNotifications(currentUser.id_usuario);
    setNotifications(updatedNotifs);
  };

  const handleMarkAllNotifsRead = async () => {
    await ApiClientAdapter.markAllNotificationsRead(currentUser.id_usuario);
    const updatedNotifs = await ApiClientAdapter.getNotifications(currentUser.id_usuario);
    setNotifications(updatedNotifs);
  };

  const handleRegisterUser = async (data: Partial<Usuario>) => {
    const newUser = await ApiClientAdapter.loginOrCreateUser(data);
    setCurrentUser(newUser);
    await loadAllData();
  };

  const unreadNotifsCount = notifications.filter(n => !n.leida).length;

  return (
    <div className="min-h-screen bg-[#F0F6FF] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-[#2196F3] selection:text-white transition-colors duration-200">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        unreadCount={unreadNotifsCount}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenDdl={() => setShowDdlModal(true)}
        allUsers={users}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Urgent Notices Ticker */}
        <AvisosTicker
          notices={notices}
          onViewAll={() => setActiveTab('avisos')}
        />

        {/* TAB 1: INICIO (HOME SCREEN) */}
        {activeTab === 'inicio' && (
          <div className="space-y-10">
            {/* Hero Presentation */}
            <HeroBanner
              onExploreEvents={() => setActiveTab('calendario')}
              onExploreNotices={() => setActiveTab('avisos')}
              onExploreOperations={() => setActiveTab('operaciones')}
              totalEventsCount={events.length}
              totalNoticesCount={notices.length}
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

        {/* TAB: CENTRO DE CONTROL & OPERACIONES MUNICIPALES */}
        {activeTab === 'operaciones' && (
          <MunicipalOpsDashboard />
        )}

        {/* TAB 2: CALENDARIO */}
        {activeTab === 'calendario' && (
          <CalendarView
            categories={categories}
            events={events}
            savedEventIds={savedEventIds}
            userCategoryPreferences={currentUser.preferencias_categorias}
            onToggleSave={handleToggleSave}
            onSelectEvent={(e) => setSelectedEvent(e)}
          />
        )}

        {/* TAB 3: EVENTOS (DIRECTORY) */}
        {activeTab === 'eventos' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Directorio de Eventos
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Filtra y explora las actividades por categoría o palabra clave
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

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2">
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

        {/* TAB 4: AVISOS */}
        {activeTab === 'avisos' && (
          <AvisosScreen
            notices={notices}
            currentUser={currentUser}
            onDeleteNotice={handleDeleteNotice}
            onOpenCreateNotice={() => setShowCreateNoticeModal(true)}
          />
        )}

        {/* TAB 5: NOTIFICACIONES */}
        {activeTab === 'notificaciones' && (
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkNotifRead}
            onMarkAllRead={handleMarkAllNotifsRead}
          />
        )}

        {/* TAB 6: MI PERFIL */}
        {activeTab === 'perfil' && (
          <UserProfile
            currentUser={currentUser}
            categories={categories}
            savedEvents={savedEvents}
            onUpdatePreferences={handleUpdateUserPreferences}
            onToggleSave={handleToggleSave}
            onSelectEvent={(e) => setSelectedEvent(e)}
          />
        )}

        {/* TAB 7: PANEL ORGANIZADOR */}
        {activeTab === 'panel-organizador' && (
          <OrganizerPanel
            currentUser={currentUser}
            categories={categories}
            myEvents={events.filter(e => {
              const myOrg = organizers.find(o => o.id_usuario === currentUser.id_usuario);
              return myOrg ? e.id_organizador === myOrg.id_organizador : true;
            })}
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {/* TAB 8: PANEL ADMIN */}
        {activeTab === 'panel-admin' && (
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
          />
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

      {/* Modals */}
      {selectedEvent && (
        <EventDetailModal
          evento={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isSaved={savedEventIds.includes(selectedEvent.id_evento)}
          onToggleSave={handleToggleSave}
        />
      )}

      {showDdlModal && (
        <DatabaseInspectorModal onClose={() => setShowDdlModal(false)} />
      )}

      {showCreateNoticeModal && (
        <CreateNoticeModal
          onClose={() => setShowCreateNoticeModal(false)}
          onSubmit={handleCreateNotice}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          currentUser={currentUser}
          allUsers={users}
          onSelectUser={(u) => setCurrentUser(u)}
          onRegisterUser={handleRegisterUser}
        />
      )}
    </div>
  );
}
