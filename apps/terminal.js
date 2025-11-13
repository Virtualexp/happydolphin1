// apps/terminal.js
// ======================================
// 🖥️ Terminal Application (Deep Sea Protocol)
// ======================================

(function () {
  const LAST_Q_KEY = "terminal_last_question";
  const USED_Q_KEY = "terminal_used_questions";

  let questionSet = [];
  let usedQuestions = JSON.parse(localStorage.getItem(USED_Q_KEY) || "[]");

  // Soru dosyası
  fetch("/config/questions.json")
    .then(r => r.json())
    .then(data => {
      questionSet = data;
    })
    .catch(err => console.error("questions.json yüklenemedi:", err));

  function getUniqueQuestion() {
    if (!questionSet.length) return null;

    // Hepsi kullanıldıysa reset
    if (usedQuestions.length >= questionSet.length) {
      usedQuestions = [];
      localStorage.removeItem(USED_Q_KEY);
    }

    const available = questionSet.filter(q => !usedQuestions.includes(q.q));
    const chosen = available[Math.floor(Math.random() * available.length)];

    if (chosen) {
      usedQuestions.push(chosen.q);
      localStorage.setItem(USED_Q_KEY, JSON.stringify(usedQuestions));
    }
    return chosen || null;
  }

  function resolveAnswer(entry, cmd) {
    if (!entry) return null;

    const key = cmd === "yes" ? "yes" : "no";
    let ans = entry[key];
    if (!ans) return null;

    // İlk sorularda { neutral, curious, dark } objesi
    if (typeof ans === "object") {
      const moods = Object.keys(ans);
      const mood = moods[Math.floor(Math.random() * moods.length)];
      return ans[mood];
    }

    // Sonraki sorularda düz string
    return ans;
  }

  function openTerminal() {
    const win = WindowManager.createWindow({
      appName: "terminal",
      title: "Deep Sea Protocol - MS-DOS Shell",
      width: 360,
      contentURL: "/templates/terminal.html",
      onReady: initTerminal
    });

    return win;
  }

  function initTerminal(wrapper) {
    const output = wrapper.querySelector(".term-output");
    const input = wrapper.querySelector(".term-input");
    if (!output || !input) {
      console.error("Terminal template eksik: .term-output veya .term-input yok");
      return;
    }

    let currentEntry = null;

    function printLine(text) {
      const line = document.createElement("div");
      line.textContent = text;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }

    function loadNewQuestion(forceNew = false) {
      // Hafızadaki son soruyu dene
      if (!forceNew) {
        const savedQ = localStorage.getItem(LAST_Q_KEY);
        if (savedQ) {
          currentEntry = questionSet.find(q => q.q === savedQ) || null;
          if (currentEntry) {
            printLine(`> ${currentEntry.q}`);
            return;
          }
        }
      }

      currentEntry = getUniqueQuestion();
      if (!currentEntry) {
        printLine("> no more questions in the archive.");
        return;
      }

      localStorage.setItem(LAST_Q_KEY, currentEntry.q);
      printLine(`> ${currentEntry.q}`);
    }

    // İlk soruyu yükle
    loadNewQuestion(false);

    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const raw = input.value.trim();
        if (!raw) return;
        input.value = "";

        const cmd = raw.toLowerCase();

        if (!currentEntry && cmd !== "next") {
          printLine('> archive idle. type "next" to request a question.');
          return;
        }

        handleCommand(cmd);
      }
    });

    function handleCommand(cmd) {
      if (cmd === "yes" || cmd === "y" || cmd === "no" || cmd === "n") {
        const normalized = cmd.startsWith("y") ? "yes" : "no";
        const ans = resolveAnswer(currentEntry, normalized);

        if (ans) {
          printLine(`> [${normalized}]`);
          printLine(ans);
        } else {
          printLine("> response drifted into static.");
        }

        // Cevap verdikten sonra kısa bir bekleme ve yeni soru
        setTimeout(() => {
          printLine("");
          loadNewQuestion(true);
        }, 2000);
      } else if (cmd === "next") {
        printLine("> skipping current frequency...");
        loadNewQuestion(true);
      } else if (cmd === "clear") {
        output.innerHTML = "";
      } else if (cmd === "help" || cmd === "?") {
        printLine("> commands: yes / no / next / clear / help");
      } else {
        printLine(`> "${cmd}" is not recognized as a valid command.`);
      }

      if (currentEntry) {
        localStorage.setItem(LAST_Q_KEY, currentEntry.q);
      }
    }
  }

  window.TerminalApp = { open: openTerminal };
})();
