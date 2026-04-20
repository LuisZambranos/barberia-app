import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../core/firebase/config';
import { type Appointment, type PaymentMethodType } from '../../core/models/Appointment';
import { type Service } from '../../core/models/Service';
import { type Barber } from '../../core/models/Barber';
import { getAllServices } from '../../core/services/service.service';
import { getAllBarbers } from '../../core/services/barber.service';
import { 
    updateAppointmentStatus, 
    updateAppointmentData, 
    deleteAppointment, 
    createWalkInAppointment 
} from '../../core/services/booking.service';

export const useAdminAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar Servicios y Barberos para el modal de Walk-in
        const fetchInitialData = async () => {
            try {
                const fetchedServices = await getAllServices();
                const fetchedBarbers = await getAllBarbers();
                setServices(fetchedServices);
                // Solo traemos barberos activos para asignarles citas rápidas
                setBarbers(fetchedBarbers.filter(b => b.active)); 
            } catch (error) {
                console.error("Error cargando datos iniciales del admin:", error);
            }
        };
        fetchInitialData();

        // Escuchar TODAS las citas de la base de datos en tiempo real
        const q = query(collection(db, "appointments"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dbData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];
            
            // Ordenamiento Cronológico (Igual que el del service, pero global)
            dbData.sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                const parseTime = (timeStr: string) => {
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    return hours * 60 + minutes;
                };
                return parseTime(a.time) - parseTime(b.time);
            });
            
            setAppointments(dbData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Wrappers para usar los mismos servicios del Core
    const changeStatus = async (id: string, status: any) => updateAppointmentStatus(id, status);
    
    // updateData ahora requiere el barberId (lo sacaremos de la cita que se está editando en la UI)
    const updateData = async (id: string, barberId: string, date: string, time: string, payment: PaymentMethodType, service?: Service, barberName?: string, status?: string) => {
        return updateAppointmentData(id, barberId, date, time, payment, service, barberName, status);
    };
    
    const removeAppointment = async (id: string) => deleteAppointment(id);
    
    const addWalkIn = async (data: any) => createWalkInAppointment(data);

    return { appointments, services, barbers, loading, changeStatus, updateData, removeAppointment, addWalkIn };
};