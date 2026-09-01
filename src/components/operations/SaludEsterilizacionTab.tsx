import React, { useState } from 'react';
import { 
  HeartHandshake, 
  PawPrint, 
  Users, 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  UserPlus, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  X,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { 
  JornadaSaludEsterilizacion, 
  InscritoJornada, 
  PersonalSaludAsignado, 
  OpsGlobalFilterState 
} from '../../types';
import { BARRIOS_PURIFICACION } from '../../data/municipalOpsData';

interface SaludEsterilizacionTabProps {
  jornadas: JornadaSaludEsterilizacion[];
  filters: OpsGlobalFilterState;
  onAddJornada: (newJornada: Omit<JornadaSaludEsterilizacion, 'id_jornada'>) => void;
  onAddInscrito: (idJornada: number, nuevoInscrito: Omit<InscritoJornada, 'id_inscrito' | 'id_jornada'>) => void;
  onAddPersonal: (idJornada: number, nuevoPersonal: Omit<PersonalSaludAsignado, 'id_personal'>) => void;
  onUpdateInscritoStatus: (idJornada: number, idInscrito: number, nuevoEstado: 'inscrito' | 'atendido' | 'cancelado') => void;
}

export const SaludEsterilizacionTab: React.FC<SaludEsterilizacionTabProps> = ({
  jornadas,
  filters,
  onAddJornada,
  onAddInscrito,
  onAddPersonal,
  onUpdateInscritoStatus
}) => {
  const [selectedJornada, setSelectedJornada] = useState<JornadaSaludEsterilizacion | null>(
    jornadas.length > 0 ? jornadas[0] : null
  );

  const [showCreateJornadaModal, setShowCreateJornadaModal] = useState<boolean>(false);
  const [showInscribeModal, setShowInscribeModal] = useState<boolean>(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);

  // New Jornada Form
  const [jornadaForm, setJornadaForm] = useState({
    titulo: '',
    tipo: 'esterilizacion_canina_felina' as 'esterilizacion_canina_felina' | 'vacunacion_antirrabica' | 'brigada_salud_integral' | 'desparasitacion',
    lugar: '',
    barrio: BARRIOS_PURIFICACION[0],
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '08:00',
    hora_fin: '14:00',
    cupos_totales: 50,
    requisitos: '1. Ayuno de 8 horas. 2. Traer carné. 3. Collar y bozal si aplica. 4. Cobija para recuperación.',
    responsable_entidad: 'Secretaría de Salud y Protección Social de Purificación',
    creado_por: 'Dra. Elena Vargas (Secretaria de Salud)',
    lat: 3.8582,
    lng: -74.9285
  });

  // Inscription Form
  const [inscribeForm, setInscribeForm] = useState({
    tutor_nombre: '',
    tutor_cedula: '',
    tutor_telefono: '',
    barrio: BARRIOS_PURIFICACION[0],
    mascota_nombre: '',
    especie: 'canino' as 'canino' | 'felino',
    raza: 'Criollo',
    edad_meses: 12,
    hora_turno: '08:30'
  });

  // Staff Form
  const [staffForm, setStaffForm] = useState({
    nombre: '',
    cargo: 'Médico Veterinario Cirujano',
    tarjeta_profesional: 'COMVEZCOL # ',
    entidad: 'Secretaría de Salud / Hospital Nuevo San Rafael'
  });

  // Keep selected jornada synchronized
  const activeJornada = selectedJornada 
    ? (jornadas.find(j => j.id_jornada === selectedJornada.id_jornada) || jornadas[0])
    : (jornadas[0] || null);

  const handleCreateJornadaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jornadaForm.titulo.trim() || !jornadaForm.lugar.trim()) return;

    onAddJornada({
      titulo: jornadaForm.titulo,
      tipo: jornadaForm.tipo,
      lugar: jornadaForm.lugar,
      barrio: jornadaForm.barrio,
      coordenadas: [jornadaForm.lat, jornadaForm.lng],
      fecha: jornadaForm.fecha,
      hora_inicio: jornadaForm.hora_inicio,
      hora_fin: jornadaForm.hora_fin,
      cupos_totales: Number(jornadaForm.cupos_totales) || 40,
      cupos_ocupados: 0,
      personal_asignado: [
        {
          id_personal: 1,
          nombre: 'Dr. Mario Ortiz Méndez',
          cargo: 'Médico Veterinario Zootecnista',
          tarjeta_profesional: 'COMVEZCOL # 14892',
          entidad: 'Secretaría de Salud'
        }
      ],
      inscritos: [],
      requisitos: jornadaForm.requisitos,
      estado: 'programada',
      responsable_entidad: jornadaForm.responsable_entidad,
      creado_por: jornadaForm.creado_por
    });

    setShowCreateJornadaModal(false);
  };

  const handleInscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJornada || !inscribeForm.tutor_nombre.trim() || !inscribeForm.mascota_nombre.trim()) return;

    onAddInscrito(activeJornada.id_jornada, {
      tutor_nombre: inscribeForm.tutor_nombre,
      tutor_cedula: inscribeForm.tutor_cedula,
      tutor_telefono: inscribeForm.tutor_telefono,
      barrio: inscribeForm.barrio,
      mascota_nombre: inscribeForm.mascota_nombre,
      especie: inscribeForm.especie,
      raza: inscribeForm.raza,
      edad_meses: Number(inscribeForm.edad_meses) || 12,
      hora_turno: inscribeForm.hora_turno,
      estado: 'inscrito'
    });

    setShowInscribeModal(false);
    // Reset
    setInscribeForm({
      tutor_nombre: '',
      tutor_cedula: '',
      tutor_telefono: '',
      barrio: BARRIOS_PURIFICACION[0],
      mascota_nombre: '',
      especie: 'canino',
      raza: 'Criollo',
      edad_meses: 12,
      hora_turno: '08:30'
    });
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJornada || !staffForm.nombre.trim()) return;

    onAddPersonal(activeJornada.id_jornada, {
      nombre: staffForm.nombre,
      cargo: staffForm.cargo,
      tarjeta_profesional: staffForm.tarjeta_profesional,
      entidad: staffForm.entidad
    });

    setShowAddStaffModal(false);
    setStaffForm({
      nombre: '',
      cargo: 'Médico Veterinario Cirujano',
      tarjeta_profesional: 'COMVEZCOL # ',
      entidad: 'Secretaría de Salud / Hospital Nuevo San Rafael'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl">
              <PawPrint className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Jornadas de Salud & Esterilización de Zoonosis
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Control de cupos de mascotas en tiempo real, asignación de personal veterinario y registro de turnos
          </p>
        </div>

        <button
          onClick={() => setShowCreateJornadaModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Nueva Jornada</span>
        </button>
      </div>

      {/* Jornadas Selector Ribbon */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {jornadas.map((j) => {
          const isSelected = activeJornada && activeJornada.id_jornada === j.id_jornada;
          const cuposRestantes = j.cupos_totales - j.cupos_ocupados;
          const pct = Math.round((j.cupos_ocupados / (j.cupos_totales || 1)) * 100);

          return (
            <button
              key={j.id_jornada}
              onClick={() => setSelectedJornada(j)}
              className={`p-4 rounded-3xl border text-left min-w-[280px] sm:min-w-[320px] transition-all flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {j.tipo.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {j.fecha}
                </span>
              </div>

              <h4 className="text-sm font-black leading-tight line-clamp-1 mb-1">
                {j.titulo}
              </h4>
              <p className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-slate-500'} flex items-center gap-1 mb-3`}>
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{j.lugar} ({j.barrio})</span>
              </p>

              {/* Quota Progress Bar in Ribbon */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Cupos: {j.cupos_ocupados}/{j.cupos_totales}</span>
                  <span>{pct}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isSelected ? 'bg-emerald-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <div 
                    className={`h-full rounded-full ${isSelected ? 'bg-amber-300' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(pct, 100)}%` }} 
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Jornada Detail Dashboard */}
      {activeJornada && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Control de Cupos & Pacientes Inscritos */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quota Monitor Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    Control de Cupos en Tiempo Real
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {activeJornada.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#2196F3]" />
                    <span>{activeJornada.fecha} &bull; Horario: {activeJornada.hora_inicio} a {activeJornada.hora_fin}</span>
                  </p>
                </div>

                <button
                  onClick={() => setShowInscribeModal(true)}
                  disabled={activeJornada.cupos_ocupados >= activeJornada.cupos_totales}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center gap-2 self-start cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Inscribir Mascota / Turno</span>
                </button>
              </div>

              {/* Quota Big Indicators */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase">Cupos Totales</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{activeJornada.cupos_totales}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-center">
                  <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase">Cupos Asignados</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{activeJornada.cupos_ocupados}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 text-center">
                  <p className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase">Disponibles</p>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
                    {Math.max(0, activeJornada.cupos_totales - activeJornada.cupos_ocupados)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Capacidad de Atención</span>
                  <span>{Math.round((activeJornada.cupos_ocupados / activeJornada.cupos_totales) * 100)}% Ocupada</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((activeJornada.cupos_ocupados / activeJornada.cupos_totales) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Requisitos y Pautas */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <p className="font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Requisitos Clínicos para Tutores:</span>
                </p>
                <p className="text-[11px] leading-relaxed opacity-90">{activeJornada.requisitos}</p>
              </div>

            </div>

            {/* Inscribed Pet Patients Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-emerald-600" />
                  <span>Pacientes & Mascotas con Turno Asignado ({activeJornada.inscritos.length})</span>
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                      <th className="pb-2.5">Turno</th>
                      <th className="pb-2.5">Mascota</th>
                      <th className="pb-2.5">Tutor Responsable</th>
                      <th className="pb-2.5">Barrio</th>
                      <th className="pb-2.5">Contacto</th>
                      <th className="pb-2.5">Estado</th>
                      <th className="pb-2.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeJornada.inscritos.map((inscrito) => (
                      <tr key={inscrito.id_inscrito} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 font-extrabold text-[#0D47A1] dark:text-blue-400">
                          {inscrito.hora_turno}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{inscrito.especie === 'canino' ? '🐶' : '🐱'}</span>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white">{inscrito.mascota_nombre}</p>
                              <p className="text-[10px] text-slate-400">{inscrito.raza} &bull; {inscrito.edad_meses} meses</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{inscrito.tutor_nombre}</p>
                          <p className="text-[10px] text-slate-400">C.C. {inscrito.tutor_cedula}</p>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                          {inscrito.barrio}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">
                          {inscrito.tutor_telefono}
                        </td>
                        <td className="py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            inscrito.estado === 'atendido'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          }`}>
                            {inscrito.estado === 'atendido' ? '✓ Atendido' : 'Registrado'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {inscrito.estado === 'inscrito' && (
                            <button
                              onClick={() => onUpdateInscritoStatus(activeJornada.id_jornada, inscrito.id_inscrito, 'atendido')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                            >
                              Marcar Atendido
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeJornada.inscritos.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No hay pacientes registrados aún en esta jornada. Haz clic en "Inscribir Mascota" para abrir el registro.
                </div>
              )}

            </div>

          </div>

          {/* Column 3: Asignación de Personal Médico & Veterinario */}
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 dark:bg-blue-950 text-[#0D47A1] dark:text-blue-300 rounded-xl">
                    <Stethoscope className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Equipo Médico & Veterinario
                    </h4>
                    <p className="text-[10px] text-slate-400">Personal profesional asignado</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0D47A1] dark:text-blue-300 hover:bg-blue-100 text-xs font-bold"
                  title="Asignar Personal"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {activeJornada.personal_asignado.map((p) => (
                  <div
                    key={p.id_personal}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-900 dark:text-white">{p.nombre}</p>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#0D47A1] dark:text-blue-300">
                        {p.cargo.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{p.cargo}</p>
                    {p.tarjeta_profesional && (
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                        📜 {p.tarjeta_profesional}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">{p.entidad}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl text-[11px] text-[#0D47A1] dark:text-blue-300 font-medium">
                <p><strong>Entidad Responsable:</strong> {activeJornada.responsable_entidad}</p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Modal: Programar Nueva Jornada */}
      {showCreateJornadaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-emerald-600" />
                <span>Programar Nueva Jornada de Zoonosis / Salud</span>
              </h3>
              <button onClick={() => setShowCreateJornadaModal(false)} className="text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJornadaSubmit} className="space-y-3 text-xs">
              
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Título de la Jornada *</label>
                <input
                  type="text"
                  required
                  value={jornadaForm.titulo}
                  onChange={(e) => setJornadaForm({ ...jornadaForm, titulo: e.target.value })}
                  placeholder="Ej: Jornada de Esterilización Quirúrgica y Desparasitación"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Lugar Físico *</label>
                  <input
                    type="text"
                    required
                    value={jornadaForm.lugar}
                    onChange={(e) => setJornadaForm({ ...jornadaForm, lugar: e.target.value })}
                    placeholder="Ej: Polideportivo Barrio El Salado"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Barrio / Vereda *</label>
                  <select
                    value={jornadaForm.barrio}
                    onChange={(e) => setJornadaForm({ ...jornadaForm, barrio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {BARRIOS_PURIFICACION.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={jornadaForm.fecha}
                    onChange={(e) => setJornadaForm({ ...jornadaForm, fecha: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Hora Inicio</label>
                  <input
                    type="time"
                    value={jornadaForm.hora_inicio}
                    onChange={(e) => setJornadaForm({ ...jornadaForm, hora_inicio: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Cupos Totales</label>
                  <input
                    type="number"
                    value={jornadaForm.cupos_totales}
                    onChange={(e) => setJornadaForm({ ...jornadaForm, cupos_totales: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Requisitos Clínicos</label>
                <textarea
                  value={jornadaForm.requisitos}
                  onChange={(e) => setJornadaForm({ ...jornadaForm, requisitos: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateJornadaModal(false)}
                  className="px-4 py-2 text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Crear Jornada
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Inscribir Mascota / Asignar Cupo */}
      {showInscribeModal && activeJornada && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600">Registro de Paciente</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Inscripción en {activeJornada.titulo}
                </h3>
              </div>
              <button onClick={() => setShowInscribeModal(false)} className="text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInscribeSubmit} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Nombre del Tutor *</label>
                  <input
                    type="text"
                    required
                    value={inscribeForm.tutor_nombre}
                    onChange={(e) => setInscribeForm({ ...inscribeForm, tutor_nombre: e.target.value })}
                    placeholder="Ej: Andrea Gómez"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Cédula del Tutor *</label>
                  <input
                    type="text"
                    required
                    value={inscribeForm.tutor_cedula}
                    onChange={(e) => setInscribeForm({ ...inscribeForm, tutor_cedula: e.target.value })}
                    placeholder="Ej: 1.110.567.890"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Teléfono Contacto *</label>
                  <input
                    type="tel"
                    required
                    value={inscribeForm.tutor_telefono}
                    onChange={(e) => setInscribeForm({ ...inscribeForm, tutor_telefono: e.target.value })}
                    placeholder="Ej: 314 555 1234"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Barrio de Residencia</label>
                  <select
                    value={inscribeForm.barrio}
                    onChange={(e) => setInscribeForm({ ...inscribeForm, barrio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {BARRIOS_PURIFICACION.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
                <p className="font-black text-slate-900 dark:text-white">Datos de la Mascota</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-[11px]">Nombre</label>
                    <input
                      type="text"
                      required
                      value={inscribeForm.mascota_nombre}
                      onChange={(e) => setInscribeForm({ ...inscribeForm, mascota_nombre: e.target.value })}
                      placeholder="Ej: Toby"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[11px]">Especie</label>
                    <select
                      value={inscribeForm.especie}
                      onChange={(e) => setInscribeForm({ ...inscribeForm, especie: e.target.value as 'canino' | 'felino' })}
                      className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    >
                      <option value="canino">🐶 Canino</option>
                      <option value="felino">🐱 Felino</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[11px]">Turno Hora</label>
                    <input
                      type="time"
                      value={inscribeForm.hora_turno}
                      onChange={(e) => setInscribeForm({ ...inscribeForm, hora_turno: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInscribeModal(false)}
                  className="px-4 py-2 text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirmar Asignación de Cupo
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Asignar Personal Veterinario */}
      {showAddStaffModal && activeJornada && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Asignar Funcionario / Veterinario
              </h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={staffForm.nombre}
                  onChange={(e) => setStaffForm({ ...staffForm, nombre: e.target.value })}
                  placeholder="Ej: Dr. Fernando Ruiz"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Cargo Operativo</label>
                <input
                  type="text"
                  value={staffForm.cargo}
                  onChange={(e) => setStaffForm({ ...staffForm, cargo: e.target.value })}
                  placeholder="Ej: Médico Veterinario Anestesiólogo"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Tarjeta Profesional</label>
                <input
                  type="text"
                  value={staffForm.tarjeta_profesional}
                  onChange={(e) => setStaffForm({ ...staffForm, tarjeta_profesional: e.target.value })}
                  placeholder="Ej: COMVEZCOL # 20114"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Asignar a la Jornada
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
