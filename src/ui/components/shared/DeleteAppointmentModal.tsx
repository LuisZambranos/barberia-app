import { AlertTriangle, Loader2 } from "lucide-react";
import { type Appointment } from "../../../core/models/Appointment";

interface DeleteModalProps {
    appt: Appointment;
    onClose: () => void;
    onConfirm: (id: string) => Promise<void>;
    isUpdating: boolean;
}

export const DeleteAppointmentModal = ({ appt, onClose, onConfirm, isUpdating }: DeleteModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-bg-card border border-red-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-300">
                <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-white">¿Eliminar Reserva?</h3>
                    <p className="text-sm text-txt-muted">Estás a punto de eliminar la cita de <strong className="text-white">{appt.clientName}</strong>. Esta acción borrará el registro para siempre y liberará la hora en la agenda.</p>
                </div>
                <div className="p-4 border-t border-white/10 flex gap-3 bg-black/20">
                    <button onClick={onClose} className="flex-1 p-3 rounded-lg border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">Mejor No</button>
                    <button 
                        onClick={() => onConfirm(appt.id)} 
                        disabled={isUpdating} 
                        className="flex-1 p-3 rounded-lg bg-red-500 text-white font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-colors flex justify-center items-center shadow-lg shadow-red-500/20"
                    >
                        {isUpdating ? <Loader2 size={16} className="animate-spin"/> : 'Sí, Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};