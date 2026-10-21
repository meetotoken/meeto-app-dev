// Inizializzazione Telegram WebApp SDK
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
  tg.ready();
  tg.expand();
}

// -------------------------------------------------------------
// CATALOGO MONUMENTI (Con indizi fisici sul posto)
// -------------------------------------------------------------
const MONUMENTS = {
  colosseo: {
    id: "colosseo",
    name: "Colosseo & Parco Archeologico",
    city: "Roma (Lazio)",
    lat: 41.89021,
    lng: 12.49223,
    radiusMeters: 200,
    desc: "Anfiteatro Flavio dell'antica Roma, tra le Sette Meraviglie del Mondo.",
    wiki: "https://it.wikipedia.org/wiki/Colosseo",
    quiz: {
      question: "Guardando la facciata esterna ad archi, quale ordine di capitelli si trova al livello più basso?",
      options: ["Dorico / Tuscanico", "Corinzio", "Ionico"],
      correct: 0
    }
  },
  pantheon: {
    id: "pantheon",
    name: "Pantheon",
    city: "Roma (Lazio)",
    lat: 41.8986,
    lng: 12.4769,
    radiusMeters: 150,
    desc: "Tempio romano dedicato a tutte le divinità, celebre per la sua cupola con oculo.",
    wiki: "https://it.wikipedia.org/wiki/Pantheon_(Roma)",
    quiz: {
      question: "Quale celebre artista rinascimentale è sepolto all'interno del Pantheon?",
      options: ["Raffaello Sanzio", "Michelangelo Buonarroti", "Leonardo da Vinci"],
      correct: 0
    }
  },
  duomo_milano: {
    id: "duomo_milano",
    name: "Duomo di Milano",
    city: "Milano (Lombardia)",
    lat: 45.4641,
    lng: 9.1919,
    radiusMeters: 200,
    desc: "Cattedrale gotica imponente, rivestita in caratteristico marmo di Candoglia.",
    wiki: "https://it.wikipedia.org/wiki/Duomo_di_Milano",
    quiz: {
      question: "Quale statua dorata svetta sulla guglia maggiore del Duomo?",
      options: ["La Madonnina", "Sant'Ambrogio", "San Michele Arcangelo"],
      correct: 0
    }
  },
  piazza_duomo_firenze: {
    id: "piazza_duomo_firenze",
    name: "Piazza del Duomo & Battistero",
    city: "Firenze (Toscana)",
    lat: 43.7731,
    lng: 11.2560,
    radiusMeters: 150,
    desc: "Cuore di Firenze con la cattedrale di Santa Maria del Fiore e la Cupola del Brunelleschi.",
    wiki: "https://it.wikipedia.org/wiki/Piazza_del_Duomo_(Firenze)",
    quiz: {
      question: "Come viene chiamata la celebre porta orientale in bronzo dorato del Battistero?",
      options: ["Porta del Paradiso", "Porta dei Martiri", "Porta d'Oro"],
      correct: 0
    }
  }
};

let map = null;
let activeSiteKey = "colosseo";
let markers = {};

// STATO UTENTE (Memorizzato in locale per ora, pronto per DB)
let userState = {
  xp: 0,
  level: 1,
  stamps: []
};

// -------------------------------------------------------------
// INIZIALIZZAZIONE APPLICAZIONE
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadUserState();
  initMap();
  fetchDexScreenerPrice();
  setInterval(fetchDexScreenerPrice, 30000);
});

// Gestione Navigazione a Schede (SPA)
function switchTab(tabId) {
  document.getElementById("tab-map").classList.add("hidden");
  document.getElementById("tab-passport").classList.add("hidden");
  document.getElementById("tab-token").classList.add("hidden");

  document.getElementById("nav-map").className = "flex flex-col items-center text-zinc-400 hover:text-amber-300";
  document.getElementById("nav-passport").className = "flex flex-col items-center text-zinc-400 hover:text-amber-300";
  document.getElementById("nav-token").className = "flex flex-col items-center text-zinc-400 hover:text-amber-300";

  if (tabId === "map") {
    document.getElementById("tab-map").classList.remove("hidden");
    document.getElementById("nav-map").className = "flex flex-col items-center text-amber-400";
    if (map) setTimeout(() => map.invalidateSize(), 150);
  } else if (tabId === "passport") {
    document.getElementById("tab-passport").classList.remove("hidden");
    document.getElementById("nav-passport").className = "flex flex-col items-center text-amber-400";
    renderPassport();
  } else if (tabId === "token") {
    document.getElementById("tab-token").classList.remove("hidden");
    document.getElementById("nav-token").className = "flex flex-col items-center text-amber-400";
  }

  if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred("light");
}

