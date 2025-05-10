// --- Global Variables & Constants ---
console.log("[DEBUG] JS: Script start.");
const API_KEY = 'eacc73ab9261fcee9b1146019d49d625'; // Your working API Key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const POSTER_SIZE_CARD = 'w342';
const POSTER_SIZE_DETAIL = 'w500';
const BACKDROP_SIZE = 'w1280';

const GENRE_DRAMA = 18;
const GENRE_ANIMATION = 16;
const KEYWORD_ANIME = 210024;

// --- localStorage Helper Functions ---
console.log("[DEBUG] JS: Defining localStorage helper functions.");

/** Retrieves parsed data from localStorage safely */
function getLocalStorageItem(key) {
    console.log(`[DEBUG] JS: Getting localStorage item: ${key}`);
    try {
        const item = localStorage.getItem(key);
        if (!item) {
             console.log(`[DEBUG] JS: Item "${key}" not found in localStorage.`);
             return null;
        }
        const parsed = JSON.parse(item);
         console.log(`[DEBUG] JS: Parsed item "${key}".`);
         return parsed;
    } catch (e) {
        console.error(`[DEBUG] JS: *** Error parsing localStorage item "${key}" ***:`, e);
        localStorage.removeItem(key); // Clear potentially corrupted data
        return null;
    }
}

/** Saves data to localStorage safely */
function setLocalStorageItem(key, value) {
     console.log(`[DEBUG] JS: Setting localStorage item: ${key}`);
     try {
         if (value === undefined) {
             console.warn(`[DEBUG] JS: Attempted to save undefined value for key "${key}". Saving null instead.`);
             localStorage.setItem(key, JSON.stringify(null));
         } else {
             localStorage.setItem(key, JSON.stringify(value));
             console.log(`[DEBUG] JS: Successfully saved to localStorage key "${key}".`);
         }
     } catch (e) {
         console.error(`[DEBUG] JS: *** Error setting localStorage item "${key}" ***:`, e);
         alert("Warning: Could not save changes. Local storage might be disabled or full.");
     }
 }

// --- Simulated Auth & Watchlist Storage ---
console.log("[DEBUG] JS: Setting up simulated storage variables.");
let simulatedUsers = getLocalStorageItem('sobiflixUsers') || {};
let userWatchlists = getLocalStorageItem('sobiflixUserWatchlists') || {};
console.log("[DEBUG] JS: Initial localStorage data retrieved.");
console.log("[DEBUG] JS: Initial simulated users count:", Object.keys(simulatedUsers).length);


// --- Authentication Functions ---
console.log("[DEBUG] JS: Defining Auth functions.");

function getCurrentUser() {
    const user = localStorage.getItem('sobiflixCurrentUser');
    return user;
}

function isLoggedIn() {
    return !!getCurrentUser();
}

function handleSignup(event) {
    event.preventDefault();
    console.log("[DEBUG] JS: handleSignup called.");
    const usernameInput = document.getElementById('signup-username');
    const passwordInput = document.getElementById('signup-password');
    const errorElement = document.getElementById('signup-error');

    if (!usernameInput || !passwordInput || !errorElement) { console.error("JS: Signup form elements missing!"); return; }
    errorElement.textContent = '';
    errorElement.style.display = 'none';

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) { /* ... error handling ... */ errorElement.textContent = "Username/Password required."; errorElement.style.display = 'block'; return; }
    if (/\s/.test(username)) { /* ... error handling ... */ errorElement.textContent = "Username cannot contain spaces."; errorElement.style.display = 'block'; return; }

    if (simulatedUsers[username]) { /* ... error handling ... */ errorElement.textContent = `Username "${username}" already exists.`; errorElement.style.display = 'block'; return; }

    simulatedUsers[username] = password;
    setLocalStorageItem('sobiflixUsers', simulatedUsers);
    localStorage.setItem('sobiflixCurrentUser', username);
    userWatchlists[username] = userWatchlists[username] || [];
    setLocalStorageItem('sobiflixUserWatchlists', userWatchlists);

    console.log("JS: Signup successful for:", username);
    alert(`Signup successful for ${username}! You are now logged in. Redirecting...`);
    window.location.href = 'index.html';
}

function handleLogin(event) {
    event.preventDefault();
    console.log("[DEBUG] JS: handleLogin called.");
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const errorElement = document.getElementById('login-error');

    if (!usernameInput || !passwordInput || !errorElement) { console.error("JS: Login form elements missing!"); return; }
    errorElement.textContent = '';
    errorElement.style.display = 'none';

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) { /* ... error handling ... */ errorElement.textContent = "Username/Password required."; errorElement.style.display = 'block'; return; }

    if (!simulatedUsers[username] || simulatedUsers[username] !== password) {
        errorElement.textContent = "Invalid username or password.";
        errorElement.style.display = 'block';
        console.log(`JS: Login failed for user "${username}".`);
        return;
    }

    localStorage.setItem('sobiflixCurrentUser', username);
    userWatchlists[username] = userWatchlists[username] || [];
    setLocalStorageItem('sobiflixUserWatchlists', userWatchlists);

    console.log("JS: Login successful for:", username);
    alert(`Login successful for ${username}! Redirecting...`);
    window.location.href = 'index.html';
}

function handleLogout() {
    const loggedInUser = getCurrentUser();
    console.log("[DEBUG] JS: handleLogout called for user:", loggedInUser);
    if (loggedInUser) {
        localStorage.removeItem('sobiflixCurrentUser');
        console.log("JS: User removed from localStorage.");
        alert("You have been logged out.");

        if (document.body.dataset.currentPage === 'watchlist') {
            console.log("JS: Redirecting from watchlist page after logout.");
            window.location.href = 'index.html';
        } else {
            console.log("JS: Reloading current page after logout.");
            location.reload();
        }
    } else { console.log("JS: handleLogout called but no user was logged in."); }
}

