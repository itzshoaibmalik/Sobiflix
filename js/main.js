// --- Global Variables & Constants ---
// IMPORTANT: Replace with your actual TMDb API key.
// Best Practice: Store this securely, not directly in code for public sites.
const API_KEY = 'eacc73ab9261fcee9b1146019d49d625';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Poster sizes: "w92", "w154", "w185", "w342", "w500", "w780", "original"
const POSTER_SIZE_CARD = 'w342';
const POSTER_SIZE_DETAIL = 'w500';
// Backdrop sizes: "w300", "w780", "w1280", "original"
const BACKDROP_SIZE = 'w1280';

// --- Helper Functions ---

/**
 * Fetches data from TMDb API.
 * @param {string} endpoint - The API endpoint (e.g., '/movie/popular').
 * @param {string} [queryParams=''] - Optional query parameters (e.g., '&page=2').
 * @returns {Promise<object|null>} - The JSON response or null on error.
 */
async function fetchTMDbData(endpoint, queryParams = '') {
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US${queryParams}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // console.log(`Fetched ${endpoint}:`, data); // Debugging
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null; // Indicate failure
    }
}

/**
 * Creates a movie card HTML element.
 * @param {object} movie - Movie object from TMDb.
 * @returns {HTMLElement} - The movie card element.
 */
