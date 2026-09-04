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
  AlertCircle,
  Check,
  ArrowLeft,
  RefreshCw,
  Send
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { CategoryCode, UserRole, Usuario } from '../types';
import { ApiClientAdapter } from '../adapters/apiClient';

interface AuthModalProps {
  onClose: () => void;
  currentUser: Usuario | null;
  allUsers: Usuario[];
  onSelectUser: (user: Usuario) => void;
  onLoginUser: (login: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onRegisterUser: (data: Partial<Usuario>) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin?: (data: { email: string; name?: string; photoUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  onLogoutUser?: () => void;
  initialTab?: 'login' | 'register' | 'switch' | 'forgot';
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

export const BARRIOS_PURIFICACION = [
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
  'El Salado',
  'Modelo',
  'Santander',
  'Puerto Peñón',
  'Malecón Turístico',
  'Vereda Chenche Asoleado',
  'Vereda Chenche Uno',
  'Vereda Chenche Ambaló',
  'Vereda Hato Viejo',
  'Vereda Campoalegre',
  'Vereda Santa Inés',
  'Vereda Villa Esperanza',
  'Vereda Bañao',
  'Vereda San Antonio',
  'Vereda Cerritos',
  'Vereda San Pablito',
  'Otro Barrio / Zona Rural'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onLoginUser,
  onRegisterUser,
  onGoogleLogin,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'switch' | 'forgot'>(initialTab);
  
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
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regRol, setRegRol] = useState<UserRole>('habitante');
  const [regBarrio, setRegBarrio] = useState('El Centro');
  const [regCustomBarrio, setRegCustomBarrio] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCategorias, setRegCategorias] = useState<CategoryCode[]>(['cultura', 'servicios', 'deporte']);
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);

  // Forgot Password / Reset State
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Google Fallback Direct Input
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
        console.warn('Firebase Google Auth popup issue:', popupErr);
        if (popupErr?.code === 'auth/popup-closed-by-user') {
          setLoading(false);
          return;
        }
        setShowGmailDirectInput(true);
        setErrorMessage('El navegador bloqueó la ventana de Google. Ingresa tu correo Gmail directamente abajo:');
        setLoading(false);
        return;
      }

      if (!userEmail) {
        setShowGmailDirectInput(true);
        setErrorMessage('No se detectó un correo de Google válido.');
        setLoading(false);
        return;
      }

