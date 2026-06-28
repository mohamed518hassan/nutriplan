// appState.js
export const appState = {
  meals: [],
  categories: [],
  currentMeal: null,
  foodLog: JSON.parse(
    localStorage.getItem("foodLog")
  ) || [],
};