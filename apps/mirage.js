// apps/mirage.js
(function () {

  let active = false;
  let clickCount = 0;
  let lockLayer = null;

  function start() {
    if (active) return;
    active = true;
    clickCount = 0;

    createLock();
    document.body.classList.add("network-mirage");

    EventBus.emit("mirage:start");
  }

  function end() {
    if (!active) return;

    document.body.classList.remove("network-mirage");
    document.body.classList.add("network-mirage-end");

    if (lockLayer) lockLayer.remove();
    lockLayer = null;

    EventBus.emit("mirage:end");

    active = false;

    setTimeout(() => {
      document.body.classList.remove("network-mirage-end");
    }, 2000);
  }

  function createLock() {
    lockLayer = document.createElement("div");
    lockLayer.id = "mirage-lock";
    document.body.appendChild(lockLayer);

    lockLayer.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      clickCount++;

      // Her kilit tıklamasında glitch pencere oluştur
      createGlitchWindow();

      if (clickCount >= 5) {
        end();
      }
    });
  }

  function createGlitchWindow() {
    const box = document.createElement("div");
    box.className = "mirage-glitch-window";

    box.style.left = (Math.random() * 60 + 20) + "%";
    box.style.top = (Math.random() * 60 + 20) + "%";

    box.innerHTML = `<p>> reality desync detected</p>`;

    document.body.appendChild(box);

    setTimeout(() => box.remove(), 1500);
  }

  window.Mirage = { start, end };

})();
