function showCombatText(text, colorClass, target = 'center') {
  const container = document.getElementById('gameArenaWrapper');
  if (!container) return;
  
  const el = document.createElement('div');
  el.textContent = text;
  
  let baseClasses = 'absolute transform -translate-x-1/2 -translate-y-1/2 font-minecraft font-bold drop-shadow-[3px_3px_0_rgba(0,0,0,1)] text-center z-50 pointer-events-none ';
  
  if (target === 'player') {
    el.style.top = '60%';
    el.style.left = '25%';
    baseClasses += 'text-sm md:text-3xl ';
  } else if (target === 'enemy') {
    el.style.top = '60%';
    el.style.left = '75%';
    baseClasses += 'text-sm md:text-3xl ';
  } else {
    el.style.top = '50%';
    el.style.left = '50%';
    baseClasses += 'text-2xl md:text-6xl ';
  }
  
  el.className = baseClasses + colorClass;
  el.style.animation = 'combatTextFloat 1s cubic-bezier(0.25, 1, 0.5, 1) forwards';
  container.appendChild(el);
  
  if (target === 'player' || colorClass.includes('red') || colorClass.includes('blue')) {
    if (elements.playerSprite && elements.playerSprite.parentElement) {
      elements.playerSprite.parentElement.classList.add('shake');
      elements.playerSprite.classList.add('anim-hit-flash');
      setTimeout(() => {
        elements.playerSprite.parentElement.classList.remove('shake');
        elements.playerSprite.classList.remove('anim-hit-flash');
      }, 500);
    }
  } else {
    if (elements.enemySprite && elements.enemySprite.parentElement) {
      elements.enemySprite.parentElement.classList.add('shake');
      elements.enemySprite.classList.add('anim-hit-flash');
      setTimeout(() => {
        elements.enemySprite.parentElement.classList.remove('shake');
        elements.enemySprite.classList.remove('anim-hit-flash');
      }, 500);
    }
  }

  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 1000);
}

function spawnCoins(amount, x, y) {
  const container = document.getElementById('gameArenaWrapper');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const relX = x - rect.left;
  const relY = y - rect.top;
  
  for (let i = 0; i < Math.min(amount, 10); i++) {
    const coin = document.createElement('div');
    coin.textContent = '🪙';
    coin.className = 'coin-drop';
    coin.style.left = relX + 'px';
    coin.style.top = relY + 'px';
    const offsetX = (Math.random() - 0.5) * 150;
    const offsetY = -Math.random() * 100 - 50;
    coin.style.setProperty('--tx', offsetX + 'px');
    coin.style.setProperty('--ty', offsetY + 'px');
    container.appendChild(coin);
    setTimeout(() => { if (coin.parentNode) coin.remove(); }, 1000);
  }
}

