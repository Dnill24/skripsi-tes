let bgPositionX = 0;

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
    if (Math.round(timeLeft * 10) % 10 === 0 && typeof SFX !== 'undefined') SFX.timerTick();
  }
}

function getCampaignLevelConfig(level) {
  const configs = {
    1: { total: 5, bossesAt: [5] },
    2: { total: 10, bossesAt: [10] },
    3: { total: 15, bossesAt: [5, 15] },
    4: { total: 20, bossesAt: [5, 15, 20] }
  };
  if (configs[level]) return configs[level];
  const total = 25 + (level - 5) * 5;
  const bossesAt = [];
  for (let i = 5; i <= total; i += 5) {
    bossesAt.push(i);
  }
  return { total, bossesAt };
}

function showLevelCompleteModal() {
  run.active = false;
  clearInterval(timerInterval);
  
  if (gameLevel >= (globalStats.highestLevelUnlocked || 1) && gameLevel < 10) {
    globalStats.highestLevelUnlocked = gameLevel + 1;
  }
  
  let rewardGold = gameLevel * 100;
  run.goldEarned += rewardGold;
  currency += rewardGold;
  totalGoldEarned += rewardGold;
  
  saveState();
  
  elements.runOverModal.querySelector('h2').textContent = getTranslation('lbl_level_complete', settings.language) || "Level Complete!";
  elements.runOverMessage.innerHTML = `<span class="text-yellow-400 text-2xl font-bold">+${rewardGold} Bonus Gold!</span>`;
  
  elements.finalScore.textContent = Math.floor(run.score);
  elements.finalGold.textContent = run.goldEarned;
  
  let totalCorrect = 0;
  let totalWrong = 0;
  for (const op in run.stats) {
    totalCorrect += run.stats[op].correct || 0;
    totalWrong += run.stats[op].incorrect || 0;
  }
  elements.finalStages.textContent = run.monstersDefeated || 0;
  elements.finalCorrect.textContent = totalCorrect;
  elements.finalWrong.textContent = totalWrong;
  elements.finalCombo.textContent = run.questionsAnswered;
  elements.recommendationBox.classList.add('hidden');
  
  elements.runOverModal.classList.add('show');
  if (typeof SFX !== 'undefined') SFX.buffPick();
}

