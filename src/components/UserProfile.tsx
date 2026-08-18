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
  Calendar
} from 'lucide-react';
import { Categoria, Evento, Usuario } from '../types';
import { EventCard } from './EventCard';

interface UserProfileProps {
  currentUser: Usuario;
  categories: Categoria[];
  savedEvents: Evento[];
  onUpdatePreferences: (preferences: string[]) => void;
  onToggleSave: (idEvento: number) => void;
  onSelectEvent: (evento: Evento) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  categories,
  savedEvents,
  onUpdatePreferences,
  onToggleSave,
  onSelectEvent
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentUser.preferencias_categorias || []
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Profile Info Card */}
      <div className="bg-gradient-to-r from-[#0D47A1] to-[#2196F3] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-[#0D47A1] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-blue-200">
            {currentUser.nombre_usuario.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black">
                {currentUser.nombre_usuario}
              </h2>
              <span className="bg-amber-400 text-slate-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full capitalize">
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
            </div>
          </div>
        </div>
      </div>

      {/* Event Category Preferences Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2196F3]" />
              Mis Preferencias de Eventos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Selecciona los temas de tu interés para recibir notificaciones y filtrarlos en tu calendario.
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
                <span>Guardar Preferencias</span>
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

      {/* Saved Events Section (usuario_evento) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-500" />
              Mis Eventos Guardados ({savedEvents.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Eventos que has marcado como tus favoritos para asistir en Purificación.
            </p>
          </div>
        </div>

        {savedEvents.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aún no has guardado eventos</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explora el calendario y haz clic en "Guardar" en los eventos de tu interés.
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
    </div>
  );
};
