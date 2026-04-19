import Hero from '../components/Hero'; // Importamos el componente que acabamos de crear
import Services from '../components/Services';
import Team from '../components/Team';
import LocationSection from '../components/LocationSection';
import HaircutsGallery from '../components/HaircutsGallery';
import LocalGallery from '../components/LocalGallery';

const Home = () => {
  return (
    <div className="w-full">
      {/* 1 Sección Hero (Portada) */}
      <Hero />

      {/* 2 Sección Servicios (Contenido) */}
      <Services />
      
      {/* <ServicesCarousel /> */}

      {/* 3 Sección Equipo (Contenido) */}
      <Team />

      {/* 4 Sección Ubicación (Contenido) */} 
      <LocationSection />

      {/* 5 Sección Galería del Local */}
      <div id="local" className="scroll-mt-20">
        <LocalGallery />
      </div>

      {/* 6 Sección Galería de Cortes */}
      <div id="galeria" className="scroll-mt-20">
        <HaircutsGallery />
      </div>


    </div>
  );
};

export default Home;