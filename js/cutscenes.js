function runCountdown(callback) {
  const overlay = document.getElementById('countdownOverlay');
  const text = document.getElementById('countdownText');
  const header = document.getElementById('gameHeader');
  const footer = document.getElementById('questionFooter');
  const floor = document.getElementById('arenaFloor');
  const playerCont = document.getElementById('playerSpriteContainer');
  const enemyCont = document.getElementById('enemyContainer');
  
  if (!overlay || !text) {
    if (callback) callback();
    return;
  }
  
  if (header) header.classList.add('hud-hidden-top');
  if (footer) footer.classList.add('hud-hidden-bottom');
  if (floor) floor.classList.add('floor-hidden');
  if (playerCont) playerCont.classList.add('char-hidden-left');
  if (enemyCont) enemyCont.classList.add('char-hidden-right');
  
  overlay.style.display = 'flex';
  run.active = false;
  clearInterval(timerInterval);
  
  const lang = (typeof settings !== 'undefined') ? settings.language : 'en';
  const startText = window.getTranslation ? window.getTranslation('txt_start_countdown', lang) : 'START!';
  const countSteps = ['3', '2', '1', startText];
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
    if (idx === 3) {
      text.style.color = '#f5c842';
      text.style.textShadow = '0 0 40px rgba(245,200,66,0.9), 0 0 80px rgba(245,200,66,0.5), 4px 4px 0 rgba(0,0,0,1)';
      if (header) header.classList.remove('hud-hidden-top');
      if (footer) footer.classList.remove('hud-hidden-bottom');
      if (floor) floor.classList.remove('floor-hidden');
      if (playerCont) playerCont.classList.remove('char-hidden-left');
      if (enemyCont) enemyCont.classList.remove('char-hidden-right');
      if (typeof SFX !== 'undefined') SFX.countdownStart();
    } else {
      text.style.color = '#ff4d6d';
      text.style.textShadow = '0 0 40px rgba(255,77,109,0.9), 0 0 80px rgba(255,77,109,0.5), 4px 4px 0 rgba(0,0,0,1)';
      if (typeof SFX !== 'undefined') {
        if (typeof SFX.countdownTick === 'function') SFX.countdownTick();
        else if (typeof SFX.countdownBeep === 'function') SFX.countdownBeep(stepVal);
      }
    }
    
    text.classList.remove('anim-countdown-pop');
    void text.offsetWidth;
    text.classList.add('anim-countdown-pop');
    
    idx++;
    setTimeout(showNext, 1000);
  }
  
  showNext();
}

function startPlayTutorial(callback) {
  const playSteps = [
    { target: '#hudTop', titleKey: 'tut_play_stats', descKey: 'tut_play_stats_desc' },
    { target: '#lblQuestion', titleKey: 'tut_play_question', descKey: 'tut_play_question_desc' },
    { target: '#answerGrid', titleKey: 'tut_play_answers', descKey: 'tut_play_answers_desc' },
    { target: '#btnPause', titleKey: 'tut_play_pause', descKey: 'tut_play_pause_desc' }
  ];
  const tut = new TutorialSystem(playSteps, 'mathQuestTutorialPlay_' + user);
  
  const originalFinish = tut.finish.bind(tut);
  tut.finish = function() {
    originalFinish();
    if (callback) callback();
  };
  
  tut.start();
}

