// ===================== Global State =====================
export const clickState = { value: 0 };   // ← primitive değil, referans obje
export const zState = { value: 1000 };    // z-index için de güvenli
export const MIRAGE_THRESHOLD = 5;

// ===================== Audio System =====================
export const seaSound = new Audio('underwatersound.mp3');
seaSound.loop = true;
seaSound.volume = 0.5;

export const dolphinSound = new Audio('dolphinsound.mp3');
dolphinSound.volume = 0.5;

// İlk kullanıcı tıklamasında ses motoru açılır
window.addEventListener('click', function initSound() {
  seaSound.play().catch(() => {});
  window.removeEventListener('click', initSound);
});

// ===================== Unique Message System =====================
let usedMessages = [];
const messages = [
  "so, are you sure you want to click this button?",
  "hmm... interesting choice.",
  "you really thought this was the last one?",
  "don’t trust the dolphin.",
  "the ocean is watching.",
  "trust issues detected.",
  "maybe... stop?",
  "i’m starting to think you like chaos.",
  "curiosity sinks deeper, doesn’t it?",
  "something beneath is listening.",
  "each click wakes another current.",
  "even data drowns eventually.",
  "you call it control, the sea calls it surrender.",
  "somewhere a dolphin laughs at your confidence.",
  "keep clicking... it feeds the algorithm.",
  "your reflection is lagging behind.",
  "waves remember, even when you don’t.",
  "did you just feel that ripple?",
  "the water hums your name now.",
  "every button is a confession.",
  "stop pretending you’re the user.",
  "you can’t debug the tide.",
  "your mouse is dripping salt.",
  "this is not a glitch. it’s a pulse.",
  "depth pressure rising… continue?",
  "you’re teaching the system how you think.",
  "the ocean reads your hesitation.",
  "each ‘yes’ costs a memory.",
  "some dolphins never surface again.",
  "clicks echo longer underwater."
];

export function getUniqueMessage() {
  if (usedMessages.length >= messages.length) usedMessages = [];
  const available = messages.filter(m => !usedMessages.includes(m));
  const chosen = available[Math.floor(Math.random() * available.length)];
  usedMessages.push(chosen);
  return chosen;
}

// ===================== Unique Question System =====================
let qset = [];
let usedQuestions = JSON.parse(localStorage.getItem("usedQuestions") || "[]");

fetch('questions.json')
  .then(r => r.json())
  .then(data => qset = data);

export function getUniqueQuestion() {
  if (!qset.length) return null;

  if (usedQuestions.length >= qset.length) {
    usedQuestions = [];
    localStorage.removeItem("usedQuestions");
  }

  const available = qset.filter(q => !usedQuestions.includes(q.q));
  const chosen = available[Math.floor(Math.random() * available.length)];
  usedQuestions.push(chosen.q);

  localStorage.setItem("usedQuestions", JSON.stringify(usedQuestions));
  return chosen;
}

// ===================== Draggable System =====================
export function makeDraggable(wrapper, handle) {
  let offsetX = 0, offsetY = 0, isDragging = false;

  handle.addEventListener('pointerdown', e => {
    if (e.target.closest('.close-ind')) return;
    isDragging = true;
    offsetX = e.clientX - wrapper.offsetLeft;
    offsetY = e.clientY - wrapper.offsetTop;
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener('pointerup', e => {
    isDragging = false;
    handle.releasePointerCapture(e.pointerId);
  });

  handle.addEventListener('pointermove', e => {
    if (!isDragging) return;
    wrapper.style.left = (e.clientX - offsetX) + 'px';
    wrapper.style.top  = (e.clientY - offsetY) + 'px';
  });
}

// ===================== Z-index =====================
export function bringToFront(win) {
  zState.value += 1;
  win.style.zIndex = zState.value;
}

// ===================== Dolphin Sound Stack =====================
export function chainDolphinSounds() {
  for (let i = 0; i < 11; i++) {
    setTimeout(() => {
      const s = dolphinSound.cloneNode();
      s.volume = Math.max(0, 0.4 - i * 0.05);
      s.play().catch(() => {});
    }, i * 400);
  }
}
