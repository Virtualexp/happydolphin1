import { SPRITES } from "./sprites.js";

export function createSprite(name) {
  const data = SPRITES[name];

  if (!data) {
    console.error(`Sprite bulunamadı: ${name}`);
    return null;
  }

  const elem = document.createElement("div");
  elem.classList.add("sprite");
  elem.style.width = `${data.frameWidth}px`;
  elem.style.height = `${data.frameHeight}px`;
  elem.style.background = `url(${data.url}) 0 0 no-repeat`;
  elem.style.backgroundSize = `${data.frameWidth * data.frames}px ${data.frameHeight}px`;
  elem.style.imageRendering = data.pixel ? "pixelated" : "auto";

  // Animasyon adı
  const animName = `${name}-anim`;
  elem.style.animation = `${animName} ${data.duration}ms steps(${data.frames}) infinite`;

  // Stylesheet bulma — kesin çalışır
  let sheet = [...document.styleSheets].find(s => !s.href);

  if (!sheet) {
    const styleTag = document.createElement("style");
    document.head.appendChild(styleTag);
    sheet = styleTag.sheet;
  }

  // Aynı keyframe'i tekrar ekleme
  const exists = [...sheet.cssRules].some(r => r.name === animName);
  if (!exists) {
    sheet.insertRule(`
      @keyframes ${animName} {
        100% { background-position: -${data.frameWidth * data.frames}px 0; }
      }
    `, sheet.cssRules.length);
  }

  return elem;
}
