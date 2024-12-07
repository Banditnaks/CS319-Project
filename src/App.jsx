import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Rooms from "./components/Rooms";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* เส้นทางการนำทาง */}
        <Route path="/" element={<Login />} /> {/* หน้า Login */}
        <Route path="/rooms" element={<Rooms />} /> {/* หน้า Rooms */}
      </Routes>
    </Router>
  );
};

export default App;
