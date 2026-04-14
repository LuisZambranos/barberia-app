import { Clock, DollarSign, Phone, Scissors, Loader2, Mail, Copy, Landmark, CreditCard, Wallet, CheckCircle2, ChevronDown, Edit2, Trash2, X, User } from "lucide-react";
import { type Appointment } from "../../../core/models/Appointment";
import { type Barber } from "../../../core/models/Barber"; 
import { sendConfirmationMessage } from "../../../core/utils/whatsapp";
import { FaWhatsapp } from 'react-icons/fa6';

const PaymentBadge = ({ method }: { method?: 'cash' | 'transfer' | 'online' }) => {
    if (method === 'transfer') return <div className="flex w-fit items-center gap-1 text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-wider" title="Transferencia Bancaria"><Landmark size={10}/> Transf.</div>;
    if (method === 'online') return <div className="flex w-fit items-center gap-1 text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider" title="Pago Online (Webpay)"><CreditCard size={10}/> Webpay</div>;
    return <div className="flex w-fit items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider" title="Pago en Efectivo"><Wallet size={10}/> Efectivo</div>;
};

interface Props {
    appt: Appointment;
    barbers: Barber[]; // <-- RECIBIMOS BARBEROS AQUÍ TAMBIÉN
    isDimmed?: boolean;
    copiedId: string | null;
    updatingId: string | null;
    openDropdownId: string | null;
    onEdit: (appt: Appointment) => void;
    onDelete: (appt: Appointment) => void;
    onCancel: (appt: Appointment) => void;
    onStatusChange: (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => void;
    onCopyEmail: (email: string, id: string) => void;
    onToggleDropdown: (id: string | null) => void;
}

export const AdminAppointmentCard = ({ appt, barbers, isDimmed = false, copiedId, updatingId, openDropdownId, onEdit, onDelete, onCancel, onStatusChange, onCopyEmail, onToggleDropdown }: Props) => {
    const isCompleted = appt.status === 'completed';
    
    // BÚSQUEDA DINÁMICA DEL NOMBRE
    const realBarberName = barbers.find(b => b.id === appt.barberId)?.name || appt.barberName;
    const displayName = realBarberName?.replace(/PRUEBA|Barbero 1/gi, '').trim() || 'Profesional';
    
    const getStatusDisplay = () => {
        if (appt.status === 'completed') return { text: 'Realizada', colorClass: 'bg-green-500/20 text-green-400 border-green-500/30' };
        if (appt.status === 'cancelled') return { text: 'Cancelada', colorClass: 'bg-red-500/20 text-red-400 border-red-500/30' };
        if (appt.status === 'confirmed') return { text: 'Confirmada', colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
        if (appt.paymentMethod === 'transfer') return { text: 'Pago Pendiente', colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse' };
        return { text: 'Por Confirmar', colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    };

    const statusDisplay = getStatusDisplay();

    return (
        <div className={`flex flex-col h-full bg-bg-card rounded-xl border border-white/5 overflow-hidden transition-all shadow-lg group ${isDimmed || isCompleted ? 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0' : 'hover:-translate-y-1 hover:border-gold/30'}`}>
            <div className="bg-white/5 p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 text-xl font-black text-white">
                    <Clock className="text-gold" size={20} />{appt.time}
                </div>
                <div className="flex items-center gap-3">
                    {appt.status !== 'cancelled' && (
                        <div className="flex items-center gap-2 mr-2 border-r border-white/10 pr-3">
                            <button onClick={() => onEdit(appt)} className="text-txt-muted hover:text-amber-400 transition-colors p-1" title="Editar cita"><Edit2 size={14} /></button>
                            <button onClick={() => onDelete(appt)} className="text-txt-muted hover:text-error transition-colors p-1" title="Eliminar cita"><Trash2 size={14} /></button>
                        </div>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${statusDisplay.colorClass}`}>{statusDisplay.text}</span>
                </div>
            </div>

            <div className="p-5 flex flex-col grow relative">
                {/* DISTINTIVO DEL BARBERO EN LA TARJETA USANDO EL NOMBRE DINÁMICO */}
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] bg-white/5 text-txt-muted px-2 py-1 rounded-full border border-white/10 uppercase tracking-widest font-bold">
                    <User size={10} className="text-gold"/>
                    {displayName}
                </div>

                <h3 className="text-lg font-bold text-txt-main mb-3 pr-24">{appt.clientName}</h3>
                
                <div className="flex flex-col gap-1 text-xs text-txt-muted mb-4">
                    <div className="flex items-center gap-2"><Phone size={14} className="text-gold/70" /> {appt.clientPhone}</div>
                    {appt.clientEmail && (
                        <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gold/70" />
                            <span className="truncate max-w-[150px]">{appt.clientEmail}</span>
                            <button onClick={() => onCopyEmail(appt.clientEmail, appt.id)} className="text-gold/50 hover:text-gold p-1">
                                {copiedId === appt.id ? <span className="text-[10px] text-green-500 font-bold">¡OK!</span> : <Copy size={14} />}
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-2 mb-4 mt-auto">
                    <div className="flex items-center gap-2 mb-3">
                        <Scissors size={14} className="text-gold" />
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{appt.serviceName}</span>
                    </div>
                    {appt.selectedItems?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-txt-muted">
                            <CheckCircle2 size={12} className="text-gold" /><span>{item}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-4">
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
                        <a href={`tel:${appt.clientPhone}`} className="p-3 flex justify-center items-center gap-2 hover:bg-gold hover:text-bg-main text-xs font-bold text-txt-muted"><Phone size={14} /> Llamar</a>
                        <button onClick={() => sendConfirmationMessage(appt)} className="p-3 flex justify-center items-center gap-2 hover:bg-green-600 hover:text-white text-xs font-bold text-green-500"><FaWhatsapp /> WhatsApp</button>
                    </div>
                )}
                
                <div className="relative border-t border-white/5 bg-black/20">
                    <div className={`absolute bottom-full left-0 w-full flex flex-col bg-bg-card/95 backdrop-blur-md border-t border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] transition-all duration-300 ease-out z-10 ${openDropdownId === appt.id ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                        {appt.status !== 'pending' && !isCompleted && appt.status !== 'cancelled' && (
                            <button onClick={(e) => { e.stopPropagation(); onStatusChange(appt.id, 'pending'); }} className="p-4 flex items-center gap-2 text-xs font-bold text-yellow-400 hover:bg-yellow-500/10 border-b border-white/5"><Clock size={16}/> Mover a Pendiente</button>
                        )}
                        {appt.status !== 'confirmed' && !isCompleted && appt.status !== 'cancelled' && (
                            <button onClick={(e) => { e.stopPropagation(); onStatusChange(appt.id, 'confirmed'); }} className="p-4 flex items-center gap-2 text-xs font-bold text-blue-400 hover:bg-blue-500/10 border-b border-white/5"><CheckCircle2 size={16}/> Confirmar</button>
                        )}
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                            <button onClick={(e) => { e.stopPropagation(); onStatusChange(appt.id, 'completed'); }} className="p-4 flex items-center gap-2 text-xs font-bold text-green-400 hover:bg-green-500/10 border-b border-white/5"><CheckCircle2 size={16}/> Marcar Realizada</button>
                        )}
                        {appt.status !== 'cancelled' && !isCompleted && (
                            <button onClick={(e) => { e.stopPropagation(); onCancel(appt); }} className="p-4 flex items-center gap-2 text-xs font-bold text-error hover:bg-error/10"><X size={16}/> Cancelar Reserva</button>
                        )}
                    </div>

                    <button 
                        onClick={(e) => { e.preventDefault(); onToggleDropdown(openDropdownId === appt.id ? null : appt.id); }}
                        className="w-full p-4 hover:bg-white/5 flex justify-center items-center gap-2 text-xs font-bold text-txt-main uppercase tracking-widest relative z-20"
                    >
                        {updatingId === appt.id ? <Loader2 size={16} className="animate-spin" /> : 'Cambiar Estado'}
                        <ChevronDown size={14} className={`transition-transform duration-300 ${openDropdownId === appt.id ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};