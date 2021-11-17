import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./components/views/LandingPage/LandingPage.js";

import LoginPage from "./components/views/LoginPage/LoginPage.js";

import RegisterPage from "./components/views/RegisterPage/RegisterPage.js";



function App() {
   return (
      <Router>
         <div>
            <Routes>
            <Route exact path="/" element={<LandingPage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/register" element={<RegisterPage />} />
            </Routes>
         </div>
      </Router>
   );
}

export default App;