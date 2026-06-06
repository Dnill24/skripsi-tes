function calculateEquationWeight(exprStr) {
  let tokens = exprStr.split(' ');
  let weight = 0;
  
  if (tokens.length === 3) {
    let a = parseInt(tokens[0]);
    let op = tokens[1];
    let b = parseInt(tokens[2]);
    
    if (op === '+') {
      weight = (a * 0.15) + (b * 0.15) + (a.toString().length * 2.5) + (b.toString().length * 2.5);
    } else if (op === '-') {
      weight = (a * 0.15) + (b * 0.2) + (a.toString().length * 2.5) + (b.toString().length * 2.5);
    } else if (op === '*') {
      let aLog = Math.log10(a || 1);
      let bLog = Math.log10(b || 1);
      weight = (a * 0.5) + (b * 0.5) + (aLog * bLog * 15);
      if (a > 10 && b > 10 && a % 10 !== 0 && b % 10 !== 0) {
        weight += Math.max(a, b) * 1.5;
      }
    } else if (op === '/') {
      let q = a / b;
      let qLog = Math.log10(q || 1);
      let bLog = Math.log10(b || 1);
      weight = (b * 0.5) + (q * 0.5) + (qLog * bLog * 15);
      if (q > 10 && b > 10 && q % 10 !== 0 && b % 10 !== 0) {
        weight += Math.max(q, b) * 1.5;
      }
    }
  } else {
    let opMult = 1.0;
    for (let t of tokens) {
      if (['+', '-'].includes(t)) opMult += 0.5;
      else if (['*', '/'].includes(t)) opMult += 2.0;
      else {
        let v = Math.abs(parseInt(t));
        weight += (v.toString().length * 3) + (v * 0.2);
      }
    }
    weight *= opMult;
  }
  return weight;
}

