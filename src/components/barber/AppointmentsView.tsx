import { useState, useEffect } from "react";
import { Clock, DollarSign, Phone, MessageCircle, Scissors, Search, Loader2, Mail, Copy, Calendar, Landmark, CreditCard, Wallet, CheckCircle2, PlusCircle, ChevronDown } from "lucide-react"; 
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { type Appointment } from "../../models/Appointment"; 
import { sendConfirmationMessage } from "../../utils/whatsapp";
import { copyToClipboard } from "../../utils/clipboard";
import { updateAppointmentStatus } from "../../services/booking.service"; 

const isToday = (dateString: string) => {
  const today = new Date();
  const date = new Date(`${dateString}T00:00:00`);
  return date.toDateString() === today.toDateString();
};

const isPast = (dateString: string, timeString: string) => {
    const now = new Date();
    const apptDate = new Date(`${dateString}T${timeString}:00`);
    return apptDate < now;
};

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('es-ES', options).toUpperCase();
};

const PaymentBadge = ({ method }: { method?: 'cash' | 'transfer' | 'online' }) => {
    if (method === 'transfer') return <div className="flex w-fit items-center gap-1 text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-wider" title="Transferencia Bancaria"><Landmark size={10}/> Transf.</div>;
    if (method === 'online') return <div className="flex w-fit items-center gap-1 text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider" title="Pago Online (Webpay)"><CreditCard size={10}/> Webpay</div>;
    return <div className="flex w-fit items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider" title="Pago en Efectivo"><Wallet size={10}/> Efectivo</div>;
};

