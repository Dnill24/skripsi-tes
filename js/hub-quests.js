function generateQuests() {
  const templates = [
    { type: 'bosses', target: 3, reward: 200, text: 'Defeat 3 Bosses' },
    { type: 'questions', target: 50, reward: 150, text: 'Answer 50 Questions' },
    { type: 'runs', target: 3, reward: 100, text: 'Play 3 Runs' },
    { type: 'combo', target: 20, reward: 100, text: 'Reach 20x Combo' },
    { type: 'gold', target: 500, reward: 250, text: 'Collect 500 Gold' }
  ];
  const selected = shuffleArray([...templates]).slice(0, 3);
  dailyQuests.quests = selected.map(q => ({ ...q, progress: 0, completed: false, claimed: false }));
  dailyQuests.lastReset = new Date().toDateString();
}

function renderQuests() {
  if (!elements.questsList) return;
  elements.questsList.innerHTML = '';
  
  if (!dailyQuests || !Array.isArray(dailyQuests.quests)) return;

  const lang = (typeof settings !== 'undefined' && settings.language) ? settings.language : 'en';

  dailyQuests.quests.forEach((q, idx) => {
    const isComplete = q.progress >= q.target;
    
    const card = document.createElement('div');
    card.className = 'stone-panel';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.flexWrap = 'wrap';
    card.style.gap = '8px';
    card.style.padding = '8px';
    
    let btnHtml = '';
    if (q.claimed) {
      btnHtml = `<button class="wood-btn success px-2 py-1 text-[0.5rem]" disabled>${getTranslation('btn_claimed', lang)}</button>`;
      card.style.opacity = '0.7';
    } else if (isComplete) {
      btnHtml = `<button class="wood-btn success px-2 py-1 text-[0.5rem]" id="btnClaimQuest_${idx}">${getTranslation('btn_claim', lang)} 🪙 ${q.reward}</button>`;
    } else {
      btnHtml = `<button class="wood-btn opacity-50 grayscale px-2 py-1 text-[0.5rem]" disabled>🪙 ${q.reward}</button>`;
    }
    
    let translatedText = getTranslation('quest_' + q.type, lang);
    if (!translatedText || translatedText === ('quest_' + q.type)) translatedText = q.text;

    card.innerHTML = `
      <div class="flex-1 min-w-[140px] break-words">
        <div class="font-minecraft text-[0.5rem] text-yellow-400 mb-1 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">${getTranslation('txt_bounty', lang)}</div>
        <div class="font-[Comic_Neue] text-[0.8rem] text-[#ccc] mb-1">${translatedText}</div>
        <div class="w-full h-3 bg-[#263238] rounded-md overflow-hidden border-2 border-[var(--panel-border)] mb-1">
          <div class="h-full border-r-2 border-[var(--panel-border)]" style="width:${Math.min(100, (q.progress / q.target) * 100)}%; background:${isComplete ? '#4caf50' : '#ffa000'};"></div>
        </div>
        <div class="font-minecraft text-[0.4rem] text-[#aaa]">${Math.min(q.progress, q.target)} / ${q.target}</div>
      </div>
      <div>
        ${btnHtml}
      </div>
    `;
    elements.questsList.appendChild(card);
    
    if (isComplete && !q.claimed) {
      const btn = card.querySelector(`#btnClaimQuest_${idx}`);
      btn.onclick = () => {
        currency += q.reward;
        q.claimed = true;
        if (typeof SFX !== 'undefined') SFX.purchase();
        saveState();
        updateUI();
      };
    }
  });
}

function updateQuestTimer() {
  const timerEl = document.getElementById('dailyQuestTimer');
  if (!timerEl) return;
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0); // Next midnight
  const diff = tomorrow - now;
  
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  
  const lang = (typeof settings !== 'undefined' && settings.language) ? settings.language : 'en';
  timerEl.textContent = `${getTranslation('txt_resets_in', lang)}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  
  if (dailyQuests.lastReset !== now.toDateString()) {
    generateQuests();
    saveState();
    updateUI();
  }
}

setInterval(updateQuestTimer, 1000);
