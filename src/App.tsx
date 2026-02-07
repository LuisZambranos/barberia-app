import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Login from "./pages/Login"; 
import Admin from "./pages/Admin";

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
          </Route>


        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;