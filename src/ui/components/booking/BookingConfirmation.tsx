import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';

export const BookingConfirmation = () => {
  const { 
    selectedBarber, 
    selectedDate, 
    selectedTime, 
    clientData, 
    selectedPaymentMethod, 
    successId, 
    resetBooking
  } = useBooking();

  const navigate = useNavigate();

  // Validaciones
  if (!selectedBarber || !selectedDate || !selectedTime) {
    return <p className="text-center py-10">Reserva finalizada. Gracias.</p>;
  }

  let isConfirmed = false;
  if (selectedPaymentMethod === 'online' || 
     (selectedPaymentMethod === 'cash' && selectedBarber.autoConfirmCash) || 
     (selectedPaymentMethod === 'transfer' && selectedBarber.autoConfirmTransfer) || 
     selectedBarber.autoConfirm) {
    isConfirmed = true;
  }

  const barberPhone = selectedBarber.phone || '+56937605937'; 
  const cleanBarberName = selectedBarber.name.replace("PRUEBA", "") || "Barbero";
  const clientFirstName = clientData.name?.split(' ')[0] || "Cliente";
  const dateString = selectedDate.toISOString().split('T')[0];

  let wsMessage = '';
  if (isConfirmed) wsMessage = `Hola ${cleanBarberName}, soy ${clientFirstName}. ¡Ya tengo mi hora confirmada para el ${dateString} a las ${selectedTime}! Nos vemos pronto.`;
  else if (selectedPaymentMethod === 'transfer') wsMessage = `Hola ${cleanBarberName}, soy ${clientFirstName}. Acabo de solicitar una reserva para el ${dateString} a las ${selectedTime} pagando por transferencia. Adjunto mi comprobante para asegurar la hora:`;
  else if (selectedPaymentMethod === 'cash') wsMessage = `Hola ${cleanBarberName}, soy ${clientFirstName}. Acabo de solicitar una reserva para el ${dateString} a las ${selectedTime} con pago en efectivo. Escribo para confirmar mi hora.`;

  const wsLink = barberPhone ? `https://wa.me/${barberPhone}?text=${encodeURIComponent(wsMessage)}` : '#';

  return (
    <div className="text-center py-20 animate-in zoom-in-95 duration-700">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg 
        ${isConfirmed ? 'bg-green-500/20 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]'}`}>
        {isConfirmed ? '✓' : '⏳'}
      </div>
      
      <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-txt-main">
        {isConfirmed ? '¡Cita Confirmada!' : '¡Reserva Solicitada!'}
      </h2>
      
      {!isConfirmed && selectedPaymentMethod === 'transfer' && (
          <p className="text-gold text-sm font-bold mb-6">Recuerda realizar tu transferencia y enviarle el comprobante al barbero.</p>
      )}
      {selectedPaymentMethod === 'online' && (
          <p className="text-blue-400 text-sm font-bold mb-6">Serás redirigido a Webpay en breve (Simulación).</p>
      )}

      {successId && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 inline-block mb-8">
          <p className="text-[10px] text-txt-secondary uppercase tracking-[0.3em] mb-2">Tu Código de Ticket</p>
          <p className="text-4xl font-mono font-bold text-gold">{successId}</p>
        </div>
      )}
      
      <p className="text-txt-secondary max-w-sm mx-auto mb-10">
        {isConfirmed 
          ? 'Tu hora está asegurada al 100%. Te hemos enviado un correo con todos los detalles.' 
          : 'Tu cita está pendiente de aprobación por el barbero. Revisa tu correo con los pasos a seguir.'}
      </p>
      
      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <a 
          href={wsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] text-black py-4 px-10 rounded-sm font-black uppercase tracking-widest hover:bg-[#1ebe5d] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
        >
          <span>Contactar por WhatsApp</span>
        </a>

        <button 
          onClick={() => {
            resetBooking();
            navigate('/');
          }} 
          className="w-full border border-white/20 text-white py-4 px-10 rounded-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all block"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};