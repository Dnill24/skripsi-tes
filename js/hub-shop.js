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
      <div class="text-[clamp(2.5rem,8vw,4rem)] mb-3 drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)] origin-bottom transition-transform duration-200 hover:scale-125">${skin.icon}</div>
      <div class="font-minecraft text-[clamp(0.45rem,2vw,0.6rem)] text-white mb-2 drop-shadow-[1px_1px_0_rgba(0,0,0,1)] text-center h-6">${getTranslation(skin.nameKey, settings.language)}</div>
      ${!skin.unlocked ? `<div class="font-minecraft text-[clamp(0.55rem,2vw,0.7rem)] text-yellow-400 mb-3 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">🪙 ${skin.cost}</div>` : '<div class="h-[22px] mb-3"></div>'}
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
      <div class="flex-1">
        <div class="font-minecraft text-[clamp(0.5rem,2vw,0.7rem)] text-yellow-400 mb-[clamp(4px,1vw,8px)] drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">${getTranslation(upg.nameKey, settings.language)} (Lv. ${upg.level}/${upg.maxLevel})</div>
        <div class="font-[Comic_Neue] text-[clamp(0.7rem,2.5vw,0.9rem)] text-[#ccc] mb-2">${getTranslation(upg.descKey, settings.language)}</div>
        <div class="w-full h-3 bg-[#263238] rounded-md overflow-hidden border-2 border-[var(--panel-border)]">
          <div class="h-full bg-green-500 border-r-2 border-[var(--panel-border)]" style="width:${(upg.level / upg.maxLevel) * 100}%"></div>
        </div>
      </div>
      <div>
        ${isMax ? `<button class="wood-btn opacity-50 grayscale" disabled>MAX</button>` : `<button class="wood-btn" id="btnBuyUpg_${key}">🪙 ${cost}</button>`}
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
