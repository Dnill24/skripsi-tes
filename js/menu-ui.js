const state = {
  language: 'id',
  sfxVolume: 70,
  musicVolume: 50
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
  signupConfirmPasswordInput: document.getElementById('signupConfirmPasswordInput'),
  signupSubmitButton: document.getElementById('signupSubmitButton'),
  cancelSignup: document.getElementById('cancelSignup'),
  
  settingsModal: document.getElementById('settingsModal'),
  sfxVolumeSlider: document.getElementById('sfxVolumeSlider'),
  sfxVolumeValue: document.getElementById('sfxVolumeValue'),
  musicVolumeSlider: document.getElementById('musicVolumeSlider'),
  musicVolumeValue: document.getElementById('musicVolumeValue'),
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
    sfxVolume: state.sfxVolume,
    musicVolume: state.musicVolume
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

function saveSettingsModal() {
  state.sfxVolume = parseInt(elements.sfxVolumeSlider.value);
  state.musicVolume = parseInt(elements.musicVolumeSlider.value);
  const newLang = elements.languageSelect.value;
  if (newLang !== state.language) setLanguage(newLang);
  elements.settingsModal.classList.remove('show');
  saveSettings();
}

function togglePassword(inputId, btnId) {
  const inp = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!inp || !btn) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type = 'password';
    btn.textContent = '👁️';
  }
}

document.getElementById('toggleLoginPassword').addEventListener('click', () => togglePassword('passwordInput', 'toggleLoginPassword'));
document.getElementById('toggleSignupPassword').addEventListener('click', () => togglePassword('signupPasswordInput', 'toggleSignupPassword'));
document.getElementById('toggleSignupConfirmPassword').addEventListener('click', () => togglePassword('signupConfirmPasswordInput', 'toggleSignupConfirmPassword'));

elements.saveSettings.addEventListener('click', saveSettingsModal);

elements.musicVolumeSlider.addEventListener('input', () => {
  elements.musicVolumeValue.textContent = elements.musicVolumeSlider.value + '%';
  state.musicVolume = parseInt(elements.musicVolumeSlider.value);
  saveSettings();
  if (typeof SFX !== 'undefined') SFX.updateBGMVolume();
});

document.addEventListener('click', () => {
  if (typeof SFX !== 'undefined') SFX.playBGM('Menu Music.mp3');
}, { once: true });

elements.sfxVolumeSlider.addEventListener('input', () => {
  elements.sfxVolumeValue.textContent = elements.sfxVolumeSlider.value + '%';
  if (typeof SFX !== 'undefined') {
    state.sfxVolume = parseInt(elements.sfxVolumeSlider.value);
    saveSettings(); 
    SFX.btnClick();
  }
});

// Initialize UI
loadSettings();
if (elements.sfxVolumeSlider) {
  elements.sfxVolumeSlider.value = state.sfxVolume;
  elements.sfxVolumeValue.textContent = state.sfxVolume + '%';
  elements.musicVolumeSlider.value = state.musicVolume;
  elements.musicVolumeValue.textContent = state.musicVolume + '%';
}
if (elements.languageSelect) {
  elements.languageSelect.value = state.language;
}
if (typeof applyTranslationsToDOM === 'function') {
  applyTranslationsToDOM(state.language);
}
