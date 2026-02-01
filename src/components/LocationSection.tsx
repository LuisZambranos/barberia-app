import { copyToClipboard } from '../utils/clipboard';
import { useToast } from '../context/ToastContext';

const LocationSection = () => {
  const address = "Benzanilla 1419, Independencia, Santiago, Chile";
  const { showToast } = useToast();
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  
  // URL de Embed corregida para forzar el marcador (Pin)
  // Usamos el formato de búsqueda (q=) que es el más robusto para mostrar el marcador rojo
  const reliableEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const handleCopy = () => {
    if (copyToClipboard(address)) {
      // DISPARAR NOTIFICACIÓN
      showToast("Dirección copiada al portapapeles", "success");
    }
  };

  return (
    <section id="ubicacion" className="bg-[#020617] py-24 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* INFORMACIÓN Y HORARIOS */}
          <div className="w-full lg:w-1/2 space-y-10">
            <div className="space-y-4 lg:mt-7">
              <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                HORARIOS Y <br /> <span className="text-[#D4AF37]">UBICACIÓN</span>
              </h2>
            </div>

            {/* TABLA DE HORARIOS */}
            <div className="space-y-4 max-w-md">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold">Lunes — Viernes</span>
                <span className="text-white font-mono font-bold text-sm tracking-tighter">10:00 AM — 20:00 PM</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold">Sábado</span>
                <span className="text-white font-mono font-bold text-sm tracking-tighter">09:00 AM — 18:00 PM</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold">Domingo</span>
                <span className="text-[#D4AF37] font-black italic text-xs uppercase tracking-widest">Cerrado</span>
              </div>
            </div>

            {/* CAJA DE DIRECCIÓN */}
            <div className="bg-[#0f172a] p-8 border-l-2 border-[#D4AF37] relative group overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-white text-2xl font-black uppercase italic mb-1">Dirección</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Benzanilla 1419<br />
                  Independencia, Santiago, Chile.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#D4AF37] text-[#020617] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#f2ca44] transition-all text-center flex items-center justify-center gap-2"
                  >
                    <span>Ir directamente</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                  <button 
                    onClick={handleCopy}
                    className="border border-white/10 text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-center"
                  >
                    Copiar dirección
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MAPA CON PIN MARCADO */}
          <div className="w-full lg:w-1/2 aspect-square relative group">
            <div className="absolute -inset-4 bg-[#D4AF37]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
            
            <div className="relative h-full w-full border border-white/5 bg-[#0f172a] overflow-hidden grayscale invert contrast-[1.1] opacity-40 hover:grayscale-0 hover:invert-0 hover:opacity-100 transition-all duration-700 shadow-2xl">
              <iframe
                title="Google Maps Pin"
                src={reliableEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LocationSection;