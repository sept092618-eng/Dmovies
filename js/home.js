const API_KEY = 'ff92f7f3c703f962c7ef5f13285067c3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const BACKDROP_PATH = 'https://image.tmdb.org/t/p/original';

let currentId = null;
let currentType = null;
let currentS = 1;
let currentE = 1;
let currentSrv = 1;

const homeView = document.getElementById('home-view');
const detailsView = document.getElementById('details-view');
const iframe = document.getElementById('video-iframe');
const srvSwitcher = document.getElementById('server-switcher');
const searchSection = document.getElementById('search-section');
const homepageSections = document.getElementById('homepage-sections');

loadHomepage();

async function loadHomepage() {
    fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`).then(r => r.json()).then(d => renderRow(d.results, 'trending-list'));
    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc`).then(r => r.json()).then(d => renderRow(d.results, 'latest-movies-list'));
    fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc`).then(r => r.json()).then(d => renderRow(d.results, 'latest-tv-list'));
}

function renderRow(items, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
        if (!item.poster_path) return;
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `<img src="${IMG_PATH + item.poster_path}"><div class="movie-info"><h3>${item.title || item.name}</h3></div>`;
        card.onclick = () => showDetails(item);
        container.appendChild(card);
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
    document.getElementById('details-year').innerText = (item.release_date || item.first_air_date || "2024").split('-')[0];

    srvSwitcher.style.display = 'block'; 
    if (currentType === 'tv') {
        document.getElementById('tv-controls').style.display = 'block';
        document.getElementById('player-container').style.display = 'none';
        loadSeasons(currentId);
    } else {
        document.getElementById('tv-controls').style.display = 'none';
        updatePlayer();
    }
}

function updatePlayer() {
    let url = "";
    const p = "?auto_play=true&sub_f=1";
    if (currentType === 'movie') {
        if (currentSrv === 1) url = `https://vidsrc.to/embed/movie/${currentId}${p}`;
        if (currentSrv === 2) url = `https://vidsrc.xyz/embed/movie/${currentId}${p}`;
        if (currentSrv === 3) url = `https://vidsrc.me/embed/movie?tmdb=${currentId}`;
    } else {
        if (currentSrv === 1) url = `https://vidsrc.to/embed/tv/${currentId}/${currentS}/${currentE}${p}`;
        if (currentSrv === 2) url = `https://vidsrc.xyz/embed/tv/${currentId}/${currentS}/${currentE}${p}`;
        if (currentSrv === 3) url = `https://vidsrc.me/embed/tv?tmdb=${currentId}&sea=${currentS}&epi=${currentE}`;
    }
    iframe.src = url;
    document.getElementById('player-container').style.display = 'block';
}

function changeServer(n) {
    currentSrv = n;
    document.querySelectorAll('.srv-btn').forEach((b, i) => b.classList.toggle('active', i+1 === n));
    updatePlayer();
}

async function loadSeasons(id) {
    const d = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`).then(r => r.json());
    const t = document.getElementById('season-tabs');
    t.innerHTML = '';
    d.seasons.forEach(s => {
        if (s.season_number === 0) return;
        const b = document.createElement('div');
        b.className = 'season-tab';
        b.innerText = `Season ${s.season_number}`;
        b.onclick = () => {
            document.querySelectorAll('.season-tab').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            currentS = s.season_number;
            loadEpisodes(id, s.season_number);
        };
        t.appendChild(b);
    });
    t.firstChild.click();
}

async function loadEpisodes(id, s) {
    const d = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${s}?api_key=${API_KEY}`).then(r => r.json());
    const l = document.getElementById('episode-list');
    l.innerHTML = '';
    d.episodes.forEach(e => {
        const i = document.createElement('div');
        i.className = 'episode-item';
        i.innerHTML = `<strong>Eps ${e.episode_number}:</strong> ${e.name}`;
        i.onclick = () => { currentE = e.episode_number; updatePlayer(); scrollToPlayer(); };
        l.appendChild(i);
    });
}

function showHome() { homeView.style.display = 'block'; detailsView.style.display = 'none'; iframe.src = ''; }
function scrollToPlayer() { window.scrollTo({ top: document.getElementById('watch-section').offsetTop - 80, behavior: 'smooth' }); }

document.getElementById('search-form').onsubmit = async (e) => {
    e.preventDefault();
    const val = document.getElementById('search-input').value;
    if (!val) return;
    const d = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${val}`).then(r => r.json());
    homepageSections.style.display = 'none';
    searchSection.style.display = 'block';
    renderRow(d.results, 'search-list');
    document.getElementById('search-list').className = 'card-row-grid'; // Force grid for search
};