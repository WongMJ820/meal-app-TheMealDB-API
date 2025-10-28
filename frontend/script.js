// Initialize
window.addEventListener("load", () => {
    showMealFirstB(); // default show meals that start with B
    searchByCategory(); // load category dropdown
    searchByAlphabet(); // load alphabet buttons
});

// Common function to create a meal card
function createMealCard(meal) {
    const div = document.createElement("div");
    div.className = "meal";
    div.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h3>${meal.strMeal}</h3>
        ${meal.strCategory ? `<p><strong>Category:</strong> ${meal.strCategory}</p>` : ""}
        ${meal.strArea ? `<p><strong>Area:</strong> ${meal.strArea}</p>` : ""}
        <button class="show-details">Ingredients & Instructions</button>
    `;

    // Add click event for showing details popup
    div.querySelector(".show-details").addEventListener("click", () => showMealDetails(meal));

    return div;
}

// Common function to update meals list
function updateMeals(meals, titleText) {
    const title = document.getElementById("title");
    const mealList = document.getElementById("mealList");

    title.textContent = titleText;
    mealList.innerHTML = "";

    if (!meals || meals.length === 0) {
        mealList.innerHTML = "<p>No meals found.</p>";
        return;
    }

    meals.forEach(meal => mealList.appendChild(createMealCard(meal)));
}

// Level 1
// Fetch meals from backend
function showMealFirstB() {
    fetch("http://localhost:5000/meals")
    fetch("https://www.themealdb.com/api/json/v1/1/search.php?f=b")
        .then(res => res.json())
        .then(data => updateMeals(data.meals, "🍽️ Meal App (Letter B)"))
        .catch(err => console.error("Error fetching meals:", err));
}

// Create popup box dynamically
function showMealDetails(meal) {
    // Create infobox background
    const infobox = document.createElement("div");
    infobox.className = "infobox";
    infobox.innerHTML = `
        <div class="infobox-content">
        <span class="close-btn">&times;</span>
        <h2>${meal.strMeal}</h2>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h3>Ingredients:</h3>
        <ul>
            ${Array.from({ length: 20 }, (_, i) => i + 1)  // Generate numbers 1 to 20
            .map(i => { // Map to ingredient and measure
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                return ingredient ? `<li>${ingredient} - ${measure}</li>` : "";
            })
            .join("")}
        </ul>
        <h3>Instructions:</h3>
        <ol>
            ${meal.strInstructions
                .split(/\r?\n/) // Split by new lines
                .filter(step => step.trim() !== "") // Remove empty lines
                .map(step => `<li>${step.trim()}</li>`) // Wrap each step in <li>
                .join("")
            }
        </ol>
        </div>
    `;
    document.body.appendChild(infobox); // Append infobox to body

    // Close button
    infobox.querySelector(".close-btn").addEventListener("click", () => {infobox.remove();});
}



// Level 2
// Search meal categories from TheMealDB
function searchByCategory() {
    fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById("categorySelect");
        const categories = data.categories;

        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.strCategory;
            option.textContent = cat.strCategory;
            select.appendChild(option);
        });
    })
    .catch(err => console.error("Error fetching categories:", err));

    document.getElementById("categorySelect").addEventListener("change", applyCombinedFilter);
}

// Search meal alphabet from TheMealDB
function searchByAlphabet() {
    const alphabetSelect = document.getElementById("alphabetSelect");

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    letters.forEach(letter => {
        const option = document.createElement("option");
        option.value = letter;
        option.textContent = letter;
        alphabetSelect.appendChild(option);
    });

    alphabetSelect.addEventListener("change", applyCombinedFilter);
}

// Combined filter logic
function applyCombinedFilter() {
    const category = document.getElementById("categorySelect").value;
    const letter = document.getElementById("alphabetSelect").value;

    const mealList = document.getElementById("mealList");
    mealList.innerHTML = "<p>Loading meals...</p>";

    // Case 1: No filters selected
    if (!category && !letter) {
        showMealFirstB();
        return;
    }

    // Case 2: Only category selected
    if (category && !letter) {
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
            .then(res => res.json())
            .then(data => updateMeals(data.meals, `🍽️ Meal App (${category})`))
            .catch(err => console.error("Error fetching meals by category:", err));
        return;
    }

    // Case 3: Only alphabet selected
    if (!category && letter) {
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`)
            .then(res => res.json())
            .then(data => updateMeals(data.meals, `🍽️ Meal App (Starts with "${letter}")`))
            .catch(err => console.error("Error fetching meals by alphabet:", err));
        return;
    }

    // Case 4: Both category + letter selected → combine filters
    if (category && letter) {
        // Fetch both category and letter meals in parallel
        Promise.all([
            fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`).then(r => r.json()),
            fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`).then(r => r.json())
        ])
        .then(([catData, letterData]) => {
            const catMeals = catData.meals || [];
            const letterMeals = letterData.meals || [];

            const filtered = letterMeals.filter(m =>
                catMeals.some(c => c.idMeal === m.idMeal)
            );

            updateMeals(
                filtered,
                `🍽️ Meal App (${category}, Starts with "${letter}")`
            );
        })
        .catch(err => console.error("Error combining filters:", err));
    }
}
