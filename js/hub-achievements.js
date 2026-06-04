let achievementQueue = [];
let isShowingAchievement = false;

function checkAchievements() {
  if (user === 'Guest') return;
  if (!globalStats.notifiedAchievements) globalStats.notifiedAchievements = [];
  
  let newlyUnlocked = false;
  achievementsData.forEach(ach => {
    if (ach.getProgress() >= ach.target && !globalStats.notifiedAchievements.includes(ach.id)) {
      globalStats.notifiedAchievements.push(ach.id);
      achievementQueue.push(ach);
      newlyUnlocked = true;
    }
  });
  
  if (newlyUnlocked) saveState();
  if (achievementQueue.length > 0 && !isShowingAchievement) {
    showNextAchievement();
  }
}

function showNextAchievement() {
  if (achievementQueue.length === 0) {
    isShowingAchievement = false;
    return;
  }
  
  isShowingAchievement = true;
  const ach = achievementQueue.shift();
  
  const toast = document.createElement('div');
  toast.className = 'achievement-toast show';
  toast.innerHTML = `
    <div class="text-[2rem] mr-3 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">🏆</div>
    <div>
      <div class="font-minecraft text-[0.5rem] text-[#ffd54f] mb-1 drop-shadow-[1px_1px_0_#000]">ACHIEVEMENT UNLOCKED</div>
      <div class="font-[Comic_Neue] text-[1rem] font-bold text-white leading-none">${getTranslation(ach.nameKey, settings.language)}</div>
    </div>
  `;
  document.body.appendChild(toast);
  if (typeof SFX !== 'undefined') SFX.coin();
  
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
      showNextAchievement();
    }, 500);
  }, 4000);
}

function renderAchievements() {
  elements.achievementsList.innerHTML = '';
  achievementsData.forEach(ach => {
    const current = ach.getProgress();
    const isComplete = current >= ach.target;
    const progressPercent = Math.min(100, (current / ach.target) * 100);
    
    const card = document.createElement('div');
    card.className = 'stone-panel';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = 'clamp(8px, 2vw, 16px)';
    card.style.padding = 'clamp(8px, 2vw, 12px)';
    if (!isComplete) card.style.filter = 'grayscale(1) brightness(0.7)';

    card.innerHTML = `
      <div class="text-[clamp(1.5rem,5vw,2.5rem)] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">${isComplete ? '🏆' : '🔒'}</div>
      <div class="flex-1">
        <div class="font-minecraft text-[clamp(0.5rem,2vw,0.7rem)] text-yellow-400 mb-[clamp(4px,1vw,8px)] drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">${getTranslation(ach.nameKey, settings.language)}</div>
        <div class="font-[Comic_Neue] text-[clamp(0.7rem,2.5vw,0.9rem)] text-[#ccc] mb-2">${getTranslation(ach.descKey, settings.language)}</div>
        <div class="w-full h-3 bg-[#263238] rounded-md overflow-hidden border-2 border-[var(--panel-border)]">
          <div class="h-full border-r-2 border-[var(--panel-border)]" style="width:${progressPercent}%; background:${isComplete ? '#4caf50' : '#ffa000'};"></div>
        </div>
      </div>
    `;
    elements.achievementsList.appendChild(card);
  });
}
