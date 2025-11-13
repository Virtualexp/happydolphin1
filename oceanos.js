import {
  clickState,
  MIRAGE_THRESHOLD,
  getUniqueMessage,
  dolphinSound,
  makeDraggable,
  bringToFront
} from "./core.js";

import { triggerNetworkMirage, mirageTriggered } from "./mirage.js";

export function createOceanOSWindow() {
  const existing = document.querySelector('.win98.oceanos');
  if (existing) {
    bringToFront(existing);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'win98 oceanos';
  wrapper.style.left = (window.innerWidth / 2 - 180) + 'px';
  wrapper.style.top  = (window.innerHeight / 2 - 120) + 'px';
  bringToFront(wrapper);

  const randomMessage = getUniqueMessage();

  wrapper.innerHTML = `
    <div class="window" style="width:340px;">
      <div class="title-bar">
        <div class="title-bar-text">OceanOS</div>
        <div class="title-bar-controls"><button aria-label="Close" class="close-ind"></button></div>
      </div>
      <div class="window-body">
        <div class="field-row" style="align-items:flex-start; gap:12px; margin-top:30px; justify-content:center;">
          <img src="gallery/dolphin/dolphinmini.png" class="message-icon" style="transform: scale(1.5); transform-origin: center;">
          <div class="message-text">${randomMessage}</div>
        </div>
        <section class="field-row" style="justify-content:end; margin-top: 20px;">
          <button class="button">Yes, but</button>
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  dolphinSound.currentTime = 0;
  dolphinSound.play().catch(() => {});

  const yesButton = wrapper.querySelector('.button');

  yesButton.addEventListener('click', () => {
    clickState.value++;

    // Mirage tetikleme
    if (clickState.value >= MIRAGE_THRESHOLD && !mirageTriggered.value) {
      triggerNetworkMirage();
      return;
    }

    wrapper.remove();
    createOceanOSWindow();
  });

  wrapper.querySelector('.close-ind').addEventListener('click', () => wrapper.remove());

  makeDraggable(wrapper, wrapper.querySelector('.title-bar'));
}
