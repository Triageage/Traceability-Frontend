import React, { useState, useEffect, FormEvent, useRef } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

const ProductReg: React.FC = () => {
  const navigate = useNavigate();
  const [productName, setProductName] = useState<string>('');
  const [ingredients, setIngredients] = useState<{ name: string; location: string }[]>([
    { name: '', location: '' },
  ]);
  const [companyName, setCompanyName] = useState<string>('');
  const [companyLocation, setCompanyLocation] = useState<string>('');
  const [uniqueCode, setUniqueCode] = useState<string>(''); 
  const [message, setMessage] = useState<string>('');
  const qrCodeRef = useRef<HTMLDivElement>(null); // Ref for QR code container

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const data = localStorage.getItem('data');
        if (data) {
          const parsedData = JSON.parse(data);
          setCompanyName(parsedData.company_name);
          setCompanyLocation(parsedData.company_location);
        } else {
          setMessage('Error: Company data not found.');
        }
      } catch (error) {
        console.error(error);
        setMessage('Error fetching company details.');
      }
    };

    fetchCompanyDetails();
  }, []);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const hasValidIngredient = ingredients.some(
      (ingredient) => ingredient.name.trim() !== '' && ingredient.location.trim() !== ''
    );

    if (!hasValidIngredient) {
      setMessage('Please provide at least one ingredient name and location.');
      return;
    }

    const ingredientDataString = `[${ingredients
      .map((ingredient) => `${ingredient.name}:${ingredient.location}`)
      .join(',')}]`;

    const formData = {
      name: productName,
      ingredientData: ingredientDataString,
      producerDetails: `[${companyName}:${companyLocation}]`,
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
        setUniqueCode(data.productCode || 'No unique code received');
        setProductName('');
        setIngredients([{ name: '', location: '' }]);
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

  const handleIngredientChange = (index: number, field: 'name' | 'location', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleLogout = () => {
    localStorage.removeItem('data');
    navigate('/Login');
  };

  const handleCopyQRCode = () => {
    if (qrCodeRef.current) {
      const svgElement = qrCodeRef.current.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        const svgSize = svgElement.getBoundingClientRect();
        canvas.width = svgSize.width;
        canvas.height = svgSize.height;

        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const clipboardItem = new ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([clipboardItem]).then(() => {
                setMessage('QR code copied to clipboard!');
              }).catch(() => {
                setMessage('Failed to copy QR code.');
              });
            }
          });
        };

        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
      }
    }
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
            {ingredients.length > 1 && (
              <button type="button" onClick={() => handleRemoveIngredient(index)}>Remove</button>
            )}
          </div>
        ))}

        <button type="button" onClick={handleAddIngredient}>Add Ingredient</button>
        <button type="submit">Register Product</button>
      </form>

      {message && <p>{message}</p>}
      
      {uniqueCode && (
        <div>
          <p>Unique Code: {uniqueCode}</p>
          <div ref={qrCodeRef} id="Container">
            <QRCode value={uniqueCode} />
          </div>
          <button onClick={handleCopyQRCode}>Copy QR Code</button>
        </div>
      )}
    </div>
  );
};

export default ProductReg;
