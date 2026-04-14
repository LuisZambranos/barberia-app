import { Link } from 'react-router-dom';
import hero from '../assets/AJ-Hero.jpeg';
import ScheduleWidget from './ScheduleWidget'; // Importamos el nuevo widget

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden" id='hero'>
      
      <div className="absolute inset-x-0 bottom-0 top-20 z-0">
        <img 
          src={hero} 
          alt="Interior Barbería" 
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-bg-main/80"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-18 md:pt-20 flex flex-col md:flex-row md:justify-between md:gap-12 text-center md:text-left">
        
        <div className="w-full md:w-3/5 lg:w-2/3 mb-12 md:mb-0">
          <p className="text-gold font-bold tracking-[0.25em] mb-2 uppercase text-sm md:text-base animate-pulse">
            ESTILO CLÁSICO &bull; CORTES MODERNOS
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-txt-main mb-4 leading-tight tracking-tight">
            TU MEJOR <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-gold via-yellow-200 to-gold">
              VERSIÓN
            </span>
          </h1>

          <p className="text-txt-main text-lg md:text-xl mb-4 md:mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed font-light">
            Más que un corte, un ritual. Reserva tu experiencia con <br /> los mejores barberos de la zona.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <Link 
              to="/book" 
              className="bg-gold hover:bg-gold-hover text-bg-main font-bold py-4 px-10 rounded-sm transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] uppercase tracking-wider text-sm md:text-base text-center"
            >
              Reservar Ahora
            </Link>
            <a  
              href="#servicios" 
              className="border border-white/20 hover:border-gold hover:text-gold text-txt-main font-bold py-4 px-10 rounded-sm transition-all uppercase tracking-wider backdrop-blur-sm text-sm md:text-base text-center"
            >
              Ver Servicios
            </a>
          </div>
        </div>

        {/* AQUÍ LLAMAMOS AL WIDGET */}
        <ScheduleWidget variant="hero" />

      </div>
    </section>
  );
};

export default Hero;