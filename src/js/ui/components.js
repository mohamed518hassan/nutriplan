//components.js

class UIComponents {
  createProductCard(product) {
    const nutriScore = product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : 'UNKNOWN';
    const image = product.image_front_small_url || 'https://placehold.co/150x150?text=No+Image';
    const brands = product.brands || 'Generic Brand';
    const kcal = product.nutriments?.['energy-kcal_100g'] ? Math.round(product.nutriments['energy-kcal_100g']) : null;
    const scoreColors = {
      'A': 'bg-emerald-600 text-white',
      'B': 'bg-green-500 text-white',
      'C': 'bg-amber-400 text-gray-900',
      'D': 'bg-orange-500 text-white',
      'E': 'bg-red-600 text-white',
      'UNKNOWN': 'bg-gray-300 text-gray-600'
    };
    const badgeColor = scoreColors[nutriScore] || scoreColors['UNKNOWN'];
    return `
      <div class="product-card bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-all">
        <img src="${image}" alt="${product.product_name || 'Product'}" class="w-20 h-20 object-contain rounded-xl bg-gray-50 flex-shrink-0">
        <div class="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-gray-900 truncate">${product.product_name || 'Unknown Product'}</h4>
            <p class="text-xs text-gray-400 truncate">${brands}</p>
          </div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex gap-1 items-center">
              <span class="px-2 py-0.5 rounded text-xs font-black ${badgeColor}">${nutriScore}</span>
            </div>
            <span class="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
              ${kcal ? kcal + ' kcal/100g' : 'N/A Kcal'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  createCategoryCard(category) {
    const myCustomStyles = {
      'beef': { bg: '#fef2f2', border: '#fee2e2', iconBg: '#f43f5e', icon: 'fa-solid fa-drumstick-bite' },
      'chicken': { bg: '#fffbeb', border: '#fef3c7', iconBg: '#f59e0b', icon: 'fa-solid fa-hotdog' },
      'dessert': { bg: '#fdf2f8', border: '#fce7f3', iconBg: '#ec4899', icon: 'fa-solid fa-cake-candles' },
      'lamb': { bg: '#fff7ed', border: '#ffedd5', iconBg: '#f97316', icon: 'fa-solid fa-bone' },
      'miscellaneous': { bg: '#f8fafc', border: '#e2e8f0', iconBg: '#64748b', icon: 'fa-solid fa-bowl-rice' },
      'pasta': { bg: '#fefce8', border: '#fef08a', iconBg: '#eab308', icon: 'fa-solid fa-stroopwafel' },
      'pork': { bg: '#fef2f2', border: '#fee2e2', iconBg: '#f87171', icon: 'fa-solid fa-bacon' },
      'seafood': { bg: '#f0f9ff', border: '#e0f2fe', iconBg: '#38bdf8', icon: 'fa-solid fa-fish' },
      'side': { bg: '#f0fdf4', border: '#dcfce7', iconBg: '#10b981', icon: 'fa-solid fa-seedling' },
      'starter': { bg: '#f0fdf4', border: '#ccfbf1', iconBg: '#14b8a6', icon: 'fa-solid fa-bowl-food' },
      'vegan': { bg: '#f0fdf4', border: '#dcfce7', iconBg: '#22c55e', icon: 'fa-solid fa-leaf' },
      'vegetarian': { bg: '#f7fee7', border: '#ecfccb', iconBg: '#10b981', icon: 'fa-solid fa-carrot' },
      'breakfast': { bg: '#f0fdf4', border: '#dcfce7', iconBg: '#10b981', icon: 'fa-solid fa-utensils' },
      'goat': { bg: '#f0fdf4', border: '#dcfce7', iconBg: '#10b981', icon: 'fa-solid fa-utensils' },
      'all': { bg: '#f9fafb', border: '#e5e7eb', iconBg: '#9ca3af', icon: 'fa-solid fa-border-all' }
    };

    const rawName = category.strCategory || category.name || 'All';
    const key = rawName.toLowerCase().trim();

    const style = myCustomStyles[key] || {
      bg: '#f9fafb',
      border: '#e5e7eb',
      iconBg: '#10b981',
      icon: 'fa-solid fa-utensils'
    };

    return `
            <div class="category-card rounded-xl p-2 cursor-pointer border transition-all duration-200 flex items-center gap-3 group category-filter-btn shrink-0 min-w-[140px]" 
                 style="background-color: ${style.bg}; border-color: ${style.border};"
                 data-category="${rawName}">
              <div class="w-9 h-9 text-white rounded-lg flex items-center justify-center text-sm shadow-sm shrink-0 transition-transform group-hover:scale-105" 
                   style="background-color: ${style.iconBg};">
                <i class="${style.icon}"></i>
              </div>
              <div class="shrink-0">
                <h3 class="text-sm font-bold !text-gray-900 m-0 p-0 leading-none">${rawName}</h3>
              </div>
            </div>`;
  }

  createMealCard(meal) {
    return `
          <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group dynamic-meal-card" data-id="${meal.idMeal}">
            <div class="relative h-48 overflow-hidden">
              <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
              <div class="absolute bottom-3 left-3 flex gap-2">
                <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
                  ${meal.strCategory || 'Food'}
                </span>
                <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
                  ${meal.strArea || 'Cuisine'}
                </span>
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.strMeal}</h3>
              <p class="text-xs text-gray-600 mb-3 line-clamp-2">Delicious recipe to try! Enjoy making this standard and healthy meal.</p>
              <div class="flex items-center justify-between text-xs mt-3">
                <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.strCategory || 'Food'}</span>
                <span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${meal.strArea || 'Cuisine'}</span>
              </div>
            </div>
          </div>`;
  }

  createLoadingSpinner() {
    return `
            <div class="flex items-center justify-center col-span-full py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>`;
  }

  createEmptyState() {
    return `
            <div class="flex flex-col items-center justify-center col-span-full py-12 text-center">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
                </div>
                <p class="text-gray-500 text-lg">No recipes found</p>
                <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
            </div>`;
  }

  createMealDetailsContent(meal) {
    let ingredientsHTML = '';
    let count = 0;
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim() !== "") {
        count++;
        ingredientsHTML += `
                        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                          <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
                          <span class="text-gray-700"><span class="font-medium text-gray-900">${measure || ''}</span> ${ing}</span>
                        </div>`;
      }
    }

    const instructions = meal.strInstructions || "No instructions available.";
    const stepsHTML = instructions.split(/\r?\n/).filter(s => s.trim().length > 0).map((step, index) => `
                    <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${index + 1}</div>
                      <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
                    </div>`).join('');

    let embedUrl = "https://www.youtube.com/embed/4aZr5hZXP_s";
    if (meal.strYoutube) {
      const videoId = meal.strYoutube.split('v=')[1];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId.split('&')[0]}`;
    }

    const caloriesPerServing = meal.calories || Math.floor(350 + (meal.strMeal ? meal.strMeal.length * 5 : 120) + (count * 6));
    const totalCalories = caloriesPerServing * 4;

    const protein = Math.floor(caloriesPerServing * 0.04);
    const carbs = Math.floor(caloriesPerServing * 0.14);
    const fat = Math.floor(caloriesPerServing * 0.03);
    const fiber = Math.floor(count * 0.5) + 2;
    const sugar = Math.floor(carbs * 0.4);
    const satFat = Math.floor(fat * 0.3);

    return `
      <div class="max-w-7xl mx-auto">
        <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
          <i class="fa-solid fa-arrow-left"></i> <span>Back to Recipes</span>
        </button>
        
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div class="relative h-80 md:h-96">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <div class="flex items-center gap-3 mb-3">
                <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.strCategory || 'Food'}</span>
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.strArea || 'Cuisine'}</span>
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.strMeal}</h1>
              <div class="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90 mt-2">
                <span><i class="fa-regular fa-clock mr-1"></i> 30 min</span>
                <span><i class="fa-solid fa-utensils mr-1"></i> 4 servings</span>
                <span><i class="fa-solid fa-fire mr-1"></i> ${caloriesPerServing} cal/serving</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mb-8">
          <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Log This Meal</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-list-check text-emerald-600"></i> Ingredients <span class="text-sm font-normal text-gray-500 ml-auto">${count} items</span>
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${ingredientsHTML}</div>
            </div>
            
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-shoe-prints text-emerald-600"></i> Instructions</h2>
              <div class="space-y-4">${stepsHTML}</div>
            </div>
            
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-video text-red-500"></i> Video Tutorial</h2>
              <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                <iframe src="${embedUrl}" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe>
              </div>
            </div>
          </div>
          
          <div class="lg:col-span-1">
            <div class="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 space-y-6 sticky top-6 self-start">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <i class="fa-solid fa-chart-pie text-emerald-500 text-xl"></i>
                  <h3 class="font-bold text-gray-900 text-xl">Nutrition Facts</h3>
                </div>
                <p class="text-sm text-gray-400">Per serving</p>
              </div>
              
              <div class="bg-emerald-50/60 rounded-2xl p-5 text-center">
                <span class="text-sm text-gray-500 block mb-1">Calories per serving</span>
                <span class="text-5xl font-black text-emerald-600 block mb-1">${caloriesPerServing}</span>
                <span class="text-xs text-gray-400 font-medium block">Total: ${totalCalories} cal</span>
              </div>

              <div class="space-y-4">
                <div class="space-y-1.5">
                  <div class="flex justify-between items-center text-sm font-semibold">
                    <span class="text-gray-700 flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-emerald-500"></span> Protein
                    </span>
                    <span class="text-gray-900">${protein}g</span>
                  </div>
                  <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full rounded-full" style="width: 35%"></div>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <div class="flex justify-between items-center text-sm font-semibold">
                    <span class="text-gray-700 flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-blue-500"></span> Carbs
                    </span>
                    <span class="text-gray-900">${carbs}g</span>
                  </div>
                  <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-blue-500 h-full rounded-full" style="width: 55%"></div>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <div class="flex justify-between items-center text-sm font-semibold">
                    <span class="text-gray-700 flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-purple-500"></span> Fat
                    </span>
                    <span class="text-gray-900">${fat}g</span>
                  </div>
                  <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-purple-500 h-full rounded-full" style="width: 25%"></div>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <div class="flex justify-between items-center text-sm font-semibold">
                    <span class="text-gray-700 flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-orange-500"></span> Fiber
                    </span>
                    <span class="text-gray-900">${fiber}g</span>
                  </div>
                  <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-orange-500 h-full rounded-full" style="width: 40%"></div>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <div class="flex justify-between items-center text-sm font-semibold">
                    <span class="text-gray-700 flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-pink-500"></span> Sugar
                    </span>
                    <span class="text-gray-900">${sugar}g</span>
                  </div>
                  <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-pink-500 h-full rounded-full" style="width: 65%"></div>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <div class="flex justify-between items-center text-sm font-semibold">
                    <span class="text-gray-700 flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-red-500"></span> Saturated Fat
                    </span>
                    <span class="text-gray-900">${satFat}g</span>
                  </div>
                  <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-red-500 h-full rounded-full" style="width: 45%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  createLogMealModal(meal) {
    const calories = meal.calories || Math.floor(350 + (meal.strMeal ? meal.strMeal.length * 5 : 120));
    const protein = Math.floor(calories * 0.04);
    const carbs = Math.floor(calories * 0.14);
    const fat = Math.floor(calories * 0.03);

    return `
      <div id="log-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-meal-id="${meal.idMeal}">
        <div class="bg-white w-[600px] rounded-3xl p-8 shadow-2xl animate-fade-in mx-4">
          <div class="flex gap-4 mb-8">
            <img src="${meal.strMealThumb}" class="w-20 h-20 rounded-2xl object-cover shadow-sm shrink-0">
            <div>
              <h2 class="text-3xl font-bold text-gray-900">Log This Meal</h2>
              <p class="text-gray-500 text-lg line-clamp-1">${meal.strMeal}</p>
            </div>
          </div>
          <h3 class="font-bold text-lg text-gray-800 mb-3">Number of Servings</h3>
          <div class="flex gap-3 mb-6">
            <button id="minus-btn" type="button" class="w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xl transition-colors">-</button>
            <input id="servings-input" type="number" value="1" min="1" class="w-20 text-center border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:border-emerald-500">
            <button id="plus-btn" type="button" class="w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xl transition-colors">+</button>
          </div>
          <div class="bg-emerald-50/70 rounded-2xl p-5 mb-8">
            <p class="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-3">Estimated nutrition summary:</p>
            <div class="grid grid-cols-4 text-center gap-2">
              <div>
                <h4 class="text-emerald-600 font-black text-2xl">${calories}</h4>
                <p class="text-xs text-gray-500 font-medium">Calories</p>
              </div>
              <div>
                <h4 class="text-blue-600 font-black text-2xl">${protein}g</h4>
                <p class="text-xs text-gray-500 font-medium">Protein</p>
              </div>
              <div>
                <h4 class="text-orange-500 font-black text-2xl">${carbs}g</h4>
                <p class="text-xs text-gray-500 font-medium">Carbs</p>
              </div>
              <div>
                <h4 class="text-purple-600 font-black text-2xl">${fat}g</h4>
                <p class="text-xs text-gray-500 font-medium">Fat</p>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <button type="button" class="cancel-modal-btn py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="button" class="confirm-modal-btn py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors">
              <i class="fa-solid fa-clipboard-list mr-1.5"></i>Log Meal
            </button>
          </div>
        </div>
      </div>`;
  }
}

export const uiComponents = new UIComponents();