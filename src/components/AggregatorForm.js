import React, { useState } from 'react';

function AggregatorForm() {
  const [ingredients, setIngredients] = useState([{ name: '', location: '' }]);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', location: '' }]);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(ingredients);
  };


<form onSubmit={handleSubmit}>
  {ingredients.map((ingredient, index) => (
    <div key={index}>
      <input
        type="text"
        value={ingredient.name}
        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
        placeholder="Ingredient name"
      />
      <input
        type="text"
        value={ingredient.location}
        onChange={(e) => handleIngredientChange(index, 'location', e.target.value)}
        placeholder="Location"
      />
      <button type="button" onClick={() => handleRemoveIngredient(index)}>-</button>
    </div>
  ))}
  <button type="button" onClick={handleAddIngredient}>+</button>
  <button type="submit">Submit</button>
</form>
