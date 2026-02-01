import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Booking from "./pages/Booking";


function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />}/>
            <Route path="book" element={<Booking />}/>

          </Route>
        </Routes>
      </BrowserRouter>
  )
}

export default App;