import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { type Service } from "../models/Service";

export const getAllServices = async (): Promise<Service[]> => {
  try {
    const snapshot = await getDocs(collection(db, "services"));
    let loadedServices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service));
    
    // Ordenamos por precio para la UI
    return loadedServices.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error("Error trayendo servicios:", error);
    return [];
  }
};