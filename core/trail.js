// core/trail.js
window.Trail = {
  createTrail(wrapper) {
    const ghost = wrapper.cloneNode(true);
    ghost.classList.add("trail");
    ghost.style.position = "fixed";
    ghost.style.left = wrapper.style.left;
    ghost.style.top = wrapper.style.top;
    ghost.style.opacity = 0.4;
    ghost.style.zIndex = (parseInt(wrapper.style.zIndex || "1000", 10) - 1).toString();
    document.body.appendChild(ghost);

    setTimeout(() => {
      ghost.style.opacity = 0;
      setTimeout(() => ghost.remove(), 800);
    }, 0);
  }
};
