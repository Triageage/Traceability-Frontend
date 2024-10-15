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
  const [isLoading, setIsLoading] = useState<boolean>(false); // New loading state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false); // State to track if form was submitted
  const qrCodeRef = useRef<HTMLDivElement>(null);

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
    setIsLoading(true); // Show loading message
    setIsSubmitted(true); // Hide the form

    const hasValidIngredient = ingredients.some(
      (ingredient) => ingredient.name.trim() !== '' && ingredient.location.trim() !== ''
    );

    if (!hasValidIngredient) {
      setMessage('Please provide at least one ingredient name and location.');
      setIsLoading(false); // Stop loading if validation fails
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
      } else {
        setMessage(`Error: ${data.error || 'Unable to register product'}`);
      }
    } catch (error) {
      setMessage('An error occurred while registering the product.');
    } finally {
      setIsLoading(false); // Hide loading message
    }
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
      
      {/* Conditional rendering for loading, form, and result */}
      {isLoading ? (
        <p>Loading... Please wait.</p>
      ) : isSubmitted ? (
        <div>
          {uniqueCode && (
            <div>
              <p>Product registered successfully!</p>
              <p>Unique Code: {uniqueCode}</p>
              <div ref={qrCodeRef} id="Container">
                <QRCode value={uniqueCode} />
              </div>
              <button onClick={handleCopyQRCode}>Copy QR Code</button>
            </div>
          )}
        </div>
      ) : (
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
                onChange={(e) => setIngredients(prevIngredients => {
                  const newIngredients = [...prevIngredients];
                  newIngredients[index].name = e.target.value;
                  return newIngredients;
                })}
                required
              />
              <label>Ingredient Location:</label>
              <input
                type="text"
                value={ingredient.location}
                onChange={(e) => setIngredients(prevIngredients => {
                  const newIngredients = [...prevIngredients];
                  newIngredients[index].location = e.target.value;
                  return newIngredients;
                })}
                required
              />
            </div>
          ))}

          <button type="submit">Register Product</button>
        </form>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default ProductReg;
