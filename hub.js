const elements = {
  playerNameDisplay: document.getElementById('playerNameDisplay'),
  playerMMRDisplay: document.getElementById('playerMMRDisplay'),
  shopGoldDisplay: document.getElementById('shopGoldDisplay'),
  btnStartRun: document.getElementById('btnStartRun'),
  btnShop: document.getElementById('btnShop'),
  btnAchievements: document.getElementById('btnAchievements'),
  btnLeaderboard: document.getElementById('btnLeaderboard'),
  btnVersus: document.getElementById('btnVersus'),
  btnSettings: document.getElementById('btnSettings'),
  btnBackToTitle: document.getElementById('btnBackToTitle'),
  
  shopModal: document.getElementById('shopModal'),
  closeShopModal: document.getElementById('closeShopModal'),
  xCloseShop: document.getElementById('xCloseShop'),
  btnUpgrades: document.getElementById('btnUpgrades'),
  upgradesModal: document.getElementById('upgradesModal'),
  closeUpgradesModal: document.getElementById('closeUpgradesModal'),
  xCloseUpgrades: document.getElementById('xCloseUpgrades'),
  upgradesList: document.getElementById('upgradesList'),
  upgradesGoldDisplay: document.getElementById('upgradesGoldDisplay'),
  btnToggleQuests: document.getElementById('btnToggleQuests'),
  questsListContainer: document.getElementById('questsListContainer'),
  questsToggleIcon: document.getElementById('questsToggleIcon'),
  questsList: document.getElementById('questsList'),
  achievementsModal: document.getElementById('achievementsModal'),
  xCloseAchievements: document.getElementById('xCloseAchievements'),
  leaderboardModal: document.getElementById('leaderboardModal'),
  closeLeaderboardModal: document.getElementById('closeLeaderboardModal'),
  xCloseLeaderboard: document.getElementById('xCloseLeaderboard'),
  modeModal: document.getElementById('modeModal'),
  closeModeModal: document.getElementById('closeModeModal'),
  xCloseMode: document.getElementById('xCloseMode'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettings: document.getElementById('closeSettings'),
  xCloseSettings: document.getElementById('xCloseSettings'),
  saveSettings: document.getElementById('saveSettings'),
  sfxVolumeSlider: document.getElementById('sfxVolumeSlider'),
  sfxVolumeValue: document.getElementById('sfxVolumeValue'),
  musicVolumeSlider: document.getElementById('musicVolumeSlider'),
  musicVolumeValue: document.getElementById('musicVolumeValue'),
  languageSelect: document.getElementById('languageSelect'),
  btnReplayTutorial: document.getElementById('btnReplayTutorial'),
  
  btnBuffIndex: document.getElementById('btnBuffIndex'),
  buffIndexModal: document.getElementById('buffIndexModal'),
  xCloseBuffIndex: document.getElementById('xCloseBuffIndex'),
  buffIndexList: document.getElementById('buffIndexList'),

  shopList: document.getElementById('shopList'),
  statBestScore: document.getElementById('statBestScore'),
  statTotalGold: document.getElementById('statTotalGold'),
  statBosses: document.getElementById('statBosses'),
  statRuns: document.getElementById('statRuns'),
  achievementsList: document.getElementById('achievementsList'),
  leaderboardList: document.getElementById('leaderboardList')
};

let leaderboard = [];

let user = 'Hero';
let currency = 0;
let bestRunScore = 0;
let totalGoldEarned = 0;
let totalBossesDefeated = 0;
let totalRuns = 0;
let selectedSkin = 'rainbow';
let globalStats = { '+': 0, '-': 0, '*': 0, '/': 0, fastestTime: 999, bossRushBosses: 0, glassCannonBosses: 0, comboGod: 0, playerMMR: 10, notifiedAchievements: [] };

let upgrades = {
  maxHealth: { level: 0, maxLevel: 5, baseCost: 100, nameKey: 'upg_hp', descKey: 'upg_hp_desc' },
  time: { level: 0, maxLevel: 3, baseCost: 200, nameKey: 'upg_time', descKey: 'upg_time_desc' },
  goldMult: { level: 0, maxLevel: 5, baseCost: 150, nameKey: 'upg_gold', descKey: 'upg_gold_desc' }
};

let dailyQuests = {
  lastReset: '',
  quests: []
};

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

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

let skins = [
  { id: 'rainbow', nameKey: 'skin_rainbow_name', descKey: 'skin_rainbow_desc', cost: 0, unlocked: true, icon: '🧍' },
  { id: 'peasant', nameKey: 'skin_peasant_name', descKey: 'skin_peasant_desc', cost: 50, unlocked: false, icon: '🧑‍🌾' },
  { id: 'adventurer', nameKey: 'skin_adv_name', descKey: 'skin_adv_desc', cost: 100, unlocked: false, icon: '🧝' },
  { id: 'stone', nameKey: 'skin_stone_name', descKey: 'skin_stone_desc', cost: 250, unlocked: false, icon: '🗿' },
  { id: 'knight', nameKey: 'skin_knight_name', descKey: 'skin_knight_desc', cost: 500, unlocked: false, icon: '🛡️' },
  { id: 'mage', nameKey: 'skin_mage_name', descKey: 'skin_mage_desc', cost: 750, unlocked: false, icon: '🧙' },
  { id: 'glow', nameKey: 'skin_glow_name', descKey: 'skin_glow_desc', cost: 1000, unlocked: false, icon: '💡' },
  { id: 'ninja', nameKey: 'skin_ninja_name', descKey: 'skin_ninja_desc', cost: 1500, unlocked: false, icon: '🥷' },
  { id: 'robot', nameKey: 'skin_robot_name', descKey: 'skin_robot_desc', cost: 2000, unlocked: false, icon: '🤖' },
  { id: 'gold', nameKey: 'skin_gold_name', descKey: 'skin_gold_desc', cost: 3000, unlocked: false, icon: '🪙' },
  { id: 'diamond', nameKey: 'skin_diamond_name', descKey: 'skin_diamond_desc', cost: 5000, unlocked: false, icon: '💎' },
  { id: 'fire', nameKey: 'skin_fire_name', descKey: 'skin_fire_desc', cost: 7500, unlocked: false, icon: '🔥' },
  { id: 'ice', nameKey: 'skin_ice_name', descKey: 'skin_ice_desc', cost: 10000, unlocked: false, icon: '❄️' },
  { id: 'phantom', nameKey: 'skin_phantom_name', descKey: 'skin_phantom_desc', cost: 15000, unlocked: false, icon: '👻' },
  { id: 'alien', nameKey: 'skin_alien_name', descKey: 'skin_alien_desc', cost: 20000, unlocked: false, icon: '👽' },
  { id: 'demon', nameKey: 'skin_demon_name', descKey: 'skin_demon_desc', cost: 25000, unlocked: false, icon: '👿' },
  { id: 'angel', nameKey: 'skin_angel_name', descKey: 'skin_angel_desc', cost: 30000, unlocked: false, icon: '👼' },
  { id: 'dragon', nameKey: 'skin_dragon_name', descKey: 'skin_dragon_desc', cost: 40000, unlocked: false, icon: '🐉' },
  { id: 'void', nameKey: 'skin_void_name', descKey: 'skin_void_desc', cost: 50000, unlocked: false, icon: '🌌' },
  { id: 'celestial', nameKey: 'skin_celestial_name', descKey: 'skin_celestial_desc', cost: 75000, unlocked: false, icon: '🌠' },
  { id: 'god', nameKey: 'skin_god_name', descKey: 'skin_god_desc', cost: 100000, unlocked: false, icon: '🕉️' }
];

const achievementsData = [
  { id: 'gold_100', nameKey: 'ach_g1_name', descKey: 'ach_g1_desc', getProgress: () => totalGoldEarned, target: 100 },
  { id: 'gold_1000', nameKey: 'ach_g2_name', descKey: 'ach_g2_desc', getProgress: () => totalGoldEarned, target: 1000 },
  { id: 'gold_10000', nameKey: 'ach_g3_name', descKey: 'ach_g3_desc', getProgress: () => totalGoldEarned, target: 10000 },
  { id: 'gold_50000', nameKey: 'ach_g4_name', descKey: 'ach_g4_desc', getProgress: () => totalGoldEarned, target: 50000 },
  { id: 'gold_100000', nameKey: 'ach_g5_name', descKey: 'ach_g5_desc', getProgress: () => totalGoldEarned, target: 100000 },
  
  { id: 'score_1000', nameKey: 'ach_s0_name', descKey: 'ach_s0_desc', getProgress: () => bestRunScore, target: 1000 },
  { id: 'score_10000', nameKey: 'ach_s1_name', descKey: 'ach_s1_desc', getProgress: () => bestRunScore, target: 10000 },
  { id: 'score_50000', nameKey: 'ach_s2_name', descKey: 'ach_s2_desc', getProgress: () => bestRunScore, target: 50000 },
  { id: 'score_100000', nameKey: 'ach_s3_name', descKey: 'ach_s3_desc', getProgress: () => bestRunScore, target: 100000 },
  
  { id: 'skins_10', nameKey: 'ach_sk_name', descKey: 'ach_sk_desc', getProgress: () => skins.filter(s => s.unlocked).length, target: 10 },
  { id: 'skins_20', nameKey: 'ach_sk2_name', descKey: 'ach_sk2_desc', getProgress: () => skins.filter(s => s.unlocked).length, target: 20 },
  { id: 'skins_all', nameKey: 'ach_sk4_name', descKey: 'ach_sk4_desc', getProgress: () => skins.filter(s => s.unlocked).length, target: skins.length },
  
  { id: 'bosses_1', nameKey: 'ach_b0_name', descKey: 'ach_b0_desc', getProgress: () => totalBossesDefeated, target: 1 },
  { id: 'bosses_50', nameKey: 'ach_b1_name', descKey: 'ach_b1_desc', getProgress: () => totalBossesDefeated, target: 50 },
  { id: 'bosses_150', nameKey: 'ach_b2_name', descKey: 'ach_b2_desc', getProgress: () => totalBossesDefeated, target: 150 },
  
  // Math Subjects
  { id: 'add_100', nameKey: 'ach_p1_name', descKey: 'ach_p1_desc', getProgress: () => globalStats['+'], target: 100 },
  { id: 'sub_100', nameKey: 'ach_p2_name', descKey: 'ach_p2_desc', getProgress: () => globalStats['-'], target: 100 },
  { id: 'mul_100', nameKey: 'ach_p3_name', descKey: 'ach_p3_desc', getProgress: () => globalStats['*'], target: 100 },
  { id: 'div_100', nameKey: 'ach_p4_name', descKey: 'ach_p4_desc', getProgress: () => globalStats['/'], target: 100 },
  { id: 'add_500', nameKey: 'ach_p5_name', descKey: 'ach_p5_desc', getProgress: () => globalStats['+'], target: 500 },
  { id: 'sub_500', nameKey: 'ach_p6_name', descKey: 'ach_p6_desc', getProgress: () => globalStats['-'], target: 500 },
  { id: 'mul_500', nameKey: 'ach_p7_name', descKey: 'ach_p7_desc', getProgress: () => globalStats['*'], target: 500 },
  { id: 'div_500', nameKey: 'ach_p8_name', descKey: 'ach_p8_desc', getProgress: () => globalStats['/'], target: 500 },
  
  // Crazy Milestones
  { id: 'combo_50', nameKey: 'ach_m4_name', descKey: 'ach_m4_desc', getProgress: () => globalStats.comboGod, target: 50 },
  { id: 'combo_100', nameKey: 'ach_m6_name', descKey: 'ach_m6_desc', getProgress: () => globalStats.comboGod, target: 100 },
  
  { id: 'runs_1', nameKey: 'ach_r1_name', descKey: 'ach_r1_desc', getProgress: () => totalRuns, target: 1 },
  { id: 'runs_50', nameKey: 'ach_r2_name', descKey: 'ach_r2_desc', getProgress: () => totalRuns, target: 50 },
  { id: 'runs_100', nameKey: 'ach_r3_name', descKey: 'ach_r3_desc', getProgress: () => totalRuns, target: 100 },

  { id: 'boss_rush_10', nameKey: 'ach_m1_name', descKey: 'ach_m1_desc', getProgress: () => globalStats.bossRushBosses, target: 10 },
  { id: 'boss_rush_50', nameKey: 'ach_m7_name', descKey: 'ach_m7_desc', getProgress: () => globalStats.bossRushBosses, target: 50 },
  { id: 'glass_cannon_1', nameKey: 'ach_m2_name', descKey: 'ach_m2_desc', getProgress: () => globalStats.glassCannonBosses, target: 1 },
  { id: 'glass_cannon_10', nameKey: 'ach_m8_name', descKey: 'ach_m8_desc', getProgress: () => globalStats.glassCannonBosses, target: 10 },
  
  { id: 'speed_demon', nameKey: 'ach_m3_name', descKey: 'ach_m3_desc', getProgress: () => globalStats.fastestTime <= 1 ? 1 : 0, target: 1 },
  { id: 'quick_thinker', nameKey: 'ach_m9_name', descKey: 'ach_m9_desc', getProgress: () => globalStats.fastestTime <= 0.5 ? 1 : 0, target: 1 },
  { id: 'true_hero', nameKey: 'ach_m5_name', descKey: 'ach_m5_desc', getProgress: () => skins.find(s => s.id === 'god').unlocked ? 1 : 0, target: 1 }
];

let settings = { sfxVolume: 70, musicVolume: 50, language: 'en' };

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
  
  if (elements.sfxVolumeSlider) {
    elements.sfxVolumeSlider.value = settings.sfxVolume || 70;
    elements.sfxVolumeValue.textContent = (settings.sfxVolume || 70) + '%';
    elements.musicVolumeSlider.value = settings.musicVolume || 50;
    elements.musicVolumeValue.textContent = (settings.musicVolume || 50) + '%';
  }
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
      if (parsed.upgrades) upgrades = parsed.upgrades;
      if (parsed.dailyQuests) dailyQuests = parsed.dailyQuests;
      // ensure new keys exist
      globalStats.fastestTime = globalStats.fastestTime ?? 999;
      globalStats.bossRushBosses = globalStats.bossRushBosses ?? 0;
      globalStats.glassCannonBosses = globalStats.glassCannonBosses ?? 0;
      globalStats.comboGod = globalStats.comboGod ?? 0;
      globalStats.playerMMR = globalStats.playerMMR ?? 10;
      globalStats.notifiedAchievements = globalStats.notifiedAchievements || [];
      if (Array.isArray(parsed.skins)) {
        skins = skins.map(s => {
          const savedSkin = parsed.skins.find(ps => ps.id === s.id);
          return savedSkin ? { ...s, unlocked: savedSkin.unlocked } : s;
        });
      }
    } catch(e){}
  }

  const leaderboardStored = localStorage.getItem('mathQuestLeaderboard');
  if (leaderboardStored) {
    try { leaderboard = JSON.parse(leaderboardStored); } catch(e){}
  }
  
  if (typeof db !== 'undefined') {
    db.ref('leaderboard').orderByChild('score').limitToLast(100).on('value', snap => {
      if (snap.exists()) {
        const data = snap.val();
        leaderboard = Object.values(data);
        if (elements.leaderboardModal.classList.contains('show')) {
          renderLeaderboard();
        }
      }
    });
  }
  
  const today = new Date().toDateString();
  if (dailyQuests.lastReset !== today) {
    generateQuests();
    saveState();
  }
}

