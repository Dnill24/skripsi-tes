const elements = {
  btnFlee: document.getElementById('btnFlee'),
  lblRunStage: document.getElementById('lblRunStage'),
  lblScore: document.getElementById('lblScore'),
  lblHealth: document.getElementById('lblHealth'),
  barProgress: document.getElementById('barProgress'),
  bossHpContainer: document.getElementById('bossHpContainer'),
  barBossHp: document.getElementById('barBossHp'),
  barTimer: document.getElementById('barTimer'),
  lblQuestion: document.getElementById('lblQuestion'),
  answerGrid: document.getElementById('answerGrid'),
  playerSprite: document.getElementById('playerSprite'),
  enemySprite: document.getElementById('enemySprite'),
  enemyShadow: document.getElementById('enemyShadow'),
  combatText: document.getElementById('combatText'),
  runOverModal: document.getElementById('runOverModal'),
  runOverMessage: document.getElementById('runOverMessage'),
  finalScore: document.getElementById('finalScore'),
  finalGold: document.getElementById('finalGold'),
  btnReturnHub: document.getElementById('btnReturnHub'),
  recommendationBox: document.getElementById('recommendationBox'),
  recSubject: document.getElementById('recSubject'),
  btnPracticeRec: document.getElementById('btnPracticeRec'),
  lblCombo: document.getElementById('lblCombo'),
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
let globalStats = { '+': 0, '-': 0, '*': 0, '/': 0, fastestTime: 999, bossRushBosses: 0, glassCannonBosses: 0, comboGod: 0 };

let gameMode = localStorage.getItem('mathQuestMode') || 'normal';
let settings = { volume: 50, language: 'en' };

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
  }
};

const skinEmojis = {
  'rainbow': '🧍', 'peasant': '👦', 'adventurer': '🎒', 'stone': '🗿',
  'knight': '🛡️', 'mage': '🧙', 'glow': '⚡', 'ninja': '🥷', 'robot': '🤖',
  'gold': '👑', 'diamond': '💎', 'fire': '🔥', 'ice': '❄️', 'phantom': '👻',
  'alien': '👽', 'demon': '👹', 'angel': '👼', 'dragon': '🐉', 'void': '🌌',
  'celestial': '🌟', 'god': '♾️'
};

const bossEmojis = ['🐉', '🧟', '🧛', '👹', '👽', '💀', '🤡', '🤖', '🦖', '🦍', '👁️', '🎃'];
const enemyEmojis = ['👾', '👻', '🦇', '🕷️', '🐍'];

const buffPool = [
  { id: 'heal', nameKey: 'buff_heal_name', descKey: 'buff_heal_desc', icon: '❤️', apply: () => { run.health = Math.min(Number(run.maxHealth), Number(run.health) + 50); } },
  { id: 'vitality', nameKey: 'buff_vit_name', descKey: 'buff_vit_desc', icon: '💪', apply: () => { run.maxHealth = Number(run.maxHealth) + 25; run.health = Number(run.health) + 25; } },
  { id: 'time', nameKey: 'buff_time_name', descKey: 'buff_time_desc', icon: '⏳', apply: () => { MAX_TIME += 2; } },
  { id: 'greed', nameKey: 'buff_gre_name', descKey: 'buff_greed_desc', icon: '💰', apply: () => { run.modifiers.goldMult += 0.5; } },
  { id: 'scholar', nameKey: 'buff_scholar_name', descKey: 'buff_scholar_desc', icon: '📚', apply: () => { run.modifiers.scoreMult += 0.5; } },
  { id: 'defense', nameKey: 'buff_def_name', descKey: 'buff_def_desc', icon: '🛡️', apply: () => { run.modifiers.dmgReduction += 3; } },
  { id: 'bossrush', nameKey: 'buff_boss_name', descKey: 'buff_boss_desc', icon: '💀', apply: () => { run.modifiers.bossRush = true; run.modifiers.goldMult += 2.0; run.modifiers.scoreMult += 2.0; } },
  { id: 'glasscannon', nameKey: 'buff_glass_name', descKey: 'buff_glass_desc', icon: '🧨', apply: () => { run.modifiers.glassCannon = true; run.maxHealth = 1; run.health = 1; run.modifiers.goldMult += 2.0; run.modifiers.scoreMult += 2.0; } },
  { id: 'vampirism', nameKey: 'buff_vamp_name', descKey: 'buff_vamp_desc', icon: '🦇', apply: () => { run.modifiers.vampirism = true; } },
  { id: 'gambler', nameKey: 'buff_gambler_name', descKey: 'buff_gambler_desc', icon: '🎲', apply: () => { run.modifiers.gambler = true; } },
  { id: 'ninelives', nameKey: 'buff_nine_name', descKey: 'buff_nine_desc', icon: '🐱', apply: () => { run.modifiers.nineLives = true; } },
  { id: 'timewarp', nameKey: 'buff_warp_name', descKey: 'buff_warp_desc', icon: '⏱️', apply: () => { run.modifiers.timeMult = (run.modifiers.timeMult || 1.0) * 0.33; run.modifiers.scoreMult += 2.0; } },
  { id: 'midas', nameKey: 'buff_midas_name', descKey: 'buff_midas_desc', icon: '✨', apply: () => { run.modifiers.goldMult += 4.0; run.modifiers.enemyDamageMult = (run.modifiers.enemyDamageMult || 1) * 2; } },
  { id: 'slowmo', nameKey: 'buff_slowmo_name', descKey: 'buff_slowmo_desc', icon: '🐌', apply: () => { run.modifiers.timeMult = (run.modifiers.timeMult || 1.0) * 2.0; run.modifiers.scoreMult *= 0.5; } },
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
      globalStats = parsed.globalStats || { '+': 0, '-': 0, '*': 0, '/': 0, fastestTime: 999, bossRushBosses: 0, glassCannonBosses: 0, comboGod: 0 };
    } catch(e){}
  }
  
  const savedSettings = localStorage.getItem('mathQuestSettings');
  if (savedSettings) {
    try { settings = { ...settings, ...JSON.parse(savedSettings) }; } catch(e){}
  }
  elements.playerSprite.textContent = skinEmojis[selectedSkin] || '🧍';
}

