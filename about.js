import { makeDraggable, bringToFront } from "./core.js";

export function createAboutMeWindow() {
  const existing = document.querySelector('.win98.about-me');
  if (existing) {
    bringToFront(existing);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'win98 about-me';
  wrapper.style.left = (window.innerWidth / 2 - 180) + 'px';
  wrapper.style.top = (window.innerHeight / 2 - 140) + 'px';
  bringToFront(wrapper);

  wrapper.innerHTML = `
    <div class="window" style="width:360px;">
      <div class="title-bar">
        <div class="title-bar-text">About Me</div>
        <div class="title-bar-controls">
          <button aria-label="Close" class="close-ind"></button>
        </div>
      </div>

      <div class="window-body">
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center;">

          <img src="gallery/dolphin/aboutme.jpg"
               style="width:100px; height:100px; border-radius:50%;
               border:2px solid #008080; margin-bottom:10px;">

          <p style="margin:0; font-size:14px;">
            <b>?????.exe</b><br>
            M???????ian • ?????? A???st<br>
            fascinated by chaos, algorithms, and the ocean.<br>
          </p>

          <p style="margin-top:8px; font-size:13px;">
            Exploring <i>????????</i>, gen?????e ???, and<br>
            the strange beauty of mat?????cal systems.
          </p>

          <button class="button" style="margin-top:10px;">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  // close
  wrapper.querySelector('.close-ind').addEventListener('click', () => wrapper.remove());
  wrapper.querySelector('.button').addEventListener('click', () => wrapper.remove());

  // draggable
  makeDraggable(wrapper, wrapper.querySelector('.title-bar'));
}
