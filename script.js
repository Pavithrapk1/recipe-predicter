document.addEventListener('DOMContentLoaded', () => {
    // --- All variables remain the same ---
    const searchBtn = document.getElementById('search-btn');
    const ingredientInput = document.getElementById('ingredient-input');
    const recipeResults = document.getElementById('recipe-results');
    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const dietFilter = document.getElementById('diet-filter');

    // IMPORTANT: Make sure your API key is here
    const API_KEY = 'c09579fbd4a449e3a3ac72f2f6f55779';

    // --- All event listeners remain the same ---
    searchBtn.addEventListener('click', findRecipes);
    ingredientInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            findRecipes();
        }
    });
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // --- findRecipes function (UPDATED) ---
    async function findRecipes() {
        const ingredients = ingredientInput.value.trim();
        const cuisine = cuisineFilter.value;
        const diet = dietFilter.value;

        if (!ingredients) {
            alert('Please enter some ingredients.');
            return;
        }

        recipeResults.innerHTML = '<p>Searching for recipes...</p>';

        // --- THE FIX IS HERE ---
        // 1. CHANGED: The API endpoint is now "complexSearch"
        // 2. CHANGED: The ingredients parameter is now "includeIngredients"
        let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&includeIngredients=${ingredients}&number=12`;

        if (cuisine) {
            apiUrl += `&cuisine=${cuisine}`;
        }
        if (diet) {
            apiUrl += `&diet=${diet}`;
        }
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // The data structure from complexSearch is { results: [...] }
            const data = await response.json();
            displayRecipes(data.results); // Pass data.results to the display function
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeResults.innerHTML = '<p>Sorry, something went wrong. Please try again later.</p>';
        }
    }
    
    // --- displayRecipes function (Small update) ---
    // The complexSearch endpoint returns an object with a 'results' array.
    // The rest of the code works with that array. No big changes needed here.
    function displayRecipes(recipes) {
        recipeResults.innerHTML = '';
        if (recipes.length === 0) {
            recipeResults.innerHTML = '<p>No recipes found. Try different ingredients or filters!</p>';
            return;
        }
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}">
                <div class="recipe-card-content">
                    <h3>${recipe.title}</h3>
                    <button class="view-recipe-btn" data-id="${recipe.id}">View Recipe</button>
                </div>
            `;
            recipeResults.appendChild(recipeCard);
        });
    }

    // --- The recipe details functions remain unchanged ---
    recipeResults.addEventListener('click', async (event) => {
        if (event.target.classList.contains('view-recipe-btn')) {
            const recipeId = event.target.getAttribute('data-id');
            await getRecipeDetails(recipeId);
        }
    });

    async function getRecipeDetails(id) {
        modalBody.innerHTML = '<p>Loading details...</p>';
        modal.style.display = 'block';
        const apiUrl = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const details = await response.json();
            modalBody.innerHTML = `
                <h2>${details.title}</h2>
                <img src="${details.image}" alt="${details.title}" style="width:100%; border-radius: 8px;">
                <p><strong>Ready in:</strong> ${details.readyInMinutes} minutes</p>
                <p><strong>Servings:</strong> ${details.servings}</p>
                <h3>Ingredients</h3>
                <ul>
                    ${details.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}
                </ul>
                <h3>Instructions</h3>
                <div class="instructions">
                    ${details.instructions || 'Instructions not available.'}
                </div>
            `;
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            modalBody.innerHTML = '<p>Could not fetch recipe details. Please try again.</p>';
        }
    }
});