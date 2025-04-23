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
const KEYWORD_ANIME = 210024;

// --- Helper Functions ---

async function fetchTMDbData(endpoint, queryParams = '') {
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US${queryParams}`;
    // console.log("Fetching URL:", url); // DEBUG: Uncomment to see all fetch URLs
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status} for URL: ${url}`);
            const errorData = await response.json().catch(() => ({ message: 'Could not parse error response' }));
            console.error("Error details:", errorData);
            return null; // Return null on error
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

// --- Watchlist Simulation (using localStorage for persistence in browser session) ---
let watchlist = JSON.parse(localStorage.getItem('sobiflixWatchlist')) || [];

function isItemInWatchlist(itemId, itemType) {
    return watchlist.some(item => item.id === itemId && item.type === itemType);
}

function addToWatchlist(itemId, itemType, title) {
    if (!isItemInWatchlist(itemId, itemType)) {
        watchlist.push({ id: itemId, type: itemType, title: title });
        localStorage.setItem('sobiflixWatchlist', JSON.stringify(watchlist));
        console.log('Added to watchlist:', { id: itemId, type: itemType, title: title });
        return true;
    }
    return false;
}

function removeFromWatchlist(itemId, itemType) {
    const initialLength = watchlist.length;
    watchlist = watchlist.filter(item => !(item.id === itemId && item.type === itemType));
    if (watchlist.length < initialLength) {
        localStorage.setItem('sobiflixWatchlist', JSON.stringify(watchlist));
        console.log('Removed from watchlist:', { id: itemId, type: itemType });
        return true;
    }
    return false;
}

// Update Watchlist button UI
function updateWatchlistButtonUI(button, itemId, itemType) {
    const isInList = isItemInWatchlist(itemId, itemType);
    const icon = button.querySelector('i');
    if (isInList) {
        button.classList.add('added');
        button.setAttribute('aria-label', 'Remove from Watchlist');
        if (icon) icon.className = 'fas fa-check'; // Change icon to checkmark
    } else {
        button.classList.remove('added');
        button.setAttribute('aria-label', 'Add to Watchlist');
        if (icon) icon.className = 'fas fa-plus'; // Change icon back to plus
    }
}


