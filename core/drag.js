// core/drag.js
window.Drag = {
  enable(wrapper, handle) {
    let offsetX = 0;
    let offsetY = 0;
    let active = false;
    let lastTrail = 0;

    handle.addEventListener("pointerdown", e => {
      // Çarpıya tıklıyorsa sürükleme başlama
      if (e.target.closest(".close-btn")) return;

      active = true;

      // Eğer merkezde translate ile duruyorsa, onu kaldır
      if (wrapper.style.transform) {
        const rect = wrapper.getBoundingClientRect();
        wrapper.style.left = rect.left + "px";
        wrapper.style.top = rect.top + "px";
        wrapper.style.transform = "";
      }

      offsetX = e.clientX - wrapper.offsetLeft;
      offsetY = e.clientY - wrapper.offsetTop;
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener("pointerup", e => {
      active = false;
      handle.releasePointerCapture(e.pointerId);
    });

    handle.addEventListener("pointermove", e => {
      if (!active) return;

      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      // Trail efekti (varsa)
      const now = Date.now();
      if (window.Trail && now - lastTrail > 30) {
        Trail.createTrail(wrapper);
        lastTrail = now;
      }

      wrapper.style.left = x + "px";
      wrapper.style.top = y + "px";
    });
  }
};
