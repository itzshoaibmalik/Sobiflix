// --- Global Variables & Constants ---
const API_KEY = 'eacc73ab9261fcee9b1146019d49d625'; // <<< IMPORTANT: Replace this!
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const POSTER_SIZE_CARD = 'w342';
const POSTER_SIZE_DETAIL = 'w500';
const BACKDROP_SIZE = 'w1280';

// TMDb Genre IDs (Common ones)
const GENRE_DRAMA = 18;
const GENRE_ANIMATION = 16;
const KEYWORD_ANIME = 210024; // For better anime filtering

// --- Helper Functions ---

async function fetchTMDbData(endpoint, queryParams = '') {
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US${queryParams}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status} for URL: ${url}`);
            const errorData = await response.json().catch(() => null); // Try parsing error body
            console.error("Error details:", errorData);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

// Updated to handle both movies and TV shows
function createGenericCard(item, itemType = 'movie') { // itemType can be 'movie' or 'tv'
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.dataset.itemId = item.id;
    itemCard.dataset.itemType = itemType; // Store type for detail link

    const title = itemType === 'movie' ? item.title : item.name;
    const releaseDate = itemType === 'movie' ? item.release_date : item.first_air_date; // Use appropriate date
    const detailPage = itemType === 'movie' ? 'movie-detail.html' : 'tv-detail.html'; // Needs tv-detail.html to be created

     // TEMPORARY FIX: For now, point TV shows to movie detail until tv-detail.html is made
    const detailLink = `movie-detail.html?id=${item.id}&type=${itemType}`;
    // const detailLink = `${detailPage}?id=${item.id}`;


    const posterPath = item.poster_path
        ? `${IMAGE_BASE_URL}${POSTER_SIZE_CARD}${item.poster_path}`
        : 'images/placeholder-poster.png';

     itemCard.innerHTML = `
         <img src="${posterPath}" alt="${title}">
         <div class="card-overlay">
             <button class="watchlist-btn" aria-label="Add to Watchlist"><i class="fas fa-plus"></i></button>
             <h3>${title}</h3>
              <div class="card-meta">
                  ${item.vote_average ? `<span class="rating"><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</span>` : ''}
                  ${releaseDate ? `<span class="year">(${releaseDate.substring(0, 4)})</span>` : ''}
              </div>
             <p class="quick-synopsis">${item.overview ? item.overview.substring(0, 90) + '...' : ''}</p>
             <a href="${detailLink}" class="btn btn-primary btn-sm">Details</a>
         </div>
     `;

    // Add event listener to navigate (if not clicking button/link)
    itemCard.addEventListener('click', (event) => {
        if (!event.target.closest('.watchlist-btn') && !event.target.closest('.btn')) {
             window.location.href = detailLink;
         }
    });

    // Add Watchlist button functionality (basic)
     const watchlistBtn = itemCard.querySelector('.watchlist-btn');
     if (watchlistBtn) {
         watchlistBtn.addEventListener('click', (e) => {
             e.stopPropagation();
             watchlistBtn.classList.toggle('added');
             // console.log(`Toggled watchlist for ${itemType} ID: ${item.id}`);
             // Implement actual storage logic here
         });
     }

    return itemCard;
}


/**
 * Populates a container (row or grid) with item cards.
 * @param {string} containerSelector - CSS selector for the items container (e.g., '#trending-movies .row-items', '#browse-grid .content-grid').
 * @param {Array} items - Array of movie or TV objects.
 * @param {string} itemType - 'movie' or 'tv'.
 * @param {boolean} isGrid - True if the container is a grid, false if a row/carousel.
 */
 function populateContainer(containerSelector, items, itemType = 'movie', isGrid = false) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }

    container.innerHTML = ''; // Clear existing content/skeletons
    container.classList.remove('loading');

    if (!items || items.length === 0) {
         const messageClass = isGrid ? 'no-results' : ''; // Only add class if needed for grid styling
        container.innerHTML = `<p class="${messageClass}">No content found.</p>`;
        return;
    }

    items.forEach(item => {
        // Some API results (like multi-search) have 'media_type'
        const type = item.media_type || itemType;
         if (type === 'movie' || type === 'tv') { // Only display movies or TV shows
            const card = createGenericCard(item, type);
            container.appendChild(card);
         }
    });
}

function displayLoadingError(containerSelector, isGrid = false) {
     const container = document.querySelector(containerSelector);
     if (container) {
         container.classList.remove('loading');
         const messageClass = isGrid ? 'error' : '';
         container.innerHTML = `<p class="${messageClass}">Could not load content.</p>`;
     }
}

// --- Page Specific Initialization Functions ---

// -- Home Page --
async function initHomePage() {
    console.log("Initializing Home Page...");
    const sections = [
        { selector: '#trending-movies .row-items', endpoint: '/trending/movie/week', type: 'movie' },
        { selector: '#now-playing .row-items', endpoint: '/movie/now_playing', type: 'movie' },
        { selector: '#top-rated-tv .row-items', endpoint: '/tv/top_rated', type: 'tv' },
        { selector: '#upcoming-movies .row-items', endpoint: '/movie/upcoming', type: 'movie' }
    ];

    for (const section of sections) {
        const data = await fetchTMDbData(section.endpoint);
        if (data && data.results) {
            populateContainer(section.selector, data.results, section.type);
        } else {
            displayLoadingError(section.selector);
        }
    }
     initSearch();
}

// -- Movie Detail Page -- (Slightly modified to accept itemType)
async function initMovieDetailPage() {
     console.log("Initializing Media Detail Page...");
     const contentArea = document.getElementById('movie-detail-content'); // Keep ID for now
     if (!contentArea) return;

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    const itemType = urlParams.get('type') || 'movie'; // Default to movie if type not specified

    if (!itemId) { /* ... error handling ... */ return; }

     // Fetch all necessary data in parallel
     const [itemDetails, credits, videos, similarItems, reviews] = await Promise.all([
         fetchTMDbData(`/${itemType}/${itemId}`),
         fetchTMDbData(`/${itemType}/${itemId}/credits`),
         fetchTMDbData(`/${itemType}/${itemId}/videos`),
         fetchTMDbData(`/${itemType}/${itemId}/similar`),
         fetchTMDbData(`/${itemType}/${itemId}/reviews`)
     ]);

    if (!itemDetails) { /* ... error handling ... */ contentArea.classList.add('loaded'); return; }

    // --- Populate Details ---
     const title = itemType === 'movie' ? itemDetails.title : itemDetails.name;
     const releaseDate = itemType === 'movie' ? itemDetails.release_date : itemDetails.first_air_date;
     const runtime = itemType === 'movie' ? itemDetails.runtime : itemDetails.episode_run_time?.[0]; // Use first episode runtime for TV

     document.title = `${title} - Sobiflix`;

     // Update elements using 'itemDetails'
     const backdropPath = itemDetails.backdrop_path ? `${IMAGE_BASE_URL}${BACKDROP_SIZE}${itemDetails.backdrop_path}` : '';
     const backdropSection = contentArea.querySelector('.movie-backdrop');
     if (backdropSection) { /* ... set background ... */ backdropSection.style.display = 'flex';}

     const posterPath = itemDetails.poster_path ? `${IMAGE_BASE_URL}${POSTER_SIZE_DETAIL}${itemDetails.poster_path}` : 'images/placeholder-poster.png';
     document.getElementById('detail-poster').src = posterPath;
     document.getElementById('detail-poster').alt = title + " Poster";

     document.getElementById('detail-title').textContent = title;
     document.getElementById('detail-rating').innerHTML = `<i class="fas fa-star"></i> ${itemDetails.vote_average ? itemDetails.vote_average.toFixed(1) : 'N/A'}`;
     document.getElementById('detail-runtime').textContent = runtime ? `${runtime} min` : (itemType === 'tv' ? 'Avg Ep' : 'N/A');
     document.getElementById('detail-release-date').textContent = releaseDate || 'N/A';
     document.getElementById('detail-genres').textContent = itemDetails.genres?.map(g => g.name).join(', ') || 'N/A';
     document.getElementById('detail-tagline').textContent = itemDetails.tagline || '';
     document.getElementById('detail-synopsis').textContent = itemDetails.overview || 'No synopsis available.';

      // Show hidden info sections
      contentArea.querySelector('.movie-tabs')?.setAttribute('style', 'display: block;');

      // --- Populate Cast --- (Remains similar)
      const castContainer = document.getElementById('detail-cast');
      if (castContainer && credits?.cast) { /* ... populate cast ... */ }
      else if (castContainer) { castContainer.innerHTML = '<p>Cast information not available.</p>'; }

       // --- Populate Reviews --- (Remains similar)
       const reviewsContainer = document.getElementById('detail-reviews');
       if (reviewsContainer && reviews?.results?.length > 0) { /* ... populate reviews ... */ }
       else if (reviewsContainer) { reviewsContainer.innerHTML = '<p>No reviews available.</p>'; }

      // --- Populate Similar Items ---
      const similarContainer = document.getElementById('detail-similar-movies'); // Keep ID for now
      if (similarContainer && similarItems?.results?.length > 0) {
          populateContainer('#detail-similar-movies', similarItems.results, itemType); // Pass itemType
       } else if (similarContainer) {
           similarContainer.innerHTML = '<p>No similar content found.</p>';
       }

      // --- Trailer Button --- (Remains similar)
      const trailerButton = document.getElementById('play-trailer-btn');
      /* ... trailer modal logic using 'videos' data ... */

       // --- Tab Functionality --- (Remains similar)
       const tabButtons = document.querySelectorAll('.movie-tabs .tab-btn');
       /* ... tab logic ... */

     // Mark loading as complete
    contentArea.classList.add('loaded');
}


// -- Movies Page --
async function initMoviesPage() {
     console.log("Initializing Movies Page...");
    const sections = [
        { selector: '#popular-movies .row-items', endpoint: '/movie/popular', type: 'movie', isGrid: false },
        { selector: '#top-rated-movies .content-grid', endpoint: '/movie/top_rated', type: 'movie', isGrid: true },
        { selector: '#upcoming-movies .row-items', endpoint: '/movie/upcoming', type: 'movie', isGrid: false },
    ];
    for (const section of sections) {
        const data = await fetchTMDbData(section.endpoint);
        if (data && data.results) {
            populateContainer(section.selector, data.results, section.type, section.isGrid);
        } else {
            displayLoadingError(section.selector, section.isGrid);
        }
    }
    initSearch();
}

// -- Drama Page --
async function initDramaPage() {
     console.log("Initializing Drama Page...");
    const sections = [
        { selector: '#popular-drama-tv .row-items', endpoint: '/discover/tv', params: `&with_genres=${GENRE_DRAMA}&sort_by=popularity.desc`, type: 'tv', isGrid: false },
        { selector: '#top-rated-drama-movies .content-grid', endpoint: '/discover/movie', params: `&with_genres=${GENRE_DRAMA}&sort_by=vote_average.desc&vote_count.gte=200`, type: 'movie', isGrid: true }
    ];
    for (const section of sections) {
        const data = await fetchTMDbData(section.endpoint, section.params);
        if (data && data.results) {
            populateContainer(section.selector, data.results, section.type, section.isGrid);
        } else {
            displayLoadingError(section.selector, section.isGrid);
        }
    }
     initSearch();
}

// -- Anime Page --
async function initAnimePage() {
    console.log("Initializing Anime Page...");
     const sections = [
         { selector: '#popular-anime-series .row-items', endpoint: '/discover/tv', params: `&with_genres=${GENRE_ANIMATION}&with_keywords=${KEYWORD_ANIME}&sort_by=popularity.desc`, type: 'tv', isGrid: false },
         { selector: '#top-rated-anime-movies .content-grid', endpoint: '/discover/movie', params: `&with_genres=${GENRE_ANIMATION}&sort_by=vote_average.desc&vote_count.gte=100`, type: 'movie', isGrid: true },
         { selector: '#popular-anime-movies .row-items', endpoint: '/discover/movie', params: `&with_genres=${GENRE_ANIMATION}&sort_by=popularity.desc`, type: 'movie', isGrid: false },
     ];
     for (const section of sections) {
         const data = await fetchTMDbData(section.endpoint, section.params);
         if (data && data.results) {
             populateContainer(section.selector, data.results, section.type, section.isGrid);
         } else {
             displayLoadingError(section.selector, section.isGrid);
         }
     }
     initSearch();
 }

// -- Browse Page --
async function initBrowsePage() {
    console.log("Initializing Browse Page...");
    // Fetch trending movies and TV shows, then combine and display
    const trendingAllData = await fetchTMDbData('/trending/all/week');

    if (trendingAllData && trendingAllData.results) {
         // Filter out people if any, sort by popularity (already mostly sorted by TMDb)
         const mediaItems = trendingAllData.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .sort((a, b) => b.popularity - a.popularity); // Ensure sorting just in case

         populateContainer('#browse-all-trending .content-grid', mediaItems, 'movie', true); // itemType default doesn't matter much here as card func checks media_type
    } else {
        displayLoadingError('#browse-all-trending .content-grid', true);
    }
     initSearch();
}

// --- Search Functionality (Basic - unchanged) ---
function initSearch() {
      const searchForm = document.querySelector('.search-form');
      const searchInput = document.getElementById('search-input');
      if (searchForm && searchInput) { /* ... event listener as before ... */ }
}

// --- Utility: Highlight Active Nav Link ---
function highlightActiveNav() {
    const currentPage = document.body.dataset.currentPage; // Get from <body data-current-page="...">
    if (!currentPage) return;

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active'); // Remove from all first
        if (link.dataset.page === currentPage) {
            link.classList.add('active');
        }
    });
}


// --- DOMContentLoaded Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing Sobiflix...");

     if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
         console.error("FATAL ERROR: TMDb API Key not set in js/main.js!");
         alert("Sobiflix requires a TMDb API Key. Please add it to js/main.js.");
         // Display message on page instead of just alert
         document.body.innerHTML = `<div style="padding: 50px; text-align: center; color: #fff; background-color: #111; height: 100vh;"><h1>Configuration Error</h1><p>Please add your TMDb API key to the main.js file to use Sobiflix.</p></div>`;
         return; // Stop everything
     }


    // Determine current page using body attribute
    const currentPage = document.body.dataset.currentPage;
    highlightActiveNav(); // Highlight nav based on page

    if (document.getElementById('movie-detail-content')) { // Check for detail page ID
        initMovieDetailPage();
     } else if (currentPage === 'movies') {
        initMoviesPage();
     } else if (currentPage === 'drama') {
         initDramaPage();
     } else if (currentPage === 'anime') {
         initAnimePage();
     } else if (currentPage === 'browse') {
        initBrowsePage();
    } else if (currentPage === 'home' || !currentPage) { // Default to home
        document.body.dataset.currentPage = 'home'; // Ensure it's set for nav highlighting
        highlightActiveNav();
        initHomePage();
    } else {
        // For pages like About, Login, Signup, Search that might not need API calls on load
         console.log(`Initializing basic page: ${currentPage || 'Unknown'}`);
         initSearch(); // Still initialize search on these pages
    }

    // Add mobile menu toggle logic here if implemented
});