// Inizializzazione Telegram WebApp SDK
const tg = window.Telegram.WebApp;

// Segnala a Telegram che l'app è pronta e la espande a schermo intero
tg.ready();
tg.expand();

// Recupera informazioni dall'utente Telegram
const user = tg.initDataUnsafe?.user;
if (user) {
  document.getElementById('user-welcome').innerText = `Benvenuto, ${user.first_name}!`;
  document.getElementById('telegram-id').innerText = `ID: @${user.username || user.id}`;
}

// Stato Wallet Solana
let walletAddress = null;

// Gestione Connessione Wallet (Esempio per Phantom / Injected Providers)
document.getElementById('btn-connect-wallet').addEventListener('click', async () => {
  try {
    const isPhantomInstalled = window.solana && window.solana.isPhantom;

    if (isPhantomInstalled) {
      const resp = await window.solana.connect();
      walletAddress = resp.publicKey.toString();
      
      document.getElementById('wallet-address').innerText = `Wallet: ${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
      document.getElementById('btn-checkin').disabled = false;
      
      // Feedback Aptico Nativo Telegram (Vibrazione)
      if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
    } else {
      alert(" Wallet Phantom non rilevato! Apri la WebApp dal browser di Phantom o installa l'estensione.");
    }
  } catch (err) {
    console.error("Errore di connessione wallet:", err);
  }
});