function createGenericCard(item, itemType = 'movie') {
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.dataset.itemId = item.id;
    itemCard.dataset.itemType = itemType;

    const title = itemType === 'movie' ? item.title : item.name;
    const releaseDate = itemType === 'movie' ? item.release_date : item.first_air_date;
    // Ensure the detail link includes BOTH id and type consistently
    const detailLink = `movie-detail.html?id=${item.id}&type=${itemType}`;

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
                  ${releaseDate ? `<span class="year">(${(releaseDate || '').substring(0, 4)})</span>` : ''}
              </div>
             <p class="quick-synopsis">${item.overview ? item.overview.substring(0, 90) + '...' : ''}</p>
             <a href="${detailLink}" class="btn btn-primary btn-sm">Details</a>
         </div>
     `;

    // Event listener for card click (navigation)
    itemCard.addEventListener('click', (event) => {
        // Navigate only if clicking the card area, not buttons or links within it
        if (!event.target.closest('.watchlist-btn') && !event.target.closest('a.btn')) {
             window.location.href = detailLink;
         }
    });

    // Event listener for the Watchlist button
     const watchlistBtn = itemCard.querySelector('.watchlist-btn');
     if (watchlistBtn) {
          // Set initial state
          updateWatchlistButtonUI(watchlistBtn, item.id, itemType);

          // Add click handler
          watchlistBtn.addEventListener('click', (e) => {
              e.stopPropagation(); // IMPORTANT: Prevent card navigation click
              const isInList = isItemInWatchlist(item.id, itemType);
              if (isInList) {
                  removeFromWatchlist(item.id, itemType);
              } else {
                  addToWatchlist(item.id, itemType, title);
              }
              // Update button appearance AFTER action
               updateWatchlistButtonUI(watchlistBtn, item.id, itemType);
          });
     }

    return itemCard;
}


function populateContainer(containerSelector, items, itemType = 'movie', isGrid = false) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        // console.error(`Container not found: ${containerSelector}`);
        return;
    }
    container.innerHTML = ''; // Clear existing content/skeletons
    container.classList.remove('loading');

    if (!items || items.length === 0) {
        container.innerHTML = `<p class="${isGrid ? 'no-results' : ''}">No content found.</p>`;
        return;
    }

    items.forEach(item => {
        const type = item.media_type || itemType;
         if ((type === 'movie' || type === 'tv') && item.id && (item.title || item.name)) { // Basic sanity check for item data
            const card = createGenericCard(item, type);
            container.appendChild(card);
         } else {
            // console.warn("Skipping invalid item in populateContainer:", item); // Log skipped items
         }
    });
}

function displayLoadingError(containerSelector, isGrid = false) {
     const container = document.querySelector(containerSelector);
     if (container) {
         container.classList.remove('loading');
         container.innerHTML = `<p class="${isGrid ? 'error' : ''}">Could not load content.</p>`;
     }
}

// --- Page Specific Initialization Functions ---

// -- Home Page -- (Unchanged)
async function initHomePage() { /* ... same as before ... */ }

// -- Movie Detail Page -- (More robust)
async function initMovieDetailPage() {
     console.log("Initializing Media Detail Page...");
     const contentArea = document.getElementById('movie-detail-content');
     if (!contentArea) {
         console.error("Detail page content area ('#movie-detail-content') not found.");
         return;
     }

     const urlParams = new URLSearchParams(window.location.search);
     const itemId = parseInt(urlParams.get('id'), 10); // Ensure ID is a number
     const itemType = urlParams.get('type') || 'movie'; // Get type ('movie' or 'tv')

     console.log(`Detail Page Info: ID=${itemId}, Type=${itemType}`);

     if (!itemId || isNaN(itemId)) {
         contentArea.innerHTML = '<p class="error container">Error: Valid Item ID not found in URL.</p>';
         contentArea.classList.add('loaded'); // Stop loading indicator
         return;
     }
     if (itemType !== 'movie' && itemType !== 'tv') {
          contentArea.innerHTML = '<p class="error container">Error: Invalid Item Type specified in URL.</p>';
          contentArea.classList.add('loaded');
          return;
      }


    // Show loading spinner initially
    const loadingSpinner = contentArea.querySelector('.loading-spinner');
    if (loadingSpinner) loadingSpinner.style.display = 'block';

    // Fetch all necessary data
     // Note: Append `append_to_response` to get credits, videos, similar etc. in ONE call if preferred,
     // but separate calls allow partial loading if one fails.
    const itemDetails = await fetchTMDbData(`/${itemType}/${itemId}`, '&append_to_response=credits,videos,similar,reviews');

    // Hide spinner regardless of success/failure of fetching secondary data
    if (loadingSpinner) loadingSpinner.style.display = 'none';


    if (!itemDetails) {
        contentArea.innerHTML = `<p class="error container">Error: Could not load details for ${itemType} ID ${itemId}.</p>`;
        contentArea.classList.add('loaded'); // Mark as 'loaded' to hide spinner if it wasn't caught above
        return;
    }

     console.log("Fetched Details:", itemDetails); // DEBUG: See the full fetched object


    // --- Safely Populate Details ---
    try {
         const title = itemType === 'movie' ? itemDetails.title : itemDetails.name;
         const releaseDate = itemType === 'movie' ? itemDetails.release_date : itemDetails.first_air_date;
         // TV runtime is an array, take the first element if available
         const runtimeValue = itemType === 'movie' ? itemDetails.runtime : (itemDetails.episode_run_time?.[0] || null);
         const runtimeText = runtimeValue ? `${runtimeValue} min` : (itemType === 'tv' ? 'N/A' : 'N/A');


         document.title = `${title} - Sobiflix`; // Set page title

         const backdropPath = itemDetails.backdrop_path ? `${IMAGE_BASE_URL}${BACKDROP_SIZE}${itemDetails.backdrop_path}` : '';
         const backdropSection = contentArea.querySelector('.movie-backdrop');
         if (backdropSection) {
             backdropSection.style.backgroundImage = `url('${backdropPath}')`;
             backdropSection.style.display = 'flex'; // Show section
         } else console.warn("Backdrop section not found");


         const posterPath = itemDetails.poster_path ? `${IMAGE_BASE_URL}${POSTER_SIZE_DETAIL}${itemDetails.poster_path}` : 'images/placeholder-poster.png';
         const detailPoster = document.getElementById('detail-poster');
         if(detailPoster) {
             detailPoster.src = posterPath;
             detailPoster.alt = title + " Poster";
         } else console.warn("Detail poster element not found");


         // Safely update text content
         const updateText = (id, value) => {
             const el = document.getElementById(id);
             if (el) el.textContent = value || 'N/A';
             else console.warn(`Element with ID ${id} not found`);
         };
          const updateHTML = (id, value) => {
             const el = document.getElementById(id);
             if (el) el.innerHTML = value || 'N/A';
             else console.warn(`Element with ID ${id} not found`);
          };

          updateText('detail-title', title);
          updateHTML('detail-rating', `<i class="fas fa-star"></i> ${itemDetails.vote_average ? itemDetails.vote_average.toFixed(1) : 'N/A'}`);
          updateText('detail-runtime', runtimeText);
          updateText('detail-release-date', (releaseDate || '').substring(0, 10)); // Ensure substring doesn't error on null
          updateText('detail-genres', itemDetails.genres?.map(g => g.name).join(', ') || 'N/A');
          updateText('detail-tagline', itemDetails.tagline || ''); // Show empty if no tagline
          updateText('detail-synopsis', itemDetails.overview || 'No synopsis available.');

           // Show the hidden info sections AFTER populating
           contentArea.querySelector('.movie-tabs')?.setAttribute('style', 'display: block;');

          // --- Populate Cast ---
          const castContainer = document.getElementById('detail-cast');
          if (castContainer && itemDetails.credits?.cast?.length > 0) {
               castContainer.innerHTML = ''; // Clear placeholders
               itemDetails.credits.cast.slice(0, 12).forEach(member => { // Show top 12 cast
                   const castCard = document.createElement('div');
                   castCard.classList.add('cast-card');
                   const profilePath = member.profile_path ? `${IMAGE_BASE_URL}w185${member.profile_path}` : 'https://via.placeholder.com/100x150/ccc/000?text=No+Image';
                   castCard.innerHTML = `
                       <img loading="lazy" src="${profilePath}" alt="${member.name}">
                       <p>${member.name}</p>
                       <small>${member.character}</small>
                   `;
                   castContainer.appendChild(castCard);
               });
           } else if (castContainer) {
               castContainer.innerHTML = '<p>Cast information not available.</p>';
           }

          // --- Populate Reviews ---
           const reviewsContainer = document.getElementById('detail-reviews');
           if (reviewsContainer && itemDetails.reviews?.results?.length > 0) {
                reviewsContainer.innerHTML = ''; // Clear placeholders
               itemDetails.reviews.results.slice(0, 5).forEach(review => { /* ... create review elements ... */ });
           } else if (reviewsContainer) {
                reviewsContainer.innerHTML = '<p>No reviews available.</p>';
           }


           // --- Populate Similar Items ---
            const similarContainer = document.getElementById('detail-similar-movies');
           if (similarContainer && itemDetails.similar?.results?.length > 0) {
               populateContainer('#detail-similar-movies', itemDetails.similar.results, itemType);
            } else if (similarContainer) {
                similarContainer.innerHTML = '<p>No similar content found.</p>';
            }

           // --- Trailer Button ---
           const trailerButton = document.getElementById('play-trailer-btn');
           const modal = document.getElementById('trailer-modal');
           const trailerFrame = document.getElementById('youtube-trailer');
           const closeModalBtn = modal?.querySelector('.close-modal-btn');

           const youtubeTrailer = itemDetails.videos?.results?.find(video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser'));

           if (trailerButton && modal && trailerFrame && closeModalBtn && youtubeTrailer) {
                 trailerButton.style.display = 'inline-block'; // Ensure button is visible
                trailerButton.onclick = () => { // Use onclick for simplicity here, or addEventListener
                    trailerFrame.src = `https://www.youtube.com/embed/${youtubeTrailer.key}?autoplay=1`;
                    modal.classList.add('show');
                };
                 closeModalBtn.onclick = () => {
                    modal.classList.remove('show');
                    trailerFrame.src = '';
                };
                 modal.onclick = (event) => {
                    if (event.target === modal) {
                       modal.classList.remove('show');
                       trailerFrame.src = '';
                    }
                };
            } else if (trailerButton) {
                trailerButton.style.display = 'none'; // Hide button if no trailer
            }


            // --- Tab Functionality ---
            const tabButtons = document.querySelectorAll('.movie-tabs .tab-btn');
            const tabPanes = document.querySelectorAll('.movie-tabs .tab-pane');
            if(tabButtons.length > 0 && tabPanes.length > 0) {
                tabButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        tabButtons.forEach(btn => btn.classList.remove('active'));
                        tabPanes.forEach(pane => pane.classList.remove('active'));
                        button.classList.add('active');
                        const targetTab = button.getAttribute('data-tab');
                         document.getElementById(targetTab)?.classList.add('active');
                    });
                 });
             } else {
                 console.warn("Tab buttons or panes not found for detail page.")
             }


    } catch (error) {
         console.error("Error populating detail page DOM:", error);
         contentArea.innerHTML = `<p class="error container">An error occurred while displaying the details.</p>`;
    }

    // Mark loading as complete (ensure this runs even if parts fail)
    contentArea.classList.add('loaded');
}


