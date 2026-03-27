import { collection, doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Service } from "../models/Service";
import type { Barber } from "../models/Barber";
import type { PaymentMethodType } from "../models/Appointment";
import { sendReviewEmail } from "./email.service";
interface BookingData {
  service: Service;
  barber: Barber;
  date: string;
  time: string;
  paymentMethod: PaymentMethodType;
  selectedItems: string[]; 
  hasBeardAddon: boolean;
  totalPrice: number;
  
  clientId?: string; // <--- NUEVO: Para saber qué usuario del CRM es

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
      const counterDoc = await transaction.get(counterRef);
      const barberDoc = await transaction.get(barberRef);
      
      const barberData = barberDoc.exists() ? barberDoc.data() : null;
      let initialStatus: 'pending' | 'confirmed' = 'pending';

      if (barberData) {
        if (barberData.autoConfirm) {
            initialStatus = 'confirmed';
        } else {
            if (data.paymentMethod === 'cash' && barberData.autoConfirmCash) {
                initialStatus = 'confirmed';
            } else if (data.paymentMethod === 'transfer' && barberData.autoConfirmTransfer) {
                initialStatus = 'confirmed';
            }
        }
      }

      let newCount = 1;
      if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
      }
      transaction.set(counterRef, { count: newCount });

      const shortId = `#${newCount}`; 
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
        
        price: data.totalPrice, 
        basePrice: data.service.price, 
        selectedItems: data.selectedItems,
        hasBeardAddon: data.hasBeardAddon,

        clientId: data.clientId || null, // <--- GUARDAMOS EL ID DEL CLIENTE
        clientName: data.client.name,
        clientPhone: data.client.phone,
        clientEmail: data.client.email,
        status: initialStatus,
        paymentMethod: data.paymentMethod, 
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

export const updateAppointmentStatus = async (
  appointmentId: string, 
  newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    
    // 1. Necesitamos leer los datos primero para saber a quién enviarle el correo
    let apptData: any = null;

    await runTransaction(db, async (transaction) => {
      const apptDoc = await transaction.get(appointmentRef);
      if (!apptDoc.exists()) throw new Error("La cita no existe.");
      
      apptData = apptDoc.data();
      transaction.update(appointmentRef, { status: newStatus });

      // --- AL COMPLETAR EL CORTE ACTUALIZAMOS SU PERFIL ---
      if (newStatus === 'completed' && apptData.clientId) {
        const userRef = doc(db, "users", apptData.clientId);
        // Actualizamos su fecha de última visita
        transaction.set(userRef, { 
            lastVisitDate: new Date().toISOString() 
        }, { merge: true });
      }
    });

    // --- ENVIAMOS EL CORREO FUERA DE LA TRANSACCIÓN ---
    // (Es mejor hacer llamadas a APIs externas fuera de las transacciones de base de datos)
    if (newStatus === 'completed' && apptData && apptData.clientEmail) {
        const firstName = apptData.clientName.split(' ')[0]; // Sacamos solo el primer nombre
        await sendReviewEmail(apptData.clientEmail, firstName);
    }

  } catch (error) {
    console.error("Error al actualizar el estado de la cita:", error);
    throw error;
  }
};