const elements = {
  playerNameDisplay: document.getElementById('playerNameDisplay'),
  shopGoldDisplay: document.getElementById('shopGoldDisplay'),
  btnStartRun: document.getElementById('btnStartRun'),
  btnShop: document.getElementById('btnShop'),
  btnAchievements: document.getElementById('btnAchievements'),
  btnSettings: document.getElementById('btnSettings'),
  btnBackToTitle: document.getElementById('btnBackToTitle'),
  
  shopModal: document.getElementById('shopModal'),
  closeShopModal: document.getElementById('closeShopModal'),
  xCloseShop: document.getElementById('xCloseShop'),
  achievementsModal: document.getElementById('achievementsModal'),
  closeAchievementsModal: document.getElementById('closeAchievementsModal'),
  xCloseAchievements: document.getElementById('xCloseAchievements'),
  modeModal: document.getElementById('modeModal'),
  closeModeModal: document.getElementById('closeModeModal'),
  xCloseMode: document.getElementById('xCloseMode'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettings: document.getElementById('closeSettings'),
  xCloseSettings: document.getElementById('xCloseSettings'),
  saveSettings: document.getElementById('saveSettings'),
  volumeSlider: document.getElementById('volumeSlider'),
  volumeValue: document.getElementById('volumeValue'),
  languageSelect: document.getElementById('languageSelect'),
  
  shopList: document.getElementById('shopList'),
  statBestScore: document.getElementById('statBestScore'),
  statTotalGold: document.getElementById('statTotalGold'),
  statBosses: document.getElementById('statBosses'),
  statRuns: document.getElementById('statRuns'),
  achievementsList: document.getElementById('achievementsList')
};

let user = 'Hero';
let currency = 0;
let bestRunScore = 0;
let totalGoldEarned = 0;
let totalBossesDefeated = 0;
let totalRuns = 0;
let selectedSkin = 'rainbow';
let globalStats = { '+': 0, '-': 0, '*': 0, '/': 0, fastestTime: 999, bossRushBosses: 0, glassCannonBosses: 0, comboGod: 0 };

let skins = [
  { id: 'rainbow', name: 'Default Hero', cost: 0, unlocked: true, detail: 'The standard hero.', icon: '🧍' },
  { id: 'peasant', name: 'Peasant Boy', cost: 50, unlocked: false, detail: 'A humble beginning.', icon: '👦' },
  { id: 'adventurer', name: 'Adventurer', cost: 100, unlocked: false, detail: 'Ready for a journey.', icon: '🎒' },
  { id: 'stone', name: 'Stone Armor', cost: 250, unlocked: false, detail: 'Solid and blocky.', icon: '🗿' },
  { id: 'knight', name: 'Iron Knight', cost: 500, unlocked: false, detail: 'Sturdy iron defenses.', icon: '🛡️' },
  { id: 'mage', name: 'Apprentice Mage', cost: 750, unlocked: false, detail: 'Mystical powers.', icon: '🧙' },
  { id: 'glow', name: 'Neon Miner', cost: 1000, unlocked: false, detail: 'A glowing run style.', icon: '⚡' },
  { id: 'ninja', name: 'Shadow Ninja', cost: 1500, unlocked: false, detail: 'Swift and silent.', icon: '🥷' },
  { id: 'robot', name: 'Mecha Suit', cost: 2000, unlocked: false, detail: 'Futuristic combat armor.', icon: '🤖' },
  { id: 'gold', name: 'Golden Knight', cost: 3000, unlocked: false, detail: 'Shiny and expensive.', icon: '👑' },
  { id: 'diamond', name: 'Diamond Armor', cost: 5000, unlocked: false, detail: 'Unbreakable.', icon: '💎' },
  { id: 'fire', name: 'Flame Lord', cost: 7500, unlocked: false, detail: 'Burns with inner fire.', icon: '🔥' },
  { id: 'ice', name: 'Frost Warden', cost: 10000, unlocked: false, detail: 'Cold as ice.', icon: '❄️' },
  { id: 'phantom', name: 'Phantom Assassin', cost: 15000, unlocked: false, detail: 'Barely visible.', icon: '👻' },
  { id: 'alien', name: 'Extraterrestrial', cost: 20000, unlocked: false, detail: 'From another world.', icon: '👽' },
  { id: 'demon', name: 'Demon King', cost: 25000, unlocked: false, detail: 'Fearsome ruler.', icon: '👹' },
  { id: 'angel', name: 'Seraphim', cost: 30000, unlocked: false, detail: 'Divine presence.', icon: '👼' },
  { id: 'dragon', name: 'Dragon Tamer', cost: 40000, unlocked: false, detail: 'Commands the beasts.', icon: '🐉' },
  { id: 'void', name: 'Void Walker', cost: 50000, unlocked: false, detail: 'Consumes light.', icon: '🌌' },
  { id: 'celestial', name: 'Celestial Being', cost: 75000, unlocked: false, detail: 'Made of stardust.', icon: '🌟' },
  { id: 'god', name: 'Math God', cost: 100000, unlocked: false, detail: 'The ultimate form.', icon: '♾️' }
];

const achievementsData = [
  { id: 'gold_100', nameKey: 'ach_g1_name', descKey: 'ach_g1_desc', getProgress: () => totalGoldEarned, target: 100 },
  { id: 'gold_1000', nameKey: 'ach_g2_name', descKey: 'ach_g2_desc', getProgress: () => totalGoldEarned, target: 1000 },
  { id: 'gold_10000', nameKey: 'ach_g3_name', descKey: 'ach_g3_desc', getProgress: () => totalGoldEarned, target: 10000 },
  { id: 'score_10000', nameKey: 'ach_s1_name', descKey: 'ach_s1_desc', getProgress: () => bestRunScore, target: 10000 },
  { id: 'skins_10', nameKey: 'ach_sk_name', descKey: 'ach_sk_desc', getProgress: () => skins.filter(s => s.unlocked).length, target: 10 },
  { id: 'bosses_50', nameKey: 'ach_b1_name', descKey: 'ach_b1_desc', getProgress: () => totalBossesDefeated, target: 50 },
  
  // Math Subjects
  { id: 'add_100', nameKey: 'ach_p1_name', descKey: 'ach_p1_desc', getProgress: () => globalStats['+'], target: 100 },
  { id: 'sub_100', nameKey: 'ach_p2_name', descKey: 'ach_p2_desc', getProgress: () => globalStats['-'], target: 100 },
  { id: 'mul_100', nameKey: 'ach_p3_name', descKey: 'ach_p3_desc', getProgress: () => globalStats['*'], target: 100 },
  { id: 'div_100', nameKey: 'ach_p4_name', descKey: 'ach_p4_desc', getProgress: () => globalStats['/'], target: 100 },
  
  // Crazy Milestones
  { id: 'boss_rush_10', nameKey: 'ach_m1_name', descKey: 'ach_m1_desc', getProgress: () => globalStats.bossRushBosses, target: 10 },
  { id: 'glass_cannon_1', nameKey: 'ach_m2_name', descKey: 'ach_m2_desc', getProgress: () => globalStats.glassCannonBosses, target: 1 },
  { id: 'speed_demon', nameKey: 'ach_m3_name', descKey: 'ach_m3_desc', getProgress: () => globalStats.fastestTime <= 1 ? 1 : 0, target: 1 },
  { id: 'combo_god', nameKey: 'ach_m4_name', descKey: 'ach_m4_desc', getProgress: () => globalStats.comboGod, target: 50 },
  { id: 'true_hero', nameKey: 'ach_m5_name', descKey: 'ach_m5_desc', getProgress: () => skins.find(s => s.id === 'god').unlocked ? 1 : 0, target: 1 }
];

let settings = { volume: 50, language: 'en' };

function loadState() {
  const userStored = localStorage.getItem('mathQuestUser');
  if (userStored) {
    try { user = JSON.parse(userStored).user; } catch(e){}
  } else {
    window.location.href = 'index.html';
  }

  const savedSettings = localStorage.getItem('mathQuestSettings');
  if (savedSettings) {
    try { settings = { ...settings, ...JSON.parse(savedSettings) }; } catch(e){}
  }
  
  elements.volumeSlider.value = settings.volume;
  elements.volumeValue.textContent = settings.volume + '%';
  elements.languageSelect.value = settings.language;

  const saved = localStorage.getItem('mathQuestRogueStats');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      currency = parsed.currency ?? currency;
      bestRunScore = parsed.bestRunScore ?? bestRunScore;
      totalGoldEarned = parsed.totalGoldEarned ?? totalGoldEarned;
      totalBossesDefeated = parsed.totalBossesDefeated ?? totalBossesDefeated;
      totalRuns = parsed.totalRuns ?? totalRuns;
      selectedSkin = parsed.selectedSkin || selectedSkin;
      globalStats = parsed.globalStats || globalStats;
      // ensure new keys exist
      globalStats.fastestTime = globalStats.fastestTime ?? 999;
      globalStats.bossRushBosses = globalStats.bossRushBosses ?? 0;
      globalStats.glassCannonBosses = globalStats.glassCannonBosses ?? 0;
      globalStats.comboGod = globalStats.comboGod ?? 0;
      if (Array.isArray(parsed.skins)) {
        skins = skins.map(s => {
          const savedSkin = parsed.skins.find(ps => ps.id === s.id);
          return savedSkin ? { ...s, unlocked: savedSkin.unlocked } : s;
        });
      }
    } catch(e){}
  }
}

