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
  
  endGameModal: document.getElementById('endGameModal'),
  endTitle: document.getElementById('endTitle'),
  endMessage: document.getElementById('endMessage'),
  btnPlayAgain: document.getElementById('btnPlayAgain'),
  btnReturnEnd: document.getElementById('btnReturnEnd')
};

let user = 'Hero';
try {
  const userStored = localStorage.getItem('mathQuestUser');
  if (userStored) user = JSON.parse(userStored).user;
} catch(e){}

let peer = null;
let conn = null;

let playerHP = 100;
let opponentHP = 100;
let combo = 0;
let opponentCombo = 0;

let currentQuestion = null;
let timerInterval = null;
const MAX_TIME = 15;
let timeLeft = MAX_TIME;
let gameActive = false;

// Initialize Peer
function initPeer(id = null) {
  if (peer) peer.destroy();
  peer = new Peer(id, { debug: 2 });
  
  peer.on('error', (err) => {
    alert("Connection Error: " + err.type);
    resetLobby();
  });
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'MQ-';
  for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

elements.btnHost.onclick = () => {
  const roomCode = generateRoomCode();
  initPeer(roomCode);
  
  elements.lobbySetup.classList.add('hidden');
  elements.lobbyWaiting.classList.remove('hidden');
  elements.displayRoomCode.textContent = roomCode;
  
  peer.on('connection', (connection) => {
    conn = connection;
    setupConnection();
  });
};

elements.btnJoin.onclick = () => {
  const code = elements.joinCodeInput.value.trim().toUpperCase();
  if (!code) return alert("Enter a room code!");
  initPeer();
  
  peer.on('open', () => {
    conn = peer.connect(code);
    setupConnection();
  });
};

elements.btnCancelHost.onclick = resetLobby;
elements.btnReturnHub.onclick = () => window.location.href = 'game.html';
elements.btnReturnEnd.onclick = () => window.location.href = 'game.html';

function resetLobby() {
  if (peer) peer.destroy();
  elements.lobbySetup.classList.remove('hidden');
  elements.lobbyWaiting.classList.add('hidden');
}

function setupConnection() {
  conn.on('open', () => {
    conn.send({ type: 'handshake', name: user });
    
    elements.lobbyModal.classList.add('hidden');
    elements.gameArena.classList.remove('hidden');
    elements.gameArena.classList.add('flex');
    
    startGame();
  });
  
  conn.on('data', (data) => {
    handleNetworkData(data);
  });
  
  conn.on('close', () => {
    if (gameActive) {
      endGame("Opponent Disconnected", false);
    }
  });
}

function handleNetworkData(data) {
  if (data.type === 'handshake') {
    elements.opponentName.textContent = data.name;
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
    takeDamage(data.damage);
  } else if (data.type === 'gameover') {
    endGame(getTranslation('txt_you_win', settings.language), true);
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
  elements.endGameModal.classList.add('hidden');
  
  broadcastUpdate();
  nextQuestion();
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
  
  setTimeout(() => {
    elements.opponentDamageText.style.opacity = '0';
    elements.opponentDamageText.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 800);
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
  elements.lblQuestion.textContent = currentQuestion.q;
  elements.answerGrid.innerHTML = '';
  
  currentQuestion.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'button-outlined py-4 text-xl sm:text-2xl font-minecraft';
    btn.textContent = opt;
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
  
  broadcastUpdate();
  
  elements.gameArena.classList.add('shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]');
  setTimeout(() => elements.gameArena.classList.remove('shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]'), 300);
  
  if (playerHP <= 0) {
    conn.send({ type: 'gameover' });
    endGame(getTranslation('txt_you_lose', settings.language), false);
  }
}

function handleAnswer(selected) {
  if (!gameActive) return;
  clearInterval(timerInterval);
  
  Array.from(elements.answerGrid.children).forEach(b => b.disabled = true);
  
  if (selected === currentQuestion.answer) {
    combo++;
    updateComboUI();
    showCombatText("CORRECT!", "text-emerald-400");
    
    playerHP = Math.min(100, playerHP + 5);
    elements.lblHealth.textContent = `${playerHP}/100`;
    elements.barPlayerHp.style.width = `${playerHP}%`;
    
    let dmg = 10 + Math.floor(combo * 2);
    conn.send({ type: 'attack', damage: dmg });
    showOpponentDamage(dmg);
    
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
  elements.endGameModal.classList.remove('hidden');
  elements.endTitle.textContent = title;
  elements.endTitle.className = isWin ? 'text-5xl font-minecraft mb-4 drop-shadow-lg text-emerald-400' : 'text-5xl font-minecraft mb-4 drop-shadow-lg text-red-500';
  elements.endMessage.textContent = isWin ? 'You crushed your opponent!' : 'You were defeated.';
}

elements.btnPlayAgain.onclick = () => {
  elements.endGameModal.classList.add('hidden');
  resetLobby();
  elements.gameArena.classList.add('hidden');
  elements.gameArena.classList.remove('flex');
  elements.lobbyModal.classList.remove('hidden');
};
