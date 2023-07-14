import React from 'react';
import { useStore } from '../store/store';
import styles from './RecipePage.module.css';

const RecipePage = ({ recipeId, handleGoBack }) => {
  const { recipes } = useStore();

  const recipe = recipes.find(recipe => recipe.id === recipeId);

  if (!recipe) {
    return null;
  }

  const ingredientsList = recipe.ingredients.malt.map(malt => (
    <li key={malt.name}>
      {malt.name} - {malt.amount.value} {malt.amount.unit}
    </li>
  ));

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={handleGoBack}>
        Go Back
      </button>
      <h3 className={styles.recipeName}>{recipe.name}</h3>
      <div className={styles.imageContainer}>
        <img
          className={styles.recipeImage}
          src={recipe.image_url}
          alt={recipe.name}
        />
      </div>
      <ul className={styles.ingredientsList}>{ingredientsList}</ul>
      <div className={styles.recipeInfo}>
        <span>ABV: {recipe.abv}%</span>
        <span>IBU: {recipe.ibu}</span>
      </div>
    </div>
  );
};

export default RecipePage;