/** Updates Login/Signup/Logout buttons based on login state */
function updateAuthUI() {
    console.log("[DEBUG] JS: updateAuthUI - START");
    try {
        const loggedInUser = getCurrentUser();
        const loginBtn = document.querySelector('.auth-login');
        const signupBtn = document.querySelector('.auth-signup');
        const logoutBtn = document.querySelector('.auth-logout');

        if (!loginBtn || !signupBtn || !logoutBtn) { console.log("[DEBUG] JS: updateAuthUI - Auth buttons not found on this page."); return; }

        logoutBtn.removeEventListener('click', handleLogout); // Remove first

        if (loggedInUser) {
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            logoutBtn.addEventListener('click', handleLogout);
            console.log("[DEBUG] JS: updateAuthUI - Showing Logout button.");
        } else {
            loginBtn.style.display = 'inline-block';
            signupBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            console.log("[DEBUG] JS: updateAuthUI - Showing Login/Signup buttons.");
        }
    } catch (error) { console.error("[DEBUG] JS: *** ERROR in updateAuthUI ***:", error); }
    console.log("[DEBUG] JS: updateAuthUI - END");
}

// --- User-Specific Watchlist Functions ---
console.log("[DEBUG] JS: Defining User-Specific Watchlist functions.");

function getUserWatchlist(username) {
    if (!username) { return []; }
    return userWatchlists[username] || [];
}

function saveUserWatchlist(username, list) {
    if (!username) { console.error("JS: Attempted to save watchlist without username!"); return; }
    const listToSave = Array.isArray(list) ? list : [];
    userWatchlists[username] = listToSave;
    setLocalStorageItem('sobiflixUserWatchlists', userWatchlists);
    console.log(`JS: Saved watchlist for "${username}". Items: ${listToSave.length}`);
}

function isItemInWatchlist(itemId, itemType) {
    const user = getCurrentUser();
    if (!user) return false;
    const watchlist = getUserWatchlist(user);
    const numItemId = Number(itemId);
    return watchlist.some(item => Number(item.id) === numItemId && item.type === itemType);
}

function addToWatchlist(itemId, itemType, title, posterPath) {
    const user = getCurrentUser();
    if (!user) { alert("Please log in to add items to your watchlist."); return false; }
    let watchlist = getUserWatchlist(user);
    const numItemId = Number(itemId);
    if (!watchlist.some(item => Number(item.id) === numItemId && item.type === itemType)) {
         watchlist.push({ id: numItemId, type: itemType, title: title || 'Untitled', poster_path: posterPath || null });
        saveUserWatchlist(user, watchlist);
        console.log(`JS: Added to watchlist for ${user}:`, { id: numItemId, type: itemType });
        return true;
    } else { console.log(`JS: Item (${itemId}, ${itemType}) already in watchlist for ${user}.`); return false; }
}

function removeFromWatchlist(itemId, itemType) {
    const user = getCurrentUser();
    if (!user) return false;
    let watchlist = getUserWatchlist(user);
    const initialLength = watchlist.length;
    const numItemId = Number(itemId);
    const updatedWatchlist = watchlist.filter(item => !(Number(item.id) === numItemId && item.type === itemType));
    if (updatedWatchlist.length < initialLength) {
        saveUserWatchlist(user, updatedWatchlist);
        console.log(`JS: Removed from watchlist for ${user}:`, { id: numItemId, type: itemType });
         if (document.body.dataset.currentPage === 'watchlist') {
             console.log("JS: Refreshing watchlist page display after removal.");
             initWatchlistPage();
         }
        return true;
    } else { console.log(`JS: Item (${itemId}, ${itemType}) not found in watchlist for ${user}.`); return false; }
}

/** Updates the visual state of a watchlist add/remove button */
function updateWatchlistButtonUI(button, itemId, itemType) {
    console.log(`[DEBUG] JS: updateWatchlistButtonUI called for item ${itemId}`);
    if (!button) { console.warn(`[DEBUG] JS: updateWatchlistButtonUI - button is null for item ${itemId}`); return; }
    try {
       const isInList = isItemInWatchlist(itemId, itemType);
       const icon = button.querySelector('i');
       if (!icon) { console.warn(`[DEBUG] JS: updateWatchlistButtonUI - icon not found in button for ${itemId}`); }

       if (button.classList.contains('watchlist-remove-btn')) {
            button.disabled = !isLoggedIn();
            console.log(`[DEBUG] JS: updateWatchlistButtonUI - Remove button state updated (disabled: ${!isLoggedIn()}).`);
            return;
       }

       if (isInList) {
           button.classList.add('added');
           button.setAttribute('aria-label', 'Remove from Watchlist');
           if (icon) icon.className = 'fas fa-check';
       } else {
           button.classList.remove('added');
           button.setAttribute('aria-label', 'Add to Watchlist');
           if (icon) icon.className = 'fas fa-plus';
       }
       console.log(`[DEBUG] JS: Updated button UI for ${itemId}. In list: ${isInList}`);
    } catch (error) { console.error(`[DEBUG] JS: *** ERROR in updateWatchlistButtonUI for item ${itemId} ***:`, error); }
}


