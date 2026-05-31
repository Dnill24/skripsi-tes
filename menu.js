const state = {
  language: 'id',
  volume: 50
};

// Validates username for Firebase NoSQL keys
function sanitizeUsername(name) {
  return name.trim().replace(/[.#$[\]\s/]/g, '_').toLowerCase();
}

const translations = {
  en: {
    play: '⚔️ Play',
    playAsGuest: '👤 Guest Mode',
    login: '⭐ Login',
    settings: '⚙️ Settings',
    volume: 'Volume',
    language: 'Language',
    save: '💾 Save',
    cancel: '✕ Cancel',
    startYourQuest: 'Start Your Quest!',
    joinTheTeam: 'Join the Adventure!',
    heroName: 'Hero Name',
    secretCode: 'Secret Code',
    startPlaying: '🚀 Start!',
    pickHeroName: 'Please pick a hero name to start!',
    gameTitle: 'Math Quest Adventure',
    exit: '← Back'
  },
  id: {
    play: '⚔️ Main',
    playAsGuest: '👤 Mode Tamu',
    login: '⭐ Masuk',
    settings: '⚙️ Pengaturan',
    volume: 'Volume',
    language: 'Bahasa',
    save: '💾 Simpan',
    cancel: '✕ Batal',
    startYourQuest: 'Mulai Petualanganmu!',
    joinTheTeam: 'Bergabunglah!',
    heroName: 'Nama Pahlawan',
    secretCode: 'Kode Rahasia',
    startPlaying: '🚀 Mulai!',
    pickHeroName: 'Pilih nama pahlawan untuk mulai!',
    gameTitle: 'Math Quest Adventure',
    exit: '← Kembali'
  }
};

const elements = {
  playButton: document.getElementById('playButton'),
  playOptions: document.getElementById('playOptions'),
  guestButton: document.getElementById('guestButton'),
  loginButton: document.getElementById('loginButton'),
  signupButton: document.getElementById('signupButton'),
  exitButton: document.getElementById('exitButton'),
  settingsButton: document.getElementById('settingsButton'),
  
  loginModal: document.getElementById('loginModal'),
  usernameInput: document.getElementById('usernameInput'),
  passwordInput: document.getElementById('passwordInput'),
  loginSubmitButton: document.getElementById('loginSubmitButton'),
  cancelLogin: document.getElementById('cancelLogin'),
  
  signupModal: document.getElementById('signupModal'),
  signupUsernameInput: document.getElementById('signupUsernameInput'),
  signupPasswordInput: document.getElementById('signupPasswordInput'),
  signupSubmitButton: document.getElementById('signupSubmitButton'),
  cancelSignup: document.getElementById('cancelSignup'),
  
  settingsModal: document.getElementById('settingsModal'),
  volumeSlider: document.getElementById('volumeSlider'),
  volumeValue: document.getElementById('volumeValue'),
  languageSelect: document.getElementById('languageSelect'),
  saveSettings: document.getElementById('saveSettings'),
  closeSettings: document.getElementById('closeSettings')
};

function loadSettings() {
  const stored = localStorage.getItem('mathQuestSettings');
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    Object.assign(state, parsed);
  } catch (error) {
    console.warn('Failed to load settings.', error);
  }
}

function saveSettings() {
  localStorage.setItem('mathQuestSettings', JSON.stringify({
    language: state.language,
    volume: state.volume
  }));
}

function setLanguage(lang) {
  state.language = lang;
  document.documentElement.lang = lang;
  saveSettings();
  if (typeof applyTranslationsToDOM === 'function') {
    applyTranslationsToDOM(lang);
  }
}

function playAsGuest() {
  localStorage.setItem('mathQuestUser', JSON.stringify({ user: 'Guest', isLoggedIn: true }));
  localStorage.removeItem('mathQuestRogueStats'); // Start fresh
  window.location.href = 'game.html';
}

function login() {
  const username = elements.usernameInput.value.trim();
  const password = elements.passwordInput.value.trim();
  
  if (!username) {
    alert(getTranslation('pickHeroName', state.language) || 'Please pick a hero name to start!');
    return;
  }
  
  if (typeof db === 'undefined') {
    alert("Firebase not connected. Logging in offline.");
    localStorage.setItem('mathQuestUser', JSON.stringify({ user: username, isLoggedIn: true }));
    window.location.href = 'game.html';
    return;
  }
  
  const cleanName = sanitizeUsername(username);
  if (!cleanName) return alert("Invalid Name!");
  
  const userRef = db.ref('users/' + cleanName);
  
  userRef.once('value', snap => {
    if (snap.exists()) {
      // Existing user: check password
      const userData = snap.val();
      if (userData.password === password) {
        // Success
        localStorage.setItem('mathQuestUser', JSON.stringify({ user: username, isLoggedIn: true }));
        
        if (userData.password === password) {
          if (userData.stats) {
            // Restore sanitized keys
            if (userData.stats.globalStats) {
              userData.stats.globalStats['+'] = userData.stats.globalStats['add'] || 0;
              userData.stats.globalStats['-'] = userData.stats.globalStats['sub'] || 0;
              userData.stats.globalStats['*'] = userData.stats.globalStats['mul'] || 0;
              userData.stats.globalStats['/'] = userData.stats.globalStats['div'] || 0;
            }
            localStorage.setItem('mathQuestRogueStats', JSON.stringify(userData.stats));
          } else {
            // Empty account
            localStorage.removeItem('mathQuestRogueStats');
          }
          if (userData.settings) {
            localStorage.setItem('mathQuestSettings', JSON.stringify(userData.settings));
          } else {
            localStorage.removeItem('mathQuestSettings');
          }
        }
        
        window.location.href = 'game.html';
      } else {
        alert("Incorrect Password!");
      }
    } else {
      alert("Account not found! Please Sign Up instead.");
    }
  });
}

function signup() {
  const username = elements.signupUsernameInput.value.trim();
  const password = elements.signupPasswordInput.value.trim();
  
  if (!username || !password) {
    alert("Please enter a username and password!");
    return;
  }
  
  if (typeof db === 'undefined') {
    alert("Firebase not connected.");
    return;
  }
  
  const cleanName = sanitizeUsername(username);
  if (!cleanName) return alert("Invalid Name!");
  
  const userRef = db.ref('users/' + cleanName);
  
  userRef.once('value', snap => {
    if (snap.exists()) {
      alert("Username is already taken! Please pick another one.");
    } else {
      userRef.set({
        originalName: username,
        password: password,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        stats: {} // Will be filled by saveState() in game
      }).then(() => {
        localStorage.removeItem('mathQuestRogueStats'); // Start fresh for new accounts
        localStorage.removeItem('mathQuestSettings');
        localStorage.setItem('mathQuestUser', JSON.stringify({ user: username, isLoggedIn: true }));
        window.location.href = 'game.html';
      }).catch(err => {
        alert("Error creating account: " + err.message);
      });
    }
  });
}

function saveSettingsModal() {
  state.volume = parseInt(elements.volumeSlider.value);
  const newLang = elements.languageSelect.value;
  if (newLang !== state.language) setLanguage(newLang);
  elements.settingsModal.classList.remove('show');
  saveSettings();
}

// Event listeners (only ones not defined in index.html inline script)
elements.guestButton.addEventListener('click', playAsGuest);
elements.loginSubmitButton.addEventListener('click', login);
elements.signupSubmitButton.addEventListener('click', signup);
elements.saveSettings.addEventListener('click', saveSettingsModal);

// Volume slider update
elements.volumeSlider.addEventListener('input', () => {
  elements.volumeValue.textContent = elements.volumeSlider.value + '%';
});

// Allow Enter key in forms
elements.usernameInput.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
elements.passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
elements.signupUsernameInput.addEventListener('keydown', e => { if (e.key === 'Enter') signup(); });
elements.signupPasswordInput.addEventListener('keydown', e => { if (e.key === 'Enter') signup(); });

// Initialize
loadSettings();
if (elements.volumeSlider) {
  elements.volumeSlider.value = state.volume;
  elements.volumeValue.textContent = state.volume + '%';
}
if (elements.languageSelect) {
  elements.languageSelect.value = state.language;
}
if (typeof applyTranslationsToDOM === 'function') {
  applyTranslationsToDOM(state.language);
}