import { useState, useEffect } from "react";
import { DollarSign, Search, Loader2, ChevronDown, ChevronUp, CalendarDays, Scissors } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { type Appointment } from "../../models/Appointment"; 

// --- HELPERS UX ---
const isPastDay = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const apptDate = new Date(`${dateString}T00:00:00`);
  return apptDate < today;
};

const getMonthYear = (dateString: string) => {
    const d = new Date(`${dateString}T00:00:00`);
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
};

const formatDate = (dateString: string) => {
    const d = new Date(`${dateString}T00:00:00`);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' }).toUpperCase();
};

const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
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
      // Solo nos interesan las citas de días anteriores
      const pastData = dbData.filter(a => isPastDay(a.date));
      
      // Ordenar: del más reciente al más antiguo
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

  // Filtrado de búsqueda
  const filteredAppointments = appointments.filter((appt) => {
    const term = searchTerm.toLowerCase();
    return (appt.clientName?.toLowerCase().includes(term) || appt.id.toLowerCase().includes(term) || appt.date.includes(term));
  });

  // AGRUPACIÓN MAGISTRAL (Mes -> Días) + Cálculos financieros
  const historyData = filteredAppointments.reduce((acc, appt) => {
      const month = getMonthYear(appt.date);
      if (!acc[month]) acc[month] = { totalAppts: 0, totalRevenue: 0, days: {} };
      
      acc[month].totalAppts += 1;
      // Extraemos solo los números del string de precio para sumarlos (ej. "$15.000" -> 15000)
      acc[month].totalRevenue += parseInt(String(appt.price).replace(/[^0-9]/g, '')) || 0;
      
      if (!acc[month].days[appt.date]) acc[month].days[appt.date] = [];
      acc[month].days[appt.date].push(appt);
      
      return acc;
  }, {} as Record<string, { totalAppts: number, totalRevenue: number, days: Record<string, Appointment[]> }>);


  if (loading) return <div className="text-center py-20 text-gold flex justify-center"><Loader2 className="animate-spin"/> Cargando historial...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* BARRA DE BÚSQUEDA */}
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
                        {/* CABECERA DEL MES (Acordeón) */}
                        <button 
                            onClick={() => toggleMonth(month)}
                            className="w-full p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/5 rounded-lg text-gold"><CalendarDays size={24}/></div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-black text-white">{month}</h2>
                                    <p className="text-xs text-txt-muted font-bold uppercase tracking-widest">{data.totalAppts} Citas Completadas</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-none border-white/5 pt-4 md:pt-0">
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] uppercase text-txt-muted font-bold tracking-widest mb-1">Ingresos del Mes</p>
                                    <p className="text-lg font-black text-green-400">{formatMoney(data.totalRevenue)}</p>
                                </div>
                                <div className="text-white/50 bg-white/5 p-2 rounded-full">
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                        </button>

                        {/* CONTENIDO DESPLEGABLE (Días y Tarjetas) */}
                        {isExpanded && (
                            <div className="p-5 md:p-6 bg-black/20 border-t border-white/5 space-y-8 animate-in slide-in-from-top-4 duration-300">
                                {Object.entries(data.days).map(([date, appts]) => (
                                    <div key={date}>
                                        {/* DIVISOR DEL DÍA */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-px bg-white/10 grow"></div>
                                            <div className="bg-bg-main border border-white/10 px-4 py-1.5 rounded-full">
                                                <h3 className="text-txt-muted font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] whitespace-nowrap">
                                                    {formatDate(date)}
                                                </h3>
                                            </div>
                                            <div className="h-px bg-white/10 grow"></div>
                                        </div>

                                        {/* LISTA MINIATURA DE CITAS (Versión compacta para historial) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {appts.map(appt => (
                                                <div key={appt.id} className="bg-bg-card border border-white/5 p-4 rounded-lg flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{appt.clientName}</p>
                                                            <p className="text-xs text-txt-muted flex items-center gap-1 mt-1"><Scissors size={12} className="text-gold/50"/> {appt.serviceName}</p>
                                                        </div>
                                                        <span className="text-xs font-black text-gold bg-gold/10 px-2 py-1 rounded">{appt.time}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-auto">
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${appt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                            {appt.status === 'confirmed' ? 'Realizada' : appt.status}
                                                        </span>
                                                        <span className="text-xs font-bold text-white flex items-center gap-1"><DollarSign size={12} className="text-gold"/>{appt.price}</span>
                                                    </div>
                                                </div>
                                            ))}
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