// --- API Fetching ---
console.log("[DEBUG] JS: Defining fetchTMDbData.");
async function fetchTMDbData(endpoint, queryParams = '') {
     console.log(`[DEBUG] JS: Fetching START: ${endpoint}`);
     const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US${queryParams}`;
     try {
         const response = await fetch(url);
         console.log(`[DEBUG] JS: Fetch Status for ${endpoint}: ${response.status}`);
         if (!response.ok) { /* ... more detailed error logging ... */ console.error(`HTTP error! Status: ${response.status} for URL: ${url}`); throw new Error(`HTTP error! Status: ${response.status}`); }
         const data = await response.json();
         console.log(`[DEBUG] JS: Fetch SUCCESS for ${endpoint}. Results count: ${data.results?.length}`);
         return data;
     } catch (error) { console.error(`[DEBUG] JS: *** Fetch FAILED for ${endpoint} ***`, error); return null; }
}


// --- Card Creation ---
console.log("[DEBUG] JS: Defining createGenericCard.");
function createGenericCard(item, itemType = 'movie', options = { showRemoveButton: false }) {
    console.log(`[DEBUG] JS: Creating card START - ID: ${item?.id}, Type: ${itemType}`);
    if (!item || typeof item !== 'object' || !item.id || !(item.title || item.name)) { console.warn(`[DEBUG] JS: Skipping card creation - Invalid item data:`, item); return null; }

    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    if (options.showRemoveButton) { itemCard.classList.add('watchlist-card'); }
    itemCard.dataset.itemId = item.id;
    itemCard.dataset.itemType = itemType;

    const title = itemType === 'movie' ? item.title : item.name;
    const releaseDateRaw = itemType === 'movie' ? item.release_date : item.first_air_date;
    const releaseDate = releaseDateRaw ? releaseDateRaw.substring(0, 4) : '';
    const detailLink = `movie-detail.html?id=${item.id}&type=${itemType}`;
    const posterPath = item.poster_path ? `${IMAGE_BASE_URL}${POSTER_SIZE_CARD}${item.poster_path}` : 'images/placeholder-poster.png';
    const posterForStorage = item.poster_path;

    let actionButtonHtml = '';
    if (options.showRemoveButton) { actionButtonHtml = `<button class="watchlist-remove-btn" aria-label="Remove from Watchlist"><i class="fas fa-trash"></i></button>`; }
    else { actionButtonHtml = `<button class="watchlist-btn" aria-label="Add to Watchlist"><i class="fas fa-plus"></i></button>`; }

    itemCard.innerHTML = `
        <img src="${posterPath}" alt="${title || 'Poster'}">
        <div class="card-overlay">
            ${actionButtonHtml}
            <h3>${title || 'Untitled'}</h3>
            <div class="card-meta">
                ${item.vote_average ? `<span class="rating"><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</span>` : ''}
                ${releaseDate ? `<span class="year">(${releaseDate})</span>` : ''}
            </div>
            ${!options.showRemoveButton ? `<p class="quick-synopsis">${item.overview?.substring(0, 90) + (item.overview?.length > 90 ? '...' : '') || ''}</p>` : ''}
            <a href="${detailLink}" class="btn btn-primary btn-sm">Details</a>
        </div>
    `;

    // Setup action button listener
    console.log(`[DEBUG] JS: Setting up action button for card ${item.id}`);
    try {
        const actionButton = itemCard.querySelector('.watchlist-btn, .watchlist-remove-btn');
        if (actionButton) {
            if (options.showRemoveButton) {
                actionButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Remove "${title}" from your watchlist?`)) { removeFromWatchlist(item.id, itemType); }
                });
                actionButton.disabled = !isLoggedIn();
            } else {
                 console.log(`[DEBUG] JS: Calling updateWatchlistButtonUI for ADD button, item ${item.id}`);
                 updateWatchlistButtonUI(actionButton, item.id, itemType);
                 actionButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const user = getCurrentUser();
                    if (!user) { alert("Please log in to manage your watchlist."); return; }
                    console.log(`[DEBUG] JS: Watchlist ADD/REMOVE button clicked for item ${item.id}`);
                    const isInList = isItemInWatchlist(item.id, itemType);
                    console.log(`[DEBUG] JS: Item ${item.id} currently in list: ${isInList}`);
                    if (isInList) { removeFromWatchlist(item.id, itemType); }
                    else { addToWatchlist(item.id, itemType, title, posterForStorage); }
                    console.log(`[DEBUG] JS: Updating button UI again after action for ${item.id}`);
                    updateWatchlistButtonUI(actionButton, item.id, itemType);
                });
                // actionButton.disabled = !isLoggedIn();
            }
             console.log(`[DEBUG] JS: Action button listener setup complete for ${item.id}`);
        } else { console.warn(`[DEBUG] JS: Action button *not found* in card HTML for ${item.id}`); }
    } catch (error) { console.error(`[DEBUG] JS: *** ERROR setting up action button for ${item.id} ***:`, error); }

    // Card click navigation
    itemCard.addEventListener('click', (event) => { if (!event.target.closest('button') && !event.target.closest('a')) { window.location.href = detailLink; }});

    console.log(`[DEBUG] JS: Creating card END - ID: ${item.id}`);
    return itemCard;
}

// --- Container Population ---
console.log("[DEBUG] JS: Defining populateContainer.");
function populateContainer(containerSelector, items, defaultItemType = 'movie', isGrid = false) {
    console.log(`[DEBUG] JS: Populating container START - Selector: ${containerSelector}, Items count: ${items?.length}`);
    const container = document.querySelector(containerSelector);
    if (!container) { console.error(`[DEBUG] JS: *** Container not found: ${containerSelector}`); return; }
    container.innerHTML = '';
    container.classList.remove('loading');
    if (!items || items.length === 0) { /* ... handle no items ... */ console.log(`[DEBUG] JS: No items for ${containerSelector}`); container.innerHTML = `<p class="${isGrid ? 'no-results' : ''}">No content found.</p>`; return; }

    let cardsAdded = 0;
    let cardsFailed = 0;
    items.forEach((item, index) => {
        // console.log(`[DEBUG] JS: Processing item #${index + 1}/${items.length} for ${containerSelector}`);
        const type = item.media_type || defaultItemType;
        if (type === 'movie' || type === 'tv') {
             const showRemove = (document.body.dataset.currentPage === 'watchlist');
            const cardElement = createGenericCard(item, type, { showRemoveButton: showRemove });
            if (cardElement) {
                try { container.appendChild(cardElement); cardsAdded++; }
                catch(e) { console.error(`[DEBUG] JS: *** ERROR appending card for item ${item.id} ***:`, e); cardsFailed++; }
            } else { cardsFailed++; }
        } else { /* Skip other types like 'person' */ }
    });
    console.log(`[DEBUG] JS: Populating container END - Selector: ${containerSelector}. Added: ${cardsAdded}, Failed: ${cardsFailed}, Total Items Processed: ${items.length}`);
    if (cardsAdded === 0 && items.length > 0) { /* ... Handle no cards added ... */ container.innerHTML = `<p class="${isGrid ? 'error' : ''}">Could not display content items.</p>`; }
}


