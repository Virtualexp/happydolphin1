import { seaSound, bringToFront, makeDraggable } from "./core.js";

// Primitive olan boolean export edilemez — referanslı obje olarak tutuluyor.
export const mirageTriggered = { value: false };

const MIRAGE_NOTICE_KEY = "mirage_visited";

// ============================
// TYPEWRITER EFFECTS
// ============================
export async function typeLine(el, text, charDelay = 22) {
  for (let i = 0; i < text.length; i++) {
    el.textContent += text[i];
    await new Promise(r => setTimeout(r, charDelay));
  }
  el.textContent += "\n";
}

export async function typeBlock(el, lines, lineDelay = 350, charDelay = 22) {
  for (const line of lines) {
    await typeLine(el, line, charDelay);
    await new Promise(r => setTimeout(r, lineDelay));
  }
}

// ============================
// WINDOW CREATION
// ============================
function createCenteredTerminalWindow(title = "Network Mirage") {
  const wrapper = document.createElement("div");
  wrapper.className = "win98 mirage-window";
  wrapper.style.left = "50%";
  wrapper.style.top = "50%";
  wrapper.style.transform = "translate(-50%, -50%)";
  bringToFront(wrapper);

  wrapper.innerHTML = `
      <div class="window" style="width:360px;">
        <div class="title-bar">
          <div class="title-bar-text">${title}</div>
          <div class="title-bar-controls">
            <button aria-label="Close" class="close-ind"></button>
          </div>
        </div>
        <div class="window-body">
          <pre class="message-text"
               style="white-space: pre-wrap; min-height: 160px; margin:0;"></pre>

          <section class="field-row"
                   style="justify-content:end; margin-top: 12px;">
            <button class="button">OK</button>
          </section>
        </div>
      </div>
  `;

  document.body.appendChild(wrapper);

  // close
  const kill = () => wrapper.remove();
  wrapper.querySelector(".close-ind").addEventListener("click", kill);
  wrapper.querySelector(".button").addEventListener("click", kill);

  // draggable
  makeDraggable(wrapper, wrapper.querySelector('.title-bar'));

  return wrapper.querySelector(".message-text");
}

// ============================
// MAIN MIRAGE SEQUENCE
// ============================
export async function triggerNetworkMirage() {
  if (mirageTriggered.value) return;
  mirageTriggered.value = true;

  // ----------------------------
  // Kilit
  // ----------------------------
  const lock = document.createElement("div");
  lock.id = "mirage-lock";
  lock.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.2);
    backdrop-filter: blur(0.3px);
    pointer-events: all;
    z-index: 9999;
  `;
  document.body.appendChild(lock);

  // ----------------------------
  // Ses kısma
  // ----------------------------
  seaSound.volume = Math.max(0, seaSound.volume - 0.25);

  // ----------------------------
  // Arka plan efekti
  // ----------------------------
  document.body.classList.add("network-mirage");

  // ----------------------------
  // Terminal penceresi
  // ----------------------------
  const out = createCenteredTerminalWindow("Network Mirage");

  const t = new Date();
  const lastSeen = localStorage.getItem(MIRAGE_NOTICE_KEY);
  const lastSeenMsg =
    lastSeen
      ? `residual signal since ${new Date(+lastSeen).toLocaleString()}`
      : "no residuals found";

  // ----------------------------
  // Yavaş yazı blokları
  // ----------------------------
  const lines1 = [
    "> establishing subaquatic link...",
    "> scanning frequencies...",
    "> connecting to external nodes...",
    "",
    "> atlantic.node_002 .......... active",
    "> pacific.node_113 ........... unstable",
    "> arctic.node_042 ............ silent",
    "> mediterranean.node_089 ..... ping received",
    "> blacksea.node_local ........ listening",
    "",
    `> ${lastSeenMsg}`,
    `> timestamp: ${t.toLocaleString()}`
  ];

  const lines2 = [
    "",
    "> connection established with user: blacksea.node_local/you",
    "> mirage link complete.",
    "> wait… who connected first?",
    ""
  ];

  const lines3 = [
    "> transmission feedback detected.",
    "> you are being mirrored.",
    ""
  ];

  await typeBlock(out, lines1, 330, 18);
  await new Promise(r => setTimeout(r, 350));
  await typeBlock(out, lines2, 300, 18);
  await new Promise(r => setTimeout(r, 300));
  await typeBlock(out, lines3, 320, 18);

  // küçük "dalga" kapanış efekti
  setTimeout(() => {
    document.body.classList.add("end");
  }, 600);

  localStorage.setItem(MIRAGE_NOTICE_KEY, Date.now().toString());

  // kilidi kaldır
  setTimeout(() => {
    lock.remove();
  }, 800);
}

// ============================
// RESIDUAL NOTICE
// ============================
export function bootMirageNoticeIfNeeded() {
  if (!localStorage.getItem(MIRAGE_NOTICE_KEY)) return;

  const out = createCenteredTerminalWindow("Residual Signal");

  out.textContent = "> previous mirage detected.\n> residual signal active.";

  setTimeout(() => {
    document.body.classList.add("network-mirage");
    setTimeout(() => {
      document.body.classList.remove("network-mirage");
    }, 900);
  }, 250);
}
