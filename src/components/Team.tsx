
const barbers = [
  {
    id: 1,
    name: "Carlos 'El Jefe'",
    role: "Master Barber",
    specialty: "Cortes Clásicos & Navaja",
    // Foto retrato hombre serio/profesional
    image: "https://images.unsplash.com/photo-1583336137348-8ef82a78531e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Andrés V.",
    role: "Senior Stylist",
    specialty: "Degradados (Fade) & Diseños",
    // Foto barbero trabajando o retrato
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Miguel Ángel",
    role: "Especialista en Barba",
    specialty: "Perfilado & Toalla Caliente",
    // Foto hombre con barba cuidada
    image: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Javi",
    role: "Barber & Color",
    specialty: "Estilo Urbano & Colorimetría",
    // Foto estilo urbano
    image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1000&auto=format&fit=crop"
  }
];

const Team = () => {
  return (
    <section id="barberos" className="py-20 bg-bg-card border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-16">
          <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-sm mb-2">
            EL EQUIPO
          </h2>
          <h3 className="text-3xl font-bold text-white">
            Maestros de la Navaja
          </h3>
          <p className="text-txt-muted mt-4 max-w-2xl mx-auto">
            Profesionales dedicados a perfeccionar tu imagen con técnica y pasión.
          </p>
        </div>

        {/* GRID DE BARBEROS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {barbers.map((barber) => (
            <div key={barber.id} className="group relative">
              
              {/* MARCO DE LA FOTO */}
              <div className="h-80 w-full rounded-lg overflow-hidden relative bg-gray-800">
                <img 
                  src={barber.image} 
                  alt={barber.name} 
                  className="w-full h-full object-cover object-top transition-all duration-500 filter grayscale group-hover:grayscale-0 group-hover:scale-110"
                />
                
                {/* Overlay gradiente para que el texto se lea abajo */}
                <div className="absolute inset-0 bg-linear-to-t from-bg-main via-transparent to-transparent opacity-90"></div>
                
                {/* INFO FLOTANTE (Abajo de la foto) */}
                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-gold text-xs font-bold uppercase tracking-wider mb-1">
                    {barber.role}
                  </p>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {barber.name}
                  </h4>
                  <p className="text-gray-400 text-xs italic opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                    {barber.specialty}
                  </p>
                </div>
              </div>

              {/* Borde Dorado Sutil al hacer Hover */}
              <div className="absolute inset-0 border-2 border-gold/0 rounded-lg group-hover:border-gold/50 transition-all pointer-events-none"></div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Team;