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
  X
} from 'lucide-react';
import { UserRole, Usuario } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Usuario;
  setCurrentUser: (user: Usuario) => void;
  unreadCount: number;
  onOpenAuth: () => void;
  onOpenDdl: () => void;
  allUsers: Usuario[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  unreadCount,
  onOpenAuth,
  onOpenDdl,
  allUsers
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const getRoleBadge = (rol: UserRole) => {
    switch (rol) {
      case 'administrador':
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded border border-amber-300">Admin</span>;
      case 'organizador':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-300">Organizador</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded border border-blue-300">Habitante</span>;
    }
  };

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Sparkles },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'avisos', label: 'Avisos Important.', icon: ShieldAlert },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell, badge: unreadCount },
    { id: 'perfil', label: 'Mi Perfil', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-blue-100">
      {/* Top Municipal Identity Bar */}
      <div className="bg-[#0D47A1] text-white py-1.5 px-4 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#64B5F6]" />
          <span>Purificación, Tolima &bull; La Villa de las Palmas</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenDdl}
            className="flex items-center gap-1 text-blue-100 hover:text-white transition-colors bg-blue-950/60 px-2 py-0.5 rounded text-[11px]"
            title="Ver Arquitectura Hexagonal y Esquema MySQL"
          >
            <Database className="w-3 h-3 text-[#64B5F6]" />
            <span>Base de Datos (MySQL)</span>
          </button>
          
          {/* Quick Role Switcher for instant testing */}
          <div className="hidden md:flex items-center gap-1 bg-blue-900/80 px-2 py-0.5 rounded text-[11px]">
            <span className="text-blue-200">Probar como:</span>
            {allUsers.map(u => (
              <button
                key={u.id_usuario}
                onClick={() => setCurrentUser(u)}
                className={`px-1.5 py-0.5 rounded text-[10px] capitalize transition-all ${
                  currentUser.id_usuario === u.id_usuario
                    ? 'bg-[#2196F3] text-white font-bold shadow'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                {u.rol}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('inicio')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D47A1] to-[#2196F3] flex items-center justify-center text-white font-black text-xl shadow-md border border-blue-300">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#0D47A1]">Purifi</span>
                <span className="text-xl font-extrabold text-[#2196F3]">Calendario</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-1">
                Agenda Oficial y Avisos Comunitarios
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-50 text-[#0D47A1] border border-blue-200'
                      : 'text-slate-600 hover:text-[#0D47A1] hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2196F3]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Special Role Panels Buttons */}
            {currentUser.rol === 'organizador' && (
              <button
                onClick={() => setActiveTab('panel-organizador')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'panel-organizador'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Panel Organizador</span>
              </button>
            )}

            {currentUser.rol === 'administrador' && (
              <button
                onClick={() => setActiveTab('panel-admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'panel-admin'
                    ? 'bg-[#0D47A1] text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}
          </nav>

          {/* User Profile & Auth Trigger */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#2196F3] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {currentUser.nombre_usuario.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {currentUser.nombre_usuario}
                  </span>
                  {getRoleBadge(currentUser.rol)}
                </div>
                <span className="text-[11px] text-slate-500">{currentUser.correo}</span>
              </div>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="p-3 bg-blue-50 rounded-xl mb-2 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-900">{currentUser.nombre_usuario}</p>
              <p className="text-xs text-slate-600">{currentUser.correo}</p>
            </div>
            {getRoleBadge(currentUser.rol)}
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === item.id ? 'bg-[#2196F3] text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
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

          {currentUser.rol === 'organizador' && (
            <button
              onClick={() => {
                setActiveTab('panel-organizador');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 text-white flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Panel de Organizador</span>
            </button>
          )}

          {currentUser.rol === 'administrador' && (
            <button
              onClick={() => {
                setActiveTab('panel-admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold bg-[#0D47A1] text-white flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Panel de Administración</span>
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-blue-600 font-semibold"
            >
              Cambiar cuenta / Iniciar Sesión
            </button>
            <button
              onClick={() => {
                onOpenDdl();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-slate-500 font-medium underline"
            >
              Ver BD MySQL
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
