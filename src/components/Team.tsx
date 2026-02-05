import { useState, useRef, useEffect } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// IMÁGENES LOCALES
import barbero1 from "../assets/barbero1.jpg";
import barbero2 from "../assets/barbero2.jpg";
import barbero3 from "../assets/barbero3.jpg";
import barbero4 from "../assets/barbero4.jpg";

// 2. MAPA DE IMÁGENES POR ID 
// Aquí relacionamos el ID ÚNICO de Firebase con la foto local.
const BARBER_PHOTOS: Record<string, string> = {
  //  IDs  de "barbers"
  "A91rn25WwfZq2hPYvEnZ": barbero1,
  "DmpODFjBiIuxBRaIyEwk": barbero2, 
  "dDyRG44j2Mt4nJSfZXu9": barbero3,
  "yQgREMm4PyY7kRqUWvlC": barbero4
};

// Imagen por defecto (por si agregas un barbero nuevo y olvidas poner su foto aquí)
const DEFAULT_IMAGE = "https://via.placeholder.com/400x500?text=Barber+Shop";

interface Barber {
  id: string;
  name: string;
  role: string;
  specialty: string;
  image: string;
}

const Team = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  
  // ESTADO DE CARGA: Para que no se vea vacío mientras carga
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "barbers"));
        
        const dbData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          
          // AQUÍ OCURRE LA MAGIA:
          // Buscamos la foto usando el ID del documento, no el nombre.
          const assignedImage = BARBER_PHOTOS[doc.id] || DEFAULT_IMAGE;

          return {
            id: doc.id,
            name: String(data.name),         // Viene de DB
            role: String(data.role),         // Viene de DB
            specialty: String(data.specialty), // Viene de DB
            image: assignedImage             // Viene de Local (mapeado por ID)
          };
        });
        
        setBarbers(dbData);
      } catch (error) {
        console.error("Error cargando el equipo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  // --- Lógica del Scroll (Sin cambios) ---
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardAndGapWidth = container.children[0]?.clientWidth + 24 || 300; 
      const multiplier = window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 768 ? 2 : 1);
      container.scrollBy({ left: direction === 'left' ? -(multiplier * cardAndGapWidth) : (multiplier * cardAndGapWidth), behavior: 'smooth' });
    }
  };

  if (loading) return <div className="py-20 text-center text-gold animate-pulse">Cargando Equipo...</div>;

  return (
    <section id="barberos" className="py-20 bg-bg-card border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-sm mb-2">EL EQUIPO</h2>
          <h3 className="text-3xl font-bold text-white">Maestros de la Navaja</h3>
        </div>

        <div className="relative mx-auto max-w-6xl group md:px-16 lg:px-24">
          
          {/* Botones de navegación */}
          <button onClick={() => scroll('left')} className="hidden lg:flex absolute -left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-bg-main border-2 border-gold/50 text-gold shadow-2xl hover:bg-gold hover:text-black hover:scale-110 transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>

          <button onClick={() => scroll('right')} className="hidden lg:flex absolute -right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-bg-main border-2 border-gold/50 text-gold shadow-2xl hover:bg-gold hover:text-black hover:scale-110 transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Carrusel */}
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 scroll-smooth scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {barbers.map((barber) => (
              <div key={barber.id} className="snap-center shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.3333%-16px)]">
                <div className="group/card bg-bg-main rounded-xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300 shadow-lg flex flex-col h-full hover:-translate-y-1">
                  
                  {/* Imagen */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <img 
                      src={barber.image} 
                      alt={barber.name} 
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-110"
                    />
                  </div>

                  {/* Datos del texto vienen de DB */}
                  <div className="p-6 text-center grow flex flex-col justify-center relative z-20"> 
                    <h4 className="text-xl font-bold text-txt-main mb-1">{barber.name}</h4>
                    <p className="text-gold text-xs font-bold uppercase tracking-wider mb-2">{barber.role}</p>
                    <p className="text-txt-muted text-sm italic">{barber.specialty}</p>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Team;