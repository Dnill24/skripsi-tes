const fs = require('fs');
const content = fs.readFileSync('c:/Users/LENOVO/Downloads/skripsi-tes - Copy (2)/js/locales.js', 'utf8');

const enBlockMatch = content.match(/en:\s*{([\s\S]+?)},\s*id:/);
const idBlockMatch = content.match(/id:\s*{([\s\S]+?)}\s*};/);

const enBlock = enBlockMatch[1];
const idBlock = idBlockMatch[1];

function extractKeys(text) {
  const keys = new Set();
  const lines = text.split('\n');
  for (let line of lines) {
    // remove single line comments
    let cleanLine = line.split('//')[0];
    const matches = [...cleanLine.matchAll(/(?:^|[\s,])([a-zA-Z0-9_]+)\s*:\s*["']/g)];
    for (let m of matches) {
      keys.add(m[1]);
    }
  }
  return keys;
}

const enKeys = Array.from(extractKeys(enBlock));
const idKeys = Array.from(extractKeys(idBlock));

const missingInId = enKeys.filter(k => !idKeys.includes(k));
const missingInEn = idKeys.filter(k => !enKeys.includes(k));

console.log('Missing in ID:', missingInId.sort());
console.log('Missing in EN:', missingInEn.sort());
