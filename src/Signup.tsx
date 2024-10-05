import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const Signup: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>(''); // Dropdown for roles
  const [companyName, setCompanyName] = useState<string>('');
  const [companyLocation, setCompanyLocation] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    // Prepare data for sending to the backend
    const formData = {
      name,
      email,
      password,
      role,
      company_name: companyName,
      company_location: companyLocation,
    };

    try {
      const response = await fetch(
        'http://localhost/IFP%20Tracking%20System/Product%20block%20chain%20v2/process_signup.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage('Signup successful!');
        // Clear form fields after successful signup
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
        setCompanyName('');
        setCompanyLocation('');
      } else {
        setMessage(`Signup failed: ${data.error}`);
      }
    } catch (error) {
      setMessage('An error occurred during signup.');
    }
  };

  const handleBack = () => {
    navigate('/'); // Redirect to login page
  };

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={handleSignup}>
        {/* Name Field */}
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Role Field */}
        <div>
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="ingredient aggregator">Ingredient Aggregator</option>
            <option value="Manufacturer">Manufacturer</option>
            <option value="Distributor">Distributor</option>
            <option value="Retailer">Retailer</option>
          </select>
        </div>

        {/* Company Name Field */}
        <div>
          <label>Company Name:</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>

        {/* Company Location Field */}
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

      {/* Back button */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleBack}>Back to Login</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Signup;
