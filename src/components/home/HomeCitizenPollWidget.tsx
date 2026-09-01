import React, { useState } from 'react';
import { 
  Vote, 
  CheckCircle2, 
  Award, 
  Users, 
  Sparkles, 
  TrendingUp, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { Usuario } from '../../types';

interface HomeCitizenPollWidgetProps {
  currentUser: Usuario | null;
  onVoteSuccess?: (pointsGained: number) => void;
}

interface PollOption {
  id: string;
  titulo: string;
  descripcion: string;
  votos: number;
  categoria: string;
  icono: string;
}

export const HomeCitizenPollWidget: React.FC<HomeCitizenPollWidgetProps> = ({
  currentUser,
  onVoteSuccess
}) => {
  const [hasVoted, setHasVoted] = useState<boolean>(() => {
    return localStorage.getItem('purifica_poll_voted') === 'true';
  });
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(() => {
    return localStorage.getItem('purifica_poll_choice');
  });

  const [options, setOptions] = useState<PollOption[]>([
    {
      id: 'opt1',
      titulo: 'Modernización del Alumbrado LED en el Malecón del Río Magdalena',
      descripcion: 'Mejora de iluminación turística, cámaras y senderos peatonales ribereños.',
      votos: 342,
      categoria: 'Infraestructura & Turismo',
      icono: '💡'
    },
    {
      id: 'opt2',
      titulo: 'Techado y Graderías del Polideportivo Santa Librada',
      descripcion: 'Espacio cubierto para torneos juveniles de microfútbol, baloncesto y escuelas IMDER.',
      votos: 418,
      categoria: 'Deporte & Juventud',
      icono: '🏟️'
    },
    {
      id: 'opt3',
      titulo: 'Brigadas de Salud Veterinaria y Esterilización en Veredas',
      descripcion: 'Atención móvil gratuita de zoonosis para mascotas en Chenche Ambaló, Hato Viejo y Bañao.',
      votos: 289,
      categoria: 'Salud Animal & Rural',
      icono: '🐾'
    },
    {
      id: 'opt4',
      titulo: 'Plan de Bacheo y Pavimentación Integral en Vía Ospina Pérez',
      descripcion: 'Recuperación asfáltica y reductores de velocidad en la zona urbana sur.',
      votos: 395,
      categoria: 'Malla Vial Urbana',
      icono: '🚧'
    }
  ]);

  const totalVotes = options.reduce((acc, curr) => acc + curr.votos, 0);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    setOptions(prev => prev.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, votos: opt.votos + 1 };
      }
      return opt;
    }));

    setSelectedOptionId(optionId);
    setHasVoted(true);
    localStorage.setItem('purifica_poll_voted', 'true');
    localStorage.setItem('purifica_poll_choice', optionId);

    if (onVoteSuccess) {
      onVoteSuccess(25);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/30 relative overflow-hidden animate-fade-in">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                <Vote className="w-3 h-3" />
                <span>Presupuesto Participativo</span>
              </span>
              <span className="text-xs text-indigo-200 font-semibold">
                Alcaldía de Purificación
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ¿Cuál obra comunitaria debe priorizarse para el próximo trimestre?
            </h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
              Tu voto ciudadano ayuda al Consejo Municipal a priorizar proyectos de inversión comunitaria. Ganas <strong>+25 PurifiPuntos</strong> al participar.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 self-start sm:self-auto">
            <Users className="w-4 h-4 text-indigo-300" />
            <div className="text-right">
              <p className="text-sm font-black text-white leading-none">{totalVotes.toLocaleString()}</p>
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Votos Registrados</p>
            </div>
          </div>
        </div>

        {/* Voting Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt) => {
            const percentage = Math.round((opt.votos / totalVotes) * 100);
            const isSelected = selectedOptionId === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => !hasVoted && handleVote(opt.id)}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/40 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                    : hasVoted
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 hover:border-indigo-400/60 active:scale-[0.98]'
                }`}
              >
                {/* Progress Bar background if voted */}
                {hasVoted && (
                  <div
                    className="absolute inset-y-0 left-0 bg-indigo-500/20 transition-all duration-700 pointer-events-none"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative z-10 flex items-start gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    {opt.icono}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        {opt.categoria}
                      </span>
                      {hasVoted && (
                        <span className="text-xs font-black text-white bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-400/30">
                          {percentage}% ({opt.votos} votos)
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {opt.titulo}
                    </h4>

                    <p className="text-[11px] text-indigo-200 mt-1 leading-relaxed">
                      {opt.descripcion}
                    </p>

                    {!hasVoted && (
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(opt.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-transform active:scale-95 flex items-center gap-1.5 shadow-sm"
                        >
                          <Vote className="w-3.5 h-3.5" />
                          <span>Votar por esta obra</span>
                        </button>
                        <span className="text-[10px] text-indigo-300 font-semibold">+25 Puntos</span>
                      </div>
                    )}

                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-amber-300">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>¡Tu voto fue registrado!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info banner */}
        <div className="pt-2 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Votación Cívica Verificada &bull; Resultados en tiempo real para la comunidad</span>
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
