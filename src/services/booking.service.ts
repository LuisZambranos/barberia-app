import { collection, doc, runTransaction } from "firebase/firestore";
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
  // REFERENCIA AL BARBERO (Para leer su config)
  const barberRef = doc(db, "barbers", data.barber.id);

  try {
    const resultId = await runTransaction(db, async (transaction) => {
      // 1. LEER DATOS (Contador y Config del Barbero)
      // Es importante leer todo antes de escribir para que la transacción funcione bien
      const counterDoc = await transaction.get(counterRef);
      const barberDoc = await transaction.get(barberRef);
      
      // 2. DETERMINAR ESTADO INICIAL
      // Si el barbero tiene activado autoConfirm, pasa directo a 'confirmed'
      const isAutoConfirm = barberDoc.exists() ? barberDoc.data().autoConfirm : false;
      const initialStatus = isAutoConfirm ? 'confirmed' : 'pending';

      // 3. LÓGICA DEL CONTADOR
      let newCount = 1;
      if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
      }

      // 4. INCREMENTAR CONTADOR
      transaction.set(counterRef, { count: newCount });

      // 5. ID VISUAL
      const shortId = `#${newCount}`; 

      // 6. CREAR RESERVA
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
        status: initialStatus, // <--- AQUÍ USAMOS EL ESTADO DINÁMICO
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