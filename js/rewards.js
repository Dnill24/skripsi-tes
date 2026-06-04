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
      <div class="text-[3.5rem] mb-4 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">${buff.icon}</div>
      <div class="font-minecraft text-[0.75rem] text-yellow-400 mb-3 drop-shadow-[1px_1px_0_rgba(0,0,0,1)] text-center">${getTranslation(buff.nameKey, settings.language)}</div>
      <div class="font-[Comic_Neue] text-[1rem] text-[#ccc] text-center leading-[1.2]">${getTranslation(buff.descKey, settings.language)}</div>
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