// ——— SLASH VFX ——————————————————————————————————————————————————————
function spawnSlashAt(targetEl, isBoss = false) {
  const arena = document.getElementById('gameArenaWrapper');
  if (!arena || !targetEl) return;
  const arenaRect = arena.getBoundingClientRect();
  const tRect = targetEl.getBoundingClientRect();
  const cx = tRect.left + tRect.width / 2 - arenaRect.left;
  const cy = tRect.top + tRect.height / 2 - arenaRect.top;

  const slashSymbols = ['⚔️', '✨', '💥', '⚡'];
  const sym = slashSymbols[Math.floor(Math.random() * slashSymbols.length)];

  const el = document.createElement('div');
  el.textContent = sym;
  el.className = isBoss ? 'slash-effect-big' : 'slash-effect';
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  arena.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

function triggerPlayerAttack() {
  const sprite = elements.playerSprite;
  sprite.classList.remove('anim-player-attack');
  void sprite.offsetWidth;
  sprite.classList.add('anim-player-attack');

  if (typeof SFX !== 'undefined') SFX.slash();

  // Spawn slash at enemy after lunge reaches ~55% of animation
  setTimeout(() => {
    if (typeof SFX !== 'undefined') SFX.hit();
    if (typeof run !== 'undefined' && run && run.isBoss) {
      spawnSlashAt(elements.enemySprite, true);
      if (typeof SFX !== 'undefined') SFX.bossHit();
    } else {
      spawnSlashAt(elements.enemySprite, false);
    }
    // Enemy flash on impact
    if (elements.enemySprite) {
      elements.enemySprite.classList.remove('anim-hit-flash');
      void elements.enemySprite.offsetWidth;
      elements.enemySprite.classList.add('anim-hit-flash');
      setTimeout(() => elements.enemySprite.classList.remove('anim-hit-flash'), 300);
    }
  }, 250);
}

function triggerEnemyAttack() {
  const sprite = elements.enemySprite;
  sprite.classList.remove('anim-enemy-attack', 'anim-boss-attack');
  void sprite.offsetWidth;
  
  if (typeof run !== 'undefined' && run && run.isBoss) {
    sprite.classList.add('anim-boss-attack');
    elements.battleArena.classList.remove('anim-arena-shake');
    void elements.battleArena.offsetWidth;
    setTimeout(() => {
      elements.battleArena.classList.add('anim-arena-shake');
      if (typeof SFX !== 'undefined') SFX.playerHurt();
      // Enemy slash on player
      spawnSlashAt(elements.playerSprite, false);
    }, 350);
  } else {
    sprite.classList.add('anim-enemy-attack');
    setTimeout(() => {
      if (typeof SFX !== 'undefined') SFX.playerHurt();
      spawnSlashAt(elements.playerSprite, false);
    }, 250);
  }
}

function evaluateExpressionSteps(exprString) {
  let tokens = exprString.split(' ');
  let steps = [ [...tokens] ];
  
  while (tokens.length > 1) {
    let opIndex = -1;
    for (let i = 1; i < tokens.length; i += 2) {
      if (tokens[i] === '*' || tokens[i] === '/') {
        opIndex = i;
        break;
      }
    }
    if (opIndex === -1) {
      for (let i = 1; i < tokens.length; i += 2) {
        if (tokens[i] === '+' || tokens[i] === '-') {
          opIndex = i;
          break;
        }
      }
    }
    
    if (opIndex !== -1) {
      let a = parseInt(tokens[opIndex - 1]);
      let b = parseInt(tokens[opIndex + 1]);
      let op = tokens[opIndex];
      let res = 0;
      if (op === '+') res = a + b;
      if (op === '-') res = a - b;
      if (op === '*') res = a * b;
      if (op === '/') res = Math.floor(a / b);
      
      tokens.splice(opIndex - 1, 3, res.toString());
      steps.push([ ...tokens ]);
    } else {
      break;
    }
  }
  return steps;
}

async function playCalculationAnimation(exprString) {
  const container = document.getElementById('calcAnimContainer');
  const content = document.getElementById('calcAnimContent');
  
  if (!container || !content) return;
  
  container.classList.remove('hidden');
  void container.offsetWidth;
  
  let steps = evaluateExpressionSteps(exprString);
  content.innerHTML = '';
  let tokenElements = [];
  
  steps[0].forEach((token) => {
    let span = document.createElement('span');
    span.className = 'calc-token text-yellow-400 mx-2';
    span.textContent = token.replaceAll('*', '×').replaceAll('/', '÷');
    content.appendChild(span);
    tokenElements.push(span);
  });
  
  const wait = ms => new Promise(res => setTimeout(res, ms));
  await wait(500);
  
  for (let s = 1; s < steps.length; s++) {
    const stepIndex = s - 1; // for pitch ladder
    let diffIndex = -1;
    for (let i = 0; i < steps[s-1].length; i++) {
      if (steps[s-1][i] !== steps[s][i]) {
        diffIndex = i;
        break;
      }
    }
    
    let opIndex = diffIndex + 1;
    if (['+', '-', '*', '/'].includes(steps[s-1][diffIndex])) {
      opIndex = diffIndex;
    }
    
    tokenElements[opIndex - 1].classList.add('anim-scale-up-glow');
    tokenElements[opIndex].classList.add('anim-scale-up-glow');
    tokenElements[opIndex + 1].classList.add('anim-scale-up-glow');
    
    if (typeof SFX !== 'undefined') SFX.calcStep(stepIndex);
    await wait(600);
    
    let mergedVal = steps[s][diffIndex];
    tokenElements[opIndex - 1].textContent = mergedVal;
    tokenElements[opIndex - 1].className = 'calc-token text-emerald-400 mx-2 anim-merge-pop';
    
    let w1 = tokenElements[opIndex].offsetWidth;
    let w2 = tokenElements[opIndex + 1].offsetWidth;
    tokenElements[opIndex].style.width = w1 + 'px';
    tokenElements[opIndex + 1].style.width = w2 + 'px';
    void tokenElements[opIndex].offsetWidth;

    tokenElements[opIndex].style.width = '0px';
    tokenElements[opIndex].style.margin = '0px';
    tokenElements[opIndex].style.opacity = '0';
    tokenElements[opIndex + 1].style.width = '0px';
    tokenElements[opIndex + 1].style.margin = '0px';
    tokenElements[opIndex + 1].style.opacity = '0';
    
    await wait(350);
    
    content.innerHTML = '';
    tokenElements = [];
    steps[s].forEach((token) => {
      let span = document.createElement('span');
      span.className = 'calc-token text-yellow-400 mx-2';
      span.textContent = token.replaceAll('*', '×').replaceAll('/', '÷');
      content.appendChild(span);
      tokenElements.push(span);
    });
    
    await wait(300);
  }
  
  tokenElements[0].classList.add('anim-scale-up-glow', 'text-emerald-400');
  tokenElements[0].classList.remove('text-yellow-400');
  // Play the final "result reveal" tone — highest pitch in the ladder
  if (typeof SFX !== 'undefined') SFX.calcResult(steps.length - 1);
  await wait(800);
  
  container.classList.add('hidden');
}

