const skinEmojis = {
  'rainbow': '🧍', 'peasant': '👦', 'adventurer': '🎒', 'stone': '🗿',
  'knight': '🛡️', 'mage': '🧙', 'glow': '⚡', 'ninja': '🥷', 'robot': '🤖',
  'gold': '👑', 'diamond': '💎', 'fire': '🔥', 'ice': '❄️', 'phantom': '👻',
  'alien': '👽', 'demon': '👹', 'angel': '👼', 'dragon': '🐉', 'void': '🌌',
  'celestial': '🌟', 'god': '♾️'
};
let selectedSkin = 'rainbow';
try {
  const statsStored = localStorage.getItem('mathQuestRogueStats');
  if (statsStored) {
    const parsed = JSON.parse(statsStored);
    selectedSkin = parsed.selectedSkin || 'rainbow';
  }
} catch(e){}

window.addEventListener('DOMContentLoaded', () => {
  const playerVisual = document.getElementById('versusPlayerVisual');
  if (playerVisual) playerVisual.textContent = skinEmojis[selectedSkin] || '🧍';
});

let settings = { volume: 50, language: 'en' };
try {
  const stored = localStorage.getItem('mathQuestSettings');
  if (stored) settings = { ...settings, ...JSON.parse(stored) };
} catch(e){}

// Apply translations right away
applyTranslationsToDOM(settings.language);

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
  
  gameArena: document.getElementById('gameArena'),
  opponentSprite: document.getElementById('opponentSprite'),
  opponentName: document.getElementById('opponentName'),
  opponentCombo: document.getElementById('opponentCombo'),
  barOpponentHp: document.getElementById('barOpponentHp'),
  lblOpponentHp: document.getElementById('lblOpponentHp'),
  opponentDamageText: document.getElementById('opponentDamageText'),
  
  lblHealth: document.getElementById('lblHealth'),
  lblCombo: document.getElementById('lblCombo'),
  barPlayerHp: document.getElementById('barPlayerHp'),
  combatText: document.getElementById('combatText'),
  barTimer: document.getElementById('barTimer'),
  lblQuestion: document.getElementById('lblQuestion'),
  answerGrid: document.getElementById('answerGrid'),
  
  endMatchModal: document.getElementById('endMatchModal'),
  endTitle: document.getElementById('endMatchTitle'),
  endMessage: document.getElementById('endMatchMessage'),
  rematchStatus: document.getElementById('rematchStatus'),
  btnPlayAgain: document.getElementById('btnPlayAgain'),
  btnExitMatch: document.getElementById('btnExitMatch')
};

let user = 'Hero';
try {
  const userStored = localStorage.getItem('mathQuestUser');
  if (userStored) user = JSON.parse(userStored).user;
} catch(e){}

let myRole = '';
let roomCode = '';
let roomRef = null;
let myEventsRef = null;
let oppEventsRef = null;

let conn = {
  send: (data) => {
    if (myEventsRef) myEventsRef.push(data);
  },
  close: () => {
    if (roomRef && myRole === 'host') roomRef.remove();
  }
};

let playerHP = 100;
let opponentHP = 100;
let combo = 0;
let opponentCombo = 0;

let currentQuestion = null;
let timerInterval = null;
const MAX_TIME = 15;
let timeLeft = MAX_TIME;
let gameActive = false;
let myRematchReady = false;
let opponentRematchReady = false;

// Firebase RTDB Logic
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

elements.btnHost.onclick = () => {
  if (typeof db === 'undefined') return alert("Firebase not connected!");
  roomCode = generateRoomCode();
  myRole = 'host';
  roomRef = db.ref('rooms/' + roomCode);
  myEventsRef = db.ref('rooms/' + roomCode + '/hostEvents');
  oppEventsRef = db.ref('rooms/' + roomCode + '/clientEvents');
  
  roomRef.set({ status: 'waiting', hostConnected: true });
  
  elements.lobbySetup.classList.add('hidden');
  elements.lobbyWaiting.classList.remove('hidden');
  elements.displayRoomCode.textContent = roomCode;
  
  roomRef.on('value', snap => {
    if (!snap.exists()) return;
    const data = snap.val();
    if (data.clientConnected && data.status === 'playing') {
      roomRef.off('value'); // Stop listening to root changes here
      setupConnection();
    }
  });
};

elements.btnJoin.onclick = () => {
  if (typeof db === 'undefined') return alert("Firebase not connected!");
  const code = elements.joinCodeInput.value.trim().toUpperCase();
  if (!code) return alert("Enter a room code!");
  
  roomCode = code;
  myRole = 'client';
  roomRef = db.ref('rooms/' + roomCode);
  myEventsRef = db.ref('rooms/' + roomCode + '/clientEvents');
  oppEventsRef = db.ref('rooms/' + roomCode + '/hostEvents');
  
  roomRef.once('value', snap => {
    if (snap.exists() && snap.val().status === 'waiting') {
      roomRef.update({ clientConnected: true, status: 'playing' });
      setupConnection();
    } else {
      alert("Room not found or already full!");
    }
  });
};

elements.btnCancelHost.onclick = resetLobby;
elements.btnReturnHub.onclick = () => window.location.href = 'game.html';
elements.btnExitMatch.onclick = () => {
  if (conn) conn.close();
  window.location.href = 'game.html';
};
function resetLobby() {
  if (roomRef && myRole === 'host') roomRef.remove();
  elements.lobbySetup.classList.remove('hidden');
  elements.lobbyWaiting.classList.add('hidden');
}

function setupConnection() {
  setTimeout(() => {
    conn.send({ type: 'handshake', name: user, skin: skinEmojis[selectedSkin] || '🤖' });
    
    elements.lobbyModal.classList.remove('show');
    elements.gameArena.classList.remove('hidden');
    elements.gameArena.classList.add('flex');
    
    startGame();
  }, 500);
  
  oppEventsRef.on('child_added', snap => {
    handleNetworkData(snap.val());
  });
  
  roomRef.on('value', snap => {
    if (!snap.exists()) {
      if (gameActive) endGame("Opponent Disconnected", false);
    }
  });
}

function triggerPlayerAttack() {
  const sprite = document.getElementById('versusPlayerVisual');
  if (!sprite) return;
  sprite.classList.remove('anim-player-attack');
  void sprite.offsetWidth;
  sprite.classList.add('anim-player-attack');
}

function triggerEnemyAttack() {
  const sprite = document.getElementById('versusOpponentVisual');
  if (!sprite) return;
  sprite.classList.remove('anim-enemy-attack');
  void sprite.offsetWidth;
  sprite.classList.add('anim-enemy-attack');
}

function handleNetworkData(data) {
  if (data.type === 'handshake') {
    elements.opponentName.textContent = data.name;
    const oppSkin = data.skin || '🧍';
    elements.opponentSprite.textContent = oppSkin;
    const oppVisual = document.getElementById('versusOpponentVisual');
    if (oppVisual) oppVisual.textContent = oppSkin;
  } else if (data.type === 'update') {
    opponentHP = data.hp;
    opponentCombo = data.combo;
    elements.lblOpponentHp.textContent = `${opponentHP}/100`;
    elements.barOpponentHp.style.width = `${Math.max(0, opponentHP)}%`;
    
    if (opponentCombo > 1) {
      elements.opponentCombo.textContent = `${opponentCombo}x`;
      elements.opponentCombo.classList.remove('hidden');
    } else {
      elements.opponentCombo.classList.add('hidden');
    }
  } else if (data.type === 'attack') {
    triggerEnemyAttack();
    setTimeout(() => {
      takeDamage(data.damage);
    }, 250);
  } else if (data.type === 'gameover') {
    endGame(getTranslation('txt_you_win', settings.language), true);
  } else if (data.type === 'rematch') {
    opponentRematchReady = true;
    if (myRematchReady) {
      startGame();
    } else {
      elements.rematchStatus.textContent = getTranslation('txt_opponent_rematch', settings.language);
      elements.rematchStatus.classList.remove('hidden');
    }
  }
}

function broadcastUpdate() {
  if (conn && conn.open) {
    conn.send({ type: 'update', hp: playerHP, combo: combo });
  }
}

function startGame() {
  playerHP = 100;
  opponentHP = 100;
  combo = 0;
  opponentCombo = 0;
  gameActive = true;
  
  elements.lblHealth.textContent = '100/100';
  elements.barPlayerHp.style.width = '100%';
  elements.lblOpponentHp.textContent = '100/100';
  elements.barOpponentHp.style.width = '100%';
  elements.lblCombo.classList.add('hidden');
  elements.opponentCombo.classList.add('hidden');
  elements.endMatchModal.classList.remove('show');
  
  myRematchReady = false;
  opponentRematchReady = false;
  elements.btnPlayAgain.textContent = getTranslation('btn_rematch', settings.language);
  elements.btnPlayAgain.disabled = false;
  elements.btnPlayAgain.classList.remove('opacity-50');
  elements.rematchStatus.classList.add('hidden');
  
  broadcastUpdate();
  elements.barTimer.style.width = '100%';
  runCountdown(() => {
    gameActive = true;
    nextQuestion();
  });
}

function showCombatText(text, colorClass) {
  elements.combatText.textContent = text;
  elements.combatText.className = `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold font-minecraft drop-shadow-[0_4px_4px_rgba(0,0,0,1)] transition-all duration-300 pointer-events-none z-10 ${colorClass}`;
  elements.combatText.style.opacity = '1';
  elements.combatText.style.transform = 'translate(-50%, -80%) scale(1.2)';
  
  setTimeout(() => {
    elements.combatText.style.opacity = '0';
    elements.combatText.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 800);
}

function showOpponentDamage(damage) {
  elements.opponentDamageText.textContent = `-${damage} HP!`;
  elements.opponentDamageText.style.opacity = '1';
  elements.opponentDamageText.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold font-minecraft drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-300 pointer-events-none z-10 text-yellow-300';
  elements.opponentDamageText.style.transform = 'translate(-50%, -80%) scale(1.2)';
  
  const sprite = document.getElementById('versusOpponentVisual');
  if (sprite) {
    sprite.classList.add('anim-hit-flash');
    setTimeout(() => sprite.classList.remove('anim-hit-flash'), 500);
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
  gameActive = false;
  clearInterval(timerInterval);
  
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
    } else {
      text.className = 'text-7xl md:text-8xl font-minecraft text-pink-500 drop-shadow-[0_6px_0_rgba(0,0,0,1)] scale-50 opacity-0 transition-all duration-300';
    }
    
    void text.offsetWidth;
    text.classList.remove('scale-50', 'opacity-0');
    text.classList.add('anim-countdown-pop');
    
    idx++;
    setTimeout(showNext, 800);
  }
  
  showNext();
}

function evaluateExpressionSteps(exprString) {
  let tokens = exprString.split(' ');
  let steps = [ [...tokens] ];
  
  while (tokens.length > 1) {
    let opIndex = -1;
    for (let i = 1; i < tokens.length; i += 2) {
      if (tokens[i] === '*' || tokens[i] === '/') {
        opIndex = i;
        break;
      }
    }
    if (opIndex === -1) {
      for (let i = 1; i < tokens.length; i += 2) {
        if (tokens[i] === '+' || tokens[i] === '-') {
          opIndex = i;
          break;
        }
      }
    }
    
    if (opIndex !== -1) {
      let a = parseInt(tokens[opIndex - 1]);
      let b = parseInt(tokens[opIndex + 1]);
      let op = tokens[opIndex];
      let res = 0;
      if (op === '+') res = a + b;
      if (op === '-') res = a - b;
      if (op === '*') res = a * b;
      if (op === '/') res = Math.floor(a / b);
      
      tokens.splice(opIndex - 1, 3, res.toString());
      steps.push([ ...tokens ]);
    } else {
      break;
    }
  }
  return steps;
}

async function playCalculationAnimation(exprString) {
  const container = document.getElementById('calcAnimContainer');
  const content = document.getElementById('calcAnimContent');
  if (!container || !content) return;
  
  container.classList.remove('hidden');
  void container.offsetWidth;
  
  let steps = evaluateExpressionSteps(exprString);
  content.innerHTML = '';
  let tokenElements = [];
  
  steps[0].forEach((token) => {
    let span = document.createElement('span');
    span.className = 'calc-token text-yellow-400 mx-2';
    span.textContent = token.replaceAll('*', '×').replaceAll('/', '÷');
    content.appendChild(span);
    tokenElements.push(span);
  });
  
  const wait = ms => new Promise(res => setTimeout(res, ms));
  await wait(500);
  
  for (let s = 1; s < steps.length; s++) {
    let diffIndex = -1;
    for (let i = 0; i < steps[s-1].length; i++) {
      if (steps[s-1][i] !== steps[s][i]) {
        diffIndex = i;
        break;
      }
    }
    
    let opIndex = diffIndex + 1;
    tokenElements[opIndex - 1].classList.add('anim-scale-up-glow');
    tokenElements[opIndex].classList.add('anim-scale-up-glow');
    tokenElements[opIndex + 1].classList.add('anim-scale-up-glow');
    
    await wait(600);
    
    let mergedVal = steps[s][diffIndex];
    tokenElements[opIndex - 1].textContent = mergedVal;
    tokenElements[opIndex - 1].className = 'calc-token text-emerald-400 mx-2 anim-merge-pop';
    
    let w1 = tokenElements[opIndex].offsetWidth;
    let w2 = tokenElements[opIndex + 1].offsetWidth;
    tokenElements[opIndex].style.width = w1 + 'px';
    tokenElements[opIndex + 1].style.width = w2 + 'px';
    void tokenElements[opIndex].offsetWidth;

    tokenElements[opIndex].style.width = '0px';
    tokenElements[opIndex].style.margin = '0px';
    tokenElements[opIndex].style.opacity = '0';
    tokenElements[opIndex + 1].style.width = '0px';
    tokenElements[opIndex + 1].style.margin = '0px';
    tokenElements[opIndex + 1].style.opacity = '0';
    
    await wait(350);
    
    content.innerHTML = '';
    tokenElements = [];
    steps[s].forEach((token) => {
      let span = document.createElement('span');
      span.className = 'calc-token text-yellow-400 mx-2';
      span.textContent = token.replaceAll('*', '×').replaceAll('/', '÷');
      content.appendChild(span);
      tokenElements.push(span);
    });
    
    await wait(300);
  }
  
  tokenElements[0].classList.add('anim-scale-up-glow', 'text-emerald-400');
  tokenElements[0].classList.remove('text-yellow-400');
  await wait(800);
  
  container.classList.add('hidden');
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createQuestion() {
  const ops = ['+', '-', '*'];
  const op = ops[getRandomInt(0, ops.length - 1)];
  
  let a, b, answer;
  if (op === '+') {
    a = getRandomInt(10, 50);
    b = getRandomInt(10, 50);
    answer = a + b;
  } else if (op === '-') {
    a = getRandomInt(20, 99);
    b = getRandomInt(5, a - 1);
    answer = a - b;
  } else if (op === '*') {
    a = getRandomInt(2, 12);
    b = getRandomInt(2, 12);
    answer = a * b;
  }
  
  let wrongAnswers = new Set();
  while(wrongAnswers.size < 3) {
    let wrong = answer + getRandomInt(-10, 10);
    if(wrong !== answer && wrong > 0) wrongAnswers.add(wrong);
  }
  
  let options = Array.from(wrongAnswers);
  options.push(answer);
  options.sort(() => Math.random() - 0.5);
  
  return { q: `${a} ${op} ${b} = ?`, answer: answer, options: options };
}

function renderQuestion() {
  elements.lblQuestion.textContent = currentQuestion.q.replaceAll('*', '×').replaceAll('/', '÷');
  elements.answerGrid.innerHTML = '';
  
  currentQuestion.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'math-answer-btn';
    btn.style.cssText = `
      background: #8d6e63;
      border: 4px solid #4e342e;
      color: #fff;
      box-shadow: inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 4px 0 #4e342e;
      cursor: pointer;
      width: 100%;
      min-height: 54px;
      max-height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1.2;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.8);
      position: relative;
    `;
    const grain = document.createElement('div');
    grain.style.cssText = 'position:absolute;inset:0;background:repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.08) 4px, rgba(0,0,0,0.08) 8px);pointer-events:none;';
    const label = document.createElement('span');
    label.style.position = 'relative';
    label.textContent = opt;
    btn.appendChild(grain);
    btn.appendChild(label);
    btn.onmouseover = () => {
      btn.style.background = '#a1887f';
      btn.style.transform = 'translateY(2px)';
      btn.style.boxShadow = 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 2px 0 #4e342e';
    };
    btn.onmouseout = () => {
      btn.style.background = '#8d6e63';
      btn.style.transform = '';
      btn.style.boxShadow = 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 4px 0 #4e342e';
    };
    btn.onmousedown = () => { btn.style.transform = 'translateY(4px)'; btn.style.boxShadow = 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 0 0 #4e342e'; };
    btn.onclick = () => handleAnswer(opt);
    elements.answerGrid.appendChild(btn);
  });
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = MAX_TIME;
  
  timerInterval = setInterval(() => {
    if (!gameActive) return clearInterval(timerInterval);
    timeLeft -= 0.1;
    const percentage = (timeLeft / MAX_TIME) * 100;
    elements.barTimer.style.width = `${percentage}%`;
    
    if (percentage <= 20) elements.barTimer.className = 'h-full bg-red-500 w-full transition-all duration-100 linear';
    else elements.barTimer.className = 'h-full bg-cyan-400 w-full transition-all duration-100 linear';
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      combo = 0;
      updateComboUI();
      takeDamage(10);
      showCombatText("TIMEOUT!", "text-red-500");
      setTimeout(nextQuestion, 1000);
    }
  }, 100);
}