function saveState() {
  const saved = localStorage.getItem('mathQuestRogueStats');
  let stats = {};
  if (saved) { try { stats = JSON.parse(saved); } catch(e){} }
  
  Object.assign(stats, {
    currency, bestRunScore, totalGoldEarned, totalBossesDefeated, totalRuns, selectedSkin, globalStats, upgrades, dailyQuests,
    skins: skins.map(s => ({ id: s.id, unlocked: s.unlocked }))
  });

  localStorage.setItem('mathQuestRogueStats', JSON.stringify(stats));
  
  if (typeof db !== 'undefined' && user !== 'Hero' && user !== 'Guest') {
    const cleanName = user.trim().replace(/[.#$[\]\s/]/g, '_').toLowerCase();
    const firebaseData = JSON.parse(JSON.stringify(stats, (k, v) => (typeof v === 'number' && isNaN(v)) ? 0 : v));
    if (firebaseData.globalStats) {
      firebaseData.globalStats['add'] = firebaseData.globalStats['+'] || 0;
      firebaseData.globalStats['sub'] = firebaseData.globalStats['-'] || 0;
      firebaseData.globalStats['mul'] = firebaseData.globalStats['*'] || 0;
      firebaseData.globalStats['div'] = firebaseData.globalStats['/'] || 0;
      delete firebaseData.globalStats['+'];
      delete firebaseData.globalStats['-'];
      delete firebaseData.globalStats['*'];
      delete firebaseData.globalStats['/'];
    }
    if (firebaseData.run && firebaseData.run.stats) {
      firebaseData.run.stats['add'] = firebaseData.run.stats['+'] || {correct:0,total:0};
      firebaseData.run.stats['sub'] = firebaseData.run.stats['-'] || {correct:0,total:0};
      firebaseData.run.stats['mul'] = firebaseData.run.stats['*'] || {correct:0,total:0};
      firebaseData.run.stats['div'] = firebaseData.run.stats['/'] || {correct:0,total:0};
      delete firebaseData.run.stats['+'];
      delete firebaseData.run.stats['-'];
      delete firebaseData.run.stats['*'];
      delete firebaseData.run.stats['/'];
    }
    db.ref('users/' + cleanName + '/stats').update(firebaseData).catch(e => console.error("Firebase Sync Error", e));
  }
}

function updateUI() {
  applyTranslationsToDOM(settings.language);
  elements.playerNameDisplay.textContent = user;
  if (elements.playerMMRDisplay) elements.playerMMRDisplay.textContent = window.getRankFromMMR ? window.getRankFromMMR(globalStats.playerMMR) : Math.floor(globalStats.playerMMR);
  elements.shopGoldDisplay.textContent = currency;
  if (elements.upgradesGoldDisplay) elements.upgradesGoldDisplay.textContent = currency;
  elements.statBestScore.textContent = bestRunScore;
  elements.statTotalGold.textContent = totalGoldEarned;
  elements.statBosses.textContent = totalBossesDefeated;
  elements.statRuns.textContent = totalRuns;
  renderShop();
  renderUpgrades();
  renderQuests();
  renderAchievements();
  
  if (user === 'Guest') {
    ['btnShop', 'btnUpgrades', 'btnAchievements', 'btnVersus'].forEach(id => {
      const btn = elements[id];
      if (btn && !btn.textContent.includes('🔒')) {
        btn.textContent = '🔒 ' + btn.textContent.replace('🔒', '').replace('🛒', '').replace('🔨', '').replace('🏆', '').replace('⚡', '').trim();
        btn.removeAttribute('data-i18n');
        btn.style.opacity = '0.7';
      }
      if (btn) btn.onclick = () => {
        if (typeof window.showToast === 'function') {
          window.showToast("Not available for Guest. Please create an account to save progress!", "error");
        } else {
          alert("Not available for Guest. Please create an account to save progress!");
        }
      };
    });
    
    if (elements.btnToggleQuests) {
      elements.btnToggleQuests.style.opacity = '0.5';
      elements.btnToggleQuests.style.filter = 'grayscale(1)';
      elements.btnToggleQuests.title = 'Create an account to unlock Daily Missions';
      elements.btnToggleQuests.onclick = () => {
        if (typeof window.showToast === 'function') {
          window.showToast("Not available for Guest. Please create an account to save progress!", "error");
        } else {
          alert("Not available for Guest. Please create an account to save progress!");
        }
      };
    }
    
    elements.btnBackToTitle.textContent = '🚪 ' + getTranslation('btn_main_menu', settings.language);
    elements.btnBackToTitle.removeAttribute('data-i18n');
  } else {
    elements.btnBackToTitle.textContent = '🚪 ' + getTranslation('btn_logout', settings.language);
  }
  
  if (localStorage.getItem('mathQuestSavedRun')) {
    elements.btnStartRun.textContent = getTranslation('btn_resume_run', settings.language);
    elements.btnStartRun.onclick = () => { window.location.href = 'play.html'; };
  } else {
    elements.btnStartRun.textContent = getTranslation('btn_start', settings.language);
    elements.btnStartRun.onclick = () => { elements.modeModal.classList.add('show'); };
  }
  
  checkAchievements();
}

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
    <div style="font-size:2rem; margin-right:12px; filter:drop-shadow(2px 2px 0 rgba(0,0,0,1));">🏆</div>
    <div>
      <div style="font-family:'Press Start 2P', monospace; font-size:0.5rem; color:#ffd54f; margin-bottom:6px; text-shadow:1px 1px 0 #000;">ACHIEVEMENT UNLOCKED</div>
      <div style="font-family:'Comic Neue', cursive; font-size:1rem; font-weight:bold; color:#fff; line-height:1;">${getTranslation(ach.nameKey, settings.language)}</div>
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

function renderLeaderboard() {
  elements.leaderboardList.innerHTML = '';
  
  if (!leaderboard || leaderboard.length === 0) {
    elements.leaderboardList.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; font-family:'Comic Neue',cursive; font-weight:700; color:#9ca3af;">${getTranslation('txt_empty_leaderboard', settings.language)}</td></tr>`;
    return;
  }
  
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 100);
  sorted.forEach((entry, idx) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '4px solid var(--panel-border)';
    tr.style.background = idx % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';
    
    tr.innerHTML = `
      <td style="padding:clamp(4px, 1vw, 12px); text-align:center; font-family:'Press Start 2P',monospace; font-size:clamp(0.45rem, 1.5vw, 0.65rem); color:#fff;">#${idx + 1}</td>
      <td style="padding:clamp(4px, 1vw, 12px); font-family:'Press Start 2P',monospace; font-size:clamp(0.45rem, 1.5vw, 0.65rem); color:#fff;">
        <span style="font-size:clamp(0.8rem, 2vw, 1.2rem); margin-right:4px; vertical-align:middle;">${entry.skin || '🧍'}</span>
        ${entry.name}
      </td>
      <td style="padding:clamp(4px, 1vw, 12px); text-align:right; font-family:'Press Start 2P',monospace; font-size:clamp(0.45rem, 1.5vw, 0.65rem); color:#64b5f6;">${entry.mmr ? (window.getRankFromMMR ? window.getRankFromMMR(entry.mmr) : Math.floor(entry.mmr)) : '🪨 Iron'}</td>
      <td style="padding:clamp(4px, 1vw, 12px); text-align:right; font-family:'Press Start 2P',monospace; font-size:clamp(0.45rem, 1.5vw, 0.65rem); color:#69f0ae;">${entry.score.toLocaleString()}</td>
      <td style="padding:clamp(4px, 1vw, 12px); text-align:right; font-family:'Press Start 2P',monospace; font-size:clamp(0.4rem, 1vw, 0.6rem); color:#9ca3af;">${entry.date}</td>
    `;
    elements.leaderboardList.appendChild(tr);
  });
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
      <div style="font-size:clamp(1.5rem, 5vw, 2.5rem); filter:drop-shadow(2px 2px 0 rgba(0,0,0,1));">${isComplete ? '🏆' : '🔒'}</div>
      <div style="flex:1;">
        <div style="font-family:'Press Start 2P',monospace; font-size:clamp(0.5rem, 2vw, 0.7rem); color:var(--text-gold); margin-bottom:clamp(4px, 1vw, 8px); text-shadow:1px 1px 0 rgba(0,0,0,1);">${getTranslation(ach.nameKey, settings.language)}</div>
        <div style="font-family:'Comic Neue',cursive; font-size:clamp(0.7rem, 2.5vw, 0.9rem); color:#ccc; margin-bottom:8px;">${getTranslation(ach.descKey, settings.language)}</div>
        <div style="width:100%; height:12px; background:#263238; border-radius:6px; overflow:hidden; border:2px solid var(--panel-border);">
          <div style="width:${progressPercent}%; height:100%; background:${isComplete ? '#4caf50' : '#ffa000'}; border-right:2px solid var(--panel-border);"></div>
        </div>
      </div>
    `;
    elements.achievementsList.appendChild(card);
  });
}

function renderShop() {
  elements.shopList.innerHTML = '';
  skins.forEach(skin => {
    const card = document.createElement('div');
    const isActive = selectedSkin === skin.id;
    card.className = 'stone-panel';
    card.style.flex = '0 0 clamp(110px, 30vw, 140px)';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.padding = 'clamp(8px, 2vw, 12px)';
    if (isActive) card.style.borderColor = '#4caf50';
    
    const btnLabel = skin.unlocked
      ? (isActive ? getTranslation('btn_equipped', settings.language) : getTranslation('btn_equip', settings.language))
      : getTranslation('btn_buy', settings.language);
      
    card.innerHTML = `
      <div style="font-size:clamp(2.5rem, 8vw, 4rem); margin-bottom:12px; filter:drop-shadow(3px 3px 0 rgba(0,0,0,0.8)); transform-origin:bottom; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${skin.icon}</div>
      <div style="font-family:'Press Start 2P',monospace; font-size:clamp(0.45rem, 2vw, 0.6rem); color:#fff; margin-bottom:8px; text-shadow:1px 1px 0 rgba(0,0,0,1); text-align:center; height:24px;">${getTranslation(skin.nameKey, settings.language)}</div>
      ${!skin.unlocked ? `<div style="font-family:'Press Start 2P',monospace; font-size:clamp(0.55rem, 2vw, 0.7rem); color:var(--text-gold); margin-bottom:12px; text-shadow:1px 1px 0 rgba(0,0,0,1);">🪙 ${skin.cost}</div>` : '<div style="height:22px; margin-bottom:12px;"></div>'}
    `;
    
    const btn = document.createElement('button');
    btn.className = `wood-btn ${isActive ? 'success' : ''}`;
    btn.style.width = '100%';
    btn.style.padding = '8px 4px';
    btn.style.fontSize = '0.7rem';
    btn.textContent = btnLabel;
    
    if (!skin.unlocked && currency < skin.cost) {
      btn.disabled = true;
      btn.style.filter = 'grayscale(1)';
      btn.style.opacity = '0.6';
    }
    card.appendChild(btn);
    btn.onclick = () => {
      if (!skin.unlocked) {
        if (currency >= skin.cost) {
          currency -= skin.cost;
          skin.unlocked = true;
          selectedSkin = skin.id;
          if (typeof SFX !== 'undefined') SFX.purchase();
          saveState();
          updateUI();
        } else {
          showToast(getTranslation('txt_not_enough', settings.language));
        }
      } else {
        selectedSkin = skin.id;
        if (typeof SFX !== 'undefined') SFX.equip();
        saveState();
        updateUI();
      }
    };
    elements.shopList.appendChild(card);
  });
}

function renderUpgrades() {
  if (!elements.upgradesList) return;
  elements.upgradesList.innerHTML = '';
  
  for (const key in upgrades) {
    const upg = upgrades[key];
    const cost = upg.baseCost * (upg.level + 1);
    const isMax = upg.level >= upg.maxLevel;
    
    const card = document.createElement('div');
    card.className = 'stone-panel';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = 'clamp(8px, 2vw, 16px)';
    card.style.padding = 'clamp(8px, 2vw, 12px)';
    
    card.innerHTML = `
      <div style="flex:1;">
        <div style="font-family:'Press Start 2P',monospace; font-size:clamp(0.5rem, 2vw, 0.7rem); color:var(--text-gold); margin-bottom:clamp(4px, 1vw, 8px); text-shadow:1px 1px 0 rgba(0,0,0,1);">${getTranslation(upg.nameKey, settings.language)} (Lv. ${upg.level}/${upg.maxLevel})</div>
        <div style="font-family:'Comic Neue',cursive; font-size:clamp(0.7rem, 2.5vw, 0.9rem); color:#ccc; margin-bottom:8px;">${getTranslation(upg.descKey, settings.language)}</div>
        <div style="width:100%; height:12px; background:#263238; border-radius:6px; overflow:hidden; border:2px solid var(--panel-border);">
          <div style="width:${(upg.level / upg.maxLevel) * 100}%; height:100%; background:#4caf50; border-right:2px solid var(--panel-border);"></div>
        </div>
      </div>
      <div>
        ${isMax ? `<button class="wood-btn" disabled style="opacity:0.5; filter:grayscale(1);">MAX</button>` : `<button class="wood-btn" id="btnBuyUpg_${key}">🪙 ${cost}</button>`}
      </div>
    `;
    elements.upgradesList.appendChild(card);
    
    if (!isMax) {
      const btn = card.querySelector(`#btnBuyUpg_${key}`);
      if (currency < cost) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.filter = 'grayscale(1)';
      } else {
        btn.onclick = () => {
          currency -= cost;
          upg.level++;
          if (typeof SFX !== 'undefined') SFX.purchase();
          saveState();
          updateUI();
        };
      }
    }
  }
}

