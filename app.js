// Inizializzazione Telegram WebApp SDK
const tg = window.Telegram.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// Stato Wallet Solana
let walletAddress = null;

document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('btn-connect-wallet');

  if (connectBtn) {
    // Controllo preventivo se Phantom è già connesso in background
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
          // Connessione diretta immediata
          const resp = await window.solana.connect();
          walletAddress = resp.publicKey.toString();
          
          updateButtonState(connectBtn, walletAddress);

          if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
          }
        } else {
          // Reindirizzamento al browser di Phantom se non installato come estensione
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
});

// Funzione di supporto per aggiornare la grafica del bottone
function updateButtonState(btn, address) {
  const shortAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  btn.innerText = shortAddress;
  btn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
}
