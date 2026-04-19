import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToClientAppointments, updateAppointmentStatus } from '../../core/services/booking.service';
import type { Appointment } from '../../core/models/Appointment';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { Calendar, Clock, Scissors, X, CheckCircle, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [apptToCancel, setApptToCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToClientAppointments(user.uid, (data) => {
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancelClick = (appt: Appointment) => {
    setApptToCancel(appt);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!apptToCancel) return;
    setIsCancelling(true);
    try {
      await updateAppointmentStatus(apptToCancel.id, 'cancelled');
      setCancelModalOpen(false);
      setApptToCancel(null);
    } catch (error) {
      console.error("Error cancelando cita:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Separar citas
  const upcoming = appointments.filter(appt => {
    // Es próxima si su estado es pending o confirmed Y su fecha/hora no ha pasado
    // O simplemente si el estado es pending/confirmed.
    return appt.status === 'pending' || appt.status === 'confirmed';
  });

  const history = appointments.filter(appt => {
    return appt.status === 'completed' || appt.status === 'cancelled' || (appt.status as string) === 'canceled';
  }).reverse(); // Revertimos para mostrar las más recientes primero

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full border border-amber-500/20 font-medium">Pendiente</span>;
      case 'confirmed': return <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-full border border-green-500/20 font-medium flex items-center gap-1"><CheckCircle size={12}/> Confirmada</span>;
      case 'completed': return <span className="bg-blue-500/10 text-blue-500 text-xs px-2 py-1 rounded-full border border-blue-500/20 font-medium">Completada</span>;
      case 'cancelled': 
      case 'canceled': 
        return <span className="bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded-full border border-red-500/20 font-medium">Cancelada</span>;
      default: return null;
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(numPrice);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 animate-in fade-in duration-500 relative z-10">
      
      {/* Elementos de fondo */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gold/5 blur-[150px] -z-10" />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Mis Reservas</h1>
          <p className="text-txt-muted">Gestiona tus próximas citas y revisa tu historial.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-black/40 p-1.5 rounded-xl border border-white/5 w-max">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'upcoming' 
                ? 'bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                : 'text-txt-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Próximas Citas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'history' 
                ? 'bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                : 'text-txt-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Historial
          </button>
        </div>

        {/* Lista de Citas */}
        <div className="space-y-4">
          {activeTab === 'upcoming' && (
            upcoming.length > 0 ? (
              upcoming.map((appt) => (
                <div key={appt.id} className="bg-bg-card border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[50px] rounded-full group-hover:bg-gold/10 transition-colors" />
                  
                  <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-white/5 text-white text-xs font-bold px-2 py-1 rounded-md border border-white/10">
                          {appt.shortId || `#${appt.id.slice(0,4)}`}
                        </span>
                        {getStatusBadge(appt.status)}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                          <Scissors size={18} className="text-gold" />
                          {appt.serviceName}
                        </h3>
                        <p className="text-txt-muted flex items-center gap-2 text-sm">
                          <User size={14} className="text-gold" /> con <span className="text-white font-medium">{appt.barberName}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm bg-black/30 p-3 rounded-xl border border-white/5 w-fit">
                        <div className="flex items-center gap-2 text-white">
                          <Calendar size={16} className="text-gold" />
                          <span className="capitalize">
                            {format(parseISO(appt.date), "EEEE d 'de' MMMM", { locale: es })}
                          </span>
                        </div>
                        <div className="w-px h-4 bg-white/20 hidden md:block" />
                        <div className="flex items-center gap-2 text-white font-bold">
                          <Clock size={16} className="text-gold" />
                          {appt.time} hrs
                        </div>
                      </div>

                      {/* Detalles del Servicio */}
                      {((appt.selectedItems && appt.selectedItems.length > 0) || appt.hasBeardAddon) && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-[10px] text-txt-muted uppercase tracking-widest font-bold mb-2">Detalle de tu servicio</p>
                          <ul className="space-y-1.5">
                            {appt.selectedItems?.map((item, idx) => (
                              <li key={idx} className="text-sm text-txt-main flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                                {item}
                              </li>
                            ))}
                            {appt.hasBeardAddon && (
                              <li className="text-sm text-txt-main flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                                Corte de Barba / Ritual (+ Extra)
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-txt-muted mb-0.5">Total a pagar</p>
                        <p className="text-xl font-black text-gold">{formatPrice(appt.price)}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleCancelClick(appt)}
                        className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancelar Cita
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-bg-card border border-white/5 rounded-2xl">
                <Calendar size={48} className="text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No tienes citas próximas</h3>
                <p className="text-txt-muted max-w-sm mx-auto mb-6">Agenda una cita para tu próximo corte y mantén tu estilo impecable.</p>
                <a href="/book" className="inline-flex items-center justify-center px-6 py-3 bg-gold text-black font-black rounded-xl hover:bg-gold-hover transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  Agendar Ahora
                </a>
              </div>
            )
          )}

          {activeTab === 'history' && (
            history.length > 0 ? (
              <div className="grid gap-4">
                {history.map((appt) => (
                  <div key={appt.id} className="bg-bg-card/50 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                        <Clock size={20} className="text-txt-muted" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{appt.serviceName}</h4>
                        <p className="text-sm text-txt-muted">
                          {format(parseISO(appt.date), "dd/MM/yyyy")} a las {appt.time} con {appt.barberName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row-reverse sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      {getStatusBadge(appt.status)}
                      <span className="text-sm font-bold text-white">{formatPrice(appt.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-bg-card border border-white/5 rounded-2xl">
                <Clock size={48} className="text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Sin historial</h3>
                <p className="text-txt-muted">Aún no tienes citas pasadas registradas.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal de Cancelación con políticas */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancelar Cita"
        message={`
          <div class="text-left space-y-4">
            <p>¿Estás seguro de que deseas cancelar tu cita del <strong>${apptToCancel ? format(parseISO(apptToCancel.date), "dd/MM/yyyy") : ''}</strong> a las <strong>${apptToCancel?.time}</strong>?</p>
            
            <div class="bg-bg-main border border-white/10 p-4 rounded-xl text-xs space-y-2 text-txt-muted shadow-inner">
              <strong class="text-gold flex items-center gap-2 text-sm mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> Política de Cancelación</strong>
              <p>• Cancelaciones o reprogramaciones deben realizarse con al menos <strong class="text-white">2 horas de anticipación</strong>.</p>
              <p>• No asistir a la cita o cancelar tarde resultará en la pérdida del <strong class="text-white">50% del abono</strong>, si es en efectivo el cobro del servicio será en tu próxima visita.</p>
              <p>• Tu hora se considera perdida si tienes un atraso <strong class="text-white">superior a 10 minutos</strong>.</p>
            </div>
          </div>
        `}
        type="danger"
        confirmText="Sí, Cancelar Cita"
        cancelText="Mantener Cita"
        isLoading={isCancelling}
        onConfirm={confirmCancel}
        onClose={() => setCancelModalOpen(false)}
      />

    </div>
  );
}
