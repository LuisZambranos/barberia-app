import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    // CONTENEDOR PRINCIPAL
    // relative: Para que la capa oscura (overlay) se posicione sobre la imagen.
    // h-screen: Ocupa el 100% de la altura de la pantalla (impacto visual total).
    // flex items-center: Centra el contenido verticalmente.
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      
      {/* 1. IMAGEN DE FONDO 
          Usamos una imagen real de barbería premium.
          absolute inset-0: Estira la imagen para cubrir todo el contenedor.
          object-cover: Asegura que la imagen no se deforme.
      */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" 
          alt="Barbería Fondo" 
          className="w-full h-full object-cover"
        />
        {/* OVERLAY (Capa oscura)
            bg-bg-main/70: Usa nuestro color de fondo (azul oscuro) con 70% de opacidad.
            Esto hace que el texto blanco sea legible siempre.
        */}
        <div className="absolute inset-0 bg-bg-main/70"></div>
      </div>

      {/* 2. CONTENIDO (Texto y Botones) 
          z-10: Lo pone "encima" de la imagen y la capa oscura.
          text-center: En móvil todo centrado.
          md:text-left: En PC alineado a la izquierda (estilo más moderno).
      */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center md:text-left pt-20">
        
        {/* Subtítulo pequeño (Eyebrow) */}
        <p className="text-gold font-bold tracking-[0.2em] mb-4 uppercase text-sm md:text-base animate-fade-in-up">
          Estilo Clásico &bull; Cortes Modernos
        </p>

        {/* Título Principal */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight">
          TU MEJOR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">
            VERSIÓN
          </span>
        </h1>

        {/* Descripción */}
        <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
          Más que un corte, una experiencia. Recupera tu confianza con nuestros maestros barberos en un ambiente exclusivo.
        </p>

        {/* Botones de Acción (CTAs) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <Link 
            to="/book" 
            className="bg-gold hover:bg-gold-hover text-bg-main font-bold py-4 px-8 rounded-sm transition-all transform hover:scale-105 uppercase tracking-wider"
          >
            Reservar Ahora
          </Link>
          
          <a 
            href="#servicios" 
            className="border border-white/30 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-sm transition-all uppercase tracking-wider backdrop-blur-sm"
          >
            Ver Servicios
          </a>
        </div>

      </div>
    </section>
  );
};

export default Hero;