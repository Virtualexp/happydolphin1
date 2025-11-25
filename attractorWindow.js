import { makeDraggable, bringToFront } from "./core.js";
import { load_attractor } from "./attrs.js";

export function createAttractorWindow() {

  const existing = document.querySelector('.win98.attractor');
  if (existing) {
    bringToFront(existing);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'win98 attractor';
  wrapper.style.left = (window.innerWidth / 2 - 250) + 'px';
  wrapper.style.top  = (window.innerHeight / 2 - 220) + 'px';
  bringToFront(wrapper);

  const WIN_W = 520;
  const WIN_H = 500;
  const CANVAS_H = 380;

  wrapper.innerHTML = `
    <div class="window" style="width:${WIN_W}px; height:${WIN_H}px;">
      <div class="title-bar">
        <div class="title-bar-text">Attractor Simulation</div>
        <div class="title-bar-controls">
          <button aria-label="Close" class="close-ind"></button>
        </div>
      </div>

      <div class="window-body" style="background:#c0c0c0; padding:0;">

        <div style="padding:6px; background:#d0d0d0; border-bottom:2px inset #fff;">
          <label>Simulation:</label>
          <select id="sim-select">
            <option value="lorenz">Lorenz</option>
            <option value="thomas">Thomas</option>
            <option value="halvorsen">Halvorsen</option>
            <option value="dadras">Dadras</option>
            <option value="sprott">Sprott</option>
          </select>

          <button id="sim-reset" class="button">Reset</button>

          <label style="margin-left:10px;">Scale:</label>
          <input type="range" id="sim-scale" min="1" max="20" value="4" />
        </div>

        <canvas id="attractor-canvas"
                width="${WIN_W - 20}"
                height="${CANVAS_H}"
                style="display:block; margin:0 auto; background:black; border:2px inset #fff;">
        </canvas>

      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  makeDraggable(wrapper, wrapper.querySelector('.title-bar'));
  wrapper.querySelector('.close-ind')
      .addEventListener('click', () => wrapper.remove());

  // ---- SIM ----
  let sim = null;

  function startSim() {
    if (sim && sim.destroy) sim.destroy();

    sim = load_attractor({
      attractor: wrapper.querySelector("#sim-select").value,
      canvasID: "attractor-canvas",
      particleCount: 70000,
      scale: parseFloat(wrapper.querySelector("#sim-scale").value)
    });
  }

  startSim();

  wrapper.querySelector("#sim-reset")
    .addEventListener("click", () => startSim());

  wrapper.querySelector("#sim-select")
    .addEventListener("change", startSim);

  wrapper.querySelector("#sim-scale")
    .addEventListener("input", e => {
      if (sim && sim.setScale) sim.setScale(parseFloat(e.target.value));
    });
}
