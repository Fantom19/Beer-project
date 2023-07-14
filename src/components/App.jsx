import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useStore } from '../store/store';
import './App.css';
import RecipePage from './RecipePage';

const App = () => {
  const {
    recipes,
    selectedRecipes,
    addRecipes,
    selectRecipe,
    deselectRecipe,
    deleteSelectedRecipes,
  } = useStore();
  const [page] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [visibleRecipes, setVisibleRecipes] = useState([]);

  const containerRef = useRef(null);
  const previousScrollTop = useRef(0);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.punkapi.com/v2/beers?page=${page}`
      );
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        fetchRecipes();
        return;
      }
      const data = await response.json();
      addRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, addRecipes]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    const slicedRecipes = recipes.slice(0, 15);
    setVisibleRecipes(slicedRecipes);
  }, [recipes]);

  const handleRecipeClick = useCallback(recipeId => {
    setSelectedRecipeId(recipeId);
    previousScrollTop.current = containerRef.current.scrollTop;
  }, []);

  const handleRecipeRightClick = useCallback(
    (event, recipeId) => {
      event.preventDefault();
      if (selectedRecipes.has(recipeId)) {
        deselectRecipe(recipeId);
      } else {
        selectRecipe(recipeId);
      }
    },
    [selectedRecipes, deselectRecipe, selectRecipe]
  );

  const handleDeleteClick = useCallback(() => {
    deleteSelectedRecipes();

    setVisibleRecipes(prevRecipes => {
      const updatedRecipes = prevRecipes.filter(
        recipe => !selectedRecipes.has(recipe.id)
      );
      return updatedRecipes;
    });

    setSelectedRecipeId(null);
  }, [deleteSelectedRecipes, selectedRecipes]);

  const handleScroll = useCallback(() => {
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight) {
      const nextSliceIndex = visibleRecipes.length;
      const nextSlice = recipes.slice(nextSliceIndex, nextSliceIndex + 5);
      setVisibleRecipes(prevRecipes => [...prevRecipes, ...nextSlice]);
    }
  }, [recipes, visibleRecipes]);

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    container.scrollTop = previousScrollTop.current;

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    containerRef.current.scrollTop = previousScrollTop.current;
  }, [selectedRecipeId]);

  return (
    <div
      style={{ height: '100vh', overflow: 'auto' }}
      ref={containerRef}
      id="recipe-container"
    >
      <div className="app-header">
        <span>Beer Recipe</span>
        {selectedRecipes.size > 0 && selectedRecipeId === null && (
          <button className="delete-button" onClick={handleDeleteClick}>
            Delete
          </button>
        )}
      </div>
      {selectedRecipeId ? (
        <RecipePage
          recipeId={selectedRecipeId}
          handleGoBack={() => setSelectedRecipeId(null)}
        />
      ) : (
        <div className="card-container">
          {visibleRecipes.map((recipe, index) => (
            <div
              key={`${recipe.id}-${index}`}
              onClick={() => handleRecipeClick(recipe.id)}
              onContextMenu={event => handleRecipeRightClick(event, recipe.id)}
              className={`recipe-card ${
                selectedRecipes.has(recipe.id) ? 'selected-recipe' : ''
              }`}
            >
              <h3>{recipe.name}</h3>
              <div className="image-container">
                <img
                  className="recipe-image"
                  src={recipe.image_url}
                  alt={recipe.name}
                />
              </div>
              <p>{recipe.description}</p>
              <div className="recipe-info">
                <span>ABV: {recipe.abv}%</span>
                <span>IBU: {recipe.ibu}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>Loading...</div>
      )}
    </div>
  );
};

export default App;
