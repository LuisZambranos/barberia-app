import { useState } from "react";
import { Edit2, X, Loader2 } from "lucide-react";
import { type Appointment, type PaymentMethodType } from "../../../core/models/Appointment";
import { type Service } from "../../../core/models/Service"; // <-- IMPORTACIÓN NUEVA

interface EditModalProps {
    appt: Appointment;
    services: Service[]; // <-- NUEVO: Recibe los servicios
    onClose: () => void;
    onSave: (id: string, date: string, time: string, paymentMethod: PaymentMethodType, service?: Service) => Promise<void>;
    isUpdating: boolean;
}

export const EditAppointmentModal = ({ appt, services, onClose, onSave, isUpdating }: EditModalProps) => {
    const [editForm, setEditForm] = useState({ 
        date: appt.date, 
        time: appt.time, 
        paymentMethod: appt.paymentMethod || 'cash' as PaymentMethodType,
        serviceId: appt.serviceId || '' // <-- NUEVO: Estado del servicio
    });

    const handleSave = () => {
        // Buscamos el objeto de servicio completo para pasarlo a la base de datos
        const selectedService = services.find(s => s.id === editForm.serviceId);
        onSave(appt.id, editForm.date, editForm.time, editForm.paymentMethod, selectedService);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-bg-card border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/10 shrink-0">
                    <h3 className="text-lg font-bold text-gold flex items-center gap-2"><Edit2 size={18}/> Editar Reserva</h3>
                    <button onClick={onClose} className="text-txt-muted hover:text-white transition-colors"><X size={20}/></button>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto grow">
                    {/* NUEVO: SELECTOR DE SERVICIOS */}
                    <div>
                        <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Servicio</label>
                        <select 
                            value={editForm.serviceId} 
                            onChange={(e) => setEditForm({...editForm, serviceId: e.target.value})} 
                            className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm"
                        >
                            <option value="">Mantener servicio actual</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name} - ${service.price.toLocaleString('es-CL')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Fecha</label>
                        <input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Hora</label>
                        <input type="time" value={editForm.time} onChange={(e) => setEditForm({...editForm, time: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Método de Pago</label>
                        <select value={editForm.paymentMethod} onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value as PaymentMethodType})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm">
                            <option value="cash">Efectivo en Local</option>
                            <option value="transfer">Transferencia Bancaria</option>
                            <option value="online">Tarjeta / Redcompra</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 flex gap-3 bg-black/20 shrink-0">
                    <button onClick={onClose} className="flex-1 p-3 rounded-lg border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">Cancelar</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isUpdating} 
                        className="flex-1 p-3 rounded-lg bg-gold text-bg-main font-black text-sm uppercase tracking-widest hover:bg-gold-hover transition-colors flex justify-center items-center"
                    >
                        {isUpdating ? <Loader2 size={16} className="animate-spin"/> : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};