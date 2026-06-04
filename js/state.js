const elements = {
  btnFlee: document.getElementById('btnFlee'),
  lblRunStage: document.getElementById('lblRunStage'),
  lblScore: document.getElementById('lblScore'),
  lblRunGold: document.getElementById('lblRunGold'),
  activeBuffsContainer: document.getElementById('activeBuffsContainer'),
  lblHealth: document.getElementById('lblHealth'),
  lblCombo: document.getElementById('lblCombo'),
  barPlayerHp: document.getElementById('barPlayerHp'),
  combatText: document.getElementById('combatText'),
  barTimer: document.getElementById('barTimer'),
  lblQuestion: document.getElementById('lblQuestion'),
  answerGrid: document.getElementById('answerGrid'),
  battleArena: document.getElementById('gameArenaWrapper'),
  playerSprite: document.getElementById('playerSprite'),
  enemySprite: document.getElementById('enemySprite'),
  enemyShadow: document.getElementById('enemyGround'),
  bossHpContainer: document.getElementById('bossHpContainer'),
  barBossHp: document.getElementById('barBossHp'),
  barProgress: document.getElementById('barProgress'),
  runOverModal: document.getElementById('runOverModal'),
  runOverMessage: document.getElementById('runOverMessage'),
  finalScore: document.getElementById('finalScore'),
  finalGold: document.getElementById('finalGold'),
  finalStages: document.getElementById('finalStages'),
  finalCorrect: document.getElementById('finalCorrect'),
  finalWrong: document.getElementById('finalWrong'),
  finalCombo: document.getElementById('finalCombo'),
  btnReturnHub: document.getElementById('btnReturnHub'),
  recommendationBox: document.getElementById('recommendationBox'),
  recSubject: document.getElementById('recSubject'),
  btnPracticeRec: document.getElementById('btnPracticeRec'),
  rewardModal: document.getElementById('rewardModal'),
  rewardCardsContainer: document.getElementById('rewardCardsContainer'),
  lblDefense: document.getElementById('lblDefense'),
  lblGoldMod: document.getElementById('lblGoldMod'),
  lblScoreMod: document.getElementById('lblScoreMod'),
  btnPause: document.getElementById('btnPause'),
  pauseModal: document.getElementById('pauseModal'),
  sfxVolumeSlider: document.getElementById('sfxVolumeSlider'),
  sfxVolumeValue: document.getElementById('sfxVolumeValue'),
  musicVolumeSlider: document.getElementById('musicVolumeSlider'),
  musicVolumeValue: document.getElementById('musicVolumeValue'),
  btnResumePause: document.getElementById('btnResumePause'),
  btnQuitPause: document.getElementById('btnQuitPause')
};

let currency = 0;
let bestRunScore = 0;
let totalGoldEarned = 0;
let totalBossesDefeated = 0;
let totalRuns = 0;
let highestStreak = 0;
let totalQuestionsAnswered = 0;
let selectedSkin = 'rainbow';
let globalStats = { '+': 0, '-': 0, '*': 0, '/': 0, fastestTime: 999, bossRushBosses: 0, glassCannonBosses: 0, comboGod: 0, playerMMR: 10 };

let gameMode = localStorage.getItem('mathQuestMode') || 'normal';
let settings = { volume: 50, language: 'en' };
let currentQuestion = null;

let timerInterval;
let MAX_TIME = 15;
let currentMaxTime = 15;
let timeLeft = currentMaxTime;

let run = {
  active: true,
  questionsAnswered: 0,
  score: 0,
  goldEarned: 0,
  health: 100,
  maxHealth: 100,
  streak: 0,
  difficultyLevel: 1.0,
  bossHP: 0,
  bossMaxHP: 0,
  bossStage: 0,
  isBoss: false,
  currentQuestion: null,
  stats: {
    '+': { correct: 0, total: 0, nameKey: 'sub_add' },
    '-': { correct: 0, total: 0, nameKey: 'sub_sub' },
    '*': { correct: 0, total: 0, nameKey: 'sub_mul' },
    '/': { correct: 0, total: 0, nameKey: 'sub_div' }
  },
  modifiers: {
    goldMult: 1.0,
    scoreMult: 1.0,
    dmgReduction: 0,
    bossRush: false,
    vampirism: false,
    gambler: false,
    nineLives: false,
    timeWarp: false
  },
  activeBuffs: []
};

