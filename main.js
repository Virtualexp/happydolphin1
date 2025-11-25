// ===============================
//  MAIN BOOTSTRAP MODULE
// ===============================

// Pencere modülleri
import { createOceanOSWindow }   from "./oceanos.js";
import { createTerminalWindow }  from "./terminal.js";
import { createAboutMeWindow }   from "./about.js";
import { createGalleryWindow }   from "./gallery.js";
import { createMinesweeperWindow } from "./mines.js";
import { createAttractorWindow } from "./attractorWindow.js";

// Sprite Factory
import { createSprite } from "./spriteFactory.js";
import { SPRITES } from "./sprites.js";

// ===============================
//  Profil Sprite Sıralı Animasyon
// ===============================

window.addEventListener("DOMContentLoaded", () => {
    const profileArea = document.getElementById("profile-area");
    if (!profileArea) {
        console.warn("profile-area bulunamadı!");
        return;
    }

    // Sırayla oynatılacak sprite'lar
    const sequence = ["rolling2", "rolling2"];
    let index = 0;

    function playNext() {
        const name = sequence[index];

        // Eski sprite'ı temizle
        profileArea.innerHTML = "";

        // Yeni sprite oluştur
        const spr = createSprite(name);
        profileArea.appendChild(spr);

        // Bu sprite'ın süresi
        const duration = SPRITES[name].duration;

        // Sonraki sprite'a geç
        setTimeout(() => {
            index = (index + 1) % sequence.length;
            playNext();
        }, duration);
    }

    // Animasyonu başlat
    playNext();
});

// ===============================
//  Uygulama Başlatma
// ===============================

document.getElementById("aboutBtn").addEventListener("click", createAboutMeWindow);
document.getElementById("terminalBtn").addEventListener("click", createTerminalWindow);
document.getElementById("oceanosBtn").addEventListener("click", createOceanOSWindow);
document.getElementById("galleryBtn").addEventListener("click", createGalleryWindow);
document.getElementById("minesBtn").addEventListener("click", createMinesweeperWindow);
document.getElementById("attractorBtn").addEventListener("click", createAttractorWindow);

// Global close handling
document.addEventListener("click", (e) => {
  if (e.target.matches(".close-ind")) {
    const win = e.target.closest(".win98");
    if (win) win.remove();
  }
});
