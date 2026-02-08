import { useState, useEffect } from "react";
import { type Barber } from "../models/Barber";

// IMÁGENES LOCALES
import barbero1 from "../assets/barbero1.jpg"; 
import barbero2 from "../assets/barbero2.jpg"; 
import barbero3 from "../assets/barbero3.jpg"; 
import barbero4 from "../assets/barbero4.jpg"; 

// DATOS ESTÁTICOS Barberos
const TEAM_DATA: Barber[] = [
  {
    id: "javi-urban", 
    name: "Javi",
    role: "BARBER & COLOR",
    specialty: "Estilo Urbano & Colorimetría",
    image: barbero2
  },
  {
    id: "andres-senior",
    name: "Andrés V.",
    role: "SENIOR STYLIST",
    specialty: "Degradados (Fade) & Diseños",
    image: barbero3 
  },
  {
    id: "miguel-barba",
    name: "Miguel Ángel",
    role: "ESPECIALISTA BARBA",
    specialty: "Perfilado & Toalla Caliente",
    image: barbero4
  },
  {
    id: "carlos-master",
    name: "Carlos 'El Jefe'",
    role: "MASTER BARBER",
    specialty: "Cortes Clásicos & Navaja",
    image: barbero1 
  }
];

// FUNCIÓN PARA MEZCLAR ARRAY (Shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Team = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    // Carga instantánea de los datos estáticos (mezclados)
    setBarbers(shuffleArray(TEAM_DATA));
  }, []);

  return (
    <section id="barberos" className="py-20 bg-bg-card border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TÍTULOS */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-sm mb-2">EL EQUIPO</h2>
          <h3 className="text-3xl font-bold text-white">Maestros de la Navaja</h3>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
          
          {barbers.map((barber) => (
            <div key={barber.id} className="w-full animate-in zoom-in-50 duration-500">
              
              {/* TARJETA */}
              <div className="group/card bg-bg-main rounded-xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300 shadow-lg flex flex-col h-full hover:-translate-y-2 cursor-default">
                
                {/* Imagen */}
                <div className="relative h-48 md:h-64 w-full overflow-hidden">
                  <img 
                    src={barber.image || "https://via.placeholder.com/400x500"} 
                    alt={barber.name} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-110"
                    loading="lazy"
                  />
                  {/* Degradado sutil */}
                  <div className="absolute inset-0 bg-linear-to-t from-bg-main/90 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Datos */}
                <div className="p-4 md:p-6 text-center grow flex flex-col justify-center relative z-20 -mt-4 bg-bg-main/50 backdrop-blur-sm"> 
                  <h4 className="text-lg md:text-xl font-bold text-txt-main mb-1 leading-tight group-hover/card:text-gold transition-colors">
                    {barber.name}
                  </h4>
                  <p className="text-gold/90 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">
                    {barber.role}
                  </p>
                  <p className="text-txt-muted text-xs md:text-sm italic hidden sm:block opacity-70 group-hover/card:opacity-100 transition-opacity duration-300">
                    {barber.specialty}
                  </p>
                </div>

              </div>
            </div>
          ))}
          
        </div>

      </div>
    </section>
  );
};

export default Team;