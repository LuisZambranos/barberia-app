import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type Service } from '../models/Service';

//  IMÁGENES 
import clasico from '../assets/clasico.jpg';
import bronze from '../assets/bronze.jpeg';
import plata from '../assets/plata.jpg';
import gold from '../assets/gold.jpg';
import premium from '../assets/premiun.jpg';

// DATOS ESTÁTICOS (Carga inmediata, sin Firebase, con tus fotos)
const SERVICES_DATA: Service[] = [
{ 
    id: '1', 
    name: 'A&J Básico', 
    price: 10000, 
    duration: 30, 
    description: 'Corte clásico y la mejor calidad.',
    image: clasico
  },
  { 
    id: '2', 
    name: 'A&J Bronze', 
    price: 12000, 
    duration: 45, 
    description: 'Corte de cabello degradado, perfilado de cejas, lavado capilar, mascarilla facial.',
    image: bronze

  },
  { 
    id: '3', 
    name: 'A&J Plata', 
    price: 15000, 
    duration: 50, 
    description: 'Corte de cabello degradado, perfilado de cejas, lavado capilar, mascarilla facial, masajeador de manos.', 
    image: plata
  },
  { 
    id: '4', 
    name: 'A&J Gold', 
    price: 18000, 
    duration: 60, 
    description: 'Corte de cabello degradado, perfilado de cejas, lavado capilar, mascarilla facial e hidratante, masajeador de manos y ocular, bebida a elección.',
    image: gold
  },
  { 
    id: '5', 
    name: 'A&J Premium', 
    price: 27990, 
    duration: 90, 
    description: 'Corte de cabello degradado, perfilado de cejas, lavado capilar, limpieza facial completa, masajeador de manos y ocular, bebida a elección, asesoría de corte.',
    image: premium
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