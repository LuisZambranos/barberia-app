import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    // CONTENEDOR PRINCIPAL
    // h-screen: Ocupa toda la altura de la ventana (100vh).
    // relative: Necesario para que los hijos con "absolute" se posicionen respecto a este bloque.
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center md:text-left pt-20">
        
        {/* "Eyebrow" o Subtítulo pequeño */}
        <p className="text-gold font-bold tracking-[0.25em] mb-4 uppercase text-sm md:text-base animate-pulse">
          ESTILO CLÁSICO &bull; CORTES MODERNOS
        </p>

        {/* Título Principal Gigante */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          TU MEJOR <br />
          {/* Texto con Gradiente Dorado */}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold">
            VERSIÓN
          </span>
        </h1>

        {/* Párrafo descriptivo */}
        <p className="text-txt-secondary text-lg md:text-xl mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed font-light">
          Más que un corte, una experiencia. Recupera tu confianza con nuestros maestros barberos en un ambiente exclusivo y privado.
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
    </section>
  );
};

export default Hero;