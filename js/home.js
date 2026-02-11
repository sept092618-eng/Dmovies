// 1. CONFIGURATION
const API_KEY = 'ff92f7f3c703f962c7ef5f13285067c3'; // <--- SIGURADUHIN NA TAMA ANG API KEY DITO
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';

// Binalik ko muna sa 'discover/movie' para sigurado tayong may lalabas agad
const API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`;

// Ito ang gagamitin natin sa Search (Movies + TV Shows)
const SEARCH_API = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=`;

const main = document.getElementById('movie-grid');
const form = document.getElementById('search-form');
const search = document.getElementById('search-input');

// 2. INITIAL GET
getMovies(API_URL);

async function getMovies(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if(data.results && data.results.length > 0) {
            showMovies(data.results);
        } else {
            main.innerHTML = '<h2 style="color:white; text-align:center; width:100%;">No results found.</h2>';
        }
    } catch (error) {
        console.log("May error sa pagkuha ng data:", error);
    }
}

// 3. SHOW MOVIES
function showMovies(items) {
    main.innerHTML = ''; 

    items.forEach((item) => {
        // Mahalaga ito: 'title' sa movie, 'name' sa TV show
        const title = item.title || item.name || "Untitled"; 
        const poster_path = item.poster_path;
        const vote = item.vote_average || 0;
        
        // Alamin kung Movie o TV Series
        let mediaType = "Movie";
        if(item.media_type === 'tv' || item.first_air_date) {
            mediaType = "TV Series";
        }

        if (!poster_path) return; 

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card');

        movieEl.innerHTML = `
            <img src="${IMG_PATH + poster_path}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; font-size:12px;">
                    <span style="color: #ffc107; font-weight: bold;">★ ${vote.toFixed(1)}</span>
                    <span style="color: #888; text-transform: uppercase;">${mediaType}</span>
                </div>
            </div>
        `;
        
        main.appendChild(movieEl);
    });
}

// 4. SEARCH FEATURE
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = search.value;

    if(searchTerm && searchTerm !== '') {
        // Multi-search gagamitin natin dito
        getMovies(SEARCH_API + searchTerm);
    } else {
        window.location.reload();
    }
});