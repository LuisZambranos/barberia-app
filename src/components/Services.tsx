import { Link } from 'react-router-dom';
import perfiladoBarba from '../assets/perfiladoBarba.jpg';

const services = [
  {
    id: 1,
    title: "Corte Clásico",
    price: "$15.000",
    description: "Corte a tijera o máquina con acabados precisos. Incluye lavado y peinado.",
    // Foto real de corte de pelo
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Perfilado de Barba",
    price: "$12.000",
    description: "Ritual de toalla caliente, aceites esenciales y navaja para un perfilado perfecto.",
    // Foto real de barba/afeitado
    image: perfiladoBarba
  },
  {
    id: 3,
    title: "Servicio Completo",
    price: "$25.000",
    description: "La experiencia VIP: Corte + Barba + Mascarilla negra + Bebida de cortesía.",
    // Foto de servicio completo / ambiente relax
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000&auto=format&fit=crop"
  }
];

const Services = () => {
  return (
    <section id="servicios" className="py-16 bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TÍTULO DE SECCIÓN */}
        <div className="text-center mb-12">
          <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-sm mb-2">
            NUESTRO SERVICIOS
          </h2>
          <h3 className="text-3xl font-bold text-white">
            Elegancia & Estilo
          </h3>
        </div>

        {/* GRID DE TARJETAS (Mobile First: 1 columna, Desktop: 3 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {services.map((service) => (
            <div 
              key={service.id} 
              className="bg-bg-card rounded-xl overflow-hidden shadow-lg border border-white/5 flex flex-col"
            >
              {/* 1. IMAGEN REFERENCIAL (Ocupa la parte superior) */}
              <div className="h-48 w-full overflow-hidden relative group">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay sutil para que se vea premium */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>

              {/* 2. CONTENIDO (Abajo) */}
              <div className="p-6 flex flex-col grow">
                {/* Encabezado: Título y Precio */}
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-white leading-tight">
                    {service.title}
                  </h4>
                  <span className="text-gold font-bold text-lg bg-black/30 px-2 py-1 rounded">
                    {service.price}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-txt-muted text-sm leading-relaxed mb-6 grow">
                  {service.description}
                </p>

                {/* 3. BOTÓN DE ACCIÓN (Siempre visible) */}
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