// --- Helper: Display loading error in container ---
function displayLoadingError(containerSelector, isGrid = false) {
     console.warn(`[DEBUG] JS: Displaying loading error for ${containerSelector}`);
     const container = document.querySelector(containerSelector);
     if (container) {
         container.classList.remove('loading');
         container.innerHTML = `<p class="${isGrid ? 'error' : ''}">Could not load content.</p>`;
     }
 }

// --- Page Initializers (WITH AWAIT ADDED) ---
console.log("[DEBUG] JS: Defining Page Initializers.");

async function initHomePage() {
    console.log("[DEBUG] JS: Initializing Home Page START");
    const sections = [
        { selector: '#trending-movies .row-items', endpoint: '/trending/movie/week', type: 'movie' },
        { selector: '#now-playing .row-items', endpoint: '/movie/now_playing', type: 'movie' },
        { selector: '#top-rated-tv .row-items', endpoint: '/tv/top_rated', type: 'tv' },
        { selector: '#upcoming-movies .row-items', endpoint: '/movie/upcoming', type: 'movie' }
    ];
    console.log(`[DEBUG] JS: initHomePage - Defined ${sections.length} sections.`);
    try {
        for (const section of sections) {
             console.log(`[DEBUG] JS: initHomePage - Processing section: ${section.selector}`);
             const data = await fetchTMDbData(section.endpoint, section.params || ''); // ADDED AWAIT
             console.log(`[DEBUG] JS: initHomePage - Data received for ${section.selector}:`, data ? `results: ${data.results?.length}` : 'null');
             if (data && data.results) {
                  console.log(`[DEBUG] JS: initHomePage - Calling populateContainer for ${section.selector}`);
                 populateContainer(section.selector, data.results, section.type);
             } else {
                 console.warn(`[DEBUG] JS: initHomePage - No data/results for ${section.selector}.`);
                 displayLoadingError(section.selector);
             }
              console.log(`[DEBUG] JS: initHomePage - Finished processing section: ${section.selector}`);
        }
    } catch (error) { console.error(`[DEBUG] JS: *** ERROR inside initHomePage loop ***:`, error); }
     console.log("[DEBUG] JS: Initializing Home Page END");
}

async function initMoviesPage() {
    console.log("[DEBUG] JS: Initializing Movies Page START");
    const sections = [
        { selector: '#popular-movies .row-items', endpoint: '/movie/popular', type: 'movie', isGrid: false },
        { selector: '#top-rated-movies .content-grid', endpoint: '/movie/top_rated', type: 'movie', isGrid: true },
        { selector: '#upcoming-movies .row-items', endpoint: '/movie/upcoming', type: 'movie', isGrid: false },
    ];
    console.log(`[DEBUG] JS: initMoviesPage - Defined ${sections.length} sections.`);
     try {
        for (const section of sections) {
            console.log(`[DEBUG] JS: initMoviesPage - Processing section: ${section.selector}`);
            const data = await fetchTMDbData(section.endpoint, section.params || ''); // ADDED AWAIT
            console.log(`[DEBUG] JS: initMoviesPage - Data received for ${section.selector}:`, data ? `results: ${data.results?.length}` : 'null');
            if (data && data.results) {
                console.log(`[DEBUG] JS: initMoviesPage - Calling populateContainer for ${section.selector}`);
                populateContainer(section.selector, data.results, section.type, section.isGrid);
            } else {
                console.warn(`[DEBUG] JS: initMoviesPage - No data/results for ${section.selector}.`);
                displayLoadingError(section.selector, section.isGrid);
            }
             console.log(`[DEBUG] JS: initMoviesPage - Finished processing section: ${section.selector}`);
        }
    } catch (error) { console.error(`[DEBUG] JS: *** ERROR inside initMoviesPage loop ***:`, error); }
    console.log("[DEBUG] JS: Initializing Movies Page END");
}

async function initDramaPage() {
     console.log("[DEBUG] JS: Initializing Drama Page START");
     const sections = [
        { selector: '#popular-drama-tv .row-items', endpoint: '/discover/tv', params: `&with_genres=${GENRE_DRAMA}&sort_by=popularity.desc`, type: 'tv', isGrid: false },
        { selector: '#top-rated-drama-movies .content-grid', endpoint: '/discover/movie', params: `&with_genres=${GENRE_DRAMA}&sort_by=vote_average.desc&vote_count.gte=200`, type: 'movie', isGrid: true }
    ];
     console.log(`[DEBUG] JS: initDramaPage - Defined ${sections.length} sections.`);
    try {
        for (const section of sections) {
            console.log(`[DEBUG] JS: initDramaPage - Processing section: ${section.selector}`);
            const data = await fetchTMDbData(section.endpoint, section.params || ''); // ADDED AWAIT
            console.log(`[DEBUG] JS: initDramaPage - Data received for ${section.selector}:`, data ? `results: ${data.results?.length}` : 'null');
            if (data && data.results) {
                 console.log(`[DEBUG] JS: initDramaPage - Calling populateContainer for ${section.selector}`);
                 populateContainer(section.selector, data.results, section.type, section.isGrid);
            } else {
                 console.warn(`[DEBUG] JS: initDramaPage - No data/results for ${section.selector}.`);
                 displayLoadingError(section.selector, section.isGrid);
            }
            console.log(`[DEBUG] JS: initDramaPage - Finished processing section: ${section.selector}`);
        }
     } catch (error) { console.error(`[DEBUG] JS: *** ERROR inside initDramaPage loop ***:`, error); }
    console.log("[DEBUG] JS: Initializing Drama Page END");
}

