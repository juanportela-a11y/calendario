import { create } from 'zustand';
import { 
  ReporteVia, 
  CorteProgramado, 
  JornadaSaludEsterilizacion, 
  RegistroAuditoria,
  OpsGlobalFilterState,
  MapLayersVisibility,
  EstadoVia,
  EstadoCorte,
  InscritoJornada,
  PersonalSaludAsignado,
  EncuestaCiudadana,
  ReporteCiudadanoDTO
} from '../types';
import { 
  INITIAL_VIAS, 
  INITIAL_CORTES, 
  INITIAL_JORNADAS_SALUD, 
  INITIAL_AUDIT_LOGS,
  INITIAL_ENCUESTAS,
  RUTAS_DESVIOS_SUGERIDOS,
  RutaDesvio
} from '../data/municipalOpsData';
import { 
  seedInitialOpsDataIfEmpty,
  subscribeToVias,
  saveViaToFirestore,
  subscribeToCortes,
  saveCorteToFirestore,
  subscribeToJornadas,
  saveJornadaToFirestore,
  subscribeToAuditLogs,
  saveAuditLogToFirestore,
  subscribeToEncuestas,
  saveEncuestaToFirestore,
  subscribeToNotifiedUsers,
  saveNotifiedUserToFirestore
} from '../adapters/firebaseOpsAdapter';
import { OfflineStorageManager, STORAGE_KEYS } from '../utils/offlineStorage';

interface OpsState {
  vias: ReporteVia[];
  cortes: CorteProgramado[];
  jornadas: JornadaSaludEsterilizacion[];
  auditLogs: RegistroAuditoria[];
  encuestas: EncuestaCiudadana[];
  rutasDesvios: RutaDesvio[];
  isFirebaseSynced: boolean;
  isLoading: boolean;
  lastAuditSyncTime: string;
  activeTab: 'vias' | 'cortes' | 'salud' | 'participacion' | 'rio';
  layersVisibility: MapLayersVisibility;
  filters: OpsGlobalFilterState;
  toastMessage: string | null;
  selectedDesvio: RutaDesvio | null;
  userPoints: number;
  notifiedUsers: { nombre: string; fecha: string; avisoTitulo: string }[];
  reportComments: Record<number, { autor: string; texto: string; fecha: string; rol?: string }[]>;

  // Actions
  setActiveTab: (tab: 'vias' | 'cortes' | 'salud' | 'participacion' | 'rio') => void;
  toggleLayer: (layerKey: keyof MapLayersVisibility) => void;
  setFilters: (filters: Partial<OpsGlobalFilterState> | ((prev: OpsGlobalFilterState) => OpsGlobalFilterState)) => void;
  resetFilters: () => void;
  showToast: (msg: string) => void;
  setSelectedDesvio: (desvio: RutaDesvio | null) => void;
  initFirestoreSync: () => () => void;
  addAuditLog: (log: Omit<RegistroAuditoria, 'id_log' | 'timestamp'> & { timestamp?: string; id_log?: number }) => Promise<void>;
  addUserPoints: (pts: number, motivo: string) => void;
  markNoticeAsReadByCitizen: (avisoTitulo: string, userName: string, noticeId?: number) => Promise<void> | void;
  addReportComment: (idVia: number, autor: string, texto: string, rol?: string) => void;
  deleteReporteVia: (idVia: number, userMod?: string) => Promise<void>;
  addCustomEncuesta: (pregunta: string, opciones: string[], categoria?: 'obras' | 'salud' | 'cultura' | 'servicios', creadoPor?: string) => Promise<void>;
  deleteCustomEncuesta: (idEncuesta: number, userMod?: string) => Promise<void>;
  addReporteIncidentFromMap: (tipo: 'vias' | 'cortes' | 'jornadas', desc: string, coords: [number, number], barrio?: string, user?: string) => Promise<void>;

