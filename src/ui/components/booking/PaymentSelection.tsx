import { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, ShieldCheck, AlertCircle, AlertTriangle, Copy } from 'lucide-react';
import { copyToClipboard } from '../../../core/utils/clipboard';
import { sendPendingEmail, sendConfirmationEmail } from '../../../core/services/email.service';
import { sendPushAlert } from '../../../core/services/notification.service';
import { useToast } from '../../context/ToastContext';
import { createAppointment } from '../../../core/services/booking.service';

export const PaymentSelection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    setStep, 
    selectedService, 
    selectedBarber, 
    selectedDate, 
    selectedTime,
    clientData,
    selectedItems,
    hasBeardAddon,
    selectedPaymentMethod, 
    setSelectedPaymentMethod,
    setSuccessId
  } = useBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [copiedDetail, setCopiedDetail] = useState<string | null>(null);

  // Validaciones de seguridad
  if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
    return <p className="text-center py-10">Faltan datos de la reserva.</p>;
  }

  const currentTotal = selectedService.price + (hasBeardAddon ? 5000 : 0);
  const availableMethods = selectedBarber.paymentMethods || { cash: true, transfer: true, online: false };
  const bankDetails = selectedBarber.transferDetails;

  const handleCopyAllBankDetails = () => {
    if (!bankDetails) return;
    
    let cleanRut = bankDetails.rut.replace(/[^0-9kK]/g, '');
    let formattedRut = bankDetails.rut; 
    if (cleanRut.length > 1) {
       formattedRut = cleanRut.slice(0, -1) + '-' + cleanRut.slice(-1);
    }

    const textToCopy = `Nombre: ${bankDetails.fullName}\nRUT: ${formattedRut}\nBanco: ${bankDetails.bank}\nTipo de cuenta: ${bankDetails.accountType}\nCuenta: ${bankDetails.accountNumber}\nCorreo: ${bankDetails.email || ''}`.trim();

    if (copyToClipboard(textToCopy)) {
        setCopiedDetail('all');
        setTimeout(() => setCopiedDetail(null), 2000);
    }
  };

  const handleFinalizeBooking = async () => {
    if (!selectedPaymentMethod) return;

    setIsSubmitting(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];

      let initialStatus: 'pending' | 'confirmed' = 'pending';
      if (selectedPaymentMethod === 'online' || 
         (selectedPaymentMethod === 'cash' && selectedBarber.autoConfirmCash) || 
         (selectedPaymentMethod === 'transfer' && selectedBarber.autoConfirmTransfer) || 
         selectedBarber.autoConfirm) {
        initialStatus = 'confirmed'; 
      }

      const ticketId = await createAppointment({
        service: selectedService,
        barber: selectedBarber,
        date: dateString,
        time: selectedTime,
        paymentMethod: selectedPaymentMethod,
        selectedItems: selectedItems,
        hasBeardAddon: hasBeardAddon,
        totalPrice: currentTotal,
        status: initialStatus, 
        client: clientData,
        clientId: user?.uid
      });

      const emailPayload = {
        to: clientData.email, 
        clientName: clientData.name || clientData.email.split('@')[0],
        barberName: selectedBarber.name.replace("PRUEBA", ""),
        date: dateString, 
        time: selectedTime,
        serviceName: selectedService.name,
        barberPhone: selectedBarber.phone || '+56937605937', 
        paymentMethod: selectedPaymentMethod 
      };

      if (initialStatus === 'confirmed') {
        await sendConfirmationEmail(emailPayload);
      } else {
        await sendPendingEmail(emailPayload);
      }

      if (selectedBarber.fcmToken && selectedBarber.notifications?.newBooking) {
        const clientFirstName = clientData.name?.split(' ')[0] || "Un cliente";
        const pushTitle = initialStatus === 'confirmed' ? '✅ Nueva Reserva Confirmada' : '⏳ Solicitud de Reserva';
        const pushBody = `${clientFirstName} agendó para el ${dateString} a las ${selectedTime}.`;
        
        sendPushAlert(selectedBarber.fcmToken, pushTitle, pushBody).catch(() => {});
      }

      setSuccessId(ticketId);
      setStep(6); 

    } catch (error: any) {
      if (error.message === "HORA_OCUPADA") {
        toast.error("¡Alguien más concretó esta reserva! Por favor, elige otra hora.");
        setStep(3);
      } else {
        alert("Hubo un error al procesar tu reserva. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      <h2 className="text-2xl font-bold text-gold text-center mb-2 uppercase tracking-widest">Método de Pago</h2>
      <p className="text-center text-txt-muted text-sm mb-8">Selecciona cómo deseas abonar tu servicio.</p>

      <div className="space-y-4">
        {/* OPCIÓN ONLINE */}
        {availableMethods.online && (
            <div onClick={() => setSelectedPaymentMethod('online')} className={`p-6 border rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between ${selectedPaymentMethod === 'online' ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10 bg-white/5 hover:border-gold/30'}`}>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">Pago Online (Webpay) <ShieldCheck size={18} className="text-green-400" /></h3>
              <p className="text-xs text-txt-muted mt-1">Paga ahora de forma segura.</p>
              <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-2 bg-green-500/10 w-fit px-2 py-1 rounded">✓ Hora 100% Asegurada</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'online' ? 'border-gold bg-gold' : 'border-white/20'}`}>
              {selectedPaymentMethod === 'online' && <CheckCircle2 size={16} className="text-bg-main" />}
            </div>
          </div>
        )}

        {/* OPCIÓN TRANSFERENCIA */}
        {availableMethods.transfer && (
          <div className={`transition-all duration-300 border rounded-xl overflow-hidden ${selectedPaymentMethod === 'transfer' ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10 bg-white/5 hover:border-gold/30'}`}>
            <div onClick={() => setSelectedPaymentMethod('transfer')} className="p-6 cursor-pointer flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">Transferencia Bancaria <ShieldCheck size={18} className="text-green-400" /></h3>
                <p className="text-xs text-txt-muted mt-1">Transfiere el abono para garantizar tu cupo.</p>
                <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-2 bg-green-500/10 w-fit px-2 py-1 rounded">✓ Hora 100% Asegurada</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'transfer' ? 'border-gold bg-gold' : 'border-white/20'}`}>
                  {selectedPaymentMethod === 'transfer' && <CheckCircle2 size={16} className="text-bg-main" />}
              </div>
            </div>

            <div className={`transition-all duration-500 ${selectedPaymentMethod === 'transfer' ? 'max-h-[500px] border-t border-gold/20' : 'max-h-0'}`}>
                <div className="p-6 bg-black/20">
                  <p className="text-xs text-gold uppercase tracking-widest font-bold mb-4">Datos para transferir</p>
                  {bankDetails?.accountNumber ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-sm text-txt-muted">RUT</span><span className="text-sm font-mono text-white">{bankDetails.rut}</span></div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-sm text-txt-muted">N° Cuenta</span><span className="text-sm font-mono text-white">{bankDetails.accountNumber}</span></div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-sm text-txt-muted">Banco</span><span className="text-sm text-white">{bankDetails.bank}</span></div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-sm text-txt-muted">Tipo</span><span className="text-sm text-white">{bankDetails.accountType}</span></div>
                      <div className="flex justify-between items-center pb-2"><span className="text-sm text-txt-muted">Nombre</span><span className="text-sm text-white">{bankDetails.fullName}</span></div>
                      <button type="button" onClick={handleCopyAllBankDetails} className="w-full mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white p-4 rounded-lg transition-all text-sm font-bold">
                          {copiedDetail === 'all' ? (<><CheckCircle2 size={18} className="text-green-500" /><span className="text-green-500">¡Datos copiados con éxito!</span></>) : (<><Copy size={18} className="text-gold" /><span>Copiar Datos de Transferencia</span></>)}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-red-400 italic">El barbero aún no configura sus datos bancarios.</p>
                  )}
                </div>
            </div>
          </div>
        )}

        {/* OPCIÓN EFECTIVO */}
        {availableMethods.cash && (
          <div onClick={() => setSelectedPaymentMethod('cash')} className={`p-6 border rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between ${selectedPaymentMethod === 'cash' ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
            <div className="pr-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">Efectivo en el Local</h3>
              <p className="text-xs text-txt-muted mt-1 leading-relaxed">El barbero deberá aprobar tu cita manualmente.  Si otro cliente abona la misma hora, podrías perder el cupo.</p>
              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-3 bg-yellow-500/10 border border-yellow-500/20 w-fit px-2 py-1 rounded flex items-center gap-1"><AlertCircle size={12} /> Sujeto a disponibilidad</p>
            </div>
            <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'cash' ? 'border-gold bg-gold' : 'border-white/20'}`}>
                {selectedPaymentMethod === 'cash' && <CheckCircle2 size={16} className="text-bg-main" />}
            </div>
          </div>
        )}
      </div>

      {/* TÉRMINOS */}
      <div className="mt-8 bg-red-500/5 border border-red-500/20 rounded-xl p-5">
        <h4 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={18} /> Política de Cancelación</h4>
        <ul className="text-txt-muted text-xs space-y-2 list-disc pl-4 mb-5">
          <li>Cancelaciones o reprogramaciones deben realizarse con al menos <strong>2 horas de anticipación</strong>.</li>
          <li><strong>No asistir a la cita</strong> o cancelar tarde resultará en la pérdida del 50% del abono,si es en efectivo el cobro del servicio sera en tu próxima visita.</li>
          <li>Tu hora se considera perdida si tienes un <strong>atraso superior a 10 minutos.</strong></li>
        </ul>
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-black/20 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
          <div className="relative flex items-center justify-center mt-0.5">
            <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-white/30 rounded bg-transparent checked:bg-gold checked:border-gold transition-all cursor-pointer" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}/>
            <CheckCircle2 size={14} className="absolute text-bg-main opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
          </div>
          <span className="text-sm font-medium text-white leading-tight">He leído y acepto la política de cancelación.</span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-8 pt-6">
        <button onClick={handleFinalizeBooking} disabled={!selectedPaymentMethod || isSubmitting || !acceptedTerms} className="w-full bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-hover transition-all shadow-xl shadow-gold/20 flex justify-center items-center">
          {isSubmitting ? "Procesando..." : `Confirmar por $${currentTotal.toLocaleString()}`}
        </button>
        <button 
          type="button" 
          onClick={() => {
            // En este caso, retrocedemos al paso 4 (Datos). El lock DEBE MANTENERSE.
            // Solo lo borramos si el usuario retrocediera hasta el paso 3 (que se hace desde el Stepper superior).
            setStep(4);
          }} 
          className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
        >
          Regresar
        </button>
      </div>
    </div>
  );
};