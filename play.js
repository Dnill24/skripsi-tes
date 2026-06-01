const elements = {
  btnFlee: document.getElementById('btnFlee'),
  lblRunStage: document.getElementById('lblRunStage'),
  lblScore: document.getElementById('lblScore'),
  lblRunGold: document.getElementById('lblRunGold'),
  activeBuffsContainer: document.getElementById('activeBuffsContainer'),
  lblHealth: document.getElementById('lblHealth'),
  lblCombo: document.getElementById('lblCombo'),
  barPlayerHp: document.getElementById('barPlayerHp'),
  combatText: document.getElementById('combatText'),
  barTimer: document.getElementById('barTimer'),
  lblQuestion: document.getElementById('lblQuestion'),
  answerGrid: document.getElementById('answerGrid'),
  battleArena: document.getElementById('gameArenaWrapper'),
  playerSprite: document.getElementById('playerSprite'),
  enemySprite: document.getElementById('enemySprite'),
  enemyShadow: document.getElementById('enemyGround'),
  bossHpContainer: document.getElementById('bossHpContainer'),
  barBossHp: document.getElementById('barBossHp'),
  barProgress: document.getElementById('barProgress'),
  runOverModal: document.getElementById('runOverModal'),
  runOverMessage: document.getElementById('runOverMessage'),
  finalScore: document.getElementById('finalScore'),
  finalGold: document.getElementById('finalGold'),
  btnReturnHub: document.getElementById('btnReturnHub'),
  recommendationBox: document.getElementById('recommendationBox'),
  recSubject: document.getElementById('recSubject'),
  btnPracticeRec: document.getElementById('btnPracticeRec'),
  rewardModal: document.getElementById('rewardModal'),
  rewardCardsContainer: document.getElementById('rewardCardsContainer'),
  lblDefense: document.getElementById('lblDefense'),
  lblGoldMod: document.getElementById('lblGoldMod'),
  lblScoreMod: document.getElementById('lblScoreMod')
};

let currency = 0;
let bestRunScore = 0;
let totalGoldEarned = 0;
let totalBossesDefeated = 0;
let totalRuns = 0;
let highestStreak = 0;
let totalQuestionsAnswered = 0;
let selectedSkin = 'rainbow';
let globalStats = { '+': 0, '-': 0, '*': 0, '/': 0, fastestTime: 999, bossRushBosses: 0, glassCannonBosses: 0, comboGod: 0, playerMMR: 10 };

let gameMode = localStorage.getItem('mathQuestMode') || 'normal';
let settings = { volume: 50, language: 'en' };
let currentQuestion = null;

let timerInterval;
let MAX_TIME = 15;
let currentMaxTime = 15;
let timeLeft = currentMaxTime;

let run = {
  active: true,
  questionsAnswered: 0,
  score: 0,
  goldEarned: 0,
  health: 100,
  maxHealth: 100,
  streak: 0,
  difficultyLevel: 1.0,
  bossHP: 0,
  bossMaxHP: 0,
  bossStage: 0,
  isBoss: false,
  currentQuestion: null,
  stats: {
    '+': { correct: 0, total: 0, nameKey: 'sub_add' },
    '-': { correct: 0, total: 0, nameKey: 'sub_sub' },
    '*': { correct: 0, total: 0, nameKey: 'sub_mul' },
    '/': { correct: 0, total: 0, nameKey: 'sub_div' }
  },
  modifiers: {
    goldMult: 1.0,
    scoreMult: 1.0,
    dmgReduction: 0,
    bossRush: false,
    vampirism: false,
    gambler: false,
    nineLives: false,
    timeWarp: false
  },
  activeBuffs: []
};

const skinEmojis = {
  'rainbow': '🧍', 'peasant': '👦', 'adventurer': '🎒', 'stone': '🗿',
  'knight': '🛡️', 'mage': '🧙', 'glow': '⚡', 'ninja': '🥷', 'robot': '🤖',
  'gold': '👑', 'diamond': '💎', 'fire': '🔥', 'ice': '❄️', 'phantom': '👻',
  'alien': '👽', 'demon': '👹', 'angel': '👼', 'dragon': '🐲', 'void': '🌌',
  'celestial': '🌟', 'god': '⛩️'
};

const bossEmojis = ['🐲', '🧟', '🧛', '👹', '👽', '💀', '🤡', '🤖', '🦖', '🦂', '👁️', '🎃'];
const enemyEmojis = ['👾', '👻', '🦇', '🕷️', '🐍'];

