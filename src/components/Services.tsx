import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type Service } from '../models/Service';

//  IMÁGENES 
import perfiladoBarba from '../assets/perfiladoBarba.jpg';
import corteClasico from '../assets/corte.jpg';
import servicioCompleto from '../assets/completo.jpg';

// DATOS ESTÁTICOS (Carga inmediata, sin Firebase, con tus fotos)
const SERVICES_DATA: Service[] = [
  {
    id: "corte-clasico",
    name: "Corte Clásico",
    price: 15000,
    duration: 45,
    description: "Corte a tijera o máquina con acabados precisos. Incluye lavado y peinado.",
    image: corteClasico
  },
  {
    id: "perfilado-barba",
    name: "Perfilado de Barba",
    price: 12000,
    duration: 30,
    description: "Ritual de toalla caliente, aceites esenciales y navaja para un perfilado perfecto.",
    image: perfiladoBarba
  },
  {
    id: "servicio-completo",
    name: "Servicio Completo",
    price: 25000,
    duration: 60,
    description: "La experiencia VIP: Corte + Barba + Mascarilla negra + Bebida de cortesía.",
    image: servicioCompleto
  }
];

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setServices(SERVICES_DATA);
  }, []);

  return (
    <section id="servicios" className="py-16 bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 animate-in fade-in duration-700">
          <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-sm mb-2">
            NUESTROS SERVICIOS
          </h2>
          <h3 className="text-3xl font-bold text-txt-main">
            Elegancia & Estilo
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {services.map((service) => (
            <div 
              key={service.id} 
              className="bg-bg-card rounded-xl overflow-hidden shadow-lg border border-white/5 flex flex-col hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="h-48 w-full overflow-hidden relative group">
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>

              <div className="p-6 flex flex-col grow">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-txt-main leading-tight">
                    {service.name}
                  </h4>
                  <span className="text-gold font-bold text-lg bg-black/30 px-2 py-1 rounded">
                    {/* Formateamos el precio */}
                    ${service.price.toLocaleString('es-CL')}
                  </span>
                </div>

                <p className="text-txt-muted text-sm leading-relaxed mb-6 grow">
                  {service.description}
                </p>

                <Link 
                  to="/book"
                  className="w-full block text-center bg-gold hover:bg-gold-hover text-bg-main font-bold py-3 px-4 rounded-lg transition-colors uppercase tracking-wide text-sm"
                >
                  Reservar Cita
                </Link>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Services;