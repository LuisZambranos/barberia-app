import { type Appointment } from "../models/Appointment";

// Función privada (solo se usa aquí adentro)
const getMonthYear = (dateString: string) => {
    const d = new Date(`${dateString}T00:00:00`);
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
};

export const calculateMonthlyMetrics = (appointments: Appointment[]) => {
    return appointments.reduce((acc, appt) => {
        const month = getMonthYear(appt.date);
        
        if (!acc[month]) {
            acc[month] = { 
                totalAppts: 0, 
                totalRevenue: 0, 
                revenueByMethod: { cash: 0, transfer: 0, online: 0 },
                days: {} 
            };
        }
        
        const isCanceled = appt.status === 'cancelled' || (appt.status as string) === 'canceled';

        // SOLO sumamos ingresos y contamos la cita si NO está cancelada
        if (!isCanceled) {
            acc[month].totalAppts += 1;
            const priceVal = parseInt(String(appt.price).replace(/[^0-9]/g, '')) || 0;
            acc[month].totalRevenue += priceVal;
            const method = appt.paymentMethod || 'cash';
            acc[month].revenueByMethod[method] += priceVal;
        }
        
        // SÍ la guardamos para mostrarla tachada en la lista visual del día
        if (!acc[month].days[appt.date]) acc[month].days[appt.date] = [];
        acc[month].days[appt.date].push(appt);
        
        return acc;
    }, {} as Record<string, { totalAppts: number, totalRevenue: number, revenueByMethod: Record<string, number>, days: Record<string, Appointment[]> }>);
};