import { useState, useEffect } from "react";
import { type Appointment, type PaymentMethodType } from "../../core/models/Appointment";
import { type Service } from "../../core/models/Service";
import { 
  subscribeToBarberAppointments, 
  updateAppointmentStatus, 
  updateAppointmentData, 
  deleteAppointment,
  createWalkInAppointment
} from "../../core/services/booking.service";
import { getAllServices } from "../../core/services/service.service"; // CORRECCIÓN: getAllServices

export const useAppointments = (barberId: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barberId) return;

    const unsubscribe = subscribeToBarberAppointments(barberId, (data) => {
      setAppointments(data);
      setLoading(false);
    });

    const fetchServices = async () => {
        try {
            const data = await getAllServices(); // CORRECCIÓN
            setServices(data.filter((s: Service) => s.active !== false)); // CORRECCIÓN: Tipado de 's'
        } catch (error) {
            console.error("Error al cargar servicios para el Walk-in:", error);
        }
    };
    fetchServices();

    return () => unsubscribe();
  }, [barberId]);

  const changeStatus = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    await updateAppointmentStatus(appointmentId, newStatus);
  };

  const updateData = async (appointmentId: string, newDate: string, newTime: string, newPaymentMethod: PaymentMethodType, newService?: Service, newStatus?: string) => {
    // IMPORTANTE: Pasamos 'undefined' en barberName para que no lo modifique, y enviamos newStatus al final
    await updateAppointmentData(appointmentId, barberId, newDate, newTime, newPaymentMethod, newService, undefined, newStatus);
  };

  const removeAppointment = async (appointmentId: string) => {
    await deleteAppointment(appointmentId);
  };

  const addWalkIn = async (data: { clientName: string, date: string, time: string, service: Service, paymentMethod: PaymentMethodType, blockSchedule: boolean }) => {
    await createWalkInAppointment({ 
        barberId,
        clientName: data.clientName,
        date: data.date,
        time: data.time,
        price: data.service.price,
        serviceId: data.service.id,
        serviceName: data.service.name,
        paymentMethod: data.paymentMethod,
        blockSchedule: data.blockSchedule
    });
  };

  return { appointments, services, loading, changeStatus, updateData, removeAppointment, addWalkIn }; 
};