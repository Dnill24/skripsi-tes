const elements = {
  welcomeMessage: document.getElementById('welcomeMessage'),
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
  xCloseShop: document.getElementById('xCloseShop'),
  btnUpgrades: document.getElementById('btnUpgrades'),
  upgradesModal: document.getElementById('upgradesModal'),
  xCloseUpgrades: document.getElementById('xCloseUpgrades'),
  upgradesList: document.getElementById('upgradesList'),
  upgradesGoldDisplay: document.getElementById('upgradesGoldDisplay'),
  btnToggleQuests: document.getElementById('btnToggleQuests'),
  questsListContainer: document.getElementById('questsListContainer'),
  questsToggleIcon: document.getElementById('questsToggleIcon'),
  questsList: document.getElementById('questsList'),
  guestAchievementWarning: document.getElementById('guestAchievementWarning'),
  achievementsModal: document.getElementById('achievementsModal'),
  xCloseAchievements: document.getElementById('xCloseAchievements'),
  leaderboardModal: document.getElementById('leaderboardModal'),
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

function updateUI() {
  applyTranslationsToDOM(settings.language);
  
  if (elements.welcomeMessage) {
    if (user === 'Guest') {
      elements.welcomeMessage.textContent = getTranslation('welcome_guest', settings.language);
    } else {
      const template = getTranslation('welcome_user', settings.language);
      elements.welcomeMessage.innerHTML = template.replace('{user}', `<span class="text-yellow-400" id="playerNameDisplay">${user}</span>`);
    }
  }
  
  if (elements.playerMMRDisplay) {
    if (user === 'Guest') {
      elements.playerMMRDisplay.textContent = '???';
    } else {
      elements.playerMMRDisplay.textContent = window.getRankFromMMR ? window.getRankFromMMR(globalStats.playerMMR) : Math.floor(globalStats.playerMMR);
    }
  }
  elements.shopGoldDisplay.textContent = currency;
  if (elements.upgradesGoldDisplay) elements.upgradesGoldDisplay.textContent = currency;
  elements.statBestScore.textContent = bestRunScore;
  elements.statTotalGold.textContent = totalGoldEarned;
  elements.statBosses.textContent = totalBossesDefeated;
  const totalQuestions = (globalStats['+'] || 0) + (globalStats['-'] || 0) + (globalStats['*'] || 0) + (globalStats['/'] || 0);
  elements.statRuns.textContent = totalQuestions;
  renderShop();
  renderUpgrades();
  renderQuests();
  renderAchievements();
  if (document.getElementById('guestAchievementWarning')) {
    const warningEl = document.getElementById('guestAchievementWarning');
    if (user === 'Guest') {
      warningEl.classList.remove('hidden');
    } else {
      warningEl.classList.add('hidden');
    }
  }
  
  if (user === 'Guest') {
    ['btnShop', 'btnUpgrades', 'btnVersus'].forEach(id => {
      const btn = elements[id];
      if (btn && !btn.textContent.includes('🔒')) {
        btn.textContent = '🔒 ' + btn.textContent.replace('🔒', '').replace('🛒', '').replace('🔨', '').replace('🏆', '').replace('⚡', '').trim();
        btn.removeAttribute('data-i18n');
        btn.style.opacity = '0.7';
      }
    });
    
    if (elements.btnToggleQuests) {
      elements.btnToggleQuests.style.opacity = '0.5';
      elements.btnToggleQuests.style.filter = 'grayscale(1)';
      elements.btnToggleQuests.title = 'Create an account to unlock Daily Missions';
      elements.btnToggleQuests.onclick = () => {
        checkGuestFeature();
      };
    }
    
    elements.btnBackToTitle.textContent = '🚪 ' + getTranslation('btn_main_menu', settings.language);
    elements.btnBackToTitle.removeAttribute('data-i18n');
  } else {
    elements.btnBackToTitle.textContent = '🚪 ' + getTranslation('btn_leave', settings.language);
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

function renderLeaderboard() {
  elements.leaderboardList.innerHTML = '';
  const podiumContainer = document.getElementById('leaderboardPodium');
  if (podiumContainer) podiumContainer.innerHTML = '';
  
  if (!leaderboard || leaderboard.length === 0) {
    elements.leaderboardList.innerHTML = `<tr><td colspan="4" class="text-center p-5 font-[Comic_Neue] font-bold text-gray-400">${getTranslation('txt_empty_leaderboard', settings.language)}</td></tr>`;
    return;
  }
  
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 100);
  
  if (podiumContainer) {
    const top3 = sorted.slice(0, 3);
    const podiumOrder = [];
    if (top3.length > 1) podiumOrder.push({ ...top3[1], rank: 2 });
    if (top3.length > 0) podiumOrder.push({ ...top3[0], rank: 1 });
    if (top3.length > 2) podiumOrder.push({ ...top3[2], rank: 3 });
    
    podiumOrder.forEach(entry => {
      const height = entry.rank === 1 ? '90px' : (entry.rank === 2 ? '70px' : '50px');
      const color = entry.rank === 1 ? '#ffd700' : (entry.rank === 2 ? '#e0e0e0' : '#cd7f32');
      const borderColor = entry.rank === 1 ? '#b8860b' : (entry.rank === 2 ? '#9e9e9e' : '#a0522d');
      
      const el = document.createElement('div');
      el.style = `display:flex; flex-direction:column; align-items:center; width:33%; justify-content:flex-end;`;
      
      const mmrRank = entry.mmr ? (window.getRankFromMMR ? window.getRankFromMMR(entry.mmr) : Math.floor(entry.mmr)) : (window.getRankFromMMR ? window.getRankFromMMR(0) : '🪨 Iron');
      
      const avatarAnim = entry.rank === 1 ? `style="animation: float 3s ease-in-out infinite;"` : '';
      
      let starHtml = '';
      if (entry.rank === 1) starHtml = '<span class="animate-pulse drop-shadow-md">✨</span>';
      if (entry.rank === 2) starHtml = '<span class="animate-pulse drop-shadow-md" style="filter: grayscale(100%) brightness(1.5);">✨</span>';
      if (entry.rank === 3) starHtml = '<span class="animate-pulse drop-shadow-md" style="filter: hue-rotate(-30deg) saturate(1.5) brightness(0.8);">✨</span>';
      
      el.innerHTML = `
        <div class="relative text-[clamp(1.5rem,3vw,2.5rem)] mb-1 drop-shadow-[0_4px_2px_rgba(0,0,0,0.5)]" ${avatarAnim}>
          ${entry.skin || '🧍'}
        </div>
        <div class="font-minecraft text-[0.45rem] text-white max-w-full overflow-hidden text-ellipsis whitespace-nowrap mb-1" title="${entry.name}">
          ${starHtml ? starHtml + ' ' : ''}${entry.name}${starHtml ? ' ' + starHtml : ''}
        </div>
        <div class="font-minecraft text-[0.4rem] text-blue-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">${mmrRank}</div>
        <div class="font-minecraft text-[0.45rem] text-green-400 mb-1">${entry.score.toLocaleString()}</div>
        <div class="w-full flex justify-center items-start pt-2 rounded-t-sm border-t-4 border-l-4 border-r-4 shadow-[inset_0_-8px_0_rgba(0,0,0,0.3),_inset_0_4px_0_rgba(255,255,255,0.4)] relative overflow-hidden" 
             style="height:${height}; background:${color}; border-color:${borderColor};">
          ${entry.rank === 1 ? `<div class="absolute top-0 left-0 w-[50%] h-[200%] bg-white opacity-40 mix-blend-overlay" style="transform: skewX(-45deg) translateX(-200%); animation: shineSweep 3s infinite;"></div>` : ''}
          <span class="font-minecraft text-[1.5rem] relative z-10" style="color:#000;">${entry.rank}</span>
        </div>
      `;
      podiumContainer.appendChild(el);
    });
  }
  
  const rest = sorted.slice(3);
  rest.forEach((entry, idx) => {
    const realRank = idx + 4;
    const tr = document.createElement('tr');
    tr.style.borderBottom = '4px solid var(--panel-border)';
    tr.style.background = idx % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';
    
    tr.innerHTML = `
      <td class="p-[clamp(4px,1vw,12px)] text-center font-minecraft text-[clamp(0.45rem,1.5vw,0.65rem)] text-white whitespace-nowrap">#${realRank}</td>
      <td class="p-[clamp(4px,1vw,12px)] font-minecraft text-[clamp(0.45rem,1.5vw,0.65rem)] text-white max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis" title="${entry.name}">
        <span class="text-[clamp(0.8rem,2vw,1.2rem)] mr-1 align-middle">${entry.skin || '🧍'}</span><span class="align-middle">${entry.name}</span>
      </td>
      <td class="p-[clamp(4px,1vw,12px)] text-right font-minecraft text-[clamp(0.45rem,1.5vw,0.65rem)] text-blue-400 whitespace-nowrap">${entry.mmr ? (window.getRankFromMMR ? window.getRankFromMMR(entry.mmr) : Math.floor(entry.mmr)) : (window.getRankFromMMR ? window.getRankFromMMR(0) : '🪨 Iron')}</td>
      <td class="p-[clamp(4px,1vw,12px)] text-right font-minecraft text-[clamp(0.45rem,1.5vw,0.65rem)] text-green-400 whitespace-nowrap">${entry.score.toLocaleString()}</td>
    `;
    elements.leaderboardList.appendChild(tr);
  });
}

function checkGuestFeature() {
  if (user === 'Guest') {
    const msg = window.getTranslation ? window.getTranslation('toast_guest_feature', settings.language) : "Not available for Guest. Please sign up to save your progress!";
    if (typeof window.showToast === 'function') {
      window.showToast(msg, "error");
    } else {
      alert(msg);
    }
    return true;
  }
  return false;
}

// Mode Selection Menus
const modeMainMenu = document.getElementById('modeMainMenu');
const modeCampaignMenu = document.getElementById('modeCampaignMenu');
const modePracticeMenu = document.getElementById('modePracticeMenu');

const resetModeMenu = () => {
  modeMainMenu.classList.remove('hidden');
  modeCampaignMenu.classList.add('hidden');
  modePracticeMenu.classList.add('hidden');
  
  const header = document.getElementById('modeModalHeader');
  if (header) {
    header.setAttribute('data-i18n', 'modal_mode');
    header.textContent = getTranslation('modal_mode', settings.language) || "⚔️ Select Mode";
  }
};

elements.closeModeModal.onclick = () => { elements.modeModal.classList.remove('show'); resetModeMenu(); };
elements.xCloseMode.onclick = elements.closeModeModal.onclick;

document.getElementById('btnShowCampaign').onclick = () => {
  modeMainMenu.classList.add('hidden');
  modeCampaignMenu.classList.remove('hidden');
  
  const header = document.getElementById('modeModalHeader');
  if (header) {
    header.setAttribute('data-i18n', 'modal_level');
    header.textContent = getTranslation('modal_level', settings.language) || "📜 Select Level";
  }
  
  populateCampaignLevels();
};

document.getElementById('btnShowPractice').onclick = () => {
  modeMainMenu.classList.add('hidden');
  modePracticeMenu.classList.remove('hidden');
};

document.getElementById('btnBackFromCampaign').onclick = resetModeMenu;
document.getElementById('btnBackFromPractice').onclick = resetModeMenu;

function populateCampaignLevels() {
  const grid = document.getElementById('campaignLevelGrid');
  grid.innerHTML = '';
  const highestLevel = globalStats.highestLevelUnlocked || 1;
  const lblLevel = getTranslation('lbl_level', settings.language) || "Level {lvl}";
  const lblLocked = getTranslation('lbl_locked', settings.language) || "Locked";

  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    let btnClass = 'opacity-50 cursor-not-allowed';
    if (i < highestLevel) btnClass = 'light-blue';
    else if (i === highestLevel) btnClass = 'success';
    
    btn.className = `wood-btn p-2 text-sm flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis min-h-[44px] ${btnClass}`;
    
    if (i <= highestLevel) {
      btn.innerHTML = `⚔️ ${lblLevel.replace('{lvl}', i)}`;
      btn.onclick = () => {
        localStorage.setItem('mathQuestMode', 'campaign');
        localStorage.setItem('mathQuestLevel', i);
        window.location.href = 'play.html';
      };
    } else {
      btn.innerHTML = `🔒 ${lblLocked}`;
      btn.disabled = true;
    }
    grid.appendChild(btn);
  }
}

document.querySelectorAll('.btn-mode').forEach(btn => {
  btn.onclick = () => {
    localStorage.setItem('mathQuestMode', btn.dataset.mode);
    window.location.href = 'play.html';
  };
});

// Modals
elements.btnShop.onclick = () => { 
  if (checkGuestFeature()) return;
  elements.shopModal.classList.add('show'); 
  updateUI(); 
};
elements.xCloseShop.onclick = () => { elements.shopModal.classList.remove('show'); };

elements.btnUpgrades.onclick = () => {
  if (checkGuestFeature()) return;
  elements.upgradesModal.classList.add('show');
  updateUI();
};
elements.xCloseUpgrades.onclick = () => { elements.upgradesModal.classList.remove('show'); };

if (elements.btnToggleQuests) {
  elements.btnToggleQuests.onclick = () => {
    if (elements.questsListContainer.classList.contains('hidden')) {
      elements.questsListContainer.classList.remove('hidden');
      elements.questsToggleIcon.style.transform = 'rotate(180deg)';
      if (typeof SFX !== 'undefined') SFX.btnClick();
    } else {
      elements.questsListContainer.classList.add('hidden');
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
  elements.settingsModal.classList.remove('show');
  updateUI();
};

elements.btnBackToTitle.onclick = () => { window.location.href = 'index.html'; };

if (document.getElementById('rankDisplayBtn')) {
  document.getElementById('rankDisplayBtn').onclick = () => {
    if (checkGuestFeature()) return;
    if (typeof SFX !== 'undefined') SFX.btnClick();
    const mmr = globalStats.playerMMR || 10;
    document.getElementById('rankInfoCurrentMMR').textContent = Math.floor(mmr);
    document.getElementById('rankInfoCurrentMult').textContent = (1 + (mmr / 100)).toFixed(2) + 'x';
    document.getElementById('rankInfoModal').classList.add('show');
  };
}

if (document.getElementById('xCloseRankInfo')) {
  document.getElementById('xCloseRankInfo').onclick = () => {
    if (typeof SFX !== 'undefined') SFX.btnClick();
    document.getElementById('rankInfoModal').classList.remove('show');
  };
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
      <div class="text-[clamp(2rem,6vw,3rem)] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mb-2">${buff.icon}</div>
      <div class="font-minecraft text-[clamp(0.5rem,2vw,0.7rem)] text-yellow-400 mb-2 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">${getTranslation(buff.nameKey, settings.language)}</div>
      <div class="font-[Comic_Neue] text-[clamp(0.7rem,2.5vw,0.9rem)] text-[#ccc] leading-[1.2]">${getTranslation(buff.descKey, settings.language)}</div>
    `;
    elements.buffIndexList.appendChild(card);
  });
}

function startHubTutorial() {
  const hubSteps = [
    { target: 'none', titleKey: 'tut_hub_welcome', descKey: 'tut_hub_welcome_desc' },
    { target: '#rankDisplayBtn', titleKey: 'tut_hub_rank', descKey: 'tut_hub_rank_desc' },
    { target: '.quests-panel', titleKey: 'tut_hub_quests', descKey: 'tut_hub_quests_desc' },
    { target: '#btnAchievements', titleKey: 'tut_hub_ach', descKey: 'tut_hub_ach_desc' },
    { target: '#btnBuffIndex', titleKey: 'tut_hub_buff', descKey: 'tut_hub_buff_desc' },
    { target: '#btnSettings', titleKey: 'tut_hub_settings', descKey: 'tut_hub_settings_desc' },
    { target: '#btnStartRun', titleKey: 'tut_hub_cave', descKey: 'tut_hub_cave_desc' },
    { target: '#btnVersus', titleKey: 'tut_hub_versus', descKey: 'tut_hub_versus_desc' },
    { target: '#btnShop', titleKey: 'tut_hub_shop', descKey: 'tut_hub_shop_desc' },
    { target: '#btnUpgrades', titleKey: 'tut_hub_upg', descKey: 'tut_hub_upg_desc' },
    { target: '#btnLeaderboard', titleKey: 'tut_hub_leaderboard', descKey: 'tut_hub_leaderboard_desc' },
    { target: '#btnBackToTitle', titleKey: 'tut_hub_logout', descKey: 'tut_hub_logout_desc' }
  ];
  const tut = new TutorialSystem(hubSteps, 'mathQuestTutorialHub_' + user);
  tut.start();
}
