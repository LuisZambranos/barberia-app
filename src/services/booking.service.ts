import { collection, doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Service } from "../models/Service";
import type { Barber } from "../models/Barber";
import type { PaymentMethodType } from "../models/Appointment";

// 1. ACTUALIZACIÓN DE LA INTERFAZ
// Añadimos los nuevos campos que debe enviar la vista de Booking
interface BookingData {
  service: Service;
  barber: Barber;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM
  paymentMethod: PaymentMethodType;
  
  // --- NUEVOS CAMPOS DEL COTIZADOR ---
  selectedItems: string[]; 
  hasBeardAddon: boolean;
  totalPrice: number; // El precio final ya calculado en el frontend

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
      
      // --- NUEVO: LÓGICA INTELIGENTE DE ESTADO INICIAL ---
      const barberData = barberDoc.exists() ? barberDoc.data() : null;
      let initialStatus: 'pending' | 'confirmed' = 'pending';

      if (barberData) {
        // 1. Si el botón GLOBAL está activado, TODO entra como confirmado automáticamente
        if (barberData.autoConfirm) {
            initialStatus = 'confirmed';
        } 
        // 2. Si el global está apagado, revisamos qué método de pago eligió el cliente
        else {
            if (data.paymentMethod === 'cash' && barberData.autoConfirmCash) {
                initialStatus = 'confirmed';
            } else if (data.paymentMethod === 'transfer' && barberData.autoConfirmTransfer) {
                initialStatus = 'confirmed';
            }
            // Si es 'online', se queda en pending (a menos que el global esté activo)
        }
      }

      // LÓGICA DEL CONTADOR
      let newCount = 1;
      if (counterDoc.exists()) {
        newCount = counterDoc.data().count + 1;
      }

      // INCREMENTAR CONTADOR
      transaction.set(counterRef, { count: newCount });

      // ID VISUAL
      const shortId = `#${newCount}`; 

      // CREAR RESERVA CON TODOS LOS DATOS
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
        
        // --- GUARDAMOS LOS DATOS DEL COTIZADOR ---
        price: data.totalPrice, // Precio final a cobrar
        basePrice: data.service.price, // Precio original del paquete
        selectedItems: data.selectedItems,
        hasBeardAddon: data.hasBeardAddon,

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

// Actualizar estado de la cita ---
export const updateAppointmentStatus = async (
  appointmentId: string, 
  newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await runTransaction(db, async (transaction) => {
      // Usamos transaction por seguridad, aunque un update directo (updateDoc) también sirve.
      // La transacción asegura que si hay mucha concurrencia, no se sobreescriban estados.
      const apptDoc = await transaction.get(appointmentRef);
      if (!apptDoc.exists()) {
        throw new Error("La cita no existe.");
      }
      transaction.update(appointmentRef, { status: newStatus });
    });
  } catch (error) {
    console.error("Error al actualizar el estado de la cita:", error);
    throw error;
  }
};