function saveState() {
  localStorage.setItem('mathQuestRogueStats', JSON.stringify({
    currency, bestRunScore, totalGoldEarned, totalBossesDefeated, totalRuns, selectedSkin, globalStats,
    skins: skins.map(s => ({ id: s.id, unlocked: s.unlocked }))
  }));
}

function updateUI() {
  applyTranslationsToDOM(settings.language);
  elements.playerNameDisplay.textContent = user;
  elements.shopGoldDisplay.textContent = currency;
  elements.statBestScore.textContent = bestRunScore;
  elements.statTotalGold.textContent = totalGoldEarned;
  elements.statBosses.textContent = totalBossesDefeated;
  elements.statRuns.textContent = totalRuns;
  renderShop();
  renderAchievements();
}

function renderAchievements() {
  elements.achievementsList.innerHTML = '';
  achievementsData.forEach(ach => {
    const current = ach.getProgress();
    const isComplete = current >= ach.target;
    const progressPercent = Math.min(100, (current / ach.target) * 100);
    
    const card = document.createElement('div');
    card.className = `bg-slate-800/50 border ${isComplete ? 'border-yellow-400' : 'border-slate-700'} rounded-xl p-4`;
    
    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <div>
          <h4 class="font-bold ${isComplete ? 'text-yellow-400' : 'text-white'}">${getTranslation(ach.nameKey, settings.language)} ${isComplete ? '🌟' : ''}</h4>
          <p class="text-xs text-slate-400 mt-1">${getTranslation(ach.descKey, settings.language)}</p>
        </div>
        <span class="text-sm font-minecraft ${isComplete ? 'text-emerald-400' : 'text-slate-500'}">
          ${Math.min(current, ach.target)}/${ach.target}
        </span>
      </div>
      <div class="w-full bg-slate-900 rounded-full h-2 mt-2 border border-slate-700">
        <div class="bg-gradient-to-r ${isComplete ? 'from-yellow-500 to-yellow-300' : 'from-blue-600 to-blue-400'} h-2 rounded-full" style="width: ${progressPercent}%"></div>
      </div>
    `;
    elements.achievementsList.appendChild(card);
  });
}

function renderShop() {
  elements.shopList.innerHTML = '';
  skins.forEach(skin => {
    const card = document.createElement('div');
    card.className = 'bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex justify-between items-center';
    card.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="text-4xl w-12 text-center">${skin.icon}</div>
        <div>
          <h3 class="text-white font-bold">${skin.name}</h3>
          <p class="text-slate-400 text-sm">${skin.detail}</p>
        </div>
      </div>
      <div class="text-right flex-shrink-0 ml-4">
        <p class="text-yellow-400 font-bold mb-2">${skin.cost > 0 ? skin.cost + ' ' + getTranslation('gold_label', settings.language).replace(':', '') : getTranslation('txt_free', settings.language)}</p>
        <button class="button-primary px-4 py-2 text-sm w-24">
          ${skin.unlocked ? (selectedSkin === skin.id ? getTranslation('btn_equipped', settings.language) : getTranslation('btn_equip', settings.language)) : getTranslation('btn_buy', settings.language)}
        </button>
      </div>
    `;
    const btn = card.querySelector('button');
    if (skin.unlocked && selectedSkin === skin.id) {
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      btn.disabled = true;
    }
    btn.onclick = () => {
      if (!skin.unlocked) {
        if (currency >= skin.cost) {
          currency -= skin.cost;
          skin.unlocked = true;
          selectedSkin = skin.id;
          saveState();
          updateUI();
        } else {
          alert(getTranslation('txt_not_enough', settings.language));
        }
      } else {
        selectedSkin = skin.id;
        saveState();
        updateUI();
      }
    };
    elements.shopList.appendChild(card);
  });
}

