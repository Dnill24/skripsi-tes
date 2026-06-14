// js/versus-logic.js

window.playerHP = 100;
window.opponentHP = 100;
window.combo = 0;
window.opponentCombo = 0;

window.currentQuestion = null;
window.timerInterval = null;
const MAX_TIME = 15;
window.timeLeft = MAX_TIME;
window.gameActive = false;
window.myRematchReady = false;
window.opponentRematchReady = false;

window.startGame = function() {
  window.playerHP = 100;
  window.opponentHP = 100;
  window.combo = 0;
  window.opponentCombo = 0;
  window.gameActive = true;
  
  elements.lblHealth.textContent = '100/100';
  elements.barPlayerHp.style.width = '100%';
  elements.lblOpponentHp.textContent = '100/100';
  elements.barOpponentHp.style.width = '100%';
  elements.lblCombo.classList.add('hidden');
  elements.opponentCombo.classList.add('hidden');
  elements.endMatchModal.classList.remove('show');
  
  window.myRematchReady = false;
  window.opponentRematchReady = false;
  elements.btnPlayAgain.textContent = getTranslation('btn_rematch', settings.language);
  elements.btnPlayAgain.disabled = false;
  elements.btnPlayAgain.classList.remove('opacity-50');
  elements.rematchStatus.classList.add('hidden');
  
  if (window.broadcastUpdate) window.broadcastUpdate();
  elements.barTimer.style.width = '100%';
  runCountdown(() => {
    window.gameActive = true;
    window.nextQuestion();
  });
};

window.startTimer = function() {
  clearInterval(window.timerInterval);
  window.timeLeft = MAX_TIME;
  
  window.timerInterval = setInterval(() => {
    if (!window.gameActive) return clearInterval(window.timerInterval);
    window.timeLeft -= 0.1;
    const percentage = (window.timeLeft / MAX_TIME) * 100;
    elements.barTimer.style.width = `${percentage}%`;
    
    if (percentage <= 20) elements.barTimer.className = 'h-full bg-red-500 w-full transition-all duration-100 linear';
    else elements.barTimer.className = 'h-full bg-cyan-400 w-full transition-all duration-100 linear';
    
    if (window.timeLeft <= 0) {
      clearInterval(window.timerInterval);
      window.combo = 0;
      updateComboUI();
      window.takeDamage(6); // Scaled from 10
      if (typeof showCombatText !== 'undefined') showCombatText(getTranslation('txt_timeout', settings.language).toUpperCase(), "text-red-500");
      setTimeout(window.nextQuestion, 500); // Fast paced
    }
  }, 100);
};

window.nextQuestion = function() {
  if (!window.gameActive) return;
  // Use createQuestion from question.js
  window.currentQuestion = typeof createQuestion !== 'undefined' ? createQuestion('any') : { text: '2 + 2', answers: [1,2,3,4], correct: 4 };
  window.renderVersusQuestion();
  window.startTimer();
};

window.renderVersusQuestion = function() {
  elements.lblQuestion.textContent = window.currentQuestion.text.replaceAll('*', '×').replaceAll('/', '÷');
  elements.answerGrid.innerHTML = '';
  
  window.currentQuestion.answers.forEach(opt => {
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
    btn.onmousedown = () => { 
      btn.style.transform = 'translateY(4px)'; 
      btn.style.boxShadow = 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2), 0 0 0 #4e342e'; 
    };
    btn.onclick = () => window.handleAnswer(opt);
    elements.answerGrid.appendChild(btn);
  });
};

window.takeDamage = function(amt) {
  if (!window.gameActive) return;
  if (typeof SFX !== 'undefined') SFX.playerHurt();
  window.playerHP = Math.max(0, window.playerHP - amt);
  elements.lblHealth.textContent = `${window.playerHP}/100`;
  elements.barPlayerHp.style.width = `${window.playerHP}%`;
  
  if (elements.playerSprite) {
    elements.playerSprite.classList.add('anim-hit-flash');
    setTimeout(() => elements.playerSprite.classList.remove('anim-hit-flash'), 500);
  }
  
  if (window.broadcastUpdate) window.broadcastUpdate();
  
  if (elements.battleArena) {
    elements.battleArena.classList.add('shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]', 'anim-arena-shake');
    setTimeout(() => elements.battleArena.classList.remove('shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]', 'anim-arena-shake'), 300);
  }
  
  if (window.playerHP <= 0) {
    window.conn.send({ type: 'gameover' });
    window.endGame(getTranslation('txt_you_lose', settings.language), false);
  }
};

window.handleAnswer = function(selected) {
  if (!window.gameActive) return;
  clearInterval(window.timerInterval);
  
  Array.from(elements.answerGrid.children).forEach(b => b.disabled = true);
  
  const correct = selected === window.currentQuestion.correct;
  
  Array.from(elements.answerGrid.children).forEach(b => {
    const btnVal = parseInt(b.querySelector('span') ? b.querySelector('span').textContent : b.textContent);
    if (btnVal === window.currentQuestion.correct) {
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
  
  if (correct) {
    if (typeof SFX !== 'undefined') SFX.correct();
    window.combo++;
    updateComboUI();
    
    // Scale healing: 5 / 1.5 = ~3
    window.playerHP = Math.min(100, window.playerHP + 3);
    elements.lblHealth.textContent = `${window.playerHP}/100`;
    elements.barPlayerHp.style.width = `${window.playerHP}%`;
    
    // Scale damage: (10 + combo * 2) / 1.5
    let dmg = Math.floor((10 + window.combo * 2) / 1.5);
    window.conn.send({ type: 'attack', damage: dmg });
    
    if (typeof triggerPlayerAttack !== 'undefined') triggerPlayerAttack();
    
    setTimeout(() => {
       if (typeof showCombatText !== 'undefined') showCombatText(getTranslation('txt_hit', settings.language).toUpperCase(), "text-emerald-400");
      showOpponentDamage(dmg);
    }, 250);
    
    if (window.broadcastUpdate) window.broadcastUpdate();
    setTimeout(window.nextQuestion, 400); // Fast paced (400ms instead of 800ms)
  } else {
    if (typeof SFX !== 'undefined') SFX.wrong();
    window.combo = 0;
    updateComboUI();
 if (typeof showCombatText !== 'undefined') showCombatText(getTranslation('txt_miss', settings.language).toUpperCase(), "text-red-400");
    window.takeDamage(6); // scaled down from 10
    setTimeout(window.nextQuestion, 500); // Fast paced
  }
};

window.endGame = function(title, isWin) {
  window.gameActive = false;
  clearInterval(window.timerInterval);
  if (typeof SFX !== 'undefined') {
    if (isWin) SFX.bossDefeated();
    else SFX.runOver();
  }
  elements.endMatchModal.classList.add('show');
  elements.endTitle.textContent = title;
  elements.endTitle.className = isWin ? 'text-4xl font-minecraft mb-6 drop-shadow-[3px_3px_0_rgba(0,0,0,1)] text-emerald-400' : 'text-4xl font-minecraft mb-6 drop-shadow-[3px_3px_0_rgba(0,0,0,1)] text-red-500';
  elements.endMessage.textContent = isWin ? getTranslation('txt_versus_win_msg', settings.language) : getTranslation('txt_versus_lose_msg', settings.language);
};
