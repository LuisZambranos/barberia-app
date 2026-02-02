import { createContext, useContext, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Sonido de notificación premium (Estilo Apple/Moderno)
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.volume = 0.4; // Volumen balanceado
    audio.play().catch(err => {
      // Los navegadores bloquean audio automático sin interacción previa del usuario
      console.log("Esperando interacción del usuario para activar sonidos:", err);
    });
  };

  const showToast = (message: string, type: ToastType = 'success') => {
    // Reiniciamos el estado para permitir notificaciones consecutivas
    setToast(null);
    
    // Pequeño delay para asegurar que el DOM detecte el cambio y reinicie animaciones
    setTimeout(() => {
      setToast({ message, type });
      playNotificationSound();
      
      // El toast desaparece a los 3 segundos
      setTimeout(() => setToast(null), 3000);
    }, 10);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {/* Estilos para animaciones de entrada y barra de progreso */}
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toast-progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast-in {
          animation: toast-slide-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .animate-progress-shrink {
          animation: toast-progress-shrink 3s linear forwards;
        }
      `}</style>

      {children}

      {toast && (
        <div className="fixed top-28 right-10 z-10000 animate-toast-in">
          <div className={`
            bg-[#0f172a] border border-white/5 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] 
            min-w-[500px] flex items-center gap-8 backdrop-blur-xl bg-opacity-95
            relative overflow-hidden rounded-sm
          `}>
            {/* Indicador lateral de color (Dorado para éxito, Rojo para error) */}
            <div className={`
              absolute left-0 top-0 h-full w-2
              ${toast.type === 'success' ? 'bg-[#D4AF37]' : 'bg-red-600'}
            `}></div>

            {/* Icono de notificación grande */}
            <div className={`
              p-4 rounded-full shrink-0
              ${toast.type === 'success' ? 'bg-[#D4AF37]/10' : 'bg-red-500/10'}
            `}>
              {toast.type === 'success' ? (
                <svg className="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            <div className="flex-1 pr-6">
              <p className="text-[11px] text-[#D4AF37] uppercase font-black tracking-[0.5em] mb-2 opacity-80">
                Notificación del Sistema
              </p>
              <h4 className="text-white text-xl font-black tracking-tight leading-none uppercase italic">
                {toast.message}
              </h4>
            </div>

            {/* Botón de cierre manual */}
            <button 
              onClick={() => setToast(null)}
              className="text-slate-600 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Barra de progreso inferior que se consume (3s) */}
            <div 
              className={`
                absolute bottom-0 left-0 h-[5px] animate-progress-shrink
                ${toast.type === 'success' ? 'bg-[#D4AF37]' : 'bg-red-600'}
              `}
            ></div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
};