function nextQuestion() {
  if (elements.runOverModal.classList.contains('show')) return;
  run.active = true;
  
  bgPositionX -= 20;
  document.body.style.backgroundPositionX = `${bgPositionX}%`;
  
  const nextQ = (run.monstersDefeated || 0) + 1;
  let isBossTrigger = false;
  let isFinalBoss = false;
  let progressPercent = 0;

  if (gameMode === 'campaign') {
    const config = getCampaignLevelConfig(gameLevel);
    isBossTrigger = config.bossesAt.includes(nextQ) || run.modifiers.bossRush;
    isFinalBoss = (nextQ === config.total);
    progressPercent = ((nextQ - 1) / config.total) * 100;
  } else {
    isBossTrigger = (nextQ % 8 === 0) || run.modifiers.bossRush;
    progressPercent = ((nextQ - 1) % 8) / 7 * 100;
  }

  elements.barProgress.style.width = `${progressPercent}%`;

  if (!run.isBoss && isBossTrigger) {
    run.isBoss = true;
    run.isFinalBoss = isFinalBoss;
    run.bossesEncountered = (run.bossesEncountered || 0) + 1;
    run.bossStage = run.modifiers.bossRush ? nextQ : (gameMode === 'campaign' ? run.bossesEncountered : (nextQ / 8));
    run.bossMaxHP = 100 * run.bossStage;
    run.bossHP = run.bossMaxHP;
    
    elements.bossHpContainer.classList.remove('hidden');
    if (elements.lblBossHp) {
      elements.lblBossHp.textContent = `${run.bossHP}/${run.bossMaxHP}`;
    }
    elements.enemySprite.textContent = bossEmojis[(run.bossesEncountered - 1) % bossEmojis.length];
    
    elements.enemySprite.parentElement.classList.add('animate-float');
    elements.enemySprite.style.fontSize = 'clamp(6rem,19.5vw,9rem)';
    elements.enemySprite.style.filter = 'drop-shadow(0 0 30px rgba(239,68,68,0.8))';
    elements.enemySprite.style.transform = 'scale(1.1)';
    if (typeof SFX !== 'undefined') SFX.playBGM('Boss Music.mp3');
  } else if (!run.isBoss) {
    elements.bossHpContainer.classList.add('hidden');
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
    if (typeof SFX !== 'undefined') SFX.correct();
    
    const timeRatio = Math.max(0, 1 - (timeTaken / MAX_TIME));
    updateMMROnCorrect(timeRatio, run.isBoss);
    
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
    
    if (typeof run.difficultyLevel !== 'number' || isNaN(run.difficultyLevel)) run.difficultyLevel = 1.0;
    run.difficultyLevel += 0.1;
    
    run.stats[op].correct++;
    globalStats[op]++;
    updateQuestProgress('questions', 1);
    updateQuestProgress('combo', run.streak, true);
    
    triggerPlayerAttack();

    if (run.isBoss) {
      processBossHit(damage, timeRatio);
    } else {
      processEnemyDefeat();
    }
  } else {
    if (typeof SFX !== 'undefined') SFX.wrong();
    processPlayerDamage(isTimeout, op);
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
  updateQuestProgress('runs', 1);
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
  
  let totalCorrect = 0;
  let totalWrong = 0;
  for (const op in run.stats) {
    totalCorrect += run.stats[op].correct || 0;
    totalWrong += run.stats[op].incorrect || 0;
  }
  elements.finalStages.textContent = run.monstersDefeated || 0;
  elements.finalCorrect.textContent = totalCorrect;
  elements.finalWrong.textContent = totalWrong;
  elements.finalCombo.textContent = run.questionsAnswered;

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
  if (typeof SFX !== 'undefined') SFX.runOver();
}

function initGame() {
  loadState();
  
  // Firebase drops empty arrays, so we must restore them if missing
  if (run) {
    if (!run.activeBuffs) run.activeBuffs = [];
    if (!run.modifiers) run.modifiers = {};
    if (run.modifiers.scoreMult === undefined) run.modifiers.scoreMult = 1.0;
    if (run.modifiers.goldMult === undefined) run.modifiers.goldMult = 1.0;
  }
  
  updateStatsUI();
  
  if (!run.active) {
    run = {
      active: true,
      health: 100,
      maxHealth: 100,
      score: 0,
      questionsAnswered: 0,
      bossesEncountered: 0,
      bossStage: 0,
      bossHP: 0,
      bossMaxHP: 0,
      isBoss: false,
      monstersDefeated: 0,
      streak: 0,
      currency: 0,
      goldEarned: 0,
      difficultyLevel: 1.0,
      stats: {
        '+': { nameKey: 'stat_add', correct: 0, incorrect: 0, total: 0 },
        '-': { nameKey: 'stat_sub', correct: 0, incorrect: 0, total: 0 },
        '*': { nameKey: 'stat_mul', correct: 0, incorrect: 0, total: 0 },
        '/': { nameKey: 'stat_div', correct: 0, incorrect: 0, total: 0 }
      },
      activeBuffs: [],
      modifiers: {
        enemyHealthMult: 1,
        damageMult: 1,
        scoreMult: 1,
        goldMult: 1,
        bossRush: false,
        glassCannon: false,
        vampirism: false,
        gambler: false,
        berserk: false
      },
      currentQuestion: null
    };
  }

  runCountdown(() => {
    if (!run.currentQuestion) {
      run.currentQuestion = createQuestion(run.isBoss ? 'boss' : 'enemy');
    }
    renderQuestion();

    const finishInit = () => {
      startTimer();
      
      if (run.isBoss) {
        elements.bossHpContainer.classList.remove('hidden');
        elements.barBossHp.style.width = `${(run.bossHP / run.bossMaxHP) * 100}%`;
        elements.enemySprite.textContent = bossEmojis[(run.bossesEncountered - 1) % bossEmojis.length];
        elements.enemySprite.classList.add('anim-boss-idle');
      } else {
        elements.bossHpContainer.classList.add('hidden');
        const enemies = ['👾', '👻', '💀', '👽', '🕷️', '🦇'];
        elements.enemySprite.textContent = enemies[Math.floor(Math.random() * enemies.length)];
        elements.enemySprite.classList.add('anim-idle');
      }
    };

    const isGuest = (user === 'Guest');
    const isNew = (totalRuns === 0);
    if ((isGuest || isNew) && !localStorage.getItem('mathQuestTutorialPlay_' + user)) {
      setTimeout(() => {
        startPlayTutorial(finishInit);
      }, 100);
    } else {
      finishInit();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initGame();
  if (typeof applyTranslationsToDOM === 'function') applyTranslationsToDOM(settings.language || 'en');
});
