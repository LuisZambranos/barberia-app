import { collection, doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Service } from "../models/Service";
import type { Barber } from "../models/Barber";
import type { PaymentMethodType } from "../models/Appointment";

// 1. ACTUALIZACIÓN DE LA INTERFAZ
// Añadimos paymentMethod para obligar a que la vista de Booking lo envíe
interface BookingData {
  service: Service;
  barber: Barber;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM
  paymentMethod: PaymentMethodType; // <--- NUEVO REQUISITO
  client: {
    name: string;
    phone: string;
    email: string;
  };
}

export const createAppointment = async (data: BookingData): Promise<string> => {
  const dateKey = data.date; 
  const counterRef = doc(db, "dailyCounters", dateKey);
  const barberRef = doc(db, "barbers", data.barber.id);

  try {
    const resultId = await runTransaction(db, async (transaction) => {
      // LEER DATOS
      const counterDoc = await transaction.get(counterRef);
      const barberDoc = await transaction.get(barberRef);
      
      // ESTADO INICIAL
      const isAutoConfirm = barberDoc.exists() ? barberDoc.data().autoConfirm : false;
      const initialStatus = isAutoConfirm ? 'confirmed' : 'pending';

      // LÓGICA DEL CONTADOR
      let newCount = 1;
      if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
      }

      // INCREMENTAR CONTADOR
      transaction.set(counterRef, { count: newCount });

      // ID VISUAL
      const shortId = `#${newCount}`; 

      // CREAR RESERVA CON EL MÉTODO DE PAGO
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
        status: initialStatus,
        paymentMethod: data.paymentMethod, // <--- GUARDAMOS EL MÉTODO DE PAGO
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