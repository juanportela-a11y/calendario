import React, { useState } from 'react';
import { 
  Vote, 
  CheckCircle2, 
  BarChart2, 
  Clock, 
  Users, 
  HelpCircle, 
  MessageSquare,
  Sparkles,
  Share2
} from 'lucide-react';
import { EncuestaCiudadana } from '../../types';
import { shareViaWhatsApp } from '../../utils/notificationUtils';

interface CitizenParticipationSectionProps {
  encuestas: EncuestaCiudadana[];
  onVote: (idEncuesta: number, idOpcion: number, userId: string) => Promise<void>;
  onOpenReportModal: () => void;
  currentUserId?: string;
}

export const CitizenParticipationSection: React.FC<CitizenParticipationSectionProps> = ({
  encuestas,
  onVote,
  onOpenReportModal,
  currentUserId = 'user_guest_' + (typeof window !== 'undefined' ? (window.localStorage.getItem('guest_id') || (() => {
    const id = Math.random().toString(36).substring(2, 9);
    window.localStorage.setItem('guest_id', id);
    return id;
  })()) : 'anon')
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [isSubmittingVote, setIsSubmittingVote] = useState<number | null>(null);

  const handleSelect = (idEncuesta: number, idOpcion: number) => {
    setSelectedOptions(prev => ({ ...prev, [idEncuesta]: idOpcion }));
  };

  const handleVoteSubmit = async (idEncuesta: number) => {
    const selectedOpt = selectedOptions[idEncuesta];
    if (!selectedOpt) return;

    setIsSubmittingVote(idEncuesta);
    try {
      await onVote(idEncuesta, selectedOpt, currentUserId);
    } finally {
      setIsSubmittingVote(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-[#0D47A1] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-black">
            <Vote className="w-4 h-4 text-emerald-300" />
            <span>Voz y Decisión Comunitaria</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Participación Ciudadana y Consultas
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
            Tu opinión orienta la inversión de la Alcaldía de Purificación. Participa en las consultas abiertas o reporta afectaciones en tu barrio.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-5 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black shadow-lg flex items-center gap-2 transition-transform active:scale-95"
        >
          <MessageSquare className="w-4 h-4 text-emerald-700" />
          <span>Radicar Reporte Vecinal</span>
        </button>
      </div>

      {/* Surveys List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {encuestas.map((encuesta) => {
          const hasVoted = Boolean(encuesta.votos_usuarios && encuesta.votos_usuarios[currentUserId]);
          const userVotedOptionId = encuesta.votos_usuarios?.[currentUserId];

          return (
            <div 
              key={encuesta.id_encuesta}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#0D47A1] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Consulta de {encuesta.categoria}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cierra: {encuesta.fecha_cierre}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {encuesta.titulo}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {encuesta.descripcion}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {encuesta.opciones.map((opcion) => {
                  const percentage = encuesta.total_votos > 0 
                    ? Math.round((opcion.votos / encuesta.total_votos) * 100) 
                    : 0;
                  const isSelected = selectedOptions[encuesta.id_encuesta] === opcion.id_opcion;
                  const isUserVote = userVotedOptionId === opcion.id_opcion;

                  return (
                    <div
                      key={opcion.id_opcion}
                      onClick={() => !hasVoted && handleSelect(encuesta.id_encuesta, opcion.id_opcion)}
                      className={`relative overflow-hidden rounded-2xl border transition-all p-3.5 ${
                        hasVoted 
                          ? isUserVote 
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30' 
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                          : isSelected
                            ? 'border-[#0D47A1] bg-blue-50/60 dark:bg-blue-950/50 cursor-pointer shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 cursor-pointer'
                      }`}
                    >
                      {/* Vote percentage bar for voted state */}
                      {hasVoted && (
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-emerald-100 dark:bg-emerald-900/30 transition-all duration-500 -z-0"
                          style={{ width: `${percentage}%` }}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          {hasVoted ? (
                            isUserVote && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#0D47A1] bg-[#0D47A1]' : 'border-slate-400'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          )}
                          <span>{opcion.texto}</span>
                        </div>

                        {hasVoted && (
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{percentage}%</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">({opcion.votos} votos)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer / Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{encuesta.total_votos} vecinos han participado</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => shareViaWhatsApp(encuesta.titulo, encuesta.descripcion, 'Municipio de Purificación')}
                    title="Compartir en WhatsApp"
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {!hasVoted && (
                    <button
                      disabled={!selectedOptions[encuesta.id_encuesta] || isSubmittingVote === encuesta.id_encuesta}
                      onClick={() => handleVoteSubmit(encuesta.id_encuesta)}
                      className="px-4 py-2 rounded-xl bg-[#0D47A1] text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {isSubmittingVote === encuesta.id_encuesta ? 'Votando...' : 'Emitir Voto'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
