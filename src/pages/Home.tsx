import Hero from '../components/Hero'; // Importamos el componente que acabamos de crear
import Services from '../components/Services';
import Team from '../components/Team';

const Home = () => {
  return (
    <div className="w-full">
      {/* 1 Sección Hero (Portada) */}
      <Hero />

      {/* 2 Sección Servicios (Contenido) */}
      <Services />

      {/* 3 Sección Equipo (Contenido) */}
      <Team />
    </div>
  );
};

export default Home;