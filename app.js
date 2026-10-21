<!DOCTYPE html>
<html lang="it" class="h-full w-full">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>$MEETO — Passaporto Culturale & Mappa</title>
  
  <!-- Telegram WebApp SDK -->
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Leaflet per la Mappa -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    * { -webkit-tap-highlight-color: transparent; }
    body {
      background-color: #0B0E14;
      color: #E2E8F0;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .glass-card {
      background: rgba(18, 22, 31, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(212, 175, 55, 0.25);
    }
    .gold-gradient-text {
      background: linear-gradient(135deg, #FFF5C0 0%, #D4AF37 50%, #AA7C11 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .leaflet-tile-pane { 
      filter: brightness(0.65) invert(1) contrast(2.6) hue-rotate(200deg) saturate(0.3); 
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="h-full w-full flex flex-col justify-between overflow-hidden relative">

  <!-- TOP HEADER -->
  <header class="w-full border-b border-amber-500/20 bg-black/85 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between shrink-0">
    <div class="flex items-center space-x-2">
      <span class="text-xl">🏛️</span>
      <span class="font-extrabold text-base tracking-wider gold-gradient-text">$MEETO</span>
      <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">Heritage V2</span>
    </div>
    <div class="flex items-center gap-2">
      <span id="user-xp-badge" class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-zinc-900 border border-amber-500/40 text-amber-300">
        ⭐ 0 XP
      </span>
    </div>
  </header>

  <!-- CONTENITORE VISTE SPA -->
  <main class="flex-1 w-full h-full relative overflow-hidden">

    <!-- TAB 1: MAPPA ESPLORA -->
    <section id="tab-map" class="w-full h-full relative flex flex-col">
      <!-- Selettore Orizzontale Tutte le Città -->
      <div class="absolute top-3 left-3 right-3 z-[400] flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button onclick="jumpToCity('roma')" class="px-3 py-1.5 rounded-full bg-black/85 border border-amber-500/50 text-amber-300 text-xs font-bold whitespace-nowrap shadow-lg">🏛️ Roma</button>
        <button onclick="jumpToCity('firenze')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🎨 Firenze</button>
        <button onclick="jumpToCity('venezia')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🎭 Venezia</button>
        <button onclick="jumpToCity('napoli')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🍕 Napoli</button>
        <button onclick="jumpToCity('milano')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🏰 Milano</button>
        <button onclick="jumpToCity('torino')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">👑 Torino</button>
        <button onclick="jumpToCity('bologna')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🗼 Bologna</button>
        <button onclick="jumpToCity('verona')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">⚔️ Verona</button>
        <button onclick="jumpToCity('pisa')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">📐 Pisa</button>
        <button onclick="jumpToCity('siena')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🐎 Siena</button>
        <button onclick="jumpToCity('genova')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">⚓ Genova</button>
        <button onclick="jumpToCity('matera')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🪨 Matera</button>
        <button onclick="jumpToCity('bari_puglia')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🏰 Puglia</button>
        <button onclick="jumpToCity('palermo')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🌴 Palermo</button>
        <button onclick="jumpToCity('catania')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🌋 Catania</button>
        <button onclick="jumpToCity('agrigento')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🏺 Agrigento</button>
        <button onclick="jumpToCity('assisi')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🕊️ Assisi</button>
        <button onclick="jumpToCity('trieste')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">🌊 Trieste</button>
        <button onclick="jumpToCity('cagliari')" class="px-3 py-1.5 rounded-full bg-black/85 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shadow-lg">⛵ Cagliari</button>
        <button onclick="getUserLocation()" class="px-3 py-1.5 rounded-full bg-amber-400 text-black text-xs font-extrabold whitespace-nowrap shadow-lg ml-auto">🎯 GPS</button>
      </div>

      <!-- Mappa Leaflet -->
      <div id="map" class="w-full h-full"></div>

      <!-- Bottom Sheet Monumento -->
      <div id="monument-sheet" class="absolute bottom-20 left-3 right-3 z-[400] glass-card p-4 rounded-2xl max-w-lg mx-auto shadow-2xl transition-all duration-300">
        <div class="flex justify-between items-start gap-2 mb-1.5">
          <div>
            <span class="text-[9px] text-amber-400 uppercase tracking-widest font-mono font-bold" id="sheet-city">Roma (Lazio)</span>
            <h3 id="sheet-title" class="font-bold text-base text-white">🏛️ Colosseo & Parco Archeologico</h3>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">+100 XP</span>
        </div>
        <p id="sheet-desc" class="text-xs text-zinc-300 line-clamp-2 mb-3 leading-relaxed">
          Anfiteatro Flavio dell'antica Roma, tra le Sette Meraviglie del Mondo Moderno.
        </p>
        <div class="flex gap-2">
          <a id="sheet-wiki" href="https://it.wikipedia.org" target="_blank" class="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center">
            📖 Info
          </a>
          <button onclick="openCheckInModal()" class="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-yellow-600 text-black shadow-lg shadow-amber-500/20 active:scale-95 transition">
            📍 Avvia Check-In sul Posto
          </button>
        </div>
      </div>
    </section>

    <!-- TAB 2: PASSAPORTO CULTURALE -->
    <section id="tab-passport" class="w-full h-full overflow-y-auto px-4 py-5 space-y-4 pb-24 hidden">
      <div class="glass-card rounded-2xl p-5 border border-amber-500/30 text-center relative overflow-hidden">
        <div class="text-4xl mb-2">📜</div>
        <h2 class="text-lg font-black text-white gold-gradient-text">Passaporto Explorer Ufficiale</h2>
        <p class="text-xs text-zinc-400 max-w-xs mx-auto mt-1">Colleziona visite storiche verificate, supera i quiz sul posto e scala il rango esploratore.</p>
        
        <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800 text-center">
          <div>
            <div class="text-[11px] text-zinc-400 uppercase font-semibold">Livello</div>
            <div id="pass-level" class="text-base font-black text-amber-400">1</div>
          </div>
          <div>
            <div class="text-[11px] text-zinc-400 uppercase font-semibold">Totale XP</div>
            <div id="pass-xp" class="text-base font-black text-white">0</div>
          </div>
          <div>
            <div class="text-[11px] text-zinc-400 uppercase font-semibold">Timbri</div>
            <div id="pass-stamps" class="text-base font-black text-emerald-400">0</div>
          </div>
        </div>
      </div>

      <!-- Timbri e Ricordi Visite -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">I Tuoi Timbri Sbloccati</h3>
        <div id="stamps-gallery" class="grid grid-cols-2 gap-3">
          <div class="col-span-2 glass-card p-5 rounded-2xl text-center border-dashed border-zinc-700">
            <span class="text-3xl opacity-30">🏛️</span>
            <p class="text-xs text-zinc-400 mt-2 font-medium">Nessun timbro sbloccato.</p>
            <p class="text-[10px] text-zinc-500">Raggiungi uno dei monumenti sulla mappa per timbrare il passaporto!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 3: TOKEN & MERCATO ON-CHAIN -->
    <section id="tab-token" class="w-full h-full overflow-y-auto px-4 py-5 space-y-4 pb-24 hidden">
      <!-- Card Prezzo Live -->
      <div class="glass-card rounded-2xl p-5 border border-amber-500/30">
        <span class="text-[10px] text-zinc-400 uppercase tracking-widest font-mono font-bold">Prezzo Live On-Chain ($MEETO)</span>
        <div class="flex items-baseline gap-2 mt-1">
          <div id="token-price-display" class="text-2xl font-black gold-gradient-text">Caricamento...</div>
          <span id="token-change" class="text-xs font-bold text-zinc-400">--</span>
        </div>
        <p class="text-[11px] text-zinc-400 mt-2">Dati integrati in tempo reale da DexScreener (Solana Mainnet).</p>
      </div>

      <!-- Grafico Integrato DexScreener -->
      <div class="glass-card rounded-2xl p-3 border border-zinc-800">
        <div style="position: relative; width: 100%; height: 320px;">
          <iframe src="https://dexscreener.com/solana/4MPMa8mdsrjaCJGN1CrNG1dQDh357SEzoAu9QR7vpump?embed=1&theme=dark&trades=0&info=0" 
                  style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: 0; border-radius: 12px;"></iframe>
        </div>
      </div>

      <!-- Tokenomics Reale 70 / 20 / 10 -->
      <div class="glass-card rounded-2xl p-4 border border-zinc-800 space-y-3">
        <h3 class="text-xs font-bold text-white uppercase tracking-wider">Tokenomics Ufficiale (1B Supply)</h3>
        <div class="w-full h-3 bg-black/60 rounded-full overflow-hidden flex border border-zinc-800">
          <div class="h-full bg-emerald-500" style="width: 70%" title="Mercato 70%"></div>
          <div class="h-full bg-amber-400" style="width: 20%" title="Team 20%"></div>
          <div class="h-full bg-purple-500" style="width: 10%" title="Treasury 10%"></div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-[10px] text-center pt-1">
          <div><span class="text-emerald-400 font-bold block">70%</span> Mercato Pubblico</div>
          <div><span class="text-amber-400 font-bold block">20%</span> Team & Dev</div>
          <div><span class="text-purple-400 font-bold block">10%</span> Treasury & Rewards</div>
        </div>
      </div>

      <!-- Copia CA -->
      <div class="glass-card p-3 rounded-xl flex justify-between items-center text-xs">
        <div class="truncate mr-2"><span class="text-zinc-500 font-bold">CA:</span> <code class="text-amber-300 font-mono">4MPMa8mdsrja...pump</code></div>
        <button onclick="navigator.clipboard.writeText('4MPMa8mdsrjaCJGN1CrNG1dQDh357SEzoAu9QR7vpump'); alert('Contract Address copiato!');" 
                class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold shrink-0">
          Copia CA
        </button>
      </div>
    </section>

  </main>

  <!-- MODALE DEI 3 LIVELLI DI CHECK-IN -->
  <div id="checkin-modal" class="fixed inset-0 bg-black/90 backdrop-blur-md z-[500] hidden flex items-center justify-center p-4">
    <div class="glass-card w-full max-w-sm rounded-2xl p-5 border border-amber-500/40 space-y-4">
      <div class="flex justify-between items-center border-b border-zinc-800 pb-2">
        <h3 class="font-bold text-sm text-white truncate" id="modal-monument-name">Check-in</h3>
        <button onclick="closeCheckInModal()" class="text-zinc-400 hover:text-white font-bold text-base px-1">✕</button>
      </div>

      <!-- STEP 1: VERIFICA GPS -->
      <div id="step-gps" class="space-y-3">
        <div class="text-center py-2">
          <div class="text-3xl mb-1">📍</div>
          <p class="text-xs text-zinc-300">Passo 1: Verifica la tua posizione sul posto.</p>
        </div>
        <button id="btn-verify-gps" onclick="verifyGPSLocation()" class="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-black shadow-md">
          Verifica Posizione GPS
        </button>
        <div id="gps-status-msg" class="text-[11px] text-center text-zinc-400 font-medium"></div>
      </div>

      <!-- STEP 2: FOTOCAMERA LIVE -->
      <div id="step-photo" class="space-y-3 hidden">
        <div class="text-center py-2">
          <div class="text-3xl mb-1">📸</div>
          <p class="text-xs text-zinc-300">Passo 2: Scatta una foto dal vivo per il tuo passaporto.</p>
        </div>
        <label class="block w-full py-2.5 rounded-xl text-xs font-bold text-center bg-zinc-800 border border-amber-500/40 text-amber-300 cursor-pointer hover:bg-zinc-700">
          📷 Scatta Foto Live
          <input type="file" accept="image/*" capture="camera" class="hidden" onchange="handleLivePhoto(event)" />
        </label>
        <div id="photo-preview-box" class="hidden text-center">
          <span class="text-[11px] text-emerald-400 font-bold">✅ Foto acquisita con successo!</span>
        </div>
      </div>

      <!-- STEP 3: MICRO-QUIZ SUL POSTO -->
      <div id="step-quiz" class="space-y-3 hidden">
        <div class="text-left py-1">
          <span class="text-[10px] text-amber-400 font-mono uppercase font-bold">Passo 3: Dettaglio sul posto</span>
          <p id="quiz-question-text" class="text-xs font-bold text-white mt-1 leading-snug">Caricamento domanda...</p>
        </div>
        <div id="quiz-options-container" class="space-y-2"></div>
      </div>

      <!-- STEP 4: SUCCESSO -->
      <div id="step-success" class="space-y-3 text-center py-4 hidden">
        <div class="text-5xl animate-bounce">🎉</div>
        <h4 class="font-black text-base text-emerald-400">Visita Convalidata!</h4>
        <p class="text-xs text-zinc-300">Hai guadagnato <b class="text-amber-400">+100 XP</b> e sbloccato il timbro ufficiale nel diario di viaggio.</p>
        <button onclick="finishCheckIn()" class="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black mt-2">
          Guarda nel Passaporto
        </button>
      </div>

    </div>
  </div>

  <!-- BOTTOM BAR NAVIGAZIONE SPA -->
  <nav class="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-amber-500/20 backdrop-blur-lg px-6 py-2.5 flex justify-around items-center text-center z-50">
    <button onclick="switchTab('map')" id="nav-map" class="flex flex-col items-center text-amber-400">
      <span class="text-lg">🗺️</span>
      <span class="text-[10px] mt-0.5 font-bold">Mappa</span>
    </button>
    <button onclick="switchTab('passport')" id="nav-passport" class="flex flex-col items-center text-zinc-400 hover:text-amber-300">
      <span class="text-lg">📜</span>
      <span class="text-[10px] mt-0.5 font-bold">Passaporto</span>
    </button>
    <button onclick="switchTab('token')" id="nav-token" class="flex flex-col items-center text-zinc-400 hover:text-amber-300">
      <span class="text-lg">🪙</span>
      <span class="text-[10px] mt-0.5 font-bold">Token</span>
    </button>
  </nav>

  <!-- JAVASCRIPT CENTRALE -->
  <script src="app.js"></script>
</body>
</html>
