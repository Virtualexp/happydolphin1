// mines.js
import { makeDraggable, bringToFront } from "./core.js";
import { setupMinesweeper } from "./minesweeperGame.js";

export function createMinesweeperWindow() {
  const existing = document.querySelector('.win98.minesweeper');
  if (existing) {
    bringToFront(existing);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'win98 minesweeper';
  wrapper.style.left = (window.innerWidth / 2 - 260) + 'px';
  wrapper.style.top  = (window.innerHeight / 2 - 200) + 'px';
  bringToFront(wrapper);

  wrapper.innerHTML = `
    <div class="window" style="width:200px;">
      <div class="title-bar">
        <div class="title-bar-text">Minesweeper</div>
        <div class="title-bar-controls">
          <button aria-label="Close" class="close-ind"></button>
        </div>
      </div>
      <div class="window-body" style="background:#c0c0c0;">
        <div id="minesweeper-root" style="padding:6px;"></div>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  // draggable
  makeDraggable(wrapper, wrapper.querySelector('.title-bar'));

  // close
  wrapper.querySelector('.close-ind').addEventListener('click', () => wrapper.remove());

  // Oyunu başlat
  const root = wrapper.querySelector('#minesweeper-root');
  setupMinesweeper(root);
}
