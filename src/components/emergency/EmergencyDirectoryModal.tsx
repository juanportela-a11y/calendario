import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Search, 
  ShieldAlert, 
  AlertCircle, 
  ExternalLink,
  Flame,
  Droplets,
  Zap,
  Building2,
  HeartPulse,
  Share2
} from 'lucide-react';
import { EMERGENCY_CONTACTS, EmergencyContact } from '../../data/municipalServicesData';

interface EmergencyDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyDirectoryModal: React.FC<EmergencyDirectoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState<string>('todos');

  if (!isOpen) return null;

  const filteredContacts = EMERGENCY_CONTACTS.filter((c) => {
    if (categoria !== 'todos' && c.categoria !== categoria) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = c.nombre.toLowerCase().includes(q) || 
                    c.entidad.toLowerCase().includes(q) || 
                    c.descripcion.toLowerCase().includes(q) ||
                    c.telefono.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleShareContact = (contact: EmergencyContact) => {
    const text = `🚨 *LÍNEA OFICIAL DE ATENCIÓN - PURIFICACIÓN, TOLIMA* 🚨\n\n📌 *${contact.nombre}*\n🏢 ${contact.entidad}\n📞 Teléfono: ${contact.telefono} ${contact.telefonoAlt ? `| ${contact.telefonoAlt}` : ''}\n📍 Dirección: ${contact.direccion}\n⏰ Horario: ${contact.horario}\nℹ️ ${contact.descripcion}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-700 via-rose-700 to-[#0D47A1] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <Phone className="w-6 h-6 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Directorio & Marcación Rápida de Emergencias</h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-red-500/40 border border-red-300/40">
                  Purificación, Tolima
                </span>
              </div>
              <p className="text-xs text-rose-100">Hospital, Policía, Bomberos, Acueducto, Energía y Gas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar entidad, teléfono, policía, bomberos, acueducto..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'urgencias', label: '🚨 Urgencias & Socorro' },
              { id: 'seguridad', label: '👮 Seguridad (123)' },
              { id: 'servicios', label: '💧 Servicios Públicos' },
              { id: 'ambiental', label: '🌳 Ambiental & Fauna' },
              { id: 'institucional', label: '🏛️ Personería & Alcaldía' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoria(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  categoria === cat.id
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-slate-700 border border-red-100 dark:border-slate-600 flex items-center justify-center text-2xl shrink-0">
                  {contact.icono}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{contact.nombre}</h4>
                    {contact.badge && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                        {contact.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{contact.entidad}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{contact.descripcion}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span>{contact.direccion}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{contact.horario}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700 justify-end">
                {/* WhatsApp button */}
                {contact.whatsapp && (
                  <a
                    href={`https://api.whatsapp.com/send?phone=${contact.whatsapp}&text=${encodeURIComponent(`Hola, me comunico desde la plataforma de emergencias de Purificación, Tolima para solicitar información/asistencia.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    title="Chatear por WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="sm:hidden">WhatsApp</span>
                  </a>
                )}

                {/* Call Button */}
                <a
                  href={`tel:${contact.telefono}`}
                  className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar ({contact.telefono})</span>
                </a>

                {/* Share Button */}
                <button
                  onClick={() => handleShareContact(contact)}
                  title="Compartir contacto"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Warning */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>En caso de emergencia con personas heridas o delitos en flagrancia, comunícate de inmediato al 123 o al Hospital La Candelaria.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
