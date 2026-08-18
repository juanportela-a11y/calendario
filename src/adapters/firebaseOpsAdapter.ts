import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
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
  Aviso
} from '../types';
import { 
  INITIAL_VIAS, 
  INITIAL_CORTES, 
  INITIAL_JORNADAS_SALUD, 
  INITIAL_AUDIT_LOGS 
} from '../data/municipalOpsData';

// Collections names
export const COLLECTIONS = {
  VIAS: 'vias',
  CORTES: 'cortes',
  JORNADAS_SALUD: 'jornadas_salud',
  AUDIT_LOGS: 'audit_logs',
  EVENTOS: 'eventos',
  AVISOS: 'avisos'
};

// Seed initial operational data to Firestore if collection is empty
export const seedInitialOpsDataIfEmpty = async () => {
  try {
    const viasSnap = await getDocs(collection(db, COLLECTIONS.VIAS));
    if (viasSnap.empty) {
      console.log('Seeding initial Vías into Firestore...');
      const batch = writeBatch(db);
      INITIAL_VIAS.forEach((item) => {
        const ref = doc(db, COLLECTIONS.VIAS, String(item.id_via));
        batch.set(ref, item);
      });
      await batch.commit();
    }

    const cortesSnap = await getDocs(collection(db, COLLECTIONS.CORTES));
    if (cortesSnap.empty) {
      console.log('Seeding initial Cortes into Firestore...');
      const batch = writeBatch(db);
      INITIAL_CORTES.forEach((item) => {
        const ref = doc(db, COLLECTIONS.CORTES, String(item.id_corte));
        batch.set(ref, item);
      });
      await batch.commit();
    }

    const jornadasSnap = await getDocs(collection(db, COLLECTIONS.JORNADAS_SALUD));
    if (jornadasSnap.empty) {
      console.log('Seeding initial Jornadas into Firestore...');
      const batch = writeBatch(db);
      INITIAL_JORNADAS_SALUD.forEach((item) => {
        const ref = doc(db, COLLECTIONS.JORNADAS_SALUD, String(item.id_jornada));
        batch.set(ref, item);
      });
      await batch.commit();
    }

    const logsSnap = await getDocs(collection(db, COLLECTIONS.AUDIT_LOGS));
    if (logsSnap.empty) {
      console.log('Seeding initial Audit Logs into Firestore...');
      const batch = writeBatch(db);
      INITIAL_AUDIT_LOGS.forEach((item) => {
        const ref = doc(db, COLLECTIONS.AUDIT_LOGS, String(item.id_log));
        batch.set(ref, item);
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error checking/seeding Firestore operational data:', error);
  }
};

// Real-time listener for Vías
export const subscribeToVias = (callback: (vias: ReporteVia[]) => void): Unsubscribe => {
  const q = collection(db, COLLECTIONS.VIAS);
  return onSnapshot(q, (snapshot) => {
    const list: ReporteVia[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ReporteVia);
    });
    // Sort by id descending
    list.sort((a, b) => b.id_via - a.id_via);
    callback(list);
  }, (err) => {
    console.error('Firestore subscribeToVias error:', err);
  });
};

// Save or Update a Vía in Firestore
export const saveViaToFirestore = async (via: ReporteVia) => {
  const ref = doc(db, COLLECTIONS.VIAS, String(via.id_via));
  await setDoc(ref, via, { merge: true });
};

// Real-time listener for Cortes
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

// Save or Update a Corte in Firestore
export const saveCorteToFirestore = async (corte: CorteProgramado) => {
  const ref = doc(db, COLLECTIONS.CORTES, String(corte.id_corte));
  await setDoc(ref, corte, { merge: true });
};

// Real-time listener for Jornadas de Salud
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

// Save or Update a Jornada in Firestore
export const saveJornadaToFirestore = async (jornada: JornadaSaludEsterilizacion) => {
  const ref = doc(db, COLLECTIONS.JORNADAS_SALUD, String(jornada.id_jornada));
  await setDoc(ref, jornada, { merge: true });
};

// Real-time listener for Audit Logs
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

// Save an Audit Log to Firestore
export const saveAuditLogToFirestore = async (logItem: RegistroAuditoria) => {
  const ref = doc(db, COLLECTIONS.AUDIT_LOGS, String(logItem.id_log));
  await setDoc(ref, logItem);
};
