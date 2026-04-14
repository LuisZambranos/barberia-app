import { useEffect } from 'react';

// --- CONTEXTOS & SERVICIOS GLOBALES ---
import { useBooking } from '../context/BookingContext';
import { releaseTemporalLock } from '../../core/services/booking.service';

// --- COMPONENTES DEL FLUJO DE RESERVA ---
import { ServiceSelection } from '../components/booking/ServiceSelection';
import { BarberSelection } from '../components/booking/BarberSelection';
import { DateTimeSelection } from '../components/booking/DateTimeSelection';
import { ClientDataSelection } from '../components/booking/ClientDataSelection';
import { PaymentSelection } from '../components/booking/PaymentSelection';
import { BookingConfirmation } from '../components/booking/BookingConfirmation';

export const Booking = () => {
  // --- ESTADO GLOBAL DE RESERVAS ---
  const { 
    step, 
    setStep, 
    selectedService, 
    selectedBarber, 
    selectedDate, 
    selectedTime,
    clientData,
    successId
  } = useBooking();

  // --- CONTROL DE NAVEGACIÓN Y LIBERACIÓN DE LOCKS ---
  const handleStepChange = (targetStep: number) => {
    // Si el usuario retrocede desde un paso avanzado (4, 5, 6) a uno inicial (1, 2, 3), 
    // liberamos el candado temporal de la hora para no bloquear la agenda inútilmente.
    if (targetStep <= 3 && step >= 4) {
      if (selectedBarber && selectedDate && selectedTime) {
        const dateString = selectedDate.toISOString().split('T')[0];
        releaseTemporalLock(selectedBarber.id, dateString, selectedTime);
      }
    }
    setStep(targetStep);
  };

  // --- AUTO-SCROLL DEL STEPPER ---
  useEffect(() => {
    const activeStepElement = document.getElementById(`step-item-${step}`);
    if (activeStepElement) {
      activeStepElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [step]);

  // --- CONFIGURACIÓN DEL STEPPER VISUAL ---
  const stepsConfig = [
    { id: 1, label: "01 Servicio" },
    { id: 2, label: "02 Barbero" },
    { id: 3, label: "03 Fecha & Hora" },
    { id: 4, label: "04 Tus Datos" },
    { id: 5, label: "05 Pago" },        
    { id: 6, label: "06 Confirmación" } 
  ];

  return (
    <div className="min-h-screen bg-bg-main text-txt-main py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto"> 
        
        {/* --- HEADER Y STEPPER --- */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-2xl md:text-5xl font-extrabold text-txt-main mb-6 tracking-tight uppercase">
            Reserva tu <span className="text-gold">Turno</span>
          </h1>

          <div id="stepper-container" className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-2 md:justify-center whitespace-nowrap scrollbar-hide scroll-smooth">
            {stepsConfig.map((s) => {
              // Lógica de validación para permitir o bloquear la navegación por los pasos
              const isAvailable = successId ? (s.id === 6) : (
                (s.id === 1) ||
                (s.id === 2 && selectedService) ||
                (s.id === 3 && selectedService && selectedBarber) ||
                (s.id === 4 && selectedService && selectedBarber && selectedDate && selectedTime) ||
                (s.id === 5 && selectedService && selectedBarber && selectedDate && selectedTime && clientData.name) ||
                (s.id === 6 && step === 6)
              );

              return (
                <div 
                  key={s.id}
                  id={`step-item-${s.id}`}
                  onClick={() => isAvailable && handleStepChange(s.id)}
                  className={`flex items-center gap-3 shrink-0 transition-all duration-300 ${isAvailable ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-30"}`}
                >
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${step === s.id ? "text-gold scale-110" : "text-txt-secondary"}`}>
                    {s.label}
                  </span>
                  {s.id !== 6 && <div className="h-px w-6 bg-white/10"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- CONTENEDOR DINÁMICO DE PASOS --- */}
        {step === 1 && <ServiceSelection />}
        {step === 2 && <BarberSelection />}
        {step === 3 && <DateTimeSelection />}
        {step === 4 && <ClientDataSelection />}
        {step === 5 && <PaymentSelection />}
        {step === 6 && <BookingConfirmation />}
        
      </div>
    </div>
  );
};

export default Booking;