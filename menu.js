const state = {
  language: 'id',
  volume: 50
};

const translations = {
  en: {
    play: 'Play',
    playAsGuest: 'Play as Guest',
    login: 'Login',
    settings: 'Settings',
    volume: 'Volume',
    language: 'Language',
    save: 'Save',
    cancel: 'Cancel',
    startYourQuest: 'Start Your Quest',
    joinTheTeam: 'Join the team!',
    heroName: 'Hero name',
    secretCode: 'Secret code',
    startPlaying: 'Start Playing',
    pickHeroName: 'Pick a hero name to start your adventure.',
    gameTitle: 'Math Quest Adventure',
    exit: 'Exit'
  },
  id: {
    play: 'Main',
    playAsGuest: 'Main sebagai Tamu',
    login: 'Masuk',
    settings: 'Pengaturan',
    volume: 'Volume',
    language: 'Bahasa',
    save: 'Simpan',
    cancel: 'Batal',
    startYourQuest: 'Mulai Petualanganmu',
    joinTheTeam: 'Bergabunglah dengan tim!',
    heroName: 'Nama Pahlawan',
    secretCode: 'Kode Rahasia',
    startPlaying: 'Mulai Bermain',
    pickHeroName: 'Pilih nama pahlawan untuk memulai petualanganmu.',
    gameTitle: 'Math Quest Adventure',
    exit: 'Keluar'
  }
};

const elements = {
  playButton: document.getElementById('playButton'),
  playOptions: document.getElementById('playOptions'),
  guestButton: document.getElementById('guestButton'),
  loginButton: document.getElementById('loginButton'),
  exitButton: document.getElementById('exitButton'),
  settingsButton: document.getElementById('settingsButton'),
  loginModal: document.getElementById('loginModal'),
  usernameInput: document.getElementById('usernameInput'),
  passwordInput: document.getElementById('passwordInput'),
  loginSubmitButton: document.getElementById('loginSubmitButton'),
  cancelLogin: document.getElementById('cancelLogin'),
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
  updateTranslations();
  saveSettings();
}

function updateTranslations() {
  const t = translations[state.language];
  elements.playButton.textContent = t.play;
  elements.guestButton.textContent = t.playAsGuest;
  elements.loginButton.textContent = t.login;
  elements.settingsButton.textContent = t.settings;
  elements.saveSettings.textContent = t.save;
  elements.closeSettings.textContent = t.cancel;
  elements.loginSubmitButton.textContent = t.startPlaying;
  elements.cancelLogin.textContent = t.cancel;
  elements.exitButton.textContent = t.exit;
}

// Menu functions
function showPlayOptions() {
  elements.playButton.classList.add('hidden');
  elements.settingsButton.classList.add('hidden');
  elements.playOptions.classList.remove('hidden');
}

function hidePlayOptions() {
  elements.playOptions.classList.add('hidden');
  elements.playButton.classList.remove('hidden');
  elements.settingsButton.classList.remove('hidden');
}

function playAsGuest() {
  // Store guest user data
  localStorage.setItem('mathQuestUser', JSON.stringify({
    user: 'Guest',
    isLoggedIn: true
  }));
  // Navigate to game
  window.location.href = 'game.html';
}

function showLogin() {
  elements.loginModal.classList.remove('hidden');
  hidePlayOptions();
}

function hideLogin() {
  elements.loginModal.classList.add('hidden');
}

function login() {
  const username = elements.usernameInput.value.trim();
  if (!username) {
    alert(translations[state.language].pickHeroName);
    return;
  }
  // Store user data
  localStorage.setItem('mathQuestUser', JSON.stringify({
    user: username,
    isLoggedIn: true
  }));
  // Navigate to game
  window.location.href = 'game.html';
}

function showSettings() {
  elements.volumeSlider.value = state.volume;
  elements.volumeValue.textContent = state.volume + '%';
  elements.languageSelect.value = state.language;
  elements.settingsModal.classList.remove('hidden');
  hidePlayOptions();
}

function saveSettingsModal() {
  state.volume = parseInt(elements.volumeSlider.value);
  const newLang = elements.languageSelect.value;
  if (newLang !== state.language) {
    setLanguage(newLang);
  }
  elements.settingsModal.classList.add('hidden');
  saveSettings();
}

function closeSettingsModal() {
  elements.settingsModal.classList.add('hidden');
}

// Event listeners
elements.playButton.addEventListener('click', showPlayOptions);
elements.guestButton.addEventListener('click', playAsGuest);
elements.loginButton.addEventListener('click', showLogin);
elements.exitButton.addEventListener('click', hidePlayOptions);
elements.settingsButton.addEventListener('click', showSettings);
elements.loginSubmitButton.addEventListener('click', login);
elements.cancelLogin.addEventListener('click', hideLogin);
elements.saveSettings.addEventListener('click', saveSettingsModal);
elements.closeSettings.addEventListener('click', closeSettingsModal);

// Volume slider update
elements.volumeSlider.addEventListener('input', () => {
  elements.volumeValue.textContent = elements.volumeSlider.value + '%';
});

// Initialize
loadSettings();
setLanguage(state.language);