import { useState } from "react";
import { Loader2, Calendar, PlusCircle, X, User } from "lucide-react"; 
import { type Appointment, type PaymentMethodType } from "../../../core/models/Appointment"; 
import { copyToClipboard } from "../../../core/utils/clipboard";
import { getLocalDateString, isTodayLocal, isPastLocal, formatDateLocal } from "../../../core/utils/date.utils";
import { EditAppointmentModal } from "../shared/EditAppointmentModal";
import { DeleteAppointmentModal } from "../shared/DeleteAppointmentModal";
import { ConfirmModal } from "../shared/ConfirmModal";
import { SearchBar } from "../shared/SearchBar";
import { useSearch } from "../../hooks/useSearch";
import { SearchResultsDisplay } from "../shared/SearchResultsDisplay";
import { useAdminAppointments } from "../../hooks/useAdminAppointments";
import { AdminAppointmentCard } from "./AdminAppointmentCard";
import { AdminHistoryView } from "./AdminHistoryView";

const AdminBookings = () => {
  const { appointments, services, barbers, loading, changeStatus, updateData, removeAppointment, addWalkIn } = useAdminAppointments();

  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');

  const { searchTerm, setSearchTerm, filteredItems: filteredAppointments, isSearching } = useSearch<Appointment>(
      appointments, 
      ['clientName', 'id', 'date', 'time', 'barberName'] 
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null); 
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [deletingAppt, setDeletingAppt] = useState<Appointment | null>(null);
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);

  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
      clientName: '',
      serviceId: '',
      barberId: '', 
      date: getLocalDateString(),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'cash' as PaymentMethodType,
      blockSchedule: false
  });

  const handleStatusChange = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    setUpdatingId(appointmentId);
    try {
        await changeStatus(appointmentId, newStatus);
    } catch (error) {
        alert("Hubo un error al actualizar la cita.");
    } finally {
        setUpdatingId(null);
        setOpenDropdownId(null);
    }
  };

  const handleEditSave = async (id: string, newDate: string, newTime: string, newPayment: PaymentMethodType, newService?: any, newBarberId?: string) => {
      const appt = appointments.find(a => a.id === id);
      if (!appt) return;

      const targetBarberId = newBarberId || appt.barberId;
      const targetBarberName = newBarberId ? barbers.find(b => b.id === newBarberId)?.name : undefined;

      setUpdatingId(id);
      try {
          await updateData(id, targetBarberId, newDate, newTime, newPayment, newService, targetBarberName);
          setEditingAppt(null);
      } catch (error: any) {
          if (error.message === "HORA_OCUPADA") alert("Ese horario ya está ocupado.");
          else alert("Error al actualizar la cita.");
      } finally {
          setUpdatingId(null);
      }
  };

  const handleDeleteConfirm = async (id: string) => {
      setUpdatingId(id);
      try {
          await removeAppointment(id);
          setDeletingAppt(null);
      } catch (error) {
          alert("Error al eliminar la cita.");
      } finally {
          setUpdatingId(null);
      }
  };

  const submitWalkIn = async () => {
      const selectedServiceId = walkInForm.serviceId || (services.length > 0 ? services[0].id : '');
      const selectedService = services.find(s => s.id === selectedServiceId);

      if (!walkInForm.clientName || !selectedService || !walkInForm.barberId) {
          return alert("Nombre, profesional y servicio son obligatorios.");
      }
      
      setIsSubmittingWalkIn(true);
      try {
          await addWalkIn({
              clientName: walkInForm.clientName,
              date: walkInForm.date,
              time: walkInForm.time,
              serviceId: selectedService.id,
              serviceName: selectedService.name,
              price: selectedService.price,
              barberId: walkInForm.barberId, 
              paymentMethod: walkInForm.paymentMethod,
              blockSchedule: walkInForm.blockSchedule
          });
          setWalkInModalOpen(false);
          setWalkInForm({ ...walkInForm, clientName: '', serviceId: '', barberId: '' }); 
      } catch (error) {
          alert("Error al registrar la cita rápida.");
      } finally {
          setIsSubmittingWalkIn(false);
      }
  };

  const handleCopyEmail = (email: string, id: string) => {
    if (copyToClipboard(email)) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); 
    }
  };

  // --- SEPARACIÓN DE DATOS (AGENDA VS HISTORIAL) ---
  const activeAppts = filteredAppointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled' && !isPastLocal(a.date, a.time));
  const pastAppts = appointments.filter(a => (isPastLocal(a.date, a.time) && !isTodayLocal(a.date)) || a.status === 'completed' || a.status === 'cancelled');

  const todayPending = activeAppts.filter(a => isTodayLocal(a.date));
  const futureAppts = activeAppts.filter(a => !isTodayLocal(a.date));

  const groupedFuture = futureAppts.reduce((acc, appt) => {
      if (!acc[appt.date]) acc[appt.date] = [];
      acc[appt.date].push(appt);
      return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedFutureDates = Object.keys(groupedFuture).sort((a, b) => a.localeCompare(b));

  const cardActions = {
      onEdit: setEditingAppt,
      onDelete: setDeletingAppt,
      onCancel: (appt: Appointment) => { setCancellingAppt(appt); setOpenDropdownId(null); },
      onStatusChange: handleStatusChange,
      onCopyEmail: handleCopyEmail,
      onToggleDropdown: setOpenDropdownId
  };

  if (loading) return <div className="text-center py-20 text-gold flex justify-center"><Loader2 className="animate-spin"/> Cargando base de datos...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* HEADER Y PESTAÑAS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
            <Calendar className="text-gold" size={28} />
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Gestión Maestra</h2>
                <p className="text-txt-muted text-xs font-bold uppercase tracking-widest">Control Global de Citas</p>
            </div>
        </div>
        
        <div className="flex bg-black/20 border border-white/10 rounded-lg p-1 w-full sm:w-auto">
            <button 
                onClick={() => setViewMode('active')}
                className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'active' ? 'bg-gold text-bg-main shadow-md' : 'text-txt-muted hover:text-white'}`}
            >
                Activas
            </button>
            <button 
                onClick={() => setViewMode('history')}
                className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'history' ? 'bg-white/10 text-white shadow-md border border-white/5' : 'text-txt-muted hover:text-white'}`}
            >
                Historial Finanzas
            </button>
        </div>
      </div>

      {viewMode === 'active' ? (
          <>
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por cliente, profesional o fecha..." />

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-20 opacity-50 bg-bg-card rounded-xl border border-white/5 border-dashed"><p className="text-txt-main font-bold">No hay reservas activas</p></div>
            ) : isSearching ? (
                <SearchResultsDisplay 
                    appointments={filteredAppointments} 
                    searchTerm={searchTerm} 
                    showBarber={true} 
                    // LE PASAMOS LOS BARBEROS A LA TARJETA
                    renderCard={(appt) => <AdminAppointmentCard appt={appt} barbers={barbers} copiedId={copiedId} updatingId={updatingId} openDropdownId={openDropdownId} {...cardActions} />}
                />
            ) : (
                <div className="space-y-12 animate-in fade-in">
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                            <Calendar className="text-gold" size={24} />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Todas las Citas de Hoy</h2>
                            <span className="bg-gold/20 text-gold text-xs font-bold px-2 py-1 rounded-full">{todayPending.length}</span>
                        </div>
                        {todayPending.length === 0 ? <p className="text-txt-muted text-sm italic">La agenda está limpia por ahora.</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                {/* LE PASAMOS LOS BARBEROS A LA TARJETA */}
                                {todayPending.map(appt => <AdminAppointmentCard key={appt.id} appt={appt} barbers={barbers} copiedId={copiedId} updatingId={updatingId} openDropdownId={openDropdownId} {...cardActions} />)}
                            </div>
                        )}
                    </section>

                    {sortedFutureDates.length > 0 && (
                        <section className="pt-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3"><Calendar className="text-txt-muted" size={24} />Próximos Días</h2>
                            <div className="space-y-12">
                                {sortedFutureDates.map((date) => (
                                    <div key={date} className="relative">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-px bg-linear-to-r from-gold/40 to-transparent grow"></div>
                                            <div className="bg-bg-main border border-gold/40 px-5 py-2 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.15)] relative z-10"><h3 className="text-gold font-black text-xs md:text-sm uppercase tracking-[0.2em] whitespace-nowrap">{formatDateLocal(date)}</h3></div>
                                            <div className="h-px bg-linear-to-l from-gold/40 to-transparent grow"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                                            {/* LE PASAMOS LOS BARBEROS A LA TARJETA */}
                                            {groupedFuture[date].map(appt => <AdminAppointmentCard key={appt.id} appt={appt} barbers={barbers} copiedId={copiedId} updatingId={updatingId} openDropdownId={openDropdownId} {...cardActions} />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
          </>
      ) : (
          // LE PASAMOS LOS BARBEROS AL HISTORIAL
          <AdminHistoryView pastAppointments={pastAppts} barbers={barbers} />
      )}

      {/* BOTÓN FLOTANTE CITA RÁPIDA GLOBAL */}
      {viewMode === 'active' && (
          <button
            onClick={() => {
                setWalkInForm(prev => ({
                    ...prev,
                    barberId: '', 
                    date: getLocalDateString(),
                    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                }));
                setWalkInModalOpen(true);
            }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-gold hover:bg-gold-hover text-bg-main p-4 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] z-40 transition-all hover:scale-110 flex items-center gap-2 group"
        >
            <PlusCircle size={28} />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[150px] transition-all duration-500 font-black uppercase tracking-widest text-sm">
            Cita Rápida
            </span>
        </button>
      )}

      {/* MODAL DE CITA RÁPIDA */}
      {walkInModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-bg-card border border-gold/30 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                  <div className="bg-gold/10 p-4 flex justify-between items-center border-b border-gold/20 shrink-0">
                      <h3 className="text-lg font-black text-gold flex items-center gap-2 uppercase tracking-widest"><PlusCircle size={18}/> Venta de Local</h3>
                      <button onClick={() => setWalkInModalOpen(false)} className="text-gold/50 hover:text-gold transition-colors"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-4 overflow-y-auto grow">
                      <div>
                          <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Nombre del Cliente</label>
                          <input type="text" placeholder="Ej. Cliente Local" value={walkInForm.clientName} onChange={(e) => setWalkInForm({...walkInForm, clientName: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <label className="text-xs uppercase font-bold text-gold block mb-2 items-center gap-1"><User size={12}/> Profesional Asignado</label>
                          <select value={walkInForm.barberId} onChange={(e) => setWalkInForm({...walkInForm, barberId: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm">
                              <option value="">-- Selecciona el Profesional --</option>
                              {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>
                      </div>
                      
                      <div>
                          <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Servicio Realizado</label>
                          <select value={walkInForm.serviceId} onChange={(e) => setWalkInForm({...walkInForm, serviceId: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm">
                              <option value="">Selecciona un servicio</option>
                              {services.map(s => <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>)}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Fecha</label>
                              <input type="date" value={walkInForm.date} onChange={(e) => setWalkInForm({...walkInForm, date: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                          </div>
                          <div>
                              <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Hora (Exacta)</label>
                              <input type="time" value={walkInForm.time} onChange={(e) => setWalkInForm({...walkInForm, time: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Método de Pago</label>
                          <select value={walkInForm.paymentMethod} onChange={(e) => setWalkInForm({...walkInForm, paymentMethod: e.target.value as PaymentMethodType})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm">
                              <option value="cash">Efectivo en Local</option>
                              <option value="transfer">Transferencia Bancaria</option>
                              <option value="online">Tarjeta / Redcompra</option>
                          </select>
                      </div>
                  </div>
                  
                  <div className="p-4 border-t border-white/10 flex gap-3 shrink-0 bg-black/20">
                      <button onClick={() => setWalkInModalOpen(false)} className="flex-1 p-3 rounded-lg border border-white/10 text-white font-bold text-sm hover:bg-white/5">Cancelar</button>
                      <button onClick={submitWalkIn} disabled={isSubmittingWalkIn} className="flex-1 p-3 rounded-lg bg-gold text-bg-main font-black text-sm uppercase tracking-widest hover:bg-gold-hover flex justify-center items-center shadow-lg shadow-gold/20">
                          {isSubmittingWalkIn ? <Loader2 size={16} className="animate-spin"/> : 'Registrar Venta'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- INVOCACIÓN DE MODALES --- */}
      {editingAppt && (
          <EditAppointmentModal 
              appt={editingAppt} 
              services={services}
              barbers={barbers} 
              onClose={() => setEditingAppt(null)} 
              onSave={handleEditSave} 
              isUpdating={updatingId === editingAppt.id} 
          />
      )}

      {deletingAppt && (
          <DeleteAppointmentModal appt={deletingAppt} onClose={() => setDeletingAppt(null)} onConfirm={handleDeleteConfirm} isUpdating={updatingId === deletingAppt.id} />
      )}

      <ConfirmModal 
          isOpen={cancellingAppt !== null}
          title="¿Cancelar Reserva?"
          message={`Estás a punto de cancelar la cita de <strong class="text-white">${cancellingAppt?.clientName}</strong>. <br/><br/>Se liberará la hora en la agenda global.`}
          type="danger"
          isLoading={updatingId === cancellingAppt?.id}
          onClose={() => setCancellingAppt(null)}
          onConfirm={() => { if (cancellingAppt) { handleStatusChange(cancellingAppt.id, 'cancelled'); setCancellingAppt(null); } }}
      />
    </div>
  );
};

export default AdminBookings;