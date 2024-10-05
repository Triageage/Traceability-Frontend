import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost/IFP%20Tracking%20System/Product%20block%20chain%20v2/process_login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Redirect based on role
        if (data.redirect === "product_reg") {
          navigate("/product_reg");
        } else if (data.redirect === "qrcode") {
          navigate("/qrcode");
        }
      } else {
        setErrorMessage(data.error || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  // Function to navigate to signup page
  const handleSignup = () => {
    navigate("/signup"); // Navigates to the signup page
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* Signup button */}
      <div style={{ marginTop: "20px" }}>
        <p>Don't have an account?</p>
        <button onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
};

export default Login;
