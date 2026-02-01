import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Login from "./pages/Login"; // <--- 1. Importa el componente

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />}/>
            <Route path="book" element={<Booking />}/>
            
            {/* 2. Agrega la ruta para el login */}
            <Route path="login" element={<Login />}/> 

          </Route>
        </Routes>
      </BrowserRouter>
  )
}

export default App;