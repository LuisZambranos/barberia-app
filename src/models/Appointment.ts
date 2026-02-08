export interface  Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  time: string;
  date: string; // Formato YYYY-MM-DD para ordenar
  serviceName: string; // Ajustado a tu DB (serviceType o serviceName)
  price: string; 
  status: "confirmed" | "pending" | "cancelled";
  barberId: string;
}