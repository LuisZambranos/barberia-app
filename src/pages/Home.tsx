import Hero from '../components/Hero'; // Importamos el componente que acabamos de crear
import Services from '../components/Services';
import Team from '../components/Team';
import LocationSection from '../components/LocationSection';

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
    </div>
  );
};

export default Home;