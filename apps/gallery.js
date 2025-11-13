// ======================================
// 📸 Gallery Explorer (OceanOS App)
// ======================================

(function() {

    function openGallery() {
        const win = WindowManager.createWindow({
            appName: "gallery",
            title: "Gallery Explorer",
            width: 560,
            contentURL: "/templates/gallery.html"
        });

        setTimeout(() => setupGallery(win), 50);
    }


    // ======================================
    // Setup
    // ======================================
    function setupGallery(win) {

        const content = win.querySelector("#galleryContent");

        fetch("/config/gallery.json")
            .then(r => r.json())
            .then(data => buildGalleryUI(win, data))
            .catch(err => {
                content.innerHTML = `<p style="color:red;">Failed to load gallery.json</p>`;
                console.error(err);
            });
    }


    // ======================================
    // Build UI with loaded data
    // ======================================
    function buildGalleryUI(win, galleryData) {

        const content = win.querySelector("#galleryContent");

        const seriesList = [...new Set(galleryData.map(item => item.series))];

        content.innerHTML = `
            <div style="display:flex; gap:12px;">
                
                <!-- Sol Seri Menü -->
                <div id="seriesMenu" style="display:flex; flex-direction:column; gap:8px; width:150px; max-height:300px; overflow-y:auto;">
                    ${seriesList.map((s, i) =>
                        `<button class="button series-btn" data-series="${s}" ${i === 0 ? 'style="background:#c0ffc0;"' : ''}>
                            ${s.toUpperCase()}
                        </button>`
                    ).join('')}
                </div>

                <!-- Sağ Viewer -->
                <div id="viewer" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff; border:inset 2px #eee; padding:6px;">
                    <div id="seriesTitle" style="margin-bottom:4px; font-weight:bold; color:black; font-size:14px;"></div>
                    <img id="galleryPreview" src="" style="max-width:100%; max-height:220px; image-rendering:pixelated; border:solid 1px #ccc; cursor: zoom-in;">
                    <div id="galleryInfo" style="margin-top:6px; text-align:center; color:black;">Loading...</div>

                    <section class="field-row" style="justify-content:space-between; width:100%; margin-top:10px;">
                        <button class="button" id="prevArrow" disabled>←</button>
                        <button class="button" id="nextArrow" disabled>→</button>
                    </section>
                </div>
            </div>
        `;

        // --- Selected Series ---
        let currentSeries = null;
        let currentIndex = 0;
        let currentImages = [];

        const preview = content.querySelector("#galleryPreview");
        const infoBox = content.querySelector("#galleryInfo");
        const nextArrow = content.querySelector("#nextArrow");
        const prevArrow = content.querySelector("#prevArrow");
        const titleBar = content.querySelector("#seriesTitle");
        const seriesButtons = content.querySelectorAll(".series-btn");


        // ======================================
        // Series Loader
        // ======================================
        function loadSeries(name) {

            currentSeries = name;
            currentImages = galleryData.filter(img => img.series === name);
            currentIndex = 0;

            seriesButtons.forEach(btn => btn.style.background = "");
            const activeBtn = [...seriesButtons].find(b => b.dataset.series === name);
            if (activeBtn) activeBtn.style.background = "#c0ffc0";

            nextArrow.disabled = false;
            prevArrow.disabled = false;

            updateImage();

            AudioEngine.playDolphin();
        }


        // ======================================
        // Change Image
        // ======================================
        function updateImage() {
            const imgData = currentImages[currentIndex];

            preview.src = imgData.file;
            infoBox.innerHTML = `<b>${imgData.title}</b><br><small>${imgData.desc}</small>`;
            titleBar.textContent = `${currentSeries.toUpperCase()} — [${currentIndex + 1} / ${currentImages.length}]`;

            preview.onclick = () => openPopup(imgData.file);
        }


        // ======================================
        // Controls
        // ======================================
        nextArrow.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % currentImages.length;
            updateImage();
        });

        prevArrow.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            updateImage();
        });

        seriesButtons.forEach(btn =>
            btn.addEventListener("click", () => loadSeries(btn.dataset.series))
        );

        // İlk seri otomatik yüklenir
        if (seriesList.length > 0) loadSeries(seriesList[0]);
    }


    // ======================================
    // Fullscreen Popup
    // ======================================
    function openPopup(src) {

        const existing = document.querySelector(".gallery-popup");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.className = "gallery-popup";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            cursor: zoom-out;
        `;

        const img = document.createElement("img");
        img.src = src;
        img.style.cssText = `
            max-width: 90vw;
            max-height: 85vh;
            border: 3px solid #fff;
            box-shadow: 0 0 20px rgba(255,255,255,0.3);
            image-rendering: pixelated;
        `;

        overlay.appendChild(img);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", () => overlay.remove());
        document.addEventListener("keydown", function esc(e) {
            if (e.key === "Escape") {
                overlay.remove();
                document.removeEventListener("keydown", esc);
            }
        });
    }


    // Public API
    window.GalleryApp = { open: openGallery };

})();
