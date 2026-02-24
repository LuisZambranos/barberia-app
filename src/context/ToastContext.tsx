import { createContext, useContext, useState, type ReactNode, useRef, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

// 1. DEFINIMOS LOS MÉTODOS DE AYUDA
interface ToastMethods {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// 2. INTERFAZ DEL CONTEXTO
interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  toast: ToastMethods; 
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [activeToast, setActiveToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // SOLUCIÓN SONIDO: Referencia única para el audio (evita eco y distorsión)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializamos el audio una sola vez
  if (!audioRef.current) {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.4;
  }

  // SOLUCIÓN BUCLE: Usamos useCallback para que esta función sea ESTABLE
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setActiveToast(null); // Limpiamos notificación anterior si existe
    
    // Pequeño retardo para permitir la animación de salida/entrada
    setTimeout(() => {
      setActiveToast({ message, type });
      
      // Solo reproducimos sonido si es éxito (nueva reserva) y el audio existe
      if (type === 'success' && audioRef.current) {
         audioRef.current.pause();      // Detener anterior
         audioRef.current.currentTime = 0; // Rebobinar
         audioRef.current.play().catch(() => {}); // Reproducir
      }
      
      // Auto-cierre a los 4 segundos
      setTimeout(() => setActiveToast(null), 4000);
    }, 100);
  }, []);

  // Helpers para usar toast.success()
  const toastHelpers: ToastMethods = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info')
  };

  return (
    <ToastContext.Provider value={{ showToast, toast: toastHelpers }}>
      {children}
      {activeToast && (
        /* --- TU DISEÑO ORIGINAL INTACTO --- */
        <div className="fixed top-24 left-4 right-4 md:left-auto md:right-10 z-99999 animate-toast-in">
          <div className={`
            bg-bg-card border border-white/5 shadow-2xl 
            w-full md:w-[480px] flex items-center gap-4 md:gap-8 backdrop-blur-xl bg-opacity-95
            relative overflow-hidden rounded-sm p-6 md:p-8
          `}>
            
            {/* Barra lateral de color */}
            <div className={`
              absolute left-0 top-0 h-full w-1.5 md:w-2
              ${activeToast.type === 'success' ? 'bg-gold' : 'bg-error'}
            `}></div>

            {/* Icono */}
            <div className={`
              p-3 md:p-4 rounded-full shrink-0
              ${activeToast.type === 'success' ? 'bg-gold/10' : 'bg-red-500/10'}
            `}>
              {activeToast.type === 'success' ? (
                <svg className="w-6 h-6 md:w-8 md:h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 md:w-8 md:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Textos */}
            <div className="flex-1">
              <p className="text-[10px] md:text-[11px] text-gold uppercase font-black tracking-[0.4em] mb-1 opacity-80">
                Notificación
              </p>
              <h4 className="text-txt-main text-sm md:text-lg font-black tracking-tight leading-tight uppercase italic">
                {activeToast.message}
              </h4>
            </div>

            {/* Botón de cierre */}
            <button 
              onClick={() => setActiveToast(null)} 
              className="text-txt-muted hover:text-txt-main transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Barra de progreso */}
            <div className={`
              absolute bottom-0 left-0 h-1 md:h-[5px] animate-progress-shrink 
              ${activeToast.type === 'success' ? 'bg-gold' : 'bg-error'}
            `}></div>
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