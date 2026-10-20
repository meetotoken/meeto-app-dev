// Inizializzazione Telegram WebApp SDK
const tg = window.Telegram.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// Stato Wallet Solana
let walletAddress = null;

// --- REGISTRO PATRIMONIO CULTURALE (CAPOLUOGHI + GRANDI CITTÀ & SICILIA) ---
const MONUMENTS = {
  colosseo: {
    name: "Colosseo & Parco Archeologico",
    city: "Roma (Lazio)",
    lat: 41.89021,
    lng: 12.49223,
    radiusMeters: 200,
    desc: "Anfiteatro Flavio dell'antica Roma, inserito tra le Sette Meraviglie del Mondo Moderno.",
    wiki: "https://it.wikipedia.org/wiki/Colosseo"
  },
  pantheon: {
    name: "Pantheon",
    city: "Roma (Lazio)",
    lat: 41.8986,
    lng: 12.4769,
    radiusMeters: 150,
    desc: "Tempio romano dedicato a tutte le divinità, celebre per la sua enorme cupola ad oculo aperto.",
    wiki: "https://it.wikipedia.org/wiki/Pantheon_(Roma)"
  },
  duomo_catania: {
    name: "Duomo di Catania & Piazza del Duomo",
    city: "Catania (Sicilia)",
    lat: 37.5027,
    lng: 15.0873,
    radiusMeters: 150,
    desc: "Dedicato a Sant'Agata, celebre per la Fontana dell'Elefante in pietra lavica simbolo della città etnea.",
    wiki: "https://it.wikipedia.org/wiki/Cattedrale_di_Sant'Agata"
  },
  teatro_romano_catania: {
    name: "Teatro Romano e Odeon",
    city: "Catania (Sicilia)",
    lat: 37.5015,
    lng: 15.0838,
    radiusMeters: 150,
    desc: "Splendido complesso monumentale di età romana incastonato nel cuore barocco di Catania.",
    wiki: "https://it.wikipedia.org/wiki/Teatro_romano_di_Catania"
  },
  parco_neapolis: {
    name: "Parco Archeologico della Neapolis",
    city: "Siracusa (Sicilia)",
    lat: 37.0755,
    lng: 15.2866,
    radiusMeters: 200,
    desc: "Straordinario parco che ospita il Teatro Greco, l'Anfiteatro Romano e l'Orecchio di Dionisio.",
    wiki: "https://it.wikipedia.org/wiki/Parco_archeologico_della_Neapolis"
  },
  ortigia_siracusa: {
    name: "Isola di Ortigia & Duomo",
    city: "Siracusa (Sicilia)",
    lat: 37.0594,
    lng: 15.2925,
    radiusMeters: 200,
    desc: "Il cuore storico di Siracusa, ricco di testimonianze greche, normanne e barocche affacciate sul mare.",
    wiki: "https://it.wikipedia.org/wiki/Ortigia"
  },
  teatro_greco_taormina: {
    name: "Teatro Antico di Taormina",
    city: "Taormina (Sicilia)",
    lat: 37.8514,
    lng: 15.2845,
    radiusMeters: 200,
    desc: "Famoso teatro greco-romano con una vista mozzafiato sulla costa ionica e sull'Etna.",
    wiki: "https://it.wikipedia.org/wiki/Teatro_antico_di_Taormina"
  },
  valle_dei_templi: {
    name: "Valle dei Templi",
    city: "Agrigento (Sicilia)",
    lat: 37.2917,
    lng: 13.5857,
    radiusMeters: 300,
    desc: "Parco archeologico tra i più grandi e meglio conservati della Magna Grecia, celebre per il Tempio della Concordia.",
    wiki: "https://it.wikipedia.org/wiki/Valle_dei_templj"
  },
  duomo_milano: {
    name: "Duomo di Milano",
    city: "Milano (Lombardia)",
    lat: 45.4641,
    lng: 9.1919,
    radiusMeters: 200,
    desc: "Cattedrale gotica imponente, simbolo di Milano, rivestita in marmo di Candoglia.",
    wiki: "https://it.wikipedia.org/wiki/Duomo_di_Milano"
  },
  mole_torino: {
    name: "Mole Antonelliana",
    city: "Torino (Piemonte)",
    lat: 45.0689,
    lng: 7.6930,
    radiusMeters: 150,
    desc: "Monumento simbolo di Torino, progettato da Alessandro Antonelli, sede del Museo Nazionale del Cinema.",
    wiki: "https://it.wikipedia.org/wiki/Mole_Antonelliana"
  },
  piazza_san_marco: {
    name: "Piazza San Marco",
    city: "Venezia (Veneto)",
    lat: 45.4342,
    lng: 12.3385,
    radiusMeters: 200,
    desc: "L'unica piazza di Venezia, dominata dalla Basilica di San Marco e dal Campanile.",
    wiki: "https://it.wikipedia.org/wiki/Piazza_San_Marco"
  },
  piazza_duomo_firenze: {
    name: "Piazza del Duomo & Battistero",
    city: "Firenze (Toscana)",
    lat: 43.7731,
    lng: 11.2560,
    radiusMeters: 150,
    desc: "Cuore rinascimentale di Firenze con la Cattedrale di Santa Maria del Fiore e la Cupola del Brunelleschi.",
    wiki: "https://it.wikipedia.org/wiki/Piazza_del_Duomo_(Firenze)"
  },
  piazza_plebiscito: {
    name: "Piazza del Plebiscito",
    city: "Napoli (Campania)",
    lat: 40.8359,
    lng: 14.2488,
    radiusMeters: 200,
    desc: "Una delle più grandi piazze d'Italia, dominata dal Palazzo Reale e dalla Basilica di San Francesco di Paola.",
    wiki: "https://it.wikipedia.org/wiki/Piazza_del_Plebiscito_(Napoli)"
  },
  cattedrale_palermo: {
    name: "Cattedrale di Palermo",
    city: "Palermo (Sicilia)",
    lat: 38.1145,
    lng: 13.3561,
    radiusMeters: 150,
    desc: "Capolavoro arabo-normanno patrimonio UNESCO, testimone delle influenze culturali della Sicilia.",
    wiki: "https://it.wikipedia.org/wiki/Cattedrale_di_Palermo"
  },
  piazza_maggiore: {
    name: "Piazza Maggiore",
    city: "Bologna (Emilia-Romagna)",
    lat: 44.4938,
    lng: 11.3426,
    radiusMeters: 150,
    desc: "Il cuore della città medievale di Bologna, circondata dalla Basilica di San Petronio e dai palazzi storici.",
    wiki: "https://it.wikipedia.org/wiki/Piazza_Maggiore"
  },
  arena_verona: {
    name: "Arena di Verona",
    city: "Verona (Veneto)",
    lat: 45.4384,
    lng: 10.9916,
    radiusMeters: 150,
    desc: "Anfiteatro romano celebre in tutto il mondo per la sua acustica e le grandi stagioni liriche.",
    wiki: "https://it.wikipedia.org/wiki/Arena_di_Verona"
  },
  piazza_de_ferrari: {
    name: "Piazza De Ferrari",
    city: "Genova (Liguria)",
    lat: 44.4072,
    lng: 8.9340,
    radiusMeters: 150,
    desc: "La piazza principale di Genova con la sua monumentale fontana in bronzo e il Palazzo Ducale.",
    wiki: "https://it.wikipedia.org/wiki/Piazza_De_Ferrari"
  },
  basilica_san_nicola: {
    name: "Basilica di San Nicola",
    city: "Bari (Puglia)",
    lat: 41.1306,
    lng: 16.8703,
    radiusMeters: 150,
    desc: "Capolavoro dell'architettura romanica pugliese, custodisce le reliquie di San Nicola.",
    wiki: "https://it.wikipedia.org/wiki/Basilica_di_San_Nicola"
  },
  sassi_matera: {
    name: "Sassi di Matera",
    city: "Matera (Basilicata)",
    lat: 40.6664,
    lng: 16.6108,
    radiusMeters: 200,
    desc: "Architettura rupestre scavata nella calcarenite, abitata fin dalla preistoria e patrimonio UNESCO.",
    wiki: "https://it.wikipedia.org/wiki/Sassi_di_Matera"
  }
};

