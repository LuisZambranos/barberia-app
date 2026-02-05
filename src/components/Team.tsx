import { useState, useRef, useEffect } from "react";
import barbero2 from "../assets/barbero2.jpg";
import barbero3 from "../assets/barbero3.jpg";
import barbero4 from "../assets/barbero4.jpg";

const barbers = [
  {
    id: 1,
    name: "Carlos 'El Jefe'",
    role: "Master Barber",
    specialty: "Cortes Clásicos & Navaja",
    image: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Andrés V.",
    role: "Senior Stylist",
    specialty: "Degradados (Fade) & Diseños",
    image: barbero2
  },
  {
    id: 3,
    name: "Miguel Ángel",
    role: "Especialista en Barba",
    specialty: "Perfilado & Toalla Caliente",
    image: barbero3
  },
  {
    id: 4,
    name: "Javi",
    role: "Barber & Color",
    specialty: "Estilo Urbano & Colorimetría",
    image: barbero4
  }
];

const Team = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // useEffect para ajustar la barrita al inicio y al cambiar el tamaño de pantalla
  useEffect(() => {
    if (scrollRef.current) {
        const updateIndex = () => {
             // En móvil (w-full) el índice debe ser exacto. En PC no usamos barrita
            if (window.innerWidth < 768) {
                const container = scrollRef.current!;
                // Calculamos el centro de la tarjeta visible
                const cardWidth = container.clientWidth;
                const scrollPos = container.scrollLeft;
                // Índice actual: Scroll total dividido por el ancho del viewport (1 tarjeta)
                const index = Math.round(scrollPos / cardWidth);
                setActiveIndex(index);
            }
        };

        // Escuchamos el scroll y forzamos la actualización
        const currentRef = scrollRef.current;
        currentRef.addEventListener('scroll', updateIndex);
        updateIndex(); // Ejecutamos al inicio

        // Limpieza
        return () => {
            currentRef.removeEventListener('scroll', updateIndex);
        };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      // Ancho de una tarjeta + gap (6 en total, 24px)
      const cardAndGapWidth = container.children[0].clientWidth + 24; 
      
      // En PC movemos 3 tarjetas a la vez. En móvil movemos 1.
      const multiplier = window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 768 ? 2 : 1);
      const scrollUnit = multiplier * cardAndGapWidth;
      
      container.scrollBy({
        left: direction === 'left' ? -scrollUnit : scrollUnit,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="barberos" className="py-20 bg-bg-card border-t border-white/5 relative">
      {/* Contenedor principal con más margen para las flechas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-sm mb-2">
            EL EQUIPO
          </h2>
          <h3 className="text-3xl font-bold text-white">
            Maestros de la Navaja
          </h3>
        </div>

        {/* CONTENEDOR PRINCIPAL CON POSICIONAMIENTO RELATIVO */}
        {/* Aquí la clave es poner un padding/margin negativo para sacar las flechas */}
        <div className="relative mx-auto max-w-6xl group md:px-16 lg:px-24">
          
          {/* BOTÓN IZQUIERDA (Flotando FUERA del carrusel) */}
          <button 
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute -left-16 top-1/2 -translate-y-1/2 z-20 
                       w-12 h-12 items-center justify-center rounded-full 
                       bg-bg-main border-2 border-gold/50 text-gold shadow-2xl shadow-black/70
                       hover:bg-gold hover:text-black hover:scale-110 transition-all duration-300" 
            aria-label="Anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* LISTA DE CARDS (CARRUSEL) */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Oculta la barra nativa
          >
            {barbers.map((barber) => (
              <div 
                key={barber.id} 
                // SOLUCIÓN TARJETAS PC: Caben 3 exactas en pantallas LG+ (1024px)
                // SOLUCIÓN TARJETAS PC: Caben 2 exactas en pantallas MD+ (768px)
                // SOLUCIÓN TARJETAS MÓVIL: w-full (100%)
                className="snap-center shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.3333%-16px)]"
              >
                <div className="group/card bg-bg-main rounded-xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300 shadow-lg flex flex-col h-full hover:-translate-y-1 transform-gpu">
                  
                  <div className="relative h-64 w-full overflow-hidden">
                    <img 
                      src={barber.image} 
                      alt={barber.name} 
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-110 will-change-transform"
                    />
                    {/* ARREGLO DEGRADADO (Estilo Servicios): Sutil y se mezcla con el fondo de la tarjeta */}
                    <div className="absolute inset-0 bg- from-bg-card via-transparent to-transparent pointer-events-none"></div>
                  </div>

                  <div className="p-6 text-center grow flex flex-col justify-center relative z-20"> 
                    <h4 className="text-xl font-bold text-white mb-1">
                      {barber.name}
                    </h4>
                    <p className="text-gold text-xs font-bold uppercase tracking-wider mb-2">
                      {barber.role}
                    </p>
                    <p className="text-txt-muted text-sm italic">
                      {barber.specialty}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* BOTÓN DERECHA (Flotando FUERA del carrusel) */}
          <button 
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute -right-16 top-1/2 -translate-y-1/2 z-20 
                       w-12 h-12 items-center justify-center rounded-full 
                       bg-bg-main border-2 border-gold/50 text-gold shadow-2xl shadow-black/70
                       hover:bg-gold hover:text-black hover:scale-110 transition-all duration-300"
            aria-label="Siguiente"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>

        </div>

        {/* BARRITA DE PROGRESO (SOLO MÓVIL) */}
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {barbers.map((_, index) => (
            <div 
              key={index}
              // a) Color Dorado si es el activo. b) Color Azulado/Gris (slate-600) si es inactivo.
              className={`h-2 rounded-full transition-all duration-300 
                ${index === activeIndex ? "w-8 bg-gold" : "w-2 bg-slate-700 hover:bg-slate-600"}`}
            />
          ))}
        </div>
        <p className="md:hidden text-center text-txt-muted text-xs mt-4 animate-pulse">
          Desliza para ver más
        </p>

      </div>
    </section>
  );
};

export default Team;