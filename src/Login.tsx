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
        "http://localhost:3000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      // Ensure the response is valid JSON
      const data = await response.json();

      // Check for successful response
      if (response.ok && data.valid) {
        const role = data.data[0].role;
        localStorage.setItem("data", JSON.stringify(data.data[0]));
        console.log(data.data[0]);

        if (role === "ingredient aggregator") {
          navigate("/ProductReg");
        } else {
          navigate("/QRCodePage");
        }
      } else {
        setErrorMessage("Invalid Login Credentials! Please try again...");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  // Function to navigate to signup page
  const handleSignup = () => {
    navigate("/signup");
  };

  // Function to navigate to homepage
  const handleHome = () => {
    navigate("/"); // Assuming the homepage route is "/"
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

      {/* Signup and Home buttons */}
      <div style={{ marginTop: "20px" }}>
        <p>Don't have an account?</p>
        <button onClick={handleSignup}>Sign Up</button>
      </div>
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleHome}>Home</button>
      </div>
    </div>
  );
};

export default Login;