function nextQuestion() {
  if (!gameActive) return;
  currentQuestion = createQuestion();
  renderQuestion();
  startTimer();
}

function updateComboUI() {
  if (combo > 1) {
    elements.lblCombo.textContent = `${combo}x`;
    elements.lblCombo.classList.remove('hidden');
  } else {
    elements.lblCombo.classList.add('hidden');
  }
  broadcastUpdate();
}

function takeDamage(amt) {
  if (!gameActive) return;
  playerHP = Math.max(0, playerHP - amt);
  elements.lblHealth.textContent = `${playerHP}/100`;
  elements.barPlayerHp.style.width = `${playerHP}%`;
  
  const sprite = document.getElementById('versusPlayerVisual');
  if (sprite) {
    sprite.classList.add('anim-hit-flash');
    setTimeout(() => sprite.classList.remove('anim-hit-flash'), 500);
  }
  
  broadcastUpdate();
  
  const arena = document.getElementById('versusArena');
  if (arena) {
    arena.classList.add('shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]', 'anim-arena-shake');
    setTimeout(() => arena.classList.remove('shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]', 'anim-arena-shake'), 300);
  }
  
  if (playerHP <= 0) {
    conn.send({ type: 'gameover' });
    endGame(getTranslation('txt_you_lose', settings.language), false);
  }
}

