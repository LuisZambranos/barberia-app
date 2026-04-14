import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { type Appointment, type PaymentMethodType } from "../../../core/models/Appointment";
import { type Service } from "../../../core/models/Service";
import { type Barber } from "../../../core/models/Barber";

interface EditModalProps {
    appt: Appointment;
    services: Service[];
    barbers?: Barber[]; // Opcional: Solo el Admin lo pasará
    onClose: () => void;
    onSave: (id: string, date: string, time: string, payment: PaymentMethodType, service?: Service, barberId?: string) => Promise<void>;
    isUpdating: boolean;
}

export const EditAppointmentModal = ({ appt, services, barbers, onClose, onSave, isUpdating }: EditModalProps) => {
    const [form, setForm] = useState({
        date: appt.date,
        time: appt.time,
        paymentMethod: appt.paymentMethod || 'cash',
        serviceId: appt.serviceId || '',
        barberId: appt.barberId || ''
    });

    const [showConfirmReassign, setShowConfirmReassign] = useState(false);

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Si hay barberos (es Admin) y el ID cambió, pedimos doble verificación
        if (barbers && form.barberId !== appt.barberId) {
            setShowConfirmReassign(true);
        } else {
            finalizeSave();
        }
    };

    const finalizeSave = () => {
        const selectedSrv = services?.find(s => s.id === form.serviceId);
        onSave(appt.id, form.date, form.time, form.paymentMethod, selectedSrv, form.barberId);
    };

    // PANTALLA DE DOBLE VERIFICACIÓN
    if (showConfirmReassign) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-bg-card border border-amber-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)] animate-in zoom-in-95 duration-300">
                    <div className="p-8 text-center space-y-4">
                        <AlertTriangle className="mx-auto text-amber-500" size={40} />
                        <h3 className="text-xl font-black text-white">¿Reasignar Cita?</h3>
                        <p className="text-sm text-txt-muted">Estás a punto de transferir a <strong className="text-white">{appt.clientName}</strong> a otro profesional. Esto liberará la hora actual y bloqueará la agenda del nuevo barbero.</p>
                    </div>
                    <div className="p-4 border-t border-white/10 flex gap-3 bg-black/20">
                        <button onClick={() => setShowConfirmReassign(false)} className="flex-1 p-3 border border-white/10 rounded-lg text-white font-bold text-sm hover:bg-white/5">Cancelar</button>
                        <button onClick={finalizeSave} disabled={isUpdating} className="flex-1 p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black text-sm flex justify-center items-center">
                            {isUpdating ? <Loader2 size={16} className="animate-spin"/> : 'Sí, Reasignar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-bg-card border border-gold/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="bg-gold/10 p-4 flex justify-between items-center border-b border-gold/20 shrink-0">
                    <h3 className="text-lg font-black text-gold">Editar Reserva</h3>
                    <button onClick={onClose} className="text-gold/50 hover:text-gold transition-colors"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleInitialSubmit} className="p-6 space-y-4 overflow-y-auto grow">
                    
                    {/* SELECTOR DE BARBERO (SOLO ADMIN) */}
                    {barbers && barbers.length > 0 && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-txt-muted uppercase tracking-widest ml-1">Profesional Asignado</label>
                            <select value={form.barberId} onChange={(e) => setForm({...form, barberId: e.target.value})} className="w-full bg-bg-main border border-white/5 p-4 text-txt-main text-xs outline-none focus:border-gold/50 transition-all rounded-sm">
                                {barbers.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-txt-muted uppercase tracking-widest ml-1">Fecha</label>
                            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full bg-bg-main border border-white/5 p-4 text-txt-main text-xs outline-none focus:border-gold/50 transition-all rounded-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-txt-muted uppercase tracking-widest ml-1">Hora</label>
                            <input type="time" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} className="w-full bg-bg-main border border-white/5 p-4 text-txt-main text-xs outline-none focus:border-gold/50 transition-all rounded-sm" />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-txt-muted uppercase tracking-widest ml-1">Servicio Base</label>
                        <select value={form.serviceId} onChange={(e) => setForm({...form, serviceId: e.target.value})} className="w-full bg-bg-main border border-white/5 p-4 text-txt-main text-xs outline-none focus:border-gold/50 transition-all rounded-sm">
                            {services?.map(s => <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-txt-muted uppercase tracking-widest ml-1">Método de Pago</label>
                        <select value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value as PaymentMethodType})} className="w-full bg-bg-main border border-white/5 p-4 text-txt-main text-xs outline-none focus:border-gold/50 transition-all rounded-sm">
                            <option value="cash">Efectivo en Local</option>
                            <option value="transfer">Transferencia Bancaria</option>
                            <option value="online">Tarjeta / Redcompra</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 p-3 rounded-lg border border-white/10 text-white font-bold text-sm hover:bg-white/5">Cancelar</button>
                        <button type="submit" disabled={isUpdating} className="flex-1 p-3 rounded-lg bg-gold text-bg-main font-black text-sm uppercase tracking-widest hover:bg-gold-hover flex justify-center items-center shadow-lg shadow-gold/20">
                            {isUpdating ? <Loader2 size={16} className="animate-spin"/> : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};