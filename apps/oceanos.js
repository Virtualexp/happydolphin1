// =========================
// 🌊 OceanOS Application
// =========================

(function() {

    function createOceanOS() {

        // pencereyi aç
        const win = WindowManager.createWindow({
            appName: "oceanos",
            title: "OceanOS",
            width: 340,
            contentURL: "/templates/oceanos.html"
        });

        // içerik yüklenince event bağla
        setTimeout(() => {
            const yesButton = win.querySelector(".oceanos-yes");
            const icon = win.querySelector(".oceanos-icon");
            const messageBox = win.querySelector(".oceanos-message");

            // random mesaj üret
            const randomMsg = getOceanMessage();
            messageBox.textContent = randomMsg;

            // dolphin sesi
            AudioEngine.playDolphin();

            yesButton.addEventListener("click", () => {
                EventBus.emit("oceanos:clicked");

                // sayfa içindeki threshold mekanizması apps/mirage.js tarafında yönetilecek
                win.remove();
                createOceanOS();
            });
        // Mirage Motoru
        Mirage.start();

        }, 50);
    }

    // ============
    // mesaj motoru
    // ============
    let used = [];
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
        "somewhere a dolphin laughs at you.",
        "each click wakes another current.",
        "your reflection lags behind.",
        "waves remember you.",
        "the sea hums your name now."
    ];

    function getOceanMessage() {
        if (used.length >= messages.length) used = [];
        const available = messages.filter(m => !used.includes(m));
        const chosen = available[Math.floor(Math.random() * available.length)];
        used.push(chosen);
        return chosen;
    }

    // Menüden çağrılabilsin
    window.OceanOS = { open: createOceanOS };

})();