// -- Movies Page -- (Unchanged)
async function initMoviesPage() { /* ... same as before ... */ }

// -- Drama Page -- (Unchanged)
async function initDramaPage() { /* ... same as before ... */ }

// -- Anime Page -- (Unchanged)
async function initAnimePage() { /* ... same as before ... */ }

// -- Browse Page -- (Unchanged)
async function initBrowsePage() { /* ... same as before ... */ }

// --- Search Functionality (Basic - unchanged) ---
function initSearch() { /* ... same as before ... */ }

// --- Utility: Highlight Active Nav Link --- (Unchanged)
function highlightActiveNav() { /* ... same as before ... */ }

// --- DOMContentLoaded Initialization --- (Add call to highlight nav on load)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing Sobiflix...");

     if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') { /* ... API Key check ... */ return; }

    highlightActiveNav(); // Call highlighting first

    const currentPage = document.body.dataset.currentPage;
    // console.log("Current Page Detected:", currentPage); // DEBUG

    if (document.getElementById('movie-detail-content')) {
        // Detail page logic should be self-contained now
        initMovieDetailPage();
     } else if (currentPage === 'movies') {
        initMoviesPage();
     } else if (currentPage === 'drama') {
         initDramaPage();
     } else if (currentPage === 'anime') {
         initAnimePage();
     } else if (currentPage === 'browse') {
        initBrowsePage();
    } else if (currentPage === 'home') {
        initHomePage();
    } else {
        // For pages like About, Login, Signup
         console.log(`Initializing basic page: ${currentPage || 'Unknown'}`);
         initSearch(); // Still initialize search if present
    }
});