async function initAnimePage() {
    console.log("[DEBUG] JS: Initializing Anime Page START");
    const sections = [
        { selector: '#popular-anime-series .row-items', endpoint: '/discover/tv', params: `&with_genres=${GENRE_ANIMATION}&with_keywords=${KEYWORD_ANIME}&sort_by=popularity.desc`, type: 'tv', isGrid: false },
        { selector: '#top-rated-anime-movies .content-grid', endpoint: '/discover/movie', params: `&with_genres=${GENRE_ANIMATION}&sort_by=vote_average.desc&vote_count.gte=100`, type: 'movie', isGrid: true },
        { selector: '#popular-anime-movies .row-items', endpoint: '/discover/movie', params: `&with_genres=${GENRE_ANIMATION}&sort_by=popularity.desc`, type: 'movie', isGrid: false },
    ];
     console.log(`[DEBUG] JS: initAnimePage - Defined ${sections.length} sections.`);
     try {
         for (const section of sections) {
              console.log(`[DEBUG] JS: initAnimePage - Processing section: ${section.selector}`);
              const data = await fetchTMDbData(section.endpoint, section.params || ''); // ADDED AWAIT
              console.log(`[DEBUG] JS: initAnimePage - Data received for ${section.selector}:`, data ? `results: ${data.results?.length}` : 'null');
              if (data && data.results) {
                  console.log(`[DEBUG] JS: initAnimePage - Calling populateContainer for ${section.selector}`);
                  populateContainer(section.selector, data.results, section.type, section.isGrid);
              } else {
                  console.warn(`[DEBUG] JS: initAnimePage - No data/results for ${section.selector}.`);
                  displayLoadingError(section.selector, section.isGrid);
              }
              console.log(`[DEBUG] JS: initAnimePage - Finished processing section: ${section.selector}`);
         }
      } catch (error) { console.error(`[DEBUG] JS: *** ERROR inside initAnimePage loop ***:`, error); }
     console.log("[DEBUG] JS: Initializing Anime Page END");
}

async function initBrowsePage() {
    console.log("[DEBUG] JS: Initializing Browse Page START");
    try {
        console.log(`[DEBUG] JS: initBrowsePage - Fetching trending all...`);
        const trendingAllData = await fetchTMDbData('/trending/all/week'); // ADDED AWAIT
         console.log(`[DEBUG] JS: initBrowsePage - Data received:`, trendingAllData ? `results: ${trendingAllData.results?.length}` : 'null');

        if (trendingAllData && trendingAllData.results) {
             const mediaItems = trendingAllData.results
                .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
                .sort((a, b) => b.popularity - a.popularity);
              console.log(`[DEBUG] JS: initBrowsePage - Filtered to ${mediaItems.length} movies/tv shows. Calling populateContainer.`);
             populateContainer('#browse-all-trending .content-grid', mediaItems, 'movie', true);
        } else {
            console.warn(`[DEBUG] JS: initBrowsePage - No trending data/results.`);
            displayLoadingError('#browse-all-trending .content-grid', true);
        }
    } catch (error) { console.error(`[DEBUG] JS: *** ERROR inside initBrowsePage ***:`, error); }
    console.log("[DEBUG] JS: Initializing Browse Page END");
}