const buffPool = [
  { id: 'heal', nameKey: 'buff_heal_name', descKey: 'buff_heal_desc', icon: '❤️', apply: () => { run.health = Math.min(Number(run.maxHealth), Number(run.health) + 50); } },
  { id: 'vitality', nameKey: 'buff_vit_name', descKey: 'buff_vit_desc', icon: '💪', apply: () => { run.maxHealth = Number(run.maxHealth) + 25; run.health = Number(run.health) + 25; } },
  { id: 'time', nameKey: 'buff_time_name', descKey: 'buff_time_desc', icon: '⌛', apply: () => { MAX_TIME += 2; } },
  { id: 'greed', nameKey: 'buff_greed_name', descKey: 'buff_greed_desc', icon: '💰', apply: () => { run.modifiers.goldMult += 0.5; } },
  { id: 'scholar', nameKey: 'buff_scholar_name', descKey: 'buff_scholar_desc', icon: '📚', apply: () => { run.modifiers.scoreMult += 0.5; } },
  { id: 'defense', nameKey: 'buff_def_name', descKey: 'buff_def_desc', icon: '🛡️', apply: () => { run.modifiers.dmgReduction += 3; } },
  { id: 'bossrush', nameKey: 'buff_boss_name', descKey: 'buff_boss_desc', icon: '💀', apply: () => { run.modifiers.bossRush = true; run.modifiers.goldMult += 2.0; run.modifiers.scoreMult += 2.0; } },
  { id: 'glasscannon', nameKey: 'buff_glass_name', descKey: 'buff_glass_desc', icon: '🧪', apply: () => { run.modifiers.glassCannon = true; run.maxHealth = 1; run.health = 1; run.modifiers.goldMult += 2.0; run.modifiers.scoreMult += 2.0; } },
  { id: 'vampirism', nameKey: 'buff_vamp_name', descKey: 'buff_vamp_desc', icon: '🦇', apply: () => { run.modifiers.vampirism = true; } },
  { id: 'gambler', nameKey: 'buff_gambler_name', descKey: 'buff_gambler_desc', icon: '🎲', apply: () => { run.modifiers.gambler = true; } },
  { id: 'ninelives', nameKey: 'buff_nine_name', descKey: 'buff_nine_desc', icon: '🐱', apply: () => { run.modifiers.nineLives = true; } },
  { id: 'timewarp', nameKey: 'buff_warp_name', descKey: 'buff_warp_desc', icon: '⏳', apply: () => { run.modifiers.timeMult = (run.modifiers.timeMult || 1.0) * 0.33; run.modifiers.scoreMult += 2.0; } },
  { id: 'midas', nameKey: 'buff_midas_name', descKey: 'buff_midas_desc', icon: '✨', apply: () => { run.modifiers.goldMult += 4.0; run.modifiers.enemyDamageMult = (run.modifiers.enemyDamageMult || 1) * 2; } },
  { id: 'slowmo', nameKey: 'buff_slowmo_name', descKey: 'buff_slowmo_desc', icon: '🐢', apply: () => { run.modifiers.timeMult = (run.modifiers.timeMult || 1.0) * 2.0; run.modifiers.scoreMult *= 0.5; } },
  { id: 'berserk', nameKey: 'buff_berserk_name', descKey: 'buff_berserk_desc', icon: '💢', apply: () => { run.modifiers.berserk = true; run.modifiers.scoreMult += 0.5; MAX_TIME = Math.max(5, MAX_TIME - 5); } }
];
let user = 'Hero';

function loadState() {
  const userStored = localStorage.getItem('mathQuestUser');
  if (userStored) {
    try { user = JSON.parse(userStored).user; } catch(e){}
  }

  const saved = localStorage.getItem('mathQuestRogueStats');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      currency = parsed.currency ?? 0;
      bestRunScore = parsed.bestRunScore ?? 0;
      totalGoldEarned = parsed.totalGoldEarned ?? 0;
      totalBossesDefeated = parsed.totalBossesDefeated ?? 0;
      totalRuns = parsed.totalRuns ?? 0;
      highestStreak = parsed.highestStreak ?? 0;
      totalQuestionsAnswered = parsed.totalQuestionsAnswered ?? 0;
      selectedSkin = parsed.selectedSkin || 'rainbow';
      globalStats = parsed.globalStats || { '+': 0, '-': 0, '*': 0, '/': 0, fastestTime: 999, bossRushBosses: 0, glassCannonBosses: 0, comboGod: 0, playerMMR: 10 };
      globalStats.playerMMR = globalStats.playerMMR ?? 10;
    } catch(e){}
  }
  
  const savedSettings = localStorage.getItem('mathQuestSettings');
  if (savedSettings) {
    try { settings = { ...settings, ...JSON.parse(savedSettings) }; } catch(e){}
  }
  elements.playerSprite.textContent = skinEmojis[selectedSkin] || '🧍';
}

