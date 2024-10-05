import React, { useState, useEffect, FormEvent } from 'react';

const ProductReg: React.FC = () => {
  const [productName, setProductName] = useState<string>('');
  const [ingredientName, setIngredientName] = useState<string>('');
  const [ingredientLocation, setIngredientLocation] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [companyLocation, setCompanyLocation] = useState<string>('');
  const [uniqueCode, setUniqueCode] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Fetch company details from the backend (assuming user data is available in session or JWT)
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch('http://localhost/IFP%20Tracking%20System/Product%20block%20chain%20v2/get_company_details.php');
        const data = await response.json();
        if (data.success) {
          setCompanyName(data.companyName);
          setCompanyLocation(data.companyLocation);
        } else {
          setMessage(`Error: ${data.error}`);
        }
      } catch (error) {
        setMessage('Error fetching company details');
      }
    };

    fetchCompanyDetails();
  }, []);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Convert ingredientData to a string format
    const ingredientDataString = `Ingredient: ${ingredientName}, Location: ${ingredientLocation}`;

    // Prepare data to be sent to the blockchain API
    const formData = {
      name: productName,
      ingredientData: ingredientDataString, // Send as a formatted string
      producerDetails: `${companyName}:${companyLocation}`, // Company info
    };

    try {
      const response = await fetch('http://localhost:5000/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Product registered successfully!');
        setUniqueCode(data.uniqueCode || 'No unique code received'); // Show unique code if returned
        // Clear form fields
        setProductName('');
        setIngredientName('');
        setIngredientLocation('');
      } else {
        setMessage(`Error: ${data.error || 'Unable to register product'}`);
      }
    } catch (error) {
      setMessage('An error occurred while registering the product.');
    }
  };

  return (
    <div>
      <h1>Product Registration</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Ingredient Name:</label>
          <input
            type="text"
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Ingredient Location:</label>
          <input
            type="text"
            value={ingredientLocation}
            onChange={(e) => setIngredientLocation(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register Product</button>
      </form>

      {message && <p>{message}</p>}
      {uniqueCode && <p>Unique Code: {uniqueCode}</p>}
    </div>
  );
};

export default ProductReg;
