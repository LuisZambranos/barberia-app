import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./ui/context/AuthContext";
import { BookingProvider } from "./ui/context/BookingContext";
import { ToastProvider } from "./ui/context/ToastContext"; // <-- IMPORTAMOS EL TOAST PROVIDER
import ProtectedRoute from "./ui/components/ProtectedRoute";
import Layout from "./ui/components/Layout";
import Home from "./ui/pages/Home";
import Booking from "./ui/pages/Booking";
import Login from "./ui/pages/Login"; 
import Admin from "./ui/pages/Admin";
import BarberPage from "./ui/pages/BarberPage";
import NotFound from "./ui/pages/NotFound";
import NotificationController from './ui/components/NotificationController';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        {/* ENVOLVEMOS LA APP CON EL TOAST PROVIDER */}
        <ToastProvider> 
          <BrowserRouter>
            
            {/* EL CONTROLADOR VA AQUÍ, SIEMPRE VIVO Y ESCUCHANDO */}
            <NotificationController /> 

            <Routes>
              <Route element={<Layout />}>
                
                {/* Rutas Públicas */}
                <Route path="/" element={<Home />}/>
                <Route path="login" element={<Login />}/>
                
                {/* Rutas Protegidas */}
                <Route element={<ProtectedRoute allowedRoles={['client', 'admin', 'barber']} />}>
                  <Route path="book" element={<Booking />}/>
                </Route>

                {/* Rutas de Staff */}
                <Route element={<ProtectedRoute allowedRoles={['barber', 'admin']} />}>
                  <Route path="/barber" element={<BarberPage />} />
                </Route>

                {/* Panel de Admins */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>

              </Route>

              {/* Ruta 404 global */}
              <Route path="*" element={<NotFound />} />
            </Routes>

          </BrowserRouter>
        </ToastProvider>
      </BookingProvider>
    </AuthProvider>
  )
}

export default App;