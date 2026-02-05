import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

import perfiladoBarba from '../assets/perfiladoBarba.jpg';

// 1. DEFINIMOS LA FORMA DE LOS DATOS (INTERFACE)
// Esto le dice a TypeScript qué esperar de cada servicio.
interface Service {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
}

// 2. TIPAMOS EL DICCIONARIO
// "Record<string, string>" significa: "Este objeto tiene llaves que son texto y valores que son texto".
// Esto soluciona el error de que "no se puede usar para indexar".
const SERVICE_IMAGES: Record<string, string> = {
  "Corte Clásico": "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1000&auto=format&fit=crop",
  "Perfilado de Barba": perfiladoBarba,
  "Servicio Completo": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000&auto=format&fit=crop"
};

const Services = () => {
  // 3. TIPAMOS EL USESTATE
  // Le decimos explícitamente que esto será un array de "Service" (<Service[]>).
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        
        if (!querySnapshot.empty) {
          // Aquí TypeScript ahora sabe que devolveremos un array de Service
          const dbData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            
            // Forzamos a que data.name sea tratado como string para buscar en el diccionario
            const serviceName = data.name as string;
            
            const imagenAsignada = SERVICE_IMAGES[serviceName] || SERVICE_IMAGES["Corte Clásico"];

            return {
              id: doc.id,
              name: serviceName, 
              // Convertimos a string de forma segura
              price: data.price ? `$${Number(data.price).toLocaleString('es-CL')}` : "$0",
              description: (data.description as string) || "Descripción no disponible.",
              image: imagenAsignada
            };
          });
          
          setServices(dbData);
        }
      } catch (error) {
        console.error("Error al cargar servicios:", error);
      }
    };

    fetchServices();
  }, []);

  return (
    <section id="servicios" className="py-16 bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
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
              className="bg-bg-card rounded-xl overflow-hidden shadow-lg border border-white/5 flex flex-col"
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
                    {service.price}
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