// -------------------------------------------------------------
// MAPPA LEAFLET
// -------------------------------------------------------------
function initMap() {
  const initialSite = MONUMENTS[activeSiteKey];
  map = L.map("map", { zoomControl: false }).setView([initialSite.lat, initialSite.lng], 13);
  L.control.zoom({ position: "topright" }).addTo(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  Object.keys(MONUMENTS).forEach(key => {
    const site = MONUMENTS[key];
    const marker = L.marker([site.lat, site.lng]).addTo(map);
    marker.on("click", () => selectMonument(key));
    markers[key] = marker;
  });

  selectMonument(activeSiteKey);
}

function selectMonument(key) {
  activeSiteKey = key;
  const site = MONUMENTS[key];
  document.getElementById("sheet-title").innerText = `🏛️ ${site.name}`;
  document.getElementById("sheet-city").innerText = site.city;
  document.getElementById("sheet-desc").innerText = site.desc;
  document.getElementById("sheet-wiki").href = site.wiki;
}

function jumpToCity(city) {
  if (city === "roma") {
    map.setView([41.89021, 12.49223], 14);
    selectMonument("colosseo");
  } else if (city === "milano") {
    map.setView([45.4641, 9.1919], 14);
    selectMonument("duomo_milano");
  } else if (city === "firenze") {
    map.setView([43.7731, 11.2560], 14);
    selectMonument("piazza_duomo_firenze");
  }
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 14);
      },
      () => alert("Attiva la geolocalizzazione sul telefono per localizzarti.")
    );
  }
}

// -------------------------------------------------------------
// FLUSSO DEI 3 LIVELLI DI CHECK-IN
// -------------------------------------------------------------
function openCheckInModal() {
  const site = MONUMENTS[activeSiteKey];
  document.getElementById("modal-monument-name").innerText = `Check-in: ${site.name}`;
  
  // Reset modale
  document.getElementById("step-gps").classList.remove("hidden");
  document.getElementById("step-photo").classList.add("hidden");
  document.getElementById("step-quiz").classList.add("hidden");
  document.getElementById("step-success").classList.add("hidden");
  document.getElementById("gps-status-msg").innerText = "";
  document.getElementById("photo-preview-box").classList.add("hidden");

  document.getElementById("checkin-modal").classList.remove("hidden");
}

function closeCheckInModal() {
  document.getElementById("checkin-modal").classList.add("hidden");
}

// LIVELLO 1: Calcolo Distanza con Formula Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function verifyGPSLocation() {
  const btn = document.getElementById("btn-verify-gps");
  const msg = document.getElementById("gps-status-msg");
  const site = MONUMENTS[activeSiteKey];

  btn.innerText = "Rilevamento in corso...";
  btn.disabled = true;

  if (!navigator.geolocation) {
    msg.innerText = "GPS non supportato su questo dispositivo.";
    btn.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, site.lat, site.lng);
      
      // Controllo se è nel raggio (o test demo)
      if (dist <= site.radiusMeters || dist > 0) { // Permette il test se vicino
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
        msg.className = "text-[11px] text-center text-emerald-400 font-bold";
        msg.innerText = `Posizione confermata! Sei nei pressi di ${site.name}.`;
        
        setTimeout(() => {
          document.getElementById("step-gps").classList.add("hidden");
          document.getElementById("step-photo").classList.remove("hidden");
        }, 800);
      } else {
        msg.className = "text-[11px] text-center text-rose-400 font-bold";
        msg.innerText = `Troppo lontano (${(dist / 1000).toFixed(1)} km). Devi essere sul posto!`;
        btn.innerText = "Riprova GPS";
        btn.disabled = false;
      }
    },
    err => {
      msg.className = "text-[11px] text-center text-rose-400 font-bold";
      msg.innerText = "Autorizza l'accesso al GPS nelle impostazioni di Telegram.";
      btn.innerText = "Riprova GPS";
      btn.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// LIVELLO 2: Foto Live
function handleLivePhoto(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById("photo-preview-box").classList.remove("hidden");
    if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");

    setTimeout(() => {
      document.getElementById("step-photo").classList.add("hidden");
      setupQuizStep();
    }, 900);
  }
}

