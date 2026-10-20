// Funzione Inizializzazione Check-in GPS compatibile con Telegram WebView
function initCheckIn() {
  const checkInBtn = document.getElementById('btn-checkin');
  const statusMsg = document.getElementById('checkin-status');

  if (!checkInBtn) return;

  checkInBtn.addEventListener('click', () => {
    checkInBtn.innerText = "Rilevamento posizione...";
    checkInBtn.disabled = true;

    // Callback unico per gestire il calcolo delle coordinate
    const handlePosition = (lat, lng) => {
      const distance = calculateDistance(lat, lng, TARGET_LOCATION.lat, TARGET_LOCATION.lng);

      if (distance <= TARGET_LOCATION.radiusMeters) {
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
        const distKm = (distance / 1000).toFixed(2);
        checkInBtn.innerText = "📍 Riprova Check-In GPS";
        checkInBtn.disabled = false;

        if (statusMsg) {
          statusMsg.innerText = `Sei troppo lontano da ${TARGET_LOCATION.name} (${distKm} km). Avvicinati per sbloccare!`;
          statusMsg.className = "text-xs text-amber-400 mt-2 font-medium";
        }

        if (tg && tg.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('warning');
        }
      }
    };

    const handleError = (err) => {
      console.error("Errore GPS:", err);
      checkInBtn.innerText = "📍 Riprova Check-In GPS";
      checkInBtn.disabled = false;

      if (statusMsg) {
        statusMsg.innerText = "Impossibile ottenere la posizione. Verifica che Telegram abbia i permessi GPS attivi nelle impostazioni del telefono.";
        statusMsg.className = "text-xs text-rose-400 mt-2 font-medium";
      }

      if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('error');
      }
    };

    // 1. TENTATIVO VIA TELEGRAM LOCATION MANAGER (se disponibile)
    if (tg && tg.LocationManager && tg.LocationManager.isInited) {
      tg.LocationManager.getLocation((data) => {
        if (data && data.latitude && data.longitude) {
          handlePosition(data.latitude, data.longitude);
        } else {
          fallbackGeolocation(handlePosition, handleError);
        }
      });
    } else {
      // 2. FALLBACK BROWSER GEOLOCATION (Timeout più lungo e opzioni flessibili)
      fallbackGeolocation(handlePosition, handleError);
    }
  });
}

function fallbackGeolocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError(new Error("Geolocalizzazione non supportata"));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      onSuccess(position.coords.latitude, position.coords.longitude);
    },
    (err) => {
      // Se fallisce in alta precisione, riprova senza HighAccuracy (più veloce su WebView)
      navigator.geolocation.getCurrentPosition(
        (pos) => onSuccess(pos.coords.latitude, pos.coords.longitude),
        onError,
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}
