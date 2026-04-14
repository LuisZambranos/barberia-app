import { useState, useEffect } from "react";
import { Save, Loader2, Bell, Smartphone } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../core/firebase/config";
import { useToast } from "../../context/ToastContext";
import { requestNotificationPermission } from "../../../core/services/notification.service";

// --- IMPORTAMOS TODOS LOS SUB-COMPONENTES ---
import { ProfileSettings } from "./settings/ProfileSettings";
import { AvailabilitySettings } from "./settings/AvailabilitySettings";
import { ManualBlocksManager } from "./settings/ManualBlocksManager"; // <-- Fase 3
import { PaymentSettings } from "./settings/PaymentSettings";

interface ConfigViewProps {
  barberId: string;
}

const ConfigView = ({ barberId }: ConfigViewProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ESTADOS DEL PERFIL
  const [barberProfile, setBarberProfile] = useState({ name: '', specialty: '', photoUrl: '', instagram: '' });

  // ESTADOS DE DISPONIBILIDAD Y CONTACTO
  const [phone, setPhone] = useState(""); 
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [autoConfirmCash, setAutoConfirmCash] = useState(false);
  const [autoConfirmTransfer, setAutoConfirmTransfer] = useState(false);
  const [schedule, setSchedule] = useState({ start: "10:00", end: "20:00", active: true });
  const [workDays, setWorkDays] = useState<Record<string, boolean>>({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false });

  // ESTADOS DE PAGO
  const [paymentMethods, setPaymentMethods] = useState({ cash: true, transfer: true, online: false });
  const [transferDetails, setTransferDetails] = useState({ bank: '', accountType: '', accountNumber: '', rut: '', fullName: '', email: '' });

  // ESTADOS DE NOTIFICACIONES
  const [notifications, setNotifications] = useState({ newBooking: true, cancellation: true });
  const [requestingPush, setRequestingPush] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "barbers", barberId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          setBarberProfile({
            name: data.name || '',
            specialty: data.specialty || '',
            photoUrl: data.photoUrl || data.image || '',
            instagram: data.instagram || ''
          });

          if (data.phone !== undefined) setPhone(data.phone);
          if (data.autoConfirm !== undefined) setAutoConfirm(data.autoConfirm);
          if (data.autoConfirmCash !== undefined) setAutoConfirmCash(data.autoConfirmCash);
          if (data.autoConfirmTransfer !== undefined) setAutoConfirmTransfer(data.autoConfirmTransfer);
          
          if (data.schedule) {
            setSchedule({ start: data.schedule.start || "10:00", end: data.schedule.end || "20:00", active: data.schedule.active !== undefined ? data.schedule.active : true });
            if (data.schedule.days) setWorkDays(data.schedule.days);
          }
          if (data.notifications) setNotifications(data.notifications);
          if (data.paymentMethods) {
            setPaymentMethods({ cash: data.paymentMethods.cash ?? true, transfer: data.paymentMethods.transfer ?? true, online: data.paymentMethods.online ?? false });
          }
          if (data.transferDetails) setTransferDetails(data.transferDetails);
        }
      } catch (error) {
        toast.error("Error al cargar la configuración");
      } finally {
        setLoading(false);
      }
    };

    if (barberId) fetchConfig();
  }, [barberId, toast]);

  const handleSave = async () => {
    const phoneRegex = /^[+]?[\d\s]+$/;
    if (phone && !phoneRegex.test(phone)) {
      toast.error("El teléfono solo debe contener números.");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "barbers", barberId);
      await updateDoc(docRef, {
        name: barberProfile.name,
        specialty: barberProfile.specialty,
        photoUrl: barberProfile.photoUrl,
        instagram: barberProfile.instagram,
        phone: phone.replace(/\s+/g, ''), 
        autoConfirm, autoConfirmCash, autoConfirmTransfer, notifications,
        schedule: { ...schedule, days: workDays },
        paymentMethods, transferDetails
      });
      toast.success("¡Configuración guardada correctamente!");
    } catch (error) {
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePushNotifications = async () => {
    setRequestingPush(true);
    const success = await requestNotificationPermission(barberId);
    if (success) toast.success("¡Notificaciones Push activadas!");
    else toast.error("No se pudo activar. Verifica los permisos.");
    setRequestingPush(false);
  };

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${active ? 'bg-gold' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  // Funciones para actualizar el estado desde los hijos
  const handleAvailabilityUpdate = (updates: any) => {
    if (updates.phone !== undefined) setPhone(updates.phone);
    if (updates.autoConfirm !== undefined) setAutoConfirm(updates.autoConfirm);
    if (updates.autoConfirmCash !== undefined) setAutoConfirmCash(updates.autoConfirmCash);
    if (updates.autoConfirmTransfer !== undefined) setAutoConfirmTransfer(updates.autoConfirmTransfer);
    if (updates.schedule !== undefined) setSchedule(updates.schedule);
    if (updates.workDays !== undefined) setWorkDays(updates.workDays);
  };

  const handlePaymentUpdate = (updates: any) => {
    if (updates.paymentMethods !== undefined) setPaymentMethods(updates.paymentMethods);
    if (updates.transferDetails !== undefined) setTransferDetails(updates.transferDetails);
  };

  if (loading) return <div className="p-10 text-center text-gold"><Loader2 className="animate-spin inline mr-2"/>Cargando preferencias...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* 1. MÓDULO DE PERFIL */}
      <ProfileSettings 
        barberId={barberId}
        initialName={barberProfile.name}
        initialSpecialty={barberProfile.specialty}
        initialPhotoUrl={barberProfile.photoUrl}
        initialInstagram={barberProfile.instagram}
        onProfileUpdate={(updates) => setBarberProfile(prev => ({ ...prev, ...updates }))}
      />

      {/* 2. MÓDULO DE DISPONIBILIDAD */}
      <AvailabilitySettings 
        phone={phone}
        autoConfirm={autoConfirm}
        autoConfirmCash={autoConfirmCash}
        autoConfirmTransfer={autoConfirmTransfer}
        schedule={schedule}
        workDays={workDays}
        onUpdate={handleAvailabilityUpdate}
      />

      {/* 3. MÓDULO DE BLOQUEOS MANUALES (Fase 3) */}
      <ManualBlocksManager 
        barberId={barberId} 
        schedule={schedule} 
      />

      {/* 4. MÓDULO DE PAGOS */}
      <PaymentSettings 
        paymentMethods={paymentMethods}
        transferDetails={transferDetails}
        onUpdate={handlePaymentUpdate}
      />

      {/* 5. MÓDULO DE NOTIFICACIONES (Se mantiene aquí por simplicidad) */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Bell size={20} /></div>
              <div>
                <h2 className="text-lg font-bold text-white">Notificaciones</h2>
                <p className="text-xs text-txt-muted">Controla cómo te avisa el sistema.</p>
              </div>
          </div>
          
          <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                      <Smartphone className="text-blue-400 shrink-0 mt-1" size={18} />
                      <div>
                          <p className="text-sm font-bold text-white leading-tight">Alertas en este Dispositivo</p>
                          <p className="text-xs text-blue-200/70 mt-1">Recibe alertas aunque la app esté cerrada.</p>
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

              <div className="pt-2 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm text-white font-medium block">Alerta de Nueva Reserva</span>
                        <span className="text-[10px] text-txt-muted uppercase">Activa el sonido global</span>
                    </div>
                    <Toggle active={notifications.newBooking} onClick={() => setNotifications({...notifications, newBooking: !notifications.newBooking})} />
                  </div>
              </div>
          </div>
      </section>

      {/* BOTÓN MAESTRO DE GUARDADO */}
      <div className="pt-4 sticky bottom-4 z-20">
          <button onClick={handleSave} disabled={saving} className="w-full bg-gold hover:bg-gold-hover text-bg-main font-black py-4 rounded-lg uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:shadow-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Guardar Cambios
          </button>
      </div>
    </div>
  );
};

export default ConfigView;