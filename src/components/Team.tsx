import { useState, useEffect } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// IMÁGENES LOCALES
import barbero1 from "../assets/barbero1.jpg";
import barbero2 from "../assets/barbero2.jpg";
import barbero3 from "../assets/barbero3.jpg";
import barbero4 from "../assets/barbero4.jpg";

// 2. MAPA DE IMÁGENES POR ID 
const BARBER_PHOTOS: Record<string, string> = {
  // Asegúrate de que este ID sea el correcto (revisar mayúsculas/minúsculas de la corrección anterior)
  "A91rn25WwfZq2hPYvEnZ": barbero1,
  "DmpODFjBiIuxBRaIyEwk": barbero2, 
  "dDyRG44j2Mt4nJSfZXu9": barbero3,
  "yQgREMm4PyY7kRqUWvlC": barbero4 // Si la foto no sale, verifica si es 'krQ' o 'kRq'
};

const DEFAULT_IMAGE = "https://via.placeholder.com/400x500?text=Barber+Shop";

// FUNCIÓN PARA MEZCLAR (Igual que en Booking)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface Barber {
  id: string;
  name: string;
  role: string;
  specialty: string;
  image: string;
}

const Team = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "barbers"));
        
        const dbData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const assignedImage = BARBER_PHOTOS[doc.id] || DEFAULT_IMAGE;

          return {
            id: doc.id,
            name: String(data.name).replace("PRUEBA", ""), // Pequeña limpieza visual opcional
            role: String(data.role),
            specialty: String(data.specialty),
            image: assignedImage
          };
        });
        
        // AQUI APLICAMOS LA ALEATORIEDAD
        setBarbers(shuffleArray(dbData));

      } catch (error) {
        console.error("Error cargando el equipo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  if (loading) return <div className="py-20 text-center text-gold animate-pulse">Cargando Equipo...</div>;

  return (
    <section id="barberos" className="py-20 bg-bg-card border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TÍTULOS */}
        <div className="text-center mb-12">
          <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-sm mb-2">EL EQUIPO</h2>
          <h3 className="text-3xl font-bold text-white">Maestros de la Navaja</h3>
        </div>

        {/* GRID LAYOUT (Reemplaza al carrusel) */}
        {/* grid-cols-2 en móvil | md:grid-cols-4 en PC */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
          
          {barbers.map((barber) => (
            <div key={barber.id} className="w-full">
              
              {/* TARJETA (Manteniendo tu diseño original pero adaptable) */}
              <div className="group/card bg-bg-main rounded-xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300 shadow-lg flex flex-col h-full hover:-translate-y-2">
                
                {/* Imagen */}
                <div className="relative h-48 md:h-64 w-full overflow-hidden">
                  <img 
                    src={barber.image} 
                    alt={barber.name} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-110"
                  />
                  {/* Degradado sutil */}
                  <div className="absolute inset-0 bg-linear-to-t from-bg-main/80 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Datos */}
                <div className="p-4 md:p-6 text-center grow flex flex-col justify-center relative z-20"> 
                  <h4 className="text-lg md:text-xl font-bold text-txt-main mb-1 leading-tight">
                    {barber.name}
                  </h4>
                  <p className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">
                    {barber.role}
                  </p>
                  <p className="text-txt-muted text-xs md:text-sm italic hidden sm:block">
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