const skinEmojis = {
  'rainbow': '🧍', 'peasant': '🧑‍🌾', 'adventurer': '🧝', 'stone': '👹',
  'knight': '🤺', 'mage': '🧙', 'glow': '🧚', 'ninja': '🥷', 'robot': '🤖',
  'gold': '🤴', 'diamond': '🫅', 'fire': '🦸', 'ice': '🧛', 'phantom': '👻',
  'alien': '👽', 'demon': '👿', 'angel': '👼', 'dragon': '🐉', 'void': '🧑‍🚀',
  'celestial': '🧞', 'god': '🦹'
};

const bossEmojis = ['🐲', '🧟', '🧛', '👹', '👽', '💀', '🤡', '🤖', '🦖', '🦂', '👁️', '🎃'];
const enemyEmojis = ['👾', '👻', '🦇', '🕷️', '🐍'];

const buffPool = [
  { id: 'heal', nameKey: 'buff_heal_name', descKey: 'buff_heal_desc', icon: '❤️', apply: () => { run.health = Math.min(Number(run.maxHealth), Number(run.health) + 50); } },
  { id: 'vitality', nameKey: 'buff_vit_name', descKey: 'buff_vit_desc', icon: '💪', apply: () => { run.maxHealth = Number(run.maxHealth) + 25; run.health = Number(run.health) + 25; } },
  { id: 'time', nameKey: 'buff_time_name', descKey: 'buff_time_desc', icon: '⌛', apply: () => { MAX_TIME += 2; } },
  { id: 'greed', nameKey: 'buff_greed_name', descKey: 'buff_greed_desc', icon: '💰', apply: () => { run.modifiers.goldMult += 0.5; } },
  { id: 'scholar', nameKey: 'buff_scholar_name', descKey: 'buff_scholar_desc', icon: '📚', apply: () => { run.modifiers.scoreMult += 0.5; } },
  { id: 'defense', nameKey: 'buff_def_name', descKey: 'buff_def_desc', icon: '🛡️', apply: () => { run.modifiers.dmgReduction += 3; } },
  { id: 'bossrush', nameKey: 'buff_boss_name', descKey: 'buff_boss_desc', icon: '💀', apply: () => { run.modifiers.bossRush = true; run.modifiers.goldMult += 2.0; run.modifiers.scoreMult += 2.0; } },
  { id: 'glasscannon', nameKey: 'buff_glass_name', descKey: 'buff_glass_desc', icon: '🧪', apply: () => { run.modifiers.glassCannon = true; run.maxHealth = 1; run.health = 1; run.modifiers.goldMult += 2.0; run.modifiers.scoreMult += 2.0; } },
  { id: 'vampirism', nameKey: 'buff_vamp_name', descKey: 'buff_vamp_desc', icon: '🦇', apply: () => { run.modifiers.vampirism = true; } },
  { id: 'gambler', nameKey: 'buff_gambler_name', descKey: 'buff_gambler_desc', icon: '🎲', apply: () => { run.modifiers.gambler = true; } },
  { id: 'ninelives', nameKey: 'buff_nine_name', descKey: 'buff_nine_desc', icon: '🐱', apply: () => { run.modifiers.nineLives = true; } },
  { id: 'timewarp', nameKey: 'buff_warp_name', descKey: 'buff_warp_desc', icon: '⏳', apply: () => { run.modifiers.timeMult = (run.modifiers.timeMult || 1.0) * 0.33; run.modifiers.scoreMult += 2.0; } },
  { id: 'midas', nameKey: 'buff_midas_name', descKey: 'buff_midas_desc', icon: '✨', apply: () => { run.modifiers.goldMult += 4.0; run.modifiers.enemyDamageMult = (run.modifiers.enemyDamageMult || 1) * 2; } },
  { id: 'slowmo', nameKey: 'buff_slowmo_name', descKey: 'buff_slowmo_desc', icon: '🐢', apply: () => { run.modifiers.timeMult = (run.modifiers.timeMult || 1.0) * 2.0; run.modifiers.scoreMult *= 0.5; } },
  { id: 'berserk', nameKey: 'buff_berserk_name', descKey: 'buff_berserk_desc', icon: '💢', apply: () => { run.modifiers.berserk = true; run.modifiers.scoreMult += 0.5; MAX_TIME = Math.max(5, MAX_TIME - 5); } }
];
let user = 'Hero';

