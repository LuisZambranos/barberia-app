import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./ui/context/AuthContext";
import { BookingProvider } from "./ui/context/BookingContext"; // Importamos el nuevo cerebro
import ProtectedRoute from "./ui/components/ProtectedRoute";
import Layout from "./ui/components/Layout";
import Home from "./ui/pages/Home";
import Booking from "./ui/pages/Booking";
import Login from "./ui/pages/Login"; 
import Admin from "./ui/pages/Admin";
import BarberPage from "./ui/pages/BarberPage";
import NotFound from "./ui/pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              
              {/* Rutas Públicas */}
              <Route path="/" element={<Home />}/>
              <Route path="login" element={<Login />}/>
              
              {/* Rutas Protegidas (Cualquier logueado) */}
              <Route element={<ProtectedRoute allowedRoles={['client', 'admin', 'barber']} />}>
                <Route path="book" element={<Booking />}/>
              </Route>

              {/* Rutas de Staff (Barberos y Admins) */}
              <Route element={<ProtectedRoute allowedRoles={['barber', 'admin']} />}>
                <Route path="/barber" element={<BarberPage />} />
              </Route>

              {/* Panel de Admins (Solo Admins pueden ver) */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>

            </Route>

            {/* Ruta 404 global */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  )
}

export default App;