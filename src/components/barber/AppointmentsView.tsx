import { useState, useEffect } from "react";
import { Clock, DollarSign, Phone, MessageCircle, Scissors, Search, Loader2, Mail, Copy, Calendar, Landmark, CreditCard, Wallet } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { type Appointment } from "../../models/Appointment"; 
import { sendConfirmationMessage } from "../../utils/whatsapp";
import { copyToClipboard } from "../../utils/clipboard";

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
    if (method === 'transfer') {
        return (
            <div className="flex w-fit items-center gap-1 text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-wider" title="Transferencia Bancaria">
                <Landmark size={10}/> Transf.
            </div>
        );
    }
    if (method === 'online') {
        return (
            <div className="flex w-fit items-center gap-1 text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider" title="Pago Online (Webpay)">
                <CreditCard size={10}/> Webpay
            </div>
        );
    }
    return (
        <div className="flex w-fit items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider" title="Pago en Efectivo">
            <Wallet size={10}/> Efectivo
        </div>
    );
};

const AppointmentsView = ({ barberId }: { barberId: string }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    const nameMatch = appt.clientName ? appt.clientName.toLowerCase().includes(term) : false;
    const idMatch = appt.id.toLowerCase().includes(term);
    const dateMatch = appt.date.includes(term);
    return nameMatch || idMatch || dateMatch;
  });

  const isSearching = searchTerm.length > 0;
  const todayAppts = filteredAppointments.filter(a => isToday(a.date));
  const futureAppts = filteredAppointments.filter(a => !isToday(a.date) && !isPast(a.date, a.time));

  const groupAppointmentsByDate = (appts: Appointment[]) => {
      return appts.reduce((acc, appt) => {
          if (!acc[appt.date]) acc[appt.date] = [];
          acc[appt.date].push(appt);
          return acc;
      }, {} as Record<string, Appointment[]>);
  };

  const groupedFuture = groupAppointmentsByDate(futureAppts);

  const AppointmentCard = ({ appt, isDimmed = false }: { appt: Appointment, isDimmed?: boolean }) => (
    <div className={`bg-bg-card rounded-xl border border-white/5 overflow-hidden transition-all shadow-lg group ${isDimmed ? 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0' : 'hover:-translate-y-1 hover:border-gold/30'}`}>
        <div className="bg-white/5 p-4 flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-xl font-black text-white"><Clock className="text-gold" size={20} />{appt.time}</div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${appt.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>{appt.status === 'confirmed' ? 'Confirmada' : appt.status}</span>
        </div>
        <div className="p-5 space-y-4">
            <div>
                <h3 className="text-lg font-bold text-txt-main mb-1">{appt.clientName}</h3>
                <div className="flex flex-col gap-1 text-xs text-txt-muted">
                <div className="flex items-center gap-2"><Phone size={14} className="text-gold/70" /> {appt.clientPhone}</div>
                <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gold/70" />
                    <span className="truncate max-w-[150px]">{appt.clientEmail}</span>
                    <button onClick={() => handleCopyEmail(appt.clientEmail, appt.id)} className="text-gold/50 hover:text-gold p-1" title="Copiar correo">
                        {copiedId === appt.id ? <span className="text-[10px] text-green-500 font-bold">¡OK!</span> : <Copy size={14} />}
                    </button>
                </div>
                </div>
            </div>
            <div className="flex justify-between items-end border-t border-white/5 pt-4">
                <div className="space-y-2">
                    <div>
                        <p className="text-[10px] uppercase text-txt-muted font-bold tracking-wider mb-1">Servicio</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-white"><Scissors size={14} className="text-gold" />{appt.serviceName}</div>
                    </div>
                    <PaymentBadge method={appt.paymentMethod} />
                </div>
                <div className="bg-bg-main rounded-lg px-3 py-1 border border-white/5 flex items-center gap-2 text-sm font-bold text-gold"><DollarSign size={14} />{appt.price}</div>
            </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/5 divide-x divide-white/5">
            <a href={`tel:${appt.clientPhone}`} className="p-3 flex justify-center items-center gap-2 hover:bg-gold hover:text-bg-main transition-colors text-xs font-bold text-txt-muted"><Phone size={14} /> Llamar</a>
            <button onClick={() => sendConfirmationMessage(appt)} className="p-3 flex justify-center items-center gap-2 hover:bg-green-600 hover:text-white transition-colors text-xs font-bold text-green-500"><MessageCircle size={14} /> WhatsApp</button>
        </div>
    </div>
  );

  if (loading) return <div className="text-center py-20 text-gold flex justify-center"><Loader2 className="animate-spin"/> Cargando citas...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-txt-muted" />
        </div>
        <input
          type="text"
          placeholder="Buscar por cliente o fecha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-bg-card text-txt-main placeholder-txt-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
        />
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-20 opacity-50 bg-bg-card rounded-xl border border-white/5 border-dashed">
          <p className="text-txt-main font-bold">No hay reservas encontradas</p>
        </div>
      ) : isSearching ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
         </div>
      ) : (
        <div className="space-y-12">
            
            <section>
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                    <Calendar className="text-gold" size={24} />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Citas de Hoy</h2>
                    <span className="bg-gold/20 text-gold text-xs font-bold px-2 py-1 rounded-full">{todayAppts.length}</span>
                </div>
                
                {todayAppts.length === 0 ? (
                    <p className="text-txt-muted text-sm italic">No tienes citas programadas para hoy.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {todayAppts.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
                    </div>
                )}
            </section>

            {Object.keys(groupedFuture).length > 0 && (
                <section className="pt-8">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                        <Calendar className="text-txt-muted" size={24} />
                        Próximos Días
                    </h2>
                    
                    <div className="space-y-12">
                        {Object.entries(groupedFuture).map(([date, appts]) => (
                            <div key={date} className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-px bg-linear-to-r from-gold/40 to-transparent grow"></div>
                                    <div className="bg-bg-main border border-gold/40 px-5 py-2 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.15)] relative z-10">
                                        <h3 className="text-gold font-black text-xs md:text-sm uppercase tracking-[0.2em] whitespace-nowrap">
                                            {formatDate(date)}
                                        </h3>
                                    </div>
                                    <div className="h-px bg-linear-to-l from-gold/40 to-transparent grow"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                     {appts.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
                                </div>
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