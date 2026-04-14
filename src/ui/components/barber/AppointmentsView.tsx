import { useState } from "react";
import { Clock, DollarSign, Phone, Scissors, Loader2, Mail, Copy, Calendar, Landmark, CreditCard, Wallet, CheckCircle2, PlusCircle, ChevronDown, Edit2, Trash2, X } from "lucide-react"; 
import { type Appointment, type PaymentMethodType } from "../../../core/models/Appointment"; 
import { sendConfirmationMessage } from "../../../core/utils/whatsapp";
import { copyToClipboard } from "../../../core/utils/clipboard";
import { useAppointments } from "../../hooks/useAppointments"; 
import { getLocalDateString, isTodayLocal, isPastLocal, formatDateLocal } from "../../../core/utils/date.utils";
import { EditAppointmentModal } from "../shared/EditAppointmentModal";
import { DeleteAppointmentModal } from "../shared/DeleteAppointmentModal";
import { ConfirmModal } from "../shared/ConfirmModal";
import { FaWhatsapp } from 'react-icons/fa6';
import { SearchBar } from "../shared/SearchBar";
import { useSearch } from "../../hooks/useSearch";
import { SearchResultsDisplay } from "../shared/SearchResultsDisplay"; // <-- NUEVA IMPORTACIÓN

const PaymentBadge = ({ method }: { method?: 'cash' | 'transfer' | 'online' }) => {
    if (method === 'transfer') return <div className="flex w-fit items-center gap-1 text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-wider" title="Transferencia Bancaria"><Landmark size={10}/> Transf.</div>;
    if (method === 'online') return <div className="flex w-fit items-center gap-1 text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider" title="Pago Online (Webpay)"><CreditCard size={10}/> Webpay</div>;
    return <div className="flex w-fit items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider" title="Pago en Efectivo"><Wallet size={10}/> Efectivo</div>;
};

