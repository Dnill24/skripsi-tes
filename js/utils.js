// Global utility functions

function renderSprite(srcOrEmoji, extraClass = '') {
  if (!srcOrEmoji) return '';
  if (srcOrEmoji.includes('/') || srcOrEmoji.endsWith('.png')) {
      // Use 1em height and width so it automatically inherits the font-size of its container
      return `<img src="${srcOrEmoji}" class="h-[1em] w-[1em] object-contain inline-block ${extraClass}" alt="sprite" />`;
  }
  return srcOrEmoji; // Fallback to raw text/emoji
}
