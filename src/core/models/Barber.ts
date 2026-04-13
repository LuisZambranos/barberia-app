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
  phone?: string;
  image?: string;

  // Redes sociales
  instagram?: string;
  whatsapp?: string;
  
  // Configuraciones
  autoConfirm?: boolean;         // 1. El Global (si está ON, confirma todo)
  autoConfirmCash?: boolean;     // 2. Automático para Efectivo
  autoConfirmTransfer?: boolean; // 3. Automático para Transferencias
  paymentMethods?: PaymentMethods;
  transferDetails?: TransferDetails; // Datos bancarios opcionales
  fcmToken?: string;             // Token FCM para notificaciones
  
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