function createMovieCard(movie) {
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.dataset.movieId = movie.id; // Store movie ID for later use

    const posterPath = movie.poster_path
        ? `${IMAGE_BASE_URL}${POSTER_SIZE_CARD}${movie.poster_path}`
        : 'images/placeholder-poster.png'; // Fallback image

    // Basic structure (you can switch to the overlay structure if preferred)
    // itemCard.innerHTML = `
    //     <img src="${posterPath}" alt="${movie.title || movie.name}">
    //     <div class="card-info">
    //         <h3>${movie.title || movie.name}</h3>
    //         ${movie.vote_average ? `<span><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>` : ''}
    //     </div>
    // `;

     // Enhanced Overlay Structure
      itemCard.innerHTML = `
         <img src="${posterPath}" alt="${movie.title || movie.name}">
         <div class="card-overlay">
             <button class="watchlist-btn" aria-label="Add to Watchlist"><i class="fas fa-plus"></i></button>
             <h3>${movie.title || movie.name}</h3>
             ${movie.vote_average ? `<span class="rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>` : ''}
             <p class="quick-synopsis">${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No synopsis available.'}</p>
             <a href="movie-detail.html?id=${movie.id}" class="btn btn-primary btn-sm">Details</a>
         </div>
      `;


    // Add event listener to navigate to detail page (can also be done via the 'a' tag)
    itemCard.addEventListener('click', (event) => {
        // Prevent navigation if watchlist button was clicked
        if (!event.target.closest('.watchlist-btn') && !event.target.closest('.btn')) {
             window.location.href = `movie-detail.html?id=${movie.id}`;
         }
    });

    // Add Watchlist button functionality (basic toggle example)
     const watchlistBtn = itemCard.querySelector('.watchlist-btn');
     if (watchlistBtn) {
         watchlistBtn.addEventListener('click', (e) => {
             e.stopPropagation(); // Prevent card click navigation
             watchlistBtn.classList.toggle('added');
             // In a real app, you'd save this state (e.g., in localStorage or backend)
             console.log(`Toggled watchlist for movie ID: ${movie.id}`);
         });
     }

    return itemCard;
}


/**
 * Populates a content row with movie cards.
 * @param {string} containerSelector - CSS selector for the row container (e.g., '#trending-movies .row-items').
 * @param {Array} movies - Array of movie objects.
 */
function populateMovieRow(containerSelector, movies) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }

    // Clear existing content (like skeletons or old cards)
    container.innerHTML = '';
    container.classList.remove('loading'); // Remove loading state

    if (!movies || movies.length === 0) {
        container.innerHTML = '<p class="no-results">No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const card = createMovieCard(movie);
        container.appendChild(card);
    });
}


// --- Page Specific Logic ---

// -- Home Page --
async function initHomePage() {
    console.log("Initializing Home Page...");
    if (document.getElementById('trending-movies')) { // Check if we are on the home page
        // Fetch and populate different rows
        const trendingMoviesData = await fetchTMDbData('/trending/movie/week');
        if (trendingMoviesData && trendingMoviesData.results) {
            populateMovieRow('#trending-movies .row-items', trendingMoviesData.results);
        } else {
             document.querySelector('#trending-movies .row-items')?.classList.remove('loading');
              document.querySelector('#trending-movies .row-items')?.insertAdjacentHTML('beforeend','<p class="error">Could not load trending movies.</p>');
        }


        const nowPlayingData = await fetchTMDbData('/movie/now_playing');
         if (nowPlayingData && nowPlayingData.results) {
            populateMovieRow('#now-playing .row-items', nowPlayingData.results);
         } else {
            document.querySelector('#now-playing .row-items')?.classList.remove('loading');
             document.querySelector('#now-playing .row-items')?.insertAdjacentHTML('beforeend','<p class="error">Could not load now playing movies.</p>');
        }


         const topRatedTvData = await fetchTMDbData('/tv/top_rated');
         if (topRatedTvData && topRatedTvData.results) {
             populateMovieRow('#top-rated-tv .row-items', topRatedTvData.results);
         } else {
             document.querySelector('#top-rated-tv .row-items')?.classList.remove('loading');
             document.querySelector('#top-rated-tv .row-items')?.insertAdjacentHTML('beforeend','<p class="error">Could not load top rated TV shows.</p>');
         }


        const upcomingMoviesData = await fetchTMDbData('/movie/upcoming');
        if (upcomingMoviesData && upcomingMoviesData.results) {
            populateMovieRow('#upcoming-movies .row-items', upcomingMoviesData.results);
        } else {
             document.querySelector('#upcoming-movies .row-items')?.classList.remove('loading');
             document.querySelector('#upcoming-movies .row-items')?.insertAdjacentHTML('beforeend','<p class="error">Could not load upcoming movies.</p>');
        }

        // Add search functionality here later
         initSearch();
    }
}

// -- Movie Detail Page --
async function initMovieDetailPage() {
     console.log("Initializing Movie Detail Page...");
    const contentArea = document.getElementById('movie-detail-content');
    if (!contentArea) return; // Only run on detail page

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        contentArea.innerHTML = '<p class="error container">Error: Movie ID not found in URL.</p>';
        contentArea.classList.add('loaded'); // Stop loading indicator
        return;
    }

    // Fetch all necessary data in parallel
     const [movieDetails, credits, videos, similarMovies, reviews] = await Promise.all([
        fetchTMDbData(`/movie/${movieId}`),
        fetchTMDbData(`/movie/${movieId}/credits`),
        fetchTMDbData(`/movie/${movieId}/videos`),
        fetchTMDbData(`/movie/${movieId}/similar`),
        fetchTMDbData(`/movie/${movieId}/reviews`)
    ]);


    if (!movieDetails) {
        contentArea.innerHTML = '<p class="error container">Error: Could not load movie details.</p>';
         contentArea.classList.add('loaded');
        return;
    }

    // --- Populate Details ---
    document.title = `${movieDetails.title} - Sobiflix`; // Set page title

    const backdropPath = movieDetails.backdrop_path ? `${IMAGE_BASE_URL}${BACKDROP_SIZE}${movieDetails.backdrop_path}` : '';
     const backdropSection = contentArea.querySelector('.movie-backdrop');
     if (backdropSection) {
        backdropSection.style.backgroundImage = `url('${backdropPath}')`;
         backdropSection.style.display = 'flex'; // Show backdrop section
     }

     const posterPath = movieDetails.poster_path ? `${IMAGE_BASE_URL}${POSTER_SIZE_DETAIL}${movieDetails.poster_path}` : 'images/placeholder-poster.png';
    document.getElementById('detail-poster').src = posterPath;
    document.getElementById('detail-poster').alt = movieDetails.title + " Poster";

    document.getElementById('detail-title').textContent = movieDetails.title;
     document.getElementById('detail-rating').innerHTML = `<i class="fas fa-star"></i> ${movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A'}`;
    document.getElementById('detail-runtime').textContent = movieDetails.runtime ? `${movieDetails.runtime} min` : 'N/A';
     document.getElementById('detail-release-date').textContent = movieDetails.release_date || 'N/A';
     document.getElementById('detail-genres').textContent = movieDetails.genres?.map(g => g.name).join(', ') || 'N/A';
     document.getElementById('detail-tagline').textContent = movieDetails.tagline || '';
     document.getElementById('detail-synopsis').textContent = movieDetails.overview || 'No synopsis available.';

     // Show the hidden info sections
     contentArea.querySelector('.movie-tabs')?.setAttribute('style', 'display: block;');


    // --- Populate Cast ---
     const castContainer = document.getElementById('detail-cast');
     if (castContainer && credits?.cast) {
         castContainer.innerHTML = ''; // Clear placeholders
         credits.cast.slice(0, 10).forEach(member => { // Show top 10 cast
             const castCard = document.createElement('div');
             castCard.classList.add('cast-card');
              const profilePath = member.profile_path ? `${IMAGE_BASE_URL}w185${member.profile_path}` : 'https://via.placeholder.com/100x150/ccc/000?text=No+Image'; // Placeholder
             castCard.innerHTML = `
                 <img src="${profilePath}" alt="${member.name}">
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
    if (reviewsContainer && reviews?.results?.length > 0) {
         reviewsContainer.innerHTML = ''; // Clear placeholders
        reviews.results.slice(0, 5).forEach(review => { // Show top 5 reviews
             const reviewDiv = document.createElement('div');
             reviewDiv.classList.add('review-item'); // Add a class for styling if needed
            reviewDiv.innerHTML = `
                <h4>By ${review.author}</h4>
                 <p>${review.content.substring(0, 300)}...</p>
                 <a href="${review.url}" target="_blank" rel="noopener noreferrer">Read full review</a>
                 <hr style="margin: 15px 0; border-color: var(--border-color);">
             `;
            reviewsContainer.appendChild(reviewDiv);
        });
    } else if (reviewsContainer) {
         reviewsContainer.innerHTML = '<p>No reviews available.</p>';
    }


    // --- Populate Similar Movies ---
     const similarContainer = document.getElementById('detail-similar-movies');
    if (similarContainer && similarMovies?.results?.length > 0) {
        populateMovieRow('#detail-similar-movies', similarMovies.results); // Reuse card creation
     } else if (similarContainer) {
         similarContainer.innerHTML = '<p>No similar movies found.</p>';
     }

    // --- Trailer Button ---
     const trailerButton = document.getElementById('play-trailer-btn');
     const modal = document.getElementById('trailer-modal');
     const trailerFrame = document.getElementById('youtube-trailer');
     const closeModalBtn = modal.querySelector('.close-modal-btn');

     // Find the first YouTube Trailer key
     const youtubeTrailer = videos?.results?.find(video => video.site === 'YouTube' && video.type === 'Trailer');

     if (trailerButton && modal && trailerFrame && closeModalBtn && youtubeTrailer) {
         trailerButton.addEventListener('click', () => {
             trailerFrame.src = `https://www.youtube.com/embed/${youtubeTrailer.key}?autoplay=1`;
             modal.classList.add('show');
         });

         closeModalBtn.addEventListener('click', () => {
             modal.classList.remove('show');
             trailerFrame.src = ''; // Stop video playback
         });

         // Close modal if clicking outside the content area
         modal.addEventListener('click', (event) => {
            if (event.target === modal) { // Check if the click is directly on the modal background
                modal.classList.remove('show');
                trailerFrame.src = '';
            }
        });

     } else if (trailerButton) {
         trailerButton.style.display = 'none'; // Hide button if no trailer found
     }


     // --- Tab Functionality ---
     const tabButtons = document.querySelectorAll('.movie-tabs .tab-btn');
     const tabPanes = document.querySelectorAll('.movie-tabs .tab-pane');

     tabButtons.forEach(button => {
         button.addEventListener('click', () => {
             // Remove active class from all buttons and panes
             tabButtons.forEach(btn => btn.classList.remove('active'));
             tabPanes.forEach(pane => pane.classList.remove('active'));

             // Add active class to clicked button and corresponding pane
             button.classList.add('active');
             const targetTab = button.getAttribute('data-tab');
             document.getElementById(targetTab)?.classList.add('active');
         });
     });


    // Mark loading as complete
    contentArea.classList.add('loaded');
}

// --- Search Functionality (Basic) ---
function initSearch() {
     const searchForm = document.querySelector('.search-form');
     const searchInput = document.getElementById('search-input');

     if (searchForm && searchInput) {
         searchForm.addEventListener('submit', (e) => {
             e.preventDefault(); // Prevent default form submission
             const searchTerm = searchInput.value.trim();
             if (searchTerm) {
                 // Redirect to a search results page (or implement dynamic results)
                 // For now, let's just log it
                  console.log(`Searching for: ${searchTerm}`);
                  // window.location.href = `/search.html?query=${encodeURIComponent(searchTerm)}`; // Example redirect
                  alert(`Search submitted for: ${searchTerm}\n(Implement search results page)`);
                  searchInput.value = ''; // Clear input
             }
         });
     }
 }

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
     if (API_KEY === 'YOUR_TMDB_API_KEY') {
         console.error("ERROR: Please replace 'YOUR_TMDB_API_KEY' with your actual TMDb API key in js/main.js");
        alert("TMDb API Key not set! Please check js/main.js.");
         // You might want to prevent further execution or show a more user-friendly message on the page
         return; // Stop initialization if key is missing
     }
    // Check which page we are on and initialize accordingly
    if (document.getElementById('movie-detail-content')) {
        initMovieDetailPage();
    } else {
        // Assume home page if detail content not found
        initHomePage();
    }

    // General initializations (like mobile menu toggle if added) can go here
});