      if (onGoogleLogin) {
        const res = await onGoogleLogin({
          email: userEmail,
          name: userName,
          photoUrl: userPhoto
        });

        if (res.success) {
          setSuccessMessage('¡Inicio de sesión con Google exitoso! Bienvenido.');
          setTimeout(() => onClose(), 600);
        } else {
          setErrorMessage(res.error || 'No fue posible iniciar sesión con Google.');
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
          setSuccessMessage(`¡Bienvenido ${customName || 'Ciudadano'}! Sesión iniciada.`);
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
      setErrorMessage('Por favor ingresa tu correo electrónico o usuario');
      return;
    }

    setLoading(true);
    try {
      const res = await onLoginUser(loginIdentifier.trim(), loginPassword);
      if (res.success) {
        setSuccessMessage('¡Inicio de sesión exitoso! Bienvenido a PurifiCalendario.');
        setTimeout(() => onClose(), 600);
      } else {
        setErrorMessage(res.error || 'Credenciales incorrectas. Verifica tu usuario o contraseña.');
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

    const cleanNombre = regNombre.trim();
    const cleanCorreo = regCorreo.trim();
    const cleanTelefono = regTelefono.replace(/\D/g, '').slice(0, 10);
    const finalBarrio = regBarrio === 'Otro Barrio / Zona Rural' && regCustomBarrio.trim() 
      ? regCustomBarrio.trim() 
      : regBarrio;

    if (!cleanNombre || !cleanCorreo) {
      setErrorMessage('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    if (cleanNombre.length > 50) {
      setErrorMessage('El nombre no puede exceder los 50 caracteres.');
      return;
    }

    if (cleanCorreo.length > 80) {
      setErrorMessage('El correo no puede exceder los 80 caracteres.');
      return;
    }

    if (regPassword.length < 8 || regPassword.length > 32) {
      setErrorMessage('La contraseña debe tener entre 8 y 32 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
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
        nombre_usuario: cleanNombre,
        correo: cleanCorreo,
        contrasena: regPassword,
        rol: regRol,
        barrio: finalBarrio,
        telefono: cleanTelefono,
        preferencias_categorias: regCategorias
      });

      if (res.success) {
        setSuccessMessage('¡Cuenta creada con éxito! Se ha iniciado sesión automáticamente.');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMessage(res.error || 'No fue posible crear la cuenta.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = forgotEmail.trim();
    if (!email) {
      setErrorMessage('Ingresa el correo electrónico asociado a tu cuenta.');
      return;
    }

    setLoading(true);
    let emailDispatched = false;

    try {
      // 1. Send real password reset email via Firebase Auth
      await sendPasswordResetEmail(auth, email);
      emailDispatched = true;
      setSuccessMessage(`¡Correo de restablecimiento enviado a ${email}! Revisa tu bandeja de entrada o spam para restablecer tu contraseña con el enlace seguro.`);
    } catch (fbErr: any) {
      console.warn('Firebase sendPasswordResetEmail notice:', fbErr?.code || fbErr);
      if (fbErr?.code === 'auth/user-not-found') {
        setErrorMessage('No encontramos ninguna cuenta registrada con este correo electrónico.');
        setLoading(false);
        return;
      }
    }

    // 2. Also register token via backend adapter for immediate code verification
    try {
      const res = await ApiClientAdapter.requestPasswordReset(email);
      if (res.success) {
        setGeneratedToken(res.token || null);
        if (res.token) setRecoveryCode(res.token);
        if (!emailDispatched) {
          setSuccessMessage(res.message);
        }
        setResetStep('verify');
      } else if (!emailDispatched) {
        setErrorMessage('No se pudo procesar la recuperación de contraseña.');
      }
    } catch (err: any) {
      if (!emailDispatched) {
        setErrorMessage(err.message || 'Error al procesar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!recoveryCode.trim()) {
      setErrorMessage('Por favor ingresa el código o token de recuperación.');
      return;
    }

    if (newResetPassword.length < 8 || newResetPassword.length > 32) {
      setErrorMessage('La nueva contraseña debe tener entre 8 y 32 caracteres.');
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClientAdapter.resetPassword(recoveryCode.trim(), newResetPassword);
      if (res.success) {
        setSuccessMessage('¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.');
        setLoginIdentifier(forgotEmail || '');
        setLoginPassword(newResetPassword);
        setTimeout(() => {
          setActiveTab('login');
          setResetStep('request');
          setRecoveryCode('');
          setNewResetPassword('');
          setConfirmResetPassword('');
        }, 1500);
      } else {
        setErrorMessage(res.message || 'El código ingresado no es válido o ha expirado.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al restablecer la contraseña.');
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
                Portal Cívico &bull; Purificación, Tolima
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight">Acceso, Registro & Seguridad</h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Gestión de identidad síncrona en tiempo real
            </p>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all relative z-10 cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

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
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
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
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
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
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'switch'
                ? 'border-[#2196F3] text-[#0D47A1] dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Roles Demo</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('forgot');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'forgot'
                ? 'border-[#2196F3] text-[#0D47A1] dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recuperar</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Alerts */}
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
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                >
                  <GoogleIcon />
                  <span>Continuar con Google</span>
                </button>

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
                        className="text-[10px] text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Ocultar
                      </button>
                    </div>
                    <input
                      type="email"
                      maxLength={80}
                      placeholder="ejemplo@gmail.com"
                      value={customGmail}
                      onChange={(e) => setCustomGmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      maxLength={50}
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
                      ¿Problemas con la ventana emergente en celular? Toca aquí
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">
                    o con usuario y contraseña
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              {/* Access Mode Selector */}
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRoleTarget('habitante');
                    setLoginIdentifier('habitante@purificacion-tolima.gov.co');
                    setLoginPassword('123456');
                  }}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Correo Electrónico o Usuario *
                    </label>
                    <span className="text-[10px] text-slate-400">{loginIdentifier.length}/80</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={80}
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="usuario@purificacion-tolima.gov.co"
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
                      onClick={() => {
                        setActiveTab('forgot');
                        setForgotEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                      }}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
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
                      maxLength={32}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-blue-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Claves demo: <strong>123456</strong> (Habitante/Organizador) &bull; <strong>admin2026</strong> (Alcaldía).
                  </p>
                </div>

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
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0D47A1] to-[#2196F3] hover:from-[#0B3C8A] hover:to-[#1976D2] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ¿Deseas crear una cuenta nueva?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTRO CIUDADANO CON LÍMITES Y VALIDACIONES */}
          {activeTab === 'register' && (
            <div className="space-y-4">
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
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
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

                {/* Nombre y Correo con límites */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Nombre Completo / Entidad *
                    </label>
                    <span className="text-[10px] text-slate-400">{regNombre.length}/50</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={50}
                      required
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      placeholder="Ej. Diana Marcela Morales"
                      className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Correo Electrónico *
                    </label>
                    <span className="text-[10px] text-slate-400">{regCorreo.length}/80</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      maxLength={80}
                      required
                      value={regCorreo}
                      onChange={(e) => setRegCorreo(e.target.value)}
                      placeholder="ejemplo@purificacion-tolima.gov.co"
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
                      className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none cursor-pointer"
                    >
                      {BARRIOS_PURIFICACION.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {regBarrio === 'Otro Barrio / Zona Rural' && (
                      <input
                        type="text"
                        maxLength={50}
                        placeholder="Escribe el nombre de tu sector"
                        value={regCustomBarrio}
                        onChange={(e) => setRegCustomBarrio(e.target.value)}
                        className="mt-1.5 w-full px-3 py-1.5 text-xs rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Teléfono / WhatsApp
                      </label>
                      <span className="text-[10px] text-slate-400">{regTelefono.length}/10</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={regTelefono}
                        onChange={(e) => setRegTelefono(e.target.value.replace(/\D/g, ''))}
                        placeholder="3101234567"
                        className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Contraseñas con Ojito y Límites */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Contraseña *
                      </label>
                      <span className="text-[10px] text-slate-400">{regPassword.length}/32</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        minLength={8}
                        maxLength={32}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full pl-3 pr-9 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showRegPassword ? 'Ocultar' : 'Mostrar'}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5 text-blue-600" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Confirmar *
                      </label>
                      <span className="text-[10px] text-slate-400">{regConfirmPassword.length}/32</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        minLength={8}
                        maxLength={32}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="w-full pl-3 pr-9 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showRegConfirmPassword ? 'Ocultar' : 'Mostrar'}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5 text-blue-600" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Categorías */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Categorías de Interés
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
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border flex items-center gap-1 cursor-pointer ${
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
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Registrando usuario...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Cuenta Ciudadana</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: RECUPERACIÓN DE CONTRASEÑA */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Restablecimiento Seguro de Contraseña</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                    Genera un código de verificación institucional para actualizar tu clave de acceso a PurifiCalendario.
                  </p>
                </div>
              </div>

              {resetStep === 'request' ? (
                <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Correo Electrónico Registrado *
                      </label>
                      <span className="text-[10px] text-slate-400">{forgotEmail.length}/80</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        maxLength={80}
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="ejemplo@purificacion-tolima.gov.co"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span>Generando código...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Solicitar Código de Recuperación</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep('verify')}
                      className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      ¿Ya tienes un código? Ingrésalo aquí directamente
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                  {generatedToken && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[11px]">Código de Recuperación:</p>
                        <p className="font-mono text-sm font-black text-emerald-900 dark:text-emerald-100">{generatedToken}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecoveryCode(generatedToken)}
                        className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Usar Código
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Código de Verificación *
                    </label>
                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="Ej. PURIFI-123456"
                      className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono uppercase focus:border-[#2196F3] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Nueva Clave *
                        </label>
                        <span className="text-[10px] text-slate-400">{newResetPassword.length}/32</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          minLength={8}
                          maxLength={32}
                          required
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full pl-3 pr-9 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showResetPassword ? <EyeOff className="w-3.5 h-3.5 text-blue-600" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Confirmar *
                        </label>
                        <span className="text-[10px] text-slate-400">{confirmResetPassword.length}/32</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showConfirmResetPassword ? 'text' : 'password'}
                          minLength={8}
                          maxLength={32}
                          required
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="Repite la clave"
                          className="w-full pl-3 pr-9 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#2196F3] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showConfirmResetPassword ? <EyeOff className="w-3.5 h-3.5 text-blue-600" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span>Actualizando contraseña...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Guardar Nueva Contraseña</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setResetStep('request')}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Volver a solicitar código</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: ROLES DEMO */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p>
                  Cambio rápido de perfil para evaluar permisos y sincronización en tiempo real:
                </p>
              </div>

              <div className="space-y-2">
                {allUsers.map((u) => {
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
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs text-white shadow-xs ${
                          u.rol === 'administrador' ? 'bg-amber-600' : u.rol === 'organizador' ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}>
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

                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border ${
                        u.rol === 'administrador'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300'
                          : u.rol === 'organizador'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300'
                      }`}>
                        {u.rol === 'administrador' ? 'Alcaldía' : u.rol === 'organizador' ? 'Organizador' : 'Habitante'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
