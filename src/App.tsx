import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import ProductReg from "./ProductReg";
import QRCodePage from "./QRCodePage";
import CustPage from "./CustPage";
import HomePage from "./HomePage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route for Login Page */}
        <Route path="/Login" element={<Login />} />

        <Route path="/" element={<HomePage />} />

        {/* Route for Signup Page */}
        <Route path="/signup" element={<Signup />} />

        {/* Route for Product Registration Page */}
        <Route path="/ProductReg" element={<ProductReg />} />

        {/* Route for QR Code Page */}
        <Route path="/QRCodePage" element={<QRCodePage />} />

        <Route path="/CustPage" element={<CustPage />} />
        
      </Routes>
    </Router>
  );
};

export default App;
