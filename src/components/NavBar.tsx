import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para menú móvil

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-bg-main/95 backdrop-blur-sm border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO (Texto o Imagen) */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-widest text-white">
              LA <span className="text-gold">PIEDAD</span>
            </Link>
          </div>

          {/* MENÚ ESCRITORIO (Hidden en móvil) */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-txt-main hover:text-gold transition-colors text-sm uppercase tracking-wide font-medium">Inicio</Link>
            <a href="#servicios" className="text-txt-main hover:text-gold transition-colors text-sm uppercase tracking-wide font-medium">Servicios</a>
            <a href="#barberos" className="text-txt-main hover:text-gold transition-colors text-sm uppercase tracking-wide font-medium">Equipo</a>
            
            {/* CTA PRINCIPAL */}
            <Link 
              to="/book" 
              className="bg-gold hover:bg-gold-hover text-black px-6 py-2 rounded-sm font-bold uppercase tracking-wider text-sm transition-all transform hover:scale-105"
            >
              Reservar Cita
            </Link>
          </nav>

          {/* BOTÓN MENÚ MÓVIL (Hamburguesa) */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-txt-main hover:text-gold p-2 focus:outline-none"
            >
              <span className="sr-only">Abrir menú</span>
              {/* Icono Hamburguesa / X */}
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isOpen && (
        <div className="md:hidden bg-bg-card border-t border-white/10 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center py-4">
            <Link to="/" className="text-txt-main hover:text-gold block px-3 py-2 text-base font-medium" onClick={() => setIsOpen(false)}>INICIO</Link>
            <a href="#servicios" className="text-txt-main hover:text-gold block px-3 py-2 text-base font-medium" onClick={() => setIsOpen(false)}>SERVICIOS</a>
            <a href="#barberos" className="text-txt-main hover:text-gold block px-3 py-2 text-base font-medium" onClick={() => setIsOpen(false)}>EQUIPO</a>
            <Link to="/book" className="mt-4 w-full text-center bg-gold text-black px-4 py-3 rounded-sm font-bold" onClick={() => setIsOpen(false)}>
              RESERVAR AHORA
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;