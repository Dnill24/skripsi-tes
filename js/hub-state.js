let leaderboard = [];
let user = 'Hero';
let currency = 0;
let bestRunScore = 0;
let totalGoldEarned = 0;
let totalBossesDefeated = 0;
let totalRuns = 0;
let selectedSkin = 'hero';
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

let skins = [
  { id: 'hero', nameKey: 'skin_hero_name', descKey: 'skin_hero_desc', cost: 0, unlocked: true, icon: '<img src="characters/Hero.png" style="height:1em; width:1em; object-fit:contain; display:inline-block; vertical-align:middle; pointer-events:none;">' },
  { id: 'knight', nameKey: 'skin_knight_name', descKey: 'skin_knight_desc', cost: 50, unlocked: false, icon: '<img src="characters/Knight.png" style="height:1em; width:1em; object-fit:contain; display:inline-block; vertical-align:middle; pointer-events:none;">' },
  { id: 'ninja', nameKey: 'skin_ninja_name', descKey: 'skin_ninja_desc', cost: 100, unlocked: false, icon: '<img src="characters/Ninja.png" style="height:1em; width:1em; object-fit:contain; display:inline-block; vertical-align:middle; pointer-events:none;">' },
  { id: 'robot', nameKey: 'skin_robot_name', descKey: 'skin_robot_desc', cost: 250, unlocked: false, icon: '<img src="characters/Robot.png" style="height:1em; width:1em; object-fit:contain; display:inline-block; vertical-align:middle; pointer-events:none;">' },
  { id: 'wizard', nameKey: 'skin_wizard_name', descKey: 'skin_wizard_desc', cost: 500, unlocked: false, icon: '<img src="characters/Wizard.png" style="height:1em; width:1em; object-fit:contain; display:inline-block; vertical-align:middle; pointer-events:none;">' },
  { id: 'angel', nameKey: 'skin_angel_name', descKey: 'skin_angel_desc', cost: 1000, unlocked: false, icon: '<img src="characters/Angel.png" style="height:1em; width:1em; object-fit:contain; display:inline-block; vertical-align:middle; pointer-events:none;">' }
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
  { id: 'true_hero', nameKey: 'ach_m5_name', descKey: 'ach_m5_desc', getProgress: () => skins.find(s => s.id === 'angel').unlocked ? 1 : 0, target: 1 }
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
    elements.sfxVolumeSlider.value = settings.sfxVolume ?? 70;
    elements.sfxVolumeValue.textContent = (settings.sfxVolume ?? 70) + '%';
    elements.musicVolumeSlider.value = settings.musicVolume ?? 50;
    elements.musicVolumeValue.textContent = (settings.musicVolume ?? 50) + '%';
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
      selectedSkin = parsed.selectedSkin || 'hero';
      if (!skins.find(s => s.id === selectedSkin)) {
        selectedSkin = 'hero';
      }
      globalStats = parsed.globalStats || globalStats;
      if (parsed.upgrades) upgrades = parsed.upgrades;
      if (parsed.dailyQuests) dailyQuests = parsed.dailyQuests;
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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
  
  const gradeKey = 'mathQuestGradeSelectedSession';
  const tutorialKey = 'mathQuestTutorialHub_' + user;
  
  if ((isGuest || isNew) && !sessionStorage.getItem(gradeKey)) {
    // Show grade selection modal
    const gradeModal = document.getElementById('gradeSelectModal');
    gradeModal.classList.add('show');
    
    document.querySelectorAll('.grade-btn').forEach(btn => {
      btn.onclick = () => {
        const mmr = parseInt(btn.dataset.mmr);
        globalStats.playerMMR = mmr;
        saveState();
        updateUI();
        sessionStorage.setItem(gradeKey, 'true');
        gradeModal.classList.remove('show');
        
        // Start tutorial if needed after selecting grade
        if ((isGuest || isNew) && !localStorage.getItem(tutorialKey)) {
          setTimeout(() => startHubTutorial(), 500);
        }
      };
    });
  } else {
    if ((isGuest || isNew) && !localStorage.getItem(tutorialKey)) {
      setTimeout(() => startHubTutorial(), 500);
    }
  }
};