async function initMovieDetailPage() {
    console.log("[DEBUG] JS: Initializing Detail Page START");
    const contentArea = document.getElementById('movie-detail-content');
    if (!contentArea) { console.error("[DEBUG] JS: Detail content area not found!"); return; }
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    const itemType = urlParams.get('type') || 'movie';
    console.log(`[DEBUG] JS: initDetailPage - Item ID: ${itemId}, Item Type: ${itemType}`);
    if (!itemId) { contentArea.innerHTML = '<p class="error container">Error: Item ID not found in URL.</p>'; return; }

    contentArea.innerHTML = '<div class="loading-spinner"></div>';

    try {
        console.log(`[DEBUG] JS: initDetailPage - Fetching details for ${itemType} ${itemId}...`);
        const [itemDetails, credits, videos, similarItems, reviews] = await Promise.all([
            fetchTMDbData(`/${itemType}/${itemId}`),
            fetchTMDbData(`/${itemType}/${itemId}/credits`),
            fetchTMDbData(`/${itemType}/${itemId}/videos`),
            fetchTMDbData(`/${itemType}/${itemId}/similar`),
            fetchTMDbData(`/${itemType}/${itemId}/reviews`)
        ]);
        console.log("[DEBUG] JS: initDetailPage - All detail fetches complete.");

        if (!itemDetails) {
            console.error(`[DEBUG] JS: initDetailPage - Failed to fetch essential itemDetails for ${itemId}.`);
            contentArea.innerHTML = '<p class="error container">Error: Could not load item details.</p>';
            contentArea.classList.add('loaded');
            return;
        }

        // Re-insert the HTML structure
        console.log("[DEBUG] JS: initDetailPage - Re-inserting HTML structure...");
        contentArea.innerHTML = `
            <section class="movie-backdrop" style="background-image: url('${itemDetails.backdrop_path ? IMAGE_BASE_URL + BACKDROP_SIZE + itemDetails.backdrop_path : ''}');">
                <div class="backdrop-overlay"></div>
                <div class="detail-header container">
                    <div class="poster-container">
                        <img src="${itemDetails.poster_path ? IMAGE_BASE_URL + POSTER_SIZE_DETAIL + itemDetails.poster_path : 'images/placeholder-poster.png'}" alt="${itemDetails.title || itemDetails.name}" id="detail-poster">
                    </div>
                    <div class="detail-info">
                        <h1 id="detail-title">${itemDetails.title || itemDetails.name}</h1>
                        <div class="meta-info">
                            <span class="rating" id="detail-rating"><i class="fas fa-star"></i> ${itemDetails.vote_average?.toFixed(1) || 'N/A'}</span>
                            <span class="separator">|</span>
                            <span id="detail-runtime">${itemDetails.runtime || itemDetails.episode_run_time?.[0] || 0} min</span>
                            <span class="separator">|</span>
                            <span id="detail-release-date">${itemDetails.release_date || itemDetails.first_air_date || 'N/A'}</span>
                            <span class="separator">|</span>
                            <span id="detail-genres">${itemDetails.genres?.map(g => g.name).join(', ') || 'N/A'}</span>
                        </div>
                        <p class="tagline" id="detail-tagline">${itemDetails.tagline || ''}</p>
                        <h2>Overview</h2>
                        <p class="synopsis" id="detail-synopsis">${itemDetails.overview || 'No overview available.'}</p>
                        <div class="detail-actions">
                            <button class="btn btn-primary btn-lg" id="play-trailer-btn"><i class="fas fa-play"></i> Play Trailer</button>
                            <button class="btn btn-primary btn-lg" id="watch-movie-btn"><i class="fas fa-film"></i> Watch Movie</button>
                            <button class="btn btn-secondary watchlist-btn"><i class="fas fa-plus"></i> Add to Watchlist</button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="movie-tabs container">
                <div class="tab-buttons">
                    <button class="tab-btn active" data-tab="cast">Cast</button>
                    <button class="tab-btn" data-tab="reviews">Reviews</button>
                    <button class="tab-btn" data-tab="similar">Similar ${itemType === 'movie' ? 'Movies' : 'Shows'}</button>
                </div>
                <div class="tab-content">
                    <div class="tab-pane active" id="cast">
                        <h3>Top Billed Cast</h3>
                        <div class="cast-list" id="detail-cast"></div>
                    </div>
                    <div class="tab-pane" id="reviews">
                        <h3>Reviews</h3>
                        <div id="detail-reviews"></div>
                    </div>
                    <div class="tab-pane" id="similar">
                        <h3>Similar ${itemType === 'movie' ? 'Movies' : 'Shows'}</h3>
                        <div class="row-items" id="detail-similar-movies"></div>
                    </div>
                </div>
            </section>

            <div class="modal" id="trailer-modal">
                <div class="modal-content">
                    <span class="close-modal-btn">×</span>
                    <div class="video-container">
                        <iframe id="youtube-trailer" width="560" height="315" src="" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div>
                </div>
            </div>

            <!-- Streaming Modal -->
            <div class="modal" id="streaming-modal">
                <div class="modal-content">
                    <span class="close-modal-btn">×</span>
                    <div class="streaming-options">
                        <button class="streaming-source-btn active" data-source="vidsrc">VidSrc</button>
                        <button class="streaming-source-btn" data-source="autoembed">AutoEmbed</button>
                    </div>
                    <div class="video-container">
                        <iframe id="streaming-frame" width="560" height="315" src="" title="Movie Player" frameborder="0" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
        `;

        // Populate Cast
        console.log("[DEBUG] JS: initDetailPage - Populating cast...");
        const castContainer = document.getElementById('detail-cast');
        if (castContainer && credits?.cast) {
            const topCast = credits.cast.slice(0, 6);
            castContainer.innerHTML = topCast.map(actor => `
                <div class="cast-card">
                    <img src="${actor.profile_path ? IMAGE_BASE_URL + 'w185' + actor.profile_path : 'images/placeholder-profile.png'}" alt="${actor.name}">
                    <p>${actor.name}</p>
                    <small>${actor.character}</small>
                </div>
            `).join('');
        }

        // Populate Similar Items
        console.log("[DEBUG] JS: initDetailPage - Populating similar items...");
        const similarContainer = document.getElementById('detail-similar-movies');
        if (similarContainer && similarItems?.results) {
            populateContainer('#detail-similar-movies', similarItems.results.slice(0, 6), itemType);
        }

        // Populate Reviews
        console.log("[DEBUG] JS: initDetailPage - Populating reviews...");
        const reviewsContainer = document.getElementById('detail-reviews');
        if (reviewsContainer && reviews?.results) {
            if (reviews.results.length > 0) {
                reviewsContainer.innerHTML = reviews.results.slice(0, 3).map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <h4>${review.author}</h4>
                            <span class="rating"><i class="fas fa-star"></i> ${review.author_details.rating || 'N/A'}</span>
                        </div>
                        <p>${review.content}</p>
                    </div>
                `).join('');
            } else {
                reviewsContainer.innerHTML = '<p>No reviews available.</p>';
            }
        }

        // Setup Detail Watchlist Button
        console.log("[DEBUG] JS: initDetailPage - Setting up detail watchlist button...");
        const watchlistBtn = contentArea.querySelector('.watchlist-btn');
        if (watchlistBtn) {
            updateWatchlistButtonUI(watchlistBtn, itemId, itemType);
            watchlistBtn.addEventListener('click', () => {
                const isInList = isItemInWatchlist(itemId, itemType);
                if (isInList) {
                    removeFromWatchlist(itemId, itemType);
                } else {
                    addToWatchlist(itemId, itemType, itemDetails.title || itemDetails.name, itemDetails.poster_path);
                }
                updateWatchlistButtonUI(watchlistBtn, itemId, itemType);
            });
        }

        // Trailer Button Logic
        console.log("[DEBUG] JS: initDetailPage - Setting up trailer button...");
        const trailerBtn = document.getElementById('play-trailer-btn');
        const trailerModal = document.getElementById('trailer-modal');
        const closeModalBtn = trailerModal?.querySelector('.close-modal-btn');
        const trailerFrame = document.getElementById('youtube-trailer');

        // Streaming Button Logic
        const watchMovieBtn = document.getElementById('watch-movie-btn');
        const streamingModal = document.getElementById('streaming-modal');
        const streamingCloseBtn = streamingModal?.querySelector('.close-modal-btn');
        const streamingFrame = document.getElementById('streaming-frame');
        const streamingSourceBtns = streamingModal?.querySelectorAll('.streaming-source-btn');

        if (watchMovieBtn && streamingModal && streamingCloseBtn && streamingFrame) {
            let currentSource = 'vidsrc'; // Default source

            // Function to update streaming URL
            const updateStreamingUrl = (source) => {
                const imdbId = itemDetails.imdb_id;
                if (imdbId) {
                    let streamingUrl = '';
                    if (source === 'vidsrc') {
                        streamingUrl = `https://vidsrc.to/embed/movie/${imdbId}`;
                    } else if (source === 'autoembed') {
                        streamingUrl = `https://player.autoembed.cc/embed/movie/${imdbId}`;
                    }
                    streamingFrame.src = streamingUrl;
                }
            };

            // Source selection buttons
            streamingSourceBtns?.forEach(btn => {
                btn.addEventListener('click', () => {
                    streamingSourceBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentSource = btn.dataset.source;
                    updateStreamingUrl(currentSource);
                });
            });

            watchMovieBtn.addEventListener('click', () => {
                const imdbId = itemDetails.imdb_id;
                if (imdbId) {
                    updateStreamingUrl(currentSource);
                    streamingModal.style.display = 'flex';
                } else {
                    alert('Sorry, streaming is not available for this title.');
                }
            });

            streamingCloseBtn.addEventListener('click', () => {
                streamingFrame.src = '';
                streamingModal.style.display = 'none';
            });

            // Close modal when clicking outside
            streamingModal.addEventListener('click', (e) => {
                if (e.target === streamingModal) {
                    streamingFrame.src = '';
                    streamingModal.style.display = 'none';
                }
            });
        }

        if (trailerBtn && trailerModal && closeModalBtn && trailerFrame && videos?.results) {
            const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) {
                trailerBtn.addEventListener('click', () => {
                    trailerFrame.src = `https://www.youtube.com/embed/${trailer.key}`;
                    trailerModal.style.display = 'flex';
                });
                closeModalBtn.addEventListener('click', () => {
                    trailerFrame.src = '';
                    trailerModal.style.display = 'none';
                });
            } else {
                trailerBtn.disabled = true;
                trailerBtn.title = 'No trailer available';
            }
        }

        // Tab Functionality
        console.log("[DEBUG] JS: initDetailPage - Setting up tabs...");
        const tabButtons = contentArea.querySelectorAll('.tab-btn');
        const tabPanes = contentArea.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });

        contentArea.classList.add('loaded');
        console.log("[DEBUG] JS: Detail Page Population Complete.");

    } catch (error) {
        console.error(`[DEBUG] JS: *** ERROR inside initMovieDetailPage ***:`, error);
        contentArea.innerHTML = '<p class="error container">An error occurred loading details. Please try again later.</p>';
        contentArea.classList.add('loaded');
    }
    console.log("[DEBUG] JS: Initializing Detail Page END");
}

