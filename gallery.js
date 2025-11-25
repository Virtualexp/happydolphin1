import {
  dolphinSound,
  makeDraggable,
  bringToFront
} from "./core.js";

import { openImagePopup } from "./imagePopup.js";  
// küçük ama temiz bir separation: popup viewer ayrı bir modülde olacak

export function createGalleryWindow() {
  const existing = document.querySelector('.win98.gallery');
  if (existing) {
    bringToFront(existing);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'win98 gallery';
  wrapper.style.left = (window.innerWidth / 2 - 260) + 'px';
  wrapper.style.top = (window.innerHeight / 2 - 170) + 'px';
  bringToFront(wrapper);

  wrapper.innerHTML = `
    <div class="window" style="width:560px;">
      <div class="title-bar">
        <div class="title-bar-text">Gallery Explorer</div>
        <div class="title-bar-controls">
          <button aria-label="Close" class="close-ind"></button>
        </div>
      </div>

      <div class="window-body" id="galleryContent" style="min-height:340px;">
        <p style="text-align:center;">> loading gallery...</p>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // draggable
  makeDraggable(wrapper, wrapper.querySelector('.title-bar'));

  // close
  wrapper.querySelector('.close-ind').addEventListener('click', () => wrapper.remove());

  const content = wrapper.querySelector('#galleryContent');

  // ---------------------------
  // JSON yükleme
  // ---------------------------
  fetch('gallery.json')
    .then(r => r.json())
    .then(data => setupGalleryUI(data))
    .catch(err => {
      content.innerHTML = `<p style="color:red;">> failed to load gallery.json</p>`;
      console.error("gallery.json error:", err);
    });

  // ---------------------------
  // UI Build + Logic
  // ---------------------------
  function setupGalleryUI(galleryData) {
    const seriesList = [...new Set(galleryData.map(item => item.series))];

    content.innerHTML = `
      <div style="display:flex; gap:12px;">

        <!-- SOL TARAF: SERİ MENÜSÜ -->
        <div id="seriesMenu"
             style="display:flex; flex-direction:column; gap:8px;
             width:150px; max-height:300px; overflow-y:auto;">
          ${seriesList.map((s, i) => `
            <button class="button series-btn"
                    data-series="${s}"
                    ${i === 0 ? 'style="background:#c0ffc0;"' : ''}>
              ${s.toUpperCase()}
            </button>
          `).join('')}
        </div>

        <!-- ANA GÖRÜNTÜLEME ALANI -->
        <div id="viewer" style="
             flex:1; display:flex; flex-direction:column; align-items:center;
             justify-content:center; background:#fff; border:inset 2px #eee;
             padding:6px;">

          <div id="seriesTitle"
               style="margin-bottom:4px; font-weight:bold; color:black; font-size:14px;">
          </div>

          <img id="galleryPreview" src=""
               style="max-width:100%; max-height:220px;
               image-rendering:pixelated; border:solid 1px #ccc;
               cursor: zoom-in;">

          <div id="galleryInfo"
               style="margin-top:6px; text-align:center; color:black;">
            Loading...
          </div>

          <section class="field-row"
                   style="justify-content:space-between; width:100%; margin-top:10px;">
            <button class="button" id="prevArrow" disabled>←</button>
            <button class="button" id="nextArrow" disabled>→</button>
          </section>

        </div>
      </div>
    `;

    // UI Elemanları
    const seriesButtons = content.querySelectorAll('.series-btn');
    const preview = content.querySelector('#galleryPreview');
    const infoBox = content.querySelector('#galleryInfo');
    const titleBar = content.querySelector('#seriesTitle');
    const nextArrow = content.querySelector('#nextArrow');
    const prevArrow = content.querySelector('#prevArrow');

    let currentSeries = null;
    let currentIndex = 0;
    let currentImages = [];

    // ---------------------------
    // SERİ YÜKLEME FONKSİYONU
    // ---------------------------
    function loadSeries(seriesName) {
      currentSeries = seriesName;
      currentImages = galleryData.filter(img => img.series === currentSeries);
      currentIndex = 0;

      if (!currentImages.length) return;

      // aktif butonu vurgula
      seriesButtons.forEach(b => b.style.background = "");
      const activeBtn = [...seriesButtons]
        .find(b => b.dataset.series === currentSeries);
      if (activeBtn) activeBtn.style.background = "#c0ffc0";

      // butonlar aktif olsun
      nextArrow.disabled = false;
      prevArrow.disabled = false;

      dolphinSound.currentTime = 0;
      dolphinSound.play().catch(()=>{});

      updateImage();
    }

    // ---------------------------
    // GÖRSEL YENİLEME
    // ---------------------------
    function updateImage() {
      const imgData = currentImages[currentIndex];

      preview.src = imgData.file;
      infoBox.innerHTML = `<b>${imgData.title}</b><br><small>${imgData.desc}</small>`;
      titleBar.textContent =
        `${currentSeries.toUpperCase()} — [${currentIndex + 1} / ${currentImages.length}]`;

      preview.onclick = () => openImagePopup(imgData.file);
    }

    // ---------------------------
    // ARROW EVENTLERİ
    // ---------------------------
    nextArrow.addEventListener('click', () => {
      if (!currentImages.length) return;
      currentIndex = (currentIndex + 1) % currentImages.length;
      updateImage();
    });

    prevArrow.addEventListener('click', () => {
      if (!currentImages.length) return;
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      updateImage();
    });

    // ---------------------------
    // SERİ BUTONLARI CLICK
    // ---------------------------
    seriesButtons.forEach(btn => {
      btn.addEventListener('click', () => loadSeries(btn.dataset.series));
    });

    // otomatik ilk seri
    if (seriesList.length > 0) loadSeries(seriesList[0]);
  }
}



