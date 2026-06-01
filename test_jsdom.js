const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('play.html', 'utf8');
const sfx = fs.readFileSync('sfx.js', 'utf8');
const locales = fs.readFileSync('locales.js', 'utf8');
const play = fs.readFileSync('play.js', 'utf8');

const dom = new JSDOM(html, {
  url: "http://localhost",
  runScripts: 'dangerously',
  resources: 'usable'
});

dom.window.eval(sfx);
dom.window.eval(locales);

try {
  dom.window.eval(play);
  console.log("play.js executed successfully at top level!");
  
  // Try to fire onload
  dom.window.onload();
  console.log("window.onload executed successfully!");
} catch (e) {
  console.error("ERROR CAUGHT:");
  console.error(e.name, e.message);
  console.error(e.stack);
}
