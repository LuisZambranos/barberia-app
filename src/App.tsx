import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

//import our componets
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Booking from "./pages/Booking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Parent Route: Uses the layout */}
        <Route path="/" element={<Layout />}>
          
          {/* Index Route: This loads when the path is exactly "/" */}
          <Route index element={<Home />}/>

          {/* Booking Route: Loads when path is "/book" */}
          <Route path="book" element={<Booking />}/>

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;