const AppointmentsView = ({ barberId }: { barberId: string }) => {
  const { appointments, services, loading, changeStatus, updateData, removeAppointment, addWalkIn } = useAppointments(barberId);

  const { searchTerm, setSearchTerm, filteredItems: filteredAppointments, isSearching } = useSearch<Appointment>(
      appointments, 
      ['clientName', 'id', 'date', 'time'] // El Barbero solo busca por estos campos
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

  const handleEditSave = async (id: string, newDate: string, newTime: string, newPayment: PaymentMethodType, newService?: any) => {
      setUpdatingId(id);
      try {
          await updateData(id, newDate, newTime, newPayment, newService);
          setEditingAppt(null);
      } catch (error: any) {
          if (error.message === "HORA_OCUPADA") alert("Ese horario ya está ocupado por otra reserva.");
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

      if (!walkInForm.clientName || !selectedService) return alert("El nombre y el servicio son obligatorios.");
      
      setIsSubmittingWalkIn(true);
      try {
          await addWalkIn({
              clientName: walkInForm.clientName,
              date: walkInForm.date,
              time: walkInForm.time,
              service: selectedService, 
              paymentMethod: walkInForm.paymentMethod,
              blockSchedule: walkInForm.blockSchedule
          });
          setWalkInModalOpen(false);
          setWalkInForm({ ...walkInForm, clientName: '', serviceId: '' }); 
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

  const todayAppts = filteredAppointments.filter(a => isTodayLocal(a.date));
  const todayPending = todayAppts.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const todayCompleted = todayAppts.filter(a => a.status === 'completed');
  const futureAppts = filteredAppointments.filter(a => !isTodayLocal(a.date) && !isPastLocal(a.date, a.time));

  const groupedFuture = futureAppts.reduce((acc, appt) => {
      if (!acc[appt.date]) acc[appt.date] = [];
      acc[appt.date].push(appt);
      return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedFutureDates = Object.keys(groupedFuture).sort((a, b) => a.localeCompare(b));

  const getStatusDisplay = (appt: Appointment) => {
      if (appt.status === 'completed') return { text: 'Realizada', colorClass: 'bg-green-500/20 text-green-400 border-green-500/30' };
      if (appt.status === 'cancelled') return { text: 'Cancelada', colorClass: 'bg-red-500/20 text-red-400 border-red-500/30' };
      if (appt.status === 'confirmed') return { text: 'Confirmada', colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      if (appt.paymentMethod === 'transfer') return { text: 'Pago Pendiente', colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse' };
      return { text: 'Por Confirmar', colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  };

  const AppointmentCard = ({ appt, isDimmed = false }: { appt: Appointment, isDimmed?: boolean }) => {
    const isBasic = appt.serviceName.toLowerCase().includes('basico');
    const isCompleted = appt.status === 'completed';
    const statusDisplay = getStatusDisplay(appt);

    return (
    <div className={`flex flex-col h-full bg-bg-card rounded-xl border border-white/5 overflow-hidden transition-all shadow-lg group ${isDimmed || isCompleted ? 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0' : 'hover:-translate-y-1 hover:border-gold/30'}`}>
        
        <div className="bg-white/5 p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-xl font-black text-white">
                <Clock className="text-gold" size={20} />{appt.time}
            </div>
            
            <div className="flex items-center gap-3">
                {appt.status !== 'cancelled' && (
                    <div className="flex items-center gap-2 mr-2 border-r border-white/10 pr-3">
                        <button onClick={() => setEditingAppt(appt)} className="text-txt-muted hover:text-amber-400 transition-colors p-1" title="Editar cita">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeletingAppt(appt)} className="text-txt-muted hover:text-error transition-colors p-1" title="Eliminar cita">
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
                
                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${statusDisplay.colorClass}`}>
                    {statusDisplay.text}
                </span>
            </div>
        </div>

        <div className="p-5 flex flex-col grow">
            <h3 className="text-lg font-bold text-txt-main mb-3">{appt.clientName}</h3>
            
            <div className="flex flex-col gap-1 text-xs text-txt-muted mb-4">
                <div className="flex items-center gap-2"><Phone size={14} className="text-gold/70" /> {appt.clientPhone}</div>
                {appt.clientEmail && (
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gold/70" />
                        <span className="truncate max-w-[150px]">{appt.clientEmail}</span>
                        <button onClick={() => handleCopyEmail(appt.clientEmail, appt.id)} className="text-gold/50 hover:text-gold p-1" title="Copiar correo">
                            {copiedId === appt.id ? <span className="text-[10px] text-green-500 font-bold">¡OK!</span> : <Copy size={14} />}
                        </button>
                    </div>
                )}
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-2 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Scissors size={14} className="text-gold" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">{appt.serviceName}</span>
                </div>
                {!appt.isWalkIn && (
                    <div className="flex items-center gap-2 text-xs text-txt-muted">
                        <CheckCircle2 size={12} className="text-gold" />
                        <span>{isBasic ? 'Corte Clásico' : 'Corte Degradado / Fade'}</span>
                    </div>
                )}
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

            <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-auto">
                <PaymentBadge method={appt.paymentMethod} />
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-txt-muted uppercase font-bold tracking-widest">Total</span>
                    <span className="text-sm font-black text-gold flex items-center"><DollarSign size={14} />{appt.price}</span>
                </div>
            </div>
        </div>

        <div className="flex flex-col shrink-0">
            {!appt.isWalkIn && (
                <div className="grid grid-cols-2 border-t border-white/5 divide-x divide-white/5">
                    <a href={`tel:${appt.clientPhone}`} className="p-3 flex justify-center items-center gap-2 hover:bg-gold hover:text-bg-main transition-colors text-xs font-bold text-txt-muted"><Phone size={14} /> Llamar</a>
                    <button onClick={() => sendConfirmationMessage(appt)} className="p-3 flex justify-center items-center gap-2 hover:bg-green-600 hover:text-white transition-colors text-xs font-bold text-green-500"><FaWhatsapp size={14} /> WhatsApp</button>
                </div>
            )}
            
            <div className="relative border-t border-white/5 bg-black/20">
                <div className={`absolute bottom-full left-0 w-full flex flex-col bg-bg-card/95 backdrop-blur-md border-t border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] transition-all duration-300 ease-out z-10 ${openDropdownId === appt.id ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                    
                    {appt.status !== 'pending' && !isCompleted && appt.status !== 'cancelled' && (
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(appt.id, 'pending'); }} className="p-4 flex items-center gap-2 text-xs font-bold text-yellow-400 hover:bg-yellow-500/10 border-b border-white/5 transition-colors">
                            <Clock size={16}/> Mover a Pendiente
                        </button>
                    )}

                    {appt.status !== 'confirmed' && !isCompleted && appt.status !== 'cancelled' && (
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(appt.id, 'confirmed'); }} className="p-4 flex items-center gap-2 text-xs font-bold text-blue-400 hover:bg-blue-500/10 border-b border-white/5 transition-colors">
                            <CheckCircle2 size={16}/> Aprobar / Confirmar
                        </button>
                    )}

                    {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(appt.id, 'completed'); }} className="p-4 flex items-center gap-2 text-xs font-bold text-green-400 hover:bg-green-500/10 border-b border-white/5 transition-colors">
                            <CheckCircle2 size={16}/> Marcar Realizada
                        </button>
                    )}
                    
                    {appt.status !== 'cancelled' && !isCompleted && (
                        <button onClick={(e) => { 
                            e.stopPropagation(); 
                            setCancellingAppt(appt); 
                            setOpenDropdownId(null);
                        }} className="p-4 flex items-center gap-2 text-xs font-bold text-error hover:bg-error/10 transition-colors">
                            <X size={16}/> Cancelar Reserva
                        </button>
                    )}
                </div>

                <button 
                    onClick={(e) => { 
                        e.preventDefault(); 
                        setOpenDropdownId(openDropdownId === appt.id ? null : appt.id); 
                    }}
                    className="w-full p-4 hover:bg-white/5 flex justify-center items-center gap-2 transition-colors text-xs font-bold text-txt-main uppercase tracking-widest relative z-20"
                >
                    {updatingId === appt.id ? <Loader2 size={16} className="animate-spin" /> : 'Cambiar Estado'}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${openDropdownId === appt.id ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    </div>
  )};

  if (loading) return <div className="text-center py-20 text-gold flex justify-center"><Loader2 className="animate-spin"/> Cargando citas...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="Buscar por nombre, ID o fecha..." 
      />

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-20 opacity-50 bg-bg-card rounded-xl border border-white/5 border-dashed"><p className="text-txt-main font-bold">No hay reservas encontradas</p></div>
      ) : isSearching ? (
         // --- USAMOS EL NUEVO COMPONENTE COMPARTIDO ---
         <SearchResultsDisplay 
            appointments={filteredAppointments} 
            searchTerm={searchTerm} 
            renderCard={(appt) => <AppointmentCard appt={appt} />}
         />
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
                        <CheckCircle2 className="text-green-400" size={20} />
                        <h2 className="text-lg font-black text-white uppercase tracking-tight opacity-70">Realizadas Hoy</h2>
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold px-2 py-1 rounded-full">{todayCompleted.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">{todayCompleted.map(appt => <AppointmentCard key={appt.id} appt={appt} isDimmed={true} />)}</div>
                </section>
            )}

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
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">{groupedFuture[date].map(appt => <AppointmentCard key={appt.id} appt={appt} />)}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
      )}

      <button
        onClick={() => {
            setWalkInForm(prev => ({
                ...prev,
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

      {walkInModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-bg-card border border-gold/30 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                  <div className="bg-gold/10 p-4 flex justify-between items-center border-b border-gold/20 shrink-0">
                      <h3 className="text-lg font-black text-gold flex items-center gap-2 uppercase tracking-widest"><PlusCircle size={18}/> Registro Rápido</h3>
                      <button onClick={() => setWalkInModalOpen(false)} className="text-gold/50 hover:text-gold transition-colors"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-4 overflow-y-auto grow">
                      <div>
                          <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Nombre del Cliente</label>
                          <input type="text" placeholder="Ej. Cliente Local" value={walkInForm.clientName} onChange={(e) => setWalkInForm({...walkInForm, clientName: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                      </div>
                      
                      <div>
                          <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Servicio Realizado</label>
                          <select 
                            value={walkInForm.serviceId} 
                            onChange={(e) => setWalkInForm({...walkInForm, serviceId: e.target.value})} 
                            className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm"
                          >
                              {services.length === 0 ? (
                                  <option value="">Cargando servicios...</option>
                              ) : (
                                  <>
                                    <option value="">Selecciona un servicio</option>
                                    {services.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.name} - ${service.price.toLocaleString('es-CL')}
                                        </option>
                                    ))}
                                  </>
                              )}
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

                      <div className="pt-2">
                          <div className="flex items-center justify-between p-4 bg-bg-main/50 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setWalkInForm({...walkInForm, blockSchedule: !walkInForm.blockSchedule})}>
                              <div>
                                  <span className="text-sm font-bold text-white block">Bloquear Hora en Web</span>
                                  <span className="text-[10px] text-txt-muted uppercase mt-1 block leading-tight">Evita que alguien reserve online<br/>a esta hora exacta</span>
                              </div>
                              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${walkInForm.blockSchedule ? 'bg-error' : 'bg-white/10'}`}>
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${walkInForm.blockSchedule ? 'translate-x-6' : 'translate-x-0'}`} />
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-4 border-t border-white/10 flex gap-3 shrink-0 bg-black/20">
                      <button onClick={() => setWalkInModalOpen(false)} className="flex-1 p-3 rounded-lg border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">Cancelar</button>
                      <button onClick={submitWalkIn} disabled={isSubmittingWalkIn} className="flex-1 p-3 rounded-lg bg-gold text-bg-main font-black text-sm uppercase tracking-widest hover:bg-gold-hover transition-colors flex justify-center items-center shadow-lg shadow-gold/20">
                          {isSubmittingWalkIn ? <Loader2 size={16} className="animate-spin"/> : 'Registrar Venta'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {editingAppt && (
          <EditAppointmentModal 
              appt={editingAppt} 
              services={services}
              onClose={() => setEditingAppt(null)} 
              onSave={handleEditSave} 
              isUpdating={updatingId === editingAppt.id} 
          />
      )}

      {deletingAppt && (
          <DeleteAppointmentModal 
              appt={deletingAppt} 
              onClose={() => setDeletingAppt(null)} 
              onConfirm={handleDeleteConfirm} 
              isUpdating={updatingId === deletingAppt.id} 
          />
      )}

      <ConfirmModal 
          isOpen={cancellingAppt !== null}
          title="¿Cancelar Reserva?"
          message={`Estás a punto de cancelar la cita de <strong class="text-white">${cancellingAppt?.clientName}</strong>. <br/><br/>Se liberará la hora en la agenda y se enviará un correo de aviso al cliente.`}
          confirmText="Sí, Cancelar"
          cancelText="No, Volver"
          type="danger"
          isLoading={updatingId === cancellingAppt?.id}
          onClose={() => setCancellingAppt(null)}
          onConfirm={() => {
              if (cancellingAppt) {
                  handleStatusChange(cancellingAppt.id, 'cancelled');
                  setCancellingAppt(null); 
              }
          }}
      />

    </div>
  );
};

export default AppointmentsView;