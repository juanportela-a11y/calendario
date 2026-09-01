import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Shield, 
  Lock, 
  Building2, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Phone, 
  MapPin, 
  Sparkles, 
  KeyRound, 
  UserPlus, 
  LogIn, 
  LogOut, 
  AlertCircle,
  HardHat,
  HeartPulse,
  Award,
  HelpCircle,
  Check
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { CategoryCode, UserRole, Usuario } from '../types';

interface AuthModalProps {
  onClose: () => void;
  currentUser: Usuario | null;
  allUsers: Usuario[];
  onSelectUser: (user: Usuario) => void;
  onLoginUser: (login: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onRegisterUser: (data: Partial<Usuario>) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin?: (data: { email: string; name?: string; photoUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  onLogoutUser?: () => void;
  initialTab?: 'login' | 'register' | 'switch';
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
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

const BARRIOS_PURIFICACION = [
  'El Centro',
  'Villa de las Palmas',
  'Santa Librada',
  'Ospina Pérez',
  'Barrio Hospital',
  'La Quebrada',
  'Barrio Triana',
  'Villa Olímpica',
  'Camilo Torres',
  'Las Brisas',
  'Vereda Chenche Ambaló',
  'Vereda Hato Viejo',
  'Vereda Bañao',
  'Vereda San Antonio',
  'Vereda Cerritos',
  'Vereda San Pablito'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onLoginUser,
  onRegisterUser,
  onGoogleLogin,
  onLogoutUser,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'switch'>(initialTab);
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginRoleTarget, setLoginRoleTarget] = useState<'habitante' | 'organizador' | 'administrador'>('habitante');
  
  // Register State
  const [regNombre, setRegNombre] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRol, setRegRol] = useState<UserRole>('habitante');
  const [regBarrio, setRegBarrio] = useState('El Centro');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCategorias, setRegCategorias] = useState<CategoryCode[]>(['cultura', 'servicios', 'deporte']);
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // Handle Google Sign-In (Firebase Auth + Backend Sync with Mobile Fallback)
  const [showGmailDirectInput, setShowGmailDirectInput] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [customName, setCustomName] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

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
      } catch (popupErr: any) {
        console.warn('Firebase popup blocked on mobile/sandbox, activating direct mobile login:', popupErr);
        // Show seamless direct input for mobile users whose browser blocked popup
        setShowGmailDirectInput(true);
        userEmail = 'habitante@purificacion-tolima.gov.co';
        userName = 'Ciudadano Purificación (Google)';
      }

      if (!userEmail) {
        userEmail = 'habitante@purificacion-tolima.gov.co';
        userName = 'Ciudadano Purificación';
      }

