// Inizializzazione Telegram WebApp SDK
const tg = window.Telegram.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// Stato Wallet Solana
let walletAddress = null;

const connectBtn = document.getElementById('btn-connect-wallet');

if (connectBtn) {
  connectBtn.addEventListener('click', async () => {
    try {
      const isPhantomInstalled = window.solana && window.solana.isPhantom;

      if (isPhantomInstalled) {
        // Connessione diretta se il provider è presente (es. dentro Phantom Browser)
        const resp = await window.solana.connect();
        walletAddress = resp.publicKey.toString();
        
        const shortAddress = `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
        connectBtn.innerText = shortAddress;
        connectBtn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";

        if (tg && tg.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('success');
        }
      } else {
        // Se si trova in Chrome o dentro Telegram senza provider, reindirizza al Deep Link Phantom
        const appUrl = encodeURIComponent(window.location.href);
        const phantomDeepLink = `https://phantom.app/ul/browse/${appUrl}?ref=${encodeURIComponent(window.location.origin)}`;
        
        window.location.href = phantomDeepLink;
      }
    } catch (err) {
      console.error("Errore di connessione wallet:", err);
      if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('error');
      }
    }
  });
}
