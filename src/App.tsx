import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Login from "./pages/Login"; 
import Admin from "./pages/Admin";
import BarberPage from "./pages/BarberPage";
import NotFound from "./pages/NotFound";

// ... (Tus importaciones arriba)

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

export default App;