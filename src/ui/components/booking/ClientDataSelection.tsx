// src/ui/components/booking/ClientDataSelection.tsx
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '../../../core/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { CheckCircle2 } from 'lucide-react';
import { releaseTemporalLock } from '../../../core/services/booking.service';

export const ClientDataSelection = () => {
  const { 
    setStep, 
    clientData, 
    setClientData,
    selectedBarber,  // <-- NUEVO
    selectedDate,    // <-- NUEVO
    selectedTime     // <-- NUEVO
  } = useBooking();
  const { user } = useAuth();

  // Auto-cargar datos del CRM si el usuario está logueado
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setClientData({
              name: data.name || '',
              phone: data.phone || '',
              email: user.email || ''
            });
          } else {
            // Pasamos el objeto directamente en lugar de una función 'prev'
            setClientData({ name: '', phone: '', email: user.email || '' });
          }
        } catch (error) {
          console.error("Error cargando perfil del CRM:", error);
        }
      };
      loadUserData();
    }
  }, [user, setClientData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(5);
  };

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      <h2 className="text-2xl font-bold text-gold text-center mb-2 uppercase tracking-widest">Tus Datos</h2>
      
      {user ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-8 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Perfil Cargado Automáticamente</span>
          </div>
      ) : (
          <p className="text-center text-txt-muted text-sm mb-8">Ingresa tus datos para continuar.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Nombre Completo</label>
          <input 
            required 
            type="text" 
            value={clientData.name} 
            onChange={(e) => setClientData({...clientData, name: e.target.value})} 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-sm focus:border-gold outline-none transition-all" 
            placeholder="Ej: Juan Pérez" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Teléfono</label>
          <input 
            required 
            type="tel" 
            value={clientData.phone} 
            onChange={(e) => setClientData({...clientData, phone: e.target.value})} 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-sm focus:border-gold outline-none transition-all" 
            placeholder="+56 9 ..." 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Email</label>
          <input 
            required 
            type="email" 
            value={clientData.email} 
            onChange={(e) => setClientData({...clientData, email: e.target.value})} 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-sm focus:border-gold outline-none transition-all" 
            placeholder="correo@ejemplo.com" 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6">
          <button type="submit" className="w-full bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] hover:bg-gold-hover transition-all shadow-xl shadow-gold/20">
            Continuar al Pago
          </button>
          <button 
            type="button" 
            onClick={() => {
              // Liberar el lock antes de retroceder
              if (selectedBarber && selectedDate && selectedTime) {
                const dateString = selectedDate.toISOString().split('T')[0];
                releaseTemporalLock(selectedBarber.id, dateString, selectedTime);
              }
              setStep(3); // Retroceder al paso 3
            }} 
            className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Regresar
          </button>
        </div>
      </form>
    </div>
  );
};