import { useState, useEffect } from "react";
import { type Barber } from "../../core/models/Barber";
import { getAllBarbers } from "../../core/services/barber.service";
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const loadedBarbers = await getAllBarbers();
        setBarbers(shuffleArray(loadedBarbers));
      } catch (error) {
        console.error("Error al cargar el equipo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <section id="barberos" className="py-20 bg-bg-card border-t border-white/5 flex justify-center items-center h-96">
         <p className="text-gold uppercase tracking-widest text-sm font-bold animate-pulse">Cargando Equipo...</p>
      </section>
    );
  }

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
          
          {barbers.map((barber) => {
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=1e293b&color=D4AF37&size=400`;

            // Lógica para WhatsApp (número dinámico desde el config)
            let whatsappLink = barber.whatsapp;
            if (barber.phone && !barber.whatsapp) {
                whatsappLink = `https://wa.me/${barber.phone.replace(/[^0-9]/g, '')}`;
            }

            return (
              <div key={barber.id} className="w-full animate-in zoom-in-50 duration-500">
                
                {/* TARJETA */}
                <div className="group/card bg-bg-main rounded-xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300 shadow-lg flex flex-col h-full hover:-translate-y-2">
                  
                  {/* Imagen (DISEÑO ORIGINAL) */}
                  <div className="relative h-48 md:h-64 w-full overflow-hidden">
                    <img 
                      src={barber.photoUrl || barber.image || fallbackAvatar} 
                      alt={barber.name} 
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-bg-main/90 via-transparent to-transparent opacity-60"></div>
                  </div>

                  {/* Datos y Redes Sociales (DISEÑO ORIGINAL) */}
                  <div className="p-4 md:p-6 text-center flex flex-col justify-between relative z-20 -mt-4 bg-bg-main/50 backdrop-blur-sm grow"> 
                    
                    {/* Info Barbero */}
                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-txt-main mb-1 leading-tight group-hover/card:text-gold transition-colors">
                        {barber.name.replace("PRUEBA", "")}
                      </h4>
                      <p className="text-gold/90 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                        {barber.specialty || "Barbero"}
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
                      {whatsappLink && (
                        <a 
                          href={whatsappLink} 
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
            );
          })}
          
        </div>
      </div>
    </section>
  );
};

export default Team;