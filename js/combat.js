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
    elements.activeBuffsContainer.innerHTML = run.activeBuffs.map(icon => `<span class="text-[1.1rem] drop-shadow-[1px_1px_0_#000] cursor-help" title="Active Buff">${icon}</span>`).join('');
  }
  if (elements.lblDefense) elements.lblDefense.textContent = run.modifiers.dmgReduction;
  if (elements.lblGoldMod) elements.lblGoldMod.textContent = run.modifiers.goldMult.toFixed(1) + 'x';
  if (elements.lblScoreMod) elements.lblScoreMod.textContent = run.modifiers.scoreMult.toFixed(1) + 'x';
}

function processBossHit(damage, timeRatio) {
  const rankMult = 1 + ((globalStats.playerMMR || 10) / 100);
  run.bossHP = Math.max(0, run.bossHP - damage);
  elements.barBossHp.style.width = `${(run.bossHP / run.bossMaxHP) * 100}%`;

  const hitScore = Math.floor((10 + run.bossStage * 5) * (1 + timeRatio) * run.modifiers.scoreMult * rankMult);
  run.score += hitScore;
  updateStatsUI();
  
  setTimeout(() => {
    if (run.bossHP === 0) {
      run.monstersDefeated = (run.monstersDefeated || 0) + 1;
      showCombatText(getTranslation('modal_reward', settings.language), 'text-emerald-400 text-6xl');
      let rewardGold = Math.floor((50 + run.bossStage * 10) * run.modifiers.goldMult);
      let rewardScore = Math.floor((100 + run.bossStage * 25) * run.modifiers.scoreMult * rankMult);
      
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
      
      updateQuestProgress('bosses', 1);
      updateQuestProgress('gold', rewardGold);
      
      const enemyRect = elements.enemySprite.getBoundingClientRect();
      spawnCoins(Math.ceil(rewardGold), enemyRect.left + enemyRect.width / 2, enemyRect.top + enemyRect.height / 2);
      if (typeof SFX !== 'undefined') SFX.bossDefeated();
      setTimeout(() => { if (typeof SFX !== 'undefined') SFX.coin(); }, 200);
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
        if (typeof SFX !== 'undefined') SFX.crit();
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
  }, 250);
}

function processEnemyDefeat() {
  showCombatText(getTranslation('txt_hit', settings.language), 'text-emerald-400', 'enemy');
    
  let baseGold = getRandomInt(5, 10);
  let baseScore = 15;
  
  let gold = Math.floor(baseGold * (1 + (run.streak * 0.2)) * run.modifiers.goldMult);
  
  if (run.modifiers.gambler) {
    if (Math.random() < 0.5) gold *= 3;
    else gold = 0;
  }
  
  const rankMult = 1 + ((globalStats.playerMMR || 10) / 100);
  let scoreGain = Math.floor(baseScore * (1 + (run.streak * 0.3)) * run.modifiers.scoreMult * rankMult);
  
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
  
  updateQuestProgress('gold', gold);
  run.monstersDefeated = (run.monstersDefeated || 0) + 1;
  
  const enemyRect = elements.enemySprite.getBoundingClientRect();
  spawnCoins(Math.ceil(gold), enemyRect.left + enemyRect.width / 2, enemyRect.top + enemyRect.height / 2);
  if (typeof SFX !== 'undefined') SFX.coin();
  setTimeout(nextQuestion, 1000);
}

function processPlayerDamage(isTimeout, op) {
  updateMMROnWrong(isTimeout);
  
  run.streak = 0;
  updateComboUI();
  const baseDifficulty = 1.0 + (run.questionsAnswered * 0.05);
  
  if (typeof run.difficultyLevel !== 'number' || isNaN(run.difficultyLevel)) run.difficultyLevel = 1.0;
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
