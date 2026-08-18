import React, { useEffect, useState } from 'react';
import { X, Database, Layers, CheckCircle2, Copy, Check } from 'lucide-react';
import { ApiClientAdapter } from '../adapters/apiClient';

interface DatabaseInspectorModalProps {
  onClose: () => void;
}

export const DatabaseInspectorModal: React.FC<DatabaseInspectorModalProps> = ({ onClose }) => {
  const [ddl, setDdl] = useState<string>('Cargando esquema relacional MySQL...');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ApiClientAdapter.getDdlSchema()
      .then(res => setDdl(res))
      .catch(err => setDdl(`Error al obtener esquema: ${err.message}`));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(ddl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2196F3]/20 text-[#64B5F6] rounded-xl border border-blue-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Arquitectura Hexagonal & Esquema MySQL
              </h2>
              <p className="text-xs text-slate-400">
                PurifiCalendario &bull; Entidades, Claves Primarias, Foráneas y Relación M:N usuario_evento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡SQL Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar SQL DDL</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Architecture Specs Summary */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <p className="font-bold text-blue-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Capa Dominio & Puertos</span>
            </p>
            <p className="text-slate-400 mt-1">
              Entidades independientes de framework (`IEventRepository`, `IUserRepository`, `INoticeRepository`).
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <p className="font-bold text-emerald-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>Adaptadores Persistencia</span>
            </p>
            <p className="text-slate-400 mt-1">
              Servidor Express + Motor relacional con llaves primarias, foráneas e integridad referencial en `usuario_evento`.
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <p className="font-bold text-amber-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Entidades MySQL</span>
            </p>
            <p className="text-slate-400 mt-1">
              Tablas: `usuarios`, `organizadores`, `administradores`, `eventos`, `categorias`, `avisos`, `notificaciones`, `usuario_evento`.
            </p>
          </div>
        </div>

        {/* SQL DDL Output */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 text-emerald-400 leading-relaxed whitespace-pre font-medium">
          {ddl}
        </div>
      </div>
    </div>
  );
};
