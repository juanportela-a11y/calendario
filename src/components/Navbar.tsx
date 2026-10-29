import React from 'react';
import { 
  Calendar, 
  Bell, 
  User, 
  ShieldAlert, 
  PlusCircle, 
  Info, 
  Database,
  MapPin,
  Sparkles,
  Menu,
  X,
  Moon,
  Sun,
  Activity,
  HardHat,
  PhoneCall,
  Bot,
  Truck,
  Trophy,
  Store,
  Compass,
  ChevronDown,
  ChevronRight,
  Settings,
  Megaphone
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { UserRole, Usuario } from '../types';
import { useOpsStore } from '../stores/useOpsStore';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Usuario | null;
  setCurrentUser: (user: Usuario) => void;
  unreadCount: number;
  onOpenAuth: () => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onGoogleLogin?: (data: { email: string; name?: string; photoUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  onLogout?: () => void;
  onOpenDdl: () => void;
  allUsers: Usuario[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenEmergencies?: () => void;
  onOpenServicesGuide?: () => void;
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  unreadCount,
  onOpenAuth,
  onOpenLogin,
  onOpenRegister,
  onGoogleLogin,
  onLogout,
  onOpenDdl,
  allUsers,
  darkMode,
  onToggleDarkMode,
  onOpenEmergencies,
  onOpenServicesGuide,
  onOpenAssistant
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { userPoints } = useOpsStore();

  const handleGoogleQuickSignIn = async () => {
    setGoogleLoading(true);
    try {
      let userEmail = '';
      let userName = '';
      let userPhoto = '';

      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        userEmail = fbUser.email || '';
        userName = fbUser.displayName || '';
        userPhoto = fbUser.photoURL || '';
      } catch (popupErr) {
        console.warn('Google popup notice:', popupErr);
        // Do not auto-assign a random fallback user. Open the Auth modal so the user can enter their own account.
        if (onOpenLogin) onOpenLogin();
        else onOpenAuth();
        return;
      }

      if (!userEmail) {
        if (onOpenLogin) onOpenLogin();
        else onOpenAuth();
        return;
      }

      if (onGoogleLogin) {
        await onGoogleLogin({
          email: userEmail,
          name: userName,
          photoUrl: userPhoto
        });
      } else {
        const existing = allUsers.find(u => u.correo.toLowerCase() === userEmail.toLowerCase());
        if (existing) {
          setCurrentUser(existing);
        }
      }
    } catch (err) {
      console.error('Error Google quick sign in:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const getRoleBadge = (rol?: UserRole) => {
    switch (rol) {
      case 'administrador':
        return <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-semibold px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/60">Admin</span>;
      case 'organizador':
        return <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700/60">Organizador</span>;
      case 'habitante':
        return <span className="bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded border border-blue-300 dark:border-blue-700/60">Habitante</span>;
      default:
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">Invitado</span>;
    }
  };

  const desktopNavItems = [
    { id: 'inicio', label: 'Inicio', icon: Sparkles },
    { id: 'reportar', label: 'Reportar Falla', icon: Megaphone },
    { id: 'operaciones', label: 'Operaciones', icon: Activity },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'avisos', label: 'Avisos', icon: ShieldAlert },
  ];

  const mobileNavItems = [
    { id: 'inicio', label: 'Inicio', icon: Sparkles },
    { id: 'reportar', label: 'Reportar Falla', icon: Megaphone },
    { id: 'operaciones', label: 'Operaciones', icon: Activity },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'avisos', label: 'Avisos', icon: ShieldAlert },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell, badge: unreadCount },
    { id: 'perfil', label: 'Mi Perfil', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0b1329]/95 shadow-sm border-b border-blue-100 dark:border-blue-900/40 backdrop-blur-md transition-colors">
      {/* Barra de Navegación Principal Unificada */}
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2 lg:gap-3 min-w-0">
          
          {/* Brand Logo & Indicador 24/7 en Tiempo Real */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => setActiveTab('inicio')}
              title="Ir al inicio de PurifiCalendario"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0D47A1] to-[#2196F3] flex items-center justify-center text-white font-black text-lg shadow-sm border border-blue-300 dark:border-blue-500/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                P
              </div>
              <div>
                <div className="flex items-center gap-1 leading-tight">
                  <span className="text-lg font-black tracking-tight text-[#0D47A1] dark:text-blue-400">Purifi</span>
                  <span className="text-lg font-extrabold text-[#2196F3] dark:text-blue-300">Calendario</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                  <MapPin className="w-2.5 h-2.5 text-[#2196F3] flex-shrink-0" />
                  <span className="truncate">Purificación, Tolima</span>
                </div>
              </div>
            </div>

            {/* Indicador de Estado en Tiempo Real (24/7) */}
            <div 
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border transition-all shadow-2xs ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
              }`}
              title={isOnline ? 'Plataforma en línea 24/7 • Conexión activa en tiempo real' : 'Modo offline • Guardando cambios de forma local'}
            >
              <span className="relative flex h-2 w-2">
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="hidden sm:inline tracking-tight">{isOnline ? 'En línea' : 'Modo offline'}</span>
            </div>
          </div>

          {/* Desktop Navigation & Actions - Unified in the same nav bar */}
          <nav className="hidden lg:flex items-center justify-between gap-1.5 xl:gap-2 p-1 rounded-2xl bg-slate-100/90 dark:bg-[#111d3d]/90 border border-slate-200/80 dark:border-blue-900/60 backdrop-blur-md shadow-xs min-w-0 flex-1 max-w-fit">
            {/* Tabs de Navegación Principales */}
            <div className="flex items-center gap-1 xl:gap-1.5 min-w-0">
              {/* 1. Inicio */}
              <button
                onClick={() => setActiveTab('inicio')}
                className={`px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'inicio'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'inicio' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>Inicio</span>
              </button>

              {/* 2. Reportar Falla */}
              <button
                onClick={() => setActiveTab('reportar')}
                className={`px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'reportar' || activeTab === 'reportar-falla'
                    ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                    : 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60'
                }`}
                title="Reportar fallas de agua, alumbrado, basuras o vías (+30 PTS)"
              >
                <Megaphone className={`w-3.5 h-3.5 ${activeTab === 'reportar' || activeTab === 'reportar-falla' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span>Reportar Falla</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </button>

              {/* 3. Calendario */}
              <button
                onClick={() => setActiveTab('calendario')}
                className={`px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'calendario'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${activeTab === 'calendario' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>Calendario</span>
              </button>

              {/* 4. Operaciones */}
              <button
                onClick={() => setActiveTab('operaciones')}
                className={`px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'operaciones'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Activity className={`w-3.5 h-3.5 ${activeTab === 'operaciones' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>Operaciones</span>
              </button>

              {/* 5. Avisos */}
              <button
                onClick={() => setActiveTab('avisos')}
                className={`px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'avisos'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <ShieldAlert className={`w-3.5 h-3.5 ${activeTab === 'avisos' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Avisos</span>
              </button>

              {/* 6. Rutas de Aseo */}
              {onOpenServicesGuide && (
                <button
                  onClick={onOpenServicesGuide}
                  className="px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent"
                  title="Horarios EMPOPUR de Recolección de Aseo y Guía de Trámites"
                >
                  <Truck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="hidden xl:inline">Rutas de Aseo</span>
                  <span className="xl:hidden">Aseo</span>
                </button>
              )}

              {/* 7. Paneles Especiales según Rol */}
              {currentUser?.rol === 'organizador' && (
                <button
                  onClick={() => setActiveTab('panel-organizador')}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'panel-organizador'
                      ? 'bg-emerald-600 text-white shadow-xs border border-emerald-600'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Organizador</span>
                </button>
              )}

              {currentUser?.rol === 'administrador' && (
                <button
                  onClick={() => setActiveTab('panel-admin')}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'panel-admin'
                      ? 'bg-blue-900 text-white shadow-xs border border-blue-700'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-800'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Admin</span>
                </button>
              )}
            </div>

            {/* Separador vertical sutil entre pestañas y controles */}
            <div className="w-px h-6 bg-slate-300/80 dark:bg-slate-700/80 mx-1 flex-shrink-0" />

            {/* Acciones de Usuario, Puntos y Controles Integrados */}
            <div className="flex items-center gap-1.5 xl:gap-2 flex-shrink-0">
              {/* Acceso a Base de Datos */}
              <button
                type="button"
                onClick={onOpenDdl}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-blue-200/80 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                title="Ver Esquema MySQL y Arquitectura Hexagonal"
              >
                <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden xl:inline">Base de Datos</span>
                <span className="xl:hidden">BD</span>
              </button>

              {/* PurifiPuntos Cívicos */}
              <button
                type="button"
                onClick={() => setActiveTab('operaciones')}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-black shadow-2xs whitespace-nowrap ${
                  activeTab === 'operaciones'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-300'
                }`}
                title="PurifiPuntos Cívicos y Recompensas Ciudadanas"
              >
                <Trophy className={`w-3.5 h-3.5 ${activeTab === 'operaciones' ? 'text-white' : 'text-amber-500'}`} />
                <span>{currentUser ? `${userPoints} PTS` : 'Puntos'}</span>
              </button>

              {/* Botón Prominente Modo Día / Noche */}
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer shadow-2xs text-xs font-black select-none whitespace-nowrap ${
                  darkMode
                    ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/40 text-cyan-200 shadow-[0_0_12px_rgba(56,189,248,0.25)] hover:border-cyan-400'
                    : 'bg-gradient-to-r from-amber-50 to-orange-50/80 border-amber-200 text-amber-900 hover:border-amber-300 hover:shadow-xs'
                }`}
                title={darkMode ? 'Modo Noche activo • Clic para Modo Día' : 'Modo Día activo • Clic para Modo Noche'}
              >
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                    darkMode
                      ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white'
                      : 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white'
                  }`}
                >
                  {darkMode ? <Moon className="w-2.5 h-2.5 fill-indigo-200 text-white" /> : <Sun className="w-2.5 h-2.5 text-white" />}
                </div>
                <span>{darkMode ? 'Noche' : 'Día'}</span>
              </button>

              {/* Notificaciones Cívicas */}
              <button
                type="button"
                onClick={() => setActiveTab('notificaciones')}
                className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'notificaciones'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700'
                }`}
                title="Notificaciones cívicas"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Perfil de Usuario o Autenticación */}
              {currentUser ? (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setActiveTab('perfil')}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                      activeTab === 'perfil'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-500 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                    title={`Ver Mi Perfil (${currentUser.nombre_usuario}) - Clic para ver perfil y ajustes`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-black flex items-center justify-center text-[11px] shadow-2xs flex-shrink-0">
                      {currentUser.nombre_usuario.charAt(0).toUpperCase()}
                    </div>
                    <div className="max-w-[75px] xl:max-w-[100px]">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate leading-tight">
                        {currentUser.nombre_usuario}
                      </span>
                      <div className="mt-0.5">
                        {getRoleBadge(currentUser.rol)}
                      </div>
                    </div>
                  </button>

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-all cursor-pointer"
                      title="Cerrar sesión"
                    >
                      <span className="sr-only">Cerrar sesión</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                /* Joined Connected Auth Button Group */
                <div className="inline-flex items-center rounded-xl shadow-2xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 overflow-hidden flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleGoogleQuickSignIn}
                    disabled={googleLoading}
                    className="px-2 xl:px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Acceder con Google"
                  >
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Google</span>
                  </button>
                  
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                  <button
                    onClick={onOpenLogin || onOpenAuth}
                    className="px-2.5 xl:px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
                    title="Iniciar Sesión"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Iniciar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile / Tablet Menu Button & Quick Actions */}
          <div className="lg:hidden flex items-center gap-1.5 flex-shrink-0">
            {/* Quick Google Login on Mobile if not logged in */}
            {!currentUser && (
              <button
                type="button"
                onClick={handleGoogleQuickSignIn}
                disabled={googleLoading}
                className="px-2 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                title="Acceder con Google"
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span className="text-[11px]">Google</span>
              </button>
            )}

            {/* Quick Notif Bell on Mobile */}
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`relative p-2 rounded-xl border transition-all ${
                activeTab === 'notificaciones'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300'
              }`}
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick Points on Mobile */}
            <div className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 flex items-center gap-1 text-xs font-black">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>{userPoints}</span>
            </div>

            {/* Dark Mode on Mobile */}
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-800 text-cyan-300 border-indigo-500/40 shadow-xs'
                  : 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs'
              }`}
              title={darkMode ? 'Cambiar a modo claro (Día)' : 'Cambiar a modo oscuro (Noche)'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-700" />}
            </button>

            {/* Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Active for mobile and tablet < 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {currentUser ? (
            <div className="p-3 bg-blue-50 dark:bg-slate-800/80 rounded-xl mb-2 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.nombre_usuario}</p>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                    🏆 {userPoints} PTS
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{currentUser.correo}</p>
              </div>
              {getRoleBadge(currentUser.rol)}
            </div>
          ) : (
            <div className="p-3 bg-blue-50 dark:bg-slate-800/80 rounded-2xl mb-2 space-y-2 border border-blue-100 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Acceso Ciudadano Purificación</p>
              
              <button
                type="button"
                onClick={() => {
                  handleGoogleQuickSignIn();
                  setMobileMenuOpen(false);
                }}
                disabled={googleLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-650 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 font-bold text-xs shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Continuar con Google</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (onOpenLogin) onOpenLogin();
                    else onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs text-center shadow-xs"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    if (onOpenRegister) onOpenRegister();
                    else onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs"
                >
                  Registrarse
                </button>
              </div>
            </div>
          )}

          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white font-bold shadow-xs' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {currentUser?.rol === 'organizador' && (
            <button
              onClick={() => {
                setActiveTab('panel-organizador');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white flex items-center gap-2 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Panel de Organizador</span>
            </button>
          )}

          {currentUser?.rol === 'administrador' && (
            <button
              onClick={() => {
                setActiveTab('panel-admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold bg-[#0D47A1] text-white flex items-center gap-2 shadow-xs"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Panel de Administración</span>
            </button>
          )}

          {onOpenAssistant && (
            <button
              onClick={() => {
                onOpenAssistant();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-800/80 text-blue-700 dark:text-blue-300 flex items-center justify-between border border-blue-200/80 dark:border-blue-900/60 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Asistente Virtual PurifiGuía</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}

          {onOpenServicesGuide && (
            <button
              onClick={() => {
                onOpenServicesGuide();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 flex items-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Rutas de Aseo & Trámites</span>
            </button>
          )}

          {/* Mobile Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            type="button"
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
              darkMode
                ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/40 text-indigo-100 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]'
                : 'bg-gradient-to-r from-amber-50 to-orange-50/70 border-amber-200 text-amber-950 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                darkMode ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white shadow-xs'
              }`}>
                {darkMode ? <Moon className="w-3.5 h-3.5 fill-indigo-200" /> : <Sun className="w-3.5 h-3.5" />}
              </div>
              <div>
                <span className="block font-black">{darkMode ? 'Modo Nocturno Activo' : 'Modo Diurno Activo'}</span>
                <span className="text-[10px] opacity-75 font-normal">{darkMode ? 'Atmósfera cívica neón' : 'Contraste diurno'}</span>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full p-0.5 flex items-center border ${
              darkMode ? 'bg-indigo-900/90 border-indigo-400/50 justify-end' : 'bg-amber-200 border-amber-300 justify-start'
            }`}>
              <div className="w-4 h-4 rounded-full bg-white shadow-xs flex items-center justify-center text-[8px]">
                {darkMode ? '🌙' : '☀️'}
              </div>
            </div>
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {currentUser ? (
              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-600 dark:text-red-400 font-semibold cursor-pointer"
              >
                Cerrar Sesión
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold cursor-pointer"
              >
                Acceder / Registrarse
              </button>
            )}
            <button
              onClick={() => {
                onOpenDdl();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-slate-500 dark:text-slate-400 font-medium underline cursor-pointer"
            >
              Ver BD MySQL
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
