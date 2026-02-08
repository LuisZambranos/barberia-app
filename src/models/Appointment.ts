export interface Appointment {
  id: string; // ID de Firebase 
  shortId?: string; // ID visual: #1
  dailySequence?: number; // número puro: 1
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  time: string;
  date: string;
  serviceName: string;
  price: number | string; 
  status: "confirmed" | "pending" | "cancelled";
  barberName?: string;
}