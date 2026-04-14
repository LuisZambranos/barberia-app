import { collection, getDocs, query, where, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { type Barber } from "../models/Barber";

/**
 * Obtiene la lista de todos los barberos disponibles.
 */
export const getAllBarbers = async (): Promise<Barber[]> => {
  try {
    const snapshot = await getDocs(collection(db, "barbers"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Barber));
  } catch (error) {
    console.error("Error trayendo barberos:", error);
    return [];
  }
};

/**
 * Busca el perfil de un barbero dado su email.
 * Útil para el login del panel de barbero.
 */
export const getBarberByEmail = async (email: string): Promise<Barber | null> => {
  try {
    const q = query(collection(db, "barbers"), where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Barber;
    }
    return null;
  } catch (error) {
    console.error("Error buscando barbero por email:", error);
    throw error;
  }
};

// Actualiza el perfil de un barbero (Foto, nombre, especialidad, etc.)
 
export const updateBarberProfile = async (barberId: string, data: Partial<Barber>): Promise<void> => {
  try {
    const barberRef = doc(db, "barbers", barberId);
    await updateDoc(barberRef, data);
  } catch (error) {
    console.error("Error actualizando perfil del barbero:", error);
    throw error;
  }
};

// Crea un nuevo barbero
export const createBarber = async (data: Omit<Barber, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "barbers"), {
      ...data,
      active: true, // Siempre nacen activos
      // Le damos un horario base por defecto
      schedule: {
        active: true,
        start: "10:00",
        end: "20:00",
        interval: 60,
        days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false }
      }
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creando barbero:", error);
    throw error;
  }
};