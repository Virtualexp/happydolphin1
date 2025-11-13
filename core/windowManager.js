// core/windowManager.js
window.WindowManager = {
  z: 1000,

  /**
   * createWindow({
   *   appName: "terminal",
   *   title: "Deep Sea Protocol",
   *   width: 360,
   *   height: 240,      // opsiyonel
   *   contentURL: "/templates/terminal.html", // opsiyonel
   *   onReady: (wrapper) => {}                // opsiyonel
   * })
   */
  createWindow({ appName, title, width = 360, height, contentURL, onReady }) {
    // Eğer mevcutsa sadece öne getir
    const existing = document.querySelector(`.win98[data-app="${appName}"]`);
    if (existing) {
      existing.style.zIndex = ++this.z;
      return existing;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "win98";
    wrapper.dataset.app = appName;
    wrapper.style.position = "fixed";
    wrapper.style.left = "50%";
    wrapper.style.top = "50%";
    wrapper.style.transform = "translate(-50%, -50%)";
    wrapper.style.zIndex = ++this.z;

    const inner = document.createElement("div");
    inner.className = "window";
    inner.style.width = width + "px";
    if (height) {
      inner.style.minHeight = height + "px";
    }

    inner.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text">${title}</div>
        <div class="title-bar-controls">
          <button aria-label="Close" class="close-btn"></button>
        </div>
      </div>
      <div class="window-body os-body">
        <p style="margin:0;">loading...</p>
      </div>
    `;

    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    // Drag
    if (window.Drag) {
      Drag.enable(wrapper, wrapper.querySelector(".title-bar"));
    }

    // Kapatma
    wrapper.querySelector(".close-btn").addEventListener("click", () => wrapper.remove());

    // İçerik yükleme
    if (contentURL) {
      fetch(contentURL)
        .then(r => r.text())
        .then(html => {
          wrapper.querySelector(".os-body").innerHTML = html;
          if (typeof onReady === "function") {
            onReady(wrapper);
          }
        })
        .catch(err => {
          console.error("WindowManager content load error:", err);
          wrapper.querySelector(".os-body").innerHTML =
            `<p style="color:red;">failed to load ${contentURL}</p>`;
        });
    } else if (typeof onReady === "function") {
      // Template yoksa hemen hazır say
      onReady(wrapper);
    }

    return wrapper;
  }
};
