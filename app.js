// Inizializzazione Telegram WebApp SDK
const tg = window.Telegram.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// Stato Wallet Solana
let walletAddress = null;

// Gestione Connessione Wallet Phantom / Provider Injected
document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('btn-connect-wallet');

  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      try {
        const isPhantomInstalled = window.solana && window.solana.isPhantom;

        if (isPhantomInstalled) {
          // Connessione diretta se il provider è presente
          const resp = await window.solana.connect();
          walletAddress = resp.publicKey.toString();
          
          const shortAddress = `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
          connectBtn.innerText = shortAddress;
          connectBtn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";

          if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
          }
        } else {
          // Genera il link universale per Phantom
          const currentUrl = encodeURIComponent(window.location.href);
          const phantomUniversalLink = `https://phantom.com/ul/browse/${currentUrl}`;

          // Se siamo in Telegram, usa tg.openLink per aprire l'app esterna correttamente
          if (tg && typeof tg.openLink === 'function') {
            tg.openLink(phantomUniversalLink);
          } else {
            // Fallback per browser standard
            window.location.href = phantomUniversalLink;
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
