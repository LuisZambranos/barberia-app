// src/ui/context/BookingContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Service } from '../../core/models/Service';
import { type Barber } from '../../core/models/Barber';
import { type PaymentMethodType } from '../../core/models/Appointment';

interface ClientData {
  name: string;
  phone: string;
  email: string;
}

interface BookingContextType {
  step: number;
  setStep: (step: number) => void;
  
  // Paso 1: Servicios y Extras
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  hasBeardAddon: boolean;
  setHasBeardAddon: (hasBeard: boolean) => void;
  
  // Paso 2: Barbero
  selectedBarber: Barber | null;
  setSelectedBarber: (barber: Barber | null) => void;
  
  // Paso 3: Fecha y Hora
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  
  // Paso 4: Datos del Cliente
  clientData: ClientData;
  setClientData: (data: ClientData) => void;
  
  // Paso 5 & 6: Pago y Confirmación
  selectedPaymentMethod: PaymentMethodType | null;
  setSelectedPaymentMethod: (method: PaymentMethodType | null) => void;
  successId: string | null;
  setSuccessId: (id: string | null) => void;

  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(1);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hasBeardAddon, setHasBeardAddon] = useState(false);
  
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [clientData, setClientData] = useState<ClientData>({ name: '', phone: '', email: '' });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedItems([]);
    setHasBeardAddon(false);
    setSelectedBarber(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientData({ name: '', phone: '', email: '' });
    setSelectedPaymentMethod(null);
    setSuccessId(null);
  };

  return (
    <BookingContext.Provider value={{
      step, setStep,
      selectedService, setSelectedService,
      selectedItems, setSelectedItems,
      hasBeardAddon, setHasBeardAddon,
      selectedBarber, setSelectedBarber,
      selectedDate, setSelectedDate,
      selectedTime, setSelectedTime,
      clientData, setClientData,
      selectedPaymentMethod, setSelectedPaymentMethod,
      successId, setSuccessId,
      resetBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking debe usarse dentro de un BookingProvider');
  }
  return context;
};