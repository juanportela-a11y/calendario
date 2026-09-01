import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  User, 
  Navigation,
  FileText
} from 'lucide-react';
import { BARRIOS_PURIFICACION, PURIFICACION_COORDINATES } from '../../data/municipalOpsData';
import { ReporteCiudadanoDTO } from '../../types';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reporte: ReporteCiudadanoDTO) => Promise<void>;
  defaultCoords?: [number, number];
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultCoords = PURIFICACION_COORDINATES
}) => {
  const [tipo, setTipo] = useState<ReporteCiudadanoDTO['tipo']>('via_danada');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [barrio, setBarrio] = useState(BARRIOS_PURIFICACION[0]);
  const [direccion, setDireccion] = useState('');
  const [nombreCiudadano, setNombreCiudadano] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [coordenadas, setCoordenadas] = useState<[number, number]>(defaultCoords);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordenadas([position.coords.latitude, position.coords.longitude]);
        setIsGettingLocation(false);
      },
      (error) => {
        console.warn('Error obteniendo geolocalización:', error);
        // Fallback to center of Purificación
        setCoordenadas([3.8582, -74.9285]);
        setIsGettingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim() || !nombreCiudadano.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        tipo,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        barrio,
        direccion: direccion.trim() || `Barrio ${barrio}`,
        coordenadas,
        foto_url: fotoUrl,
        nombre_ciudadano: nombreCiudadano.trim(),
        telefono: telefono.trim()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setTitulo('');
        setDescripcion('');
        setDireccion('');
        setFotoUrl('');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Reportar Incidencia Ciudadana</h3>
              <p className="text-xs text-blue-100">Baches, animales vulnerables, servicios o daños</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">¡Reporte Enviado a la Alcaldía!</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Tu reporte ha sido radicado en el sistema de gestión territorial. El equipo técnico e inspectores han sido notificados.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Tipo de Incidencia
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'via_danada', label: '🚧 Vía o Bache' },
                  { id: 'esterilizacion_mascotas', label: '🐾 Zoonosis / Animal' },
                  { id: 'corte_servicio', label: '💧 Falla de Servicio' },
                  { id: 'alumbrado_publico', label: '💡 Alumbrado' },
                  { id: 'alerta_ambiental', label: '🌳 Árbol / Ambiental' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTipo(item.id as any)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                      tipo === item.id
                        ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Título o Resumen del Reporte *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Hueco profundo frente a tienda comunal"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Barrio o Vereda de Purificación *
                </label>
                <select
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] outline-none"
                >
                  {BARRIOS_PURIFICACION.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección o Punto de Referencia
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Carrera 5 # 4-30"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Descripción Detallada *
              </label>
              <textarea
                required
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Indica qué sucede, riesgos para transeúntes o vehículos..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0D47A1] outline-none resize-none"
              />
            </div>

            {/* Geolocation Button */}
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-5 h-5 text-[#0D47A1] dark:text-blue-400" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Geolocalización GPS</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {coordenadas[0].toFixed(4)}, {coordenadas[1].toFixed(4)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="px-3 py-1.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGettingLocation ? 'Obteniendo...' : '📍 Usar Mi GPS'}
              </button>
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Evidencia Fotográfica (Opcional)
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Adjuntar Foto</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {fotoUrl && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                    <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoUrl('')}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Citizen Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tu Nombre Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={nombreCiudadano}
                    onChange={(e) => setNombreCiudadano(e.target.value)}
                    placeholder="Vecino / Líder JAC"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono / WhatsApp de Contacto
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="310 123 4567"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white font-black text-sm hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Radicando...' : 'Radicar Reporte Ciudadano'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
