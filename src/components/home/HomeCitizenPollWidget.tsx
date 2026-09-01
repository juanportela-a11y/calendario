import React, { useState } from 'react';
import { 
  Vote, 
  CheckCircle2, 
  Users, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { Usuario } from '../../types';
import { useOpsStore } from '../../stores/useOpsStore';

interface HomeCitizenPollWidgetProps {
  currentUser: Usuario | null;
  onVoteSuccess?: (pointsGained: number) => void;
}

export const HomeCitizenPollWidget: React.FC<HomeCitizenPollWidgetProps> = ({
  currentUser,
  onVoteSuccess
}) => {
  const { encuestas, voteEncuesta, addUserPoints } = useOpsStore();
  const activeEncuesta = encuestas.find(e => e.estado === 'activa') || encuestas[0];

  const userId = currentUser ? `user_${currentUser.id_usuario}` : 'invitado_local';
  
  // Local or store voting state
  const hasVoted = Boolean(
    (activeEncuesta?.votos_usuarios && activeEncuesta.votos_usuarios[userId]) ||
    localStorage.getItem(`purifica_poll_voted_${activeEncuesta?.id_encuesta || 'default'}`) === 'true'
  );

  const selectedOptionId = activeEncuesta?.votos_usuarios?.[userId] || 
    Number(localStorage.getItem(`purifica_poll_choice_${activeEncuesta?.id_encuesta || 'default'}`));

  const totalVotes = activeEncuesta ? activeEncuesta.total_votos : 0;

  const handleVote = async (idOpcion: number) => {
    if (hasVoted || !activeEncuesta) return;

    localStorage.setItem(`purifica_poll_voted_${activeEncuesta.id_encuesta}`, 'true');
    localStorage.setItem(`purifica_poll_choice_${activeEncuesta.id_encuesta}`, String(idOpcion));

    await voteEncuesta(activeEncuesta.id_encuesta, idOpcion, userId);
    addUserPoints(25, 'Voto en Consulta Ciudadana Municipal');

    if (onVoteSuccess) {
      onVoteSuccess(25);
    }
  };

  if (!activeEncuesta) return null;

  return (
    <div className="bg-gradient-to-br from-[#0B2559] via-[#0D47A1] to-[#1A237E] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-400/30 relative overflow-hidden animate-fade-in">
      
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                <Vote className="w-3 h-3" />
                <span>Presupuesto Participativo</span>
              </span>
              <span className="text-xs text-blue-200 font-semibold">
                Alcaldía de Purificación &bull; {activeEncuesta.categoria.toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeEncuesta.titulo}
            </h3>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl">
              {activeEncuesta.descripcion || 'Tu voto ciudadano ayuda a la Administración Municipal a priorizar proyectos de inversión comunitaria.'} Ganas <strong className="text-amber-300">+25 PurifiPuntos</strong> al participar.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 self-start sm:self-auto">
            <Users className="w-4 h-4 text-cyan-300 shrink-0" />
            <div className="text-right">
              <p className="text-sm font-black text-white leading-none">{(totalVotes || 0).toLocaleString()}</p>
              <p className="text-[10px] text-blue-200 uppercase font-bold">Votos Registrados</p>
            </div>
          </div>
        </div>

        {/* Voting Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeEncuesta.opciones.map((opt) => {
            const percentage = totalVotes > 0 ? Math.round((opt.votos / totalVotes) * 100) : 0;
            const isSelected = selectedOptionId === opt.id_opcion;

            return (
              <div
                key={opt.id_opcion}
                onClick={() => !hasVoted && handleVote(opt.id_opcion)}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/40 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                    : hasVoted
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 hover:border-cyan-400/60 active:scale-[0.98]'
                }`}
              >
                {/* Progress Bar background if voted */}
                {hasVoted && (
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-500/20 transition-all duration-700 pointer-events-none"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative z-10 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                        Opción #{opt.id_opcion}
                      </span>
                      {hasVoted && (
                        <span className="text-xs font-black text-white bg-blue-950/80 px-2 py-0.5 rounded-full border border-cyan-400/30">
                          {percentage}% ({opt.votos} votos)
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {opt.texto}
                    </h4>

                    {!hasVoted && (
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(opt.id_opcion);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-transform active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Vote className="w-3.5 h-3.5" />
                          <span>Votar por esta opción</span>
                        </button>
                        <span className="text-[10px] text-cyan-200 font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>+25 Puntos Cívicos</span>
                        </span>
                      </div>
                    )}

                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-amber-300">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>¡Tu voto ciudadano fue registrado con éxito!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info banner */}
        <div className="pt-2 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Consulta Ciudadana Oficial &bull; Respaldada por el Sistema de Información Municipal</span>
          </div>

          {hasVoted && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
              ✓ Has participado en la encuesta activa
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

