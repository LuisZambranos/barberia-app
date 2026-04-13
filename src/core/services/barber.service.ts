import { collection, getDocs, query, where } from "firebase/firestore";
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