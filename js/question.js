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
  const rankMMR = safeMMR; // Use actual rank to cap complexity strictly
  
  if (primaryOp === '+' || primaryOp === '-') {
    if (rankMMR < 20) {
      numTerms = 2; // Iron
    } else if (rankMMR < 40) {
      numTerms = Math.random() > 0.5 ? 2 : 3; // Bronze
    } else if (rankMMR < 60) {
      numTerms = 3; // Silver
    } else if (rankMMR < 80) {
      numTerms = 3 + (Math.random() > 0.5 ? 1 : 0); // Gold (3-4)
    } else if (rankMMR < 100) {
      numTerms = 3 + Math.floor(Math.random() * 2); // Plat (3-4)
    } else if (rankMMR < 150) {
      numTerms = 4 + Math.floor(Math.random() * 2); // Diamond (4-5)
    } else {
      numTerms = 4 + Math.floor(Math.random() * 3); // Master (4-6)
    }
  } else {
    // Multiplication
    if (rankMMR < 40) {
      numTerms = 2; // Iron/Bronze
    } else if (rankMMR < 80) {
      numTerms = Math.random() > 0.5 ? 2 : 3; // Silver/Gold
    } else {
      numTerms = 3 + Math.floor(Math.random() * 2); // Plat+ (3-4)
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
    if (primaryOp === '*') {
      if (rankMMR < 60) bound = 9;
      else bound = Math.max(10, targetMMR * 0.5);
    }
    if (primaryOp === '/') {
      if (rankMMR < 60) bound = 9;
      else bound = Math.max(10, targetMMR * 0.6);
    }

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
        let termBound = 10;
        
        if (primaryOp === '+' || primaryOp === '-') {
           if (rankMMR < 20) termBound = 10;
           else if (rankMMR < 40) termBound = 20;
           else if (rankMMR < 60) termBound = 50;
           else if (rankMMR < 80) termBound = 100;
           else if (rankMMR < 100) termBound = 200;
           else if (rankMMR < 150) termBound = 500;
           else termBound = 1000;
        } else if (primaryOp === '*') {
           if (rankMMR < 40) termBound = 6;
           else if (rankMMR < 60) termBound = 9;
           else if (rankMMR < 80) termBound = 12;
           else if (rankMMR < 100) termBound = 15;
           else if (rankMMR < 150) termBound = 20;
           else termBound = 30;
        } else if (primaryOp === '/') {
           if (rankMMR < 20) termBound = 6;
           else if (rankMMR < 40) termBound = 9;
           else if (rankMMR < 60) termBound = 9;
           else if (rankMMR < 80) termBound = 20;
           else if (rankMMR < 100) termBound = 50;
           else termBound = 100;
        }
        
        let prevOp = i > 0 ? expOps[i-1] : null;
        let nextOp = i < expOps.length ? expOps[i] : null;
        
        if (prevOp === '*' || nextOp === '*') {
          termBound = Math.min(termBound, Math.max(4, 3 + Math.floor(rankMMR / 20))); // Keep chained multiplication small
          if (numTerms >= 4) termBound = Math.min(termBound, 5);
        } else if (prevOp === '-' || nextOp === '-') {
          termBound = Math.min(termBound, Math.max(10, rankMMR * 1.5));
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
  let targetDigits = bestAns.toString().length;
  let sameLastDigitCount = (targetDigits > 1) ? 1 : 0; // Only do same-last-digit trick if it's 2+ digits

  while (options.length < 4 && loopGuard < 100) {
    loopGuard++;
    let range = Math.max(5, Math.floor(targetMMR * 0.2));
    if (isNaN(range)) range = 5;
    
    let wrong = bestAns;
    if (targetDigits === 1) {
      wrong = getRandomInt(0, 9);
    } else if (sameLastDigitCount > 0) {
      let mult10 = getRandomInt(1, 2) * 10; // Offset by 10 or 20 so the second digit is very similar
      let dir = Math.random() < 0.5 ? 1 : -1;
      wrong = bestAns + dir * mult10;
      
      if (wrong.toString().length === targetDigits && !options.includes(wrong) && wrong >= 0 && wrong !== bestAns) {
        options.push(wrong);
        sameLastDigitCount--;
      }
      continue;
    } else {
      wrong = bestAns + (Math.random() < 0.5 ? 1 : -1) * getRandomInt(1, Math.max(range, 5));
    }
    
    if (isNaN(wrong)) wrong = bestAns + (Math.random() < 0.5 ? 1 : -1) * getRandomInt(1, 5);
    
    // Strictly enforce matching digit counts
    if (wrong.toString().length !== targetDigits) {
      let minVal = targetDigits === 1 ? 0 : Math.pow(10, targetDigits - 1);
      let maxVal = Math.pow(10, targetDigits) - 1;
      wrong = getRandomInt(minVal, maxVal);
    }
    
    if (!options.includes(wrong) && wrong >= 0 && wrong !== bestAns) {
      options.push(wrong);
    }
  }
  
  // Failsafe if loop guard triggered
  while (options.length < 4) {
    let fallback = bestAns + options.length;
    if (!options.includes(fallback)) options.push(fallback);
  }

  return { text: bestExpr, answers: shuffleArray(options), correct: bestAns, operator: primaryOp };
}

const COL_COLORS = ['#b73a27', '#5a8f9a', '#ed9f40', '#9b59b6', '#2ecc71', '#e74c3c', '#3498db'];

function colorizeMath(numStr) {
    let html = '';
    for (let i = 0; i < numStr.length; i++) {
        if (numStr[i] === ' ' || isNaN(parseInt(numStr[i]))) {
            html += numStr[i];
        } else {
            let place = numStr.length - 1 - i;
            let color = COL_COLORS[place % COL_COLORS.length];
            html += `<span style="color: ${color}">${numStr[i]}</span>`;
        }
    }
    return html;
}

function colorizeCarries(numStr) {
    let html = '';
    for (let i = 0; i < numStr.length; i++) {
        if (numStr[i] === ' ' || isNaN(parseInt(numStr[i]))) {
            html += numStr[i];
        } else {
            let place = numStr.length - 1 - i;
            let originPlace = Math.max(0, place - 1);
            let color = COL_COLORS[originPlace % COL_COLORS.length];
            html += `<span style="color: ${color}">${numStr[i]}</span>`;
        }
    }
    return html;
}

function generateBreakdownText(q) {
  const lang = typeof settings !== 'undefined' ? settings.language : 'en';
  
  const tokens = q.text.split(' ');
  if (tokens.length !== 3) {
      let currentTokens = [...tokens];
      let steps = [];
      steps.push(`<div class="text-[0.9rem] text-gray-300 leading-tight mb-4 font-sans text-center">${getTranslation('txt_order_of_ops', lang)}</div>`);
      
      let stepLines = [];
      stepLines.push(`<div class="text-[1.8rem] text-gray-400 mb-2">${currentTokens.join(' ').replace(/\*/g, '\u00d7').replace(/\//g, '\u00f7')}</div>`);
      
      while (currentTokens.includes('*') || currentTokens.includes('/')) {
          let opIndex = currentTokens.findIndex(t => t === '*' || t === '/');
          let a = parseInt(currentTokens[opIndex - 1]);
          let b = parseInt(currentTokens[opIndex + 1]);
          let op = currentTokens[opIndex];
          let res = op === '*' ? a * b : Math.floor(a / b);
          
          let displayLine = currentTokens.map((t, i) => {
              if (i >= opIndex - 1 && i <= opIndex + 1) {
                  return `<span class="text-yellow-300 font-bold underline">${t.replace('*', '\u00d7').replace('/', '\u00f7')}</span>`;
              }
              return t.replace('*', '\u00d7').replace('/', '\u00f7');
          }).join(' ');
          
          stepLines.push(`<div class="text-[1.8rem] mb-1">${displayLine}</div>`);
          currentTokens.splice(opIndex - 1, 3, res.toString());
      }
      
      while (currentTokens.includes('+') || currentTokens.includes('-')) {
          let opIndex = currentTokens.findIndex(t => t === '+' || t === '-');
          let a = parseInt(currentTokens[opIndex - 1]);
          let b = parseInt(currentTokens[opIndex + 1]);
          let op = currentTokens[opIndex];
          let res = op === '+' ? a + b : a - b;
          
          let displayLine = currentTokens.map((t, i) => {
              if (i >= opIndex - 1 && i <= opIndex + 1) {
                  return `<span class="text-yellow-300 font-bold underline">${t}</span>`;
              }
              return t;
          }).join(' ');
          
          stepLines.push(`<div class="text-[1.8rem] mb-1">${displayLine}</div>`);
          currentTokens.splice(opIndex - 1, 3, res.toString());
      }
      
      stepLines.push(`<div class="text-[2.5rem] text-green-400 font-bold mt-2">= ${currentTokens[0]}</div>`);
      
      return `<div class="flex flex-col items-center w-full my-4 font-mono bg-[#fdfdfd] text-black p-8 rounded-xl border-4 border-gray-300 shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
        ${steps.join('\n')}
        ${stepLines.join('\n')}
      </div>`;
  }
  
  const a = parseInt(tokens[0]);
  const op = tokens[1];
  const b = parseInt(tokens[2]);
  
  let strA = a.toString();
  let strB = b.toString();
  let strRes = q.correct.toString();
  let maxLen = Math.max(strA.length, strB.length, strRes.length);
  
  let html = '';
  let explanation = '';
  
  if (op === '+') {
      let carries = Array(maxLen).fill(' ');
      let carry = 0;
      let hasCarry = false;
      for(let i=0; i<maxLen; i++) {
        let dA = i < strA.length ? parseInt(strA[strA.length - 1 - i]) : 0;
        let dB = i < strB.length ? parseInt(strB[strB.length - 1 - i]) : 0;
        let sum = dA + dB + carry;
        carry = Math.floor(sum / 10);
        if (carry > 0) {
          hasCarry = true;
          if (i + 1 < maxLen) {
            carries[maxLen - 1 - (i + 1)] = carry.toString();
          } else {
            carries.unshift(carry.toString());
            strA = ' ' + strA;
            strB = ' ' + strB;
            strRes = q.correct.toString(); 
            maxLen++;
          }
        }
      }
      
      let carryStr = carries.join('');
      
      if (hasCarry) {
        explanation = `<div class="text-[0.9rem] text-gray-300 leading-tight mb-4 font-sans text-center">
          ${getTranslation('txt_add_col_desc', lang)}<br>
          <span class="font-bold text-yellow-300 mt-1 inline-block">${getTranslation('txt_add_carry_desc', lang)}</span>
        </div>`;
      } else {
        explanation = `<div class="text-[0.9rem] text-gray-300 leading-tight mb-4 font-sans text-center">
          ${getTranslation('txt_add_col_desc', lang)}
        </div>`;
      }

      html = `
<div class="font-mono text-[2.5rem] inline-block text-right leading-none bg-[#fdfdfd] p-8 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.5)] whitespace-pre font-bold mx-auto text-black border-4 border-gray-300">
${hasCarry ? `<div class="text-[1.4rem] h-[1.8rem] pr-[0.1em] opacity-80">${colorizeCarries(carryStr)}</div>` : ''}
<div>  ${colorizeMath(strA.padStart(maxLen, ' '))}</div>
<div class="border-b-[5px] border-black pb-2 relative"><span class="absolute left-0 text-black">+</span>  ${colorizeMath(strB.padStart(maxLen, ' '))}</div>
<div class="pt-3">  ${colorizeMath(strRes.padStart(maxLen, ' '))}</div>
</div>`;

  } else if (op === '-') {
      let needsBorrow = false;
      let tempA = a;
      let tempB = b;
      while(tempA > 0 || tempB > 0) {
          if (tempA % 10 < tempB % 10) { needsBorrow = true; break; }
          tempA = Math.floor(tempA / 10);
          tempB = Math.floor(tempB / 10);
      }
      
      if (needsBorrow) {
        explanation = `<div class="text-[0.9rem] text-gray-300 leading-tight mb-4 font-sans text-center">
          ${getTranslation('txt_sub_col_desc', lang)}<br>
          <span class="font-bold text-yellow-300 mt-1 inline-block">${getTranslation('txt_sub_borrow_desc', lang)}</span>
        </div>`;
      } else {
        explanation = `<div class="text-[0.9rem] text-gray-300 leading-tight mb-4 font-sans text-center">
          ${getTranslation('txt_sub_col_desc', lang)}
        </div>`;
      }
      html = `
<div class="font-mono text-[2.5rem] inline-block text-right leading-none bg-[#fdfdfd] p-8 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.5)] whitespace-pre font-bold mx-auto text-black border-4 border-gray-300">
<div>  ${colorizeMath(strA.padStart(maxLen, ' '))}</div>
<div class="border-b-[5px] border-black pb-2 relative"><span class="absolute left-0 text-black">-</span>  ${colorizeMath(strB.padStart(maxLen, ' '))}</div>
<div class="pt-3">  ${colorizeMath(strRes.padStart(maxLen, ' '))}</div>
</div>`;

  } else if (op === '*') {
      if (strA.length > 1 || strB.length > 1) {
          explanation = `<div class="text-[0.9rem] text-gray-300 leading-tight mb-4 font-sans text-center">
            ${getTranslation('txt_mul_col_desc', lang)}<br>
            <span class="font-bold text-yellow-300 mt-1 inline-block">${getTranslation('txt_mul_add_desc', lang)}</span>
          </div>`;
      } else {
         explanation = `<div class="text-[0.9rem] text-gray-300 leading-tight mb-4 font-sans text-center">
           ${getTranslation('txt_mul_col_desc', lang)}
         </div>`;
      }
      html = `
<div class="font-mono text-[2.5rem] inline-block text-right leading-none bg-[#fdfdfd] p-8 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.5)] whitespace-pre font-bold mx-auto text-black border-4 border-gray-300">
<div>  ${colorizeMath(strA.padStart(maxLen, ' '))}</div>
<div class="border-b-[5px] border-black pb-2 relative"><span class="absolute left-0 text-black">&times;</span>  ${colorizeMath(strB.padStart(maxLen, ' '))}</div>`;

      if (strB.length > 1) {
          let intermediates = [];
          for(let i=0; i<strB.length; i++) {
              let digit = parseInt(strB[strB.length - 1 - i]);
              let prod = (a * digit).toString() + '0'.repeat(i);
              intermediates.push(prod);
              if (prod.length > maxLen) maxLen = prod.length;
          }
          for (let i=0; i<intermediates.length; i++) {
             if (i === intermediates.length - 1) {
                 html += `<div class="border-b-[5px] border-black pb-2 relative mt-2"><span class="absolute left-0 text-black">+</span>  ${colorizeMath(intermediates[i].padStart(maxLen, ' '))}</div>`;
             } else {
                 html += `<div class="pt-3">  ${colorizeMath(intermediates[i].padStart(maxLen, ' '))}</div>`;
             }
          }
      }
      
      html += `<div class="pt-3">  ${colorizeMath(strRes.padStart(maxLen, ' '))}</div>
</div>`;

  } else if (op === '/') {
      explanation = `<div class="text-[0.9rem] text-gray-300 leading-tight mb-4 font-sans text-center">
        ${getTranslation('txt_div_col_desc', lang)}<br>
        <span class="font-bold text-yellow-300 mt-1 inline-block">${getTranslation('txt_div_step_desc', lang)}</span>
      </div>`;
      
      let pad = ' '.repeat(strB.length + 1);
      html = `
<div class="font-mono text-[2.5rem] inline-block text-left leading-none bg-[#fdfdfd] p-8 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.5)] whitespace-pre font-bold mx-auto text-black border-4 border-gray-300">
<div class="pb-1">${pad}  ${colorizeMath(strRes)}</div>
<div class="pt-1">${colorizeMath(strB)} <span class="border-t-[5px] border-l-[5px] border-black rounded-tl-2xl pl-3 pt-2 pb-2 inline-block leading-none">${colorizeMath(strA)}</span></div>
</div>`;
  }
  
  return `<div class="flex flex-col items-center w-full my-4">
    ${explanation}
    ${html}
  </div>`;
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