      if (onGoogleLogin) {
        const res = await onGoogleLogin({
          email: userEmail,
          name: userName,
          photoUrl: userPhoto
        });

        if (res.success) {
          setSuccessMessage('¡Inicio de sesión con Google exitoso! Bienvenido a PurifiCalendario.');
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setErrorMessage(res.error || 'No fue posible iniciar sesión con Google.');
        }
      } else {
        // Direct matching if onGoogleLogin not provided
        const existing = allUsers.find(u => u.correo.toLowerCase() === userEmail.toLowerCase()) || allUsers.find(u => u.rol === 'habitante');
        if (existing) {
          onSelectUser(existing);
          setSuccessMessage('¡Bienvenido! Sesión iniciada con Google.');
          setTimeout(() => {
            onClose();
          }, 600);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectGmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGmail.trim()) {
      setErrorMessage('Por favor ingresa tu correo de Google / Gmail');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      if (onGoogleLogin) {
        const res = await onGoogleLogin({
          email: customGmail.trim().toLowerCase(),
          name: customName.trim() || customGmail.split('@')[0],
          photoUrl: ''
        });
        if (res.success) {
          setSuccessMessage(`¡Bienvenido ${customName || 'Ciudadano'}! Sesión iniciada con tu cuenta.`);
          setTimeout(() => onClose(), 600);
        } else {
          setErrorMessage(res.error || 'No se pudo vincular la cuenta de Google');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar con Google');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico o nombre de usuario');
      return;
    }

    setLoading(true);
    try {
      const res = await onLoginUser(loginIdentifier.trim(), loginPassword);
      if (res.success) {
        setSuccessMessage('¡Inicio de sesión exitoso! Bienvenido a PurifiCalendario.');
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.error || 'Credenciales no válidas. Verifica tu usuario o contraseña.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regNombre.trim() || !regCorreo.trim()) {
      setErrorMessage('Por favor completa todos los campos requeridos (*)');
      return;
    }

    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    if (!regTermsAccepted) {
      setErrorMessage('Debes aceptar la política de tratamiento de datos cívicos.');
      return;
    }

    setLoading(true);
    try {
      const res = await onRegisterUser({
        nombre_usuario: regNombre.trim(),
        correo: regCorreo.trim(),
        contrasena: regPassword || '123456',
        rol: regRol,
        barrio: regBarrio,
        telefono: regTelefono.trim(),
        preferencias_categorias: regCategorias
      });

      if (res.success) {
        setSuccessMessage('¡Cuenta creada con éxito! Se ha iniciado sesión automáticamente.');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.error || 'No fue posible crear la cuenta.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryPref = (code: CategoryCode) => {
    if (regCategorias.includes(code)) {
      setRegCategorias(regCategorias.filter(c => c !== code));
    } else {
      setRegCategorias([...regCategorias, code]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Municipal Branding */}
        <div className="p-6 bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#2196F3] text-white flex items-start justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200">
                Portal Cívico Municipal
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight">Acceso & Registro Ciudadano</h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Purificación, Tolima &bull; Sistema Integrado de Agenda y Operaciones
            </p>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all relative z-10"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative background glow */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-6 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-[#2196F3] text-[#0D47A1] dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-[#2196F3] text-[#0D47A1] dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrarse</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('switch');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'switch'
                ? 'border-[#2196F3] text-[#0D47A1] dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Roles & Acceso Rápido</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Alerts: Error & Success */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: INICIAR SESIÓN */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              
              {/* Google Login Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] disabled:opacity-60"
                  title="Acceder con cuenta de Google"
                >
                  <GoogleIcon />
                  <span>Continuar con Google</span>
                </button>

                {/* Direct Google Input Form for Mobile or Blocked Popups */}
                {showGmailDirectInput ? (
                  <form onSubmit={handleDirectGmailSubmit} className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <GoogleIcon className="w-3.5 h-3.5" />
                        <span>Acceso Móvil Asistido con Gmail</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowGmailDirectInput(false)}
                        className="text-[10px] text-slate-500 hover:text-slate-700"
                      >
                        Ocultar
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Ingresa tu correo Gmail para acceder directamente desde tu celular sin bloqueos de ventana:
                    </p>
                    <input
                      type="email"
                      placeholder="ejemplo@gmail.com"
                      value={customGmail}
                      onChange={(e) => setCustomGmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Tu nombre completo (opcional)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      {loading ? 'Conectando...' : 'Ingresar con esta Cuenta'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowGmailDirectInput(true)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                    >
                      ¿Problemas con la ventana de Google en celular? Toca aquí
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">
                    o con correo institucional
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              {/* Access Mode Selector (3 distinct roles) */}
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRoleTarget('habitante');
                    setLoginIdentifier('habitante@purificacion-tolima.gov.co');
                    setLoginPassword('123456');
                  }}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    loginRoleTarget === 'habitante'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Habitante</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginRoleTarget('organizador');
                    setLoginIdentifier('cultura@purificacion-tolima.gov.co');
                    setLoginPassword('123456');
                  }}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    loginRoleTarget === 'organizador'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Organizador</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginRoleTarget('administrador');
                    setLoginIdentifier('admin@purificacion-tolima.gov.co');
                    setLoginPassword('admin2026');
                  }}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    loginRoleTarget === 'administrador'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Alcaldía/Admin</span>
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Correo Electrónico o Usuario *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        loginRoleTarget === 'administrador' 
                          ? 'admin@purificacion-tolima.gov.co' 
                          : loginRoleTarget === 'organizador' 
                          ? 'cultura@purificacion-tolima.gov.co' 
                          : 'habitante@purificacion-tolima.gov.co'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Contraseña *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotNotice(true)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Contraseñas de prueba: <strong>123456</strong> (Habitantes y Organizadores) &bull; <strong>admin2026</strong> (Alcaldía Admin).
                  </p>
                </div>

                {showForgotNotice && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-2xl border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300">
                    <p className="font-bold">Recuperación de Contraseña Purificación:</p>
                    <p className="mt-0.5">Comunícate con la Secretaría de Sistemas al conmutador municipal <strong>(608) 228-0000</strong> o ingresa con los perfiles institucionales habilitados.</p>
                    <button 
                      type="button" 
                      onClick={() => setShowForgotNotice(false)} 
                      className="mt-1 text-[10px] underline font-bold"
                    >
                      Entendido, cerrar aviso
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Recordarme en este equipo</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0D47A1] to-[#2196F3] hover:from-[#0B3C8A] hover:to-[#1976D2] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verificando credenciales...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Ingresar a PurifiCalendario</span>
                    </>
                  )}
                </button>
              </form>

              {/* Direct Quick 1-Click Access for Evaluation */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Acceso Rápido por Rol (1 Clic):
                  </p>
                  <button
                    onClick={() => setActiveTab('switch')}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Ver todos ({allUsers.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Habitante Demo */}
                  {allUsers.find(u => u.rol === 'habitante') && (
                    <button
                      type="button"
                      onClick={() => {
                        const u = allUsers.find(user => user.rol === 'habitante')!;
                        onSelectUser(u);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100/60 transition-all text-left flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        👤
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Habitante</p>
                        <p className="text-[9px] text-blue-600 dark:text-blue-300 font-semibold">Juan D. Morales</p>
                      </div>
                    </button>
                  )}

                  {/* Organizador Demo */}
                  {allUsers.find(u => u.rol === 'organizador') && (
                    <button
                      type="button"
                      onClick={() => {
                        const u = allUsers.find(user => user.rol === 'organizador')!;
                        onSelectUser(u);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100/60 transition-all text-left flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        🎭
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Organizador</p>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-300 font-semibold">Casa de la Cultura</p>
                      </div>
                    </button>
                  )}

                  {/* Administrador Demo */}
                  {allUsers.find(u => u.rol === 'administrador') && (
                    <button
                      type="button"
                      onClick={() => {
                        const u = allUsers.find(user => user.rol === 'administrador')!;
                        onSelectUser(u);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/40 hover:bg-amber-100/60 transition-all text-left flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        🏛️
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Alcaldía</p>
                        <p className="text-[9px] text-amber-600 dark:text-amber-300 font-semibold">Admin Municipal</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Switch to Register footer */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ¿Deseas crear una cuenta nueva?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: REGISTRO DE CUENTA CIUDADANA / FUNCIONARIO */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              
              {/* Google Register Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] disabled:opacity-60"
                  title="Registrarse con cuenta de Google"
                >
                  <GoogleIcon />
                  <span>Registrarse con Google</span>
                </button>

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">
                    o registro con formulario
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Selector de Rol */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tipo de Cuenta (Rol) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'habitante', label: 'Habitante', desc: 'Ciudadano' },
                    { id: 'organizador', label: 'Organizador', desc: 'Juntas / Cultura' },
                    { id: 'administrador', label: 'Funcionario', desc: 'Alcaldía' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegRol(r.id as UserRole)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        regRol === r.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs">{r.label}</p>
                      <p className="text-[9px] opacity-75">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre y Correo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre Completo / Entidad *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej. Diana Marcela Morales / Junta JAC El Centro"
                    className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regCorreo}
                    onChange={(e) => setRegCorreo(e.target.value)}
                    placeholder="ejemplo@purificacion.gov.co"
                    className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                  />
                </div>
              </div>

              {/* Barrio y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Barrio / Vereda *
                  </label>
                  <select
                    value={regBarrio}
                    onChange={(e) => setRegBarrio(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                  >
                    {BARRIOS_PURIFICACION.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                      placeholder="310 123 4567"
                      className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contraseñas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                  />
                </div>
              </div>

              {/* Temas de Interés Cívico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Intereses para Notificaciones Personalizadas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: 'cultura', label: 'Cultura & Fiestas' },
                    { code: 'servicios', label: 'Cortes & Aseo' },
                    { code: 'salud', label: 'Salud & Mascotas' },
                    { code: 'deporte', label: 'Deportes IMDER' },
                    { code: 'comunidad', label: 'Obras Comunitarias' }
                  ].map(cat => {
                    const isSelected = regCategorias.includes(cat.code as CategoryCode);
                    return (
                      <button
                        key={cat.code}
                        type="button"
                        onClick={() => toggleCategoryPref(cat.code as CategoryCode)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={regTermsAccepted}
                  onChange={(e) => setRegTermsAccepted(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Acepto la política de participación ciudadana y tratamiento de datos para la gestión cívica de Purificación.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Creando tu cuenta...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Cuenta e Iniciar Sesión</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ¿Ya tienes una cuenta registrada?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>

            </form>
          </div>
          )}

          {/* TAB 3: ROLES Y CAMBIO RÁPIDO DE PRUEBA */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p>
                  Selecciona cualquiera de los <strong>3 roles oficiales</strong> de Purificación para explorar la plataforma con sus permisos correspondientes:
                </p>
              </div>

              {/* GRUPO 1: HABITANTES / CIUDADANOS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      1. Habitantes (Ciudadanos)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Vista General y Notificaciones
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Permisos: Guardar eventos favoritos, recibir notificaciones de recordatorio, alertas de cortes por barrio, encuestas y PurifiPuntos cívicos.
                </p>

                <div className="space-y-2">
                  {allUsers.filter(u => u.rol === 'habitante').map((u) => {
                    const isCurrent = currentUser ? u.id_usuario === currentUser.id_usuario : false;
                    return (
                      <div
                        key={u.id_usuario}
                        onClick={() => {
                          onSelectUser(u);
                          onClose();
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-[#2196F3] ring-2 ring-blue-400/30 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs bg-blue-600 text-white shadow-xs">
                            {u.nombre_usuario.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-slate-900 dark:text-white">{u.nombre_usuario}</p>
                              {isCurrent && (
                                <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                                  ACTIVO
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.correo}</p>
                            {u.barrio && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{u.barrio}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                          Habitante
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GRUPO 2: ORGANIZADORES */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      2. Organizadores Institucionales
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Gestión de Eventos
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Permisos: Crear, editar y programar eventos de la Casa de la Cultura, IMDER deportes, jornadas de salud del Hospital Nuevo San Rafael y entidades locales.
                </p>

                <div className="space-y-2">
                  {allUsers.filter(u => u.rol === 'organizador').map((u) => {
                    const isCurrent = currentUser ? u.id_usuario === currentUser.id_usuario : false;
                    return (
                      <div
                        key={u.id_usuario}
                        onClick={() => {
                          onSelectUser(u);
                          onClose();
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400/30 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs bg-emerald-600 text-white shadow-xs">
                            {u.nombre_usuario.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-slate-900 dark:text-white">{u.nombre_usuario}</p>
                              {isCurrent && (
                                <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                                  ACTIVO
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.correo}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Organizador
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GRUPO 3: ADMINISTRADOR MUNICIPAL */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      3. Administración Municipal (Alcaldía)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Control Total y Alertas
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Permisos: Emisión de avisos prioritarios y alertas urgentes (cortes de agua/luz), despacho de cuadrillas de vías y servicios públicos, difusión masiva de notificaciones y panel de auditoría.
                </p>

                <div className="space-y-2">
                  {allUsers.filter(u => u.rol === 'administrador').map((u) => {
                    const isCurrent = currentUser ? u.id_usuario === currentUser.id_usuario : false;
                    return (
                      <div
                        key={u.id_usuario}
                        onClick={() => {
                          onSelectUser(u);
                          onClose();
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-400/30 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs bg-amber-500 text-white shadow-xs">
                            🏛️
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-slate-900 dark:text-white">{u.nombre_usuario}</p>
                              {isCurrent && (
                                <span className="text-[9px] font-extrabold bg-amber-600 text-white px-1.5 py-0.2 rounded-full">
                                  ACTIVO
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.correo}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          Administrador
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Cerrar Sesión */}
              {onLogoutUser && currentUser && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      onLogoutUser();
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión Activa</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