function saveState() {
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
    elements.barTimer.className = 'bg-emerald-400 h-2 transition-all duration-100 ease-linear';
  } else if (percent > 20) {
    elements.barTimer.className = 'bg-yellow-400 h-2 transition-all duration-100 ease-linear';
  } else {
    elements.barTimer.className = 'bg-red-500 h-2 transition-all duration-100 ease-linear animate-pulse';
  }
}

function showCombatText(text, colorClass) {
  elements.combatText.textContent = text;
  elements.combatText.className = `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-minecraft font-bold opacity-100 transition-opacity duration-300 drop-shadow-lg text-center z-20 ${colorClass}`;
  
  if (colorClass.includes('red')) {
    elements.playerSprite.parentElement.classList.add('shake');
    setTimeout(() => elements.playerSprite.parentElement.classList.remove('shake'), 500);
  } else {
    elements.enemySprite.parentElement.classList.add('shake');
    setTimeout(() => elements.enemySprite.parentElement.classList.remove('shake'), 500);
  }

  setTimeout(() => {
    elements.combatText.style.opacity = '0';
  }, 1000);
}

function updateComboUI() {
  if (run.streak > 1) {
    elements.lblCombo.textContent = `${run.streak}${getTranslation('txt_combo', settings.language)}`;
    elements.lblCombo.classList.remove('hidden');
    elements.lblCombo.classList.remove('scale-110');
    // trigger reflow for animation
    void elements.lblCombo.offsetWidth;
    elements.lblCombo.classList.add('scale-110');
    setTimeout(() => elements.lblCombo.classList.remove('scale-110'), 200);
  } else {
    elements.lblCombo.classList.add('hidden');
  }
}

function updateStatsUI() {
  elements.lblDefense.textContent = run.modifiers.dmgReduction;
  elements.lblGoldMod.textContent = run.modifiers.goldMult.toFixed(1) + 'x';
  elements.lblScoreMod.textContent = run.modifiers.scoreMult.toFixed(1) + 'x';
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
    card.className = 'bg-slate-800/80 border border-slate-700 hover:border-yellow-400 p-6 rounded-xl cursor-pointer transition-all hover:scale-105';
    card.innerHTML = `
      <div class="text-5xl mb-4">${buff.icon}</div>
      <h3 class="text-xl font-bold text-white mb-2">${getTranslation(buff.nameKey, settings.language)}</h3>
      <p class="text-sm text-slate-400">${getTranslation(buff.descKey, settings.language)}</p>
    `;
    card.onclick = () => {
      buff.apply();
      if (run.modifiers.glassCannon) {
        run.maxHealth = 1;
        run.health = 1;
      }
      elements.lblHealth.textContent = `${run.health}/${run.maxHealth}`;
      updateStatsUI();
      elements.rewardModal.classList.add('hidden');
      run.active = true;
      nextQuestion();
    };
    elements.rewardCardsContainer.appendChild(card);
  });
  
  elements.rewardModal.classList.remove('hidden');
}

function nextQuestion() {
  if (!run.active) return;
  
  const nextQ = run.questionsAnswered + 1;
  const progressPercent = ((nextQ - 1) % 10) / 9 * 100;
  elements.barProgress.style.width = `${progressPercent}%`;

  if (!run.isBoss && (nextQ % 10 === 0 || run.modifiers.bossRush)) {
    run.isBoss = true;
    run.bossesEncountered = (run.bossesEncountered || 0) + 1;
    run.bossStage = run.modifiers.bossRush ? nextQ : (nextQ / 10);
    run.bossMaxHP = 100 * run.bossStage;
    run.bossHP = run.bossMaxHP;
    
    elements.bossHpContainer.classList.remove('hidden');
    elements.barBossHp.style.width = '100%';
    elements.enemySprite.textContent = bossEmojis[(run.bossesEncountered - 1) % bossEmojis.length];
    
    elements.enemySprite.parentElement.classList.add('animate-float');
    elements.enemySprite.className = 'text-8xl drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] transition-all duration-500 transform scale-110';
    elements.enemyShadow.className = 'w-32 h-6 bg-black/50 rounded-[50%] mt-6 blur-md transition-all duration-500';
  } else if (!run.isBoss) {
    elements.bossHpContainer.classList.add('hidden');
    elements.enemySprite.textContent = enemyEmojis[getRandomInt(0, enemyEmojis.length - 1)];
    
    elements.enemySprite.parentElement.classList.remove('animate-float');
    elements.enemySprite.className = 'text-6xl drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-all duration-500 transform';
    elements.enemyShadow.className = 'w-16 h-3 bg-black/40 rounded-[50%] mt-3 blur-sm transition-all duration-500';
  }

  run.currentQuestion = createQuestion(run.isBoss ? 'boss' : 'enemy');
  renderQuestion();
  startTimer();
}

function createQuestion(type) {
  let ops = ['+', '-', '*', '/'];
  if (gameMode !== 'normal') {
    ops = [gameMode];
  }

  const op = ops[getRandomInt(0, ops.length - 1)];
  const diffMultiplier = run.difficultyLevel;
  
  let a, b, answer;

  if (op === '+') {
    a = getRandomInt(10, Math.floor(20 * diffMultiplier));
    b = getRandomInt(5, Math.floor(15 * diffMultiplier));
    answer = a + b;
  } else if (op === '-') {
    a = getRandomInt(10, Math.floor(25 * diffMultiplier));
    b = getRandomInt(5, Math.min(a, Math.floor(15 * diffMultiplier)));
    answer = a - b;
  } else if (op === '*') {
    a = getRandomInt(2, Math.floor(8 + (diffMultiplier * 2)));
    b = getRandomInt(2, Math.floor(8 + (diffMultiplier * 2)));
    answer = a * b;
  } else if (op === '/') {
    answer = getRandomInt(2, Math.floor(8 + (diffMultiplier * 2)));
    b = getRandomInt(2, Math.floor(8 + (diffMultiplier * 2)));
    a = answer * b;
  }

  const options = [answer];
  while (options.length < 4) {
    const wrong = answer + (Math.random() < 0.5 ? 1 : -1) * getRandomInt(1, Math.floor(10 * diffMultiplier));
    if (!options.includes(wrong) && wrong >= 0 && wrong !== answer) options.push(wrong);
  }

  return { text: `${a} ${op} ${b}`, answers: shuffleArray(options), correct: answer, operator: op };
}

function renderQuestion() {
  elements.lblQuestion.textContent = run.currentQuestion.text;
  elements.lblRunStage.textContent = Math.floor(run.questionsAnswered / 10) + 1;
  elements.lblScore.textContent = Math.floor(run.score);
  elements.lblHealth.textContent = `${run.health}/${run.maxHealth}`;

  elements.answerGrid.innerHTML = '';
  run.currentQuestion.answers.forEach(ans => {
    const btn = document.createElement('button');
    btn.className = 'button-primary text-2xl py-4 md:py-6';
    btn.textContent = ans;
    btn.onclick = () => submitAnswer(ans, false);
    elements.answerGrid.appendChild(btn);
  });
}