// Determina il sito attivo (da URL, localStorage o default Colosseo)
function getActiveTarget() {
  const urlParams = new URLSearchParams(window.location.search);
  const siteKey = urlParams.get('site') || localStorage.getItem('selected_site') || 'colosseo';
  return MONUMENTS[siteKey] || MONUMENTS.colosseo;
}

// Formula Haversine per calcolo distanza GPS in metri
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. AGGIORNA UI DEL MONUMENTO ATTIVO NELLA HOME
  const currentTarget = getActiveTarget();
  
  const siteNameEl = document.getElementById('active-site-name');
  const siteCityEl = document.getElementById('active-site-city');
  const siteDescEl = document.getElementById('active-site-desc');
  const siteWikiEl = document.getElementById('active-site-wiki');
  
  if (siteNameEl) siteNameEl.innerText = `🏛️ ${currentTarget.name}`;
  if (siteCityEl) siteCityEl.innerText = currentTarget.city;
  if (siteDescEl && currentTarget.desc) siteDescEl.innerText = currentTarget.desc;
  if (siteWikiEl && currentTarget.wiki) siteWikiEl.href = currentTarget.wiki;

  // 2. GESTIONE WALLET SOLANA
  const connectBtn = document.getElementById('btn-connect-wallet');

  if (connectBtn) {
    if (window.solana && window.solana.isConnected) {
      window.solana.connect({ onlyIfTrusted: true }).then(resp => {
        walletAddress = resp.publicKey.toString();
        updateButtonState(connectBtn, walletAddress);
      }).catch(() => {});
    }

    connectBtn.addEventListener('click', async () => {
      try {
        const isPhantomInstalled = window.solana && window.solana.isPhantom;

        if (isPhantomInstalled) {
          const resp = await window.solana.connect();
          walletAddress = resp.publicKey.toString();
          
          updateButtonState(connectBtn, walletAddress);

          if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
          }
        } else {
          const targetUrl = "https://phantom.app/ul/browse/" + encodeURIComponent(window.location.href);

          if (tg && typeof tg.openLink === 'function') {
            tg.openLink(targetUrl);
          } else {
            window.location.href = targetUrl;
          }
        }
      } catch (err) {
        console.error("Errore connessione wallet:", err);
        if (tg && tg.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('error');
        }
      }
    });
  }

  // 3. GESTIONE CHECK-IN GPS
  initCheckIn(currentTarget);
});

// Supporto bottone wallet
function updateButtonState(btn, address) {
  const shortAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  btn.innerText = shortAddress;
  btn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
}

// Inizializzazione Check-in GPS
function initCheckIn(targetLocation) {
  const checkInBtn = document.getElementById('btn-checkin');
  const statusMsg = document.getElementById('checkin-status');

  if (!checkInBtn) return;

  checkInBtn.addEventListener('click', () => {
    checkInBtn.innerText = "Rilevamento posizione...";
    checkInBtn.disabled = true;

    if (!navigator.geolocation) {
      if (statusMsg) {
        statusMsg.innerText = "Geolocalizzazione non supportata dal tuo browser.";
        statusMsg.className = "text-xs text-rose-400 mt-2 font-medium";
      }
      checkInBtn.innerText = "📍 Check-In GPS";
      checkInBtn.disabled = false;
      return;
    }

    const options = {
      enableHighAccuracy: false, // Disattivato HighAccuracy per evitare blocchi/timeout su Telegram
      timeout: 15000,
      maximumAge: 30000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const distance = calculateDistance(userLat, userLng, targetLocation.lat, targetLocation.lng);

        if (distance <= targetLocation.radiusMeters) {
          checkInBtn.innerText = "Check-in Effettuato! 🏛️";
          checkInBtn.className = "flex-1 text-center py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20";
          
          if (statusMsg) {
            statusMsg.innerText = `Sei a ${targetLocation.name}! Hai guadagnato 100 $MEETO XP!`;
            statusMsg.className = "text-xs text-emerald-400 mt-2 font-medium";
          }

          if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
          }
        } else {
          const distKm = (distance / 1000).toFixed(2);
          checkInBtn.innerText = "📍 Riprova Check-In GPS";
          checkInBtn.disabled = false;

          if (statusMsg) {
            statusMsg.innerText = `Sei troppo lontano da ${targetLocation.name} (${distKm} km). Avvicinati per sbloccare!`;
            statusMsg.className = "text-xs text-amber-400 mt-2 font-medium";
          }

          if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
          }
        }
      },
      (error) => {
        console.error("Errore GPS Telegram:", error);
        checkInBtn.innerText = "📍 Riprova Check-In GPS";
        checkInBtn.disabled = false;

        let errDetail = "Attiva il GPS e autorizza la posizione per Telegram nelle impostazioni del telefono.";
        if (error.code === 1) errDetail = "Permesso GPS negato. Abilita la posizione per Telegram nelle impostazioni del dispositivo.";
        else if (error.code === 2) errDetail = "Segnale GPS non disponibile. Assicurati di essere all'aperto.";
        else if (error.code === 3) errDetail = "Timeout GPS scaduto. Riprova tra un istante.";

        if (statusMsg) {
          statusMsg.innerText = errDetail;
          statusMsg.className = "text-xs text-rose-400 mt-2 font-medium";
        }

        if (tg && tg.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('error');
        }
      },
      options
    );
  });
}
