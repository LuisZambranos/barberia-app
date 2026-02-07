import { useState } from "react";
import { Clock, DollarSign, Phone, Mail, Scissors, CheckCircle } from "lucide-react";

// TIPO DE DATO SIMULADO
interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  time: string;
  date: string;
  serviceType: string;
  serviceDuration: string;
  paymentMethod: "cash" | "transfer";
  status: "confirmed" | "pending";
}

// DATOS DE PRUEBA
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    clientName: "Juan Pérez",
    clientEmail: "juan@gmail.com",
    clientPhone: "+56 9 1234 5678",
    time: "10:00 AM",
    date: "2024-02-20",
    serviceType: "Corte Clásico + Barba",
    serviceDuration: "60 min",
    paymentMethod: "cash",
    status: "confirmed",
  },
  {
    id: "2",
    clientName: "Diego Silva",
    clientEmail: "diego@hotmail.com",
    clientPhone: "+56 9 8765 4321",
    time: "11:30 AM",
    date: "2024-02-20",
    serviceType: "Degradado (Fade)",
    serviceDuration: "45 min",
    paymentMethod: "transfer",
    status: "confirmed",
  },
];

const AppointmentsView = () => {
  const [appointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  if (appointments.length === 0) {
    return (
      <div className="text-center py-20 opacity-50">
        <CheckCircle size={48} className="mx-auto mb-4 text-gold" />
        <p>No tienes citas programadas para hoy.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appointments.map((appt) => (
        <div 
          key={appt.id} 
          className="bg-bg-card rounded-xl border border-white/5 overflow-hidden hover:border-gold/30 transition-all shadow-lg group animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* CABECERA (HORA Y ESTADO) */}
          <div className="bg-white/5 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xl font-black text-white">
              <Clock className="text-gold" size={20} />
              {appt.time}
            </div>
            <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-500/30 uppercase tracking-wide">
              {appt.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
            </span>
          </div>

          {/* CUERPO */}
          <div className="p-5 space-y-4">
            {/* CLIENTE */}
            <div>
              <h3 className="text-lg font-bold text-txt-main mb-1">{appt.clientName}</h3>
              <div className="flex flex-col gap-1 text-xs text-txt-muted">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-gold/70" /> {appt.clientEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-gold/70" /> {appt.clientPhone}
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-white/5"></div>

            {/* SERVICIO */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase text-txt-muted font-bold tracking-wider mb-1">Servicio</p>
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Scissors size={14} className="text-gold" />
                  {appt.serviceType}
                </div>
                <p className="text-xs text-txt-muted mt-1 ml-6">Duración: {appt.serviceDuration}</p>
              </div>
            </div>

            {/* PAGO */}
            <div className="bg-bg-main rounded-lg p-3 border border-white/5 flex items-center justify-between">
              <span className="text-[10px] uppercase text-txt-muted font-bold">Pago Previsto</span>
              <div className="flex items-center gap-2 text-sm font-bold text-gold">
                <DollarSign size={16} />
                {appt.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}
              </div>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="grid grid-cols-2 border-t border-white/5">
              <a href={`tel:${appt.clientPhone}`} className="p-3 flex justify-center items-center gap-2 hover:bg-white/5 transition-colors text-xs font-bold text-txt-muted hover:text-white border-r border-white/5">
                  <Phone size={14} /> Llamar
              </a>
              <a href={`mailto:${appt.clientEmail}`} className="p-3 flex justify-center items-center gap-2 hover:bg-white/5 transition-colors text-xs font-bold text-txt-muted hover:text-white">
                  <Mail size={14} /> Correo
              </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentsView;