// js/versus-ui.js

window.gameMode = 'normal';

const skinEmojis = {
  'rainbow': '🧍', 'peasant': '🧑‍🌾', 'adventurer': '🧝', 'stone': '👹',
  'knight': '🤺', 'mage': '🧙', 'glow': '🧚', 'ninja': '🥷', 'robot': '🤖',
  'gold': '🤴', 'diamond': '🫅', 'fire': '🦸', 'ice': '🧛', 'phantom': '👻',
  'alien': '👽', 'demon': '👿', 'angel': '👼', 'dragon': '🐉', 'void': '🧑‍🚀',
  'celestial': '🧞', 'god': '🦹'
};

let selectedSkin = 'rainbow';
let playerMMR = 10;
try {
  const statsStored = localStorage.getItem('mathQuestRogueStats');
  if (statsStored) {
    const parsed = JSON.parse(statsStored);
    selectedSkin = parsed.selectedSkin || 'rainbow';
    playerMMR = (parsed.globalStats && parsed.globalStats.playerMMR) ? parsed.globalStats.playerMMR : 10;
  }
} catch(e){}

let settings = { volume: 50, language: 'en' };
try {
  const stored = localStorage.getItem('mathQuestSettings');
  if (stored) settings = { ...settings, ...JSON.parse(stored) };
} catch(e){}

applyTranslationsToDOM(settings.language);

window.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

window.shuffleArray = function(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

window.showToast = function(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800 border-2 border-red-500 text-white px-6 py-3 rounded z-50 font-minecraft text-sm shadow-lg';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

const elements = {
  lobbyModal: document.getElementById('lobbyModal'),
  lobbySetup: document.getElementById('lobbySetup'),
  lobbyWaiting: document.getElementById('lobbyWaiting'),
  btnHost: document.getElementById('btnHost'),
  joinCodeInput: document.getElementById('joinCodeInput'),
  btnJoin: document.getElementById('btnJoin'),
  btnReturnHub: document.getElementById('btnReturnHub'),
  displayRoomCode: document.getElementById('displayRoomCode'),
  btnCancelHost: document.getElementById('btnCancelHost'),
  
  gameArena: document.getElementById('gameArenaWrapper'),
  battleArena: document.getElementById('battleArena'),
  
  enemySprite: document.getElementById('versusOpponentVisual'), // Mapped to enemySprite for animations.js
  opponentName: document.getElementById('opponentName'),
  lblOpponentMMR: document.getElementById('lblOpponentMMR'),
  
  playerName: document.getElementById('playerName'),
  opponentCombo: document.getElementById('opponentCombo'),
  barOpponentHp: document.getElementById('barOpponentHp'),
  lblOpponentHp: document.getElementById('lblOpponentHp'),
  opponentDamageText: document.getElementById('opponentDamageText'),
  
  playerSprite: document.getElementById('versusPlayerVisual'), // Mapped to playerSprite for animations.js
  lblHealth: document.getElementById('lblHealth'),
  lblPlayerMMR: document.getElementById('lblPlayerMMR'),
  lblCombo: document.getElementById('lblCombo'),
  barPlayerHp: document.getElementById('barPlayerHp'),
  barTimer: document.getElementById('barTimer'),
  lblQuestion: document.getElementById('lblQuestion'),
  answerGrid: document.getElementById('answerGrid'),
  
  endMatchModal: document.getElementById('endMatchModal'),
  endTitle: document.getElementById('endMatchTitle'),
  endMessage: document.getElementById('endMatchMessage'),
  rematchStatus: document.getElementById('rematchStatus'),
  btnPlayAgain: document.getElementById('btnPlayAgain'),
  btnExitMatch: document.getElementById('btnExitMatch'),
  
  btnForfeit: document.getElementById('btnForfeit')
};

window.addEventListener('DOMContentLoaded', () => {
  if (elements.playerSprite) elements.playerSprite.textContent = skinEmojis[selectedSkin] || '🧍';
  if (elements.lblPlayerMMR) elements.lblPlayerMMR.textContent = window.getRankFromMMR ? window.getRankFromMMR(playerMMR) : '🪨 Iron';
  if (elements.playerName) elements.playerName.textContent = user;
});

let user = 'Hero';
try {
  const userStored = localStorage.getItem('mathQuestUser');
  if (userStored) user = JSON.parse(userStored).user;
} catch(e){}

// UI Event Bindings
elements.btnCancelHost.onclick = () => {
  if (window.conn && window.conn.close) window.conn.close();
  elements.lobbySetup.classList.remove('hidden');
  elements.lobbyWaiting.classList.add('hidden');
};

elements.btnReturnHub.onclick = () => window.location.href = 'game.html';
elements.btnExitMatch.onclick = () => {
  if (window.conn && window.conn.close) window.conn.close();
  window.location.href = 'game.html';
};

if (elements.btnForfeit) {
  elements.btnForfeit.onclick = () => {
    if (!window.gameActive) return;
    window.conn.send({ type: 'forfeit' });
    window.endGame("You Forfeited", false);
  };
}

elements.btnPlayAgain.onclick = () => {
  window.myRematchReady = true;
  elements.btnPlayAgain.textContent = getTranslation('txt_rematch_wait', settings.language);
  elements.btnPlayAgain.disabled = true;
  elements.btnPlayAgain.classList.add('opacity-50');
  window.conn.send({ type: 'rematch' });
  
  if (window.opponentRematchReady) {
    window.startGame();
  } else {
    elements.rematchStatus.classList.add('hidden');
  }
};

window.addEventListener('beforeunload', function (e) {
  if (window.gameActive) {
    e.preventDefault();
    e.returnValue = '';
  }
});

document.addEventListener('click', () => { 
  if (typeof SFX !== 'undefined') SFX.playBGM('Versus Music.mp3'); 
}, { once: true });

function updateComboUI() {
  if (window.combo > 1) {
    elements.lblCombo.textContent = `${window.combo}x`;
    elements.lblCombo.classList.remove('hidden');
  } else {
    elements.lblCombo.classList.add('hidden');
  }
  if (window.broadcastUpdate) window.broadcastUpdate();
}

function showOpponentDamage(damage) {
  elements.opponentDamageText.textContent = `-${damage} HP!`;
  elements.opponentDamageText.style.opacity = '1';
  elements.opponentDamageText.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold font-minecraft drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-300 pointer-events-none z-10 text-yellow-300';
  elements.opponentDamageText.style.transform = 'translate(-50%, -80%) scale(1.2)';
  
  if (elements.enemySprite) {
    elements.enemySprite.classList.add('anim-hit-flash');
    setTimeout(() => elements.enemySprite.classList.remove('anim-hit-flash'), 500);
  }
  
  setTimeout(() => {
    elements.opponentDamageText.style.opacity = '0';
    elements.opponentDamageText.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 800);
}

function runCountdown(callback) {
  const overlay = document.getElementById('countdownOverlay');
  const text = document.getElementById('countdownText');
  if (!overlay || !text) {
    if (callback) callback();
    return;
  }
  
  overlay.classList.remove('hidden');
  window.gameActive = false;
  clearInterval(window.timerInterval);
  
  const countSteps = ['3', '2', '1', 'START!'];
  let idx = 0;
  
  function showNext() {
    if (idx >= countSteps.length) {
      overlay.classList.add('hidden');
      if (callback) callback();
      return;
    }
    
    const stepVal = countSteps[idx];
    text.textContent = stepVal;
    
    if (stepVal === 'START!') {
      text.className = 'text-7xl md:text-8xl font-minecraft text-yellow-400 drop-shadow-[0_6px_0_rgba(0,0,0,1)] scale-50 opacity-0 transition-all duration-300';
      if (typeof SFX !== 'undefined') SFX.countdownStart();
    } else {
      text.className = 'text-7xl md:text-8xl font-minecraft text-pink-500 drop-shadow-[0_6px_0_rgba(0,0,0,1)] scale-50 opacity-0 transition-all duration-300';
      if (typeof SFX !== 'undefined') SFX.countdownBeep(stepVal);
    }
    
    void text.offsetWidth;
    text.classList.remove('scale-50', 'opacity-0');
    text.classList.add('anim-countdown-pop');
    
    idx++;
    setTimeout(showNext, 800);
  }
  
  showNext();
}
