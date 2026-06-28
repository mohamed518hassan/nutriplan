
import { getCategories } from './api/mealdb.js';
import { appState } from './state/appState.js';
import { uiComponents } from './ui/components.js';

class NutriPlanApp {

  constructor() {
    this.mealsData = [];
    this.categoriesData = [];
    this.currentViewMode = 'grid';

    const savedFoods = localStorage.getItem('logged_foods');
    if (typeof appState === 'undefined') {
      window.appState = {};
    }
    appState.loggedFoods = savedFoods ? JSON.parse(savedFoods) : [];
    this.init();
  }

  async init() {
    this.cacheElements();
    this.bindEvents();

    if (typeof this.initializeProductsSection === 'function') {
      this.initializeProductsSection();
    }

    try {
      await this.loadInitialData();
    } catch (error) {
      console.error("Error loading initial data:", error);
    }

    if (window.location.hash === '#/log') {
      this.renderFoodLog();
    }

    this.handleRouting();
  }


  cacheElements() {
    this.loadingOverlay = document.getElementById('app-loading-overlay');
    this.categoriesGrid = document.getElementById('categories-grid');
    this.recipesGrid = document.getElementById('recipes-grid');
    this.recipesCountText = document.getElementById('recipes-count');
    this.searchInput = document.getElementById('search-input');

    this.gridViewBtn = document.getElementById('grid-view-btn');
    this.listViewBtn = document.getElementById('list-view-btn');

    this.mainHeader = document.getElementById('header');
    this.headerTitle = this.mainHeader ? this.mainHeader.querySelector('h1') : null;
    this.headerDesc = this.mainHeader ? this.mainHeader.querySelector('p') : null;

    this.mealCategoriesSection = document.getElementById('meal-categories-section');
    this.allRecipesSection = document.getElementById('all-recipes-section');
    this.searchFiltersSection = document.getElementById('search-filters-section');

    this.homeSections = [
      this.searchFiltersSection,
      this.mealCategoriesSection,
      this.allRecipesSection
    ].filter(Boolean);

    this.productsSection = document.getElementById('products-section');
    this.foodLogSection = document.getElementById('foodlog-section');
    this.clearLogBtn = document.getElementById('clear-foodlog');

    this.mealDetailsSection = document.getElementById('meal-details') || document.getElementById('meal-details-section');

    this.navHomeBtn = document.getElementById('nav-meals');
    this.navProductsBtn = document.getElementById('nav-products');
    this.navLogBtn = document.getElementById('nav-log');

    this.areasContainer = document.getElementById('areas-filters-container');
  }


  bindEvents() {
    if (this.navHomeBtn) this.navHomeBtn.addEventListener('click', () => this.navigateTo('home'));
    if (this.navProductsBtn) this.navProductsBtn.addEventListener('click', () => this.navigateTo('products'));
    if (this.navLogBtn) this.navLogBtn.addEventListener('click', () => this.navigateTo('log'));

    if (this.gridViewBtn) this.gridViewBtn.addEventListener('click', () => this.toggleViewMode('grid'));
    if (this.listViewBtn) this.listViewBtn.addEventListener('click', () => this.toggleViewMode('list'));

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    if (this.clearLogBtn) {
      this.clearLogBtn.addEventListener('click', () => {
        if (appState && appState.clearLog) {
          appState.clearLog();
        } else {
          localStorage.removeItem('logged_foods');
          if (appState) appState.loggedFoods = [];
        }
        this.renderFoodLog();
      });
    }
    const quickButtons = document.querySelectorAll('.quick-log-btn');
    if (quickButtons.length >= 2) {
      quickButtons[0].addEventListener('click', () => this.navigateTo('home'));
      quickButtons[1].addEventListener('click', () => this.navigateTo('products'));
    }
    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('popstate', () => this.handleRouting());
  }