function renderQuests() {
  if (!elements.questsList) return;
  elements.questsList.innerHTML = '';
  
  if (!dailyQuests || !Array.isArray(dailyQuests.quests)) return;

  dailyQuests.quests.forEach((q, idx) => {
    const isComplete = q.progress >= q.target;
    
    const card = document.createElement('div');
    card.className = 'stone-panel';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.flexWrap = 'wrap';
    card.style.gap = 'clamp(8px, 2vw, 16px)';
    card.style.padding = 'clamp(8px, 2vw, 12px)';
    
    let btnHtml = '';
    if (q.claimed) {
      btnHtml = `<button class="wood-btn success" disabled style="padding: 8px 12px; font-size: 0.6rem;">Claimed</button>`;
      card.style.opacity = '0.7';
    } else if (isComplete) {
      btnHtml = `<button class="wood-btn success" id="btnClaimQuest_${idx}" style="padding: 8px 12px; font-size: 0.6rem;">Claim 🪙 ${q.reward}</button>`;
    } else {
      btnHtml = `<button class="wood-btn" disabled style="opacity:0.5; filter:grayscale(1); padding: 8px 12px; font-size: 0.6rem;">🪙 ${q.reward}</button>`;
    }
    
    card.innerHTML = `
      <div style="flex:1; min-width: 140px; word-break: break-word;">
        <div style="font-family:'Press Start 2P',monospace; font-size:clamp(0.5rem, 2vw, 0.7rem); color:var(--text-gold); margin-bottom:clamp(4px, 1vw, 8px); text-shadow:1px 1px 0 rgba(0,0,0,1);">Bounty</div>
        <div style="font-family:'Comic Neue',cursive; font-size:clamp(0.7rem, 2.5vw, 0.9rem); color:#ccc; margin-bottom:8px;">${q.text}</div>
        <div style="width:100%; height:12px; background:#263238; border-radius:6px; overflow:hidden; border:2px solid var(--panel-border); margin-bottom:4px;">
          <div style="width:${Math.min(100, (q.progress / q.target) * 100)}%; height:100%; background:${isComplete ? '#4caf50' : '#ffa000'}; border-right:2px solid var(--panel-border);"></div>
        </div>
        <div style="font-family:'Press Start 2P',monospace; font-size:0.4rem; color:#aaa;">${Math.min(q.progress, q.target)} / ${q.target}</div>
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

// Mode Selection
elements.closeModeModal.onclick = () => { elements.modeModal.classList.remove('show'); };
elements.xCloseMode.onclick = elements.closeModeModal.onclick;

document.querySelectorAll('.btn-mode').forEach(btn => {
  btn.onclick = () => {
    localStorage.setItem('mathQuestMode', btn.dataset.mode);
    window.location.href = 'play.html';
  };
});

// Modals
function checkGuestFeature() {
  if (user === 'Guest') {
    showToast("Please return to the title screen and login or sign up to unlock this feature!");
    return true; // is guest
  }
  return false;
}

elements.btnShop.onclick = () => { 
  if (checkGuestFeature()) return;
  elements.shopModal.classList.add('show'); 
  updateUI(); 
};
elements.closeShopModal.onclick = () => { elements.shopModal.classList.remove('show'); };
elements.xCloseShop.onclick = elements.closeShopModal.onclick;

elements.btnUpgrades.onclick = () => {
  if (checkGuestFeature()) return;
  elements.upgradesModal.classList.add('show');
  updateUI();
};
elements.closeUpgradesModal.onclick = () => elements.upgradesModal.classList.remove('show');
elements.xCloseUpgrades.onclick = elements.closeUpgradesModal.onclick;

if (elements.btnToggleQuests) {
  elements.btnToggleQuests.onclick = () => {
    if (elements.questsListContainer.style.display === 'none') {
      elements.questsListContainer.style.display = 'block';
      elements.questsToggleIcon.style.transform = 'rotate(180deg)';
      if (typeof SFX !== 'undefined') SFX.btnClick();
    } else {
      elements.questsListContainer.style.display = 'none';
      elements.questsToggleIcon.style.transform = 'rotate(0deg)';
      if (typeof SFX !== 'undefined') SFX.btnClick();
    }
  };
}

elements.btnAchievements.onclick = () => {
  if (checkGuestFeature()) return;
  elements.achievementsModal.classList.add('show');
};
elements.xCloseAchievements.onclick = () => elements.achievementsModal.classList.remove('show');

elements.btnLeaderboard.onclick = () => {
  renderLeaderboard();
  elements.leaderboardModal.classList.add('show');
};
elements.closeLeaderboardModal.onclick = () => elements.leaderboardModal.classList.remove('show');
elements.xCloseLeaderboard.onclick = () => elements.leaderboardModal.classList.remove('show');

// Buff Index
elements.btnBuffIndex.onclick = () => {
  populateBuffIndex();
  elements.buffIndexModal.classList.add('show');
};
elements.xCloseBuffIndex.onclick = () => elements.buffIndexModal.classList.remove('show');

elements.btnVersus.onclick = () => {
  if (checkGuestFeature()) return;
  window.location.href = 'versus.html';
};

// Settings
elements.btnSettings.onclick = () => { elements.settingsModal.classList.add('show'); };
elements.closeSettings.onclick = () => { elements.settingsModal.classList.remove('show'); };
elements.xCloseSettings.onclick = elements.closeSettings.onclick;
elements.musicVolumeSlider.oninput = (e) => { 
  elements.musicVolumeValue.textContent = e.target.value + '%'; 
  settings.musicVolume = parseInt(e.target.value);
  localStorage.setItem('mathQuestSettings', JSON.stringify(settings));
  if (typeof SFX !== 'undefined') SFX.updateBGMVolume();
};

document.addEventListener('click', () => {
  if (typeof SFX !== 'undefined') SFX.playBGM('Menu Music.mp3');
}, { once: true });
elements.sfxVolumeSlider.oninput = (e) => { 
  elements.sfxVolumeValue.textContent = e.target.value + '%'; 
  if (typeof SFX !== 'undefined') {
    settings.sfxVolume = parseInt(e.target.value);
    localStorage.setItem('mathQuestSettings', JSON.stringify(settings));
    SFX.btnClick();
  }
};
elements.saveSettings.onclick = () => {
  settings.sfxVolume = parseInt(elements.sfxVolumeSlider.value);
  settings.musicVolume = parseInt(elements.musicVolumeSlider.value);
  settings.language = elements.languageSelect.value;
  localStorage.setItem('mathQuestSettings', JSON.stringify(settings));
  
  if (typeof db !== 'undefined' && user !== 'Hero' && user !== 'Guest') {
    const cleanName = user.trim().replace(/[.#$[\]\s/]/g, '_').toLowerCase();
    db.ref('users/' + cleanName + '/settings').set(settings).catch(e => console.error("Firebase Sync Error", e));
  }
  
  elements.settingsModal.classList.remove('show');
  updateUI();
};

elements.btnBackToTitle.onclick = () => { window.location.href = 'index.html'; };

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
  
  timerEl.textContent = `Resets in: ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  
  if (dailyQuests.lastReset !== now.toDateString()) {
    generateQuests();
    saveState();
    updateUI();
  }
}

setInterval(updateQuestTimer, 1000);

window.onload = () => {
  loadState();
  updateUI();
  saveState();
  
  if (elements.btnReplayTutorial) {
    elements.btnReplayTutorial.onclick = () => {
      elements.settingsModal.classList.remove('show');
      startHubTutorial();
    };
  }

  const isGuest = (user === 'Guest');
  const isNew = (totalRuns === 0);
  if ((isGuest || isNew) && !localStorage.getItem('mathQuestTutorialHub_' + user)) {
    setTimeout(() => {
      startHubTutorial();
    }, 500);
  }
};

function startHubTutorial() {
  const hubSteps = [
    { target: '.hub-panel-container', titleKey: 'tut_hub_welcome', descKey: 'tut_hub_welcome_desc' },
    { target: '.quests-panel', titleKey: 'tut_hub_quests', descKey: 'tut_hub_quests_desc' },
    { target: '#btnStartRun', titleKey: 'tut_hub_cave', descKey: 'tut_hub_cave_desc' },
    { target: '#btnShop', titleKey: 'tut_hub_shop', descKey: 'tut_hub_shop_desc' },
    { target: '#btnUpgrades', titleKey: 'tut_hub_upg', descKey: 'tut_hub_upg_desc' },
    { target: '#btnAchievements', titleKey: 'tut_hub_ach', descKey: 'tut_hub_ach_desc' },
    { target: '#btnBuffIndex', titleKey: 'tut_hub_buff', descKey: 'tut_hub_buff_desc' },
    { target: '#btnLeaderboard', titleKey: 'tut_hub_leaderboard', descKey: 'tut_hub_leaderboard_desc' },
    { target: '#btnVersus', titleKey: 'tut_hub_versus', descKey: 'tut_hub_versus_desc' },
    { target: '#btnSettings', titleKey: 'tut_hub_settings', descKey: 'tut_hub_settings_desc' },
    { target: '#btnBackToTitle', titleKey: 'tut_hub_logout', descKey: 'tut_hub_logout_desc' }
  ];
  const tut = new TutorialSystem(hubSteps, 'mathQuestTutorialHub_' + user);
  tut.start();
}

// Buff Info for Index
const buffPoolInfo = [
  { id: 'heal', nameKey: 'buff_heal_name', descKey: 'buff_heal_desc', icon: '💖' },
  { id: 'vitality', nameKey: 'buff_vit_name', descKey: 'buff_vit_desc', icon: '❤️‍🔥' },
  { id: 'time', nameKey: 'buff_time_name', descKey: 'buff_time_desc', icon: '⏳' },
  { id: 'greed', nameKey: 'buff_greed_name', descKey: 'buff_greed_desc', icon: '🤑' },
  { id: 'scholar', nameKey: 'buff_scholar_name', descKey: 'buff_scholar_desc', icon: '🎓' },
  { id: 'defense', nameKey: 'buff_def_name', descKey: 'buff_def_desc', icon: '🛡️' },
  { id: 'bossrush', nameKey: 'buff_boss_name', descKey: 'buff_boss_desc', icon: '👹' },
  { id: 'glasscannon', nameKey: 'buff_glass_name', descKey: 'buff_glass_desc', icon: '💥' },
  { id: 'vampirism', nameKey: 'buff_vamp_name', descKey: 'buff_vamp_desc', icon: '🦇' },
  { id: 'gambler', nameKey: 'buff_gambler_name', descKey: 'buff_gambler_desc', icon: '🎲' },
  { id: 'ninelives', nameKey: 'buff_nine_name', descKey: 'buff_nine_desc', icon: '🐱' },
  { id: 'timewarp', nameKey: 'buff_warp_name', descKey: 'buff_warp_desc', icon: '🌀' },
  { id: 'midas', nameKey: 'buff_midas_name', descKey: 'buff_midas_desc', icon: '👑' },
  { id: 'slowmo', nameKey: 'buff_slowmo_name', descKey: 'buff_slowmo_desc', icon: '🐌' },
  { id: 'berserk', nameKey: 'buff_berserk_name', descKey: 'buff_berserk_desc', icon: '💢' }
];

function populateBuffIndex() {
  elements.buffIndexList.innerHTML = '';
  buffPoolInfo.forEach(buff => {
    const card = document.createElement('div');
    card.className = 'stone-panel';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'center';
    card.style.padding = 'clamp(8px, 2vw, 12px)';
    card.style.textAlign = 'center';
    
    card.innerHTML = `
      <div style="font-size:clamp(2rem, 6vw, 3rem); filter:drop-shadow(2px 2px 0 rgba(0,0,0,1)); margin-bottom:8px;">${buff.icon}</div>
      <div style="font-family:'Press Start 2P',monospace; font-size:clamp(0.5rem, 2vw, 0.7rem); color:var(--text-gold); margin-bottom:8px; text-shadow:1px 1px 0 rgba(0,0,0,1);">${getTranslation(buff.nameKey, settings.language)}</div>
      <div style="font-family:'Comic Neue',cursive; font-size:clamp(0.7rem, 2.5vw, 0.9rem); color:#ccc; line-height:1.2;">${getTranslation(buff.descKey, settings.language)}</div>
    `;
    elements.buffIndexList.appendChild(card);
  });
}
