import { useState, useEffect } from "react";
import { Save, Bell, DollarSign, Clock, Zap, Loader2, Landmark } from "lucide-react"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useToast } from "../../context/ToastContext";

interface ConfigViewProps {
  barberId: string;
}

const DAYS_MAP = [
  { key: 'mon', label: 'L' },
  { key: 'tue', label: 'M' },
  { key: 'wed', label: 'M' },
  { key: 'thu', label: 'J' },
  { key: 'fri', label: 'V' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'D' },
];

const ConfigView = ({ barberId }: ConfigViewProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // ESTADOS BÁSICOS
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [schedule, setSchedule] = useState({ start: "10:00", end: "20:00", active: true });
  const [workDays, setWorkDays] = useState<Record<string, boolean>>({
    mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false
  });
  const [notifications, setNotifications] = useState({ newBooking: true, cancellation: true });

  // --- NUEVO: ESTADOS DE PAGOS Y TRANSFERENCIA ---
  const [paymentMethods, setPaymentMethods] = useState({ 
    cash: true, 
    transfer: true, 
    online: false // Nuevo método de pago online
  });

  const [transferDetails, setTransferDetails] = useState({
    bank: '',
    accountType: '',
    accountNumber: '',
    rut: '',
    fullName: '',
    email: ''
  });

  // CARGA DE DATOS DESDE FIREBASE
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "barbers", barberId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (data.autoConfirm !== undefined) setAutoConfirm(data.autoConfirm);
          
          if (data.schedule) {
            setSchedule({
              start: data.schedule.start || "10:00",
              end: data.schedule.end || "20:00",
              active: data.schedule.active !== undefined ? data.schedule.active : true
            });
            if (data.schedule.days) setWorkDays(data.schedule.days);
          }
          
          if (data.notifications) setNotifications(data.notifications);

          // Cargar métodos de pago (asegurando retrocompatibilidad)
          if (data.paymentMethods) {
            setPaymentMethods({
              cash: data.paymentMethods.cash ?? true,
              transfer: data.paymentMethods.transfer ?? true,
              online: data.paymentMethods.online ?? false
            });
          }

          // Cargar datos bancarios si existen
          if (data.transferDetails) {
            setTransferDetails(data.transferDetails);
          }
        }
      } catch (error) {
        console.error("Error cargando config:", error);
        toast.error("Error al cargar la configuración");
      } finally {
        setLoading(false);
      }
    };

    if (barberId) fetchConfig();
  }, [barberId, toast]);

  // GUARDAR DATOS EN FIREBASE
  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "barbers", barberId);
      await updateDoc(docRef, {
        autoConfirm,
        notifications,
        schedule: { ...schedule, days: workDays },
        // Guardamos las nuevas configuraciones de pago
        paymentMethods,
        transferDetails
      });
      toast.success("¡Configuración guardada correctamente!");
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  // COMPONENTE REUTILIZABLE PARA INTERRUPTORES
  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${active ? 'bg-gold' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  if (loading) return <div className="p-10 text-center text-gold"><Loader2 className="animate-spin inline mr-2"/>Cargando preferencias...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* 1. RESERVAS AUTOMÁTICAS */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gold/20 rounded-lg text-gold"><Zap size={20} /></div>
          <div>
            <h2 className="text-lg font-bold text-white">Reservas Automáticas</h2>
            <p className="text-xs text-txt-muted">Confirmación inmediata sin revisión.</p>
          </div>
        </div>
        <div className="bg-bg-main/50 rounded-lg p-4 border border-white/5 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Aceptación Automática</span>
            <Toggle active={autoConfirm} onClick={() => setAutoConfirm(!autoConfirm)} />
        </div>
      </section>

      {/* 2. HORARIO Y DÍAS */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/10 rounded-lg text-white"><Clock size={20} /></div>
          <div><h2 className="text-lg font-bold text-white">Disponibilidad</h2><p className="text-xs text-txt-muted">Días y horas de trabajo.</p></div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Agenda Habilitada</span>
              <Toggle active={schedule.active} onClick={() => setSchedule({...schedule, active: !schedule.active})} />
          </div>
          <div className={`transition-opacity duration-300 ${schedule.active ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
             <label className="text-xs uppercase font-bold text-txt-muted block mb-3">Días Laborales</label>
             <div className="flex justify-between gap-2">
                {DAYS_MAP.map((day) => (
                  <button key={day.key} onClick={() => setWorkDays({...workDays, [day.key]: !workDays[day.key]})} className={`w-10 h-10 rounded-lg font-bold text-sm transition-all border ${workDays[day.key] ? 'bg-gold text-bg-main border-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-bg-main text-txt-muted border-white/10 hover:border-white/30'}`}>{day.label}</button>
                ))}
             </div>
          </div>
          <div className={`grid grid-cols-2 gap-4 pt-2 transition-opacity duration-300 ${schedule.active ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <div><label className="text-xs uppercase font-bold text-txt-muted block mb-2">Apertura</label><input type="time" value={schedule.start} onChange={(e) => setSchedule({...schedule, start: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" /></div>
              <div><label className="text-xs uppercase font-bold text-txt-muted block mb-2">Cierre</label><input type="time" value={schedule.end} onChange={(e) => setSchedule({...schedule, end: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" /></div>
          </div>
        </div>
      </section>

      {/* 3. MÉTODOS DE PAGO */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><DollarSign size={20} /></div>
              <div>
                 <h2 className="text-lg font-bold text-white">Métodos de Pago</h2>
                 <p className="text-xs text-txt-muted">Opciones que le darás al cliente.</p>
              </div>
          </div>
          <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-lg border border-white/5">
                  <span className="text-sm">Pago en Efectivo (Local)</span>
                  <Toggle active={paymentMethods.cash} onClick={() => setPaymentMethods({...paymentMethods, cash: !paymentMethods.cash})} />
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-lg border border-white/5">
                  <span className="text-sm">Transferencia Bancaria</span>
                  <Toggle active={paymentMethods.transfer} onClick={() => setPaymentMethods({...paymentMethods, transfer: !paymentMethods.transfer})} />
              </div>
              {/* NUEVO: Toggle de Pago Online */}
              <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-lg border border-white/5">
                  <span className="text-sm text-gold font-bold">Pago Online (Pasarela Web)</span>
                  <Toggle active={paymentMethods.online} onClick={() => setPaymentMethods({...paymentMethods, online: !paymentMethods.online})} />
              </div>
          </div>
      </section>

      {/* 4. DATOS DE TRANSFERENCIA BANCARIA (Condicionado a que Transferencia esté activo) */}
      <div className={`transition-all duration-500 overflow-hidden ${paymentMethods.transfer ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Landmark size={20} /></div>
                <div>
                   <h2 className="text-lg font-bold text-white">Tus Datos Bancarios</h2>
                   <p className="text-xs text-txt-muted">Se le mostrarán al cliente para que transfiera.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] uppercase font-bold text-txt-muted block mb-2">Banco</label>
                    <input type="text" value={transferDetails.bank} onChange={(e) => setTransferDetails({...transferDetails, bank: e.target.value})} placeholder="Ej: Banco Estado" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-txt-muted block mb-2">Tipo de Cuenta</label>
                    <select value={transferDetails.accountType} onChange={(e) => setTransferDetails({...transferDetails, accountType: e.target.value})} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm">
                        <option value="">Selecciona...</option>
                        <option value="Cuenta Corriente">Cuenta Corriente</option>
                        <option value="Cuenta Vista / RUT">Cuenta Vista / RUT</option>
                        <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-txt-muted block mb-2">Número de Cuenta</label>
                    <input type="text" value={transferDetails.accountNumber} onChange={(e) => setTransferDetails({...transferDetails, accountNumber: e.target.value})} placeholder="Ej: 123456789" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-txt-muted block mb-2">RUT</label>
                    <input type="text" value={transferDetails.rut} onChange={(e) => setTransferDetails({...transferDetails, rut: e.target.value})} placeholder="Ej: 12.345.678-9" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-txt-muted block mb-2">Nombre Completo</label>
                    <input type="text" value={transferDetails.fullName} onChange={(e) => setTransferDetails({...transferDetails, fullName: e.target.value})} placeholder="Ej: Juan Pérez" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-txt-muted block mb-2">Correo (Opcional)</label>
                    <input type="email" value={transferDetails.email} onChange={(e) => setTransferDetails({...transferDetails, email: e.target.value})} placeholder="correo@ejemplo.com" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" />
                </div>
            </div>
        </section>
      </div>

      {/* 5. NOTIFICACIONES */}
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
      <div className="pt-4 sticky bottom-4 z-20">
          <button onClick={handleSave} disabled={saving} className="w-full bg-gold hover:bg-gold-hover text-bg-main font-black py-4 rounded-lg uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:shadow-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
      </div>
    </div>
  );
};

export default ConfigView;