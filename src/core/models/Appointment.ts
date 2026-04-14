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
  price: number | string; // Este será el Total (Servicio + Extra Barba)
  
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  shortId?: string;
  dailySequence?: number; 
  createdAt?: string;     
  
  paymentMethod?: PaymentMethodType; 

  // --- NUEVO: SERVICIOS PERSONALIZADOS Y EXTRAS ---
  basePrice?: number;         // El precio base del paquete seleccionado
  selectedItems?: string[];   // Las casillas que el cliente SÍ dejó marcadas
  hasBeardAddon?: boolean;    // true si agregó el Corte de Barba (+ $5.000)

  // --- NUEVAS PROPIEDADES PARA WALK-INS ---
  isWalkIn?: boolean;
  blocksSchedule?: boolean;
}