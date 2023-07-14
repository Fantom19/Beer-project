// store.js
import create from 'zustand';

export const useStore = create(set => ({
  recipes: [],
  selectedRecipes: new Set(),
  addRecipes: newRecipes =>
    set(state => ({ recipes: [...state.recipes, ...newRecipes] })),
  selectRecipe: recipeId =>
    set(state => {
      const selectedRecipes = new Set(state.selectedRecipes);
      selectedRecipes.add(recipeId);
      return { selectedRecipes };
    }),
  deselectRecipe: recipeId =>
    set(state => {
      const selectedRecipes = new Set(state.selectedRecipes);
      selectedRecipes.delete(recipeId);
      return { selectedRecipes };
    }),
  deleteSelectedRecipes: () =>
    set(state => {
      const updatedRecipes = state.recipes.filter(
        recipe => !state.selectedRecipes.has(recipe.id)
      );
      return {
        recipes: updatedRecipes,
        selectedRecipes: new Set(),
      };
    }),
}));
