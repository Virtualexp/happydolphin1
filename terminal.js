import {
  getUniqueQuestion,
  chainDolphinSounds,
  makeDraggable,
  bringToFront
} from "./core.js";

const LAST_Q_KEY = "last_terminal_question";

export function createTerminalWindow() {
  const existing = document.querySelector('.win98.terminal');
  if (existing) {
    bringToFront(existing);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'win98 terminal';
  wrapper.style.left = (window.innerWidth / 2 - 180) + 'px';
  wrapper.style.top = (window.innerHeight / 2 - 140) + 'px';
  bringToFront(wrapper);

  wrapper.innerHTML = `
    <div class="window" style="width:360px;">
      <div class="title-bar">
        <div class="title-bar-text">Deep Sea Protocol - MS-DOS Shell</div>
        <div class="title-bar-controls">
          <button aria-label="Close" class="close-ind"></button>
        </div>
      </div>

      <div class="window-body" style="padding:0;">

        <div class="terminal-screen"
             style="display:flex; flex-direction:column;
             background:radial-gradient(circle at 30% 20%, #001a14 0%, #000 90%);
             color:#00FF80; font-family:'VT323', monospace; font-size:20px;
             height:220px; border:inset 2px #7a7a7a;
             box-shadow:inset 0 0 12px rgba(0,255,128,0.15);">

          <div class="terminal-output"
               style="flex:1; padding:10px; overflow-y:auto;
               white-space:pre-line; text-shadow:0 0 4px rgba(0,255,128,0.4);">
            > access marine archive...
          </div>

          <div class="terminal-input"
               style="display:flex; align-items:center; border-top:1px solid #222;
               padding:6px 8px; background:linear-gradient(to bottom, #001, #000);
               box-shadow:inset 0 0 5px rgba(0,255,128,0.2);">

            <span style="color:#00FF80;">&gt;</span>

            <input type="text" class="cmd-input"
                   placeholder="type command..."
                   style="flex:1; background:transparent !important; border:none !important;
                   box-shadow:none !important; color:#00FF80 !important;
                   font-family:'VT323', monospace !important; font-size:20px !important;
                   outline:none !important; caret-color:#00FF80 !important; margin-left:6px;">
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  // Sürükleme
  makeDraggable(wrapper, wrapper.querySelector('.title-bar'));

  // Kapatma
  wrapper.querySelector('.close-ind')
    .addEventListener('click', () => wrapper.remove());

  // Terminal elemanları
  const input = wrapper.querySelector('.cmd-input');
  const output = wrapper.querySelector('.terminal-output');

  // Başlangıçta soru yükle
  loadQuestion(false);

  // Enter ile komut işleme
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim().toLowerCase();
      input.value = "";
      if (!cmd) return;
      runCommand(cmd);
    }
  });

  // ============================
  // Terminal Internal Functions
  // ============================

  function loadQuestion(forceNew) {
    const saved = localStorage.getItem(LAST_Q_KEY);

    // Kayıtlı soru varsa ve yenisi istenmiyorsa
    if (saved && !forceNew) {
      try {
        const qObj = JSON.parse(saved);
        if (qObj && qObj.q) {
          output.textContent = "> " + qObj.q;
          wrapper.dataset.currentQuestion = saved;
          return;
        }
      } catch (err) {
        console.warn("Stored terminal question parse error:", err);
      }
    }

    // Eğer soru seti henüz yüklenmemişse
    const newQ = getUniqueQuestion();
    if (!newQ) {
      output.textContent = "> loading questions...";
      setTimeout(() => loadQuestion(forceNew), 600);
      return;
    }

    output.textContent = "> " + newQ.q;
    wrapper.dataset.currentQuestion = JSON.stringify(newQ);

    localStorage.setItem(LAST_Q_KEY, JSON.stringify(newQ));
  }

  function runCommand(cmd) {
    const current = JSON.parse(wrapper.dataset.currentQuestion || "null");
    if (!current) {
      loadQuestion(true);
      return;
    }

    const line = document.createElement('div');
    line.style.whiteSpace = 'pre-line';

    if (cmd === "yes" || cmd === "no") {
      // Cevap
      line.textContent = current[cmd];
      output.appendChild(line);

      // Ses efekti
      chainDolphinSounds();

      // Yeni soru
      setTimeout(() => loadQuestion(true), 1500);

    } else if (cmd === "next") {
      loadQuestion(true);

    } else {
      line.textContent = `> "${cmd}" is not recognized as a valid command.`;
      output.appendChild(line);
    }

    // Kaydet
    localStorage.setItem(LAST_Q_KEY, wrapper.dataset.currentQuestion);

    // Scroll alta
    output.scrollTop = output.scrollHeight;
  }
}