const AppointmentsView = ({ barberId }: { barberId: string }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null); 
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // Controla qué menú está abierto

  const handleStatusChange = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    setUpdatingId(appointmentId);
    try {
        await updateAppointmentStatus(appointmentId, newStatus);
    } catch (error) {
        alert("Hubo un error al actualizar la cita.");
    } finally {
        setUpdatingId(null);
        setOpenDropdownId(null); // Cierra el menú tras actualizar
    }
  };

  const handleCopyEmail = (email: string, id: string) => {
    const success = copyToClipboard(email); 
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); 
    }
  };

  useEffect(() => {
    if (!barberId) return;
    const q = query(collection(db, "appointments"), where("barberId", "==", barberId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];
      dbData.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
      setAppointments(dbData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [barberId]);

  const filteredAppointments = appointments.filter((appt) => {
    const term = searchTerm.toLowerCase();
    return (appt.clientName?.toLowerCase().includes(term) || appt.id.toLowerCase().includes(term) || appt.date.includes(term));
  });

  const isSearching = searchTerm.length > 0;
  
  const todayAppts = filteredAppointments.filter(a => isToday(a.date));
  const todayPending = todayAppts.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const todayCompleted = todayAppts.filter(a => a.status === 'completed');
  const futureAppts = filteredAppointments.filter(a => !isToday(a.date) && !isPast(a.date, a.time));

  const groupAppointmentsByDate = (appts: Appointment[]) => {
      return appts.reduce((acc, appt) => {
          if (!acc[appt.date]) acc[appt.date] = [];
          acc[appt.date].push(appt);
          return acc;
      }, {} as Record<string, Appointment[]>);
  };
  const groupedFuture = groupAppointmentsByDate(futureAppts);

  const getStatusDisplay = (appt: Appointment) => {
      if (appt.status === 'completed') return { text: 'Realizada', colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      if (appt.status === 'cancelled') return { text: 'Cancelada', colorClass: 'bg-red-500/20 text-red-400 border-red-500/30' };
      if (appt.status === 'confirmed') return { text: 'Confirmada', colorClass: 'bg-green-500/20 text-green-400 border-green-500/30' };
      
      // Si el estado es 'pending'
      if (appt.paymentMethod === 'transfer') {
          return { text: 'Pago Pendiente', colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse' };
      }
      return { text: 'Por Confirmar', colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  };

  const AppointmentCard = ({ appt, isDimmed = false }: { appt: Appointment, isDimmed?: boolean }) => {
    const isBasic = appt.serviceName.toLowerCase().includes('basico');
    const isCompleted = appt.status === 'completed';
    const statusDisplay = getStatusDisplay(appt);

    return (
    <div className={`flex flex-col h-full bg-bg-card rounded-xl border border-white/5 overflow-hidden transition-all shadow-lg group ${isDimmed || isCompleted ? 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0' : 'hover:-translate-y-1 hover:border-gold/30'}`}>
        
        {/* CABECERA (Fija arriba) */}
        <div className="bg-white/5 p-4 flex justify-between items-start shrink-0">
            <div className="flex items-center gap-2 text-xl font-black text-white"><Clock className="text-gold" size={20} />{appt.time}</div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${statusDisplay.colorClass}`}>
                {statusDisplay.text}
            </span>
        </div>

        {/* CONTENIDO PRINCIPAL (Ocupa todo el espacio restante empujando el footer abajo) */}
        <div className="p-5 flex flex-col grow">
            <h3 className="text-lg font-bold text-txt-main mb-3">{appt.clientName}</h3>
            
            {/* CORREO Y TELÉFONO RESTAURADOS */}
            <div className="flex flex-col gap-1 text-xs text-txt-muted mb-4">
                <div className="flex items-center gap-2"><Phone size={14} className="text-gold/70" /> {appt.clientPhone}</div>
                <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gold/70" />
                    <span className="truncate max-w-[150px]">{appt.clientEmail}</span>
                    <button onClick={() => handleCopyEmail(appt.clientEmail, appt.id)} className="text-gold/50 hover:text-gold p-1" title="Copiar correo">
                        {copiedId === appt.id ? <span className="text-[10px] text-green-500 font-bold">¡OK!</span> : <Copy size={14} />}
                    </button>
                </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-2 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Scissors size={14} className="text-gold" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">{appt.serviceName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-txt-muted">
                    <CheckCircle2 size={12} className="text-gold" />
                    <span>{isBasic ? 'Corte Clásico' : 'Corte Degradado / Fade'}</span>
                </div>
                {appt.selectedItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-txt-muted">
                        <CheckCircle2 size={12} className="text-gold" /><span>{item}</span>
                    </div>
                ))}
                {appt.hasBeardAddon && (
                    <div className="flex items-center gap-2 text-xs text-green-400 font-bold mt-2 pt-2 border-t border-white/5">
                        <PlusCircle size={12} /><span>Corte de Barba Adicional</span>
                    </div>
                )}
            </div>

            {/* Este mt-auto garantiza que el precio se vaya al fondo del contenedor principal */}
            <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-auto">
                <PaymentBadge method={appt.paymentMethod} />
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-txt-muted uppercase font-bold tracking-widest">Total</span>
                    <span className="text-sm font-black text-gold flex items-center"><DollarSign size={14} />{appt.price}</span>
                </div>
            </div>
        </div>

       {/* BOTONERA DE ACCIÓN (Siempre pegada al borde inferior) */}
        <div className="flex flex-col shrink-0">
            <div className="grid grid-cols-2 border-t border-white/5 divide-x divide-white/5">
                <a href={`tel:${appt.clientPhone}`} className="p-3 flex justify-center items-center gap-2 hover:bg-gold hover:text-bg-main transition-colors text-xs font-bold text-txt-muted"><Phone size={14} /> Llamar</a>
                <button onClick={() => sendConfirmationMessage(appt)} className="p-3 flex justify-center items-center gap-2 hover:bg-green-600 hover:text-white transition-colors text-xs font-bold text-green-500"><MessageCircle size={14} /> WhatsApp</button>
            </div>
            
            {/* DESPLEGABLE DE ESTADOS (Corregido: Flotante absoluto con Animación Suave) */}
            {!isCompleted && appt.status !== 'cancelled' && (
                <div className="relative border-t border-white/5 bg-black/20">
                    
                    {/* Opciones del menú (Deslizan suavemente desde abajo) */}
                    <div className={`absolute bottom-full left-0 w-full flex flex-col bg-bg-card/95 backdrop-blur-md border-t border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] transition-all duration-300 ease-out z-10 ${openDropdownId === appt.id ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                        {appt.status !== 'confirmed' && (
                            <button onClick={(e) => { e.stopPropagation(); handleStatusChange(appt.id, 'confirmed'); }} className="p-4 text-xs font-bold text-green-400 hover:bg-green-500/10 border-b border-white/5 transition-colors">
                                Aprobar / Confirmar Reserva
                            </button>
                        )}
                        {appt.status !== 'completed' && (
                            <button onClick={(e) => { e.stopPropagation(); handleStatusChange(appt.id, 'completed'); }} className="p-4 text-xs font-bold text-blue-400 hover:bg-blue-500/10 border-b border-white/5 transition-colors">
                                Marcar como Realizada
                            </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(appt.id, 'cancelled'); }} className="p-4 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                            Cancelar Reserva
                        </button>
                    </div>

                    {/* Botón principal (Abre/Cierra el menú) */}
                    <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            setOpenDropdownId(openDropdownId === appt.id ? null : appt.id); 
                        }}
                        className="w-full p-4 hover:bg-white/5 flex justify-center items-center gap-2 transition-colors text-xs font-bold text-txt-main uppercase tracking-widest relative z-20"
                    >
                        {updatingId === appt.id ? <Loader2 size={16} className="animate-spin" /> : 'Actualizar Estado'}
                        <ChevronDown size={14} className={`transition-transform duration-300 ${openDropdownId === appt.id ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            )}
        </div>

    </div>
  )};

  if (loading) return <div className="text-center py-20 text-gold flex justify-center"><Loader2 className="animate-spin"/> Cargando citas...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-txt-muted" /></div>
        <input type="text" placeholder="Buscar por cliente o fecha..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-bg-card text-txt-main placeholder-txt-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" />
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-20 opacity-50 bg-bg-card rounded-xl border border-white/5 border-dashed"><p className="text-txt-main font-bold">No hay reservas encontradas</p></div>
      ) : isSearching ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">{filteredAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}</div>
      ) : (
        <div className="space-y-12">
            
            <section>
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                    <Calendar className="text-gold" size={24} />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Citas de Hoy</h2>
                    <span className="bg-gold/20 text-gold text-xs font-bold px-2 py-1 rounded-full">{todayPending.length}</span>
                </div>
                {todayPending.length === 0 ? <p className="text-txt-muted text-sm italic">No tienes citas pendientes para hoy.</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">{todayPending.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}</div>
                )}
            </section>

            {todayCompleted.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                        <CheckCircle2 className="text-blue-400" size={20} />
                        <h2 className="text-lg font-black text-white uppercase tracking-tight opacity-70">Realizadas Hoy</h2>
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2 py-1 rounded-full">{todayCompleted.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">{todayCompleted.map(appt => <AppointmentCard key={appt.id} appt={appt} isDimmed={true} />)}</div>
                </section>
            )}

            {Object.keys(groupedFuture).length > 0 && (
                <section className="pt-8">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3"><Calendar className="text-txt-muted" size={24} />Próximos Días</h2>
                    <div className="space-y-12">
                        {Object.entries(groupedFuture).map(([date, appts]) => (
                            <div key={date} className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-px bg-linear-to-r from-gold/40 to-transparent grow"></div>
                                    <div className="bg-bg-main border border-gold/40 px-5 py-2 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.15)] relative z-10"><h3 className="text-gold font-black text-xs md:text-sm uppercase tracking-[0.2em] whitespace-nowrap">{formatDate(date)}</h3></div>
                                    <div className="h-px bg-linear-to-l from-gold/40 to-transparent grow"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">{appts.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsView;