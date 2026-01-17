import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// Definimos la estructura de un Servicio
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

const Booking = () => {
  // Estados
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Cargar servicios desde Firebase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const servicesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        
        console.log("Servicios cargados:", servicesList); // Para depurar en consola
        setServices(servicesList);
      } catch (error) {
        console.error("Error cargando servicios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main text-white flex items-center justify-center">
        <p className="text-gold text-xl animate-pulse">Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gold">
          Reserva tu Cita
        </h1>
        <p className="text-center text-txt-secondary mb-10">
          Paso 1: Selecciona el servicio que deseas
        </p>

        {/* Lista de Servicios */}
        <div className="grid gap-4">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`
                p-6 rounded-xl border cursor-pointer transition-all flex justify-between items-center
                ${selectedService === service.id 
                  ? 'border-gold bg-white/5 shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                  : 'border-white/10 bg-bg-card hover:border-gold/50'}
              `}
            >
              <div>
                <h3 className="text-xl font-bold">{service.name}</h3>
                <p className="text-txt-muted text-sm">{service.duration} min</p>
              </div>
              <div className="text-right">
                <p className="text-gold font-bold text-lg">${service.price.toLocaleString()}</p>
                {selectedService === service.id && (
                  <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Seleccionado</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botón Siguiente */}
        <div className="mt-10 text-center">
          <button 
            disabled={!selectedService}
            className={`
              px-10 py-3 rounded-lg font-bold text-black uppercase tracking-widest transition-all
              ${selectedService 
                ? 'bg-gold hover:bg-gold-hover scale-100 opacity-100' 
                : 'bg-gray-600 scale-95 opacity-50 cursor-not-allowed'}
            `}
          >
            Siguiente: Elegir Barbero
          </button>
        </div>

      </div>
    </div>
  );
};

export default Booking;