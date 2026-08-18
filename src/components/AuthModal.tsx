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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
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
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                        ? 'bg-blue-50 border-[#2196F3] shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0D47A1] text-white font-bold flex items-center justify-center text-xs">
                        {u.nombre_usuario.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{u.nombre_usuario}</p>
                        <p className="text-[11px] text-slate-500">{u.correo}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      u.rol === 'administrador'
                        ? 'bg-amber-100 text-amber-800'
                        : u.rol === 'organizador'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.rol}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative border-t border-slate-200 my-4 text-center">
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 absolute left-1/2 -translate-x-1/2 -top-2.5">
              O REGISTRA NUEVO USUARIO
            </span>
          </div>

          {/* New Account Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nombre Completo / Entidad
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. María Gómez / Comité de Salud"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#2196F3] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@purificacion.gov.co"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#2196F3] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tipo de Usuario (Rol)
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#2196F3] focus:outline-none bg-white"
                >
                  <option value="habitante">Habitante (Usuario)</option>
                  <option value="organizador">Organizador de Eventos</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Barrio
                </label>
                <input
                  type="text"
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  placeholder="Ej. El Centro"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#2196F3] focus:outline-none"
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
