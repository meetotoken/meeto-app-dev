// Inizializzazione Telegram WebApp SDK
const tg = window.Telegram.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// Stato Wallet Solana
let walletAddress = null;

// --- REGISTRO CENTRALE UNICO (HOME & MAPPA) ---
const MONUMENTS = {
  colosseo: { name: "Colosseo & Parco Archeologico", city: "Roma (Lazio)", lat: 41.89021, lng: 12.49223, radiusMeters: 200, desc: "Anfiteatro Flavio dell'antica Roma, tra le Sette Meraviglie del Mondo Moderno.", wiki: "https://it.wikipedia.org/wiki/Colosseo" },
  duomo_milano: { name: "Duomo di Milano", city: "Milano (Lombardia)", lat: 45.4641, lng: 9.1919, radiusMeters: 200, desc: "Cattedrale gotica imponente, simbolo di Milano, rivestita in marmo di Candoglia.", wiki: "https://it.wikipedia.org/wiki/Duomo_di_Milano" },
  mole_torino: { name: "Mole Antonelliana", city: "Torino (Piemonte)", lat: 45.0689, lng: 7.6930, radiusMeters: 150, desc: "Monumento simbolo di Torino, sede del Museo Nazionale del Cinema.", wiki: "https://it.wikipedia.org/wiki/Mole_Antonelliana" },
  piazza_san_marco: { name: "Piazza San Marco", city: "Venezia (Veneto)", lat: 45.4342, lng: 12.3385, radiusMeters: 200, desc: "L'unica piazza di Venezia, dominata dalla Basilica e dal Campanile.", wiki: "https://it.wikipedia.org/wiki/Piazza_San_Marco" },
  arena_verona: { name: "Arena di Verona", city: "Verona (Veneto)", lat: 45.4384, lng: 10.9916, radiusMeters: 150, desc: "Anfiteatro romano celebre in tutto il mondo per la sua acustica e la lirica.", wiki: "https://it.wikipedia.org/wiki/Arena_di_Verona" },
  piazza_duomo_firenze: { name: "Piazza del Duomo & Battistero", city: "Firenze (Toscana)", lat: 43.7731, lng: 11.2560, radiusMeters: 150, desc: "Cuore rinascimentale di Firenze con la Cattedrale e la Cupola del Brunelleschi.", wiki: "https://it.wikipedia.org/wiki/Piazza_del_Duomo_(Firenze)" },
  duomo_catania: { name: "Duomo di Catania & Piazza del Duomo", city: "Catania (Sicilia)", lat: 37.5027, lng: 15.0873, radiusMeters: 150, desc: "Cattedrale barocca di Sant'Agata e Fontana dell'Elefante in pietra lavica.", wiki: "https://it.wikipedia.org/wiki/Cattedrale_di_Sant'Agata" },
  valle_dei_templi: { name: "Valle dei Templi", city: "Agrigento (Sicilia)", lat: 37.2917, lng: 13.5857, radiusMeters: 300, desc: "Parco archeologico della Magna Grecia celebre per il Tempio della Concordia.", wiki: "https://it.wikipedia.org/wiki/Valle_dei_templj" }
};

// Determina il sito attivo leggendo l'URL o il salvataggio precedente
function getActiveTarget() {
  const urlParams = new URLSearchParams(window.location.search);
  let siteKey = urlParams.get('site');
  
  if (siteKey && MONUMENTS[siteKey]) {
    localStorage.setItem('selected_site', siteKey);
  } else {
    siteKey = localStorage.getItem('selected_site') || 'colosseo';
  }
  
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
  const currentTarget = getActiveTarget();
  
  const siteNameEl = document.getElementById('active-site-name');
  const siteCityEl = document.getElementById('active-site-city');
  const siteDescEl = document.getElementById('active-site-desc');
  const siteWikiEl = document.getElementById('active-site-wiki');
  
  if (siteNameEl) siteNameEl.innerText = `🏛️ ${currentTarget.name}`;
  if (siteCityEl) siteCityEl.innerText = currentTarget.city;
  if (siteDescEl && currentTarget.desc) siteDescEl.innerText = currentTarget.desc;
  if (siteWikiEl && currentTarget.wiki) siteWikiEl.href = currentTarget.wiki;

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

  initCheckIn(currentTarget);
});

function updateButtonState(btn, address) {
  const shortAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  btn.innerText = shortAddress;
  btn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
}

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
      enableHighAccuracy: false,
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
        else if (error.code === 2) errDetail.innerText = "Segnale GPS non disponibile. Assicurati di essere all'aperto.";
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
