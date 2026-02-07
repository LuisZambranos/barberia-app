import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    /* CONTENEDOR PRINCIPAL */
    <header className="fixed top-0 left-0 w-full z-50 bg-bg-main/95 backdrop-blur-sm border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGOTIPO */}
          <div className="shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-widest text-txt-main">
              BARBER <span className="text-gold">SHOP</span>
            </Link>
          </div>

            {/* NAVEGACIÓN ESCRITORIO  */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-txt-main hover:text-gold transition-colors text-sm uppercase tracking-wide font-medium">Inicio</Link>
            <a href="#servicios" className="text-txt-main hover:text-gold transition-colors text-sm uppercase tracking-wide font-medium">Servicios</a>
            <a href="#barberos" className="text-txt-main hover:text-gold transition-colors text-sm uppercase tracking-wide font-medium">Equipo</a>
            <a href="#ubicacion" className="text-txt-main hover:text-gold transition-colors text-sm uppercase tracking-wide font-medium">Ubicación</a>
            
            {/* GESTIÓN DE SESIÓN */ }
            {user ? (
              <button 
                onClick={handleLogout} 
                className="flex flex-col items-end text-right group cursor-pointer"
              >
                <span className="text-gold text-[10px] font-bold uppercase tracking-widest group-hover:text-txt-main transition-colors">
                  {role === 'client' ? 'Cliente' : role}
                </span> 
                <span className="text-txt-main text-xs font-medium group-hover:text-error transition-colors">
                  {user.email?.split('@')[0]} <span className="text-[9px] opacity-50 ml-1">(Salir)</span>
                </span>
              </button>
            ) : (
              <Link to="/login" className="text-txt-main hover:text-gold transition-colors text-sm uppercase tracking-wide font-medium">
                Iniciar Sesión
              </Link>
            )}

            {/* BOTÓN DE ACCIÓN: Visible si no hay usuario (anonimo) O si es cliente */}
            {(!user || role === 'client') && (
              <Link 
                to="/book" 
                className="bg-gold hover:bg-gold-hover text-bg-main px-6 py-2 rounded-sm font-bold uppercase tracking-wider text-sm transition-all transform hover:scale-105"
              >
                Reservar Cita
              </Link>
            )}
          </nav>

          {/* INTERRUPTOR MÓVIL */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-txt-main hover:text-gold p-2 focus:outline-none"
            >
              <span className="sr-only">Abrir menú</span>
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

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isOpen && (
        <div className="md:hidden bg-bg-card border-t border-white/10 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center py-4">
            <Link to="/" className="text-txt-main hover:text-gold block px-3 py-2 text-base font-medium" onClick={() => setIsOpen(false)}>INICIO</Link>
            <a href="#servicios" className="text-txt-main hover:text-gold block px-3 py-2 text-base font-medium" onClick={() => setIsOpen(false)}>SERVICIOS</a>
            <a href="#barberos" className="text-txt-main hover:text-gold block px-3 py-2 text-base font-medium" onClick={() => setIsOpen(false)}>EQUIPO</a>
            
            {/* BOTÓN DE ACCIÓN: Visible si no hay usuario (anonimo) O si es cliente */}
            {(!user || role === 'client') && (
              <Link 
                to="/book" 
                className="bg-gold hover:bg-gold-hover text-bg-main px-6 py-2 rounded-sm font-bold uppercase tracking-wider text-sm transition-all transform hover:scale-105"
              >
                Reservar Cita
              </Link>
            )}
            

            {/* ACCIONES DE SESIÓN MÓVIL */}
            {user ? (
              <button 
                onClick={() => { handleLogout(); setIsOpen(false); }} 
                className="text-error text-xs uppercase font-bold mt-4 border-t border-white/10 pt-4 w-full text-center"
              >
                Cerrar Sesión ({user.email?.split('@')[0]})
              </button>
            ) : (
              <Link to="/login" className="text-txt-main hover:text-gold block px-3 py-2 text-base font-medium" onClick={() => setIsOpen(false)}>INICIAR SESIÓN</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;