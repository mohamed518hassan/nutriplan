
// src/js/api/mealdb.js
const BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const OFF_BASE_URL = "https://world.openfoodfacts.org";

export async function getCategories() {
  const response = await fetch(`${BASE_URL}/categories.php`);
  const data = await response.json();
  return data.categories;
}

export async function searchMeals(search = "") {
  const response = await fetch(`${BASE_URL}/search.php?s=${search}`);
  const data = await response.json();
  return data.meals || [];
}

export async function getMealsByCategory(category) {
  const response = await fetch(`${BASE_URL}/filter.php?c=${category}`);
  const data = await response.json();
  return data.meals || [];
}

export async function getMealsByArea(area) {
  const response = await fetch(`${BASE_URL}/filter.php?a=${area}`);
  const data = await response.json();
  return data.meals || [];
}

export async function getMealById(id) {
  const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const data = await response.json();
  return data.meals?.[0];
}

export async function getRandomMeal() {
  const response = await fetch(`${BASE_URL}/random.php`);
  const data = await response.json();
  return data.meals?.[0];
}


export async function searchProductsByName(query) {
  try {
    const response = await fetch(
      `${OFF_BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=24`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error searching products by name:", error);
    return [];
  }
}

export async function getProductByBarcode(barcode) {
  try {
    const response = await fetch(`${OFF_BASE_URL}/api/v2/product/${barcode.trim()}.json`);
    if (!response.ok) throw new Error("Product not found");
    const data = await response.json();
    if (data.status === 1 && data.product) {
      return data.product;
    }
    return null;
  } catch (error) {
    console.error("Error looking up barcode:", error);
    return null;
  }
}

export async function getProductsByCategory(categoryName) {
  try {
    const response = await fetch(
      `${OFF_BASE_URL}/category/${encodeURIComponent(categoryName)}.json?page_size=20`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}