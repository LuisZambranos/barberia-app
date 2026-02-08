import { 
  collection, 
  doc, 
  runTransaction 
  // Eliminamos addDoc porque usamos transaction.set
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Service } from "../models/Service";
import type { Barber } from "../models/Barber";

interface BookingData {
  service: Service;
  barber: Barber;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM
  client: {
    name: string;
    phone: string;
    email: string;
  };
}

export const createAppointment = async (data: BookingData): Promise<string> => {
  const dateKey = data.date; 
  const counterRef = doc(db, "dailyCounters", dateKey);

  try {
    const resultId = await runTransaction(db, async (transaction) => {
      // 1. Leer contador
      const counterDoc = await transaction.get(counterRef);
      
      let newCount = 1;
      if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
      }

      // 2. Incrementar
      transaction.set(counterRef, { count: newCount });

      // 3. ID Visual
      const shortId = `#${newCount}`; 

      // 4. Crear reserva
      const newAppointmentRef = doc(collection(db, "appointments"));
      const appointmentPayload = {
        shortId: shortId,
        dailySequence: newCount,
        serviceId: data.service.id,
        serviceName: data.service.name,
        barberId: data.barber.id,
        barberName: data.barber.name,
        date: data.date,
        time: data.time,
        price: data.service.price,
        clientName: data.client.name,
        clientPhone: data.client.phone,
        clientEmail: data.client.email,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      transaction.set(newAppointmentRef, appointmentPayload);

      return shortId;
    });

    return resultId;

  } catch (error) {
    console.error("Error en createAppointment service:", error);
    throw error;
  }
};