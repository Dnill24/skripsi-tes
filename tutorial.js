class TutorialSystem {
  constructor(steps, keyName) {
    this.steps = steps;
    this.currentStep = 0;
    this.keyName = keyName;
    
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.style.display = 'none';
    
    this.hole = document.createElement('div');
    this.hole.className = 'tutorial-hole';
    
    this.popup = document.createElement('div');
    this.popup.className = 'tutorial-popup';
    
    this.overlay.appendChild(this.hole);
    this.overlay.appendChild(this.popup);
    document.body.appendChild(this.overlay);
    
    window.addEventListener('resize', () => {
      if (this.overlay.style.display !== 'none') {
        this.positionPopup();
      }
    });
  }

  start() {
    window.activeTutorial = this;
    this.currentStep = 0;
    this.overlay.style.display = 'block';
    this.showStep();
  }

  showStep() {
    if (this.currentStep >= this.steps.length) {
      this.finish();
      return;
    }

    const step = this.steps[this.currentStep];
    const targetEl = document.querySelector(step.target);
    
    document.querySelectorAll('.tutorial-highlight-bright').forEach(el => el.classList.remove('tutorial-highlight-bright'));

    if (targetEl) {
      targetEl.classList.add('tutorial-highlight-bright');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    let lang = 'en';
    try {
      const storedSettings = localStorage.getItem('mathQuestSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.language) lang = parsed.language;
      }
    } catch (e) {}

    const isLast = this.currentStep === this.steps.length - 1;
    
    // Hide temporarily to prevent flash at old position
    this.popup.style.opacity = '0';
    this.hole.style.opacity = '0';

    this.popup.innerHTML = `
      <h3>${window.getTranslation ? window.getTranslation(step.titleKey, lang) : step.titleKey}</h3>
      <p style="font-family:'Comic Neue', cursive; font-size:1rem; margin-bottom:16px;">${window.getTranslation ? window.getTranslation(step.descKey, lang) : step.descKey}</p>
      <div class="tutorial-controls" style="display:flex; justify-content:space-between; gap:12px;">
        <button class="wood-btn danger" style="padding:8px 12px; font-size:0.6rem;" onclick="window.activeTutorial.finish()">${window.getTranslation ? window.getTranslation('tut_btn_skip', lang) : 'Skip'}</button>
        <button class="wood-btn success" style="padding:8px 12px; font-size:0.6rem;" onclick="window.activeTutorial.next()">${window.getTranslation ? (isLast ? window.getTranslation('tut_btn_finish', lang) : window.getTranslation('tut_btn_next', lang)) : (isLast ? 'Finish' : 'Next')}</button>
      </div>
    `;

    setTimeout(() => {
      this.positionPopup();
      
      // Re-trigger the pop animation
      this.popup.style.animation = 'none';
      void this.popup.offsetWidth;
      this.popup.style.animation = 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
      
      this.popup.style.opacity = '1';
      this.hole.style.opacity = '1';
    }, 50);
  }

  positionPopup() {
    const step = this.steps[this.currentStep];
    const targetEl = document.querySelector(step.target);
    
    if (!targetEl) {
      this.popup.style.top = '50%';
      this.popup.style.left = '50%';
      this.popup.style.transform = 'translate(-50%, -50%)';
      this.hole.style.display = 'none';
      return;
    }

    this.hole.style.display = 'block';
    const rect = targetEl.getBoundingClientRect();
    
    // Position the hole
    this.hole.style.top = (rect.top - 4) + 'px';
    this.hole.style.left = (rect.left - 4) + 'px';
    this.hole.style.width = (rect.width + 8) + 'px';
    this.hole.style.height = (rect.height + 8) + 'px';

    const popupRect = this.popup.getBoundingClientRect();
    this.popup.style.transform = 'none';

    let top = rect.bottom + 20;
    let left = rect.left + (rect.width / 2) - (popupRect.width / 2);

    if (top + popupRect.height > window.innerHeight - 10) {
      top = rect.top - popupRect.height - 20;
    }
    
    if (top < 10) {
      top = window.innerHeight / 2 - popupRect.height / 2;
      left = window.innerWidth / 2 - popupRect.width / 2;
    } else {
      if (left < 10) left = 10;
      if (left + popupRect.width > window.innerWidth - 10) left = window.innerWidth - popupRect.width - 10;
    }

    this.popup.style.top = top + 'px';
    this.popup.style.left = left + 'px';
  }

  next() {
    if (typeof SFX !== 'undefined') SFX.btnClick();
    this.currentStep++;
    this.showStep();
  }

  finish() {
    if (typeof SFX !== 'undefined') SFX.btnClick();
    this.overlay.style.display = 'none';
    document.querySelectorAll('.tutorial-highlight-bright').forEach(el => el.classList.remove('tutorial-highlight-bright'));
    localStorage.setItem(this.keyName, 'true');
  }
}