  // Domain Actions
  addVia: (viaData: Omit<ReporteVia, 'id_via'>) => Promise<void>;
  updateViaStatus: (idVia: number, nuevoEstado: EstadoVia, fotoDespues?: string, comentariosTecnicos?: string, userMod?: string) => Promise<void>;
  updateViaCuadrilla: (idVia: number, cuadrilla: string, userMod?: string) => Promise<void>;
  updateViaCoords: (idVia: number, newCoords: [number, number], userMod?: string) => Promise<void>;

  addCorte: (corteData: Omit<CorteProgramado, 'id_corte'>) => Promise<void>;
  updateCorteStatus: (idCorte: number, nuevoEstado: EstadoCorte, userMod?: string) => Promise<void>;
  updateCorteCoords: (idCorte: number, newCoords: [number, number], userMod?: string) => Promise<void>;

  addJornada: (jornadaData: Omit<JornadaSaludEsterilizacion, 'id_jornada'>) => Promise<void>;
  addInscrito: (idJornada: number, nuevoInscrito: Omit<InscritoJornada, 'id_inscrito' | 'id_jornada'>) => Promise<void>;
  addPersonal: (idJornada: number, nuevoPersonal: Omit<PersonalSaludAsignado, 'id_personal'>) => Promise<void>;
  updateInscritoStatus: (idJornada: number, idInscrito: number, nuevoEstado: 'inscrito' | 'atendido' | 'cancelado') => Promise<void>;
  updateJornadaCoords: (idJornada: number, newCoords: [number, number], userMod?: string) => Promise<void>;

  // Participación Ciudadana
  submitReporteCiudadano: (reporte: ReporteCiudadanoDTO) => Promise<void>;
  voteEncuesta: (idEncuesta: number, idOpcion: number, userId: string) => Promise<void>;
}

