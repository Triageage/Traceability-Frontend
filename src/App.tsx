import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import ProductReg from "./ProductReg";
import QRCodePage from "./QRCodePage";
import Page from "./page";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route for Login Page */}
        <Route path="/" element={<Login />} />

        {/* Route for Signup Page */}
        <Route path="/signup" element={<Signup />} />

        {/* Route for Product Registration Page */}
        <Route path="/ProductReg" element={<ProductReg />} />

        {/* Route for QR Code Page */}
        <Route path="/QRCodePage" element={<QRCodePage />} />

        <Route path="/page" element={<Page />} />
        
      </Routes>
    </Router>
  );
};

export default App;