function saveState() {
  try {
    const saved = localStorage.getItem('mathQuestRogueStats');
    let parsed = {};
    if (saved) { try { parsed = JSON.parse(saved); } catch(e){} }
    
    parsed.currency = currency;
    parsed.bestRunScore = Math.max(bestRunScore, run.score);
    parsed.totalGoldEarned = totalGoldEarned;
    parsed.totalBossesDefeated = totalBossesDefeated;
    parsed.totalRuns = totalRuns;
    parsed.highestStreak = Math.max(highestStreak, run.streak);
    parsed.totalQuestionsAnswered = totalQuestionsAnswered;
    parsed.globalStats = globalStats;
    
    localStorage.setItem('mathQuestRogueStats', JSON.stringify(parsed));
    
    if (typeof db !== 'undefined' && user !== 'Hero' && user !== 'Guest') {
      const cleanName = user.trim().replace(/[.#$[\]\s/]/g, '_').toLowerCase();
      const firebaseData = JSON.parse(JSON.stringify(parsed, (k, v) => (typeof v === 'number' && isNaN(v)) ? 0 : v));
      if (firebaseData.globalStats) {
        firebaseData.globalStats['add'] = firebaseData.globalStats['+'] || 0;
        firebaseData.globalStats['sub'] = firebaseData.globalStats['-'] || 0;
        firebaseData.globalStats['mul'] = firebaseData.globalStats['*'] || 0;
        firebaseData.globalStats['div'] = firebaseData.globalStats['/'] || 0;
        delete firebaseData.globalStats['+'];
        delete firebaseData.globalStats['-'];
        delete firebaseData.globalStats['*'];
        delete firebaseData.globalStats['/'];
      }
      db.ref('users/' + cleanName + '/stats').update(firebaseData).catch(e => console.error("Firebase Sync Error", e));
    }
  } catch (err) {
    console.error("Error saving state:", err);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}


function startTimer() {
  clearInterval(timerInterval);
  let mult = run.modifiers.timeMult || 1.0;
  currentMaxTime = MAX_TIME * mult;
  timeLeft = currentMaxTime;
  updateTimerUI();

  timerInterval = setInterval(() => {
    if(!run.active) return clearInterval(timerInterval);
    timeLeft -= 0.1;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitAnswer(null, true);
    }
  }, 100);
}

function updateTimerUI() {
  const percent = Math.max(0, (timeLeft / currentMaxTime) * 100);
  elements.barTimer.style.width = `${percent}%`;
  
  if (percent > 50) {
    elements.barTimer.style.background = '#34d399';
    elements.barTimer.style.animation = '';
  } else if (percent > 20) {
    elements.barTimer.style.background = '#fbbf24';
    elements.barTimer.style.animation = '';
  } else {
    elements.barTimer.style.background = '#ef4444';
    elements.barTimer.style.animation = 'pulse 1s infinite';
    // Tick every ~1 second while in the red
    if (Math.round(timeLeft * 10) % 10 === 0) SFX.timerTick();
  }
}

function showCombatText(text, colorClass, target = 'center') {
  const container = document.getElementById('gameArenaWrapper');
  if (!container) return;
  
  const el = document.createElement('div');
  el.textContent = text;
  
  let baseClasses = 'absolute transform -translate-x-1/2 -translate-y-1/2 font-minecraft font-bold drop-shadow-[3px_3px_0_rgba(0,0,0,1)] text-center z-50 pointer-events-none ';
  
  if (target === 'player') {
    el.style.top = '60%';
    el.style.left = '25%';
    baseClasses += 'text-sm md:text-3xl ';
  } else if (target === 'enemy') {
    el.style.top = '60%';
    el.style.left = '75%';
    baseClasses += 'text-sm md:text-3xl ';
  } else {
    el.style.top = '50%';
    el.style.left = '50%';
    baseClasses += 'text-2xl md:text-6xl ';
  }
  
  el.className = baseClasses + colorClass;
  el.style.animation = 'combatTextFloat 1s cubic-bezier(0.25, 1, 0.5, 1) forwards';
  container.appendChild(el);
  
  if (target === 'player' || colorClass.includes('red') || colorClass.includes('blue')) {
    if (elements.playerSprite && elements.playerSprite.parentElement) {
      elements.playerSprite.parentElement.classList.add('shake');
      elements.playerSprite.classList.add('anim-hit-flash');
      setTimeout(() => {
        elements.playerSprite.parentElement.classList.remove('shake');
        elements.playerSprite.classList.remove('anim-hit-flash');
      }, 500);
    }
  } else {
    if (elements.enemySprite && elements.enemySprite.parentElement) {
      elements.enemySprite.parentElement.classList.add('shake');
      elements.enemySprite.classList.add('anim-hit-flash');
      setTimeout(() => {
        elements.enemySprite.parentElement.classList.remove('shake');
        elements.enemySprite.classList.remove('anim-hit-flash');
      }, 500);
    }
  }

  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 1000);
}

function updateComboUI() {
  if (!elements.lblCombo) return;
  if (run.streak > 2) {
    elements.lblCombo.textContent = `${run.streak}x Combo!`;
    elements.lblCombo.classList.remove('hidden');
    elements.lblCombo.classList.add('scale-110');
    setTimeout(() => elements.lblCombo.classList.remove('scale-110'), 200);
  } else {
    elements.lblCombo.classList.add('hidden');
  }
}

function updateStatsUI() {
  if (elements.lblRunGold) elements.lblRunGold.textContent = Math.floor(run.goldEarned);
  if (elements.lblScore) elements.lblScore.textContent = Math.floor(run.score);
  if (elements.activeBuffsContainer) {
    elements.activeBuffsContainer.innerHTML = run.activeBuffs.map(icon => `<span style="font-size:1.1rem; filter:drop-shadow(1px 1px 0 #000); cursor:help;" title="Active Buff">${icon}</span>`).join('');
  }
  if (elements.lblDefense) elements.lblDefense.textContent = run.modifiers.dmgReduction;
  if (elements.lblGoldMod) elements.lblGoldMod.textContent = run.modifiers.goldMult.toFixed(1) + 'x';
  if (elements.lblScoreMod) elements.lblScoreMod.textContent = run.modifiers.scoreMult.toFixed(1) + 'x';
}

function spawnCoins(amount, x, y) {
  const container = document.getElementById('gameArenaWrapper');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const relX = x - rect.left;
  const relY = y - rect.top;
  
  for (let i = 0; i < Math.min(amount, 10); i++) {
    const coin = document.createElement('div');
    coin.textContent = '🪙';
    coin.className = 'coin-drop';
    coin.style.left = relX + 'px';
    coin.style.top = relY + 'px';
    const offsetX = (Math.random() - 0.5) * 150;
    const offsetY = -Math.random() * 100 - 50;
    coin.style.setProperty('--tx', offsetX + 'px');
    coin.style.setProperty('--ty', offsetY + 'px');
    container.appendChild(coin);
    setTimeout(() => { if (coin.parentNode) coin.remove(); }, 1000);
  }
}

function showRewardModal() {
  run.active = false;
  clearInterval(timerInterval);
  
  const funnyIds = ['bossrush', 'glasscannon', 'vampirism', 'gambler', 'ninelives', 'timewarp', 'midas', 'slowmo', 'berserk'];
  const standardBuffs = buffPool.filter(b => !funnyIds.includes(b.id));
  const funnyBuffs = buffPool.filter(b => funnyIds.includes(b.id));
  
  let choices = [];
  if (Math.random() < 0.25) {
    const crazy = shuffleArray([...funnyBuffs])[0];
    choices = [crazy, ...shuffleArray([...standardBuffs]).slice(0, 2)];
  } else {
    choices = shuffleArray([...standardBuffs]).slice(0, 3);
  }
  choices = shuffleArray(choices);
  
  elements.rewardCardsContainer.innerHTML = '';
  choices.forEach(buff => {
    const card = document.createElement('div');
    card.className = 'stone-panel';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'center';
    card.style.padding = '20px';
    card.style.cursor = 'pointer';
    card.style.transition = 'transform 0.1s ease-out';
    card.onmouseover = () => { card.style.transform = 'scale(1.05)'; card.style.borderColor = 'var(--text-gold)'; };
    card.onmouseout = () => { card.style.transform = ''; card.style.borderColor = ''; };
    
    card.innerHTML = `
      <div style="font-size:3.5rem; margin-bottom:16px; filter:drop-shadow(2px 2px 0 rgba(0,0,0,1));">${buff.icon}</div>
      <div style="font-family:'Press Start 2P',monospace; font-size:0.75rem; color:var(--text-gold); margin-bottom:12px; text-shadow:1px 1px 0 rgba(0,0,0,1); text-align:center;">${getTranslation(buff.nameKey, settings.language)}</div>
      <div style="font-family:'Comic Neue',cursive; font-size:1rem; color:#ccc; text-align:center; line-height:1.2;">${getTranslation(buff.descKey, settings.language)}</div>
    `;
    card.onclick = () => {
      SFX.buffPick();
      buff.apply();
      run.activeBuffs.push(buff.icon);
      if (run.modifiers.glassCannon) {
        run.maxHealth = 1;
        run.health = 1;
      }
      elements.lblHealth.textContent = `${run.health}/${run.maxHealth}`;
      updateStatsUI();
      elements.rewardModal.classList.remove('show');
      run.active = true;
      nextQuestion();
    };
    elements.rewardCardsContainer.appendChild(card);
  });
  
  elements.rewardModal.classList.add('show');
}

let bgPositionX = 0;

function nextQuestion() {
  if (elements.runOverModal.classList.contains('show')) return;
  run.active = true;
  
  // Scroll background to simulate walking deeper
  bgPositionX -= 20;
  document.body.style.backgroundPositionX = `${bgPositionX}%`;
  
  const nextQ = run.questionsAnswered + 1;
  const progressPercent = ((nextQ - 1) % 10) / 9 * 100;
  elements.barProgress.style.width = `${progressPercent}%`;

  if (!run.isBoss && (nextQ % 10 === 0 || run.modifiers.bossRush)) {
    run.isBoss = true;
    run.bossesEncountered = (run.bossesEncountered || 0) + 1;
    run.bossStage = run.modifiers.bossRush ? nextQ : (nextQ / 10);
    run.bossMaxHP = 100 * run.bossStage;
    run.bossHP = run.bossMaxHP;
    
    elements.bossHpContainer.style.display = 'block';
    elements.barBossHp.style.width = '100%';
    elements.enemySprite.textContent = bossEmojis[(run.bossesEncountered - 1) % bossEmojis.length];
    
    elements.enemySprite.parentElement.classList.add('animate-float');
    elements.enemySprite.style.fontSize = 'clamp(6rem,19.5vw,9rem)';
    elements.enemySprite.style.filter = 'drop-shadow(0 0 30px rgba(239,68,68,0.8))';
    elements.enemySprite.style.transform = 'scale(1.1)';
    if (typeof SFX !== 'undefined') SFX.playBGM('Boss Music.mp3');
  } else if (!run.isBoss) {
    elements.bossHpContainer.style.display = 'none';
    elements.enemySprite.textContent = enemyEmojis[getRandomInt(0, enemyEmojis.length - 1)];
    
    elements.enemySprite.parentElement.classList.remove('animate-float');
    elements.enemySprite.style.fontSize = 'clamp(2.5rem,8vw,4rem)';
    elements.enemySprite.style.filter = 'drop-shadow(0 0 15px rgba(239,68,68,0.6))';
    elements.enemySprite.style.transform = '';
    if (typeof SFX !== 'undefined') SFX.playBGM('Battle Music.mp3');
  }

  run.currentQuestion = createQuestion(run.isBoss ? 'boss' : 'enemy');
  renderQuestion();
  startTimer();
}

function calculateEquationWeight(exprStr) {
  let tokens = exprStr.split(' ');
  let weight = 0;
  let opMult = 1.0;
  for (let t of tokens) {
    if (['+', '-'].includes(t)) opMult += 0.2;
    else if (['*', '/'].includes(t)) opMult += 1.5;
    else {
      let v = Math.abs(parseInt(t));
      weight += (v.toString().length * 2) + (v * 0.1);
    }
  }
  return weight * opMult;
}

function createQuestion(type) {
  let ops = ['+', '-', '*', '/'];
  if (gameMode !== 'normal') {
    ops = [gameMode];
  }

  const primaryOp = ops[getRandomInt(0, ops.length - 1)];
  const targetMMR = (globalStats.playerMMR || 10) + (run.difficultyLevel * 2);
  
  let numTerms = 2;
  if ((primaryOp === '+' || primaryOp === '-') && targetMMR > 30 && Math.random() > 0.5) {
    numTerms = 3;
    if (targetMMR > 50 && Math.random() > 0.5) numTerms = 4;
  } else if (gameMode === 'normal' && primaryOp !== '/' && targetMMR > 40 && Math.random() > 0.5) {
    numTerms = 3;
  }

  let bestExpr = null;
  let bestDiff = 999999;
  let bestAns = 0;

  for (let attempt = 0; attempt < 50; attempt++) {
    let exprStr = "";
    let answer = 0;
    
    let bound = Math.max(5, targetMMR * 1.5);
    if (primaryOp === '*' || primaryOp === '/') bound = Math.max(3, targetMMR * 0.4);

    if (numTerms > 2 && (gameMode === 'normal' && primaryOp !== '/')) {
      let terms = [];
      let expOps = [primaryOp];
      for(let i=1; i<numTerms-1; i++) {
        expOps.push(['+', '-', '*'][getRandomInt(0, 2)]);
      }
      expOps = shuffleArray(expOps);

      for(let i=0; i<numTerms; i++) {
        terms.push(getRandomInt(2, Math.floor(bound)));
      }
      
      exprStr = terms[0].toString();
      for(let i=0; i<expOps.length; i++) {
        exprStr += " " + expOps[i] + " " + terms[i+1];
      }
      answer = new Function('return ' + exprStr)();
    } else {
      let a, b;
      if (primaryOp === '+') {
        a = getRandomInt(2, Math.floor(bound));
        b = getRandomInt(2, Math.floor(bound));
        answer = a + b;
      } else if (primaryOp === '-') {
        a = getRandomInt(10, Math.floor(bound * 2));
        b = getRandomInt(2, Math.min(a, Math.floor(bound)));
        answer = a - b;
      } else if (primaryOp === '*') {
        a = getRandomInt(2, Math.floor(bound));
        b = getRandomInt(2, Math.floor(bound));
        answer = a * b;
      } else if (primaryOp === '/') {
        answer = getRandomInt(2, Math.floor(bound));
        b = getRandomInt(2, Math.floor(bound));
        a = answer * b;
      }
      exprStr = `${a} ${primaryOp} ${b}`;
    }

    if (answer >= 0 && Number.isInteger(answer)) {
      let weight = calculateEquationWeight(exprStr);
      let diff = Math.abs(weight - targetMMR);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestExpr = exprStr;
        bestAns = answer;
      }
    }
  }
  
  if (!bestExpr) {
    bestExpr = "2 + 2";
    bestAns = 4;
  }

  const options = [bestAns];
  while (options.length < 4) {
    const wrong = bestAns + (Math.random() < 0.5 ? 1 : -1) * getRandomInt(1, Math.max(5, Math.floor(targetMMR * 0.2)));
    if (!options.includes(wrong) && wrong >= 0 && wrong !== bestAns) options.push(wrong);
  }

  return { text: bestExpr, answers: shuffleArray(options), correct: bestAns, operator: primaryOp };
}

