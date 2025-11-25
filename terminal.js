// =======================================================
// KOKOLOGI ENGINE + TYPEWRITER EFFECT + CLEAN SCREEN
// + NEXT CONTROL + ANOTHER JOURNEY + SESSION COMPLETION
// =======================================================

import {
  chainDolphinSounds,
  makeDraggable,
  bringToFront
} from "./core.js";

let kokolojiData = null;
let kokolojiActive = false;    // false | true | "awaiting-final-next" | "awaiting-restart" | "awaiting-another-journey"
let scenario = null;
let step = 0;
let completedTests = [];       // sadece bu terminal penceresi boyunca geçerli
let isTyping = false;          // typewriter kilidi

// Soruları JSON'dan yükle
fetch("questions.json")
  .then(r => r.json())
  .then(d => kokolojiData = d);

// TYPEWRITER EFFECT
function typeLine(el, text, speed = 18) {
  isTyping = true;
  el.innerHTML = "";
  let i = 0;
  function tick() {
    el.innerHTML += text[i];
    i++;
    if (i < text.length) {
      setTimeout(tick, speed);
    } else {
      isTyping = false;
    }
  }
  if (text && text.length > 0) {
    tick();
  } else {
    isTyping = false;
  }
}

// TERMINAL CLEAR
function clearTerminal(output) {
  output.innerHTML = "";
}

// PRINT LINE WITH TYPEWRITER, BAŞINA "> " KOYAR
function show(output, text) {
  clearTerminal(output);
  typeLine(output, "> " + text);
}

// Bu oturumda henüz çözülmemiş testlerden birini seç
function pickNextScenario() {
  if (!kokolojiData || kokolojiData.length === 0) return null;
  const available = kokolojiData.filter(s => !completedTests.includes(s.id));
  if (available.length === 0) return null;
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

// TEST BAŞLAT
function startKokoloji(output) {
  scenario = pickNextScenario();

  if (!scenario) {
    clearTerminal(output);
    typeLine(output, "> all journeys completed.\n> returning to shell...");
    kokolojiActive = false;
    return;
  }

  kokolojiActive = true;
  step = 0;

  show(output, scenario.title);

  setTimeout(() => {
    show(output, scenario.steps[0].question);
  }, 700);
}

// YORUM ŞABLONU
function buildReply(templates, answer) {
  const tmpl = templates[Math.floor(Math.random() * templates.length)];
  return tmpl.replace("{{answer}}", answer);
}

// BİR SONRAKİ SORUYU GÖSTER
function nextStep(output) {
  if (!scenario || !scenario.steps) return;
  if (step < scenario.steps.length) {
    show(output, scenario.steps[step].question);
  }
}

// KULLANICI CEVABI İŞLE
function processKokolojiAnswer(answer, output) {

  if (!scenario || !scenario.steps || step >= scenario.steps.length) return;

  const s = scenario.steps[step];
  const reply = buildReply(s.templates, answer);

  show(output, reply);
  step++;

  // SON ADIM: TESTİ TAMAMLANDI OLARAK İŞARETLE
  if (step >= scenario.steps.length) {
    if (scenario && !completedTests.includes(scenario.id)) {
      completedTests.push(scenario.id);
    }
    kokolojiActive = "awaiting-final-next";
    return;
  }

  // Ara adımlarda "next" bekle
}

// =======================================================
// TERMINAL WINDOW CREATION
// =======================================================

export function createTerminalWindow() {

  // Her yeni terminal penceresinde state sıfırla (B3)
  kokolojiActive = false;
  scenario = null;
  step = 0;
  completedTests = [];

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
            > type 'start' to begin a journey.
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
  makeDraggable(wrapper, wrapper.querySelector('.title-bar'));

  wrapper.querySelector('.close-ind')
      .addEventListener('click', () => {
          kokolojiActive = false;
          scenario = null;
          step = 0;
          completedTests = [];
          wrapper.remove();
      });

  const input = wrapper.querySelector('.cmd-input');
  const output = wrapper.querySelector('.terminal-output');

  // MAIN COMMAND HANDLER
  function runCommand(cmd) {

    const lower = cmd.toLowerCase();

    // typewriter çalışırken komutları ignore et
    if (isTyping) {
      // İstersen burada hafif bir uyarı gösterebiliriz, ama yazı biterken çakışmasın diye sessizce yutmak daha güvenli.
      return;
    }

    // SON CEVAPTAN SONRA "next" → final ekran
    if (kokolojiActive === "awaiting-final-next" && lower === "next") {
      clearTerminal(output);
      typeLine(output,
        "> The desert is quiet now...\n> Would you walk it again? (yes / no)"
      );
      kokolojiActive = "awaiting-restart";
      return;
    }

    // FİNAL EKRAN YES/NO → another journey?
    if (kokolojiActive === "awaiting-restart") {

      if (lower === "yes") {
        clearTerminal(output);
        typeLine(output, "> another journey? (yes / no)");
        kokolojiActive = "awaiting-another-journey";
        return;
      }

      if (lower === "no") {
        clearTerminal(output);
        typeLine(output, "> returning to shell...");
        kokolojiActive = false;
        return;
      }

      typeLine(output, "> please answer yes or no.");
      return;
    }

    // "another journey?" ekranı
    if (kokolojiActive === "awaiting-another-journey") {

      if (lower === "yes") {
        clearTerminal(output);
        startKokoloji(output);   // burada pickNextScenario devrede
        return;
      }

      if (lower === "no") {
        clearTerminal(output);
        typeLine(output, "> returning to shell...");
        kokolojiActive = false;
        return;
      }

      typeLine(output, "> please answer yes or no.");
      return;
    }

    // TEST DEVAM EDERKEN "next" → yeni soru
    if (kokolojiActive === true && lower === "next") {
      clearTerminal(output);
      nextStep(output);
      return;
    }

    // TEST DEVAM EDERKEN "next" HARİCİ CEVAP → yorum üret
    if (kokolojiActive === true && lower !== "next") {
      processKokolojiAnswer(cmd, output);
      return;
    }

    // START KOMUTU
    if (lower === "start") {
      clearTerminal(output);
      startKokoloji(output);
      return;
    }

    // DİĞER HER ŞEY
    typeLine(output, `> "${cmd}" is not recognized.`);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (isTyping) return;        // yazı bitmeden komutu işleme
      const cmd = input.value.trim();
      input.value = "";
      if (!cmd) return;
      runCommand(cmd);
    }
  });
}
