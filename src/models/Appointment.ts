// src/models/Appointment.ts

export type PaymentMethodType = 'cash' | 'transfer' | 'online';

export interface Appointment {
  id: string;
  barberId: string;
  barberName?: string;
  serviceId: string;
  
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  
  date: string;
  time: string;
  
  serviceName: string;
  price: number | string;
  
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  shortId?: string;
  
  // Nuevo campo: Cómo pagará el cliente
  paymentMethod?: PaymentMethodType; 
}