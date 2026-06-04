window.addEventListener('beforeunload', () => {
  saveState();
});

function togglePause() {
  if (elements.runOverModal.classList.contains('show') || elements.rewardModal.classList.contains('show') || document.getElementById('countdownOverlay').style.display === 'flex') return;
  
  if (run.active) {
    run.active = false;
    clearInterval(timerInterval);
    elements.pauseModal.classList.add('show');
    if (typeof SFX !== 'undefined') SFX.btnClick();
  } else if (elements.pauseModal.classList.contains('show')) {
    elements.pauseModal.classList.remove('show');
    run.active = true;
    timerInterval = setInterval(() => {
      if(!run.active) return clearInterval(timerInterval);
      timeLeft -= 0.1;
      updateTimerUI();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        submitAnswer(null, true);
      }
    }, 100);
    if (typeof SFX !== 'undefined') SFX.btnClick();
  }
}

if (elements.btnPause) {
  elements.btnPause.onclick = (e) => {
    e.preventDefault();
    togglePause();
  };
}

if (elements.btnResumePause) {
  elements.btnResumePause.onclick = togglePause;
}

if (elements.btnQuitPause) {
  elements.btnQuitPause.onclick = async () => {
    elements.pauseModal.classList.remove('show');
    if (await showConfirm(getTranslation('txt_confirm_flee', settings.language))) {
      endRun(getTranslation('txt_fled', settings.language));
    } else {
      elements.pauseModal.classList.add('show');
    }
  };
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    togglePause();
  }
});

if (elements.sfxVolumeSlider) {
  elements.sfxVolumeSlider.oninput = (e) => {
    elements.sfxVolumeValue.textContent = e.target.value + '%';
    if (typeof SFX !== 'undefined') {
      settings.sfxVolume = parseInt(e.target.value);
      localStorage.setItem('mathQuestSettings', JSON.stringify(settings));
      SFX.btnClick();
    }
  };
  elements.musicVolumeSlider.oninput = (e) => {
    elements.musicVolumeValue.textContent = e.target.value + '%';
    settings.musicVolume = parseInt(e.target.value);
    localStorage.setItem('mathQuestSettings', JSON.stringify(settings));
    if (typeof SFX !== 'undefined') SFX.updateBGMVolume();
  };
}

elements.btnReturnHub.onclick = () => {
  try { if (typeof SFX !== 'undefined') SFX.btnClick(); } catch(e){}
  window.location.assign('game.html');
};
