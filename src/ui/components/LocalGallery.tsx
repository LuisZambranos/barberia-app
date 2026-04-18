import { useState, useEffect } from 'react';
import { getGalleryImages } from '../../core/services/gallery.service';
import type { GalleryImage } from '../../core/models/Gallery';
import { Store } from 'lucide-react';

export default function LocalGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    getGalleryImages('local').then(setImages).catch(console.error);
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-20 bg-bg-card border-t border-white/5 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center">
              <Store size={28} className="text-gold" />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">Conoce nuestro <span className="text-gold font-light">Espacio</span></h2>
          <p className="text-txt-muted max-w-2xl mx-auto text-sm md:text-base">
            Diseñamos una atmósfera exclusiva para que disfrutes de una experiencia premium en cada visita.
          </p>
        </div>

        <div className="flex overflow-x-auto gold-scrollbar gap-6 pb-4 snap-x snap-mandatory px-4 sm:px-0">
          {images.map(img => (
            <div key={img.id} className="shrink-0 w-[85vw] md:w-[45vw] lg:w-[30vw] snap-center group relative aspect-4/3 overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl">
              <img 
                src={img.url} 
                alt="Instalaciones de la barbería" 
                className="w-full h-full object-cover  transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" 
                loading="lazy"
              />
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