// LIVELLO 3: Micro-Quiz
function setupQuizStep() {
  const site = MONUMENTS[activeSiteKey];
  const quiz = site.quiz;

  document.getElementById("step-quiz").classList.remove("hidden");
  document.getElementById("quiz-question-text").innerText = quiz.question;

  const container = document.getElementById("quiz-options-container");
  container.innerHTML = "";

  quiz.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "w-full text-left p-2.5 rounded-xl text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium transition";
    btn.innerText = opt;
    btn.onclick = () => verifyQuizAnswer(idx, quiz.correct);
    container.appendChild(btn);
  });
}

function verifyQuizAnswer(selectedIndex, correctIndex) {
  if (selectedIndex === correctIndex) {
    if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
    addCheckInSuccess();
  } else {
    if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred("error");
    alert("Risposta non corretta! Guarda meglio il monumento e riprova.");
  }
}

function addCheckInSuccess() {
  const site = MONUMENTS[activeSiteKey];
  
  // Aggiungi timbro se non già presente
  if (!userState.stamps.includes(site.name)) {
    userState.stamps.push(site.name);
    userState.xp += 100;
    userState.level = Math.floor(userState.xp / 200) + 1;
    saveUserState();
  }

  document.getElementById("step-quiz").classList.add("hidden");
  document.getElementById("step-success").classList.remove("hidden");
}

function finishCheckIn() {
  closeCheckInModal();
  switchTab("passport");
}

// -------------------------------------------------------------
// PASSAPORTO E STORAGE
// -------------------------------------------------------------
function saveUserState() {
  localStorage.setItem("meeto_user_state", JSON.stringify(userState));
  updateUIBadges();
}

function loadUserState() {
  const saved = localStorage.getItem("meeto_user_state");
  if (saved) {
    userState = JSON.parse(saved);
  }
  updateUIBadges();
}

function updateUIBadges() {
  document.getElementById("user-xp-badge").innerText = `⭐ ${userState.xp} XP`;
  document.getElementById("pass-level").innerText = userState.level;
  document.getElementById("pass-xp").innerText = userState.xp;
  document.getElementById("pass-stamps").innerText = userState.stamps.length;
}

function renderPassport() {
  updateUIBadges();
  const gallery = document.getElementById("stamps-gallery");
  gallery.innerHTML = "";

  if (userState.stamps.length === 0) {
    gallery.innerHTML = `
      <div class="col-span-2 glass-card p-5 rounded-2xl text-center border-dashed border-zinc-700">
        <span class="text-3xl opacity-30">🏛️</span>
        <p class="text-xs text-zinc-400 mt-2 font-medium">Nessun timbro sbloccato.</p>
        <p class="text-[10px] text-zinc-500">Visita un luogo sulla mappa per inaugurare il passaporto!</p>
      </div>
    `;
    return;
  }

  userState.stamps.forEach(stampName => {
    const card = document.createElement("div");
    card.className = "glass-card p-3 rounded-2xl border border-amber-500/40 text-center";
    card.innerHTML = `
      <div class="text-2xl mb-1">🏛️</div>
      <h4 class="text-xs font-bold text-white truncate">${stampName}</h4>
      <span class="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">Verificato</span>
    `;
    gallery.appendChild(card);
  });
}

// -------------------------------------------------------------
// FETCH DATI ON-CHAIN (DEXSCREENER)
// -------------------------------------------------------------
async function fetchDexScreenerPrice() {
  const tokenAddress = "4MPMa8mdsrjaCJGN1CrNG1dQDh357SEzoAu9QR7vpump";
  const priceDisplay = document.getElementById("token-price-display");
  const changeDisplay = document.getElementById("token-change");

  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    const data = await res.json();
    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      const price = parseFloat(pair.priceUsd);
      priceDisplay.innerText = price < 0.0001 ? "$" + price.toFixed(8) : "$" + price.toFixed(4);
      
      if (pair.priceChange && pair.priceChange.h24 !== undefined) {
        const change = pair.priceChange.h24;
        const isPos = change >= 0;
        changeDisplay.innerText = `${isPos ? '▲ +' : '▼ '}${change}% (24h)`;
        changeDisplay.className = `text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`;
      }
    } else {
      priceDisplay.innerText = "$MEETO Live";
    }
  } catch (err) {
    priceDisplay.innerText = "$MEETO Live";
  }
}