async function handleAnswer(selected) {
  if (!gameActive) return;
  clearInterval(timerInterval);
  
  Array.from(elements.answerGrid.children).forEach(b => b.disabled = true);
  
  const correct = selected === currentQuestion.answer;
  
  Array.from(elements.answerGrid.children).forEach(b => {
    const btnVal = parseInt(b.querySelector('span') ? b.querySelector('span').textContent : b.textContent);
    if (btnVal === currentQuestion.answer) {
      b.style.background = '#388e3c';
      b.style.borderColor = '#1b5e20';
      b.style.boxShadow = 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 4px 0 #1b5e20';
      b.style.color = '#fff';
    } else if (!correct && btnVal === selected) {
      b.style.background = '#d32f2f';
      b.style.borderColor = '#880e4f';
      b.style.boxShadow = 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 4px 0 #880e4f';
      b.style.color = '#fff';
    }
  });
  
  await playCalculationAnimation(currentQuestion.q.replace(' = ?', ''));
  
  if (correct) {
    combo++;
    updateComboUI();
    
    spawnCelebrationParticles('versusPlayerContainer');
    
    playerHP = Math.min(100, playerHP + 5);
    elements.lblHealth.textContent = `${playerHP}/100`;
    elements.barPlayerHp.style.width = `${playerHP}%`;
    
    let dmg = 10 + Math.floor(combo * 2);
    conn.send({ type: 'attack', damage: dmg });
    
    triggerPlayerAttack();
    
    setTimeout(() => {
      showCombatText("CORRECT!", "text-emerald-400");
      showOpponentDamage(dmg);
    }, 250);
    
    broadcastUpdate();
    setTimeout(nextQuestion, 800);
  } else {
    combo = 0;
    updateComboUI();
    showCombatText("MISS!", "text-red-400");
    takeDamage(10);
    setTimeout(nextQuestion, 1000);
  }
}

function endGame(title, isWin) {
  gameActive = false;
  clearInterval(timerInterval);
  elements.endMatchModal.classList.add('show');
  elements.endTitle.textContent = title;
  elements.endTitle.className = isWin ? 'text-4xl font-minecraft mb-6 drop-shadow-[3px_3px_0_rgba(0,0,0,1)] text-emerald-400' : 'text-4xl font-minecraft mb-6 drop-shadow-[3px_3px_0_rgba(0,0,0,1)] text-red-500';
  elements.endMessage.textContent = isWin ? 'You crushed your opponent!' : 'You were defeated.';
}

function spawnCelebrationParticles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const particles = ['⭐', '✨', '🎈', '🎉', '🌈'];
  const numParticles = 8;
  
  for (let i = 0; i < numParticles; i++) {
    const pEl = document.createElement('span');
    pEl.className = 'celebration-particle';
    pEl.textContent = particles[Math.floor(Math.random() * particles.length)];
    
    const xDrift = (Math.random() - 0.5) * 100;
    const yDrift = -40 - Math.random() * 60;
    
    pEl.style.setProperty('--x-drift', `${xDrift}px`);
    pEl.style.setProperty('--y-drift', `${yDrift}px`);
    
    pEl.style.left = '50%';
    pEl.style.top = '20%';
    
    container.appendChild(pEl);
    
    setTimeout(() => pEl.remove(), 1200);
  }
}

elements.btnPlayAgain.onclick = () => {
  myRematchReady = true;
  elements.btnPlayAgain.textContent = getTranslation('txt_rematch_wait', settings.language);
  elements.btnPlayAgain.disabled = true;
  elements.btnPlayAgain.classList.add('opacity-50');
  conn.send({ type: 'rematch' });
  
  if (opponentRematchReady) {
    startGame();
  } else {
    elements.rematchStatus.classList.add('hidden');
  }
};
