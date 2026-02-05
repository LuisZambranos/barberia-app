import { copyToClipboard } from '../utils/clipboard';
import { useToast } from '../context/ToastContext';

const LocationSection = () => {
  const address = "Benzanilla 1419, Independencia, Santiago, Chile";
  const { showToast } = useToast();
  
  /* URLS DE NAVEGACIÓN Y MAPA */
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const reliableEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  /* FUNCIÓN PARA COPIAR DIRECCIÓN */
  const handleCopy = () => {
    if (copyToClipboard(address)) {
      showToast("Dirección copiada al portapapeles", "success");
    }
  };

  return (
    <section id="ubicacion" className="bg-bg-main py-24 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* BLOQUE INFORMATIVO: TÍTULOS Y HORARIOS */}
          <div className="w-full lg:w-1/2 space-y-10">
            <div className="space-y-4 lg:mt-7">
              <h2 className="text-5xl font-black text-txt-main uppercase italic tracking-tighter leading-none">
                HORARIOS Y <br /> <span className="text-gold">UBICACIÓN</span>
              </h2>
            </div>

            {/* TABLA DE HORARIOS SEMANALES */}
            <div className="space-y-4 max-w-md">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-txt-muted text-xs uppercase tracking-[0.2em] font-bold">Lunes — Viernes</span>
                <span className="text-txt-main font-mono font-bold text-sm tracking-tighter">10:00 AM — 20:00 PM</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-txt-muted text-xs uppercase tracking-[0.2em] font-bold">Sábado</span>
                <span className="text-txt-main font-mono font-bold text-sm tracking-tighter">09:00 AM — 18:00 PM</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-txt-muted text-xs uppercase tracking-[0.2em] font-bold">Domingo</span>
                <span className="text-error font-black italic text-xs uppercase tracking-widest">Cerrado</span>
              </div>
            </div>

            {/* TARJETA DE DIRECCIÓN CON ACCIONES */}
            <div className="bg-bg-card p-8 border-l-2 border-gold relative group overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-txt-main text-2xl font-black uppercase italic mb-1">Dirección</h3>
                <p className="text-txt-muted text-sm mb-8 leading-relaxed">
                  Benzanilla 1419<br />
                  Independencia, Santiago, Chile.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* BOTÓN GOOGLE MAPS EXTERNO */}
                  <a 
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gold text-bg-main px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold-hover transition-all text-center flex items-center justify-center gap-2"
                  >
                    <span>Ir directamente</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                  {/* BOTÓN COPIAR TEXTO */}
                  <button 
                    onClick={handleCopy}
                    className="border border-white/10 text-txt-main px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-center"
                  >
                    Copiar dirección
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENEDOR DEL MAPA INTERACTIVO */}
          <div className="w-full lg:w-1/2 aspect-square relative group">
            <div className="absolute -inset-4 bg-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
            
            <div className="relative h-full w-full">
              <iframe
                title="Mapa Ubicación Barbería"
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