  toggleViewMode(mode) {
    this.currentViewMode = mode;
    if (!this.recipesGrid) return;

    if (mode === 'list') {
      this.recipesGrid.className = "flex flex-col gap-4 w-full";
      if (this.listViewBtn) this.listViewBtn.classList.add('bg-white', 'shadow-sm');
      if (this.gridViewBtn) this.gridViewBtn.classList.remove('bg-white', 'shadow-sm');
    } else {
      this.recipesGrid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5";
      if (this.gridViewBtn) this.gridViewBtn.classList.add('bg-white', 'shadow-sm');
      if (this.listViewBtn) this.listViewBtn.classList.remove('bg-white', 'shadow-sm');
    }
  }

  async loadInitialData() {
    try {
      if (this.loadingOverlay) this.loadingOverlay.style.display = 'flex';

      const mealsResponse = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=');
      const mealsDataJson = await mealsResponse.json();
      this.mealsData = mealsDataJson.meals || [];

      try {
        const catsData = await getCategories();
        this.categoriesData = catsData || [];
      } catch (e) {
        const catResponse = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
        const catDataJson = await catResponse.json();
        this.categoriesData = catDataJson.categories || [];
      }

      this.renderCategories();
      this.renderMeals(this.mealsData);
      this.renderAreaFilters();
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
    }
  }