function renderQuestion() {
  elements.lblQuestion.textContent = run.currentQuestion.text.replaceAll('*', '\u00d7').replaceAll('/', '\u00f7');
  elements.lblRunStage.textContent = Math.floor(run.questionsAnswered / 10) + 1;
  elements.lblScore.textContent = Math.floor(run.score);
  elements.lblHealth.textContent = `${run.health}/${run.maxHealth}`;

  elements.answerGrid.innerHTML = '';
  // Terraria-style wooden planks
  run.currentQuestion.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'math-answer-btn';
    btn.style.cssText = `
      background: #8d6e63;
      border: 4px solid #4e342e;
      color: #fff;
      box-shadow: inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 4px 0 #4e342e;
      cursor: pointer;
      width: 100%;
      min-height: clamp(36px, 8vh, 54px);
      max-height: clamp(48px, 12vh, 72px);
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1.2;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.8);
      position: relative;
    `;
    // Wood grain detail
    const grain = document.createElement('div');
    grain.style.cssText = 'position:absolute;inset:0;background:repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.08) 4px, rgba(0,0,0,0.08) 8px);pointer-events:none;';
    const label = document.createElement('span');
    label.style.position = 'relative';
    label.textContent = ans;
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
    btn.onclick = () => submitAnswer(ans, false);
    elements.answerGrid.appendChild(btn);
  });
}



