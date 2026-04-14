import { Outlet, useLocation } from "react-router-dom";
// Ajusta las rutas de tus importaciones según tu estructura
import Navbar from "./NavBar"; 
import Footer from "./Footer";

function Layout() {
  const location = useLocation();

  // Definimos en qué rutas exactas NO queremos que aparezca el footer
  const hideFooterRoutes = ["/admin", "/barber"];
  
  // Verificamos si la ruta actual empieza con alguna de las rutas bloqueadas
  // (usamos startsWith por si luego tienes rutas como /barber/settings)
  const showFooter = !hideFooterRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="grow">
        <Outlet />
      </main>

      {/* El Footer solo se renderiza si showFooter es true */}
      {showFooter && <Footer />}
    </div>
  );
}

export default Layout;