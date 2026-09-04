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
  const [utilsMenuOpen, setUtilsMenuOpen] = React.useState(false);
  const [navMenuOpen, setNavMenuOpen] = React.useState(false);
  const utilsRef = React.useRef<HTMLDivElement>(null);
  const navMenuRef = React.useRef<HTMLDivElement>(null);

  // Close menus on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (utilsRef.current && !utilsRef.current.contains(event.target as Node)) {
        setUtilsMenuOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setNavMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    { id: 'turismo', label: 'Turismo', icon: Store },
    { id: 'avisos', label: 'Avisos', icon: ShieldAlert },
  ];

  const mobileNavItems = [
    { id: 'inicio', label: 'Inicio', icon: Sparkles },
    { id: 'reportar', label: 'Reportar Falla', icon: Megaphone },
    { id: 'operaciones', label: 'Operaciones', icon: Activity },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'turismo', label: 'Turismo', icon: Store },
    { id: 'avisos', label: 'Avisos', icon: ShieldAlert },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell, badge: unreadCount },
    { id: 'perfil', label: 'Mi Perfil', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 shadow-sm border-b border-blue-100 dark:border-slate-800 transition-colors backdrop-blur-md">
      {/* Top Municipal Identity Bar */}
      <div className="bg-[#0D47A1] dark:bg-slate-950 text-white py-1.5 px-3 sm:px-6 lg:px-8 text-xs font-medium border-b border-blue-900 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#64B5F6] flex-shrink-0" />
            <span className="truncate">Purificación, Tolima &bull; La Villa de las Palmas</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={onOpenDdl}
              className="flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors bg-blue-950/70 hover:bg-blue-900 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border border-blue-800/60 dark:border-slate-700 shadow-2xs"
              title="Ver Arquitectura Hexagonal y Esquema MySQL"
            >
              <Database className="w-3.5 h-3.5 text-[#64B5F6]" />
              <span>Base de Datos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 lg:gap-3 min-w-0">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0" 
            onClick={() => setActiveTab('inicio')}
            title="Ir al inicio de PurifiCalendario"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0D47A1] to-[#2196F3] flex items-center justify-center text-white font-black text-lg shadow-sm border border-blue-300 dark:border-blue-500/30 flex-shrink-0">
              P
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black tracking-tight text-[#0D47A1] dark:text-blue-400">Purifi</span>
                <span className="text-lg font-extrabold text-[#2196F3] dark:text-blue-300">Calendario</span>
              </div>
              <p className="hidden xl:block text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 leading-tight">
                Agenda Oficial y Avisos Comunitarios
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links & Organized Menu */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-md shadow-xs flex-shrink min-w-0">
            {/* 1. Inicio */}
            <button
              onClick={() => setActiveTab('inicio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'inicio'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700/80'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'inicio' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span>Inicio</span>
            </button>

            {/* 2. Menú Desplegable Completo de Secciones (Incluye Reportar Falla) */}
            <div className="relative" ref={navMenuRef}>
              <button
                type="button"
                onClick={() => setNavMenuOpen(!navMenuOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  navMenuOpen || ['reportar', 'reportar-falla', 'calendario', 'operaciones', 'turismo', 'avisos', 'panel-organizador', 'panel-admin'].includes(activeTab)
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700/60'
                }`}
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Menú de Servicios</span>
                {activeTab === 'reportar' && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full">
                    Fallas
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${navMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Categorized Mega Dropdown Menu */}
              {navMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* Destacado: Reportar Falla Ciudadana */}
                  <div className="pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-1">
                      Atención Ciudadana
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab('reportar');
                        setNavMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'reportar' || activeTab === 'reportar-falla'
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-blue-50/90 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === 'reportar' ? 'bg-white/20 text-white' : 'bg-[#2563EB] text-white shadow-xs'}`}>
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="block font-black">Reportar Falla</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          </div>
                          <span className={`text-[10px] font-normal ${activeTab === 'reportar' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            Agua, luz, aseo o vías dañadas (+30 pts)
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </div>

                  {/* Categoría: Agenda & Eventos */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-1">
                      Comunidad & Eventos
                    </span>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('calendario');
                          setNavMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeTab === 'calendario'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="block font-black">Calendario de Eventos</span>
                            <span className="text-[10px] text-slate-400 font-normal">Festividades, talleres y ferias</span>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('avisos');
                          setNavMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeTab === 'avisos'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="block font-black">Avisos Oficiales</span>
                            <span className="text-[10px] text-slate-400 font-normal">Comunicados y alertas alcaldía</span>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('turismo');
                          setNavMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeTab === 'turismo'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="block font-black">Turismo & Directorio</span>
                            <span className="text-[10px] text-slate-400 font-normal">Comercios, gastronomía y sitios</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Categoría: Operaciones & Servicios Públicos */}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-1">
                      Servicios Cívicos & Operaciones
                    </span>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('operaciones');
                          setNavMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeTab === 'operaciones'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="block font-black">Centro de Operaciones</span>
                            <span className="text-[10px] text-slate-400 font-normal">Monitoreo y mapa de incidencias</span>
                          </div>
                        </div>
                      </button>

                      {onOpenServicesGuide && (
                        <button
                          onClick={() => {
                            onOpenServicesGuide();
                            setNavMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <span className="block font-black">Rutas de Aseo & Trámites</span>
                              <span className="text-[10px] text-slate-400 font-normal">Horarios EMPOPUR y trámites</span>
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Categoría: Paneles Especiales según Rol */}
                  {(currentUser?.rol === 'organizador' || currentUser?.rol === 'administrador') && (
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-1">
                        Gestión & Administración
                      </span>
                      {currentUser?.rol === 'organizador' && (
                        <button
                          onClick={() => {
                            setActiveTab('panel-organizador');
                            setNavMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'panel-organizador'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" />
                            <span>Panel de Organizador</span>
                          </div>
                        </button>
                      )}
                      {currentUser?.rol === 'administrador' && (
                        <button
                          onClick={() => {
                            setActiveTab('panel-admin');
                            setNavMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'panel-admin'
                              ? 'bg-blue-900 text-white'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Panel de Administración</span>
                          </div>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          </nav>

          {/* User Profile, Unified Menu & Auth Container */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {/* PurifiPuntos Cívicos por fuera */}
            <button
              type="button"
              onClick={() => setActiveTab('operaciones')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-black shadow-2xs ${
                activeTab === 'operaciones'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-300'
              }`}
              title="PurifiPuntos Cívicos y Recompensas Ciudadanas"
            >
              <Trophy className={`w-3.5 h-3.5 ${activeTab === 'operaciones' ? 'text-white' : 'text-amber-500'}`} />
              <span>{currentUser ? `${userPoints} PTS` : 'Puntos Cívicos'}</span>
            </button>

            {/* Menú de Herramientas Cívicas y Servicios Municipales */}
            <div className="relative" ref={utilsRef}>
              <button
                type="button"
                onClick={() => setUtilsMenuOpen(!utilsMenuOpen)}
                className={`relative px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs text-xs font-bold ${
                  utilsMenuOpen
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700'
                }`}
                title="Herramientas Cívicas, Notificaciones y Ajustes"
              >
                <Sparkles className={`w-3.5 h-3.5 ${utilsMenuOpen ? 'text-cyan-200' : 'text-blue-600 dark:text-blue-400'}`} />
                <span>Herramientas</span>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${utilsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Utilities Dropdown Menu */}
              {utilsMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      Herramientas & Ajustes
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>

                  {/* 1. Asistente Virtual PurifiGuía */}
                  {onOpenAssistant && (
                    <button
                      onClick={() => {
                        onOpenAssistant();
                        setUtilsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-800/80 hover:from-blue-100 hover:to-indigo-100 text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                          <Bot className="w-4 h-4 text-cyan-200" />
                        </div>
                        <div className="text-left">
                          <span className="block font-black">PurifiGuía IA</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Asistente de eventos y trámites</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Activo
                      </span>
                    </button>
                  )}

                  {/* 2. Rutas de Aseo & Trámites */}
                  {onOpenServicesGuide && (
                    <button
                      onClick={() => {
                        onOpenServicesGuide();
                        setUtilsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                          <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <span className="block font-bold">Rutas de Aseo & Servicios</span>
                          <span className="text-[10px] text-slate-400 font-normal">Horarios EMPUR y trámites</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">&rarr;</span>
                    </button>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                  {/* 3. Notificaciones */}
                  <button
                    onClick={() => {
                      setActiveTab('notificaciones');
                      setUtilsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'notificaciones'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-blue-500" />
                      </div>
                      <span>Notificaciones</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                      {unreadCount > 0 ? `${unreadCount} nuevas` : 'Ver'}
                    </span>
                  </button>

                  {/* 4. Modo Claro / Oscuro */}
                  <button
                    onClick={onToggleDarkMode}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        {darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      </div>
                      <span>Tema {darkMode ? 'Oscuro' : 'Claro'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {darkMode ? 'Noche' : 'Día'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile / Joined Auth Action Group */}
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
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-black flex items-center justify-center text-xs shadow-2xs flex-shrink-0">
                    {currentUser.nombre_usuario.charAt(0).toUpperCase()}
                  </div>
                  <div className="max-w-[85px] xl:max-w-[115px]">
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
                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-all cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <span className="sr-only">Cerrar sesión</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Acceder con Google"
                >
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Google</span>
                </button>
                
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                <button
                  onClick={onOpenLogin || onOpenAuth}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                  title="Iniciar Sesión"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
              </div>
            )}
          </div>

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
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Alternar modo oscuro"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
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
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Rutas de Aseo & Trámites</span>
            </button>
          )}

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
