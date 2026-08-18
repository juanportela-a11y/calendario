import React, { useState } from 'react';
import { X, User, Mail, Shield, Lock, Building2, CheckCircle2 } from 'lucide-react';
import { UserRole, Usuario } from '../types';

interface AuthModalProps {
  onClose: () => void;
  currentUser: Usuario;
  allUsers: Usuario[];
  onSelectUser: (user: Usuario) => void;
  onRegisterUser: (data: Partial<Usuario>) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onRegisterUser
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState<UserRole>('habitante');
  const [barrio, setBarrio] = useState('El Centro');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onRegisterUser({
        nombre_usuario: nombre,
        correo,
        rol,
        barrio,
        preferencias_categorias: ['cultura', 'deporte', 'servicios']
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-gradient-to-r from-[#0D47A1] to-[#2196F3] text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">Acceso a PurifiCalendario</h3>
            <p className="text-xs text-blue-100">Selecciona o registra tu cuenta de usuario</p>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Quick Demo Switcher Section */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Iniciar Sesión Rápida con Perfil Demo:
            </p>

            <div className="space-y-2">
              {allUsers.map((u) => {
                const isCurrent = u.id_usuario === currentUser.id_usuario;
                return (
                  <div
                    key={u.id_usuario}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-[#2196F3] shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0D47A1] text-white font-bold flex items-center justify-center text-xs">
                        {u.nombre_usuario.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{u.nombre_usuario}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.correo}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      u.rol === 'administrador'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : u.rol === 'organizador'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}>
                      {u.rol}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative border-t border-slate-200 dark:border-slate-800 my-4 text-center">
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 absolute left-1/2 -translate-x-1/2 -top-2.5">
              O REGISTRA NUEVO USUARIO
            </span>
          </div>

          {/* New Account Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Nombre Completo / Entidad
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. María Gómez / Comité de Salud"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@purificacion.gov.co"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Tipo de Usuario (Rol)
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                >
                  <option value="habitante">Habitante (Usuario)</option>
                  <option value="organizador">Organizador de Eventos</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Barrio
                </label>
                <input
                  type="text"
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  placeholder="Ej. El Centro"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#2196F3] hover:bg-[#0D47A1] text-white text-xs font-bold shadow-sm transition-all mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta e Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