function createQuestion(type) {
  let ops = ['+', '-', '*', '/'];
  if (typeof gameMode !== 'undefined' && ['+', '-', '*', '/'].includes(gameMode)) {
    ops = [gameMode];
  }

  const primaryOp = ops[getRandomInt(0, ops.length - 1)];
  
  // Base difficulty scaling - with safe NaN fallback
  const safeMMR = (typeof globalStats !== 'undefined' && globalStats && typeof globalStats.playerMMR === 'number' && !isNaN(globalStats.playerMMR)) ? globalStats.playerMMR : (typeof playerMMR !== 'undefined' ? playerMMR : 10);
  const safeDiff = (typeof run !== 'undefined' && run && typeof run.difficultyLevel === 'number' && !isNaN(run.difficultyLevel)) ? run.difficultyLevel : 1.0;
  const targetMMR = safeMMR + (safeDiff * 2);
  
  let numTerms = 2;
  
  if (primaryOp === '+' || primaryOp === '-') {
    if (targetMMR > 10 && Math.random() > 0.2) {
      numTerms = 3;
      if (targetMMR > 20 && Math.random() > 0.3) numTerms = 3 + Math.floor(Math.random() * 2); // 3 or 4
      if (targetMMR > 40 && Math.random() > 0.4) numTerms = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
    }
  } else {
    // Multiplication
    if (targetMMR > 25 && Math.random() > 0.5) {
      numTerms = 3;
      if (targetMMR > 50 && Math.random() > 0.5) numTerms = 3 + Math.floor(Math.random() * 2); // 3 or 4
      if (targetMMR > 80 && Math.random() > 0.5) numTerms = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
    }
  }
  // Division is hard to chain without fractions, stick to 2 terms
  if (primaryOp === '/') numTerms = 2;

  let bestExpr = null;
  let bestDiff = 999999;
  let bestAns = 0;

  for (let attempt = 0; attempt < 50; attempt++) {
    let exprStr = "";
    let answer = 0;
    
    let bound = Math.max(10, targetMMR * 3.5);
    if (primaryOp === '*') bound = Math.max(5, targetMMR * 0.5);
    if (primaryOp === '/') bound = Math.max(5, targetMMR * 0.6);

    if (numTerms > 2) {
      let terms = [];
      let expOps = [primaryOp];
      
      let isPure = Math.random() > 0.4; // 60% chance to be a pure chain of the same operator
      
      for(let i=1; i<numTerms-1; i++) {
        if (isPure) {
          expOps.push(primaryOp);
        } else {
          let mixChoices = ['+', '-'];
          let canMixMult = false;
          if (numTerms <= 3 && targetMMR > 25) canMixMult = true;
          else if (numTerms === 4 && targetMMR > 50) canMixMult = true;
          else if (numTerms >= 5 && targetMMR > 80) canMixMult = true;
          
          if (canMixMult) mixChoices.push('*');
          expOps.push(mixChoices[getRandomInt(0, mixChoices.length - 1)]);
        }
      }
      expOps = shuffleArray(expOps);

      for(let i=0; i<numTerms; i++) {
        let termBound = Math.max(10, targetMMR * 3.5);
        let prevOp = i > 0 ? expOps[i-1] : null;
        let nextOp = i < expOps.length ? expOps[i] : null;
        
        if (prevOp === '*' || nextOp === '*') {
          termBound = Math.max(4, targetMMR * 0.25); // Small numbers for multiplication
          if (numTerms >= 4) termBound = Math.min(termBound, 5); // Keep chains manageable
        } else if (prevOp === '-' || nextOp === '-') {
          termBound = Math.max(10, targetMMR * 1.5);
        }
        
        terms.push(getRandomInt(2, Math.floor(termBound)));
      }
      
      exprStr = terms[0].toString();
      for(let i=0; i<expOps.length; i++) {
        exprStr += " " + expOps[i] + " " + terms[i+1];
      }
      answer = new Function('return ' + exprStr)();
    } else {
      let a, b;
      if (primaryOp === '+') {
        a = getRandomInt(2, Math.floor(bound));
        b = getRandomInt(2, Math.floor(bound));
        answer = a + b;
      } else if (primaryOp === '-') {
        a = getRandomInt(10, Math.floor(bound * 2));
        b = getRandomInt(2, Math.min(a, Math.floor(bound)));
        answer = a - b;
      } else if (primaryOp === '*') {
        a = getRandomInt(2, Math.floor(bound));
        b = getRandomInt(2, Math.floor(bound));
        answer = a * b;
      } else if (primaryOp === '/') {
        answer = getRandomInt(2, Math.floor(bound));
        b = getRandomInt(2, Math.floor(bound));
        a = answer * b;
      }
      exprStr = `${a} ${primaryOp} ${b}`;
    }

    if (answer >= 0 && Number.isInteger(answer)) {
      let weight = calculateEquationWeight(exprStr);
      let diff = Math.abs(weight - targetMMR);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestExpr = exprStr;
        bestAns = answer;
      }
    }
  }
  
  if (!bestExpr) {
    bestExpr = "2 + 2";
    bestAns = 4;
  }

  const options = [bestAns];
  let loopGuard = 0;
  while (options.length < 4 && loopGuard < 100) {
    loopGuard++;
    let range = Math.max(5, Math.floor(targetMMR * 0.2));
    if (isNaN(range)) range = 5;
    
    let wrong = bestAns + (Math.random() < 0.5 ? 1 : -1) * getRandomInt(1, range);
    if (isNaN(wrong)) wrong = bestAns + (Math.random() < 0.5 ? 1 : -1) * getRandomInt(1, 5);
    
    if (!options.includes(wrong) && wrong >= 0 && wrong !== bestAns) options.push(wrong);
  }
  
  // Failsafe if loop guard triggered
  while (options.length < 4) {
    let fallback = bestAns + options.length;
    if (!options.includes(fallback)) options.push(fallback);
  }

  return { text: bestExpr, answers: shuffleArray(options), correct: bestAns, operator: primaryOp };
}

function renderQuestion() {
  elements.lblQuestion.textContent = run.currentQuestion.text.replaceAll('*', '\u00d7').replaceAll('/', '\u00f7');
  elements.lblRunStage.textContent = Math.floor((run.monstersDefeated || 0) / 8) + 1;
  elements.lblScore.textContent = Math.floor(run.score);
  elements.lblHealth.textContent = `${run.health}/${run.maxHealth}`;

  elements.answerGrid.innerHTML = '';
  // Terraria-style wooden planks
  run.currentQuestion.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'math-answer-btn';
    const label = document.createElement('span');
    label.textContent = ans;
    btn.appendChild(label);

    btn.onclick = () => submitAnswer(ans, false);
    elements.answerGrid.appendChild(btn);
  });
}
