import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useToast } from '../../context/ToastContext';
import { DollarSign, Search, Loader2, ChevronDown, ChevronUp, CalendarDays, Scissors, Landmark, CreditCard, Wallet } from "lucide-react";

// --- INTERFACES ---
interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  service?: string;
  serviceName?: string;
  barberId: string;
  status: string;
  price?: string | number;
  paymentMethod?: 'cash' | 'transfer' | 'online';
}

interface Barber {
  id: string;
  name: string;
}

// --- HELPERS UX Y ESTADOS VISUALES UNIFICADOS ---
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

const PaymentBadge = ({ method }: { method?: 'cash' | 'transfer' | 'online' }) => {
    if (method === 'transfer') return <div className="flex w-fit items-center gap-1 text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-wider" title="Transferencia Bancaria"><Landmark size={10}/> Transf.</div>;
    if (method === 'online') return <div className="flex w-fit items-center gap-1 text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider" title="Pago Online"><CreditCard size={10}/> Webpay</div>;
    return <div className="flex w-fit items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider" title="Pago en Efectivo"><Wallet size={10}/> Efectivo</div>;
};

// Función mágica para los 4 estados (COLORES CORREGIDOS)
const getStatusDisplay = (appt: Appointment) => {
    // Realizada -> AZUL
    if (appt.status === 'completed') return { text: 'Realizada', colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (appt.status === 'cancelled') return { text: 'Cancelada', colorClass: 'bg-red-500/20 text-red-400 border-red-500/30' };
    // Confirmada -> VERDE
    if (appt.status === 'confirmed') return { text: 'Confirmada', colorClass: 'bg-green-500/20 text-green-400 border-green-500/30' };
    
    // Si el estado es 'pending'
    if (appt.paymentMethod === 'transfer') {
        return { text: 'Pago Pendiente', colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse' };
    }
    return { text: 'Por Confirmar', colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
};

// --- COMPONENTE PRINCIPAL ---
const AdminBookings = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activas' | 'historial'>('activas');
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    // 1. Cargar Barberos
    const fetchBarbers = async () => {
      try {
        const barbersSnap = await getDocs(collection(db, 'barbers'));
        setBarbers(barbersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Barber)));
      } catch (error) {
        console.error("Error al cargar barberos:", error);
      }
    };
    fetchBarbers();

    // 2. Escuchar TODAS las citas (Colección correcta: "appointments")
    const q = query(collection(db, 'appointments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
      setAppointments(data);
      setLoading(false);
    }, (error) => {
      console.error("Error escuchando citas:", error);
      showToast("Error al cargar las citas", "error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  const handleReassign = async (bookingId: string, newBarberId: string) => {
    if (!newBarberId) return;
    const confirm = window.confirm("¿Estás seguro de reasignar esta cita a otro barbero?");
    if (!confirm) return;

    try {
      const bookingRef = doc(db, 'appointments', bookingId);
      await updateDoc(bookingRef, { barberId: newBarberId });
      showToast("Cita reasignada correctamente", "success");
    } catch (error) {
      console.error("Error al reasignar:", error);
      showToast("Hubo un error al reasignar", "error");
    }
  };

  const getBarberName = (id: string) => {
    const barber = barbers.find(b => b.id === id);
    return barber ? barber.name : 'Desconocido';
  };

  const toggleMonth = (month: string) => {
      setExpandedMonths(prev => 
          prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
      );
  };

  // --- LÓGICA DE SEPARACIÓN (Activas vs Historial) ---
  const activeAppts = appointments.filter(a => !isPastDay(a.date));
  activeAppts.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const pastAppts = appointments.filter(a => isPastDay(a.date));
  pastAppts.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.time.localeCompare(a.time);
  });

  const filteredPastAppts = pastAppts.filter(appt => {
    const term = searchTerm.toLowerCase();
    return (appt.clientName?.toLowerCase().includes(term) || appt.id.toLowerCase().includes(term) || appt.date.includes(term));
  });

  const historyData = filteredPastAppts.reduce((acc, appt) => {
      const month = getMonthYear(appt.date);
      if (!acc[month]) {
          acc[month] = { 
              totalAppts: 0, 
              totalRevenue: 0, 
              revenueByMethod: { cash: 0, transfer: 0, online: 0 },
              days: {} 
          };
      }
      
      acc[month].totalAppts += 1;
      const priceVal = parseInt(String(appt.price).replace(/[^0-9]/g, '')) || 0;
      acc[month].totalRevenue += priceVal;
      const method = appt.paymentMethod || 'cash';
      acc[month].revenueByMethod[method] += priceVal;
      
      if (!acc[month].days[appt.date]) acc[month].days[appt.date] = [];
      acc[month].days[appt.date].push(appt);
      
      return acc;
  }, {} as Record<string, { totalAppts: number, totalRevenue: number, revenueByMethod: Record<string, number>, days: Record<string, Appointment[]> }>);

  if (loading) return <div className="text-center py-20 text-gold flex justify-center"><Loader2 className="animate-spin mr-2"/> Cargando sistema global...</div>;

  return (
    <div className="w-full">
      
      {/* NAVEGACIÓN INTERNA (Tabs) */}
      <div className="flex space-x-6 mb-8 border-b border-white/10 pb-2 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab('activas')}
          className={`font-bold uppercase tracking-wider text-sm transition-all pb-2 whitespace-nowrap ${activeTab === 'activas' ? 'text-gold border-b-2 border-gold' : 'text-txt-muted hover:text-white'}`}
        >
          Citas Activas ({activeAppts.length})
        </button>
        <button 
          onClick={() => setActiveTab('historial')}
          className={`font-bold uppercase tracking-wider text-sm transition-all pb-2 whitespace-nowrap ${activeTab === 'historial' ? 'text-gold border-b-2 border-gold' : 'text-txt-muted hover:text-white'}`}
        >
          Historial Global
        </button>
      </div>

      {/* =========================================
          VISTA 1: CITAS ACTIVAS (Con Reasignación)
          ========================================= */}
      {activeTab === 'activas' && (
        <div className="animate-in fade-in duration-500">
          {activeAppts.length === 0 ? (
            <div className="text-center py-20 bg-bg-card rounded-xl border border-white/5 border-dashed">
              <p className="text-txt-muted text-lg font-bold">No hay citas activas ni futuras registradas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAppts.map(booking => {
                const statusDisplay = getStatusDisplay(booking);
                return (
                  <div key={booking.id} className="bg-bg-main border border-white/10 rounded-xl p-5 shadow-lg flex flex-col hover:border-gold/30 transition-colors relative group">
                    
                    <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                      <div className="flex flex-col">
                        <span className="text-gold font-bold text-lg">{booking.date}</span>
                        <span className="text-txt-main text-sm flex items-center gap-1">
                          🕒 {booking.time}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusDisplay.colorClass}`}>
                        {statusDisplay.text}
                      </span>
                    </div>

                    <div className="grow space-y-3">
                      <div>
                        <p className="text-xs text-txt-muted uppercase tracking-wider mb-1">Cliente</p>
                        <p className="text-white font-semibold text-lg leading-tight">{booking.clientName}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-txt-muted uppercase tracking-wider mb-1">Servicio</p>
                        <p className="text-gray-300 text-sm flex items-center gap-1">
                          <Scissors size={14} className="text-gold/50" /> {booking.serviceName || booking.service}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-txt-muted uppercase tracking-wider mb-1">Barbero Actual</p>
                        <p className="text-gold text-sm font-medium">{getBarberName(booking.barberId)}</p>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10">
                      <p className="text-xs text-txt-muted uppercase tracking-wider mb-2">Reasignar Cita a:</p>
                      <select 
                        className="w-full bg-bg-card border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold transition-colors cursor-pointer appearance-none"
                        value=""
                        onChange={(e) => handleReassign(booking.id, e.target.value)}
                        disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23D4AF37%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                      >
                        <option value="" disabled>Seleccionar Barbero...</option>
                        {barbers.map(barber => (
                          barber.id !== booking.barberId && (
                            <option key={barber.id} value={barber.id} className="bg-bg-main">
                              Mover a {barber.name}
                            </option>
                          )
                        ))}
                      </select>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================
          VISTA 2: HISTORIAL GLOBAL (FINANZAS)
          ========================================= */}
      {activeTab === 'historial' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-txt-muted" />
            </div>
            <input
              type="text"
              placeholder="Buscar historial por cliente, fecha o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-bg-card text-txt-main placeholder-txt-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
          </div>

          {Object.keys(historyData).length === 0 ? (
            <div className="text-center py-20 opacity-50 bg-bg-card rounded-xl border border-white/5 border-dashed">
              <p className="text-txt-main font-bold">No hay historial de citas pasadas.</p>
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
                                        <p className="text-xs text-txt-muted font-bold uppercase tracking-widest">{data.totalAppts} Citas Globales</p>
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
                                                  const statusDisplay = getStatusDisplay(appt);
                                                  return (
                                                    <div key={appt.id} className="bg-bg-card border border-white/5 p-4 rounded-lg flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
                                                        
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <p className="text-sm font-bold text-white">{appt.clientName}</p>
                                                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${statusDisplay.colorClass}`}>
                                                                        {statusDisplay.text}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-txt-muted flex items-center gap-1">
                                                                  <Scissors size={12} className="text-gold/50"/> 
                                                                  {appt.serviceName || appt.service} 
                                                                  <span className="text-white/30 mx-1">•</span> 
                                                                  <span className="text-gold font-bold">{getBarberName(appt.barberId)}</span>
                                                                </p>
                                                            </div>
                                                            <span className="text-xs font-black text-gold bg-gold/10 px-2 py-1 rounded">{appt.time}</span>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-auto">
                                                            <PaymentBadge method={appt.paymentMethod} />
                                                            <span className="text-xs font-bold text-white flex items-center gap-1"><DollarSign size={12} className="text-gold"/>{appt.price}</span>
                                                        </div>
                                                    </div>
                                                )})}
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
      )}
    </div>
  );
};

export default AdminBookings;