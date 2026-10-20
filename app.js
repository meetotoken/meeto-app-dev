<!DOCTYPE html>
<html lang="it" class="h-full w-full overflow-hidden">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>$MEETO — Mappa del Patrimonio Culturale</title>
  
  <!-- Telegram WebApp SDK -->
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Leaflet CSS & JS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brandDark: '#0B0E14',
            brandGold: '#D4AF37',
            brandBorder: 'rgba(212, 175, 55, 0.2)',
          }
        }
      }
    }
  </script>
  
  <style>
    * {
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    html, body {
      height: 100%;
      width: 100%;
      overflow: hidden;
      background-color: #0B0E14;
      color: #E2E8F0;
      font-family: 'Inter', sans-serif;
    }
    #map {
      height: 100%;
      width: 100%;
      z-index: 1;
      touch-action: pan-x pan-y;
    }
    .glass-panel {
      background: rgba(11, 14, 20, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(212, 175, 55, 0.3);
    }
    .leaflet-tile-pane { 
      filter: brightness(0.65) invert(1) contrast(2.8) hue-rotate(200deg) saturate(0.3); 
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="h-[100dvh] w-screen flex flex-col justify-between overflow-hidden relative">

  <!-- HEADER & BARRA CITTA' D'ARTE E SEGNALAZIONE -->
  <header class="w-full border-b border-brandBorder/30 bg-black/90 backdrop-blur-md px-4 py-2.5 flex flex-col gap-2 z-50 shrink-0">
    <div class="flex items-center justify-between">
      <a href="index.html" class="flex items-center space-x-2 active:opacity-70 transition">
        <span class="text-xl">🏛️</span>
        <span class="font-bold text-base text-amber-400 tracking-wide">$MEETO Heritage</span>
      </a>
      <div class="flex items-center gap-2">
        <button onclick="toggleSuggestModal(true)" class="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 active:scale-95 transition flex items-center gap-1">
          ➕ Segnala Sito
        </button>
        <button onclick="getUserLocation()" class="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-black hover:bg-amber-300 active:scale-95 transition flex items-center gap-1 shadow-lg shadow-amber-400/20">
          🎯 Posizione
        </button>
      </div>
    </div>

    <!-- SELETTORE RAPIDO CITTÀ PRINCIPALI -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
      <button onclick="jumpToCity(41.8902, 12.4922, 13, 'colosseo')" class="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 whitespace-nowrap active:scale-95 transition font-medium">🏛️ Roma</button>
      <button onclick="jumpToCity(37.5027, 15.0873, 14, 'duomo_catania')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">🌋 Catania</button>
      <button onclick="jumpToCity(37.0755, 15.2866, 14, 'parco_neapolis')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">🏛️ Siracusa</button>
      <button onclick="jumpToCity(37.8514, 15.2845, 14, 'teatro_greco_taormina')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">✨ Taormina</button>
      <button onclick="jumpToCity(37.2917, 13.5857, 14, 'valle_dei_templi')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">🏺 Agrigento</button>
      <button onclick="jumpToCity(43.7731, 11.2560, 14, 'piazza_duomo_firenze')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">🎨 Firenze</button>
      <button onclick="jumpToCity(45.4641, 9.1919, 14, 'duomo_milano')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">Milano</button>
      <button onclick="jumpToCity(45.4342, 12.3385, 14, 'piazza_san_marco')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">🛶 Venezia</button>
      <button onclick="jumpToCity(40.8359, 14.2488, 13, 'piazza_plebiscito')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">🌋 Napoli</button>
      <button onclick="jumpToCity(38.1145, 13.3561, 14, 'cattedrale_palermo')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">Palermo</button>
      <button onclick="jumpToCity(45.4384, 10.9916, 14, 'arena_verona')" class="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap active:scale-95 transition font-medium">Verona</button>
    </div>
  </header>

  <!-- MAPPA INTERATTIVA -->
  <main class="relative flex-1 w-full h-full overflow-hidden">
    <div id="map" class="w-full h-full"></div>
    
    <!-- CARD SCHEDA CULTURALE & SELEZIONE -->
    <div id="heritage-card" class="absolute bottom-16 left-3 right-3 z-20 glass-panel p-4 rounded-2xl max-w-md mx-auto shadow-2xl transition-all">
      <div class="flex justify-between items-start gap-2 mb-2">
        <div>
          <span class="text-[9px] text-amber-400 font-mono uppercase tracking-widest font-semibold">Patrimonio Culturale Verificato</span>
          <h3 id="site-title" class="font-bold text-base text-white">🏛️ Colosseo & Parco Archeologico</h3>
          <p id="site-city" class="text-xs text-gray-400">Roma (Lazio)</p>
        </div>
        <span id="site-reward" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
          +100 XP
        </span>
      </div>

      <p id="site-desc" class="text-xs text-gray-300 line-clamp-2 mb-3 leading-relaxed">
        L'Anfiteatro Flavio, conosciuto come Colosseo, è il più grande anfiteatro dell'antica Roma.
      </p>

      <div class="flex items-center gap-2">
        <a id="wiki-link" href="https://it.wikipedia.org/wiki/Colosseo" target="_blank" class="flex-1 text-center py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-95 transition flex items-center justify-center gap-1">
          📖 Wikipedia
        </a>
        <button id="select-btn" onclick="confirmSiteSelection()" class="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-600 text-black active:scale-95 transition shadow-lg shadow-amber-500/10">
          📍 Attiva per Check-In
        </button>
      </div>
    </div>
  </main>

  <!-- MODALE POP-UP SEGNALAZIONE -->
  <div id="suggest-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] hidden flex items-center justify-center p-4">
    <div class="glass-panel w-full max-w-sm rounded-2xl p-5 border border-amber-500/30 space-y-4 relative">
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-base text-amber-400 flex items-center gap-2">
          <span>➕</span> Segnala Luogo Culturale
        </h3>
        <button onclick="toggleSuggestModal(false)" class="text-gray-400 hover:text-white text-lg font-bold">✕</button>
      </div>

      <p class="text-xs text-gray-300">
        Invia un nuovo monumento, parco archeologico o museo. Dopo la verifica del team verrà aggiunto alla mappa ufficiale!
      </p>

      <form id="suggest-form" onsubmit="submitNewSite(event)" class="space-y-3">
        <div>
          <label class="text-[10px] uppercase font-bold text-gray-400">Nome del Monumento / Sito</label>
          <input id="input-name" type="text" required placeholder="Es. Castello Ursino" class="w-full mt-1 px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400" />
        </div>

        <div>
          <label class="text-[10px] uppercase font-bold text-gray-400">Città / Comune</label>
          <input id="input-city" type="text" required placeholder="Es. Catania (Sicilia)" class="w-full mt-1 px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400" />
        </div>

        <div>
          <label class="text-[10px] uppercase font-bold text-gray-400">Link Wikipedia / Info (Opzionale)</label>
          <input id="input-wiki" type="url" placeholder="https://it.wikipedia.org/wiki/..." class="w-full mt-1 px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400" />
        </div>

        <button type="submit" class="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-600 text-black active:scale-95 transition shadow-lg">
          🚀 Invia Proposta
        </button>
      </form>
    </div>
  </div>

  <!-- BOTTOM BAR NAVIGAZIONE -->
  <nav class="w-full bg-black/95 border-t border-brandBorder/30 backdrop-blur-lg px-6 py-2.5 flex justify-between items-center text-center z-50 shrink-0">
    <a href="index.html" class="flex flex-col items-center text-gray-400 active:text-amber-400">
      <span class="text-xl">🏠</span>
      <span class="text-[10px] mt-0.5">Home</span>
    </a>
    <a href="mappa.html" class="flex flex-col items-center text-amber-400">
      <span class="text-xl">🗺️</span>
      <span class="text-[10px] mt-0.5 font-semibold">Mappa</span>
    </a>
    <a href="social.html" class="flex flex-col items-center text-gray-400 active:text-amber-400">
      <span class="text-xl">👥</span>
      <span class="text-[10px] mt-0.5">Social</span>
    </a>
    <a href="token.html" class="flex flex-col items-center text-gray-400 active:text-amber-400">
      <span class="text-xl">🪙</span>
      <span class="text-[10px] mt-0.5">Token</span>
    </a>
  </nav>

  <!-- CARICAMENTO APP.JS E INIZIALIZZAZIONE MAPPA -->
  <script src="app.js"></script>
  <script>
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    let activeSiteKey = "colosseo";

    // Inizializzazione della mappa
    const map = L.map('map', { zoomControl: false }).setView([41.89021, 12.49223], 6);
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const markersMap = {};

    // Caricamento dinamico dei marker da app.js
    window.addEventListener('DOMContentLoaded', () => {
      // Forza il ricalcolo delle dimensioni Leaflet per evitare schermate vuote o grigie
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

      if (typeof MONUMENTS !== 'undefined') {
        Object.keys(MONUMENTS).forEach(key => {
          const site = MONUMENTS[key];
          if (site.lat && site.lng) {
            const marker = L.marker([site.lat, site.lng]).addTo(map);
            markersMap[key] = { marker, site };
            
            marker.on('click', () => {
              selectSiteUI(key, site);
            });
          }
        });
      }
    });

    function selectSiteUI(key, site) {
      activeSiteKey = key;
      document.getElementById('site-title').innerText = `🏛️ ${site.name}`;
      document.getElementById('site-city').innerText = site.city;
      document.getElementById('site-desc').innerText = site.desc;
      document.getElementById('wiki-link').href = site.wiki;
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    }

    function jumpToCity(lat, lng, zoom, targetSiteKey) {
      map.setView([lat, lng], zoom);
      
      if (targetSiteKey && markersMap[targetSiteKey]) {
        selectSiteUI(targetSiteKey, markersMap[targetSiteKey].site);
      }

      // Ricalcola mappa dopo il salto
      setTimeout(() => { map.invalidateSize(); }, 100);

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    }

    function toggleSuggestModal(show) {
      const modal = document.getElementById('suggest-modal');
      if (show) modal.classList.remove('hidden');
      else modal.classList.add('hidden');
    }

    function submitNewSite(event) {
      event.preventDefault();
      const name = document.getElementById('input-name').value;
      const city = document.getElementById('input-city').value;
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      alert(`🏛️ Proposta inviata!\n\n"${name}" (${city}) è stato inviato al team $MEETO.`);
      toggleSuggestModal(false);
      document.getElementById('suggest-form').reset();
    }

    function confirmSiteSelection() {
      localStorage.setItem('selected_site', activeSiteKey);

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      window.location.href = `index.html?site=${activeSiteKey}`;
    }

    function getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          map.setView([userLat, userLng], 14);
          
          L.circle([userLat, userLng], { 
            radius: 200, 
            color: '#D4AF37', 
            fillColor: '#D4AF37', 
            fillOpacity: 0.25 
          }).addTo(map);

          setTimeout(() => { map.invalidateSize(); }, 100);
        }, () => {
          alert("Attiva i permessi GPS sul tuo smartphone.");
        });
      }
    }
  </script>
</body>
</html>