// ——— SOUND ENGINE (Web Audio API — no files needed) ————————————————
// The SFX engine is now loaded globally from sfx.js

// ——— SLASH VFX ——————————————————————————————————————————————————————
function spawnSlashAt(targetEl, isBoss = false) {
  const arena = document.getElementById('gameArenaWrapper');
  if (!arena || !targetEl) return;
  const arenaRect = arena.getBoundingClientRect();
  const tRect = targetEl.getBoundingClientRect();
  const cx = tRect.left + tRect.width / 2 - arenaRect.left;
  const cy = tRect.top + tRect.height / 2 - arenaRect.top;

  const slashSymbols = ['⚔️', '✨', '💥', '⚡'];
  const sym = slashSymbols[Math.floor(Math.random() * slashSymbols.length)];

  const el = document.createElement('div');
  el.textContent = sym;
  el.className = isBoss ? 'slash-effect-big' : 'slash-effect';
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  arena.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

function triggerPlayerAttack() {
  const sprite = elements.playerSprite;
  sprite.classList.remove('anim-player-attack');
  void sprite.offsetWidth;
  sprite.classList.add('anim-player-attack');

  SFX.slash();

  // Spawn slash at enemy after lunge reaches ~55% of animation
  setTimeout(() => {
    SFX.hit();
    if (run.isBoss) {
      spawnSlashAt(elements.enemySprite, true);
      SFX.bossHit();
    } else {
      spawnSlashAt(elements.enemySprite, false);
    }
    // Enemy flash on impact
    if (elements.enemySprite) {
      elements.enemySprite.classList.remove('anim-hit-flash');
      void elements.enemySprite.offsetWidth;
      elements.enemySprite.classList.add('anim-hit-flash');
      setTimeout(() => elements.enemySprite.classList.remove('anim-hit-flash'), 300);
    }
  }, 250);
}

function triggerEnemyAttack() {
  const sprite = elements.enemySprite;
  sprite.classList.remove('anim-enemy-attack', 'anim-boss-attack');
  void sprite.offsetWidth;
  
  if (run.isBoss) {
    sprite.classList.add('anim-boss-attack');
    elements.battleArena.classList.remove('anim-arena-shake');
    void elements.battleArena.offsetWidth;
    setTimeout(() => {
      elements.battleArena.classList.add('anim-arena-shake');
      SFX.playerHurt();
      // Enemy slash on player
      spawnSlashAt(elements.playerSprite, false);
    }, 350);
  } else {
    sprite.classList.add('anim-enemy-attack');
    setTimeout(() => {
      SFX.playerHurt();
      spawnSlashAt(elements.playerSprite, false);
    }, 250);
  }
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
    const stepIndex = s - 1; // for pitch ladder
    let diffIndex = -1;
    for (let i = 0; i < steps[s-1].length; i++) {
      if (steps[s-1][i] !== steps[s][i]) {
        diffIndex = i;
        break;
      }
    }
    
    let opIndex = diffIndex + 1;
    if (['+', '-', '*', '/'].includes(steps[s-1][diffIndex])) {
      opIndex = diffIndex;
    }
    
    tokenElements[opIndex - 1].classList.add('anim-scale-up-glow');
    tokenElements[opIndex].classList.add('anim-scale-up-glow');
    tokenElements[opIndex + 1].classList.add('anim-scale-up-glow');
    
    SFX.calcStep(stepIndex);
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
  // Play the final "result reveal" tone — highest pitch in the ladder
  SFX.calcResult(steps.length - 1);
  await wait(800);
  
  container.classList.add('hidden');
}

async function submitAnswer(ans, isTimeout = false) {
  if (!run.active) return;
  run.active = false;
  clearInterval(timerInterval);
  
  run.questionsAnswered++;
  totalQuestionsAnswered++;
  
  const op = run.currentQuestion.operator;
  run.stats[op].total++;

  const correct = !isTimeout && ans === run.currentQuestion.correct;
  
  const btns = elements.answerGrid.querySelectorAll('button');
  btns.forEach(b => {
    b.disabled = true;
    // Get the answer value from the span inside the button
    const btnVal = parseInt(b.querySelector('span') ? b.querySelector('span').textContent : b.textContent);
    if (btnVal === run.currentQuestion.correct) {
      b.style.background = '#388e3c';
      b.style.borderColor = '#1b5e20';
      b.style.boxShadow = 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 4px 0 #1b5e20';
      b.style.color = '#fff';
    } else if (!correct && !isTimeout && btnVal === ans) {
      b.style.background = '#d32f2f';
      b.style.borderColor = '#880e4f';
      b.style.boxShadow = 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 4px 0 #880e4f';
      b.style.color = '#fff';
    }
  });

  await playCalculationAnimation(run.currentQuestion.text);

  if (correct) {
    const timeTaken = currentMaxTime - timeLeft;
    if (timeTaken < globalStats.fastestTime) globalStats.fastestTime = timeTaken;
    
    // spawnCelebrationParticles('playerSpriteContainer');
    SFX.correct();
    
    const timeRatio = Math.max(0, 1 - (timeTaken / MAX_TIME));
    
    let mmrGain = 0.5 + (timeRatio * 1.5);
    if (run.isBoss) mmrGain *= 1.5;
    globalStats.playerMMR = (globalStats.playerMMR || 10) + mmrGain;
    
    const baseDmg = getRandomInt(15, 25);
    const timeMultiplier = 1 + (timeRatio * 2); 
    const damage = Math.floor(baseDmg * timeMultiplier);
    
    if (run.modifiers.vampirism) {
      const healAmount = Math.max(1, Math.floor(damage * 0.1));
      run.health = Math.min(Number(run.maxHealth), Number(run.health) + healAmount);
    }
    
    run.streak++;
    if (run.streak > globalStats.comboGod) globalStats.comboGod = run.streak;
    updateComboUI();
    run.difficultyLevel += 0.2;
    run.stats[op].correct++;
    globalStats[op]++;
    
    triggerPlayerAttack();

    if (run.isBoss) {
      
      run.bossHP = Math.max(0, run.bossHP - damage);
      elements.barBossHp.style.width = `${(run.bossHP / run.bossMaxHP) * 100}%`;

      // Award score per hit on boss (scaled by time bonus)
      const hitScore = Math.floor((10 + run.bossStage * 5) * (1 + timeRatio) * run.modifiers.scoreMult);
      run.score += hitScore;
      updateStatsUI();
      
      setTimeout(() => {
        if (run.bossHP === 0) {
          showCombatText(getTranslation('modal_reward', settings.language), 'text-emerald-400 text-6xl');
          let rewardGold = Math.floor((50 + run.bossStage * 10) * run.modifiers.goldMult);
          let rewardScore = Math.floor((100 + run.bossStage * 25) * run.modifiers.scoreMult);
          
          if (gameMode !== 'normal') {
            rewardGold = Math.floor(rewardGold * 0.2);
            rewardScore = Math.floor(rewardScore * 0.2);
          }

          if (run.modifiers.bossRush) globalStats.bossRushBosses++;
          if (run.maxHealth === 1) globalStats.glassCannonBosses++;
          
          run.goldEarned += rewardGold;
          currency += rewardGold;
          totalGoldEarned += rewardGold;
          totalBossesDefeated++;
          run.score += rewardScore;
          updateStatsUI();
          
          const enemyRect = elements.enemySprite.getBoundingClientRect();
          spawnCoins(Math.ceil(rewardGold), enemyRect.left + enemyRect.width / 2, enemyRect.top + enemyRect.height / 2);
          SFX.bossDefeated();
          setTimeout(() => SFX.coin(), 200);
          run.isBoss = false;
          
          setTimeout(showRewardModal, 1500);
        } else {
          if (timeRatio > 0.7) {
            if (elements.lblCombo) {
              elements.lblCombo.textContent = "CRITICAL HIT!";
              elements.lblCombo.classList.remove('hidden');
              setTimeout(() => elements.lblCombo && elements.lblCombo.classList.add('hidden'), 1000);
            }
            showCombatText(`${getTranslation('txt_crit', settings.language)} -${damage} HP!`, 'text-yellow-300', 'enemy');
            SFX.crit();
          } else {
            showCombatText(`-${damage} HP!`, 'text-orange-400', 'enemy');
          }
          setTimeout(() => {
            if (elements.runOverModal.classList.contains('show')) return;
            run.active = true;
            run.currentQuestion = createQuestion('boss');
            renderQuestion();
            startTimer();
          }, 1200);
        }
      }, 250); // wait for attack lunge to connect visually
    } else {
      showCombatText(getTranslation('txt_hit', settings.language), 'text-emerald-400', 'enemy');
        
        let baseGold = getRandomInt(5, 10);
        let baseScore = 15;
        
        let gold = Math.floor(baseGold * (1 + (run.streak * 0.2)) * run.modifiers.goldMult);
        
        if (run.modifiers.gambler) {
          if (Math.random() < 0.5) gold *= 3;
          else gold = 0;
        }
        
        let scoreGain = Math.floor(baseScore * (1 + (run.streak * 0.3)) * run.modifiers.scoreMult);
        
        if (gameMode !== 'normal') {
          gold = Math.max(1, Math.floor(gold * 0.2));
          scoreGain = Math.floor(scoreGain * 0.2);
        }

        if (run.modifiers.berserk) {
          run.health = Math.min(Number(run.maxHealth), Number(run.health) + 10);
        }

        run.goldEarned += gold;
        currency += gold;
        totalGoldEarned += gold;
        run.score += scoreGain;
        updateStatsUI();
        
        const enemyRect = elements.enemySprite.getBoundingClientRect();
        spawnCoins(Math.ceil(gold), enemyRect.left + enemyRect.width / 2, enemyRect.top + enemyRect.height / 2);
        SFX.coin();
        setTimeout(nextQuestion, 1000);
    }
  } else {
    SFX.wrong();
    
    let mmrLoss = 1.0;
    if (isTimeout) mmrLoss = 1.5;
    globalStats.playerMMR = Math.max(1, (globalStats.playerMMR || 10) - mmrLoss);
    
    run.streak = 0;
    updateComboUI();
    const baseDifficulty = 1.0 + (run.questionsAnswered * 0.05);
    run.difficultyLevel = Math.max(baseDifficulty, run.difficultyLevel - 0.5);
    run.stats[op].incorrect++;
    
    let baseDamage = 0;
    if (run.isBoss) {
      baseDamage = Math.floor(20 + (run.bossStage * 10));
    } else {
      baseDamage = Math.floor(10 + (run.questionsAnswered * 0.5));
    }
    
    const damageMult = run.modifiers.enemyDamageMult || 1;
    let damage = Math.floor(baseDamage * damageMult) - run.modifiers.dmgReduction;
    if (damage < 1) damage = 1;
    
    triggerEnemyAttack();

    setTimeout(() => {
      run.health = Math.max(0, run.health - damage);
      elements.lblHealth.textContent = `${run.health}/${run.maxHealth}`;
      
      elements.battleArena.classList.add('shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]');
      setTimeout(() => elements.battleArena.classList.remove('shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]'), 300);
      
      if (isTimeout) {
        showCombatText(`${getTranslation('txt_timeout', settings.language)} -${damage} HP`, 'text-red-500', 'player');
      } else {
        showCombatText(`${getTranslation('txt_miss', settings.language)} -${damage} HP`, 'text-red-400', 'player');
      }
      
      if (run.health === 0) {
        if (run.modifiers.nineLives) {
          run.modifiers.nineLives = false;
          run.health = 50;
          showCombatText(getTranslation('txt_nine_lives', settings.language), 'text-blue-400 text-5xl');
          elements.lblHealth.textContent = `${run.health}/${run.maxHealth}`;
          if (run.isBoss) {
            setTimeout(() => {
              if (elements.runOverModal.classList.contains('show')) return;
              run.active = true;
              run.currentQuestion = createQuestion('boss');
              renderQuestion();
              startTimer();
            }, 1200);
          } else {
            setTimeout(nextQuestion, 1000);
          }
        } else {
          setTimeout(() => endRun(getTranslation('txt_defeated', settings.language)), 1000);
        }
      } else {
        if (run.isBoss) {
          setTimeout(() => {
            if (elements.runOverModal.classList.contains('show')) return;
            run.active = true;
            run.currentQuestion = createQuestion('boss');
            renderQuestion();
            startTimer();
          }, 1200);
        } else {
          setTimeout(nextQuestion, 1000);
        }
      }
    }, run.isBoss ? 450 : 250);
  }
}

function evaluateWorstSubject() {
  let worstOp = null;
  let worstAcc = 1.1;

  for (const op in run.stats) {
    const s = run.stats[op];
    if (s.total > 0) {
      const acc = s.correct / s.total;
      if (acc < worstAcc) {
        worstAcc = acc;
        worstOp = op;
      }
    }
  }
  return worstOp;
}

function endRun(msg) {
  run.active = false;
  clearInterval(timerInterval);
  totalRuns++;
  saveState();
  
  if (run.score > 0) {
    let leaderboard = [];
    try {
      const stored = localStorage.getItem('mathQuestLeaderboard');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) leaderboard = parsed;
      }
    } catch(e) {}
    
    try {
      leaderboard.push({
        name: user,
        skin: skinEmojis[selectedSkin] || '🏃',
        mmr: globalStats.playerMMR,
        score: Math.floor(run.score),
        date: new Date().toLocaleDateString()
      });
      
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard = leaderboard.slice(0, 100);
      
      localStorage.setItem('mathQuestLeaderboard', JSON.stringify(leaderboard));
    } catch(e) {
      console.error("Error saving leaderboard to local storage", e);
    }
    
    // Save to Firebase
    try {
      if (typeof db !== 'undefined') {
        db.ref('leaderboard').push({
          name: user,
          skin: skinEmojis[selectedSkin] || '🏃',
          mmr: globalStats.playerMMR,
          score: Math.floor(run.score),
          date: new Date().toLocaleDateString(),
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }).catch(e => console.log('Firebase error:', e));
      }
    } catch(e) {
      console.error("Error saving leaderboard to Firebase", e);
    }
  }
  
  elements.runOverMessage.textContent = msg;
  elements.finalScore.textContent = Math.floor(run.score);
  elements.finalGold.textContent = run.goldEarned;

  const worstOp = evaluateWorstSubject();
  if (worstOp && run.stats[worstOp].correct < run.stats[worstOp].total) {
    elements.recommendationBox.classList.remove('hidden');
    elements.recSubject.textContent = getTranslation(run.stats[worstOp].nameKey, settings.language);
    elements.btnPracticeRec.onclick = () => {
      localStorage.setItem('mathQuestMode', worstOp);
      window.location.reload();
    };
  } else {
    elements.recommendationBox.classList.add('hidden');
  }

  elements.runOverModal.classList.add('show');
  SFX.runOver();
}