function loadState() {
  const userStored = localStorage.getItem('mathQuestUser');
  if (userStored) {
    try { user = JSON.parse(userStored).user; } catch(e){}
  }

  const saved = localStorage.getItem('mathQuestRogueStats');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Added safely loading run from saved state
      if (parsed.run && parsed.run.active) {
        run = parsed.run;
        if (typeof run.difficultyLevel !== 'number' || isNaN(run.difficultyLevel)) {
          run.difficultyLevel = 1.0;
        }
      }
      
      currency = parsed.currency ?? 0;
      bestRunScore = parsed.bestRunScore ?? 0;
      totalGoldEarned = parsed.totalGoldEarned ?? 0;
      totalBossesDefeated = parsed.totalBossesDefeated ?? 0;
      totalRuns = parsed.totalRuns ?? 0;
      highestStreak = parsed.highestStreak ?? 0;
      totalQuestionsAnswered = parsed.totalQuestionsAnswered ?? 0;
      selectedSkin = parsed.selectedSkin || 'rainbow';
      if (parsed.dailyQuests) window.dailyQuests = parsed.dailyQuests;
      globalStats = parsed.globalStats || { '+': 0, '-': 0, '*': 0, '/': 0, fastestTime: 999, bossRushBosses: 0, glassCannonBosses: 0, comboGod: 0, playerMMR: 10 };
      globalStats.playerMMR = globalStats.playerMMR ?? 10;
    } catch(e){}
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
  
  elements.playerSprite.textContent = skinEmojis[selectedSkin] || '🧍';
}

function saveState() {
  try {
    const saved = localStorage.getItem('mathQuestRogueStats');
    let parsed = {};
    if (saved) { try { parsed = JSON.parse(saved); } catch(e){} }
    
    parsed.currency = currency;
    parsed.bestRunScore = Math.max(bestRunScore, run.score);
    parsed.totalGoldEarned = totalGoldEarned;
    parsed.totalBossesDefeated = totalBossesDefeated;
    parsed.totalRuns = totalRuns;
    parsed.highestStreak = Math.max(highestStreak, run.streak);
    parsed.totalQuestionsAnswered = totalQuestionsAnswered;
    parsed.globalStats = globalStats;
    parsed.run = run; // Save run state properly
    if (window.dailyQuests) parsed.dailyQuests = window.dailyQuests;
    
    localStorage.setItem('mathQuestRogueStats', JSON.stringify(parsed));
    
    if (typeof db !== 'undefined' && user !== 'Hero' && user !== 'Guest') {
      const cleanName = user.trim().replace(/[.#$[\]\s/]/g, '_').toLowerCase();
      const firebaseData = JSON.parse(JSON.stringify(parsed, (k, v) => (typeof v === 'number' && isNaN(v)) ? 0 : v));
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
  } catch (err) {
    console.error("Error saving state:", err);
  }
}

function updateQuestProgress(type, amount, isReplace = false) {
  if (window.dailyQuests && window.dailyQuests.quests) {
    window.dailyQuests.quests.forEach(q => {
      if (q.type === type && !q.completed) {
        if (isReplace) {
          q.progress = Math.max(q.progress, amount);
        } else {
          q.progress += amount;
        }
        if (q.progress >= q.target) {
          q.completed = true;
          showCombatText("Bounty Complete!", "text-purple-400 text-3xl", "center");
        }
      }
    });
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}


