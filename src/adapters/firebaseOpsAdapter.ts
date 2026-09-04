import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  onSnapshot, 
  writeBatch,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  ReporteVia, 
  CorteProgramado, 
  JornadaSaludEsterilizacion, 
  RegistroAuditoria,
  Evento,
  Aviso,
  Usuario,
  EncuestaCiudadana,
  ReporteFallaCiudadana
} from '../types';
import { 
  INITIAL_VIAS, 
  INITIAL_CORTES, 
  INITIAL_JORNADAS_SALUD, 
  INITIAL_AUDIT_LOGS,
  INITIAL_FALLAS
} from '../data/municipalOpsData';
import { INITIAL_EVENTS, INITIAL_NOTICES, INITIAL_USERS } from '../data/initialData';

// Collections names
export const COLLECTIONS = {
  VIAS: 'vias',
  CORTES: 'cortes',
  JORNADAS_SALUD: 'jornadas_salud',
  AUDIT_LOGS: 'audit_logs',
  EVENTOS: 'eventos',
  AVISOS: 'avisos',
  USUARIOS: 'usuarios',
  ENCUESTAS: 'encuestas',
  LECTURA_AVISOS: 'lectura_avisos',
  REPORTES_FALLAS: 'reportes_fallas',
  NOTIFICACIONES: 'notificaciones'
};

