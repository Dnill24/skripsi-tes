/* ═══════════════════════════════════════════════════════
   MATH QUEST — SHARED SFX ENGINE (Web Audio API)
   No audio files needed — all sounds synthesized.
   Include this before any page-specific script.
   ═══════════════════════════════════════════════════════ */

const SFX = (() => {
  let _ctx = null;

  function ctx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  // Read volume from localStorage settings (0-100), default 70
  function vol() {
    try {
      const s = JSON.parse(localStorage.getItem('mathQuestSettings') || '{}');
      return (s.sfxVolume !== undefined ? s.sfxVolume : 70) / 100;
    } catch { return 0.7; }
  }

  function musicVol() {
    try {
      const s = JSON.parse(localStorage.getItem('mathQuestSettings') || '{}');
      return (s.musicVolume !== undefined ? s.musicVolume : 50) / 100;
    } catch { return 0.5; }
  }

  function play(fn) {
    try { fn(ctx(), vol()); } catch (e) { console.warn('SFX error', e); }
  }

  /* ─── Utility ──────────────────────────────────────── */

  // Short percussive tone — xylophone/marimba style (Balatro chip sound)
  function xylo(c, frequency, v, duration = 0.18) {
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    // Fast attack, exponential decay — key to the "pluck" feel
    g.gain.setValueAtTime(v * 1.0, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    // Slight harmonics via second osc at 3x freq (simulates a mallet hit)
    const osc2 = c.createOscillator();
    const g2   = c.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 3.01;
    g2.gain.setValueAtTime(v * 0.15, c.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration * 0.5);
    osc.connect(g);   g.connect(c.destination);
    osc2.connect(g2); g2.connect(c.destination);
    osc.start();  osc.stop(c.currentTime + duration);
    osc2.start(); osc2.stop(c.currentTime + duration * 0.5);
  }

  // ─── BACKGROUND MUSIC SYSTEM ───────────────────────────
  let currentBGM = null;
  let currentBGMName = null;
  let fadeOutInterval = null;
  let fadeInInterval = null;

  function playBGM(trackName) {
    if (currentBGMName === trackName) return;
    
    const nextBGM = new Audio('music/' + trackName);
    nextBGM.loop = true;
    nextBGM.volume = 0; // start at 0 for fade in
    
    // Attempt to play, catch autoplay restrictions
    nextBGM.play().catch(e => {
      console.warn('BGM Auto-play blocked:', e);
      if (e.name === 'NotAllowedError') {
        const unlockAudio = () => {
          nextBGM.play().catch(()=>{});
          if (_ctx && _ctx.state === 'suspended') _ctx.resume();
          document.removeEventListener('click', unlockAudio);
          document.removeEventListener('keydown', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
      }
    });
    
    // Fade out current
    if (currentBGM) {
      const fadingBGM = currentBGM;
      if (fadeOutInterval) clearInterval(fadeOutInterval);
      let fadeOutVol = fadingBGM.volume;
      fadeOutInterval = setInterval(() => {
        fadeOutVol = Math.max(0, fadeOutVol - 0.05);
        fadingBGM.volume = fadeOutVol;
        if (fadeOutVol <= 0) {
          clearInterval(fadeOutInterval);
          fadingBGM.pause();
          fadingBGM.src = '';
        }
      }, 50);
    }
    
    currentBGM = nextBGM;
    currentBGMName = trackName;
    
    // Fade in new
    const targetVol = musicVol();
    if (fadeInInterval) clearInterval(fadeInInterval);
    let fadeInVol = 0;
    fadeInInterval = setInterval(() => {
      fadeInVol = Math.min(targetVol, fadeInVol + 0.05);
      if (currentBGM === nextBGM) {
        currentBGM.volume = fadeInVol;
      }
      if (fadeInVol >= targetVol) clearInterval(fadeInInterval);
    }, 50);
  }

  function updateBGMVolume() {
    if (currentBGM) {
      currentBGM.volume = musicVol();
    }
  }

  return {
    playBGM,
    updateBGMVolume,

    /* ─── UI / Navigation ──────────────────────────── */

    // Light wooden button tap
    btnClick() {
      play((c, v) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.05);
        g.gain.setValueAtTime(v * 0.3, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07);
        osc.connect(g); g.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 0.07);
      });
    },

    // Heavy danger/flee button
    btnDanger() {
      play((c, v) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, c.currentTime + 0.1);
        g.gain.setValueAtTime(v * 0.35, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.13);
        osc.connect(g); g.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 0.13);
      });
    },

    /* ─── Calculation (Balatro-style) ──────────────── */

    // Each step: very short, sharp click/pluck (like chips)
    calcStep(stepIndex) {
      play((c, v) => {
        const baseFreq = 400; 
        const freq = baseFreq * Math.pow(1.08, stepIndex); // slight rise
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, c.currentTime);
        // Very fast percussive attack
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(v * 0.5, c.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
        osc.connect(g); g.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 0.1);
      });
    },

    // Final result reveal: the classic Balatro satisfying "ding!"
    calcResult(totalSteps) {
      play((c, v) => {
        const baseFreq = 400;
        const freq = baseFreq * Math.pow(1.08, totalSteps);
        
        // Main bright chime
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, c.currentTime);
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(v * 0.4, c.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
        
        // High overtone
        const osc2 = c.createOscillator();
        const g2   = c.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.01, c.currentTime);
        g2.gain.setValueAtTime(0, c.currentTime);
        g2.gain.linearRampToValueAtTime(v * 0.2, c.currentTime + 0.05);
        g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
        
        osc.connect(g); g.connect(c.destination);
        osc2.connect(g2); g2.connect(c.destination);
        
        osc.start(); osc.stop(c.currentTime + 0.4);
        osc2.start(); osc2.stop(c.currentTime + 0.3);
      });
    },

    /* ─── Combat ───────────────────────────────────── */

    // Correct answer — bright 2-note chime
    correct() {
      play((c, v) => {
        [523, 784].forEach((freq, i) => {
          const t = c.currentTime + i * 0.1;
          const osc = c.createOscillator();
          const g   = c.createGain();
          osc.type = 'sine'; osc.frequency.value = freq;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(v * 0.3, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.connect(g); g.connect(c.destination);
          osc.start(t); osc.stop(t + 0.25);
        });
      });
    },

    // Wrong answer — game show buzzer (dissonant square waves)
    wrong() {
      play((c, v) => {
        const osc1 = c.createOscillator();
        const osc2 = c.createOscillator();
        const g = c.createGain();
        
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(150, c.currentTime);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(156, c.currentTime); // Dissonance
        
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(v * 0.35, c.currentTime + 0.02);
        g.gain.setValueAtTime(v * 0.35, c.currentTime + 0.25);
        g.gain.linearRampToValueAtTime(0.001, c.currentTime + 0.3);
        
        osc1.connect(g);
        osc2.connect(g);
        g.connect(c.destination);
        
        osc1.start(); osc1.stop(c.currentTime + 0.3);
        osc2.start(); osc2.stop(c.currentTime + 0.3);
      });
    },

    // Sword whoosh
    slash() {
      play((c, v) => {
        const buf = c.createBuffer(1, c.sampleRate * 0.22, c.sampleRate);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
          const t = i / c.sampleRate;
          d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 16) * (1 - t * 4);
        }
        const src = c.createBufferSource();
        src.buffer = buf;
        const hp = c.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 2000;
        const g = c.createGain();
        g.gain.setValueAtTime(v * 0.5, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
        src.connect(hp); hp.connect(g); g.connect(c.destination);
        src.start(); src.stop(c.currentTime + 0.22);
      });
    },

    // Hit lands on enemy — punchy thud
    hit() {
      play((c, v) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(75, c.currentTime + 0.12);
        g.gain.setValueAtTime(v * 0.45, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
        osc.connect(g); g.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 0.18);
      });
    },

    // Boss hit — deep boom
    bossHit() {
      play((c, v) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(38, c.currentTime + 0.32);
        g.gain.setValueAtTime(v * 0.65, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.38);
        osc.connect(g); g.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 0.38);
      });
    },

    // Player takes damage
    playerHurt() {
      play((c, v) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, c.currentTime + 0.2);
        g.gain.setValueAtTime(v * 0.5, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
        osc.connect(g); g.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 0.22);
      });
    },

    // Critical hit
    crit() {
      play((c, v) => {
        const buf = c.createBuffer(1, c.sampleRate * 0.12, c.sampleRate);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++)
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.04));
        const src = c.createBufferSource(); src.buffer = buf;
        const ng  = c.createGain();
        ng.gain.setValueAtTime(v * 0.45, c.currentTime);
        src.connect(ng); ng.connect(c.destination); src.start();
        // Chime
        setTimeout(() => {
          try { xylo(c, 1320, v * 0.35, 0.3); } catch(e){}
        }, 40);
      });
    },

    /* ─── Rewards / Meta ───────────────────────────── */

    // Boss defeated — ascending 5-note fanfare
    bossDefeated() {
      play((c, v) => {
        [392, 523, 659, 784, 1047].forEach((freq, i) => {
          const t = c.currentTime + i * 0.1;
          const osc = c.createOscillator();
          const g   = c.createGain();
          osc.type = 'square'; osc.frequency.value = freq;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(v * 0.22, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
          osc.connect(g); g.connect(c.destination);
          osc.start(t); osc.stop(t + 0.28);
        });
      });
    },

    // Buff card selected — magical ascending shimmer
    buffPick() {
      play((c, v) => {
        [1047, 1319, 1568].forEach((freq, i) => {
          const t = c.currentTime + i * 0.08;
          const osc = c.createOscillator();
          const g   = c.createGain();
          osc.type = 'sine'; osc.frequency.value = freq;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(v * 0.22, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.connect(g); g.connect(c.destination);
          osc.start(t); osc.stop(t + 0.3);
        });
      });
    },

    purchase() {
      play((c, v) => {
        [523, 659, 1047].forEach((freq, i) => {
          setTimeout(() => { try { xylo(c, freq, v * 0.4, 0.4); } catch(e){} }, i * 80);
        });
      });
    },

    equip() {
      play((c, v) => {
        xylo(c, 880, v * 0.5, 0.2);
        setTimeout(() => { try { xylo(c, 1108, v * 0.5, 0.3); } catch(e){} }, 60);
      });
    },

    // Coin collect
    coin() {
      play((c, v) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, c.currentTime + 0.08);
        g.gain.setValueAtTime(v * 0.22, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
        osc.connect(g); g.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 0.12);
      });
    },

    /* ─── Countdown ────────────────────────────────── */

    // 3 = high, 2 = mid, 1 = low  (descending tension)
    countdownBeep(num) {
      play((c, v) => {
        const freqs = { '3': 880, '2': 740, '1': 622 };
        const freq  = freqs[String(num)] || 880;
        xylo(c, freq, v * 0.4, 0.3);
      });
    },

    // "START!" — quick ascending 4-note burst
    countdownStart() {
      play((c, v) => {
        [523, 659, 784, 1047].forEach((freq, i) => {
          setTimeout(() => { try { xylo(c, freq, v * 0.28, 0.22); } catch(e){} }, i * 70);
        });
      });
    },

    /* ─── Timer ────────────────────────────────────── */

    // Quiet urgent tick when timer is red
    timerTick() {
      play((c, v) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.type = 'sine'; osc.frequency.value = 1050;
        g.gain.setValueAtTime(v * 0.1, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
        osc.connect(g); g.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 0.06);
      });
    },

    /* ─── Run Over ─────────────────────────────────── */

    // Sad descending 3-note motif
    runOver() {
      play((c, v) => {
        [392, 330, 262].forEach((freq, i) => {
          setTimeout(() => { try { xylo(c, freq, v * 0.35, 0.45); } catch(e){} }, i * 220);
        });
      });
    },
  };
})();

/* ─── Global button SFX (works on every page) ────── */
(function attachButtonSFX() {
  function onPress(e) {
    const btn = e.target.closest('button');
    if (!btn || btn.disabled) return;
    if (btn.classList.contains('danger') || btn.id === 'btnFlee') {
      SFX.btnDanger();
    } else {
      SFX.btnClick();
    }
  }
  document.addEventListener('mousedown',  onPress);
  document.addEventListener('touchstart', onPress, { passive: true });
})();
