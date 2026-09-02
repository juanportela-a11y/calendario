import React, { useState, useRef, useEffect } from 'react';
import { Bot, PhoneCall, MessageCircle, HelpCircle, X, ChevronUp, Sparkles, AlertCircle, Megaphone } from 'lucide-react';

interface FloatingActionsMenuProps {
  onOpenAssistant: () => void;
  onOpenEmergencies: () => void;
  onOpenReportar?: () => void;
}

export const FloatingActionsMenu: React.FC<FloatingActionsMenuProps> = ({
  onOpenAssistant,
  onOpenEmergencies,
  onOpenReportar,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Menu Panel */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between px-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Canales de Atención
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Option 1: PurifiGuía AI */}
          <button
            onClick={() => {
              onOpenAssistant();
              setIsOpen(false);
            }}
            className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-800/60 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-slate-750 transition-all border border-blue-100 dark:border-blue-900/40 flex items-center gap-3 cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-cyan-200" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-blue-950 dark:text-blue-200">PurifiGuía IA</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                  En línea
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Asistente de eventos y trámites
              </p>
            </div>
          </button>

          {/* Option 2: Reportar Falla */}
          {onOpenReportar && (
            <button
              onClick={() => {
                onOpenReportar();
                setIsOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-950/40 transition-all border border-blue-100 dark:border-blue-900/30 flex items-center gap-3 cursor-pointer group active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-blue-950 dark:text-blue-200">Reportar Falla</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                    Cívico
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Agua, luz, aseo, vías
                </p>
              </div>
            </button>
          )}

          {/* Option 3: Emergencias 24/7 */}
          <button
            onClick={() => {
              onOpenEmergencies();
              setIsOpen(false);
            }}
            className="w-full text-left p-2.5 rounded-xl bg-red-50/70 dark:bg-red-950/20 hover:bg-red-100/70 dark:hover:bg-red-950/40 transition-all border border-red-100 dark:border-red-900/30 flex items-center gap-3 cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
              <PhoneCall className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-red-950 dark:text-red-200">Emergencias 123</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100">
                  24/7
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Hospital, Bomberos, Policía
              </p>
            </div>
          </button>

          {/* Option 3: WhatsApp Cívico */}
          <a
            href="https://wa.me/573100000000?text=Hola%20Alcaldía%20de%20Purificación,%20deseo%20consultar%20el%20calendario%20de%20eventos,%20farmacias%20de%20turno%20o%20reportar%20una%20vía."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full text-left p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/40 transition-all border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 block">WhatsApp Alcaldía</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Atención ciudadana y reportes
              </p>
            </div>
          </a>
        </div>
      )}

      {/* Primary Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-black transition-all duration-200 cursor-pointer active:scale-95 border-2 ${
          isOpen
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-700 dark:border-slate-200 shadow-2xl'
            : 'bg-gradient-to-r from-[#0D47A1] to-blue-600 hover:from-blue-700 hover:to-indigo-600 text-white border-white/30 hover:shadow-2xl hover:scale-105'
        }`}
        title="Canales de atención y emergencias"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <>
              <HelpCircle className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            </>
          )}
        </div>
        <span>{isOpen ? 'Cerrar' : 'Atención y Ayuda'}</span>
        <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};
