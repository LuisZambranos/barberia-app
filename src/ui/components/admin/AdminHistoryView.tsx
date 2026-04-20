import { useState } from "react";
import { DollarSign, Search, ChevronDown, ChevronUp, CalendarDays, Scissors, Landmark, CreditCard, Wallet, User, Edit2 } from "lucide-react";
import { type Appointment } from "../../../core/models/Appointment"; 
import { type Barber } from "../../../core/models/Barber"; 
import { calculateMonthlyMetrics } from "../../../core/utils/metrics.utils";

const formatDate = (dateString: string) => {
    const d = new Date(`${dateString}T00:00:00`);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' }).toUpperCase();
};

const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

// --- COMPONENTES VISUALES ---
const PaymentBadge = ({ method }: { method?: 'cash' | 'transfer' | 'online' }) => {
    if (method === 'transfer') return <div className="flex w-fit items-center gap-1 text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-wider" title="Transferencia Bancaria"><Landmark size={10}/> Transf.</div>;
    if (method === 'online') return <div className="flex w-fit items-center gap-1 text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider" title="Pago Online"><CreditCard size={10}/> Webpay</div>;
    return <div className="flex w-fit items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider" title="Pago en Efectivo"><Wallet size={10}/> Efectivo</div>;
};

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'completed') return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-green-500/20 text-green-400 border border-green-500/30">Realizada</span>;
    if (status === 'cancelled' || status === 'canceled') return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-red-500/20 text-red-400 border border-red-500/30">Cancelada</span>;
    if (status === 'confirmed') return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-blue-500/20 text-blue-400 border border-blue-500/30">Confirmada</span>;
    
    return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pendiente</span>;
};

interface Props {
  pastAppointments: Appointment[];
  barbers: Barber[]; // <-- AHORA RECIBE LOS BARBEROS PARA EXTRACCIÓN DINÁMICA
  onEdit?: (appt: Appointment) => void;
}

export const AdminHistoryView = ({ pastAppointments, barbers, onEdit }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  const toggleMonth = (month: string) => {
      setExpandedMonths(prev => 
          prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
      );
  };

  const filteredAppointments = pastAppointments.filter((appt) => {
    const term = searchTerm.toLowerCase();
    const realBarberName = barbers.find(b => b.id === appt.barberId)?.name || appt.barberName || '';
    
    return (
        (appt.clientName || '').toLowerCase().includes(term) || 
        realBarberName.toLowerCase().includes(term) || 
        (appt.serviceName || '').toLowerCase().includes(term) || 
        appt.date.includes(term)
    );
  });

  const historyData = calculateMonthlyMetrics(filteredAppointments);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* BUSCADOR */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-txt-muted" />
        </div>
        <input
          type="text"
          placeholder="Buscar historial por cliente, profesional o servicio..."
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
                                    <p className="text-xs text-txt-muted font-bold uppercase tracking-widest">{data.totalAppts} Operaciones</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:items-end w-full md:w-auto border-t md:border-none border-white/5 pt-4 md:pt-0">
                                <p className="text-[10px] uppercase text-txt-muted font-bold tracking-widest mb-1">Ingresos Totales (Barbería)</p>
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
                                {/* AQUÍ ESTÁ LA MAGIA: localeCompare(a) PONE LOS DÍAS MÁS NUEVOS ARRIBA */}
                                {Object.keys(data.days).sort((a, b) => b.localeCompare(a)).map((date) => {
                                    const appts = data.days[date];
                                    return (
                                        <div key={date}>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="h-px bg-linear-to-r from-gold/40 to-transparent grow"></div>
                                                <div className="bg-bg-main border border-gold/40 px-5 py-2 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.15)] relative z-10">
                                                    <h3 className="text-gold font-black text-xs md:text-sm uppercase tracking-[0.2em] whitespace-nowrap">
                                                        {formatDate(date)}
                                                    </h3>
                                                </div>
                                                <div className="h-px bg-linear-to-l from-gold/40 to-transparent grow"></div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {appts.map(appt => {
                                                    const isCanceled = appt.status === 'cancelled' || (appt.status as string) === 'canceled';
                                                    
                                                    // BÚSQUEDA DINÁMICA DEL NOMBRE DEL BARBERO
                                                    const realBarberName = barbers.find(b => b.id === appt.barberId)?.name || appt.barberName;
                                                    const displayName = realBarberName?.replace(/PRUEBA|Barbero 1/gi, '').trim() || 'Profesional';

                                                    return (
                                                    <div key={appt.id} className={`bg-bg-card border border-white/5 p-4 rounded-lg flex flex-col justify-between transition-all shadow-sm ${isCanceled ? 'opacity-50 grayscale' : 'opacity-90 hover:opacity-100 hover:border-gold/30 hover:-translate-y-0.5'}`}>
                                                        
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex flex-col items-start gap-1.5">
                                                                <span className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-1">
                                                                    <User size={10}/> 
                                                                    {displayName}
                                                                </span>
                                                                <StatusBadge status={appt.status} />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {onEdit && (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); onEdit(appt); }}
                                                                        className="text-txt-muted hover:text-gold transition-colors p-1"
                                                                        title="Editar Cita"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                )}
                                                                <span className="text-xs font-black text-gold bg-gold/10 px-2 py-1 rounded">{appt.time}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-1 mb-4">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                                                                <Scissors size={12} className="text-txt-muted"/> {appt.serviceName}
                                                            </div>
                                                            <div className="text-xs text-txt-muted pl-5 font-medium">
                                                                {appt.clientName}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-auto">
                                                            <PaymentBadge method={appt.paymentMethod} />
                                                            <span className="text-xs font-bold text-white flex items-center gap-1">
                                                              <DollarSign size={12} className="text-gold"/>
                                                              {Number(appt.price).toLocaleString('es-CL')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
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