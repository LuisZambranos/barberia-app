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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Al poner Login dentro de Layout, heredará el NavBar y Footer */}
          <Route element={<Layout />}>
            
            {/* Rutas Públicas / Generales */}
            <Route path="/" element={<Home />}/>
            <Route path="login" element={<Login />}/>
            
           {/* Rutas Protegidas (Solo usuarios logueados pueden reservar) */}
            <Route element={<ProtectedRoute allowedRoles={['client', 'admin', 'barber']} />}>
              <Route path="book" element={<Booking />}/>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Rutas Protegidas (Solo usuarios barber y admin pueden ver panel) */}
            <Route element={<ProtectedRoute allowedRoles={['barber', 'admin']} />}>
                <Route path="/barber" element={<BarberPage />} />
            </Route>
          </Route>

          

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;