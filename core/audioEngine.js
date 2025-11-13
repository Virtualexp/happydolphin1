// ====================================
// 🔊 AUDIO ENGINE
// Dolphin Sounds + Sea Background
// ====================================

window.AudioEngine = {

    sea: new Audio("sopunds/underwatersound.mp3"),
    dolphin: new Audio("sounds/dolphinsound.mp3"),

    init() {
        this.sea.loop = true;
        this.sea.volume = 0.45;

        // Kullanıcı bir kere tıklayınca ses başlar (browser policy)
        window.addEventListener("click", () => {
            this.sea.play().catch(()=>{});
        }, { once: true });
    },

    playDolphin() {
        const s = this.dolphin.cloneNode();
        s.volume = 0.5;
        s.play().catch(()=>{});
    }
};

AudioEngine.init();
