import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  MapPin, 
  Phone, 
  Bookmark, 
  Sparkles, 
  Check, 
  Save, 
  Trash2,
  Calendar,
  Trophy,
  LogOut,
  KeyRound,
  CheckCircle2,
  HardHat,
  BarChart3,
  Bell,
  Clock,
  Award
} from 'lucide-react';
import { Categoria, Evento, Usuario } from '../types';
import { EventCard } from './EventCard';
import { useOpsStore } from '../stores/useOpsStore';

interface UserProfileProps {
  currentUser: Usuario | null;
  categories: Categoria[];
  savedEvents: Evento[];
  onUpdatePreferences: (preferences: string[]) => void;
  onToggleSave: (idEvento: number) => void;
  onSelectEvent: (evento: Evento) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  categories,
  savedEvents,
  onUpdatePreferences,
  onToggleSave,
  onSelectEvent,
  onOpenAuth,
  onLogout
}) => {
  const [profileTab, setProfileTab] = useState<'guardados' | 'preferencias' | 'historial_civico' | 'seguridad'>('guardados');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentUser?.preferencias_categorias || []
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { userPoints, vias, notifiedUsers, encuestas } = useOpsStore();

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-fade-in text-center space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#0D47A1] to-[#2196F3] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <User className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Portal y Perfil Ciudadano
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Inicia sesión o regístrate en PurifiCalendario para guardar tus eventos, recibir alertas por barrio y ganar PurifiPuntos cívicos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md mx-auto">
            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-2xl bg-[#0D47A1] hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <User className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear Cuenta</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Beneficios de tu cuenta ciudadana:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Alertas de agua y luz por tu barrio</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Votación en consultas ciudadanas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Guardado de eventos y recordatorios</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Acumulación de PurifiPuntos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleCategory = (codigo: string) => {
    if (selectedCategories.includes(codigo)) {
      setSelectedCategories(selectedCategories.filter(c => c !== codigo));
    } else {
      setSelectedCategories([...selectedCategories, codigo]);
    }
  };

  const handleSavePreferences = () => {
    onUpdatePreferences(selectedCategories);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const myViasReportadas = vias.filter(v => v.reportado_por === currentUser.nombre_usuario || currentUser.rol === 'administrador');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Profile Header Hero Card */}
      <div className="bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#2196F3] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-[#0D47A1] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-blue-200 flex-shrink-0">
            {currentUser.nombre_usuario.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black">
                {currentUser.nombre_usuario}
              </h2>
              <span className={`font-extrabold text-xs px-3 py-1 rounded-full capitalize border ${
                currentUser.rol === 'administrador'
                  ? 'bg-amber-400 text-slate-900 border-amber-300'
                  : currentUser.rol === 'organizador'
                  ? 'bg-emerald-400 text-slate-900 border-emerald-300'
                  : 'bg-white text-blue-900 border-blue-200'
              }`}>
                {currentUser.rol}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100 mt-2 font-medium">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-300" />
                {currentUser.correo}
              </span>
              {currentUser.barrio && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-300" />
                  {currentUser.barrio}, Purificación
                </span>
              )}
              {currentUser.telefono && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-300" />
                  {currentUser.telefono}
                </span>
              )}
              <span className="flex items-center gap-1 opacity-80">
                <Clock className="w-3.5 h-3.5 text-blue-300" />
                Miembro desde: {currentUser.fecha_registro}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-10 w-full md:w-auto">
          {/* PurifiPuntos pill */}
          <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 flex items-center justify-between sm:justify-start gap-2 shadow-xs">
            <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
            <div>
              <p className="text-[10px] text-blue-200 font-bold uppercase">PurifiPuntos Cívicos</p>
              <p className="text-sm font-black text-white">{userPoints} PTS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 backdrop-blur-xs border border-white/30 flex-1 sm:flex-initial"
                title="Cambiar a otra cuenta o iniciar sesión"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Cambiar Cuenta</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm flex-1 sm:flex-initial"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl px-4 pt-2 gap-2 shadow-xs overflow-x-auto">
        <button
          onClick={() => setProfileTab('guardados')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            profileTab === 'guardados'
              ? 'border-[#2196F3] text-[#0D47A1] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span>Eventos Guardados ({savedEvents.length})</span>
        </button>

        <button
          onClick={() => setProfileTab('preferencias')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            profileTab === 'preferencias'
              ? 'border-[#2196F3] text-[#0D47A1] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#2196F3]" />
          <span>Preferencias de Alertas</span>
        </button>

        <button
          onClick={() => setProfileTab('historial_civico')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            profileTab === 'historial_civico'
              ? 'border-[#2196F3] text-[#0D47A1] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-500" />
          <span>Historial Cívico & Puntos</span>
        </button>
      </div>

      {/* TAB: GUARDADOS */}
      {profileTab === 'guardados' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" />
                Mis Eventos Guardados ({savedEvents.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Eventos favoritos que has marcado para asistir o agendar en Purificación.
              </p>
            </div>
          </div>

          {savedEvents.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aún no has guardado eventos</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Explora el calendario general y haz clic en el botón de estrella o marcador en cualquier actividad cultural, deportiva o comunitaria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedEvents.map(evt => (
                <EventCard
                  key={evt.id_evento}
                  evento={evt}
                  isSaved={true}
                  onToggleSave={onToggleSave}
                  onSelectEvent={onSelectEvent}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: PREFERENCIAS DE EVENTOS & NOTIFICACIONES */}
      {profileTab === 'preferencias' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2196F3]" />
                Personalizar Alertas e Intereses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configura qué tipos de eventos y comunicados oficiales deseas priorizar en tu vista.
              </p>
            </div>

            <button
              onClick={handleSavePreferences}
              className="px-5 py-2.5 rounded-xl bg-[#2196F3] hover:bg-[#0D47A1] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Preferencias Guardadas!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isChecked = selectedCategories.includes(cat.codigo);
              return (
                <div
                  key={cat.id_categoria}
                  onClick={() => toggleCategory(cat.codigo)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'border-[#2196F3] bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{cat.nombre}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{cat.descripcion}</p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-[#2196F3] border-[#2196F3] text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: HISTORIAL CÍVICO & PUNTOS */}
      {profileTab === 'historial_civico' && (
        <div className="space-y-6">
          
          {/* Puntos & Medallas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-amber-100">PurifiPuntos</span>
                <Trophy className="w-5 h-5 text-amber-200" />
              </div>
              <p className="text-3xl font-black">{userPoints}</p>
              <p className="text-[11px] text-amber-100">Nivel: Ciudadano Activo de Purificación</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Reportes Viales</span>
                <HardHat className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{myViasReportadas.length}</p>
              <p className="text-[11px] text-slate-500">Huecos y vías notificadas al municipio</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Avisos Verificados</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{notifiedUsers.length}</p>
              <p className="text-[11px] text-slate-500">Alertas urgentes confirmadas</p>
            </div>
          </div>

          {/* Actividades del Usuario */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Tus Aportes a la Comunidad de Purificación</span>
            </h4>

            {myViasReportadas.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aún no has registrado reportes viales. Puedes usar el mapa del Centro de Control para reportar baches o tramos en mal estado.
              </p>
            ) : (
              <div className="space-y-2">
                {myViasReportadas.map(v => (
                  <div key={v.id_via} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{v.titulo}</p>
                      <p className="text-[11px] text-slate-500">{v.barrio} &bull; {v.direccion}</p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded capitalize ${
                      v.estado === 'completado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.estado === 'reparacion'
                        ? 'bg-blue-100 text-blue-800'
                        : v.estado === 'inspeccion'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {v.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