export const useOpsStore = create<OpsState>((set, get) => ({
  vias: INITIAL_VIAS,
  cortes: INITIAL_CORTES,
  jornadas: INITIAL_JORNADAS_SALUD,
  auditLogs: OfflineStorageManager.getCache(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  encuestas: INITIAL_ENCUESTAS,
  rutasDesvios: RUTAS_DESVIOS_SUGERIDOS,
  isFirebaseSynced: false,
  isLoading: true,
  lastAuditSyncTime: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  activeTab: 'vias',
  layersVisibility: {
    vias: true,
    cortes: true,
    salud: true,
    radiosAfectacion: true,
    rutasDesvios: true
  },
  filters: {
    searchQuery: '',
    barrioSeleccionado: 'todos',
    severidadFiltro: 'todas',
    estadoFiltro: 'todos'
  },
  toastMessage: null,
  selectedDesvio: null,
  userPoints: 150,
  notifiedUsers: [],
  reportComments: {
    101: [
      { autor: 'Ing. Obras Públicas', texto: 'Se ha programado cuadrilla de bacheo para esta semana.', fecha: '2026-08-20 09:30', rol: 'Funcionario' },
      { autor: 'Vecino Barrio Centro', texto: 'Agradecemos la pronta atención en este cruce concurrido.', fecha: '2026-08-20 14:15', rol: 'Ciudadano' }
    ]
  },

  addUserPoints: (pts, motivo) => {
    set((state) => {
      const newPoints = state.userPoints + pts;
      return { userPoints: newPoints };
    });
    get().showToast(`🏆 +${pts} PTS cívicos ganados: ${motivo}`);
  },

  markNoticeAsReadByCitizen: async (avisoTitulo, userName, noticeId) => {
    const { notifiedUsers, addUserPoints, showToast } = get();
    const alreadyNotified = notifiedUsers.some(u => u.nombre === userName && u.avisoTitulo === avisoTitulo);
    if (!alreadyNotified) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      set({
        notifiedUsers: [
          { nombre: userName, fecha: timeStr, avisoTitulo },
          ...notifiedUsers
        ]
      });
      try {
        await saveNotifiedUserToFirestore(userName, noticeId);
      } catch (e) {
        console.warn('Error saving notice read to firestore:', e);
      }
      addUserPoints(15, 'Confirmación de lectura de aviso urgente');
      showToast('✓ ¡Has confirmado la lectura del aviso municipal!');
    }
  },

  addReportComment: (idVia, autor, texto, rol = 'Ciudadano') => {
    const { reportComments, showToast } = get();
    const now = new Date();
    const fechaStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const existing = reportComments[idVia] || [];
    const updated = [...existing, { autor, texto, fecha: fechaStr, rol }];
    
    set({
      reportComments: {
        ...reportComments,
        [idVia]: updated
      }
    });
    showToast('✓ Comentario o nota pública registrada en el reporte.');
  },

  deleteReporteVia: async (idVia, userMod = 'Administrador') => {
    const { vias, showToast } = get();
    const target = vias.find(v => v.id_via === idVia);
    if (!target) return;

    set({ vias: vias.filter(v => v.id_via !== idVia) });

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: userMod,
      funcionario_rol: 'Administración Municipal',
      modulo: 'Vías',
      accion: 'ACTUALIZACIÓN_ESTADO',
      descripcion: `Reporte #${idVia} marcado como resuelto y archivado del sistema: "${target.titulo}"`,
      id_referencia: idVia
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast('✓ Reporte marcado como solucionado y retirado con éxito.');
  },

  addCustomEncuesta: async (pregunta, opcionesText, categoria = 'obras', creadoPor = 'Funcionario') => {
    const { encuestas, showToast } = get();
    const newId = Date.now();
    const newEncuesta: EncuestaCiudadana = {
      id_encuesta: newId,
      titulo: pregunta,
      descripcion: `Consulta ciudadana habilitada por la administración de Purificación.`,
      categoria,
      fecha_cierre: '2026-12-31',
      opciones: opcionesText.map((txt, idx) => ({
        id_opcion: idx + 1,
        texto: txt,
        votos: 0
      })),
      total_votos: 0,
      votos_usuarios: {},
      estado: 'activa'
    };

    set({ encuestas: [newEncuesta, ...encuestas] });
    await saveEncuestaToFirestore(newEncuesta);

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: creadoPor,
      funcionario_rol: 'Alcaldía Municipal',
      modulo: 'Ciudadanía',
      accion: 'CREACIÓN',
      descripcion: `Publicó nueva encuesta ciudadana #${newId}: "${pregunta}"`,
      id_referencia: newId
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast('✓ ¡Nueva encuesta ciudadana publicada y disponible para votación!');
  },

  deleteCustomEncuesta: async (idEncuesta, userMod = 'Funcionario') => {
    const { encuestas, showToast } = get();
    set({ encuestas: encuestas.filter(e => e.id_encuesta !== idEncuesta) });
    showToast('✓ Encuesta ciudadana eliminada.');
  },

  addReporteIncidentFromMap: async (tipo, desc, coords, barrio = 'Ubicación GPS Mapa', user = 'Ciudadano') => {
    const { vias, cortes, jornadas, showToast } = get();
    const newId = Date.now();

    if (tipo === 'vias') {
      const newVia: ReporteVia = {
        id_via: newId,
        titulo: `Incidencia en vía: ${desc.slice(0, 30)}`,
        direccion: `Coordenadas [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`,
        barrio: barrio,
        coordenadas: coords,
        severidad: 'media',
        tipo_dano: 'Hueco / Falla Georreferenciada',
        estado: 'reportado',
        descripcion: desc,
        cuadrilla_asignada: 'Por asignar en despacho',
        fecha_reporte: new Date().toISOString().replace('T', ' ').slice(0, 16),
        reportado_por: user,
        prioridad: 'media',
        origen_reporte: 'ciudadano'
      };
      set({ vias: [newVia, ...vias] });
      await saveViaToFirestore(newVia);
    } else if (tipo === 'cortes') {
      const newCorte: CorteProgramado = {
        id_corte: newId,
        titulo: `Afectación en Servicio: ${desc.slice(0, 30)}`,
        tipo: 'agua',
        empresa_prestadora: 'EMPUR E.S.P.',
        motivo: desc,
        sector_barrio: barrio,
        coordenadas: coords,
        radio_afectacion_m: 500,
        cuadrilla_responsable: 'Cuadrilla de Redes EMPOPUR',
        fecha_inicio: new Date().toISOString().split('T')[0],
        hora_inicio: '08:00',
        fecha_estimada_fin: new Date().toISOString().split('T')[0],
        hora_estimada_fin: '16:00',
        estado: 'programado',
        urgente: false,
        creado_por: user
      };
      set({ cortes: [newCorte, ...cortes] });
      await saveCorteToFirestore(newCorte);
    }

    showToast('✓ ¡Punto de incidencia guardado y publicado en el mapa interactivo!');
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleLayer: (layerKey) => set((state) => ({
    layersVisibility: {
      ...state.layersVisibility,
      [layerKey]: !state.layersVisibility[layerKey]
    }
  })),

  setFilters: (filterUpdate) => set((state) => ({
    filters: typeof filterUpdate === 'function' ? filterUpdate(state.filters) : { ...state.filters, ...filterUpdate }
  })),

  resetFilters: () => set({
    filters: {
      searchQuery: '',
      barrioSeleccionado: 'todos',
      severidadFiltro: 'todas',
      estadoFiltro: 'todos'
    }
  }),

  setSelectedDesvio: (desvio) => set({ selectedDesvio: desvio }),

  showToast: (msg: string) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 4000);
  },

  initFirestoreSync: () => {
    let unsubs: (() => void)[] = [];

    const initialize = async () => {
      try {
        set({ isLoading: true });
        await seedInitialOpsDataIfEmpty();

        const unsubVias = subscribeToVias((vias) => {
          if (vias && vias.length > 0) set({ vias });
        });

        const unsubCortes = subscribeToCortes((cortes) => {
          if (cortes && cortes.length > 0) set({ cortes });
        });

        const unsubJornadas = subscribeToJornadas((jornadas) => {
          if (jornadas && jornadas.length > 0) set({ jornadas });
        });

        const unsubLogs = subscribeToAuditLogs((incomingLogs) => {
          if (incomingLogs && incomingLogs.length > 0) {
            // Sort by newest first
            const sorted = [...incomingLogs].sort((a, b) => b.id_log - a.id_log);
            const nowTime = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            set({ auditLogs: sorted, lastAuditSyncTime: nowTime });
            OfflineStorageManager.saveCache(STORAGE_KEYS.AUDIT_LOGS, sorted);
          }
        });

        const unsubEncuestas = subscribeToEncuestas((incomingEncuestas) => {
          if (incomingEncuestas && incomingEncuestas.length > 0) {
            set({ encuestas: incomingEncuestas });
          }
        });

        const unsubNotified = subscribeToNotifiedUsers((usersList) => {
          if (usersList && usersList.length > 0) {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            set({
              notifiedUsers: usersList.map(u => ({
                nombre: u,
                fecha: timeStr,
                avisoTitulo: 'Aviso Municipal Oficial'
              }))
            });
          }
        });

        unsubs = [unsubVias, unsubCortes, unsubJornadas, unsubLogs, unsubEncuestas, unsubNotified];
        set({ isFirebaseSynced: true, isLoading: false });
      } catch (err) {
        console.warn('Fallback a almacenamiento local/memoria:', err);
        set({ isLoading: false, isFirebaseSynced: false });
      }
    };

    initialize();

    return () => {
      unsubs.forEach(unsub => unsub && unsub());
    };
  },

  addAuditLog: async (logInput) => {
    const { auditLogs } = get();
    const now = new Date();
    const logId = logInput.id_log || Date.now();
    const formattedTimestamp = logInput.timestamp || `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    
    const newLog: RegistroAuditoria = {
      id_log: logId,
      timestamp: formattedTimestamp,
      funcionario_nombre: logInput.funcionario_nombre,
      funcionario_rol: logInput.funcionario_rol,
      funcionario_avatar: logInput.funcionario_avatar,
      modulo: logInput.modulo,
      accion: logInput.accion,
      descripcion: logInput.descripcion,
      id_referencia: logInput.id_referencia,
      detalles_anteriores: logInput.detalles_anteriores,
      detalles_nuevos: logInput.detalles_nuevos
    };

    const updated = [newLog, ...auditLogs.filter(l => l.id_log !== logId)];
    const nowTime = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    set({ auditLogs: updated, lastAuditSyncTime: nowTime });
    OfflineStorageManager.saveCache(STORAGE_KEYS.AUDIT_LOGS, updated);

    try {
      await saveAuditLogToFirestore(newLog);
    } catch (err) {
      console.warn('Could not save audit log directly to Firestore (saved offline):', err);
    }
  },

  addVia: async (viaData) => {
    const { vias, showToast } = get();
    const newId = Date.now();
    const newVia: ReporteVia = {
      ...viaData,
      id_via: newId,
      fecha_reporte: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const updated = [newVia, ...vias];
    set({ vias: updated });
    await saveViaToFirestore(newVia);

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: viaData.reportado_por || 'Funcionario Municipal',
      funcionario_rol: 'Infraestructura y Vías',
      modulo: 'Vías',
      accion: 'CREACIÓN',
      descripcion: `Creó reporte vial "${viaData.titulo}" en ${viaData.barrio}`,
      id_referencia: newId,
      detalles_nuevos: `Severidad: ${viaData.severidad} | Tipo: ${viaData.tipo_dano}`
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`✓ Reporte vial #${newId} creado correctamente.`);
  },

  updateViaStatus: async (idVia, nuevoEstado, fotoDespues, comentariosTecnicos, userMod = 'Ing. Carlos Mendoza') => {
    const { vias, showToast } = get();
    const target = vias.find(v => v.id_via === idVia);
    if (!target) return;

    const prevEstado = target.estado;
    const now = new Date();
    const updated: ReporteVia = {
      ...target,
      estado: nuevoEstado,
      foto_despues: fotoDespues || target.foto_despues,
      fecha_actualizacion: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`
    };

    set({ vias: vias.map(v => v.id_via === idVia ? updated : v) });
    await saveViaToFirestore(updated);

    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: userMod,
      funcionario_rol: 'Secretaría de Infraestructura y Vías',
      modulo: 'Vías',
      accion: nuevoEstado === 'completado' ? 'CIERRE_INCIDENCIA' : 'ACTUALIZACIÓN_ESTADO',
      descripcion: `Actualizó vía #${idVia} de [${prevEstado}] a [${nuevoEstado}]. ${comentariosTecnicos ? 'Nota: ' + comentariosTecnicos : ''}`,
      id_referencia: idVia,
      detalles_anteriores: `Estado: ${prevEstado}`,
      detalles_nuevos: `Estado: ${nuevoEstado} | Modificado por: ${userMod}`
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`✓ Estado de vía #${idVia} actualizado a [${nuevoEstado}].`);
  },

  updateViaCuadrilla: async (idVia, cuadrilla, userMod = 'Administrador Municipal') => {
    const { vias, showToast } = get();
    const target = vias.find(v => v.id_via === idVia);
    if (!target) return;

    const prevCuadrilla = target.cuadrilla_asignada || 'Sin asignar';
    const now = new Date();
    const updated: ReporteVia = {
      ...target,
      cuadrilla_asignada: cuadrilla,
      fecha_actualizacion: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`
    };

    set({ vias: vias.map(v => v.id_via === idVia ? updated : v) });
    await saveViaToFirestore(updated);

    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: userMod,
      funcionario_rol: 'Panel de Despacho Operativo',
      modulo: 'Vías',
      accion: 'ASIGNACIÓN_CUADRILLA',
      descripcion: `Asignó cuadrilla a vía #${idVia}: ${cuadrilla}`,
      id_referencia: idVia,
      detalles_anteriores: `Cuadrilla previa: ${prevCuadrilla}`,
      detalles_nuevos: `Cuadrilla asignada: ${cuadrilla}`
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`✓ Cuadrilla asignada a reporte #${idVia}.`);
  },

  updateViaCoords: async (idVia, newCoords, userMod = 'Operador GIS') => {
    const { vias, showToast } = get();
    const target = vias.find(v => v.id_via === idVia);
    if (!target) return;

    const updated: ReporteVia = { ...target, coordenadas: newCoords };
    set({ vias: vias.map(v => v.id_via === idVia ? updated : v) });
    await saveViaToFirestore(updated);

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: userMod,
      funcionario_rol: 'Control SIG / Vías',
      modulo: 'Mapa',
      accion: 'CAMBIO_COORDENADAS',
      descripcion: `Ajustó ubicación GPS de falla vial #${idVia} a [${newCoords[0].toFixed(4)}, ${newCoords[1].toFixed(4)}]`,
      id_referencia: idVia
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`📍 Coordenadas de vía #${idVia} actualizadas.`);
  },

  addCorte: async (corteData) => {
    const { cortes, showToast } = get();
    const newId = Date.now();
    const newCorte: CorteProgramado = {
      ...corteData,
      id_corte: newId
    };

    const updated = [newCorte, ...cortes];
    set({ cortes: updated });
    await saveCorteToFirestore(newCorte);

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: corteData.creado_por || 'Jefe de Redes',
      funcionario_rol: 'Servicios Públicos',
      modulo: 'Cortes',
      accion: 'CREACIÓN',
      descripcion: `Programó suspensión de servicio de ${corteData.tipo.toUpperCase()} en ${corteData.sector_barrio}`,
      id_referencia: newId,
      detalles_nuevos: `Empresa: ${corteData.empresa_prestadora} | Radio: ${corteData.radio_afectacion_m}m`
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`✓ Corte de servicio #${newId} registrado.`);
  },

  updateCorteStatus: async (idCorte, nuevoEstado, userMod = 'Central Operativa') => {
    const { cortes, showToast } = get();
    const target = cortes.find(c => c.id_corte === idCorte);
    if (!target) return;

    const prevEstado = target.estado;
    const updated: CorteProgramado = { ...target, estado: nuevoEstado };
    set({ cortes: cortes.map(c => c.id_corte === idCorte ? updated : c) });
    await saveCorteToFirestore(updated);

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: userMod,
      funcionario_rol: 'Empresas de Servicios Públicos',
      modulo: 'Cortes',
      accion: 'ACTUALIZACIÓN_ESTADO',
      descripcion: `Cambió estado de corte de servicio #${idCorte} a [${nuevoEstado}]`,
      id_referencia: idCorte,
      detalles_anteriores: `Estado: ${prevEstado}`,
      detalles_nuevos: `Estado: ${nuevoEstado}`
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`✓ Estado de corte #${idCorte} actualizado a [${nuevoEstado}].`);
  },

  updateCorteCoords: async (idCorte, newCoords, userMod = 'Coordinador SIG') => {
    const { cortes, showToast } = get();
    const target = cortes.find(c => c.id_corte === idCorte);
    if (!target) return;

    const updated: CorteProgramado = { ...target, coordenadas: newCoords };
    set({ cortes: cortes.map(c => c.id_corte === idCorte ? updated : c) });
    await saveCorteToFirestore(updated);
    showToast(`📍 Epicentro de corte #${idCorte} actualizado.`);
  },

  addJornada: async (jornadaData) => {
    const { jornadas, showToast } = get();
    const newId = Date.now();
    const newJornada: JornadaSaludEsterilizacion = {
      ...jornadaData,
      id_jornada: newId,
      cupos_ocupados: 0,
      inscritos: [],
      personal_asignado: jornadaData.personal_asignado || []
    };

    const updated = [newJornada, ...jornadas];
    set({ jornadas: updated });
    await saveJornadaToFirestore(newJornada);

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: jornadaData.creado_por || 'Secretaría de Salud',
      funcionario_rol: 'Zoonosis y Salud Pública',
      modulo: 'Salud & Esterilización',
      accion: 'CREACIÓN',
      descripcion: `Programó jornada de salud "${jornadaData.titulo}" en ${jornadaData.barrio}`,
      id_referencia: newId,
      detalles_nuevos: `Cupos: ${jornadaData.cupos_totales} | Fecha: ${jornadaData.fecha}`
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`✓ Jornada de salud #${newId} agendada.`);
  },

  addInscrito: async (idJornada, nuevoInscritoData) => {
    const { jornadas, showToast } = get();
    const target = jornadas.find(j => j.id_jornada === idJornada);
    if (!target) return;

    if (target.cupos_ocupados >= target.cupos_totales) {
      showToast('⚠️ No hay cupos disponibles para esta jornada.');
      return;
    }

    const newInscritoId = Date.now();
    const newInscrito: InscritoJornada = {
      ...nuevoInscritoData,
      id_inscrito: newInscritoId,
      id_jornada: idJornada
    };

    const updated: JornadaSaludEsterilizacion = {
      ...target,
      cupos_ocupados: target.cupos_ocupados + 1,
      inscritos: [...target.inscritos, newInscrito]
    };

    set({ jornadas: jornadas.map(j => j.id_jornada === idJornada ? updated : j) });
    await saveJornadaToFirestore(updated);

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: 'Central de Citas Zoonosis',
      funcionario_rol: 'Atención Ciudadana',
      modulo: 'Salud & Esterilización',
      accion: 'REGISTRO_INSCRIPCIÓN',
      descripcion: `Inscribió a mascota "${newInscrito.mascota_nombre}" (${newInscrito.especie}) - Tutor: ${newInscrito.tutor_nombre}`,
      id_referencia: idJornada,
      detalles_nuevos: `Turno: ${newInscrito.hora_turno} | Barrio: ${newInscrito.barrio}`
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`✓ Mascota inscrita exitosamente.`);
  },

  addPersonal: async (idJornada, nuevoPersonalData) => {
    const { jornadas, showToast } = get();
    const target = jornadas.find(j => j.id_jornada === idJornada);
    if (!target) return;

    const newPersonalId = Date.now();
    const newStaff: PersonalSaludAsignado = {
      ...nuevoPersonalData,
      id_personal: newPersonalId
    };

    const updated: JornadaSaludEsterilizacion = {
      ...target,
      personal_asignado: [...target.personal_asignado, newStaff]
    };

    set({ jornadas: jornadas.map(j => j.id_jornada === idJornada ? updated : j) });
    await saveJornadaToFirestore(updated);

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: 'Secretaría de Salud',
      funcionario_rol: 'Administración',
      modulo: 'Salud & Esterilización',
      accion: 'ASIGNACIÓN_PERSONAL',
      descripcion: `Asignó al profesional ${newStaff.nombre} (${newStaff.cargo})`,
      id_referencia: idJornada
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`✓ Funcionario asignado.`);
  },

  updateInscritoStatus: async (idJornada, idInscrito, nuevoEstado) => {
    const { jornadas, showToast } = get();
    const target = jornadas.find(j => j.id_jornada === idJornada);
    if (!target) return;

    const updated: JornadaSaludEsterilizacion = {
      ...target,
      inscritos: target.inscritos.map(i => i.id_inscrito === idInscrito ? { ...i, estado: nuevoEstado } : i)
    };

    set({ jornadas: jornadas.map(j => j.id_jornada === idJornada ? updated : j) });
    await saveJornadaToFirestore(updated);
    showToast(`✓ Estado de paciente actualizado.`);
  },

  updateJornadaCoords: async (idJornada, newCoords, userMod = 'Coordinador Salud') => {
    const { jornadas, showToast } = get();
    const target = jornadas.find(j => j.id_jornada === idJornada);
    if (!target) return;

    const updated: JornadaSaludEsterilizacion = { ...target, coordenadas: newCoords };
    set({ jornadas: jornadas.map(j => j.id_jornada === idJornada ? updated : j) });
    await saveJornadaToFirestore(updated);
    showToast(`📍 Punto de atención actualizado.`);
  },

  submitReporteCiudadano: async (reporte) => {
    const { vias, showToast } = get();
    const newId = Date.now();
    const coords = reporte.coordenadas || [3.8582, -74.9285];

    if (reporte.tipo === 'via_danada') {
      const newVia: ReporteVia = {
        id_via: newId,
        titulo: reporte.titulo,
        direccion: reporte.direccion,
        barrio: reporte.barrio,
        coordenadas: coords,
        severidad: 'media',
        tipo_dano: 'Reporte Vecinal / Falla Asfáltica',
        estado: 'reportado',
        descripcion: `${reporte.descripcion} - Reportado por ciudadano: ${reporte.nombre_ciudadano} (Tel: ${reporte.telefono})`,
        foto_antes: reporte.foto_url || 'https://images.unsplash.com/photo-1584463699039-b9d997d91d6f?w=700&auto=format&fit=crop&q=80',
        cuadrilla_asignada: 'Por asignar en despacho',
        fecha_reporte: new Date().toISOString().replace('T', ' ').slice(0, 16),
        reportado_por: `Ciudadano: ${reporte.nombre_ciudadano}`,
        prioridad: 'alta',
        origen_reporte: 'ciudadano',
        telefono_contacto: reporte.telefono
      };

      set({ vias: [newVia, ...vias] });
      await saveViaToFirestore(newVia);
    }

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: reporte.nombre_ciudadano,
      funcionario_rol: 'Participación Ciudadana',
      modulo: 'Ciudadanía',
      accion: 'REPORTE_CIUDADANO',
      descripcion: `Reporte vecinal recibido: "${reporte.titulo}" en ${reporte.barrio}. Tel: ${reporte.telefono}`,
      id_referencia: newId,
      detalles_nuevos: `Tipo: ${reporte.tipo} | Coordenadas: [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`
    };

    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
    await saveAuditLogToFirestore(log);
    showToast(`✓ ¡Gracias! Tu reporte #${newId} fue radicado ante la Alcaldía.`);
  },

  voteEncuesta: async (idEncuesta, idOpcion, userId) => {
    const { encuestas, showToast } = get();
    const target = encuestas.find(e => e.id_encuesta === idEncuesta);
    if (!target) return;

    if (target.votos_usuarios && target.votos_usuarios[userId]) {
      showToast('⚠️ Ya has emitido tu voto en esta consulta ciudadana.');
      return;
    }

    const updatedOpciones = target.opciones.map(opt => 
      opt.id_opcion === idOpcion ? { ...opt, votos: opt.votos + 1 } : opt
    );

    const updatedEncuesta: EncuestaCiudadana = {
      ...target,
      opciones: updatedOpciones,
      total_votos: target.total_votos + 1,
      votos_usuarios: {
        ...(target.votos_usuarios || {}),
        [userId]: idOpcion
      }
    };

    set({ encuestas: encuestas.map(e => e.id_encuesta === idEncuesta ? updatedEncuesta : e) });
    await saveEncuestaToFirestore(updatedEncuesta);

    const now = new Date();
    const log: RegistroAuditoria = {
      id_log: Date.now(),
      timestamp: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      funcionario_nombre: `Ciudadano (${userId.slice(0, 8)})`,
      funcionario_rol: 'Votante Ciudadano',
      modulo: 'Ciudadanía',
      accion: 'VOTO_ENCUESTA',
      descripcion: `Votó en consulta ciudadana #${idEncuesta}: "${target.titulo.slice(0, 40)}..."`,
      id_referencia: idEncuesta
    };

    set((s) => ({ 
      auditLogs: [log, ...s.auditLogs],
      lastAuditSyncTime: now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }));
    await saveAuditLogToFirestore(log);
    showToast('✓ ¡Voto registrado con éxito! Gracias por participar.');
  }
}));