async function initWatchlistPage() {
    console.log("[DEBUG] JS: ===== Initializing Watchlist Page START =====");
    const user = getCurrentUser();
    const gridContainer = document.getElementById('watchlist-grid');
    const loginPrompt = document.querySelector('.login-prompt');
    const emptyMessage = document.querySelector('.empty-watchlist-message');
    if (!gridContainer || !loginPrompt || !emptyMessage) { console.error("JS: Watchlist page elements missing!"); return; }

    loginPrompt.style.display = 'none';
    emptyMessage.style.display = 'none';
    gridContainer.style.display = 'none';

    if (!user) { /* ... Show login prompt ... */ console.log("[DEBUG] JS: Watchlist - User not logged in."); gridContainer.classList.remove('loading'); return; }

    console.log(`[DEBUG] JS: Watchlist - Loading for user: ${user}`);
    gridContainer.classList.add('loading');
    gridContainer.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';
    gridContainer.style.display = 'grid';

    // Use try...catch for robustness
    try {
         const watchlist = getUserWatchlist(user); // No async needed here

         if (watchlist.length === 0) { /* ... Show empty message ... */ console.log("[DEBUG] JS: Watchlist - List is empty for user:", user); gridContainer.classList.remove('loading'); gridContainer.innerHTML = ''; gridContainer.style.display = 'none'; return; }

         console.log(`[DEBUG] JS: Watchlist - Found ${watchlist.length} items for user ${user}`);
         gridContainer.innerHTML = '';
         gridContainer.classList.remove('loading');

         for (const item of watchlist) {
              // We DON'T await createGenericCard because it's not async
              const card = createGenericCard({ /* ... item data from storage ... */ id: item.id, title: item.title, name: item.title, poster_path: item.poster_path }, item.type, { showRemoveButton: true });
              if (card) { gridContainer.appendChild(card); }
              else { console.warn(`[DEBUG] JS: Watchlist - Failed to create card for item ID ${item.id}`); }
         }
     } catch (error) {
         console.error("[DEBUG] JS: *** Error inside initWatchlistPage processing loop ***:", error);
         displayLoadingError('#watchlist-grid', true); // Show error in the grid area
     }
    console.log("[DEBUG] JS: Initializing Watchlist Page END");
}

// Search functionality
function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.querySelector('.search-form input');
    const query = searchInput.value.trim();
    
    if (query) {
        // Redirect to search results page with query parameter
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

// Add search form event listener
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
});

// --- General Initialization ---
console.log("[DEBUG] JS: Defining highlightActiveNav and DOMContentLoaded listener.");

