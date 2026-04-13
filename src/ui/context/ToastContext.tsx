import { createContext, useContext, useState, type ReactNode, useRef, useCallback, useMemo } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMethods {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  toast: ToastMethods; 
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const NOTIFICATION_SOUND = "/notificacion.mp3";

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [activeToast, setActiveToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.4;
  }

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setActiveToast(null); 
    
    setTimeout(() => {
      setActiveToast({ message, type });
      
      // Ahora sonará tanto para success como para error
      if ((type === 'success' || type === 'error') && audioRef.current) {
         audioRef.current.pause();      
         audioRef.current.currentTime = 0; 
         audioRef.current.play().then(() => {
         }).catch((err) => {
             console.error("🎵 [Toast] Error reproduciendo sonido:", err);
         });
      }
      
      setTimeout(() => {
          setActiveToast(null);
      }, 4000);
    }, 100);
  }, []);

  const toastHelpers: ToastMethods = useMemo(() => ({
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info')
  }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, toast: toastHelpers }}>
      {children}
      {activeToast && (
        <div className="fixed top-24 left-4 right-4 md:left-auto md:right-10 z-99999 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`
            bg-bg-card border border-white/5 shadow-2xl 
            w-full md:w-[480px] flex items-center gap-4 md:gap-8 backdrop-blur-xl bg-opacity-95
            relative overflow-hidden rounded-sm p-6 md:p-8
          `}>
            {/* Barra lateral de color */}
            <div className={`absolute left-0 top-0 h-full w-1.5 md:w-2 ${activeToast.type === 'success' ? 'bg-gold' : 'bg-error'}`}></div>
            {/* Icono */}
            <div className={`p-3 md:p-4 rounded-full shrink-0 ${activeToast.type === 'success' ? 'bg-gold/10' : 'bg-red-500/10'}`}>
              {activeToast.type === 'success' ? (
                <svg className="w-6 h-6 md:w-8 md:h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-6 h-6 md:w-8 md:h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            {/* Textos */}
            <div className="flex-1">
              <p className="text-[10px] md:text-[11px] text-gold uppercase font-black tracking-[0.4em] mb-1 opacity-80">Notificación</p>
              <h4 className="text-txt-main text-sm md:text-lg font-black tracking-tight leading-tight uppercase italic">{activeToast.message}</h4>
            </div>
            <button onClick={() => setActiveToast(null)} className="text-txt-muted hover:text-txt-main transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
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