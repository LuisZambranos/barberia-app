import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa6';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-bg-main border-t border-txt-muted/10 pt-16 pb-8 px-4 md:px-8 mt-auto relative overflow-hidden">
      {/* Brillo de fondo dinámico usando la variable gold */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gold/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
          
          {/* Logo y Descripción */}
          <div className="text-center md:text-left max-w-sm">
            <Link to="/" className="inline-block mb-4">
              <h2 className="text-2xl font-black text-txt-main tracking-widest uppercase">
                A&J <span className="text-gold">Studio</span>
              </h2>
            </Link>
            <p className="text-txt-muted text-sm leading-relaxed">
              Elevando el estándar de la barbería clásica y moderna. Tu imagen es nuestra obra maestra.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div className="hidden md:flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] text-txt-secondary uppercase tracking-[0.2em] font-bold mb-2">Secciones</p>
            <a href="#servicios" onClick={(e) => handleNavClick(e, '#servicios')} className="text-txt-muted hover:text-gold text-sm transition-colors">Servicios</a>
            <a href="#barberos" onClick={(e) => handleNavClick(e, '#barberos')} className="text-txt-muted hover:text-gold text-sm transition-colors">Equipo</a>
            <a href="#local" onClick={(e) => handleNavClick(e, '#local')} className="text-txt-muted hover:text-gold text-sm transition-colors">Local</a>
            <a href="#galeria" onClick={(e) => handleNavClick(e, '#galeria')} className="text-txt-muted hover:text-gold text-sm transition-colors">Galería</a>
            <a href="#ubicacion" onClick={(e) => handleNavClick(e, '#ubicacion')} className="text-txt-muted hover:text-gold text-sm transition-colors">Ubicación</a>
          </div>

          {/* Redes Sociales */}
          <div className="flex flex-col items-center md:items-end">
            <p className="text-[10px] text-txt-secondary uppercase tracking-[0.2em] font-bold mb-4">
              Síguenos en nuestras redes
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/ajstudio.cl?igsh=dnVmMmU4YTgyNDZ1&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-txt-muted/20 bg-bg-card/50 flex items-center justify-center text-txt-main/70 hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-all duration-300 hover:-translate-y-1"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-txt-muted/20 bg-bg-card/50 flex items-center justify-center text-txt-main/70 hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-all duration-300 hover:-translate-y-1"
                aria-label="Facebook"
              >
                <FaFacebookF size={18} />
              </a>
              <a 
                href="https://www.tiktok.com/@ajstudio.cl?_r=1&_t=ZS-95UWwSOE1CO" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-txt-muted/20 bg-bg-card/50 flex items-center justify-center text-txt-main/70 hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-all duration-300 hover:-translate-y-1"
                aria-label="TikTok"
              >
                <FaTiktok size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* Línea Separadora y Copyright */}
        <div className="border-t border-txt-muted/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-txt-muted flex gap-4">
            <span>&copy; {currentYear} A&J Studio. Todos los derechos reservados.</span>
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacidad</Link>
          </p>
          
          <p className="text-[10px] text-txt-secondary tracking-widest uppercase flex items-center gap-1">
            Desarrollado por <a href="https://excalix-code.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-gold font-bold hover:underline">Excalix Code</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;