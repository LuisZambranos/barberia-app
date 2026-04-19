import { useState, useEffect } from 'react';
import { getGalleryImages } from '../../core/services/gallery.service';
import type { GalleryImage } from '../../core/models/Gallery';
import { Scissors } from 'lucide-react';

export default function HaircutsGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    getGalleryImages('haircut').then(setImages).catch(console.error);
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-20 relative bg-bg-main overflow-hidden border-t border-white/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center">
              <Scissors size={28} className="text-gold" />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">Nuestros <span className="text-gold font-light">Trabajos</span></h2>
          <p className="text-txt-muted max-w-2xl mx-auto text-sm md:text-base">
            Conoce la calidad y precisión de nuestros barberos. Tu estilo en manos de expertos.
          </p>
        </div>

        <div className="flex overflow-x-auto gold-scrollbar gap-4 md:gap-6 pb-4 snap-x snap-mandatory px-4 sm:px-0">
          {images.map(img => (
            <div key={img.id} className="shrink-0 w-[65vw] sm:w-[40vw] md:w-[30vw] lg:w-[22vw] snap-center group relative aspect-4/5 overflow-hidden rounded-2xl bg-bg-card border border-white/5">
              <img 
                src={img.url} 
                alt="Corte de cabello" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center backdrop-blur-sm mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <Scissors size={14} className="text-gold" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicador visible para móviles */}
        {images.length > 1 && (
          <div className="md:hidden flex justify-center mt-4">
            <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 opacity-70">
              Desliza para ver más 
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce-x"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
