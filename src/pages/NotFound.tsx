import { Link } from 'react-router-dom';
import { Scissors, Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-4 text-center">
      
      {/* Ícono animado */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full animate-pulse"></div>
        <div className="relative bg-bg-card p-6 rounded-full border border-gold/30 shadow-2xl shadow-gold/10">
          <Scissors size={64} className="text-gold -rotate-45" />
        </div>
        {/* Pequeña alerta flotante */}
        <div className="absolute -top-2 -right-2 bg-red-500/90 text-txt-main p-2 rounded-full border-2 border-bg-main animate-bounce">
          <AlertCircle size={24} />
        </div>
      </div>

      {/* Título */}
      <h1 className="text-8xl md:text-9xl font-black text-txt-main mb-2 tracking-tighter opacity-10 select-none">
        404
      </h1>
      
      <div className="-mt-12 md:-mt-16 mb-8 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gold uppercase tracking-widest mb-4">
          Corte Equivocado
        </h2>
        <p className="text-txt-secondary text-lg max-w-md mx-auto leading-relaxed">
          Parece que la página que buscas ha sido recortada o nunca existió.
        </p>
      </div>

      {/* Botón de regreso */}
      <Link 
        to="/" 
        className="group relative flex items-center gap-3 bg-gold text-bg-main px-8 py-4 rounded-sm font-black uppercase tracking-[0.2em] transition-all hover:bg-gold-hover hover:scale-105 active:scale-95 shadow-xl hover:shadow-gold/20"
      >
        <Home size={18} />
        <span>Volver al Inicio</span>
      </Link>

      {/* Decoración fondo */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-5 overflow-hidden z-0">
         <div className="absolute top-10 left-10 w-64 h-64 bg-txt-main rounded-full blur-3xl"></div>
         <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
      </div>

    </div>
  );
};

export default NotFound;