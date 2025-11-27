import React from 'react';
import Hero from '../components/Hero'; // Importamos el componente que acabamos de crear

const Home = () => {
  return (
    <div className="w-full">
      {/* Sección Hero (Portada) */}
      <Hero />

      {/* Aquí irán las siguientes secciones (Servicios, Equipo, etc.) */}
      <section id="servicios" className="py-20 bg-bg-main text-center">
        <h2 className="text-white text-3xl">Próximamente: Servicios</h2>
      </section>
    </div>
  );
};

export default Home;