// Helper to remove undefined fields recursively to prevent Firestore errors
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      clean[key] = sanitizeForFirestore(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// Seed initial operational data, events, notices, and users to Firestore if collections are empty
export const seedInitialOpsDataIfEmpty = async () => {
  try {
    const usersSnap = await getDocs(collection(db, COLLECTIONS.USUARIOS));
    if (usersSnap.empty) {
      console.log('Seeding initial Usuarios into Firestore...');
      const batch = writeBatch(db);
      INITIAL_USERS.forEach((item) => {
        const ref = doc(db, COLLECTIONS.USUARIOS, String(item.id_usuario));
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
    }

    const eventsSnap = await getDocs(collection(db, COLLECTIONS.EVENTOS));
    if (eventsSnap.empty) {
      console.log('Seeding initial Eventos into Firestore...');
      const batch = writeBatch(db);
      INITIAL_EVENTS.forEach((item) => {
        const ref = doc(db, COLLECTIONS.EVENTOS, String(item.id_evento));
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
    }

    const avisosSnap = await getDocs(collection(db, COLLECTIONS.AVISOS));
    if (avisosSnap.empty) {
      console.log('Seeding initial Avisos into Firestore...');
      const batch = writeBatch(db);
      INITIAL_NOTICES.forEach((item) => {
        const ref = doc(db, COLLECTIONS.AVISOS, String(item.id_aviso));
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
    }

    const viasSnap = await getDocs(collection(db, COLLECTIONS.VIAS));
    if (viasSnap.empty) {
      console.log('Seeding initial Vías into Firestore...');
      const batch = writeBatch(db);
      INITIAL_VIAS.forEach((item) => {
        const ref = doc(db, COLLECTIONS.VIAS, String(item.id_via));
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
    }

    const cortesSnap = await getDocs(collection(db, COLLECTIONS.CORTES));
    if (cortesSnap.empty) {
      console.log('Seeding initial Cortes into Firestore...');
      const batch = writeBatch(db);
      INITIAL_CORTES.forEach((item) => {
        const ref = doc(db, COLLECTIONS.CORTES, String(item.id_corte));
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
    }

    const jornadasSnap = await getDocs(collection(db, COLLECTIONS.JORNADAS_SALUD));
    if (jornadasSnap.empty) {
      console.log('Seeding initial Jornadas into Firestore...');
      const batch = writeBatch(db);
      INITIAL_JORNADAS_SALUD.forEach((item) => {
        const ref = doc(db, COLLECTIONS.JORNADAS_SALUD, String(item.id_jornada));
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
    }

    const logsSnap = await getDocs(collection(db, COLLECTIONS.AUDIT_LOGS));
    if (logsSnap.empty) {
      console.log('Seeding initial Audit Logs into Firestore...');
      const batch = writeBatch(db);
      INITIAL_AUDIT_LOGS.forEach((item) => {
        const ref = doc(db, COLLECTIONS.AUDIT_LOGS, String(item.id_log));
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error checking/seeding Firestore operational data:', error);
  }
};

// --- REAL-TIME EVENTOS ---
export const subscribeToEventos = (callback: (eventos: Evento[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.EVENTOS);
  return onSnapshot(q, (snapshot) => {
    const list: Evento[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Evento);
    });
    // Sort by fecha ascending
    list.sort((a, b) => a.fecha.localeCompare(b.fecha));
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToEventos error:', err);
  });
};

export const saveEventoToFirestore = async (evento: Evento) => {
  const ref = doc(db, COLLECTIONS.EVENTOS, String(evento.id_evento));
  const sanitized = sanitizeForFirestore({
    id_evento: Number(evento.id_evento),
    nombre: String(evento.nombre || '').trim(),
    fecha: String(evento.fecha || '').trim(),
    hora_inicio: String(evento.hora_inicio || '08:00').trim(),
    hora_fin: evento.hora_fin ? String(evento.hora_fin).trim() : null,
    lugar: String(evento.lugar || '').trim(),
    descripcion: String(evento.descripcion || '').trim(),
    id_categoria: Number(evento.id_categoria || 1),
    id_organizador: Number(evento.id_organizador || 1),
    estado: evento.estado || 'programado',
    info_adicional: evento.info_adicional ? String(evento.info_adicional).trim() : null,
    destacado: Boolean(evento.destacado),
    imagen_url: evento.imagen_url ? String(evento.imagen_url).trim() : null,
    cupo_maximo: evento.cupo_maximo ? Number(evento.cupo_maximo) : null,
    requiere_inscripcion: Boolean(evento.requiere_inscripcion)
  });
  await setDoc(ref, sanitized, { merge: true });
};

export const deleteEventoFromFirestore = async (id_evento: number) => {
  const ref = doc(db, COLLECTIONS.EVENTOS, String(id_evento));
  await deleteDoc(ref);
};

// --- REAL-TIME AVISOS ---
export const subscribeToAvisos = (callback: (avisos: Aviso[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.AVISOS);
  return onSnapshot(q, (snapshot) => {
    const list: Aviso[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Aviso);
    });
    list.sort((a, b) => b.fecha_publicacion.localeCompare(a.fecha_publicacion));
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToAvisos error:', err);
  });
};

export const saveAvisoToFirestore = async (aviso: Aviso) => {
  const ref = doc(db, COLLECTIONS.AVISOS, String(aviso.id_aviso));
  const sanitized = sanitizeForFirestore({
    id_aviso: Number(aviso.id_aviso),
    titulo: String(aviso.titulo || '').trim(),
    tipo: aviso.tipo || 'comunicado_alcaldia',
    descripcion: String(aviso.descripcion || '').trim(),
    fecha_publicacion: String(aviso.fecha_publicacion || new Date().toISOString().split('T')[0]),
    fecha_expiracion: aviso.fecha_expiracion ? String(aviso.fecha_expiracion) : null,
    sector_afectado: String(aviso.sector_afectado || 'Todo el Municipio'),
    urgente: Boolean(aviso.urgente),
    id_usuario_creador: Number(aviso.id_usuario_creador || 1)
  });
  await setDoc(ref, sanitized, { merge: true });
};

export const deleteAvisoFromFirestore = async (id_aviso: number) => {
  const ref = doc(db, COLLECTIONS.AVISOS, String(id_aviso));
  await deleteDoc(ref);
};

// --- REAL-TIME VIAS ---
export const subscribeToVias = (callback: (vias: ReporteVia[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.VIAS);
  return onSnapshot(q, (snapshot) => {
    const list: ReporteVia[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ReporteVia);
    });
    list.sort((a, b) => b.id_via - a.id_via);
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToVias error:', err);
  });
};

export const saveViaToFirestore = async (via: ReporteVia) => {
  const ref = doc(db, COLLECTIONS.VIAS, String(via.id_via));
  await setDoc(ref, sanitizeForFirestore(via), { merge: true });
};

export const deleteViaFromFirestore = async (id_via: number) => {
  const ref = doc(db, COLLECTIONS.VIAS, String(id_via));
  await deleteDoc(ref);
};

// --- REAL-TIME CORTES ---
export const subscribeToCortes = (callback: (cortes: CorteProgramado[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.CORTES);
  return onSnapshot(q, (snapshot) => {
    const list: CorteProgramado[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as CorteProgramado);
    });
    list.sort((a, b) => b.id_corte - a.id_corte);
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToCortes error:', err);
  });
};

export const saveCorteToFirestore = async (corte: CorteProgramado) => {
  const ref = doc(db, COLLECTIONS.CORTES, String(corte.id_corte));
  await setDoc(ref, sanitizeForFirestore(corte), { merge: true });
};

// --- REAL-TIME JORNADAS DE SALUD ---
export const subscribeToJornadas = (callback: (jornadas: JornadaSaludEsterilizacion[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.JORNADAS_SALUD);
  return onSnapshot(q, (snapshot) => {
    const list: JornadaSaludEsterilizacion[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as JornadaSaludEsterilizacion);
    });
    list.sort((a, b) => b.id_jornada - a.id_jornada);
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToJornadas error:', err);
  });
};

export const saveJornadaToFirestore = async (jornada: JornadaSaludEsterilizacion) => {
  const ref = doc(db, COLLECTIONS.JORNADAS_SALUD, String(jornada.id_jornada));
  await setDoc(ref, sanitizeForFirestore(jornada), { merge: true });
};

// --- REAL-TIME AUDIT LOGS ---
export const subscribeToAuditLogs = (callback: (logs: RegistroAuditoria[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.AUDIT_LOGS);
  return onSnapshot(q, (snapshot) => {
    const list: RegistroAuditoria[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as RegistroAuditoria);
    });
    list.sort((a, b) => b.id_log - a.id_log);
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToAuditLogs error:', err);
  });
};

export const saveAuditLogToFirestore = async (logItem: RegistroAuditoria) => {
  const ref = doc(db, COLLECTIONS.AUDIT_LOGS, String(logItem.id_log));
  await setDoc(ref, sanitizeForFirestore(logItem));
};

// --- REAL-TIME USUARIOS ---
export const subscribeToUsuarios = (callback: (users: Usuario[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.USUARIOS);
  return onSnapshot(q, (snapshot) => {
    const list: Usuario[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Usuario;
      list.push(data);
    });
    list.sort((a, b) => (Number(a.id_usuario) || 0) - (Number(b.id_usuario) || 0));
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToUsuarios error:', err);
  });
};

export const saveUsuarioToFirestore = async (user: Usuario) => {
  const ref = doc(db, COLLECTIONS.USUARIOS, String(user.id_usuario));
  const sanitized = sanitizeForFirestore({
    id_usuario: Number(user.id_usuario),
    nombre_usuario: String(user.nombre_usuario || '').trim(),
    correo: String(user.correo || '').trim().toLowerCase(),
    contrasena: user.contrasena ? String(user.contrasena) : undefined,
    rol: user.rol || 'habitante',
    preferencias_categorias: user.preferencias_categorias || ['cultura', 'deporte'],
    fecha_registro: user.fecha_registro || new Date().toISOString().split('T')[0],
    telefono: user.telefono ? String(user.telefono).trim() : '',
    barrio: user.barrio ? String(user.barrio).trim() : 'El Centro',
    puntos_civicos: user.puntos_civicos !== undefined ? Number(user.puntos_civicos) : 50
  });
  await setDoc(ref, sanitized, { merge: true });
};

export const deleteUsuarioFromFirestore = async (id_usuario: number) => {
  const ref = doc(db, COLLECTIONS.USUARIOS, String(id_usuario));
  await deleteDoc(ref);
};

// --- REAL-TIME ENCUESTAS CIUDADANAS ---
export const subscribeToEncuestas = (callback: (encuestas: EncuestaCiudadana[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.ENCUESTAS);
  return onSnapshot(q, (snapshot) => {
    const list: EncuestaCiudadana[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as EncuestaCiudadana);
    });
    list.sort((a, b) => b.id_encuesta - a.id_encuesta);
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToEncuestas error:', err);
  });
};

export const saveEncuestaToFirestore = async (encuesta: EncuestaCiudadana) => {
  const ref = doc(db, COLLECTIONS.ENCUESTAS, String(encuesta.id_encuesta));
  await setDoc(ref, sanitizeForFirestore(encuesta), { merge: true });
};

// --- REAL-TIME LECTURA DE AVISOS ---
export const subscribeToNotifiedUsers = (callback: (users: string[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.LECTURA_AVISOS);
  return onSnapshot(q, (snapshot) => {
    const list: string[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.usuario) {
        list.push(data.usuario);
      }
    });
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToNotifiedUsers error:', err);
  });
};

export const saveNotifiedUserToFirestore = async (usuario: string, noticeId?: number) => {
  const docId = `${usuario.replace(/[^a-zA-Z0-9]/g, '_')}_${noticeId || 'general'}`;
  const ref = doc(db, COLLECTIONS.LECTURA_AVISOS, docId);
  await setDoc(ref, {
    usuario,
    noticeId: noticeId || null,
    timestamp: new Date().toISOString()
  }, { merge: true });
};

// --- REAL-TIME REPORTES DE FALLAS CIUDADANAS ---
export const subscribeToReportesFallas = (callback: (fallas: ReporteFallaCiudadana[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.REPORTES_FALLAS);
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_FALLAS);
      return;
    }
    const list: ReporteFallaCiudadana[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ReporteFallaCiudadana);
    });
    list.sort((a, b) => (Number(b.id_falla) || 0) - (Number(a.id_falla) || 0));
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToReportesFallas error:', err);
    callback(INITIAL_FALLAS);
  });
};

export const saveReporteFallaToFirestore = async (falla: ReporteFallaCiudadana) => {
  const ref = doc(db, COLLECTIONS.REPORTES_FALLAS, String(falla.id_falla));
  await setDoc(ref, sanitizeForFirestore(falla), { merge: true });
};

export const deleteReporteFallaFromFirestore = async (id_falla: number) => {
  const ref = doc(db, COLLECTIONS.REPORTES_FALLAS, String(id_falla));
  await deleteDoc(ref);
};

// --- REAL-TIME NOTIFICACIONES CIUDADANAS ---
export const subscribeToNotificaciones = (userId: number, callback: (notifs: any[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.NOTIFICACIONES);
  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.id_usuario || Number(data.id_usuario) === Number(userId) || data.id_usuario === 0) {
        list.push(data);
      }
    });
    list.sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime());
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToNotificaciones error:', err);
  });
};

export const saveNotificacionToFirestore = async (notif: any) => {
  const notifId = notif.id_notificacion || Date.now();
  const ref = doc(db, COLLECTIONS.NOTIFICACIONES, String(notifId));
  await setDoc(ref, sanitizeForFirestore({
    id_notificacion: notifId,
    id_usuario: Number(notif.id_usuario) || 0,
    titulo: String(notif.titulo || ''),
    mensaje: String(notif.mensaje || ''),
    fecha: notif.fecha || new Date().toISOString(),
    leida: Boolean(notif.leida),
    tipo_ref: notif.tipo_ref || 'sistema',
    id_ref: notif.id_ref || null
  }), { merge: true });
};
