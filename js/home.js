const API_KEY = 'ff92f7f3c703f962c7ef5f13285067c3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const BACKDROP_PATH = 'https://image.tmdb.org/t/p/original';

// Global State
let currentId = null;
let currentType = null;
let currentS = 1;
let currentE = 1;
let currentSrv = 1;

const homeView = document.getElementById('home-view');
const detailsView = document.getElementById('details-view');
const movieGrid = document.getElementById('movie-grid');
const iframe = document.getElementById('video-iframe');

getMovies(`https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`);

async function getMovies(url) {
    const res = await fetch(url);
    const data = await res.json();
    showMovies(data.results);
}

function showMovies(items) {
    movieGrid.innerHTML = '';
    items.forEach(item => {
        if (!item.poster_path) return;
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `<img src="${IMG_PATH + item.poster_path}"><div class="movie-info"><h3>${item.title || item.name}</h3></div>`;
        card.onclick = () => showDetails(item);
        movieGrid.appendChild(card);
    });
}

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
    const srvSwitcher = document.getElementById('server-switcher');

    if (currentType === 'tv') {
        tvControls.style.display = 'block';
        playerContainer.style.display = 'none';
        srvSwitcher.style.display = 'none';
        iframe.src = '';
        loadSeasons(currentId);
    } else {
        tvControls.style.display = 'none';
        playerContainer.style.display = 'block';
        srvSwitcher.style.display = 'block';
        updatePlayer();
    }
}

function changeServer(srvNum) {
    currentSrv = srvNum;
    document.querySelectorAll('.srv-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index + 1 === srvNum);
    });
    updatePlayer();
}

function updatePlayer() {
    let url = "";
    if (currentType === 'movie') {
        if (currentSrv === 1) url = `https://vidsrc.to/embed/movie/${currentId}`;
        if (currentSrv === 2) url = `https://vidsrc.xyz/embed/movie/${currentId}`;
        if (currentSrv === 3) url = `https://vidsrc.me/embed/movie?tmdb=${currentId}`;
    } else {
        if (currentSrv === 1) url = `https://vidsrc.to/embed/tv/${currentId}/${currentS}/${currentE}`;
        if (currentSrv === 2) url = `https://vidsrc.xyz/embed/tv/${currentId}/${currentS}/${currentE}`;
        if (currentSrv === 3) url = `https://vidsrc.me/embed/tv?tmdb=${currentId}&sea=${currentS}&epi=${currentE}`;
    }
    iframe.src = url;
    document.getElementById('player-container').style.display = 'block';
    document.getElementById('server-switcher').style.display = 'block';
}

async function loadSeasons(tvId) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}`);
    const data = await res.json();
    const tabs = document.getElementById('season-tabs');
    tabs.innerHTML = '';
    data.seasons.forEach(s => {
        if (s.season_number === 0) return;
        const btn = document.createElement('div');
        btn.className = 'season-tab';
        btn.innerText = `Season ${s.season_number}`;
        btn.onclick = () => {
            document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            currentS = s.season_number;
            loadEpisodes(tvId, s.season_number);
        };
        tabs.appendChild(btn);
    });
    tabs.firstChild.click();
}

async function loadEpisodes(tvId, sNum) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${sNum}?api_key=${API_KEY}`);
    const data = await res.json();
    const list = document.getElementById('episode-list');
    list.innerHTML = '';
    data.episodes.forEach(e => {
        const item = document.createElement('div');
        item.className = 'episode-item';
        item.innerHTML = `<strong>Eps ${e.episode_number}:</strong> ${e.name}`;
        item.onclick = () => {
            currentE = e.episode_number;
            updatePlayer();
            scrollToPlayer();
        };
        list.appendChild(item);
    });
}

function showHome() { homeView.style.display = 'block'; detailsView.style.display = 'none'; iframe.src = ''; }
function scrollToPlayer() { window.scrollTo({ top: document.getElementById('watch-section').offsetTop - 80, behavior: 'smooth' }); }

document.getElementById('search-form').onsubmit = (e) => {
    e.preventDefault();
    const val = document.getElementById('search-input').value;
    if (val) { getMovies(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${val}`); showHome(); }
};