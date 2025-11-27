import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="w-full">
      
      {/* 1. HERO SECTION (La primera impresión) */}
      <section className="relative h-[80vh] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center">
        {/* Overlay oscuro para que el texto se lea bien sobre la imagen */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-gold font-bold tracking-[0.2em] mb-4 uppercase">Estilo Clásico &bull; Cortes Modernos</p>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            BARBERÍA <span className="text-gold">LA PIEDAD</span>
          </h1>
          <p className="text-txt-muted text-lg mb-8 max-w-2xl mx-auto">
            Más que un corte, una experiencia. Recupera tu mejor versión con nuestros maestros barberos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book" className="bg-gold hover:bg-gold-hover text-black font-bold py-4 px-8 rounded-md transition-colors text-lg">
              RESERVAR CITA
            </Link>
            <button className="border-2 border-white hover:bg-white hover:text-black text-white font-bold py-4 px-8 rounded-md transition-colors text-lg">
              VER SERVICIOS
            </button>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN DE SERVICIOS (Grid de Tarjetas) */}
      <section className="py-20 px-8 bg-bg-main">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-gold font-bold tracking-widest mb-2">NUESTROS SERVICIOS</h2>
            <h3 className="text-4xl font-bold text-txt-main">Calidad Premium</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tarjeta 1 */}
            <ServiceCard 
              title="Corte Clásico" 
              price="$15.000" 
              desc="Corte a tijera o máquina, lavado y peinado con productos premium." 
            />
            {/* Tarjeta 2 */}
            <ServiceCard 
              title="Barba & Ritual" 
              price="$12.000" 
              desc="Perfilado, toalla caliente, aceites esenciales y masaje facial." 
            />
            {/* Tarjeta 3 */}
            <ServiceCard 
              title="Servicio Completo" 
              price="$25.000" 
              desc="La experiencia total: Corte + Barba + Masaje + Bebida de cortesía." 
            />
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN BARBEROS (El Equipo) */}
      <section className="py-20 px-8 bg-bg-card">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-txt-main mb-12">Nuestros Maestros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Placeholders para barberos */}
            <BarberPlaceholder name="Carlos" role="Master Barber" />
            <BarberPlaceholder name="Andrés" role="Especialista en Barba" />
            <BarberPlaceholder name="Miguel" role="Estilista Moderno" />
            <BarberPlaceholder name="Juan" role="Aprendiz Avanzado" />
          </div>
        </div>
      </section>

      {/* 4. UBICACIÓN Y CONTACTO */}
      <section className="py-20 px-8 bg-bg-main">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2 text-left">
            <h2 className="text-4xl font-bold text-txt-main mb-6">Visítanos</h2>
            <p className="text-txt-muted mb-4">
              Estamos ubicados en el corazón de la ciudad. Ven a relajarte y salir renovado.
            </p>
            <ul className="space-y-4 text-lg">
              <li className="flex items-center gap-3">
                <span className="text-gold">📍</span> Av. Siempre Viva 123, Santiago
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gold">📞</span> +56 9 1234 5678
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gold">⏰</span> Lun - Sáb: 10:00 - 20:00
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/2 h-80 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
            <p className="text-txt-muted">Mapa de Google se cargará aquí</p>
          </div>
        </div>
      </section>

    </div>
  );
};

// --- COMPONENTES INTERNOS PARA LA MAQUETA (Luego los moveremos a archivos separados) ---

const ServiceCard = ({ title, price, desc }: { title: string, price: string, desc: string }) => (
  <div className="bg-bg-card p-8 rounded-lg border border-gray-800 hover:border-gold transition-colors text-left group">
    <div className="flex justify-between items-baseline mb-4">
      <h4 className="text-xl font-bold text-txt-main group-hover:text-gold transition-colors">{title}</h4>
      <span className="text-gold font-bold text-lg">{price}</span>
    </div>
    <p className="text-txt-muted text-sm leading-relaxed">{desc}</p>
  </div>
);

const BarberPlaceholder = ({ name, role }: { name: string, role: string }) => (
  <div className="group">
    <div className="h-64 bg-gray-700 rounded-lg mb-4 overflow-hidden relative">
      {/* Aquí iría la foto real */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
    </div>
    <h4 className="text-lg font-bold text-txt-main">{name}</h4>
    <p className="text-gold text-sm">{role}</p>
  </div>
);

export default Home;