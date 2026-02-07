import { useState } from "react";
import { Save, Bell, DollarSign, Clock } from "lucide-react";

const ConfigView = () => {
  // ESTADOS LOCALES PARA LOS TOGGLES
  const [paymentMethods, setPaymentMethods] = useState({ cash: true, transfer: true, card: false });
  const [notifications, setNotifications] = useState({ newBooking: true, cancellation: true });
  const [schedule, setSchedule] = useState({ start: "10:00", end: "20:00", active: true });

  const handleSave = () => {
    // Aquí iría la lógica para guardar en Firebase
    alert("Configuración guardada (Simulación)");
  };

  // Componente reutilizable para el interruptor (Toggle)
  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${active ? 'bg-gold' : 'bg-white/10'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* 1. HORARIO */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gold/10 rounded-lg text-gold"><Clock size={20} /></div>
          <h2 className="text-lg font-bold text-white">Horario de Atención</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
              <span className="text-sm text-txt-muted">Estado General</span>
              <Toggle active={schedule.active} onClick={() => setSchedule({...schedule, active: !schedule.active})} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                  <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Apertura</label>
                  <input type="time" value={schedule.start} onChange={(e) => setSchedule({...schedule, start: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded p-3 text-white focus:border-gold outline-none" />
              </div>
              <div>
                  <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Cierre</label>
                  <input type="time" value={schedule.end} onChange={(e) => setSchedule({...schedule, end: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded p-3 text-white focus:border-gold outline-none" />
              </div>
          </div>
        </div>
      </section>

      {/* 2. MÉTODOS DE PAGO */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><DollarSign size={20} /></div>
              <h2 className="text-lg font-bold text-white">Métodos de Pago</h2>
          </div>
          <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-lg border border-white/5">
                  <span className="text-sm">Efectivo</span>
                  <Toggle active={paymentMethods.cash} onClick={() => setPaymentMethods({...paymentMethods, cash: !paymentMethods.cash})} />
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-lg border border-white/5">
                  <span className="text-sm">Transferencia</span>
                  <Toggle active={paymentMethods.transfer} onClick={() => setPaymentMethods({...paymentMethods, transfer: !paymentMethods.transfer})} />
              </div>
          </div>
      </section>

      {/* 3. NOTIFICACIONES */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Bell size={20} /></div>
              <h2 className="text-lg font-bold text-white">Notificaciones</h2>
          </div>
          <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-sm text-txt-muted">Alerta de Nueva Reserva</span>
                  <Toggle active={notifications.newBooking} onClick={() => setNotifications({...notifications, newBooking: !notifications.newBooking})} />
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-sm text-txt-muted">Alerta de Cancelación</span>
                  <Toggle active={notifications.cancellation} onClick={() => setNotifications({...notifications, cancellation: !notifications.cancellation})} />
              </div>
          </div>
      </section>

      {/* BOTÓN GUARDAR */}
      <div className="pt-4 pb-8">
          <button onClick={handleSave} className="w-full bg-gold hover:bg-gold-hover text-bg-main font-black py-4 rounded-lg uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:shadow-gold/20 transition-all">
              <Save size={18} /> Guardar Cambios
          </button>
      </div>
    </div>
  );
};

export default ConfigView;