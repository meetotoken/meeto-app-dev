// Inizializzazione Telegram WebApp SDK
const tg = window.Telegram.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// Stato Wallet Solana
let walletAddress = null;

// --- REGISTRO SITI CULTURALI ---
const MONUMENTS = {
  colosseo: { name: "Colosseo & Parco Archeologico", city: "Roma, Italia", lat: 41.89021, lng: 12.49223, radiusMeters: 200 },
  pantheon: { name: "Pantheon", city: "Roma, Italia", lat: 41.8986, lng: 12.4769, radiusMeters: 150 },
  duomo_milano: { name: "Duomo di Milano", city: "Milano, Italia", lat: 45.4641, lng: 9.1919, radiusMeters: 200 }
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
  
  if (siteNameEl) siteNameEl.innerText = `🏛️ ${currentTarget.name}`;
  if (siteCityEl) siteCityEl.innerText = currentTarget.city;

  // 2. GESTIONE WALLET
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
      checkInBtn.innerText = "📍 Fai Check-In GPS";
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
          checkInBtn.className = "w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20";
          
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
