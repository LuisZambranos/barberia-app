// src/models/Barber.ts

export interface TransferDetails {
  bank: string;
  accountType: string;
  accountNumber: string;
  rut: string;
  fullName: string;
  email: string;
}

export interface PaymentMethods {
  cash: boolean;
  transfer: boolean;
  online: boolean; //  método de pasarela
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
  image?: string;
  
  // Configuraciones
  autoConfirm?: boolean;
  paymentMethods?: PaymentMethods;
  transferDetails?: TransferDetails; // Datos bancarios opcionales
  
  schedule?: {
    start: string;
    end: string;
    active: boolean;
    days?: Record<string, boolean>;
  };
  notifications?: {
    newBooking: boolean;
    cancellation: boolean;
  };
}