  renderCategories() {
    if (!this.categoriesGrid) return;
    this.categoriesGrid.innerHTML = uiComponents.createCategoryCard({ name: 'All', strCategory: 'All' });

    this.categoriesData.forEach(cat => {
      this.categoriesGrid.innerHTML += uiComponents.createCategoryCard(cat);
    });

    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('bg-green-600', 'text-white'));
        targetBtn.classList.add('bg-green-600', 'text-white');
        this.filterByCategory(targetBtn.dataset.category);
      });
    });
  }

  renderMeals(meals) {
    if (!this.recipesGrid) return;
    this.recipesGrid.innerHTML = '';

    if (!meals || meals.length === 0) {
      this.recipesGrid.innerHTML = uiComponents.createEmptyState ? uiComponents.createEmptyState() : '<p class="text-gray-500 col-span-full text-center py-8">No meals found.</p>';
      if (this.recipesCountText) this.recipesCountText.textContent = '0 recipes';
      return;
    }

    meals.forEach(meal => {
      this.recipesGrid.innerHTML += uiComponents.createMealCard(meal);
    });

    if (this.recipesCountText) this.recipesCountText.textContent = `${meals.length} recipes`;

    document.querySelectorAll('.dynamic-meal-card').forEach(card => {
      card.addEventListener('click', () => this.openMealDetails(card.dataset.id));
    });
  }


  renderAreaFilters() {
    const areasContainer = document.getElementById('areas-filters-container');
    if (!areasContainer || !this.mealsData) return;
    const areas = new Set();
    this.mealsData.forEach(meal => {
      if (meal.strArea) {
        areas.add(meal.strArea);
      }
    });

    let html = `
      <button class="area-filter-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap transition-all" data-area="All">
        All Recipes
      </button>
    `;

    areas.forEach(area => {
      html += `
        <button class="area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all" data-area="${area}">
          ${area}
        </button>
      `;
    });

    areasContainer.innerHTML = html;

    areasContainer.querySelectorAll('.area-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        const selectedArea = targetBtn.dataset.area;

        areasContainer.querySelectorAll('.area-filter-btn').forEach(b => {
          b.classList.remove('bg-emerald-600', 'text-white');
          b.classList.add('bg-gray-100', 'text-gray-700');
        });
        targetBtn.classList.remove('bg-gray-100', 'text-gray-700');
        targetBtn.classList.add('bg-emerald-600', 'text-white');
        if (selectedArea === 'All') {
          this.renderMeals(this.mealsData);
        } else {
          const filtered = this.mealsData.filter(meal => meal.strArea === selectedArea);
          this.renderMeals(filtered);
        }
      });
    });
  }


  async filterByCategory(category) {
    if (this.loadingOverlay) this.loadingOverlay.style.display = 'flex';
    try {
      const selectedCategory = category ? category.trim().toLowerCase() : '';

      if (!selectedCategory || selectedCategory === 'all') {
        this.renderMeals(this.mealsData);
      } else {
        const { getMealsByCategory } = await import('./api/mealdb.js');
        const filteredMeals = await getMealsByCategory(category);
        this.renderMeals(filteredMeals);
      }
    } catch (err) {
      console.error("Error filtering categories via API:", err);
    } finally {
      if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
    }
  }

  handleSearch(query) {
    const filtered = this.mealsData.filter(m => {
      const mealName = m.strMeal || m.name;
      return mealName && mealName.toLowerCase().includes(query.toLowerCase());
    });
    this.renderMeals(filtered);
  }

  async openMealDetails(id) {
    if (!id) return;
    localStorage.setItem('last_viewed_meal_id', id);
    if (this.loadingOverlay) this.loadingOverlay.style.display = 'flex';

    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await response.json();
      const meal = data.meals ? data.meals[0] : null;

      if (!meal) return;

      this.mealDetailsSection.innerHTML = uiComponents.createMealDetailsContent ? uiComponents.createMealDetailsContent(meal) : uiComponents.createMealCard(meal);
      this.navigateTo('details');

      const backBtn = document.getElementById('back-to-meals-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => this.navigateTo('home'));
      }

      const logBtn = document.getElementById('log-meal-btn');
      if (logBtn) {
        logBtn.addEventListener('click', () => {
          this.openLogMealModal(meal);
        });
      }
    } catch (err) {
      console.error("Error loading meal details:", err);
    } finally {
      if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
    }
  }

  openLogMealModal(item) {
    const oldModal = document.getElementById('log-modal');
    if (oldModal) oldModal.remove();

    document.body.insertAdjacentHTML(
      'beforeend',
      uiComponents.createLogMealModal(item)
    );

    const modal = document.getElementById('log-modal');
    if (modal && item) {
      modal.dataset.mealId = item.idMeal || item.code || Date.now().toString();
    }

    this.initializeModalEvents();
  }

  initializeModalEvents() {
    const modal = document.getElementById('log-modal');
    if (!modal) return;

    const cancelBtn = modal.querySelector('.cancel-modal-btn');
    const confirmBtn = modal.querySelector('.confirm-modal-btn') ||
      modal.querySelector('button.bg-blue-600') ||
      Array.from(modal.querySelectorAll('button')).find(btn => btn.textContent.includes('Log'));

    const plusBtn = modal.querySelector('#plus-btn') || document.getElementById('plus-btn');
    const minusBtn = modal.querySelector('#minus-btn') || document.getElementById('minus-btn');
    const servingsInput = modal.querySelector('#servings-input') || document.getElementById('servings-input');

    const calorieText = modal.querySelector('.text-emerald-600');
    const proteinText = modal.querySelector('.text-blue-600');
    const carbsText = modal.querySelector('.text-orange-500') || modal.querySelector('.text-amber-600') || modal.querySelector('.text-orange-600');
    const fatText = modal.querySelector('.text-purple-600');

    const baseCalories = parseInt(calorieText?.textContent?.replace(/[^0-9]/g, '')) || 0;
    const baseProtein = parseInt(proteinText?.textContent?.replace(/[^0-9]/g, '')) || 0;
    const baseCarbs = parseInt(carbsText?.textContent?.replace(/[^0-9]/g, '')) || 0;
    const baseFat = parseInt(fatText?.textContent?.replace(/[^0-9]/g, '')) || 0;

    const updateModalNutrition = () => {
      const servings = Math.max(1, parseInt(servingsInput.value) || 1);
      servingsInput.value = servings;

      if (calorieText) calorieText.textContent = `${baseCalories * servings} kcal`;
      if (proteinText) proteinText.textContent = `${baseProtein * servings}g`;
      if (carbsText) carbsText.textContent = `${baseCarbs * servings}g`;
      if (fatText) fatText.textContent = `${baseFat * servings}g`;
    };

    if (plusBtn) {
      plusBtn.onclick = () => {
        servingsInput.value = (parseInt(servingsInput.value) || 1) + 1;
        updateModalNutrition();
      };
    }

    if (minusBtn) {
      minusBtn.onclick = () => {
        const current = parseInt(servingsInput.value) || 1;
        if (current > 1) {
          servingsInput.value = current - 1;
          updateModalNutrition();
        }
      };
    }

    if (servingsInput) {
      servingsInput.oninput = () => updateModalNutrition();
    }

    if (cancelBtn) {
      cancelBtn.onclick = () => modal.remove();
    }

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const finalServings = parseInt(servingsInput.value) || 1;
        const totalCaloriesCalculated = baseCalories * finalServings;
        const mealName = modal.dataset.mealName || modal.querySelector('p.line-clamp-1')?.textContent?.trim() || 'Unknown Food';

        const loggedItem = {
          idMeal: modal.dataset.mealId || Date.now().toString(),
          strMeal: mealName,
          strMealThumb: modal.querySelector('img')?.src || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=60',
          servings: finalServings,
          calories: totalCaloriesCalculated,
          protein: baseProtein * finalServings,
          carbs: baseCarbs * finalServings,
          fat: baseFat * finalServings,
          fullDate: new Date().toISOString().split('T')[0],
          dateLogged: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (typeof appState === 'undefined') window.appState = {};
        if (!appState.loggedFoods) appState.loggedFoods = [];

        appState.loggedFoods.push(loggedItem);
        localStorage.setItem('logged_foods', JSON.stringify(appState.loggedFoods));
        this.renderFoodLog();

        modal.remove();

        Swal.fire({
          icon: 'success',
          title: 'Meal Logged!',
          html: `
            <p style="font-size:16px;color:#6b7280">
              <b style="color:#111827">${mealName}</b>
              (${finalServings} serving${finalServings > 1 ? 's' : ''})
              has been added to your daily log.
            </p>
            <p style="color:#10b981;font-size:32px;font-weight:900;margin-top:20px;">
              +${totalCaloriesCalculated} calories
            </p>
          `,
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          customClass: {
            popup: 'rounded-3xl'
          }
        });
      };
    }
  }

  navigateTo(view) {
    if (appState) appState.currentView = view;
    window.location.hash = `#/${view}`;
    this.updateViewUI(view);
  }

  handleRouting() {
    const hash = window.location.hash || '#/home';

    if (hash.startsWith('#/details')) {
      const savedMealId = localStorage.getItem('last_viewed_meal_id');
      if (savedMealId) {
        this.openMealDetails(savedMealId);
      } else {
        this.navigateTo('home');
      }
      return;
    }

    const view = hash.replace('#/', '') || 'home';
    this.updateViewUI(view);
  }

  updateViewUI(view) {
    const sections = [
      this.searchFiltersSection,
      this.mealCategoriesSection,
      this.allRecipesSection,
      this.productsSection,
      this.foodLogSection,
      this.mealDetailsSection
    ];
    sections.forEach(sec => { if (sec) sec.style.display = 'none'; });

    const navButtons = [this.navHomeBtn, this.navProductsBtn, this.navLogBtn];
    navButtons.forEach(btn => {
      if (btn) {
        btn.className = "nav-link flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all";
        const span = btn.querySelector('span');
        if (span) span.className = "font-medium";
      }
    });

    if (view === 'home' || view === '') {
      if (this.mainHeader) this.mainHeader.style.display = 'block';
      if (this.headerTitle) this.headerTitle.textContent = 'Meals & Recipes';
      if (this.headerDesc) this.headerDesc.textContent = 'Discover delicious and nutritious recipes tailored for you';

      if (this.navHomeBtn) {
        this.navHomeBtn.className = "nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all";
        const span = this.navHomeBtn.querySelector('span');
        if (span) span.className = "font-semibold";
      }

      if (this.searchFiltersSection) this.searchFiltersSection.style.display = 'block';
      if (this.mealCategoriesSection) this.mealCategoriesSection.style.display = 'block';
      if (this.allRecipesSection) this.allRecipesSection.style.display = 'block';
      this.toggleViewMode(this.currentViewMode);
    }

    else if (view === 'products') {
      if (this.mainHeader) this.mainHeader.style.display = 'none';

      if (this.navProductsBtn) {
        this.navProductsBtn.className = "nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all";
        const span = this.navProductsBtn.querySelector('span');
        if (span) span.className = "font-semibold";
      }

      if (this.productsSection) this.productsSection.style.display = 'block';
    }

    else if (view === 'log') {
      if (this.mainHeader) this.mainHeader.style.display = 'block';
      if (this.headerTitle) this.headerTitle.textContent = 'Food Log';
      if (this.headerDesc) this.headerDesc.textContent = 'Track your daily nutritional intake and meals';

      if (this.navLogBtn) {
        this.navLogBtn.className = "nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all";
        const span = this.navLogBtn.querySelector('span');
        if (span) span.className = "font-semibold";
      }

      if (this.foodLogSection) this.foodLogSection.style.display = 'block';
      this.renderFoodLog();
    }

    else if (view === 'details') {
      if (this.mainHeader) this.mainHeader.style.display = 'block';
      if (this.headerTitle) this.headerTitle.textContent = 'Recipe Details';
      if (this.headerDesc) this.headerDesc.textContent = 'View full nutritional information and steps';
      if (this.mealDetailsSection) this.mealDetailsSection.style.display = 'block';
    }
  }

  renderFoodLog() {
    if (!appState) return;
    const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateHeader = document.getElementById('foodlog-date');
    if (dateHeader) {
      dateHeader.textContent = new Date().toLocaleDateString('en-US', dateOptions);
    }

    const loggedFoods = appState.loggedFoods || [];

    const totals = loggedFoods.reduce((acc, item) => {
      const servings = item.servings || 1;
      const hasMultiplied = item.calories > (item.baseCalories || item.calories);
      const multiplier = hasMultiplied ? 1 : servings;

      acc.calories += Math.floor((item.calories || 0) * multiplier);
      acc.protein += Math.floor((item.protein || 0) * multiplier);
      acc.carbs += Math.floor((item.carbs || 0) * multiplier);
      acc.fat += Math.floor((item.fat || 0) * multiplier);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const targets = { calories: 2000, protein: 50, carbs: 250, fat: 65 };

    const percents = {
      calories: Math.min(100, Math.floor((totals.calories / targets.calories) * 100)),
      protein: Math.min(100, Math.floor((totals.protein / targets.protein) * 100)),
      carbs: Math.min(100, Math.floor((totals.carbs / targets.carbs) * 100)),
      fat: Math.min(100, Math.floor((totals.fat / targets.fat) * 100))
    };

    const progressSections = document.getElementById('foodlog-today-section')?.querySelectorAll('.bg-emerald-50, .bg-blue-50, .bg-amber-50, .bg-purple-50');

    if (progressSections && progressSections.length >= 4) {
      progressSections[0].querySelector('span:nth-child(2)').textContent = `${totals.calories} / ${targets.calories} kcal`;
      progressSections[0].querySelector('.rounded-full > div').style.width = `${percents.calories}%`;

      progressSections[1].querySelector('span:nth-child(2)').textContent = `${totals.protein} / ${targets.protein} g`;
      progressSections[1].querySelector('.rounded-full > div').style.width = `${percents.protein}%`;

      progressSections[2].querySelector('span:nth-child(2)').textContent = `${totals.carbs} / ${targets.carbs} g`;
      progressSections[2].querySelector('.rounded-full > div').style.width = `${percents.carbs}%`;

      progressSections[3].querySelector('span:nth-child(2)').textContent = `${totals.fat} / ${targets.fat} g`;
      progressSections[3].querySelector('.rounded-full > div').style.width = `${percents.fat}%`;
    }

    const itemsCountHeader = document.querySelector('#foodlog-today-section h4');
    if (itemsCountHeader) {
      itemsCountHeader.textContent = `Logged Items (${loggedFoods.length})`;
    }

    const clearLogBtn = document.getElementById('clear-foodlog');
    if (clearLogBtn) {
      clearLogBtn.style.display = loggedFoods.length > 0 ? 'inline-flex' : 'none';
    }

    const listContainer = document.getElementById('logged-items-list');
    if (!listContainer) return;

    if (loggedFoods.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
          <p class="font-medium">No meals logged today</p>
          <p class="text-sm">Add meals from the Meals page or scan products</p>
        </div>`;
      this.renderWeeklyChart(totals.calories);
      return;
    }

    listContainer.innerHTML = loggedFoods.map((item, index) => {
      const servings = item.servings || 1;

      const itemCal = item.calories || 0;
      const itemProtein = item.protein || 0;
      const itemCarbs = item.carbs || 0;
      const itemFat = item.fat || 0;

      const foodImg = item.strMealThumb || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=60';
      const foodType = item.idMeal && item.idMeal.length < 10 ? 'Recipe' : 'Product';
      const badgeColor = foodType === 'Recipe' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50';

      const logTime = item.dateLogged || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all mb-3">
          <div class="flex items-center gap-4">
            <img src="${foodImg}" alt="${item.strMeal}" class="w-14 h-14 rounded-xl object-cover shadow-xs shrink-0 border border-gray-150">
            <div>
              <h4 class="font-bold text-gray-900 text-sm sm:text-base mb-0.5">${item.strMeal}</h4>
              <div class="flex flex-col text-xs text-gray-400 gap-0.5">
                <span class="font-medium text-gray-500">${servings} serving${servings > 1 ? 's' : ''} • <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeColor}">${foodType}</span></span>
                <span class="text-gray-400 text-[11px] font-normal">${logTime}</span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-5">
            <div class="text-right">
              <span class="font-black text-emerald-600 text-lg sm:text-xl block leading-tight">${itemCal}</span>
              <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block -mt-0.5">kcal</span>
            </div>

            <div class="flex items-center gap-1.5 text-[11px]">
              <span class="px-2 py-1 bg-gray-50 text-blue-600 font-bold rounded-lg border border-gray-100">${itemProtein}g P</span>
              <span class="px-2 py-1 bg-gray-50 text-orange-500 font-bold rounded-lg border border-gray-100">${itemCarbs}g C</span>
              <span class="px-2 py-1 bg-gray-50 text-purple-600 font-bold rounded-lg border border-gray-100">${itemFat}g F</span>
            </div>

            <button class="delete-log-btn p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-all shrink-0" data-index="${index}">
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.delete-log-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index);

        if (appState.loggedFoods) {

          const deletedMeal = appState.loggedFoods[idx].strMeal;

          appState.loggedFoods.splice(idx, 1);

          localStorage.setItem(
            'logged_foods',
            JSON.stringify(appState.loggedFoods)
          );

          this.renderFoodLog();

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `${deletedMeal} removed from log`,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
        }
      };
    });

    this.renderWeeklyChart(totals.calories);
  }

  renderWeeklyChart() {
    const chartWrapper = document.getElementById('weekly-overview-container');
    if (!chartWrapper) return;
    chartWrapper.className = "w-full block text-left pt-2";

    const loggedFoods = (typeof appState !== 'undefined' && appState.loggedFoods) ? appState.loggedFoods : [];
    const today = new Date();
    const currentDay = today.getDay();
    const sundayDate = new Date(today);
    sundayDate.setDate(today.getDate() - currentDay);
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    const todayString = today.toISOString().split('T')[0];
    for (let i = 0; i < 7; i++) {
      const loopDate = new Date(sundayDate);
      loopDate.setDate(sundayDate.getDate() + i);
      const dateString = loopDate.toISOString().split('T')[0];
      const dayFoods = loggedFoods.filter(food => food.fullDate === dateString);
      const dayCalories = dayFoods.reduce((sum, food) => sum + (food.calories || 0), 0);
      const dayItemsCount = dayFoods.length;
      weeklyData.push({
        day: dayLabels[i],
        date: loopDate.getDate(),
        calories: dayCalories,
        items: dayItemsCount,
        isActive: dateString === todayString
      });
    }

    const totalWeeklyCalories = weeklyData.reduce((sum, d) => sum + d.calories, 0);
    const totalWeeklyItems = weeklyData.reduce((sum, d) => sum + d.items, 0);
    const weeklyAverage = Math.round(totalWeeklyCalories / 7);
    const daysOnGoal = weeklyData.filter(d => d.calories > 0 && d.calories <= 2000).length;

    chartWrapper.innerHTML = `
    <div class="grid grid-cols-7 gap-2 items-center text-center mb-8 w-full">
      ${weeklyData.map(item => {
      if (item.isActive) {
        return `
            <div class="flex flex-col items-center bg-blue-50/80 rounded-2xl py-4 px-1 transition-all">
              <span class="text-xs font-semibold text-gray-400 mb-2 block">${item.day}</span>
              <span class="text-sm font-bold text-gray-800 mb-3 block">${item.date}</span>
              <div class="flex flex-col items-center justify-center min-h-[42px]">
                <span class="block text-base font-black text-emerald-500 leading-none">${item.calories}</span>
                <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wide mt-0.5">kcal</span>
                ${item.items > 0 ? `<span class="text-[10px] text-gray-400 mt-2 block font-medium">${item.items} item${item.items !== 1 ? 's' : ''}</span>` : ''}
              </div>
            </div>
          `;
      } else {
        return `
            <div class="flex flex-col items-center py-4 px-1 rounded-2xl transition-all">
              <span class="text-xs font-semibold text-gray-400 mb-2 block">${item.day}</span>
              <span class="text-sm font-bold text-gray-700 mb-3 block">${item.date}</span>
              <div class="flex flex-col items-center justify-center min-h-[42px]">
                <span class="block text-base font-bold ${item.calories > 0 ? 'text-gray-800' : 'text-gray-300'} leading-none">${item.calories}</span>
                <span class="text-[10px] font-semibold ${item.calories > 0 ? 'text-gray-400' : 'text-gray-300'} uppercase tracking-wide mt-0.5">kcal</span>
                ${item.items > 0 ? `<span class="text-[10px] text-gray-400 mt-2 block font-medium">${item.items} items</span>` : ''}
              </div>
            </div>
          `;
      }
    }).join('')}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <div class="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
          <i class="fa-solid fa-chart-line text-lg"></i>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-400">Weekly Average</p>
          <p class="text-lg font-black text-gray-900 mt-0.5">${weeklyAverage} kcal</p>
        </div>
      </div>

      <div class="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
          <i class="fa-solid fa-utensils text-lg"></i>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-400">Total Items This Week</p>
          <p class="text-lg font-black text-gray-900 mt-0.5">${totalWeeklyItems} items</p>
        </div>
      </div>

      <div class="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
        <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
          <i class="fa-solid fa-circle-dot text-lg"></i>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-400">Days On Goal</p>
          <p class="text-lg font-black text-gray-900 mt-0.5">${daysOnGoal} / 7</p>
        </div>
      </div>
    </div>
  `;
  }

  initializeProductsSection() {
    const searchInput = document.getElementById('product-search-input');
    const searchBtn = document.getElementById('search-product-btn');
    const barcodeInput = document.getElementById('barcode-input');
    const lookupBtn = document.getElementById('lookup-barcode-btn');
    const categoryContainer = document.getElementById('product-categories');
    const nutriFilters = document.querySelectorAll('.nutri-score-filter');

    this.currentProducts = [];

    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => this.handleProductSearch(searchInput.value));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleProductSearch(searchInput.value);
      });
    }

    if (lookupBtn && barcodeInput) {
      lookupBtn.addEventListener('click', () => this.handleBarcodeLookup(barcodeInput.value));
      barcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleBarcodeLookup(barcodeInput.value);
      });
    }

    if (categoryContainer) {
      categoryContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.product-category-btn');
        if (!btn) return;
        const categoryText = btn.textContent.trim().toLowerCase();
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'flex';
        const { getProductsByCategory } = await import('./api/mealdb.js');
        this.currentProducts = await getProductsByCategory(categoryText);
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
        this.renderProducts(this.currentProducts);
      });
    }

    nutriFilters.forEach(button => {
      button.addEventListener('click', (e) => {
        nutriFilters.forEach(btn => btn.className = "nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200");
        button.className = "nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-emerald-600 text-white";
        const grade = button.dataset.grade;
        if (!grade) {
          this.renderProducts(this.currentProducts);
        } else {
          const filtered = this.currentProducts.filter(p => p.nutrition_grades_tags?.includes(grade) || p.nutrition_grade_fr === grade);
          this.renderProducts(filtered);
        }
      });
    });
  }

  async handleProductSearch(query) {
    if (!query.trim()) return;
    if (this.loadingOverlay) this.loadingOverlay.style.display = 'flex';
    const { searchProductsByName } = await import('./api/mealdb.js');
    this.currentProducts = await searchProductsByName(query);
    if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
    this.renderProducts(this.currentProducts);
  }

  async handleBarcodeLookup(barcode) {
    if (!barcode.trim()) return;
    if (this.loadingOverlay) this.loadingOverlay.style.display = 'flex';
    const { getProductByBarcode } = await import('./api/mealdb.js');
    const product = await getProductByBarcode(barcode);
    if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
    if (product) {
      this.currentProducts = [product];
      this.renderProducts(this.currentProducts);
    } else {
      alert("No product found with this barcode.");
    }
  }

  renderProducts(products) {
    const grid = document.getElementById('products-grid');
    const countText = document.getElementById('products-count');
    if (!grid) return;
    if (countText) countText.textContent = `Found ${products.length} products`;

    if (products.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-12"><i class="fa-solid fa-box-open text-4xl text-gray-300 mb-2"></i><p class="text-gray-500">No products found.</p></div>`;
      return;
    }

    grid.innerHTML = products.map(p => {
      const kcal = Math.floor(p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal'] || 0);
      const protein = p.nutriments?.proteins_100g?.toFixed(1) || '0.0';
      const carbs = p.nutriments?.carbohydrates_100g?.toFixed(1) || '0.0';
      const fat = p.nutriments?.fat_100g?.toFixed(1) || '0.0';
      const sugar = p.nutriments?.sugars_100g?.toFixed(1) || '0.0';
      return `
                <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${p.code}">
                  <div class="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden p-2">
                    <img class="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${p.image_url || 'https://placehold.co/300x300?text=No+Image'}" alt="${p.product_name || 'Product'}" />
                    <div class="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">Score ${p.nutrition_grade_fr || 'N/A'}</div>
                  </div>
                  <div class="p-4">
                    <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${p.brands || 'Generic'}</p>
                    <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 h-12">${p.product_name || 'Unknown Product'}</h3>
                    <div class="text-xs text-gray-500 mb-3"><i class="fa-solid fa-fire mr-1"></i>${kcal} kcal/100g</div>
                    <div class="grid grid-cols-4 gap-1 text-center">
                      <div class="bg-emerald-50 rounded p-1.5"><p class="text-xs font-bold text-emerald-700">${protein}g</p><p class="text-[10px] text-gray-500">Prot</p></div>
                      <div class="bg-blue-50 rounded p-1.5"><p class="text-xs font-bold text-blue-700">${carbs}g</p><p class="text-[10px] text-gray-500">Carb</p></div>
                      <div class="bg-purple-50 rounded p-1.5"><p class="text-xs font-bold text-purple-700">${fat}g</p><p class="text-[10px] text-gray-500">Fat</p></div>
                      <div class="bg-orange-50 rounded p-1.5"><p class="text-xs font-bold text-orange-700">${sugar}g</p><p class="text-[10px] text-gray-500">Sug</p></div>
                    </div>
                  </div>
                </div>`;
    }).join('');

    this.attachProductCardEvents();
  }

  attachProductCardEvents() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      card.onclick = () => {
        const barcode = card.dataset.barcode;
        const foundProduct = this.currentProducts.find(p => p.code === barcode);
        if (!foundProduct) return;

        const formattedMeal = {
          idMeal: foundProduct.code,
          strMeal: foundProduct.product_name || 'Product',
          strMealThumb: foundProduct.image_url || 'https://placehold.co/300x300?text=No+Image',
          strCategory: 'Packaged Food',
          calories: Math.floor(foundProduct.nutriments?.['energy-kcal_100g'] || 0),
          protein: Math.floor(foundProduct.nutriments?.proteins_100g || 0),
          carbs: Math.floor(foundProduct.nutriments?.carbohydrates_100g || 0),
          fat: Math.floor(foundProduct.nutriments?.fat_100g || 0)
        };
        this.openLogMealModal(formattedMeal);
      };
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NutriPlanApp();
});