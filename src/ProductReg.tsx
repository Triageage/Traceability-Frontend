import React, { useState, useEffect, FormEvent } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead


const ProductReg: React.FC = () => {
  const navigate = useNavigate(); // Initialize navigate for navigation
  const [productName, setProductName] = useState<string>('');
  const [ingredients, setIngredients] = useState<{ name: string; location: string }[]>([
    { name: '', location: '' }, // Initialize with one ingredient
  ]);
  const [companyName, setCompanyName] = useState<string>('');
  const [companyLocation, setCompanyLocation] = useState<string>('');
  const [uniqueCode, setUniqueCode] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Fetch company details from the backend (assuming user data is available in session or JWT)
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const data = localStorage.getItem("data");

        if (data) {
          let res = JSON.parse(data);
          setCompanyName(res.company_name);
          setCompanyLocation(res.company_location);
        } else {
          setMessage(`Error`);
        }
      } catch (error) {
        console.log(error);
        setMessage('Error fetching company details');
      }
    };

    fetchCompanyDetails();
  }, []);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check if at least one ingredient is provided
    const hasValidIngredient = ingredients.some(
      ingredient => ingredient.name.trim() !== '' && ingredient.location.trim() !== ''
    );

    if (!hasValidIngredient) {
      setMessage('Please provide at least one ingredient name and location.');
      return; // Exit the function if validation fails
    }

    // Convert ingredientData to a string format
    let ingredientDataString = ingredients.map(ingredient => `${ingredient.name}:${ingredient.location}`).join(',');
    ingredientDataString = "["+ ingredientDataString +"]";

    // Prepare data to be sent to the blockchain API
    const formData = {
      name: productName,
      ingredientData: ingredientDataString, // Send as a formatted string
      producerDetails: `[${companyName}:${companyLocation}]`, // Company info
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
        setUniqueCode(data.productCode || 'No unique code received'); // Show unique code if returned
        // Clear form fields
        setProductName('');
        setIngredients([{ name: '', location: '' }]); // Reset to one ingredient
      } else {
        setMessage(`Error: ${data.error || 'Unable to register product'}`);
      }
    } catch (error) {
      setMessage('An error occurred while registering the product.');
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', location: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  // Use a union type for the field parameter
  const handleIngredientChange = (index: number, field: 'name' | 'location', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value; // No error here
    setIngredients(newIngredients);
  };

  // Logout handler
  const handleLogout = () => {
    // Clear any session data if needed
    localStorage.removeItem("data"); // Optional: Clear stored data
    navigate('/'); // Redirect to login page using useNavigate
  };

  return (
    <div>
      <button onClick={handleLogout} style={{ float: 'right', margin: '10px' }}>Logout</button>
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

        {ingredients.map((ingredient, index) => (
          <div key={index}>
            <label>Ingredient Name:</label>
            <input
              type="text"
              value={ingredient.name}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              required
            />
            <label>Ingredient Location:</label>
            <input
              type="text"
              value={ingredient.location}
              onChange={(e) => handleIngredientChange(index, 'location', e.target.value)}
              required
            />
            {ingredients.length > 1 && ( // Show remove button only if there's more than one ingredient
              <button type="button" onClick={() => handleRemoveIngredient(index)}>Remove</button>
            )}
          </div>
        ))}

        <button type="button" onClick={handleAddIngredient}>Add Ingredient</button>
        <button type="submit">Register Product</button>
      </form>

      {message && <p>{message}</p>}
      {uniqueCode && <p>Unique Code: {uniqueCode}</p>}
    </div>
  );
};

export default ProductReg;
