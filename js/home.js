const API_KEY = 'ff92f7f3c703f962c7ef5f13285067c3'; // Siguraduhin na ito ang API Key mo!
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const BACKDROP_PATH = 'https://image.tmdb.org/t/p/original';

let currentId = null;
let currentType = null;
let currentS = 1;
let currentE = 1;
let currentSrv = 1;

const homeView = document.getElementById('home-view');
const detailsView = document.getElementById('details-view');
const movieGrid = document.getElementById('movie-grid');
const iframe = document.getElementById('video-iframe');
const srvSwitcher = document.getElementById('server-switcher');

// INITIAL LOAD: Load ALL SECTIONS using a dedicated function
loadAllHomepageContent();

async function loadAllHomepageContent() {
    // 1. TRENDING NOW (Using All/Day)
    const trendingUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`;
    const trendingData = await fetch(trendingUrl).then(res => res.json());
    
    // 2. LATEST MOVIES (Sort by release date descending)
    const latestMovieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=release_date.desc&include_adult=false&page=1`;
    const latestMovieData = await fetch(latestMovieUrl).then(res => res.json());
    
    // 3. LATEST TV SHOWS (Sort by first air date descending)
    const latestTvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&sort_by=first_air_date.desc&include_adult=false&page=1`;
    const latestTvData = await fetch(latestTvUrl).then(res => res.json());
    
    // Display them in separate sections
    displaySection(trendingData.results.slice(0, 10), 'trending-list');
    displaySection(latestMovieData.results.slice(0, 10), 'latest-movies-list');
    displaySection(latestTvData.results.slice(0, 10), 'latest-tv-list');
}

// General function to display movies in a row (card-row)
function displaySection(items, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';

    items.forEach(item => {
        if (!item.poster_path) return;
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        // Add metadata (Year, Duration/Seasons, Type)
        const year = (item.release_date || item.first_air_date || "").substring(0, 4);
        const duration = item.runtime ? `${item.runtime}m` : (item.number_of_seasons ? `S${item.number_of_seasons}` : '');
        const typeTag = (item.media_type === 'tv' || item.first_air_date) ? 'TV' : 'Movie';

        card.innerHTML = `
            <img src="${IMG_PATH + item.poster_path}" alt="${item.title || item.name}">
            <div class="movie-info">
                <h3>${item.title || item.name}</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; font-size:11px;">
                    <span>${year}</span>
                    <span>${duration}</span>
                    <span style="background:#333; padding:2px 5px; border-radius:3px;">${typeTag}</span>
                </div>
            </div>
        `;
        card.onclick = () => showDetails(item);
        container.appendChild(card);
    });
}

// --- DETAILS VIEW (Player Logic - Same as before) ---

async function showDetails(item) {
    homeView.style.display = 'none';
    detailsView.style.display = 'block';
    window.scrollTo(0, 0);

    currentId = item.id;
    currentType = item.media_type || (item.first_air_date ? 'tv' : 'movie');

    document.getElementById('details-backdrop').style.backgroundImage = `url(${BACKDROP_PATH + item.backdrop_path})`;
    document.getElementById('details-poster').src = IMG_PATH + item.poster_path;
    document.getElementById('details-title').innerText = item.title || item.name;
    document.getElementById('details-desc').innerText = item.overview;
    document.getElementById('details-rating').innerText = "★ " + (item.vote_average || 0).toFixed(1);
    document.getElementById('details-year').innerText = (item.release_date || item.first_air_date || "").split('-')[0];

    const playerContainer = document.getElementById('player-container');
    const tvControls = document.getElementById('tv-controls');
    
    srvSwitcher.style.display = 'block'; 

    if (currentType === 'tv') {
        tvControls.style.display = 'block';
        playerContainer.style.display = 'none';
        iframe.src = '';
        loadSeasons(currentId);
    } else {
        tvControls.style.display = 'none';
        playerContainer.style.display = 'block';
        updatePlayer();
    }
}

function changeServer(srvNum) { /* ... (Server logic remains the same) ... */ currentSrv = srvNum; document.querySelectorAll('.srv-btn').forEach((btn, index) => { btn.classList.toggle('active', index + 1 === srvNum); }); updatePlayer(); }
function updatePlayer() { /* ... (Player URL logic remains the same) ... */ let url = ""; const params = "?auto_play=true&sub_f=1&ds_lang=en"; if (currentType === 'movie') { if (currentSrv === 1) url = `https://vidsrc.to/embed/movie/${currentId}${params}`; if (currentSrv === 2) url = `https://vidsrc.xyz/embed/movie/${currentId}${params}`; if (currentSrv === 3) url = `https://vidsrc.me/embed/movie?tmdb=${currentId}`; } else { if (currentSrv === 1) url = `https://vidsrc.to/embed/tv/${currentId}/${currentS}/${currentE}${params}`; if (currentSrv === 2) url = `https://vidsrc.xyz/embed/tv/${currentId}/${currentS}/${currentE}${params}`; if (currentSrv === 3) url = `https://vidsrc.me/embed/tv?tmdb=${currentId}&sea=${currentS}&epi=${currentE}`; } iframe.src = url; document.getElementById('player-container').style.display = 'block'; }
async function loadSeasons(tvId) { /* ... (TV Season Logic remains the same) ... */ const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}`); const data = await res.json(); const tabs = document.getElementById('season-tabs'); tabs.innerHTML = ''; data.seasons.forEach(s => { if (s.season_number === 0) return; const btn = document.createElement('div'); btn.className = 'season-tab'; btn.innerText = `Season ${s.season_number}`; btn.onclick = () => { document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active')); btn.classList.add('active'); currentS = s.season_number; loadEpisodes(tvId, s.season_number); }; tabs.appendChild(btn); }); if(tabs.firstChild) tabs.firstChild.click(); }
async function loadEpisodes(tvId, sNum) { /* ... (TV Episode Logic remains the same) ... */ const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${sNum}?api_key=${API_KEY}`); const data = await res.json(); const list = document.getElementById('episode-list'); list.innerHTML = ''; data.episodes.forEach(e => { const item = document.createElement('div'); item.className = 'episode-item'; item.innerHTML = `<strong>Eps ${e.episode_number}:</strong> ${e.name}`; item.onclick = () => { currentE = e.episode_number; updatePlayer(); scrollToPlayer(); }; list.appendChild(item); }); }

function showHome() { homeView.style.display = 'block'; detailsView.style.display = 'none'; iframe.src = ''; }
function scrollToPlayer() { window.scrollTo({ top: document.getElementById('watch-section').offsetTop - 80, behavior: 'smooth' }); }

document.getElementById('search-form').onsubmit = (e) => {
    e.preventDefault();
    const val = document.getElementById('search-input').value;
    if (val) { getMovies(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${val}`); showHome(); }
};