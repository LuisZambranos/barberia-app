import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'; 
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';
import { Copy, CheckCircle2, PlusCircle, Scissors } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import  {useToast} from "../context/ToastContext"; 

import { useBarberSchedule } from "../hooks/useBarberSchedule";
import { createAppointment, createTemporalLock, releaseTemporalLock } from '../services/booking.service';
import { copyToClipboard } from '../utils/clipboard'; 

import type { Service } from '../models/Service';
import type { Barber } from '../models/Barber';
import type { PaymentMethodType } from '../models/Appointment'; 
import { sendPendingEmail, sendConfirmationEmail } from '../services/email.service';
import { sendPushAlert } from '../services/notification.service';

// IMÁGENES
import barbero1 from "../assets/Simon_barber.webp";
import barbero2 from "../assets/Alvaro_barber.webp";
import barbero3 from "../assets/Reynold_barber.webp";
import barbero4 from "../assets/Javier_barber.webp";
import barbero5 from "../assets/Alejandro_barber.webp";
import barbero6 from "../assets/Jose_barbero.webp";

const BARBER_PHOTOS: Record<string, string> = {
  "jZQTIPBBwrTNYGTdL7QBIkjBJ913": barbero1,
  "YsWJfoPcBaRN7hG5KWgCbs6XQc92": barbero2, 
  "rp2dNmur2GZFBNllPu2dH1u4KYz1": barbero3,
  "58tCb3NW5uSjrHHnPOmzS3tTxII2": barbero4,
  "Tzjnvhso43ffT3x0T8rlWVEs3XG3": barbero5,
  "SfCyyndvi4da8SXT6BgXwUHgZ6A3": barbero6,
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Booking = () => {
  const { toast } = useToast()
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // --- NUEVO: ESTADOS DEL COTIZADOR (FASE 3) ---
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hasBeardAddon, setHasBeardAddon] = useState(false);

  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [copiedDetail, setCopiedDetail] = useState<string | null>(null);

  const [clientData, setClientData] = useState({ name: '', phone: '', email: '' });
  // --- NUEVO: AUTOCOMPLETADO DEL CRM ---
  const { user } = useAuth(); // Obtenemos el usuario activo
  const [isLocking, setIsLocking] = useState(false);

  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Si el documento existe, prellenamos el formulario automáticamente
            setClientData({
              name: data.name || '',
              phone: data.phone || '',
              email: user.email || ''
            });
          } else {
            // Por si acaso no tiene nombre, al menos le ponemos su correo
            setClientData(prev => ({ ...prev, email: user.email || '' }));
          }
        } catch (error) {
          console.error("Error cargando perfil del CRM:", error);
        }
      };
      loadUserData();
    }
  }, [user]);
  // --------------------------------------

  const { availableTimes, loadingSchedule } = useBarberSchedule(selectedBarber?.id, selectedDate);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sSnap = await getDocs(collection(db, "services"));
        // Ordenamos los servicios por precio de menor a mayor para que se vean organizados
        let loadedServices = sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
        loadedServices.sort((a, b) => a.price - b.price);
        setServices(loadedServices);
        
        const bSnap = await getDocs(collection(db, "barbers"));
        let loadedBarbers = bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Barber));
        setBarbers(shuffleArray(loadedBarbers));

      } catch (e) { 
        console.error("Error cargando datos:", e); 
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- NUEVAS FUNCIONES DEL COTIZADOR ---
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Al elegir un servicio, marcamos todas sus opciones por defecto
    setSelectedItems(service.includes || []); 
    setHasBeardAddon(false);
  };

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Calculamos el precio en tiempo real
  const currentTotal = (selectedService?.price || 0) + (hasBeardAddon ? 5000 : 0);
  // --------------------------------------

  // --- NUEVA LÓGICA: FILTRAR HORAS PASADAS ---
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const validTimes = availableTimes.filter(time => {
    if (!isToday) return true; // Si es para mañana o después, todas valen
    
    const [hours, minutes] = time.split(':').map(Number);
    // Solo mostramos horas en el futuro
    return hours > currentHour || (hours === currentHour && minutes > currentMinute);
  });
  // -------------------------------------------

  const handleCopyAllBankDetails = () => {
    if (!bankDetails) return;
    
    let cleanRut = bankDetails.rut.replace(/[^0-9kK]/g, '');
    let formattedRut = bankDetails.rut; 
    if (cleanRut.length > 1) {
       formattedRut = cleanRut.slice(0, -1) + '-' + cleanRut.slice(-1);
    }

    // 2. TEXTO SIN SANGRÍA (IMPORTANTE: Debe estar pegado a la izquierda)
    const textToCopy = `Nombre: ${bankDetails.fullName}
RUT: ${formattedRut}
Banco: ${bankDetails.bank}
Tipo de cuenta: ${bankDetails.accountType}
Cuenta: ${bankDetails.accountNumber}
Correo: ${bankDetails.email || ''}`.trim();

    const success = copyToClipboard(textToCopy);
    if (success) {
        setCopiedDetail('all');
        setTimeout(() => setCopiedDetail(null), 2000);
    }
  };

  // --- CONTROL CENTRAL DE NAVEGACIÓN Y SCROLL ---
  const handleStepChange = (targetStep: number) => {
    // Si retrocedemos a un paso donde la hora no importa (1, 2 o 3) 
    // y estábamos en un paso avanzado (4 o 5), LIBERAMOS el candado.
    if (targetStep <= 3 && step >= 4) {
      if (selectedBarber && selectedDate && selectedTime) {
        releaseTemporalLock(selectedBarber.id, selectedDate, selectedTime);
      }
    }
    setStep(targetStep);
  };

  // Efecto que mueve la barra superior automáticamente
  useEffect(() => {
    const activeStepElement = document.getElementById(`step-item-${step}`);
    if (activeStepElement) {
      activeStepElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center', // Lo centra perfectamente en mobile
        block: 'nearest'
      });
    }
  }, [step]);

  // --- FUNCIONES ANTI-COLISIONES ---
  const handleProceedToStep4 = async () => {
    if (!selectedBarber || !selectedDate || !selectedTime) return;
    
    setIsLocking(true);
    const success = await createTemporalLock(selectedBarber.id, selectedDate, selectedTime);
    setIsLocking(false);

    if (success) {
      setStep(4); 
    } else {
      // Como ya actualizamos el Provider, esto mostrará la alerta roja Y hará el sonido automáticamente
      toast.error("¡Ups! Alguien acaba de reservar esta hora. Elige otra.");
      setSelectedTime(null); 
    }
  };

const handleFinalizeBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedTime || !selectedPaymentMethod) return;

    setIsSubmitting(true);
    try {
      const finalPrice = selectedService.price + (hasBeardAddon ? 5000 : 0);

      // --- 1. LÓGICA DEL ESTADO (Usando tu esquema exacto de BD) ---
      let initialStatus: 'pending' | 'confirmed' = 'pending';
      
      if (selectedPaymentMethod === 'online') {
        initialStatus = 'confirmed'; // Pago online siempre asegura el cupo
      } else if (selectedPaymentMethod === 'cash' && selectedBarber.autoConfirmCash) {
        initialStatus = 'confirmed';
      } else if (selectedPaymentMethod === 'transfer' && selectedBarber.autoConfirmTransfer) {
        initialStatus = 'confirmed';
      } else if (selectedBarber.autoConfirm) {
        // Fallback por si activó el general
        initialStatus = 'confirmed'; 
      }

      // --- 2. GUARDAR EN FIREBASE ---
      const ticketId = await createAppointment({
        service: selectedService,
        barber: selectedBarber,
        date: selectedDate,
        time: selectedTime,
        paymentMethod: selectedPaymentMethod,
        selectedItems: selectedItems,
        hasBeardAddon: hasBeardAddon,
        totalPrice: finalPrice,
        status: initialStatus, // <-- Mandamos el estado calculado
        client: clientData,
        clientId: user?.uid
      });

// --- 3. ENVIAR EL CORREO CORRESPONDIENTE ---
      const emailPayload = {
        to: clientData.email, 
        clientName: clientData.name || clientData.email.split('@')[0],
        barberName: selectedBarber.name.replace("PRUEBA", ""),
        date: selectedDate, 
        time: selectedTime,
        serviceName: selectedService.name,
        // FIJO: Si por algún error de red no llega el teléfono, ponemos uno de soporte para que la app no colapse,
        // pero en el 99.9% de los casos tomará el selectedBarber.phone que guardaste en el panel.
        barberPhone: selectedBarber.phone || '+56937605937', 
        paymentMethod: selectedPaymentMethod 
      };

      if (initialStatus === 'confirmed') {
        await sendConfirmationEmail(emailPayload);
      } else {
        await sendPendingEmail(emailPayload);
      }

      // --- NUEVO: DISPARAR NOTIFICACIÓN PUSH AL BARBERO ---
      // Verificamos si el barbero activó las notificaciones y tiene su Token guardado
      if (selectedBarber.fcmToken && selectedBarber.notifications?.newBooking) {
        const clientFirstName = clientData.name?.split(' ')[0] || "Un cliente";
        const pushTitle = initialStatus === 'confirmed' ? '✅ Nueva Reserva Confirmada' : '⏳ Nueva Solicitud de Reserva';
        const pushBody = `${clientFirstName} agendó para el ${selectedDate} a las ${selectedTime}.`;
        
        // Lo disparamos sin usar 'await' para que el cliente no tenga que esperar a que se envíe la notificación
        sendPushAlert(selectedBarber.fcmToken, pushTitle, pushBody)
          .catch(err => console.error("Error al enviar Push al barbero:", err));
      }
      // --------------------------------------------------

      // 4. Avanzar al éxito
      setSuccessId(ticketId);
      setStep(6); 

    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      alert("Hubo un error al procesar tu reserva. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };;

  if (loading) return (
    <div className="min-h-screen bg-bg-main text-txt-main flex items-center justify-center">
      <p className="animate-pulse text-gold text-xl font-bold tracking-widest uppercase">Cargando Experiencia...</p>
    </div>
  );

  const availableMethods = selectedBarber?.paymentMethods || { cash: true, transfer: true, online: false };
  const bankDetails = selectedBarber?.transferDetails;

  return (
    <div className="min-h-screen bg-bg-main text-txt-main py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto"> 
        
        {/* ENCABEZADO DE PASOS */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-2xl md:text-5xl font-extrabold text-txt-main mb-6 tracking-tight uppercase">
            Reserva tu <span className="text-gold">Turno</span>
          </h1>

          <div id="stepper-container" className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-2 md:justify-center whitespace-nowrap scrollbar-hide scroll-smooth">
            {[
              { id: 1, label: "01 Servicio" },
              { id: 2, label: "02 Barbero" },
              { id: 3, label: "03 Fecha & Hora" },
              { id: 4, label: "04 Tus Datos" },
              { id: 5, label: "05 Pago" },        
              { id: 6, label: "06 Confirmación" } 
            ].map((s) => {
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
                  id={`step-item-${s.id}`} // <-- NUEVO: Necesario para que el auto-scroll lo encuentre
                  onClick={() => isAvailable && handleStepChange(s.id)} // <-- NUEVO: Libera el candado si retrocede
                  className={`flex items-center gap-3 shrink-0 transition-all duration-300 
                    ${isAvailable ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-30"}`}
                >
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest 
                    ${step === s.id ? "text-gold scale-110" : "text-txt-secondary"}`}>
                    {s.label}
                  </span>
                  {s.id !== 6 && <div className="h-px w-6 bg-white/10"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- PASO 1: EL NUEVO COTIZADOR DE SERVICIOS --- */}
        {step === 1 && ( 
              <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
                
                {services.map(s => {
                  const isSelected = selectedService?.id === s.id;
                  const isBasic = s.name.toLowerCase().includes('basico'); // Identificador del servicio clásico
                  
                  return (
                  <div key={s.id} className={`border rounded-xl transition-all duration-500 overflow-hidden ${isSelected ? 'border-gold bg-gold/5 shadow-[0_0_25px_rgba(212,175,55,0.15)] ring-1 ring-gold/50' : 'border-white/10 bg-white/2 hover:border-white/20'}`}>
                    
                    {/* Cabecera Clickable (Siempre visible) */}
                    <div onClick={() => handleServiceSelect(s)} className="p-6 cursor-pointer flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-bold mb-1 text-white">{s.name}</h3>
                        
                        <p className="text-xs text-txt-muted mb-3 leading-relaxed">
                          {s.description}
                        </p>

                        {/* ALERTA VISUAL ANTI-CONFUSIONES (Solo sale en el Básico) */}
                        {isBasic && (
                          <div className="mb-3">
                            <span className="inline-block text-[9px] font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded tracking-wide">
                              ⚠️ SOLO CORTES CLÁSICOS (Para Fade elige Bronze o superior)
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-txt-secondary uppercase tracking-widest flex items-center gap-1"><Scissors size={12}/> {s.duration} MINUTOS</p>
                      </div>
                      
                      <div className="flex flex-col items-end shrink-0">
                        <p className="text-gold font-black text-2xl">${s.price.toLocaleString()}</p>
                      </div>
                    </div>

                   {/* Cuerpo Expandible (Cotizador) */}
                    <div className={`transition-all duration-500 ease-in-out bg-black/20 ${isSelected ? 'max-h-[1000px] opacity-100 border-t border-gold/20' : 'max-h-0 opacity-0'}`}>
                      <div className="p-6">
                        
                        <p className="text-[10px] text-txt-muted uppercase tracking-widest font-bold mb-4">Personaliza tu paquete (Desmarca lo que no desees):</p>
                        
                        {/* NOTA FIJA DINÁMICA: El corte siempre va incluido */}
                        <div className="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-gold/5 border-gold/20 opacity-80 cursor-default">
                          <CheckCircle2 size={18} className="text-gold" />
                          <span className="text-sm font-medium text-white italic">
                            {isBasic ? 'Corte Clásico (No incluye degradado)' : 'Corte Degradado / Fade'} 
                            <span className="text-txt-muted text-xs normal-case ml-2">- Base del servicio</span>
                          </span>
                        </div>

                        {/* CHECKBOXES DINÁMICOS */}
                        {s.includes && s.includes.length > 0 && (
                          <div className="mb-6 space-y-3">
                                {s.includes.map(item => {
                                  const isChecked = selectedItems.includes(item);
                                  return (
                                    <div 
                                      key={item} 
                                      onClick={() => toggleItem(item)}
                                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isChecked ? 'bg-gold/10 border-gold/30 text-white' : 'bg-white/5 border-white/5 text-txt-muted hover:bg-white/10'}`}
                                    >
                                        {isChecked ? <CheckCircle2 size={18} className="text-gold" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-white/20"></div>}
                                        <span className={`text-sm font-medium ${!isChecked && 'line-through'}`}>{item}</span>
                                    </div>
                                  )
                                })}
                          </div>
                        )}

                        {/* Botón Global de Addon (Corte de Barba) */}
                        <div 
                          onClick={() => setHasBeardAddon(!hasBeardAddon)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${hasBeardAddon ? 'bg-green-500/10 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/10 text-txt-muted hover:border-white/30'}`}
                        >
                            <div className="flex items-center gap-3">
                              <PlusCircle size={20} className={hasBeardAddon ? "text-green-500" : "text-white/40"} />
                              <div>
                                <p className="font-bold text-sm">Corte de Barba Adicional</p>
                                <p className="text-[10px] uppercase tracking-widest">Añadir a tu servicio</p>
                              </div>
                            </div>
                            <p className={`font-black ${hasBeardAddon ? "text-green-400" : "text-white"}`}>+$5.000</p>
                        </div>

                      </div>
                    </div>

                  </div>
                  )
                })}

               {/* Botonera Fija Abajo */}
                {selectedService && (
                  <div className="fixed bottom-0 left-0 right-0 bg-bg-main/90 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 z-50 animate-in slide-in-from-bottom-full">
                    <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] text-txt-muted uppercase tracking-widest font-bold">Total a Pagar</p>
                          <p className="text-2xl font-black text-gold">${currentTotal.toLocaleString()}</p>
                        </div>
                        <button onClick={() => setStep(2)} className="bg-gold text-bg-main px-8 py-4 rounded-lg font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-gold/20 hover:bg-gold-hover hover:-translate-y-1 transition-all">
                          Siguiente Paso
                        </button>
                    </div>
                  </div>
                )}
              </div>
        )}

        {/* --- PASOS DEL 2 AL 6 (SE MANTIENEN IGUAL QUE ANTES) --- */}
        {step === 2 && ( 
             <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                 {barbers.map(b => (
                   <div key={b.id} onClick={() => setSelectedBarber(b)} className={`p-4 border rounded-sm cursor-pointer transition-all duration-300 text-center flex flex-col items-center h-full justify-between hover:-translate-y-1 ${selectedBarber?.id === b.id ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.3)] ring-1 ring-gold' : 'border-white/10 bg-white/2 hover:border-gold/50 hover:bg-white/5'}`}>
                     
                     {/* --- CONTENEDOR DE IMAGEN ACTUALIZADO --- */}
                     <div className="mb-4 w-full aspect-square max-w-[120px] bg-bg-main border border-white/10 rounded-2xl mx-auto overflow-hidden shadow-lg">
                       <img 
                         src={BARBER_PHOTOS[b.id] || "https://via.placeholder.com/150"} 
                         alt={b.name} 
                         className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110" 
                         style={{ imageRendering: '-webkit-optimize-contrast' }} 
                       />
                     </div>
                     {/* -------------------------------------- */}

                     <div>
                       <h3 className="font-bold text-sm md:text-lg mb-1 text-txt-main uppercase tracking-tight leading-tight">{b.name.replace("PRUEBA", "")}</h3>
                       <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-2 truncate px-1">{b.role}</p>
                       <p className="text-txt-muted text-[10px] leading-tight hidden sm:block">{b.specialty}</p>
                     </div>
                     {selectedBarber?.id === b.id && (<div className="mt-3 w-3 h-3 bg-gold rounded-full animate-bounce"></div>)}
                   </div>
                 ))}
               </div>
               <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6 max-w-4xl mx-auto">
                 <button onClick={() => setStep(3)} disabled={!selectedBarber} className="sm:w-3/4 bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 shadow-xl shadow-gold/20 hover:bg-gold-hover transition-all">Ver Agenda de {selectedBarber?.name.split(' ')[0]}</button>
                 <button onClick={() => setStep(1)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Regresar</button>
               </div>
             </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8 p-4 bg-white/3 border-l-4 border-gold flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Resumen</p>
                <div className="flex flex-col md:flex-row md:items-center">
                  <p className="text-lg font-bold mb-1 md:mb-0 md:mr-2">{selectedService?.name}</p>
                  <p className="text-lg font-bold"><span className="text-txt-secondary font-light"> con</span> {selectedBarber?.name}</p>
                </div>
              </div>
              <div className="text-right">
                {/* Mostramos el total actualizado aquí también */}
                <p className="text-xl font-black text-gold">${currentTotal.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-gold uppercase tracking-[0.2em]">1. Elige la Fecha</h3>
                <div className="bg-white/2 p-6 rounded-sm border border-white/10">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-bg-main border border-white/10 rounded-sm p-4 text-txt-main text-lg focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              
             <div className="lg:col-span-3 space-y-4">
                <h3 className="text-sm font-bold text-gold uppercase tracking-[0.2em]">2. Horarios Disponibles</h3>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {loadingSchedule ? (
                      <p className="col-span-3 text-gold animate-pulse text-sm">Cargando disponibilidad...</p>
                  ) : validTimes.length > 0 ? (
                      validTimes.map(time => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            type="button" 
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 rounded-sm font-bold text-xs transition-all duration-300 border
                              ${isSelected 
                                ? 'bg-gold text-bg-main border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' 
                                : 'border-white/10 bg-white/2 text-txt-main hover:border-gold hover:text-gold'}`}
                          >
                            {time}
                          </button>
                        );
                      })
                  ) : (
                      <div className="col-span-3 sm:col-span-4 animate-in fade-in duration-500">
                          {/* ALERTA ROJA */}
                          <p className="text-red-400 text-xs border border-red-500/20 bg-red-500/10 p-3 rounded mb-6">
                              Las horas de este profesional ya pasaron o su agenda está llena para hoy.
                          </p>
                          
                          {/* LISTA DE OTROS BARBEROS RÁPIDA */}
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-[10px] text-txt-muted uppercase tracking-widest font-bold mb-4">
                              Prueba la disponibilidad de otro profesional:
                            </h4>
                            
                            <div className="flex flex-col gap-3">
                              {barbers
                                .filter(b => b.id !== selectedBarber?.id) 
                                .map(otherBarber => (
                                  <button
                                    key={otherBarber.id}
                                    onClick={() => setSelectedBarber(otherBarber)} 
                                    className="flex items-center gap-4 p-2 rounded hover:bg-white/10 transition-colors text-left"
                                  >
                                      <img 
                                        src={BARBER_PHOTOS[otherBarber.id] || "https://via.placeholder.com/150"} 
                                        alt={otherBarber.name}
                                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                                      />
                                      <div>
                                        <p className="text-sm font-bold text-white leading-tight">
                                          {otherBarber.name.replace("PRUEBA", "")}
                                        </p>
                                        <p className="text-[10px] text-gold uppercase tracking-widest">
                                          Ver su agenda
                                        </p>
                                      </div>
                                  </button>
                              ))}
                            </div>
                          </div>
                      </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6">
              <button 
                disabled={!selectedTime || isLocking}
                className="sm:w-3/4 bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 shadow-xl shadow-gold/20 hover:bg-gold-hover transition-all flex justify-center items-center"
                onClick={handleProceedToStep4} // <-- Usamos la nueva función
              >
                {isLocking ? "Asegurando hora..." : "Ingresar Datos"}
              </button>
              <button onClick={() => setStep(2)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                Regresar
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl font-bold text-gold text-center mb-2 uppercase tracking-widest">Tus Datos</h2>
            
            {/* NUEVO: Mensaje dinámico si el usuario está logueado */}
            {user ? (
               <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-8 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Perfil Cargado Automáticamente</span>
               </div>
            ) : (
               <p className="text-center text-txt-muted text-sm mb-8">Ingresa tus datos para continuar.</p>
            )}

            <form onSubmit={(e) => { e.preventDefault(); setStep(5); }} className="space-y-6">
              <div><label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Nombre Completo</label><input required type="text" value={clientData.name} onChange={(e) => setClientData({...clientData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-sm focus:border-gold outline-none transition-all" placeholder="Ej: Juan Pérez" /></div>
              <div><label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Teléfono</label><input required type="tel" value={clientData.phone} onChange={(e) => setClientData({...clientData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-sm focus:border-gold outline-none transition-all" placeholder="+56 9 ..." /></div>
              <div><label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Email</label><input required type="email" value={clientData.email} onChange={(e) => setClientData({...clientData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-sm focus:border-gold outline-none transition-all" placeholder="correo@ejemplo.com" /></div>
              <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6">
                <button type="submit" className="w-full bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] hover:bg-gold-hover transition-all shadow-xl shadow-gold/20">Continuar al Pago</button>
                <button type="button" onClick={() => handleStepChange(3)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Regresar</button>
              </div>
            </form>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl font-bold text-gold text-center mb-2 uppercase tracking-widest">Método de Pago</h2>
            <p className="text-center text-txt-muted text-sm mb-8">Selecciona cómo deseas abonar tu servicio.</p>

            <div className="space-y-4">
              {availableMethods.cash && (
                <div 
                  onClick={() => setSelectedPaymentMethod('cash')}
                  className={`p-6 border rounded-sm cursor-pointer transition-all duration-300 flex items-center justify-between
                    ${selectedPaymentMethod === 'cash' ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10 bg-white/2 hover:border-gold/30'}`}
                >
                  <div>
                    <h3 className="text-lg font-bold text-white">Efectivo en el Local</h3>
                    <p className="text-xs text-txt-muted">Pagas directamente al finalizar tu servicio.</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'cash' ? 'border-gold bg-gold' : 'border-white/20'}`}>
                     {selectedPaymentMethod === 'cash' && <CheckCircle2 size={16} className="text-bg-main" />}
                  </div>
                </div>
              )}

              {availableMethods.online && (
                 <div 
                 onClick={() => setSelectedPaymentMethod('online')}
                 className={`p-6 border rounded-sm cursor-pointer transition-all duration-300 flex items-center justify-between
                   ${selectedPaymentMethod === 'online' ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10 bg-white/2 hover:border-gold/30'}`}
               >
                 <div>
                   <h3 className="text-lg font-bold text-white">Pago Online (Webpay)</h3>
                   <p className="text-xs text-txt-muted">Paga ahora mismo de forma rápida y segura.</p>
                 </div>
                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'online' ? 'border-gold bg-gold' : 'border-white/20'}`}>
                    {selectedPaymentMethod === 'online' && <CheckCircle2 size={16} className="text-bg-main" />}
                 </div>
               </div>
              )}

              {availableMethods.transfer && (
                <div className={`transition-all duration-300 border rounded-sm overflow-hidden
                    ${selectedPaymentMethod === 'transfer' ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10 bg-white/2 hover:border-gold/30'}`}>
                  
                  <div 
                    onClick={() => setSelectedPaymentMethod('transfer')}
                    className="p-6 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white">Transferencia Bancaria</h3>
                      <p className="text-xs text-txt-muted">Realiza el abono antes de tu cita y asegura tu hora.</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'transfer' ? 'border-gold bg-gold' : 'border-white/20'}`}>
                       {selectedPaymentMethod === 'transfer' && <CheckCircle2 size={16} className="text-bg-main" />}
                    </div>
                  </div>

                  <div className={`transition-all duration-500 ${selectedPaymentMethod === 'transfer' ? 'max-h-[500px] border-t border-gold/20' : 'max-h-0'}`}>
                     <div className="p-6">
                        <p className="text-xs text-gold uppercase tracking-widest font-bold mb-4">Datos para transferir</p>
                        
                        {bankDetails?.accountNumber ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-sm text-txt-muted">RUT</span>
                              <span className="text-sm font-mono text-white">{bankDetails.rut}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-sm text-txt-muted">N° Cuenta</span>
                              <span className="text-sm font-mono text-white">{bankDetails.accountNumber}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-sm text-txt-muted">Banco</span>
                              <span className="text-sm text-white">{bankDetails.bank}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-sm text-txt-muted">Tipo</span>
                              <span className="text-sm text-white">{bankDetails.accountType}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                              <span className="text-sm text-txt-muted">Nombre</span>
                              <span className="text-sm text-white">{bankDetails.fullName}</span>
                            </div>

                            <button 
                                type="button" 
                                onClick={handleCopyAllBankDetails}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white p-4 rounded-lg transition-all text-sm font-bold"
                            >
                                {copiedDetail === 'all' ? (
                                    <>
                                        <CheckCircle2 size={18} className="text-green-500" />
                                        <span className="text-green-500">¡Datos copiados con éxito!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} className="text-gold" />
                                        <span>Copiar Datos de Transferencia</span>
                                    </>
                                )}
                            </button>

                          </div>
                        ) : (
                          <p className="text-sm text-red-400 italic">El barbero aún no configura sus datos bancarios.</p>
                        )}
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-8 pt-6">
              <button 
                onClick={handleFinalizeBooking} 
                disabled={!selectedPaymentMethod || isSubmitting}
                className="w-full bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-hover transition-all shadow-xl shadow-gold/20 flex justify-center items-center"
              >
                {isSubmitting ? "Procesando Reserva..." : `Confirmar por $${currentTotal.toLocaleString()}`}
              </button>
              <button onClick={() => setStep(4)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                Regresar
              </button>
            </div>
          </div>
        )}

{step === 6 && (() => {
          // 1. Re-calculamos el estado para saber si está confirmada o pendiente
          let isConfirmed = false;
          if (selectedPaymentMethod === 'online') isConfirmed = true;
          else if (selectedPaymentMethod === 'cash' && selectedBarber?.autoConfirmCash) isConfirmed = true;
          else if (selectedPaymentMethod === 'transfer' && selectedBarber?.autoConfirmTransfer) isConfirmed = true;
          else if (selectedBarber?.autoConfirm) isConfirmed = true;

          // 2. LÓGICA DE WHATSAPP: Mensaje dinámico y enlace
          const barberPhone = selectedBarber?.phone || '+56937605937'; // Tomamos el teléfono recién configurado
          let wsMessage = '';
          const cleanBarberName = selectedBarber?.name?.replace("PRUEBA", "") || "Barbero";
          const clientFirstName = clientData.name?.split(' ')[0] || "Cliente";

          if (isConfirmed) {
            wsMessage = `Hola ${cleanBarberName}, soy ${clientFirstName}. ¡Ya tengo mi hora confirmada para el ${selectedDate} a las ${selectedTime}! Nos vemos pronto.`;
          } else if (selectedPaymentMethod === 'transfer') {
            wsMessage = `Hola ${cleanBarberName}, soy ${clientFirstName}. Acabo de solicitar una reserva para el ${selectedDate} a las ${selectedTime} pagando por transferencia. Adjunto mi comprobante para asegurar la hora:`;
          } else if (selectedPaymentMethod === 'cash') {
            wsMessage = `Hola ${cleanBarberName}, soy ${clientFirstName}. Acabo de solicitar una reserva para el ${selectedDate} a las ${selectedTime} con pago en efectivo. Escribo para confirmar mi hora.`;
          }

          // Codificamos el mensaje para que funcione en la URL
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
                  <p className="text-gold text-sm font-bold mb-6">Recuerda realizar tu transferencia y enviarle el comprobante al barbero para asegurar tu hora.</p>
              )}
              {selectedPaymentMethod === 'online' && (
                  <p className="text-blue-400 text-sm font-bold mb-6">Serás redirigido a la pasarela de pago en breve (Simulación).</p>
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
                {/* NUEVO: Botón Gigante de WhatsApp (Solo se muestra si el barbero configuró su teléfono) */}
                {barberPhone && (
                  <a 
                    href={wsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-black py-4 px-10 rounded-sm font-black uppercase tracking-widest hover:bg-[#1ebe5d] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
                  >
                    <span>Contactar por WhatsApp</span>
                  </a>
                )}

                <Link to="/" className="w-full border border-white/20 text-white py-4 px-10 rounded-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all block">
                  Volver al Inicio
                </Link>
              </div>

            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Booking;