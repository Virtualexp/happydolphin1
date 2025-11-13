// ================================================
// 🧬 About Me — OceanOS App (Modüler)
// ================================================

(function() {

    function openAbout() {

        const win = WindowManager.createWindow({
            appName: "about",
            title: "About Me",
            width: 360,
            contentURL: "/templates/about.html"
        });

        // İçerik yüklendikten sonra ekstra olay bağlamaya gerek yok.
        // Template içinde buton var, ona dokunacağız.
        setTimeout(() => init(win), 40);
    }

    function init(win) {
        const closeButton = win.querySelector(".about-close");
        if (closeButton) {
            closeButton.addEventListener("click", () => win.remove());
        }
    }

    // Global API
    window.AboutApp = { open: openAbout };

})();
