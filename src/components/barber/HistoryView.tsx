import { useState, useEffect } from "react";
import { DollarSign, Search, Loader2, ChevronDown, ChevronUp, CalendarDays, Scissors, Landmark, CreditCard, Wallet } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { type Appointment } from "../../models/Appointment"; 
import { calculateMonthlyMetrics } from "../../utils/metrics.utils"; // <-- IMPORTACIÓN NUEVA

// --- HELPERS UX ---
const isPastDay = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const apptDate = new Date(`${dateString}T00:00:00`);
  return apptDate < today;
};

const formatDate = (dateString: string) => {
    const d = new Date(`${dateString}T00:00:00`);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' }).toUpperCase();
};

const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

// --- COMPONENTE VISUAL DE PAGO ---
const PaymentBadge = ({ method }: { method?: 'cash' | 'transfer' | 'online' }) => {
    if (method === 'transfer') return <div className="flex w-fit items-center gap-1 text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-wider" title="Transferencia Bancaria"><Landmark size={10}/> Transf.</div>;
    if (method === 'online') return <div className="flex w-fit items-center gap-1 text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider" title="Pago Online"><CreditCard size={10}/> Webpay</div>;
    return <div className="flex w-fit items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider" title="Pago en Efectivo"><Wallet size={10}/> Efectivo</div>;
};

// --- COMPONENTE VISUAL DE ESTADO ---
const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'completed') return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-blue-500/20 text-blue-400">Realizada</span>;
    if (status === 'cancelled' || status === 'canceled') return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-red-500/20 text-red-400">Cancelada</span>;
    if (status === 'confirmed') return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-green-500/20 text-green-400">Confirmada</span>;
    
    return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-yellow-500/20 text-yellow-400">Pendiente</span>;
};

const HistoryView = ({ barberId }: { barberId: string }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  useEffect(() => {
    if (!barberId) return;

    const q = query(collection(db, "appointments"), where("barberId", "==", barberId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];
      const pastData = dbData.filter(a => isPastDay(a.date));
      
      pastData.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.time.localeCompare(a.time);
      });

      setAppointments(pastData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [barberId]);

  const toggleMonth = (month: string) => {
      setExpandedMonths(prev => 
          prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
      );
  };

  const filteredAppointments = appointments.filter((appt) => {
    const term = searchTerm.toLowerCase();
    return (appt.clientName?.toLowerCase().includes(term) || appt.id.toLowerCase().includes(term) || appt.date.includes(term));
  });

  // LLAMADA LIMPIA A LA FUNCIÓN DE MÉTRICAS
  const historyData = calculateMonthlyMetrics(filteredAppointments);

  if (loading) return <div className="text-center py-20 text-gold flex justify-center"><Loader2 className="animate-spin"/> Cargando historial...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-txt-muted" />
        </div>
        <input
          type="text"
          placeholder="Buscar citas pasadas por cliente, ID o fecha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-bg-card text-txt-main placeholder-txt-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
        />
      </div>

      {Object.keys(historyData).length === 0 ? (
        <div className="text-center py-20 opacity-50 bg-bg-card rounded-xl border border-white/5 border-dashed">
          <p className="text-txt-main font-bold">No hay historial de citas disponible.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {Object.entries(historyData).map(([month, data]) => {
                const isExpanded = expandedMonths.includes(month);
                
                return (
                    <div key={month} className="bg-bg-card border border-white/5 rounded-xl overflow-hidden shadow-lg transition-all">
                        
                        <div className="w-full p-5 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleMonth(month)}>
                                <div className="p-3 bg-white/5 rounded-lg text-gold"><CalendarDays size={24}/></div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-black text-white">{month}</h2>
                                    <p className="text-xs text-txt-muted font-bold uppercase tracking-widest">{data.totalAppts} Citas Históricas</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:items-end w-full md:w-auto border-t md:border-none border-white/5 pt-4 md:pt-0">
                                <p className="text-[10px] uppercase text-txt-muted font-bold tracking-widest mb-1">Ingresos Totales</p>
                                <div className="flex items-center gap-4 mb-3">
                                   <p className="text-2xl font-black text-green-400">{formatMoney(data.totalRevenue)}</p>
                                   <button onClick={() => toggleMonth(month)} className="text-white/50 bg-white/5 p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors">
                                       {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                   </button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                    {data.revenueByMethod.cash > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-bold">
                                            <Wallet size={12}/> {formatMoney(data.revenueByMethod.cash)}
                                        </div>
                                    )}
                                    {data.revenueByMethod.transfer > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 font-bold">
                                            <Landmark size={12}/> {formatMoney(data.revenueByMethod.transfer)}
                                        </div>
                                    )}
                                    {data.revenueByMethod.online > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 font-bold">
                                            <CreditCard size={12}/> {formatMoney(data.revenueByMethod.online)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="p-5 md:p-6 bg-black/20 border-t border-white/5 space-y-8 animate-in slide-in-from-top-4 duration-300">
                                {Object.entries(data.days).map(([date, appts]) => (
                                    <div key={date}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-px bg-white/10 grow"></div>
                                            <div className="bg-bg-main border border-white/10 px-4 py-1.5 rounded-full">
                                                <h3 className="text-txt-muted font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] whitespace-nowrap">
                                                    {formatDate(date)}
                                                </h3>
                                            </div>
                                            <div className="h-px bg-white/10 grow"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {appts.map(appt => {
                                                const isCanceled = appt.status === 'cancelled' || (appt.status as string) === 'canceled';

                                                return (
                                                <div key={appt.id} className={`bg-bg-card border border-white/5 p-4 rounded-lg flex flex-col justify-between transition-opacity ${isCanceled ? 'opacity-50 grayscale' : 'opacity-90 hover:opacity-100'}`}>
                                                    
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <p className={`text-sm font-bold ${isCanceled ? 'line-through text-txt-muted' : 'text-white'}`}>{appt.clientName}</p>
                                                                <StatusBadge status={appt.status} />
                                                            </div>
                                                            <p className="text-xs text-txt-muted flex items-center gap-1"><Scissors size={12} className="text-gold/50"/> {appt.serviceName}</p>
                                                        </div>
                                                        <span className="text-xs font-black text-gold bg-gold/10 px-2 py-1 rounded">{appt.time}</span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-auto">
                                                        <PaymentBadge method={appt.paymentMethod} />
                                                        <span className="text-xs font-bold text-white flex items-center gap-1"><DollarSign size={12} className="text-gold"/>{appt.price}</span>
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;