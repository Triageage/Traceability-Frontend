import React from "react";
import { useNavigate } from "react-router-dom";
import './styles.css'; // Assuming you have a global stylesheet for custom styles

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/Login"); // Navigates to the Login page
  };

  const handleSignup = () => {
    navigate("/signup"); // Navigates to the Signup page
  };

  const handleTryNow = () => {
    navigate("/CustPage"); // Navigates to the Try Now page, assuming you meant the customer page (CustPage.tsx)
  };

  return (
    <div className="homepage-container">
      <div className="content">
        <h1>Blockchain-based Traceability & Authentication</h1>
        <p>
          Welcome to the Infant Food Products Traceability System. This project leverages blockchain technology to provide secure, transparent, and reliable tracking and authentication of infant food products from producer to consumer. Ensure the safety of your child's nutrition by verifying the entire product journey.
        </p>
        <div className="button-group">
          <button onClick={handleLogin} className="btn">Login</button>
          <button onClick={handleSignup} className="btn">Sign Up</button>
          <button onClick={handleTryNow} className="btn">Try Now</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
