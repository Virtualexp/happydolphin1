export function openImagePopup(src) {
  // varsa eski popup'ı kapat
  const old = document.querySelector('.image-popup');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'image-popup';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    z-index: 99999;
  `;

  const img = document.createElement('img');
  img.src = src;
  img.style.cssText = `
    max-width: 90vw;
    max-height: 85vh;
    border: 3px solid #fff;
    box-shadow: 0 0 25px rgba(255,255,255,0.4);
    image-rendering: pixelated;
  `;

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => overlay.remove());

  document.addEventListener('keydown', function esc(e) {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener('keydown', esc);
    }
  });
}
