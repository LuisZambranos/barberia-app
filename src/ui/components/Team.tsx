import { useState, useEffect } from "react";
import { type Barber } from "../../core/models/Barber";
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';

// IMÁGENES LOCALES
import barbero1 from "../assets/Simon_barber.webp"; 
import barbero2 from "../assets/Alvaro_barber.webp"; 
import barbero3 from "../assets/Reynold_barber.webp"; 
import barbero4 from "../assets/Javier_barber.webp";
import barbero5 from "../assets/Alejandro_barber.webp";
import barbero6 from "../assets/Jose_barbero.webp";

// DATOS ESTÁTICOS Barberos
const TEAM_DATA: Barber[] = [
  {
    id: "jZQTIPBBwrTNYGTdL7QBIkjBJ913", 
    name: "Simon ",
    email: "jozealcala@gmail.com", 
    role: "BARBER & COLOR",
    specialty: "Estilo Urbano & Colorimetría", // Lo dejamos en los datos por si se usa en otro lado, pero no se renderiza
    image: barbero1,
    instagram: "https://www.instagram.com/ajstudio.cl?igsh=dnVmMmU4YTgyNDZ1&utm_source=qr",
    whatsapp: "https://wa.me/56974322313"
  },
  {
    id: "YsWJfoPcBaRN7hG5KWgCbs6XQc92",
    name: "Alvaro.",
    email: "oturameyi2@gmail.com", 
    role: "SENIOR STYLIST",
    specialty: "Degradados (Fade) & Diseños",
    image: barbero2,
    instagram: "https://www.instagram.com/alvaro_m46?igsh=MWlxYzRvdnQ1Nzk4NA%3D%3D&utm_source=qr",
    whatsapp: "https://wa.me/56937605937"
  },
  {
    id: "rp2dNmur2GZFBNllPu2dH1u4KYz1",
    name: "Reynold",
    email: "reynoldamg@gmail.com", 
    role: "ESPECIALISTA BARBA",
    specialty: "Perfilado & Toalla Caliente",
    image: barbero3,
    instagram: "https://www.instagram.com/reynold_barber?igsh=Ymdzd2o1aHoxNWVw",
    whatsapp: "https://wa.me/56920754516"
  },
  {
    id: "58tCb3NW5uSjrHHnPOmzS3tTxII2",
    name: "Javier",
    email: "kellermatara@gmail.com", 
    role: "MASTER BARBER",
    specialty: "Cortes Clásicos & Navaja",
    image: barbero4,
    instagram: "https://www.instagram.com/javibarber_og?igsh=enMzdzRhNm90emZy&utm_source=qr",
    whatsapp: "https://wa.me/56948635767"
  },
  {
    id: "Tzjnvhso43ffT3x0T8rlWVEs3XG3",
    name: "Alejandro",
    email: "alejandrojosevasquezmorales@gmail.com", 
    role: "ESPECIALISTA BARBA",
    specialty: "Perfilado & Toalla Caliente",
    image: barbero5,
    instagram: "https://www.instagram.com/alejvm_barber?utm_source=qr&igsh=MWt3cHg5d21panl0NQ==",
    whatsapp: "https://wa.me/56930561123"
  },{
    id: "SfCyyndvi4da8SXT6BgXwUHgZ6A3",
    name: "Jose",
    email: "eresmoralesyosneijose@gmail.com", 
    role: "ESPECIALISTA BARBA",
    specialty: "Perfilado & Toalla Caliente",
    image: barbero6,
    instagram: "https://www.instagram.com/ajstudio.cl?igsh=dnVmMmU4YTgyNDZ1&utm_source=qr",
    whatsapp: "https://wa.me/56935565836"
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
    setBarbers(shuffleArray(TEAM_DATA));
  }, []);

  return (
    <section id="barberos" className="py-20 bg-bg-card border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TÍTULOS */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-sm mb-2">EL EQUIPO</h2>
          <h3 className="text-3xl font-bold text-text-primary">Maestros de la Navaja</h3>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
          
          {barbers.map((barber) => (
            <div key={barber.id} className="w-full animate-in zoom-in-50 duration-500">
              
              {/* TARJETA */}
              <div className="group/card bg-bg-main rounded-xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300 shadow-lg flex flex-col h-full hover:-translate-y-2">
                
                {/* Imagen */}
                <div className="relative h-48 md:h-64 w-full overflow-hidden">
                  <img 
                    src={barber.image || "https://via.placeholder.com/400x500"} 
                    alt={barber.name} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-bg-main/90 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Datos y Redes Sociales */}
                <div className="p-4 md:p-6 text-center flex flex-col justify-between relative z-20 -mt-4 bg-bg-main/50 backdrop-blur-sm grow"> 
                  
                  {/* Info Barbero */}
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-txt-main mb-1 leading-tight group-hover/card:text-gold transition-colors">
                      {barber.name}
                    </h4>
                    <p className="text-gold/90 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      {barber.role}
                    </p>
                  </div>

                  {/* Redes Sociales */}
                  <div className="flex justify-center gap-3 mt-5">
                    {barber.instagram && (
                      <a 
                        href={barber.instagram} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-txt-muted hover:bg-linear-to-tr hover:from-amber-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-300"
                        title="Ver Instagram"
                      >
                        <FaInstagram size={14} />
                      </a>
                    )}
                    {barber.whatsapp && (
                      <a 
                        href={barber.whatsapp} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-txt-muted hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300"
                        title="Contactar por WhatsApp"
                      >
                        <FaWhatsapp size={14} />
                      </a>
                    )}
                  </div>

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