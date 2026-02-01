import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    // CONTENEDOR PRINCIPAL
    // h-screen: Ocupa toda la altura de la ventana (100vh).
    // relative: Necesario para que los hijos con "absolute" se posicionen respecto a este bloque.
    <section className="relative h-screen flex items-center justify-center overflow-hidden" id='hero'>
      
      {/* 1. IMAGEN DE FONDO
          He cambiado el link por uno más estable de una barbería oscura.
          absolute inset-0: Ocupa todo el espacio disponible.
          object-cover: Recorta la imagen para llenar el espacio sin deformarse.
          object-center: Asegura que el centro de la foto (la acción) sea visible.
      */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" 
          alt="Interior Barbería La Piedad" 
          className="w-full h-full object-cover object-center"
        />
        
        {/* OVERLAY (Capa de Sombra)
            bg-bg-main/80: Usamos nuestro color "Slate 950" con 80% de opacidad.
            Esto oscurece bastante la foto para que el texto dorado BRILLE.
        */}
        <div className="absolute inset-0 bg-bg-main/80"></div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL
          z-10: Pone el texto ENCIMA de la sombra.
      */}
      {/* A. CONTENEDOR PRINCIPAL: Dividido en 2 columnas en PC */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-18 md:pt-20 flex flex-col md:flex-row md:justify-between md:gap-12 text-center md:text-left">
        
        {/* B. CONTENIDO PRINCIPAL (IZQUIERDA) */}
        <div className="w-full md:w-3/5 lg:w-2/3  mb-12 md:mb-0">
          {/* "Eyebrow" o Subtítulo pequeño */}
          <p className="text-gold font-bold tracking-[0.25em] mb-2 uppercase text-sm md:text-base animate-pulse">
            ESTILO CLÁSICO &bull; CORTES MODERNOS
          </p>

          {/* Título Principal Gigante */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            TU MEJOR <br />
            {/* Texto con Gradiente Dorado */}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-gold via-yellow-200 to-gold">
              VERSIÓN
            </span>
          </h1>

          {/* Párrafo descriptivo */}
          <p className="text-txt-secondary text-lg md:text-xl mb-4 md:mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed font-light">
            Más que un corte, un ritual. Reserva tu experiencia con <br /> los mejores barberos de la zona.
          </p>

          {/* Grupo de Botones */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            {/* Botón Principal (CTA) */}
            <Link 
              to="/book" 
              className="bg-gold hover:bg-gold-hover text-bg-main font-bold py-4 px-10 rounded-sm transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] uppercase tracking-wider"
            >
              Reservar Ahora
            </Link>
            
            {/* Botón Secundario (Outline) */}
            <a  
              href="#servicios" 
              className="border border-white/20 hover:border-gold hover:text-gold text-white font-bold py-4 px-10 rounded-sm transition-all uppercase tracking-wider backdrop-blur-sm"
            >
              Ver Servicios
            </a>
          </div>
        </div>

       {/* C. BLOQUE DE HORARIOS (DERECHA) */}
        <div className="w-full md:w-2/5 lg:w-1/2 bg-bg-main/70 backdrop-blur-sm p-6 sm:pt-0 rounded-xl border border-white/10 shadow-xl self-start md:self-center">
        
          {/* Horario Principal Hoy */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
            <span className="text-gold text-2xl">
              {/* Ícono de reloj */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <div>
              <p className="text-sm font-bold text-white mb-1">Abierto Hoy</p>
              <p className="text-gold text-base font-semibold">10:00 AM - 20:00 PM</p>
            </div>
          </div>

          {/* Horarios Detallados */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center text-txt-secondary">
              <span className="text-white">Lun - Vie</span>
              <span className="text-txt-main font-semibold">10:00 - 20:00</span>
            </div>
            <div className="flex justify-between items-center text-txt-secondary">
              <span className="text-white">Sábados</span>
              <span className="text-txt-main font-semibold">10:00 - 18:00</span>
            </div>
            <div className="flex justify-between items-center text-txt-secondary">
              <span>Domingo</span>
              <span className="text-red-500 font-semibold">Cerrado</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE LOCACIÓN */}
        {/* <LocationSection /> */}

        </div>
    </section>
  );
};

export default Hero;