// Mode Selection
elements.btnStartRun.onclick = () => { elements.modeModal.classList.remove('hidden'); };
elements.closeModeModal.onclick = () => { elements.modeModal.classList.add('hidden'); };
elements.xCloseMode.onclick = elements.closeModeModal.onclick;

document.querySelectorAll('.btn-mode').forEach(btn => {
  btn.onclick = () => {
    localStorage.setItem('mathQuestMode', btn.dataset.mode);
    window.location.href = 'play.html';
  };
});

// Modals
elements.btnShop.onclick = () => { elements.shopModal.classList.remove('hidden'); updateUI(); };
elements.closeShopModal.onclick = () => { elements.shopModal.classList.add('hidden'); };
elements.xCloseShop.onclick = elements.closeShopModal.onclick;

elements.btnAchievements.onclick = () => { elements.achievementsModal.classList.remove('hidden'); updateUI(); };
elements.closeAchievementsModal.onclick = () => { elements.achievementsModal.classList.add('hidden'); };
elements.xCloseAchievements.onclick = elements.closeAchievementsModal.onclick;

// Settings
elements.btnSettings.onclick = () => { elements.settingsModal.classList.remove('hidden'); };
elements.closeSettings.onclick = () => { elements.settingsModal.classList.add('hidden'); };
elements.xCloseSettings.onclick = elements.closeSettings.onclick;
elements.volumeSlider.oninput = (e) => { elements.volumeValue.textContent = e.target.value + '%'; };
elements.saveSettings.onclick = () => {
  settings.volume = parseInt(elements.volumeSlider.value);
  settings.language = elements.languageSelect.value;
  localStorage.setItem('mathQuestSettings', JSON.stringify(settings));
  elements.settingsModal.classList.add('hidden');
  updateUI();
};

elements.btnBackToTitle.onclick = () => { window.location.href = 'index.html'; };

window.onload = () => {
  loadState();
  updateUI();
};
