import { useState, useEffect } from "react";
import { Save, Bell, DollarSign, Clock, Zap, Loader2, Landmark, MessageCircle, Smartphone } from "lucide-react"; // <-- NUEVO: Icono MessageCircle
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useToast } from "../../context/ToastContext";
import { requestNotificationPermission } from "../../services/notification.service";

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
  const [phone, setPhone] = useState(""); // <-- NUEVO: Teléfono de WhatsApp
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [autoConfirmCash, setAutoConfirmCash] = useState(false);
  const [autoConfirmTransfer, setAutoConfirmTransfer] = useState(false);
  const [schedule, setSchedule] = useState({ start: "10:00", end: "20:00", active: true });
  const [workDays, setWorkDays] = useState<Record<string, boolean>>({
    mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false
  });
  const [notifications, setNotifications] = useState({ newBooking: true, cancellation: true });
// --- NUEVO: ESTADO PARA EL BOTÓN PUSH ---
  const [requestingPush, setRequestingPush] = useState(false);

  // --- NUEVO: FUNCIÓN PARA PEDIR PERMISO ---
  const handleEnablePushNotifications = async () => {
    setRequestingPush(true);
    const success = await requestNotificationPermission(barberId);
    
    if (success) {
      toast.success("¡Notificaciones Push activadas en este dispositivo!");
    } else {
      toast.error("No se pudo activar. Asegúrate de dar permisos en tu navegador.");
    }
    setRequestingPush(false);
  };

  const [paymentMethods, setPaymentMethods] = useState({ 
    cash: true, 
    transfer: true, 
    online: false 
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
          
          if (data.phone !== undefined) setPhone(data.phone); // <-- NUEVO
          
          if (data.autoConfirm !== undefined) setAutoConfirm(data.autoConfirm);
          if (data.autoConfirmCash !== undefined) setAutoConfirmCash(data.autoConfirmCash);
          if (data.autoConfirmTransfer !== undefined) setAutoConfirmTransfer(data.autoConfirmTransfer);
          
          if (data.schedule) {
            setSchedule({
              start: data.schedule.start || "10:00",
              end: data.schedule.end || "20:00",
              active: data.schedule.active !== undefined ? data.schedule.active : true
            });
            if (data.schedule.days) setWorkDays(data.schedule.days);
          }
          
          if (data.notifications) setNotifications(data.notifications);

          if (data.paymentMethods) {
            setPaymentMethods({
              cash: data.paymentMethods.cash ?? true,
              transfer: data.paymentMethods.transfer ?? true,
              online: data.paymentMethods.online ?? false
            });
          }

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
    // Mini validación para el teléfono (solo números y signo + opcional)
    const phoneRegex = /^[+]?[\d\s]+$/;
    if (phone && !phoneRegex.test(phone)) {
      toast.error("El teléfono solo debe contener números.");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "barbers", barberId);
      await updateDoc(docRef, {
        phone: phone.replace(/\s+/g, ''), // <-- Guardamos sin espacios para que el link de WhatsApp no se rompa
        autoConfirm,
        autoConfirmCash,
        autoConfirmTransfer,
        notifications,
        schedule: { ...schedule, days: workDays },
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

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${active ? 'bg-gold' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  if (loading) return <div className="p-10 text-center text-gold"><Loader2 className="animate-spin inline mr-2"/>Cargando preferencias...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* 0. PERFIL DE CONTACTO (NUEVO) */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><MessageCircle size={20} /></div>
          <div>
            <h2 className="text-lg font-bold text-white">WhatsApp de Contacto</h2>
            <p className="text-xs text-txt-muted">Número al que los clientes enviarán sus comprobantes.</p>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-txt-muted block mb-2">Teléfono (con código de país, ej: +569...)</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="+56 9 1234 5678" 
            className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm transition-colors" 
          />
        </div>
      </section>

      {/* 1. RESERVAS AUTOMÁTICAS */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gold/20 rounded-lg text-gold"><Zap size={20} /></div>
          <div>
            <h2 className="text-lg font-bold text-white">Reservas Automáticas</h2>
            <p className="text-xs text-txt-muted">Controla cómo entran las citas a tu agenda.</p>
          </div>
        </div>

        <div className="space-y-4">
            {/* BOTÓN GLOBAL */}
            <div className="bg-bg-main/50 rounded-lg p-4 border border-white/5 flex items-center justify-between transition-all">
                <div>
                    <span className="text-sm font-bold text-white block">Aprobación Global</span>
                    <span className="text-[10px] text-txt-muted uppercase tracking-widest mt-1">Acepta TODO automáticamente</span>
                </div>
                <Toggle active={autoConfirm} onClick={() => setAutoConfirm(!autoConfirm)} />
            </div>

            {/* CONTROLES POR MÉTODO DE PAGO */}
            {!autoConfirm && (
                <div className="pl-4 border-l-2 border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-bg-main/30 rounded-lg p-4 border border-white/5 flex items-center justify-between hover:bg-bg-main/50 transition-colors">
                        <div>
                            <span className="text-sm font-bold text-emerald-400 block">Efectivo Automático</span>
                            <span className="text-[10px] text-txt-muted mt-1">Confirmar si pagan en el local</span>
                        </div>
                        <Toggle active={autoConfirmCash} onClick={() => setAutoConfirmCash(!autoConfirmCash)} />
                    </div>

                    <div className="bg-bg-main/30 rounded-lg p-4 border border-white/5 flex items-center justify-between hover:bg-bg-main/50 transition-colors">
                        <div>
                            <span className="text-sm font-bold text-blue-400 block">Transferencia Automática</span>
                            <span className="text-[10px] text-txt-muted mt-1">Cuidado: Se confirman sin revisar banco</span>
                        </div>
                        <Toggle active={autoConfirmTransfer} onClick={() => setAutoConfirmTransfer(!autoConfirmTransfer)} />
                    </div>
                </div>
            )}
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
              <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-lg border border-white/5">
                  <span className="text-sm text-gold font-bold">Pago Online (Pasarela Web)</span>
                  <Toggle active={paymentMethods.online} onClick={() => setPaymentMethods({...paymentMethods, online: !paymentMethods.online})} />
              </div>
          </div>
      </section>

      {/* 4. DATOS DE TRANSFERENCIA BANCARIA */}
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
              <div>
                <h2 className="text-lg font-bold text-white">Notificaciones</h2>
                <p className="text-xs text-txt-muted">Controla cómo te avisa el sistema.</p>
              </div>
          </div>
          
          <div className="space-y-6">
              {/* Botón para activar Push (El corazón de la Fase 3) */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                      <Smartphone className="text-blue-400 shrink-0 mt-1" size={18} />
                      <div>
                          <p className="text-sm font-bold text-white leading-tight">Alertas en este Dispositivo</p>
                          <p className="text-xs text-blue-200/70 mt-1">
                              Recibe alertas de nuevas reservas aunque la app esté cerrada (Requiere instalar la app en el inicio del celular).
                          </p>
                      </div>
                  </div>
                  <button 
                      onClick={handleEnablePushNotifications}
                      disabled={requestingPush}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded text-xs uppercase tracking-widest transition-colors flex justify-center items-center gap-2"
                  >
                      {requestingPush ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                      {requestingPush ? "Vinculando..." : "Vincular este Celular"}
                  </button>
              </div>

              {/* Toggles tradicionales */}
              <div className="pt-2 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm text-white font-medium block">Alerta de Nueva Reserva</span>
                        <span className="text-[10px] text-txt-muted uppercase">Activa el sonido global</span>
                    </div>
                    <Toggle active={notifications.newBooking} onClick={() => setNotifications({...notifications, newBooking: !notifications.newBooking})} />
                  </div>
                  
                  {/* Comentado temporalmente según tu solicitud
                  <div className="flex items-center justify-between opacity-50 pointer-events-none">
                    <div>
                        <span className="text-sm text-txt-muted block">Alerta de Cancelación</span>
                        <span className="text-[10px] text-txt-muted uppercase">Próximamente</span>
                    </div>
                    <Toggle active={notifications.cancellation} onClick={() => {}} />
                  </div>
                  */}
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