function submitAnswer(ans, isTimeout) {
  if (!run.active) return;
  clearInterval(timerInterval);
  
  run.questionsAnswered++;
  totalQuestionsAnswered++;
  
  const op = run.currentQuestion.operator;
  run.stats[op].total++;

  const correct = !isTimeout && ans === run.currentQuestion.correct;
  
  const btns = elements.answerGrid.querySelectorAll('button');
  btns.forEach(b => {
    b.disabled = true;
    if (parseInt(b.textContent) === run.currentQuestion.correct) b.style.background = '#10b981';
    else if (!correct && !isTimeout && parseInt(b.textContent) === ans) b.style.background = '#ef4444';
  });

  if (correct) {
    const timeTaken = currentMaxTime - timeLeft;
    if (timeTaken < globalStats.fastestTime) globalStats.fastestTime = timeTaken;
    
    if (run.modifiers.vampirism) {
      run.health = Math.min(Number(run.maxHealth), Number(run.health) + 2);
    }
    
    run.streak++;
    if (run.streak > globalStats.comboGod) globalStats.comboGod = run.streak;
    updateComboUI();
    run.difficultyLevel += 0.2;
    run.stats[op].correct++;
    globalStats[op]++;

    if (run.isBoss) {
      const timeTaken = currentMaxTime - timeLeft;
      const timeRatio = Math.max(0, 1 - (timeTaken / MAX_TIME));
      const baseDmg = getRandomInt(15, 25);
      const timeMultiplier = 1 + (timeRatio * 2); 
      const damage = Math.floor(baseDmg * timeMultiplier);
      
      run.bossHP = Math.max(0, run.bossHP - damage);
      elements.barBossHp.style.width = `${(run.bossHP / run.bossMaxHP) * 100}%`;
      
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
        run.isBoss = false;
        
        setTimeout(showRewardModal, 1500);
      } else {
        if (timeRatio > 0.7) {
          showCombatText(`${getTranslation('txt_crit', settings.language)} -${damage} HP!`, 'text-yellow-300');
        } else {
          showCombatText(`-${damage} HP!`, 'text-orange-400');
        }
        setTimeout(() => {
          run.currentQuestion = createQuestion('boss');
          renderQuestion();
          startTimer();
        }, 1200);
      }
    } else {
      showCombatText(getTranslation('txt_hit', settings.language), 'text-emerald-400');
      
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
      setTimeout(nextQuestion, 1000);
    }
  } else {
    run.streak = 0;
    updateComboUI();
    const baseDifficulty = 1.0 + (run.questionsAnswered * 0.05);
    run.difficultyLevel = Math.max(baseDifficulty, run.difficultyLevel - 0.5);
    
    let baseDamage = 0;
    if (run.isBoss) {
      baseDamage = Math.floor(20 + (run.bossStage * 10));
    } else {
      baseDamage = Math.floor(10 + (run.questionsAnswered * 0.5));
    }
    
    const damageMult = run.modifiers.enemyDamageMult || 1;
    let damage = Math.floor(baseDamage * damageMult) - run.modifiers.dmgReduction;
    if (damage < 1) damage = 1;
    
    run.health = Math.max(0, run.health - damage);
    elements.lblHealth.textContent = `${run.health}/${run.maxHealth}`;
    
    if (isTimeout) {
      showCombatText(`${getTranslation('txt_timeout', settings.language)} -${damage} HP`, 'text-red-500');
    } else {
      showCombatText(`${getTranslation('txt_miss', settings.language)} -${damage} HP`, 'text-red-400');
    }
    
    if (run.health === 0) {
      if (run.modifiers.nineLives) {
        run.modifiers.nineLives = false;
        run.health = 50;
        showCombatText(getTranslation('txt_nine_lives', settings.language), 'text-blue-400 text-5xl');
        elements.lblHealth.textContent = `${run.health}/${run.maxHealth}`;
        if (run.isBoss) {
          setTimeout(() => {
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
          run.currentQuestion = createQuestion('boss');
          renderQuestion();
          startTimer();
        }, 1200);
      } else {
        setTimeout(nextQuestion, 1000);
      }
    }
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
      if (stored) leaderboard = JSON.parse(stored);
    } catch(e) {}
    
    leaderboard.push({
      name: user,
      score: Math.floor(run.score),
      date: new Date().toLocaleDateString()
    });
    
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 100);
    
    localStorage.setItem('mathQuestLeaderboard', JSON.stringify(leaderboard));
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

  elements.runOverModal.classList.remove('hidden');
}

elements.btnFlee.onclick = () => {
  if (confirm(getTranslation('txt_confirm_flee', settings.language))) {
    endRun(getTranslation('txt_fled', settings.language));
  }
};

elements.btnReturnHub.onclick = () => {
  window.location.href = 'game.html';
};

window.onload = () => {
  loadState();
  applyTranslationsToDOM(settings.language);
  updateStatsUI();
  nextQuestion();
};
