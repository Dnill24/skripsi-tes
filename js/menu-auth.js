const badWords = ['fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'bastard', 'whore', 'slut', 'fag', 'nigger', 'crap', 'anjing', 'babi', 'bangsat', 'kontol', 'memek', 'ngentot', 'peler', 'perek', 'tai'];

function isProfane(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return badWords.some(word => lower.includes(word));
}

// Validates username for Firebase NoSQL keys
function sanitizeUsername(name) {
  return name.trim().replace(/[.#$[\]\\s/]/g, '_').toLowerCase();
}

function playAsGuest() {
  localStorage.setItem('mathQuestUser', JSON.stringify({ user: 'Guest', isLoggedIn: true }));
  localStorage.removeItem('mathQuestRogueStats'); // Start fresh
  localStorage.removeItem('mathQuestTutorialHub');
  localStorage.removeItem('mathQuestTutorialPlay');
  localStorage.removeItem('mathQuestTutorialHub_Guest');
  localStorage.removeItem('mathQuestTutorialPlay_Guest');
  sessionStorage.removeItem('mathQuestGradeSelectedSession');
  window.location.href = 'game.html';
}

function login() {
  const username = elements.usernameInput.value.trim();
  const password = elements.passwordInput.value.trim();
  
  if (!username) {
    showToast(getTranslation('pickHeroName', state.language) || 'Please pick a hero name to start!');
    return;
  }
  
  if (isProfane(username) || isProfane(password)) {
    let msg = getTranslation('txt_profane', state.language);
    if (msg === 'txt_profane') msg = 'Profanity is not allowed in names or passwords.';
    showToast(msg);
    return;
  }
  
  if (typeof db === 'undefined') {
    showToast("Firebase not connected. Logging in offline.");
    localStorage.setItem('mathQuestUser', JSON.stringify({ user: username, isLoggedIn: true }));
    sessionStorage.removeItem('mathQuestGradeSelectedSession');
    window.location.href = 'game.html';
    return;
  }
  
  const cleanName = sanitizeUsername(username);
  if (!cleanName) return showToast("Invalid Name!");
  
  const userRef = db.ref('users/' + cleanName);
  
  userRef.once('value', snap => {
    if (snap.exists()) {
      // Existing user: check password
      const userData = snap.val();
      const hashedInput = typeof CryptoJS !== 'undefined' ? CryptoJS.SHA256(password).toString() : password;
      
      let passwordMatched = false;
      if (userData.password === hashedInput) {
        passwordMatched = true;
      } else if (userData.password === password) {
        passwordMatched = true;
        // Upgrade legacy plaintext password to hash silently
        if (typeof CryptoJS !== 'undefined') {
          userRef.update({ password: hashedInput });
        }
      }
      
      if (passwordMatched) {
        // Success
        localStorage.setItem('mathQuestUser', JSON.stringify({ user: username, isLoggedIn: true }));
        
        if (passwordMatched) {
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
            localStorage.removeItem('mathQuestRogueStats');
          }
        }
        
        sessionStorage.removeItem('mathQuestGradeSelectedSession');
        window.location.href = 'game.html';
      } else {
        showToast("Incorrect Password!");
      }
    } else {
      showToast("Account not found! Please Sign Up instead.");
    }
  });
}

function signup() {
  const username = elements.signupUsernameInput.value.trim();
  const password = elements.signupPasswordInput.value.trim();
  const confirmPassword = elements.signupConfirmPasswordInput ? elements.signupConfirmPasswordInput.value.trim() : '';
  
  if (!username || !password) {
    let msg = getTranslation('txt_missing_fields', state.language);
    if (msg === 'txt_missing_fields') msg = 'Please enter a username and password!';
    showToast(msg);
    return;
  }
  
  if (password !== confirmPassword) {
    showToast("Passwords do not match!");
    return;
  }
  
  if (isProfane(username) || isProfane(password)) {
    let msg = getTranslation('txt_profane', state.language);
    if (msg === 'txt_profane') msg = 'Profanity is not allowed in names or passwords.';
    showToast(msg);
    return;
  }
  
  if (typeof db === 'undefined') {
    showToast("Firebase not connected.");
    return;
  }
  
  const cleanName = sanitizeUsername(username);
  if (!cleanName) return showToast("Invalid Name!");
  
  const userRef = db.ref('users/' + cleanName);
  
  userRef.once('value', snap => {
    if (snap.exists()) {
      showToast("Username is already taken! Please pick another one.");
    } else {
      const hashedPassword = typeof CryptoJS !== 'undefined' ? CryptoJS.SHA256(password).toString() : password;
      userRef.set({
        originalName: username,
        password: hashedPassword,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        stats: {} // Will be filled by saveState() in game
      }).then(() => {
        localStorage.removeItem('mathQuestRogueStats'); // Start fresh for new accounts
        localStorage.removeItem('mathQuestTutorialHub_' + username);
        localStorage.removeItem('mathQuestTutorialPlay_' + username);
        localStorage.removeItem('mathQuestGradeSelected_' + username);
        localStorage.setItem('mathQuestUser', JSON.stringify({ user: username, isLoggedIn: true }));
        sessionStorage.removeItem('mathQuestGradeSelectedSession');
        window.location.href = 'game.html';
      }).catch(err => {
        showToast("Error creating account: " + err.message);
      });
    }
  });
}

// Event listeners
elements.guestButton.addEventListener('click', playAsGuest);
elements.loginSubmitButton.addEventListener('click', login);
elements.signupSubmitButton.addEventListener('click', signup);

// Allow Enter key in forms
elements.usernameInput.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
elements.passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
elements.signupUsernameInput.addEventListener('keydown', e => { if (e.key === 'Enter') signup(); });
elements.signupPasswordInput.addEventListener('keydown', e => { if (e.key === 'Enter') signup(); });
if (elements.signupConfirmPasswordInput) {
  elements.signupConfirmPasswordInput.addEventListener('keydown', e => { if (e.key === 'Enter') signup(); });
}
