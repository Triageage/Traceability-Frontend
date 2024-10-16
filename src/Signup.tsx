import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [companyLocation, setCompanyLocation] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    const formData = {
      name,
      email,
      password,
      role,
      company_name: companyName,
      company_location: companyLocation,
    };

    try {
      const response = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Signup successful!');
        // Clear the form
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
        setCompanyName('');
        setCompanyLocation('');
      } else {
        setMessage(`Signup failed: ${data.message}`);
      }
    } catch (error) {
      setMessage('An error occurred during signup.');
    }
  };

  // Function to navigate back to login page
  const handleBackToLogin = () => {
    navigate("/login"); // Assuming the login page route is "/login"
  };

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={handleSignup}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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

        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="ingredient aggregator">Ingredient Aggregator</option>
            <option value="Manufacturer">Manufacturer</option>
            <option value="Distributor">Distributor</option>
            <option value="Retailer">Retailer</option>
          </select>
        </div>

        <div>
          <label>Company Name:</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Company Location:</label>
          <input
            type="text"
            value={companyLocation}
            onChange={(e) => setCompanyLocation(e.target.value)}
            required
          />
        </div>

        <button type="submit">Sign Up</button>
      </form>

      {message && <p>{message}</p>}

      {/* Back to Login button */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleBackToLogin}>Back to Login</button>
      </div>
    </div>
  );
};

export default Signup;