function highlightActiveNav() {
     console.log("[DEBUG] JS: highlightActiveNav - START");
     try {
        const currentPage = document.body.dataset.currentPage;
        if (!currentPage) { console.warn("[DEBUG] JS: highlightActiveNav - No data-current-page attribute on body."); return; }
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
             link.classList.remove('active');
             if (link.dataset.page === currentPage) {
                 link.classList.add('active');
                  console.log(`[DEBUG] JS: highlightActiveNav - Activating link for: ${currentPage}`);
             }
        });
     } catch (error) { console.error("[DEBUG] JS: *** ERROR in highlightActiveNav ***:", error); }
     console.log("[DEBUG] JS: highlightActiveNav - END");
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] JS: DOMContentLoaded - START");
     // *** API Key Check ***
     // Using stricter check to warn if default key is used
    let apiKeyIsValid = true;
    if (!API_KEY || API_KEY.length < 10) {
         console.error("JS: FATAL ERROR - TMDb API Key is missing or too short!");
         apiKeyIsValid = false;
     } else if (API_KEY === 'eacc73ab9261fcee9b1146019d49d625') {
          console.warn("JS: WARNING - Using default/placeholder API Key! Please replace it.");
          // Keep apiKeyIsValid = true if you want the default key to *work* for testing
     }
     if(!apiKeyIsValid) {
         alert("Sobiflix requires a valid TMDb API Key. Please add it to js/main.js.");
          document.body.innerHTML = `<div style="padding: 50px; text-align: center; color: #fff; background-color: #111; height: 100vh;"><h1>Configuration Error</h1><p>Please add your valid TMDb API key to the main.js file.</p></div>`;
         return; // STOP EXECUTION
     } else { console.log("[DEBUG] JS: API Key check passed."); }


    // --- Run Initial Setup ---
    console.log("[DEBUG] JS: DOMContentLoaded - Running initial setup functions...");
    try { updateAuthUI(); } catch(e) { console.error("JS: *** ERROR in initial updateAuthUI ***:", e); }
    try { highlightActiveNav(); } catch (e) { console.error("JS: *** Error in initial highlightActiveNav ***:", e); }
    try { // Setup Login/Signup form listeners
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        const signupForm = document.getElementById('signup-form');
        if (signupForm) signupForm.addEventListener('submit', handleSignup);
    } catch (e) { console.error("JS: *** Error adding auth form listeners ***:", e); }
    try { initSearch(); } // Initialize search on all pages where elements exist
    catch (e) { console.error("JS: *** Error initializing search ***:", e); }

    // --- Run Page-Specific Initialization ---
    const currentPage = document.body.dataset.currentPage;
    console.log(`[DEBUG] JS: DOMContentLoaded - Determining init function for page: "${currentPage}"`);
    try {
        let initFunction = null;

        if (document.getElementById('movie-detail-content')) { initFunction = initMovieDetailPage; console.log("[DEBUG] JS: Will init Detail Page."); }
        else if (currentPage === 'movies') { initFunction = initMoviesPage; console.log("[DEBUG] JS: Will init Movies Page."); }
        else if (currentPage === 'drama') { initFunction = initDramaPage; console.log("[DEBUG] JS: Will init Drama Page."); }
        else if (currentPage === 'anime') { initFunction = initAnimePage; console.log("[DEBUG] JS: Will init Anime Page."); }
        else if (currentPage === 'browse') { initFunction = initBrowsePage; console.log("[DEBUG] JS: Will init Browse Page."); }
        else if (currentPage === 'watchlist') { initFunction = initWatchlistPage; console.log("[DEBUG] JS: Will init Watchlist Page."); }
        else if (currentPage === 'home' || !currentPage) { initFunction = initHomePage; console.log("[DEBUG] JS: Will init Home Page."); }

        if (initFunction) {
             console.log(`[DEBUG] JS: DOMContentLoaded - Calling ${initFunction.name}...`);
             initFunction(); // Call the selected function
         } else { console.log(`[DEBUG] JS: No specific JS content initializer needed for page "${currentPage}".`); }

    } catch(e) {
        console.error(`[DEBUG] JS: *** ERROR during page initialization logic for "${currentPage}" ***:`, e);
        alert("An error occurred loading this page. Check the console for details.");
    }
    console.log("[DEBUG] JS: DOMContentLoaded - END");
});

console.log("[DEBUG] JS: Script end.");

// Social Login Handlers
function handleGoogleLogin() {
    // For demo purposes, we'll just show a message
    alert('Google login functionality will be implemented in the future.');
}

function handleFacebookLogin() {
    // For demo purposes, we'll just show a message
    alert('Facebook login functionality will be implemented in the future.');
}

// Add event listeners for social login buttons
document.addEventListener('DOMContentLoaded', function() {
    const googleButtons = document.querySelectorAll('.btn-social.google');
    const facebookButtons = document.querySelectorAll('.btn-social.facebook');

    googleButtons.forEach(button => {
        button.addEventListener('click', handleGoogleLogin);
    });

    facebookButtons.forEach(button => {
        button.addEventListener('click', handleFacebookLogin);
    });
});

// Search Results Page
function initSearchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (!query) {
        window.location.href = 'index.html';
        return;
    }

    const resultsContainer = document.getElementById('search-results');
    const noResultsDiv = document.getElementById('no-results');
    
    if (!resultsContainer || !noResultsDiv) return;

    // Show loading state
    resultsContainer.innerHTML = '<div class="loading-spinner"></div>';

    // Fetch search results from TMDB
    fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            resultsContainer.innerHTML = '';
            
            if (!data.results || data.results.length === 0) {
                noResultsDiv.style.display = 'block';
                return;
            }

            // Filter and display results
            const validResults = data.results.filter(item => 
                (item.media_type === 'movie' || item.media_type === 'tv') && 
                item.poster_path
            );

            if (validResults.length === 0) {
                noResultsDiv.style.display = 'block';
                return;
            }

            validResults.forEach(item => {
                const card = createGenericCard(item);
                resultsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            resultsContainer.innerHTML = '<p class="error">Error loading search results. Please try again later.</p>';
        });
}

// Initialize search results page if on search page
if (window.location.pathname.includes('search.html')) {
    initSearchResults();
}