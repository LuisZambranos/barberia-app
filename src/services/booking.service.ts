import { collection, doc, runTransaction, getDoc,deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Service } from "../models/Service";
import type { Barber } from "../models/Barber";
import type { PaymentMethodType } from "../models/Appointment";
// NUEVO: Importamos todos los correos
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
  status: 'pending' | 'confirmed'; // <-- IMPORTANTE: Ahora exigimos el status desde el frontend
  clientId?: string; 
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
        
        status: data.status, // <-- USAMOS EL STATUS QUE VIENE DEL FRONTEND
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
  newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' // Nota: En el backend usamos 'canceled', ten ojo si aquí usas 'cancelled' con doble L.
): Promise<void> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    
    // 1. Necesitamos leer los datos primero para saber a quién enviarle el correo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// --- 2. ENVIAMOS EL CORREO FUERA DE LA TRANSACCIÓN (Trigger B) ---
    if (apptData && apptData.clientEmail) {
      
      // FIJO: Buscamos el teléfono del barbero en la BD
      const barberDocRef = doc(db, "barbers", apptData.barberId);
      const barberDoc = await getDoc(barberDocRef); 
      
      // Si el barbero no lo ha configurado, enviamos el de soporte para que no falle
      const barberPhone = barberDoc.exists() && barberDoc.data().phone ? barberDoc.data().phone : '+56900000000';

      // Armamos el payload con el teléfono y el método de pago fijos
      const emailPayload = {
        to: apptData.clientEmail,
        clientName: apptData.clientName,
        barberName: apptData.barberName,
        date: apptData.date,
        time: apptData.time,
        serviceName: apptData.serviceName,
        barberPhone: barberPhone,
        paymentMethod: apptData.paymentMethod || 'cash' // Por si acaso
      };

      // Disparamos el correo correcto según el nuevo estado manual
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

// --- SISTEMA ANTI-COLISIONES (CANDADOS TEMPORALES) ---

export const createTemporalLock = async (barberId: string, date: string, time: string): Promise<boolean> => {
  // Creamos un ID único para esa hora exacta con ese barbero
  const lockId = `${barberId}_${date}_${time}`;
  const lockRef = doc(db, "locks", lockId);

  try {
    // Usamos una transacción para que sea a prueba de balas si 2 personas hacen clic al mismo milisegundo
    const acquired = await runTransaction(db, async (transaction) => {
      const lockDoc = await transaction.get(lockRef);
      const now = new Date().getTime();

      if (lockDoc.exists()) {
        const lockData = lockDoc.data();
        // Si el candado existe y su tiempo de expiración es mayor a AHORA, alguien más lo tiene
        if (lockData.expiresAt > now) {
          return false; // Falló, no pudimos tomar la hora
        }
      }

      // Si no existe o ya expiró, lo tomamos nosotros por 5 minutos (300,000 milisegundos)
      const expiresAt = now + (5 * 60 * 1000);
      transaction.set(lockRef, {
        barberId,
        date,
        time,
        expiresAt
      });

      return true; // ¡Candado adquirido!
    });

    return acquired;
  } catch (error) {
    console.error("Error al crear candado temporal:", error);
    return false;
  }
};

export const releaseTemporalLock = async (barberId: string, date: string, time: string): Promise<void> => {
  const lockId = `${barberId}_${date}_${time}`;
  const lockRef = doc(db, "locks", lockId);
  try {
    // Si el usuario se arrepiente, borramos el candado para liberar la hora
    await deleteDoc(lockRef);
  } catch (error) {
    console.error("Error al liberar candado:", error);
  }
};