const API_URL = "https://api.freeapi.app/api/v1/public/quotes";

const container = document.getElementById("quotes");
const loader = document.getElementById("loader");
const errorText = document.getElementById("error");
const emptyState = document.getElementById("emptyState");

const highlightQuote = document.getElementById("highlightQuote");
const highlightAuthor = document.getElementById("highlightAuthor");
const searchInput = document.getElementById("searchInput");
const favCount = document.getElementById("favCount");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

let allQuotes = [];
let filteredQuotes = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let isDarkMode = localStorage.getItem("darkMode") === "true";
let isShowingFavorites = false;

// Initialize dark mode on page load
function initializeDarkMode() {
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
    document.getElementById("themeIcon").innerText = "☀️";
  }
  updateFavoriteCount();
}

// Toggle dark mode
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem("darkMode", isDarkMode);
  
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
    document.getElementById("themeIcon").innerText = "☀️";
  } else {
    document.documentElement.classList.remove("dark");
    document.getElementById("themeIcon").innerText = "🌙";
  }
}

// Fetch quotes from API
async function fetchQuotes() {
  try {
    loader.style.display = "block";
    errorText.innerText = "";
    container.innerHTML = "";

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch");
    
    const data = await res.json();
    allQuotes = data.data.data;
    filteredQuotes = [...allQuotes];

    renderQuotes(filteredQuotes);
    showRandomQuote();

    loader.style.display = "none";

  } catch (err) {
    loader.style.display = "none";
    errorText.innerText = "❌ Failed to load quotes. Please try again later.";
    console.error("Error fetching quotes:", err);
  }
}

// Render quotes grid
function renderQuotes(quotes) {
  container.innerHTML = "";
  
  if (quotes.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  
  emptyState.classList.add("hidden");

  container.innerHTML = quotes.map(q => {
    const isFavorited = favorites.some(fav => fav.id === q.id);
    return `
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl hover:scale-105 transition transform duration-200 flex flex-col justify-between">
        <div>
          <p class="text-base italic font-light text-gray-900 dark:text-white mb-3">
            "${q.content}"
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            — ${q.author}
          </p>
        </div>
        
        <div class="flex gap-2 flex-wrap">
          <button onclick="copyQuote('${q.content.replace(/'/g, "\\'")}')"
            class="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition flex items-center justify-center gap-2">
            📋 Copy
          </button>
          <button onclick="toggleFavorite('${q.id}', '${q.content.replace(/'/g, "\\'").replace(/"/g, '\\"')}', '${q.author.replace(/'/g, "\\'")}')"
            class="bg-${isFavorited ? 'red' : 'gray'}-500 hover:bg-${isFavorited ? 'red' : 'gray'}-600 text-white px-3 py-2 rounded text-sm font-medium transition">
            ${isFavorited ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Copy quote to clipboard
function copyQuote(content) {
  navigator.clipboard.writeText(content).then(() => {
    showToast("✅ Quote copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy:", err);
    showToast("❌ Failed to copy quote");
  });
}

// Copy highlight quote
function copyHighlightQuote() {
  const text = `${highlightQuote.innerText}\n${highlightAuthor.innerText}`;
  navigator.clipboard.writeText(text).then(() => {
    showToast("✅ Quote copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy:", err);
    showToast("❌ Failed to copy quote");
  });
}

// Show toast notification
function showToast(message) {
  toastMessage.innerText = message;
  toast.classList.remove("hidden");
  
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

// Toggle favorite
function toggleFavorite(id, content, author) {
  const index = favorites.findIndex(fav => fav.id === id);
  
  if (index > -1) {
    favorites.splice(index, 1);
    showToast("❤️ Removed from favorites");
  } else {
    favorites.push({ id, content, author });
    showToast("❤️ Added to favorites!");
  }
  
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoriteCount();
  
  if (isShowingFavorites) {
    showFavorites();
  } else {
    renderQuotes(filteredQuotes);
  }
}

// Update favorite count
function updateFavoriteCount() {
  favCount.innerText = favorites.length;
}

// Show favorites
function showFavorites() {
  isShowingFavorites = true;
  searchInput.value = "";
  
  if (favorites.length === 0) {
    showToast("📭 No favorites yet!");
    renderQuotes([]);
    return;
  }
  
  renderQuotes(favorites);
}

// Show all quotes
function showAllQuotes() {
  isShowingFavorites = false;
  searchInput.value = "";
  filteredQuotes = [...allQuotes];
  renderQuotes(filteredQuotes);
}

// Filter quotes by author
function filterQuotes() {
  isShowingFavorites = false;
  const searchTerm = searchInput.value.toLowerCase();
  
  if (searchTerm === "") {
    filteredQuotes = [...allQuotes];
  } else {
    filteredQuotes = allQuotes.filter(q => 
      q.author.toLowerCase().includes(searchTerm) ||
      q.content.toLowerCase().includes(searchTerm)
    );
  }
  
  renderQuotes(filteredQuotes);
}

// Show random quote
function showRandomQuote() {
  if (allQuotes.length === 0) return;
  
  const random = allQuotes[Math.floor(Math.random() * allQuotes.length)];
  highlightQuote.innerText = `"${random.content}"`;
  highlightAuthor.innerText = `— ${random.author}`;
}

// Get random quote (button handler)
function getRandomQuote() {
  showRandomQuote();
  showToast("🎲 New quote generated!");
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  initializeDarkMode();
  fetchQuotes();
});