if (elements.btnFlee) {
  elements.btnFlee.addEventListener('click', async (e) => {
    e.preventDefault();
    const wasActive = run.active;
    run.active = false;
    clearInterval(timerInterval);
    if (await showConfirm(getTranslation('txt_confirm_flee', settings.language))) {
      endRun(getTranslation('txt_fled', settings.language));
    } else {
      run.active = wasActive;
      if (wasActive) {
        timerInterval = setInterval(() => {
          if(!run.active) return clearInterval(timerInterval);
          timeLeft -= 0.1;
          updateTimerUI();
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitAnswer(null, true);
          }
        }, 100);
      }
    }
  });
}



function runCountdown(callback) {
  const overlay = document.getElementById('countdownOverlay');
  const text = document.getElementById('countdownText');
  if (!overlay || !text) {
    if (callback) callback();
    return;
  }
  
  overlay.style.display = 'flex';
  run.active = false;
  clearInterval(timerInterval);
  
  const countSteps = ['3', '2', '1', 'START!'];
  let idx = 0;
  
  function showNext() {
    if (idx >= countSteps.length) {
      overlay.style.display = 'none';
      run.active = true;
      if (callback) callback();
      return;
    }
    
    const stepVal = countSteps[idx];
    text.textContent = stepVal;
    // Balatro-style: gold for START!, hot red for numbers
    if (stepVal === 'START!') {
      text.style.color = '#f5c842';
      text.style.textShadow = '0 0 40px rgba(245,200,66,0.9), 0 0 80px rgba(245,200,66,0.5), 4px 4px 0 rgba(0,0,0,1)';
      SFX.countdownStart();
    } else {
      text.style.color = '#ff4d6d';
      text.style.textShadow = '0 0 40px rgba(255,77,109,0.9), 0 0 80px rgba(255,77,109,0.5), 4px 4px 0 rgba(0,0,0,1)';
      SFX.countdownBeep(stepVal);
    }
    text.style.opacity = '0';
    text.style.transform = 'scale(0.5)';
    text.style.transition = 'none';
    
    void text.offsetWidth; // force reflow
    
    text.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    text.style.opacity = '1';
    text.style.transform = 'scale(1)';
    text.classList.add('anim-countdown-pop');
    
    setTimeout(() => {
      text.classList.remove('anim-countdown-pop');
    }, 500);
    
    idx++;
    setTimeout(showNext, 800);
  }
  
  showNext();
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
    
    const xDrift = (Math.random() - 0.5) * 120;
    const yDrift = -60 - Math.random() * 80;
    
    pEl.style.setProperty('--x-drift', `${xDrift}px`);
    pEl.style.setProperty('--y-drift', `${yDrift}px`);
    
    pEl.style.left = '50%';
    pEl.style.top = '20%';
    
    container.appendChild(pEl);
    
    setTimeout(() => pEl.remove(), 1200);
  }
}

