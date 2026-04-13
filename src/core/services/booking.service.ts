import { collection, doc, runTransaction, getDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Service } from "../models/Service";
import type { Barber } from "../models/Barber";
import type { PaymentMethodType } from "../models/Appointment";
import { sendReviewEmail, sendConfirmationEmail, sendCancellationEmail } from "./email.service";

interface BookingData {
  service: Service;
  barber: Barber;
  date: string;
  time: string;
  paymentMethod: PaymentMethodType;
  selectedItems: string[]; 
  hasBeardAddon: boolean;
  totalPrice: number;
  status: 'pending' | 'confirmed';
  clientId?: string; 
  client: {
    name: string;
    phone: string;
    email: string;
  };
}

export const createAppointment = async (data: BookingData): Promise<string> => {
  // 1. GUARDIA DE ÚLTIMO SEGUNDO
  const q = query(
    collection(db, "appointments"), 
    where("barberId", "==", data.barber.id), 
    where("date", "==", data.date)
  );
  
  const snapshot = await getDocs(q);
  const isOccupied = snapshot.docs.some(doc => {
      const appt = doc.data();
      return appt.time === data.time && appt.status !== "cancelled" && appt.status !== "canceled";
  });

  if (isOccupied) {
      throw new Error("HORA_OCUPADA");
  }

  const dateKey = data.date; 
  const counterRef = doc(db, "dailyCounters", dateKey);
  
  // --- NUEVO: PREPARAMOS LA REFERENCIA PARA DESTRUIR EL CANDADO ---
  const lockId = `${data.barber.id}_${data.date}_${data.time}`;
  const lockRef = doc(db, "locks", lockId);

  try {
    const resultId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
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

        clientId: data.clientId || null, 
        clientName: data.client.name,
        clientPhone: data.client.phone,
        clientEmail: data.client.email,
        
        status: data.status,
        paymentMethod: data.paymentMethod, 
        createdAt: new Date().toISOString(),
      };

      transaction.set(newAppointmentRef, appointmentPayload);
      
      // --- NUEVO: DESTRUIMOS EL CANDADO EN LA MISMA TRANSACCIÓN ---
      // Como ya tenemos la cita oficial, el candado temporal es basura
      transaction.delete(lockRef);

      return shortId;
    });

    return resultId;

  } catch (error) {
    if (error instanceof Error && error.message !== "HORA_OCUPADA") {
       console.error("Error en createAppointment service:", error);
    }
    throw error;
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string, 
  newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' 
): Promise<void> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apptData: any = null;

    await runTransaction(db, async (transaction) => {
      const apptDoc = await transaction.get(appointmentRef);
      if (!apptDoc.exists()) throw new Error("La cita no existe.");
      
      apptData = apptDoc.data();
      transaction.update(appointmentRef, { status: newStatus });

      if (newStatus === 'completed' && apptData.clientId) {
        const userRef = doc(db, "users", apptData.clientId);
        transaction.set(userRef, { 
            lastVisitDate: new Date().toISOString() 
        }, { merge: true });
      }
    });

    if (apptData && apptData.clientEmail) {
      const barberDocRef = doc(db, "barbers", apptData.barberId);
      const barberDoc = await getDoc(barberDocRef); 
      
      const barberPhone = barberDoc.exists() && barberDoc.data().phone ? barberDoc.data().phone : '+56900000000';

      const emailPayload = {
        to: apptData.clientEmail,
        clientName: apptData.clientName,
        barberName: apptData.barberName,
        date: apptData.date,
        time: apptData.time,
        serviceName: apptData.serviceName,
        barberPhone: barberPhone,
        paymentMethod: apptData.paymentMethod || 'cash' 
      };

      if (newStatus === 'confirmed') {
        await sendConfirmationEmail(emailPayload);
      } else if (newStatus === 'cancelled' || newStatus === 'canceled' as string) {
        await sendCancellationEmail(emailPayload);
      } else if (newStatus === 'completed') {
        await sendReviewEmail(emailPayload); 
      }
    }

  } catch (error) {
    console.error("Error al actualizar el estado de la cita:", error);
    throw error;
  }
};

export const createTemporalLock = async (barberId: string, date: string, time: string): Promise<boolean> => {
  const lockId = `${barberId}_${date}_${time}`;
  const lockRef = doc(db, "locks", lockId);

  try {
    const acquired = await runTransaction(db, async (transaction) => {
      const lockDoc = await transaction.get(lockRef);
      const now = new Date().getTime();
      
      const lockDurationMs = 5 * 60 * 1000; 

      if (lockDoc.exists()) {
        const lockData = lockDoc.data();
        
        if (lockData.expiresAt > now) {
          return false; 
        } 
      }

      const expiresAt = now + lockDurationMs;

      transaction.set(lockRef, {
        barberId,
        date,
        time,
        expiresAt,
        expireAtDate: new Date(expiresAt)
      });

      return true; 
    });

    return acquired;
    
  } catch (error) {
    console.error("Error en createTemporalLock:", error);
    return false;
  }
};

export const releaseTemporalLock = async (barberId: string, date: string, time: string): Promise<void> => {
  const lockId = `${barberId}_${date}_${time}`;
  const lockRef = doc(db, "locks", lockId);
  try {
    await deleteDoc(lockRef);
  } catch (error) {
    console.error("Error al liberar candado:", error);
  }
};

// --- FASE 3: BLOQUEOS MANUALES DEL BARBERO ---

export const createManualBlock = async (barberId: string, date: string, time: string): Promise<boolean> => {
  // Le añadimos el prefijo "manual_" para no chocar con las reservas temporales
  const lockId = `manual_${barberId}_${date}_${time}`;
  const lockRef = doc(db, "locks", lockId);

  try {
    await runTransaction(db, async (transaction) => {
      // Configuramos la expiración para dentro de 1 año (es un bloqueo persistente)
      const oneYearFromNow = new Date().getTime() + (365 * 24 * 60 * 60 * 1000);
      
      transaction.set(lockRef, {
        barberId,
        date,
        time,
        type: 'manual', // Etiqueta clave
        expiresAt: oneYearFromNow,
        expireAtDate: new Date(oneYearFromNow)
      });
    });
    return true;
  } catch (error) {
    console.error("Error creando bloqueo manual:", error);
    return false;
  }
};

export const removeManualBlock = async (barberId: string, date: string, time: string): Promise<void> => {
  const lockId = `manual_${barberId}_${date}_${time}`;
  const lockRef = doc(db, "locks", lockId);
  try {
    await deleteDoc(lockRef);
  } catch (error) {
    console.error("Error eliminando bloqueo manual:", error);
  }
};