// drag-scroll.js
// Makes elements with the .drag-scroll class draggable (click and drag to scroll).
// Useful for PC users and acts as a nice touch for horizontal scrolling lists.

document.addEventListener('DOMContentLoaded', () => {
  const scrollables = document.querySelectorAll('.drag-scroll, .terra-modal-card, #shopList');
  
  scrollables.forEach(el => {
    let isDown = false;
    let startX;
    let startY;
    let scrollLeft;
    let scrollTop;

    el.addEventListener('mousedown', (e) => {
      // Don't drag if clicking on a button or interactive element
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
      
      isDown = true;
      el.classList.add('active');
      document.body.classList.add('no-select'); // Prevent text selection
      startX = e.pageX - el.offsetLeft;
      startY = e.pageY - el.offsetTop;
      scrollLeft = el.scrollLeft;
      scrollTop = el.scrollTop;
    });
    
    el.addEventListener('mouseleave', () => {
      isDown = false;
      el.classList.remove('active');
      document.body.classList.remove('no-select');
    });
    
    el.addEventListener('mouseup', () => {
      isDown = false;
      el.classList.remove('active');
      document.body.classList.remove('no-select');
    });
    
    el.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const y = e.pageY - el.offsetTop;
      const walkX = (x - startX) * 1.5; // Scroll speed multiplier
      const walkY = (y - startY) * 1.5;
      el.scrollLeft = scrollLeft - walkX;
      el.scrollTop = scrollTop - walkY;
    });
  });
});