elements.btnReturnHub.onclick = () => {
  SFX.btnClick();
  window.location.href = 'game.html';
};

// â”€â”€â”€ GLOBAL BUTTON SFX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Use mousedown (fires immediately on press, no delay vs click)
document.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('button');
  if (!btn || btn.disabled) return;
  if (btn.classList.contains('danger') || btn.id === 'btnFlee') {
    SFX.btnDanger();
  } else {
    SFX.btnClick();
  }
});
// Also handle touch devices
document.addEventListener('touchstart', (e) => {
  const btn = e.target.closest('button');
  if (!btn || btn.disabled) return;
  if (btn.classList.contains('danger') || btn.id === 'btnFlee') {
    SFX.btnDanger();
  } else {
    SFX.btnClick();
  }
}, { passive: true });
// Reward cards (divs, not buttons)
document.addEventListener('mousedown', (e) => {
  const card = e.target.closest('.stone-panel');
  if (card && card.style.cursor === 'pointer') {
    SFX.buffPick();
  }
});

window.onload = () => {
  loadState();
  applyTranslationsToDOM(settings.language);
  updateStatsUI();
  elements.barTimer.style.width = '100%';
  runCountdown(() => {
    nextQuestion();
  });
};

document.addEventListener('click', () => {
  if (typeof SFX !== 'undefined' && run) {
    SFX.playBGM(run.isBoss ? 'Boss Music.mp3' : 'Battle Music.mp3');
  }
}, { once: true });

window.addEventListener('beforeunload', function (e) {
  if (typeof run !== 'undefined' && run && run.active) {
    e.preventDefault();
    e.returnValue = '';
  }
});
