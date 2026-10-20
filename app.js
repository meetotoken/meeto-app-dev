// Inizializzazione Telegram WebApp SDK
const tg = window.Telegram.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// Stato Wallet Solana
let walletAddress = null;

// --- GEOLOCALIZZAZIONE & CHECK-IN CONFIG ---
// Coordinate di prova (Colosseo, Roma)
const TARGET_LOCATION = {
  name: "Colosseo",
  lat: 41.89021,
  lng: 12.49223,
  radiusMeters: 200 // Tolleranza in metri
};

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
  // 1. GESTIONE WALLET
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
        console.error("Errore di connessione wallet:", err);
        if (tg && tg.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('error');
        }
      }
    });
  }

  // 2. GESTIONE CHECK-IN GPS
  initCheckIn();
});

// Funzione di supporto aggiornamento bottone wallet
function updateButtonState(btn, address) {
  const shortAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  btn.innerText = shortAddress;
  btn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
}

// Funzione Inizializzazione Check-in GPS
function initCheckIn() {
  const checkInBtn = document.getElementById('btn-checkin');
  const statusMsg = document.getElementById('checkin-status');

  if (!checkInBtn) return;

  checkInBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (statusMsg) statusMsg.innerText = "La geolocalizzazione non è supportata dal dispositivo.";
      return;
    }

    checkInBtn.innerText = "Rilevamento posizione...";
    checkInBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const distance = calculateDistance(userLat, userLng, TARGET_LOCATION.lat, TARGET_LOCATION.lng);

        if (distance <= TARGET_LOCATION.radiusMeters) {
          // Check-in VALIDO
          checkInBtn.innerText = "Check-in Effettuato! 🏛️";
          checkInBtn.className = "w-full py-3 rounded-xl font-bold bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20";
          
          if (statusMsg) {
            statusMsg.innerText = `Sei al ${TARGET_LOCATION.name}! Hai guadagnato 100 $MEETO XP!`;
            statusMsg.className = "text-xs text-emerald-400 mt-2 font-medium";
          }

          if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
          }
        } else {
          // Check-in FALLITO (Troppo lontano)
          const distKm = (distance / 1000).toFixed(2);
          checkInBtn.innerText = "Riprova Check-in GPS";
          checkInBtn.disabled = false;

          if (statusMsg) {
            statusMsg.innerText = `Sei troppo lontano da ${TARGET_LOCATION.name} (${distKm} km). Avvicinati per sbloccare!`;
            statusMsg.className = "text-xs text-amber-400 mt-2 font-medium";
          }

          if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
          }
        }
      },
      (error) => {
        console.error("Errore GPS:", error);
        checkInBtn.innerText = "Riprova Check-in GPS";
        checkInBtn.disabled = false;

        if (statusMsg) {
          statusMsg.innerText = "Impossibile ottenere la posizione. Attiva il GPS nelle impostazioni del telefono.";
          statusMsg.className = "text-xs text-rose-400 mt-2 font-medium";
        }

        if (tg && tg.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
